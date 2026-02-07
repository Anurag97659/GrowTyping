import{ asyncHandler } from "../utils/asyncHandler.js";
import{ ApiError } from "../utils/ApiError.js";
import{ ApiResponse } from "../utils/ApiResponse.js";
import{ TypingStat } from "../models/typingStat.model.js";
import mongoose from "mongoose";


const getDateMatch =(range) =>{
    const now = new Date();
    let start, end;

    switch(range){
        case "today":
            start = new Date(now.setHours(0, 0, 0, 0));
            end = new Date();
            break;

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
            return{};
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
        correctChars,
        incorrectChars,
        weakKeys
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

    const stat = await TypingStat.create({
        user: userId,
        wpm,
        accuracy,
        duration,
        charactersTyped,
        testType,
        correctChars,
        incorrectChars,
        weakKeys
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

    const stats = await TypingStat.find({
        user: req.user?._id,
        ...dateMatch
    }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Typing history fetched"));
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

     
export{
    saveTypingStat,
    getDashboardStats,
    getAverageWpmByType,
    getDailyProgress,
    getTopWeakKeys,
    getTypingStreak,
    getTypingHistory,
    getAverageAccuracyByType
};
