import express from "express";
import {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getEventReviews,
  getMyReviews,
} from "../controllers/reviewController.js";
import { validateReview } from "../middleware/ValidatorMiddleware.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Specific routes first
router.get("/my-reviews", authenticateUser, getMyReviews);
router.get("/event/:eventId", getEventReviews);

// Generic routes after
router.post("/", authenticateUser, validateReview, createReview);
router.get("/", getAllReviews);
router.get("/:id", authenticateUser, getSingleReview);
router.patch("/:id", authenticateUser, validateReview, updateReview);
router.delete("/:id", authenticateUser, deleteReview);

export default router;
