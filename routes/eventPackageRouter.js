import { Router } from "express";
import {
  createEventPackage,
  getAllEventPackages,
  getEventPackagesByType,
  updateEventPackage,
  deleteEventPackage,
} from "../Controllers/eventPackageController.js";
import { validateEventPackage } from "../middleware/ValidatorMiddleware.js";
import { authorizePermissions } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

// Public routes
router.get("/", getAllEventPackages);
router.get("/type/:type", getEventPackagesByType);

// Protected routes (admin only)
router.post(
  "/",

  authorizePermissions("admin"),
  upload.single("image"),
  validateEventPackage,
  createEventPackage
);

router
  .route("/:id")
  .patch(
    authorizePermissions("admin"),
    upload.single("image"),
    validateEventPackage,
    updateEventPackage
  )
  .delete(authorizePermissions("admin"), deleteEventPackage);

export default router;
