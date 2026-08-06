import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
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
} from "../controller/stats.controller.js";

const router = Router();


router.route("/save").post(verifyJWT, saveTypingStat);
router.route("/dashboard").get(verifyJWT, getDashboardStats);
router.route("/average-wpm").get(verifyJWT, getAverageWpmByType);
router.route("/daily-progress").get(verifyJWT, getDailyProgress);
router.route("/weak-keys").get(verifyJWT, getTopWeakKeys);
router.route("/keyboard-heatmap").get(verifyJWT, getKeyboardHeatmap);
router.route("/streak").get(verifyJWT, getTypingStreak);
router.route("/history").get(verifyJWT, getTypingHistory);
router.route("/average-accuracy").get(verifyJWT, getAverageAccuracyByType);
router.route("/leaderboard").get(getLeaderboard);
router.route("/history-heatmap").get(verifyJWT, getHistoryHeatmap);

router.route("/public-telemetry/:userId").get(getUserPublicTelemetry);
router.route("/public-history-heatmap/:userId").get(getHistoryHeatmap);
router.route("/public/:userId").get(getUserPublicStats);
router.route("/public-best/:userId").get(getUserBestRecords);
router.route("/public-streak/:userId").get(getUserTypingStreak);

export default router;
