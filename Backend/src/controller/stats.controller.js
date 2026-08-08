import{ asyncHandler } from "../utils/asyncHandler.js";
import{ ApiError } from "../utils/ApiError.js";
import{ ApiResponse } from "../utils/ApiResponse.js";
import{ TypingStat } from "../models/typingStat.model.js";
import mongoose from "mongoose";
import { getCache, setCache, deleteCachePattern } from "../utils/redis.js";


const getDateMatch =(range) =>{
    let start, end;

    switch (range) {
      case "today": {
        start = new Date();
        start.setHours(0, 0, 0, 0);

        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
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

    if(start && end) {
      return {
        $or: [
          { testDate: { $gte: start, $lte: end } },
          { testDate: { $exists: false }, createdAt: { $gte: start, $lte: end } },
          { testDate: null, createdAt: { $gte: start, $lte: end } }
        ]
      };
    }
    if(!start && end) {
      return {
        $or: [
          { testDate: { $lt: end } },
          { testDate: { $exists: false }, createdAt: { $lt: end } },
          { testDate: null, createdAt: { $lt: end } }
        ]
      };
    }

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

    // Invalidate user stats cache and leaderboard cache in Redis
    await deleteCachePattern(`stats:*:${userId}*`);
    await deleteCachePattern("stats:leaderboard:*");

    console.log("Saved stat:", stat);
    return res.status(201).json(
        new ApiResponse(201, stat, "Typing stat saved successfully")
    );
});

const getDashboardStats = asyncHandler(async(req, res) =>{
    const range = req.query.range || "all";
    const cacheKey = `stats:dashboard:${req.user?._id}:${range}`;
    const cachedStats = await getCache(cacheKey);
    if (cachedStats) {
        return res.status(200).json(
            new ApiResponse(200, cachedStats, "Dashboard stats fetched successfully (from Redis cache)")
        );
    }

    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const dateMatch = getDateMatch(req.query.range);

    const [stats, rawModeStats] = await Promise.all([
      TypingStat.aggregate([
        { $match:{ user: userId, ...dateMatch } },
        {
              $group:{
                  _id: null,
                  totalSessions:{ $sum: 1 },
                  totalTime:{ $sum: "$duration" },
                  avgWpm:{ $avg: "$wpm" },
                  avgAccuracy:{ $avg: "$accuracy" },
                  highestWpm:{ $max: "$wpm" }
              }
          }
      ]),
      TypingStat.aggregate([
        { $match: { user: userId, ...dateMatch } },
        {
              $group: {
                  _id: "$testType",
                  avgWpm: { $avg: "$wpm" },
                  avgAccuracy: { $avg: "$accuracy" },
                  totalTests: { $sum: 1 },
                  highestWpm: { $max: "$wpm" },
                  highestAccuracy: { $max: "$accuracy" },
                  longestDuration: { $max: "$duration" }
              }
          }
      ])
    ]);

    const overview = stats[0] || {
        totalSessions: 0,
        totalTime: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        highestWpm: 0
    };

    const modeStatsMap = {};
    rawModeStats.forEach((m) => {
        if (m._id) {
            modeStatsMap[m._id] = {
                avgWpm: Math.round((m.avgWpm || 0) * 10) / 10,
                avgAccuracy: Math.round((m.avgAccuracy || 0) * 10) / 10,
                totalTests: m.totalTests || 0,
                highestWpm: Math.round(m.highestWpm || 0),
                highestAccuracy: Math.round(m.highestAccuracy || 0),
                longestDuration: m.longestDuration || 0
            };
        }
    });

    const result = {
        ...overview,
        modeStats: modeStatsMap
    };

    await setCache(cacheKey, result, 300); // 5 min TTL

    return res.status(200).json(
        new ApiResponse(200, result, "Dashboard stats fetched successfully")
    );
});

const getAverageWpmByType = asyncHandler(async(req, res) =>{
    const range = req.query.range || "all";
    const cacheKey = `stats:avgwpm:${req.user?._id}:${range}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
        return res.status(200).json(new ApiResponse(200, cachedData, "Average WPM fetched (from Redis cache)"));
    }

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

    await setCache(cacheKey, stats, 300);

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Average WPM by test type fetched"));
});

const getDailyProgress = asyncHandler(async(req, res) =>{
    const range = req.query.range || "all";
    const cacheKey = `stats:daily:${req.user?._id}:${range}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
        return res.status(200).json(new ApiResponse(200, cachedData, "Daily progress fetched (from Redis cache)"));
    }

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
                totalTime:{ $sum: "$duration" },
                count:{ $sum: 1 }
            }
        },
      { $sort:{ "_id.date": 1 } }
    ]);

    await setCache(cacheKey, progress, 300);

    return res
        .status(200)
        .json(new ApiResponse(200, progress, "Daily progress fetched"));
});

