import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    saveTypingStat,
    getDashboardStats,
    getAverageWpmByType,
    getDailyProgress,
    getTopWeakKeys,
    getTypingStreak,
    getTypingHistory,
    getAverageAccuracyByType
} from "../controller/stats.controller.js";

const router = Router();


router.route("/save").post(verifyJWT, saveTypingStat);
router.route("/dashboard").get(verifyJWT, getDashboardStats);
router.route("/average-wpm").get(verifyJWT, getAverageWpmByType);
router.route("/daily-progress").get(verifyJWT, getDailyProgress);
router.route("/weak-keys").get(verifyJWT, getTopWeakKeys);
router.route("/streak").get(verifyJWT, getTypingStreak);
router.route("/history").get(verifyJWT, getTypingHistory);
router.route("/average-accuracy").get(verifyJWT, getAverageAccuracyByType);

export default router;
