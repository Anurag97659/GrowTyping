import{ asyncHandler } from "../utils/asyncHandler.js";
import{ ApiError } from "../utils/ApiError.js";
import{ ApiResponse } from "../utils/ApiResponse.js";
import{ TypingStat } from "../models/typingStat.model.js";
import mongoose from "mongoose";


const getDateMatch =(range) =>{
    const now = new Date();
    let start, end;

    switch (range) {
      case "today": {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        return { testDate: { $gte: start, $lte: end } };
      }

      case "lastDay":
        start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;

      case "lastWeek":
        start = new Date();
        start.setDate(start.getDate() - 7);
        end = new Date();
        break;

      case "lastMonth":
        start = new Date();
        start.setDate(start.getDate() - 30);
        end = new Date();
        break;

      case "last6Months":
        start = new Date();
        start.setMonth(start.getMonth() - 6);
        end = new Date();
        break;

      case "thisYear":
        start = new Date(new Date().getFullYear(), 0, 1);
        end = new Date();
        break;

      case "previousYears":
        start = null;
        end = new Date(new Date().getFullYear(), 0, 1);
        break;

      default:
        return {};
    }

    if(start && end) return{ testDate:{ $gte: start, $lte: end } };
    if(!start && end) return{ testDate:{ $lt: end } };

    return{};
};

const saveTypingStat = asyncHandler(async(req, res) =>{
    const userId = req.user?._id;
    console.log("REQ.USER =", req.user);
    const{
        wpm,
        accuracy,
        duration,
        charactersTyped,
        testType,
        testText,
        correctChars,
        incorrectChars,
        weakKeys,
        keyStats
    } = req.body;

    if(
        wpm == null ||
        accuracy == null ||
        duration == null ||
        charactersTyped == null ||
        !testType
    ){
        throw new ApiError(400, "All required fields must be provided");
    }
    const normalizeKey = (key) =>
        typeof key === "string" && /^[a-z]$/i.test(key) ? key.toLowerCase() : null;
    const toNonNegativeInteger = (value) =>
        Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;

    const normalizedWeakKeys = (Array.isArray(weakKeys) ? weakKeys : [])
        .map((keyStat) => ({
            key: normalizeKey(keyStat.key),
            mistakeCount: toNonNegativeInteger(
                keyStat.mistakeCount ?? keyStat.count ?? 1
            )
        }))
        .filter((keyStat) => keyStat.key && keyStat.mistakeCount > 0);

    const normalizedKeyStats = (Array.isArray(keyStats) ? keyStats : [])
        .map((keyStat) => ({
            key: normalizeKey(keyStat.key),
            attempts: toNonNegativeInteger(keyStat.attempts),
            mistakeCount: toNonNegativeInteger(keyStat.mistakeCount)
        }))
        .filter(
            (keyStat) =>
                keyStat.key &&
                keyStat.attempts > 0 &&
                keyStat.mistakeCount <= keyStat.attempts
        );

    const normalizedTestText =
        typeof testText === "string" ? testText.slice(0, 10000) : undefined;

    const stat = await TypingStat.create({
        user: userId,
        wpm,
        accuracy,
        duration,
        charactersTyped,
        testType,
        testText: normalizedTestText,
        correctChars,
        incorrectChars,
        weakKeys: normalizedWeakKeys,
        keyStats: normalizedKeyStats
    });
    console.log("Saved stat:", stat);
    return res.status(201).json(
        new ApiResponse(201, stat, "Typing stat saved successfully")
    );
});

