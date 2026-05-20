import { Router } from "express";
import {
  createDecoration,
  getAllDecorations,
  getDecorationsByType,
  updateDecoration,
  deleteDecoration,
  addReview,
} from "../Controllers/eventDecorationController.js";
import {
  validateDecoration,
  validateDecorationReview,
} from "../middleware/ValidatorMiddleware.js";
import { authorizePermissions } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

// Public routes
router.get("/", getAllDecorations);
router.get("/type/:type", getDecorationsByType);

// Protected routes - Admin only
router.post(
  "/",

  authorizePermissions("admin"),
  upload.array("images", 5), // Allow up to 5 images
  validateDecoration,
  createDecoration
);

router.patch(
  "/:id",
  authorizePermissions("admin"),
  upload.array("images", 5),
  validateDecoration,
  updateDecoration
);

router.delete("/:id", authorizePermissions("admin"), deleteDecoration);

// Review routes - Any authenticated user
router.post(
  "/:id/reviews",
  upload.array("images", 3), // Allow up to 3 images for reviews
  validateDecorationReview,
  addReview
);

export default router;
