import { Router } from "express";
import {
  createVenue,
  getAllVenues,
  getVenuesByType,
  updateVenue,
  deleteVenue,
  addReview,
} from "../Controllers/eventVenueController.js";
import {
  validateVenue,
  validateReview,
} from "../middleware/ValidatorMiddleware.js";
import {
  authorizePermissions,
  authenticateUser,
} from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

// Public routes
router.get("/", getAllVenues);
router.get("/type/:type", getVenuesByType);

// Protected routes
router.post(
  "/",
  authenticateUser,
  authorizePermissions("admin"),
  upload.array("images", 5), // Allow up to 5 images
  validateVenue,
  createVenue
);

router.patch(
  "/:id",
  authenticateUser,
  authorizePermissions("admin"),
  upload.array("images", 5),
  validateVenue,
  updateVenue
);

router.delete(
  "/:id",
  authenticateUser,
  authorizePermissions("admin"),
  deleteVenue
);

// Review routes
router.post("/:id/reviews", validateReview, addReview);

export default router;