const getTopWeakKeys = asyncHandler(async(req, res) =>{
    const range = req.query.range || "all";
    const cacheKey = `stats:weakkeys:${req.user?._id}:${range}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
        return res.status(200).json(new ApiResponse(200, cachedData, "Top weak keys fetched (from Redis cache)"));
    }

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

    await setCache(cacheKey, weakKeys, 300);

    return res
        .status(200)
        .json(new ApiResponse(200, weakKeys, "Top weak keys fetched"));
});

const getKeyboardHeatmap = asyncHandler(async (req, res) => {
    const range = req.query.range || "all";
    const cacheKey = `stats:heatmap:${req.user?._id}:${range}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
        return res.status(200).json(new ApiResponse(200, cachedData, "Keyboard heatmap fetched (from Redis cache)"));
    }

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

    await setCache(cacheKey, heatmap, 300);

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
    const userIdObj = new mongoose.Types.ObjectId(req.user?._id);
    const dateMatch = getDateMatch(req.query.range);
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const query = {
        user: userIdObj,
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

const getUserPublicTelemetry = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "A valid user ID is required");
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const range = req.query.range || "allTime";
    const rangeMatch = { user: userIdObj, ...getDateMatch(range) };
    const allTimeMatch = { user: userIdObj };

    const [overview, allTimeRecords, rangeRecords, keyStats] = await Promise.all([
        TypingStat.aggregate([
            { $match: rangeMatch },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    totalTime: { $sum: "$duration" },
                    avgWpm: { $avg: "$wpm" },
                    avgAccuracy: { $avg: "$accuracy" },
                    highestWpm: { $max: "$wpm" }
                }
            }
        ]),
        TypingStat.aggregate([
            { $match: allTimeMatch },
            {
                $group: {
                    _id: "$testType",
                    highestWpm: { $max: "$wpm" },
                    highestAccuracy: { $max: "$accuracy" },
                    longestDuration: { $max: "$duration" }
                }
            }
        ]),
        TypingStat.aggregate([
            { $match: rangeMatch },
            {
                $group: {
                    _id: "$testType",
                    highestWpm: { $max: "$wpm" },
                    highestAccuracy: { $max: "$accuracy" },
                    totalTests: { $sum: 1 }
                }
            }
        ]),
        TypingStat.aggregate([
            { $match: rangeMatch },
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
        ])
    ]);

    const recordsByType = (records) => Object.fromEntries(
        records.map((record) => [
            record._id,
            Object.fromEntries(
                Object.entries(record).filter(([key]) => key !== "_id")
            )
        ])
    );

    const heatmap = keyStats.map((keyStat) => ({
        key: keyStat._id,
        attempts: keyStat.attempts,
        mistakes: keyStat.mistakes,
        errorRate: keyStat.attempts > 0
            ? Number(((keyStat.mistakes / keyStat.attempts) * 100).toFixed(1))
            : null
    }));

    return res.status(200).json(new ApiResponse(200, {
        overview: overview[0] || {
            totalSessions: 0,
            totalTime: 0,
            avgWpm: 0,
            avgAccuracy: 0,
            highestWpm: 0
        },
        allTimeBestRecords: recordsByType(allTimeRecords),
        rangeBestRecords: recordsByType(rangeRecords),
        heatmap
    }, "User public telemetry fetched successfully"));
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