const getDashboardStats = asyncHandler(async(req, res) =>{
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const dateMatch = getDateMatch(req.query.range);

    const stats = await TypingStat.aggregate([
      { $match:{ user: userId, ...dateMatch } },
      {
            $group:{
                _id: null,
                totalSessions:{ $sum: 1 },
                totalTime:{ $sum: "$duration" },
                avgWpm:{ $avg: "$wpm" },
                avgAccuracy:{ $avg: "$accuracy" }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            stats[0] ||{
                totalSessions: 0,
                totalTime: 0,
                avgWpm: 0,
                avgAccuracy: 0
            },
            "Dashboard stats fetched successfully"
        )
    );
});

const getAverageWpmByType = asyncHandler(async(req, res) =>{
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const dateMatch = getDateMatch(req.query.range);

    const stats = await TypingStat.aggregate([
      { $match:{ user: userId, ...dateMatch } },
      {
            $group:{
                _id: "$testType",
                averageWpm:{ $avg: "$wpm" }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Average WPM by test type fetched"));
});

const getDailyProgress = asyncHandler(async(req, res) =>{
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const dateMatch = getDateMatch(req.query.range);

    const progress = await TypingStat.aggregate([
      { $match:{ user: userId, ...dateMatch } },
      {
            $group:{
                _id:{
                    date:{
                        $dateToString:{ format: "%Y-%m-%d", date: "$testDate" }
                    }
                },
                avgWpm:{ $avg: "$wpm" },
                avgAccuracy:{ $avg: "$accuracy" },
                totalTime:{ $sum: "$duration" }
            }
        },
      { $sort:{ "_id.date": 1 } }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, progress, "Daily progress fetched"));
});

const getTopWeakKeys = asyncHandler(async(req, res) =>{
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const dateMatch = getDateMatch(req.query.range);

    const weakKeys = await TypingStat.aggregate([
      { $match:{ user: userId, ...dateMatch } },
      { $unwind: "$weakKeys" },
      {
            $group:{
                _id: "$weakKeys.key",
                totalMistakes:{ $sum: "$weakKeys.mistakeCount" }
            }
        },
      { $sort:{ totalMistakes: -1 } },
      { $limit: 5 }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, weakKeys, "Top weak keys fetched"));
});

const getKeyboardHeatmap = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const dateMatch = getDateMatch(req.query.range);

    const keyStats = await TypingStat.aggregate([
        { $match: { user: userId, ...dateMatch } },
        {
            $project: {
                keyStats: {
                    $cond: [
                        { $gt: [{ $size: { $ifNull: ["$keyStats", []] } }, 0] },
                        "$keyStats",
                        { $ifNull: ["$weakKeys", []] }
                    ]
                }
            }
        },
        { $unwind: "$keyStats" },
        {
            $project: {
                key: { $toLower: "$keyStats.key" },
                attempts: { $ifNull: ["$keyStats.attempts", 0] },
                mistakes: {
                    $ifNull: [
                        "$keyStats.mistakeCount",
                        { $ifNull: ["$keyStats.count", 1] }
                    ]
                }
            }
        },
        { $match: { key: { $regex: "^[a-z]$" } } },
        {
            $group: {
                _id: "$key",
                attempts: { $sum: "$attempts" },
                mistakes: { $sum: "$mistakes" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const heatmap = keyStats.map((keyStat) => ({
        key: keyStat._id,
        attempts: keyStat.attempts,
        mistakes: keyStat.mistakes,
        errorRate:
            keyStat.attempts > 0
                ? Number(((keyStat.mistakes / keyStat.attempts) * 100).toFixed(1))
                : null
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, heatmap, "Keyboard heatmap fetched"));
});

const getTypingStreak = asyncHandler(async(req, res) =>{
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    const dates = await TypingStat.aggregate([
      { $match:{ user: userId } },
      {
            $group:{
                _id:{
                    $dateToString:{ format: "%Y-%m-%d", date: "$testDate" }
                }
            }
        },
      { $sort:{ _id: -1 } }
    ]);

    let streak = 0;
    let currentDate = new Date();

    for(let d of dates){
        const statDate = new Date(d._id);
        const diff =
           (currentDate.setHours(0, 0, 0, 0) -
                statDate.setHours(0, 0, 0, 0)) /
           (1000 * 60 * 60 * 24);

        if(diff === 0 || diff === 1){
            streak++;
            currentDate = statDate;
        } else break;
    }

    return res
        .status(200)
        .json(new ApiResponse(200,{ streak }, "Typing streak fetched"));
});

const getTypingHistory = asyncHandler(async(req, res) =>{
    const dateMatch = getDateMatch(req.query.range);
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const query = {
        user: req.user?._id,
        ...dateMatch
    };

    const [stats, totalRecords, bestRecords] = await Promise.all([
        TypingStat.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        TypingStat.countDocuments(query),
        TypingStat.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$testType",
                    highestWpm: { $max: "$wpm" },
                    highestAccuracy: { $max: "$accuracy" },
                    longestDuration: { $max: "$duration" }
                }
            }
        ])
    ]);

    const bestRecordsByType = Object.fromEntries(
        bestRecords.map((record) => [
            record._id,
            {
                highestWpm: record.highestWpm,
                highestAccuracy: record.highestAccuracy,
                longestDuration: record.longestDuration
            }
        ])
    );

    return res
        .status(200)
        .json(new ApiResponse(200, {
            items: stats,
            bestRecords: bestRecordsByType,
            pagination: {
                page,
                limit,
                totalRecords,
                hasMore: page * limit < totalRecords
            }
        }, "Typing history fetched"));
});

const getAverageAccuracyByType = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const dateMatch = getDateMatch(req.query.range);

    const stats = await TypingStat.aggregate([
        { $match: { user: userId, ...dateMatch } },
        {
            $group: {
                _id: "$testType",
                averageAccuracy: { $avg: "$accuracy" }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Average accuracy by test type fetched"));
});

const getUserPublicStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);

    const stats = await TypingStat.aggregate([
        { $match: { user: userIdObj } },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                totalTime: { $sum: "$duration" },
                avgWpm: { $avg: "$wpm" },
                avgAccuracy: { $avg: "$accuracy" }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            stats[0] || {
                totalSessions: 0,
                totalTime: 0,
                avgWpm: 0,
                avgAccuracy: 0
            },
            "User public stats fetched successfully"
        )
    );
});

const getUserBestRecords = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);

    const allStats = await TypingStat.find({ user: userIdObj }).sort({ createdAt: -1 });

    const bestRecordByType = {};
    allStats.forEach((stat) => {
        if (!bestRecordByType[stat.testType]) {
            bestRecordByType[stat.testType] = {
                highestWpm: stat.wpm,
                highestAccuracy: stat.accuracy,
                longestDuration: stat.duration
            };
        } else {
            bestRecordByType[stat.testType].highestWpm = Math.max(
                bestRecordByType[stat.testType].highestWpm,
                stat.wpm
            );
            bestRecordByType[stat.testType].highestAccuracy = Math.max(
                bestRecordByType[stat.testType].highestAccuracy,
                stat.accuracy
            );
            bestRecordByType[stat.testType].longestDuration = Math.max(
                bestRecordByType[stat.testType].longestDuration,
                stat.duration
            );
        }
    });

    return res.status(200).json(
        new ApiResponse(200, bestRecordByType, "User best records fetched successfully")
    );
});

const getUserTypingStreak = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);

    const stats = await TypingStat.find({ user: userIdObj })
        .sort({ testDate: -1 })
        .select("testDate");

    if (stats.length === 0) {
        return res.status(200).json(new ApiResponse(200, { streak: 0 }, "User streak fetched"));
    }

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const stat of stats) {
        const statDate = new Date(stat.testDate);
        statDate.setHours(0, 0, 0, 0);

        if (currentDate.getTime() === statDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (currentDate.getTime() > statDate.getTime()) {
            break;
        }
    }

    return res.status(200).json(new ApiResponse(200, { streak }, "User streak fetched"));
});

     
export{
    saveTypingStat,
    getDashboardStats,
    getAverageWpmByType,
    getDailyProgress,
    getTopWeakKeys,
    getKeyboardHeatmap,
    getTypingStreak,
    getTypingHistory,
    getAverageAccuracyByType,
    getUserPublicStats,
    getUserBestRecords,
    getUserTypingStreak
};
