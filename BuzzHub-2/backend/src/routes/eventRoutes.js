import express from "express";
import { createEvent, getEvents, getEvent, joinEvent } from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createEvent);
router.get("/", getEvents);
router.get("/:id", getEvent);
router.put("/:id/join", protect, joinEvent);

export default router;