const getLeaderboard = asyncHandler(async (req, res) => {
    const { range = "all", testType = "all" } = req.query;
    const cacheKey = `stats:leaderboard:${range}:${testType}`;
    const cachedLeaderboard = await getCache(cacheKey);
    if (cachedLeaderboard) {
        return res.status(200).json(
            new ApiResponse(200, cachedLeaderboard, "Leaderboard fetched successfully (from Redis cache)")
        );
    }

    const dateMatch = getDateMatch(range);

    const matchQuery = { ...dateMatch };
    if (testType && testType !== "all") {
        matchQuery.testType = testType;
    }

    const leaderboard = await TypingStat.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: "$user",
                highestWpm: { $max: "$wpm" },
                avgWpm: { $avg: "$wpm" },
                avgAccuracy: { $avg: "$accuracy" },
                totalTests: { $sum: 1 }
            }
        },
        { $sort: { highestWpm: -1, avgAccuracy: -1 } },
        { $limit: 100 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userDoc"
            }
        },
        { $unwind: "$userDoc" },
        {
            $project: {
                _id: 1,
                username: "$userDoc.username",
                fullname: "$userDoc.fullname",
                highestWpm: 1,
                avgWpm: 1,
                avgAccuracy: 1,
                totalTests: 1
            }
        }
    ]);

    await setCache(cacheKey, leaderboard, 120); // 2 minutes TTL

    return res.status(200).json(
        new ApiResponse(200, leaderboard, "Leaderboard fetched successfully")
    );
});


const getHistoryHeatmap = asyncHandler(async (req, res) => {
    const targetUserId = req.query.userId || req.params.userId || req.user?._id;
    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    const userId = new mongoose.Types.ObjectId(targetUserId);
    const yearParam = req.query.year;

    let start, end;
    if (!yearParam || yearParam === "lastYear") {
       
        end = new Date();
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
    } else {
        const yr = parseInt(yearParam, 10);
        if (isNaN(yr)) {
            return res.status(400).json({ message: "Invalid year parameter" });
        }
        start = new Date(yr, 0, 1, 0, 0, 0, 0);
        end = new Date(yr, 11, 31, 23, 59, 59, 999);
    }

    const cacheKey = `stats:historyheatmap:${userId}:${yearParam || "lastYear"}`;
    const cached = await getCache(cacheKey);
    if (cached) {
        return res.status(200).json(new ApiResponse(200, cached, "History heatmap (cached)"));
    }

    const data = await TypingStat.aggregate([
        {
            $match: {
                user: userId,
                $or: [
                    { testDate: { $gte: start, $lte: end } },
                    { testDate: { $exists: false }, createdAt: { $gte: start, $lte: end } },
                    { testDate: null, createdAt: { $gte: start, $lte: end } }
                ]
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$testDate", "$createdAt"] } } },
                count: { $sum: 1 },
                avgWpm: { $avg: "$wpm" },
                avgAccuracy: { $avg: "$accuracy" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const result = data.map((d) => ({
        date: d._id,
        count: d.count,
        avgWpm: Math.round(d.avgWpm || 0),
        avgAccuracy: Number((d.avgAccuracy || 0).toFixed(1))
    }));

    await setCache(cacheKey, result, 180);

    return res.status(200).json(new ApiResponse(200, result, "History heatmap fetched"));
});

export {
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
    getUserPublicTelemetry,
    getUserBestRecords,
    getUserTypingStreak,
    getLeaderboard,
    getHistoryHeatmap
};
