import { Router } from "express";
import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemsByCategory,
  updateMenuItem,
  deleteMenuItem,
} from "../Controllers/menuItemController.js";
import { validateMenuItem } from "../middleware/ValidatorMiddleware.js";
import {
  authorizePermissions,
  authenticateUser,
} from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

// Public routes
router.get("/", getAllMenuItems);
router.get("/category/:category", getMenuItemsByCategory);

// Protected routes (admin only)
router.post(
  "/",
  authenticateUser,
  authorizePermissions("admin"),
  upload.single("image"),
  validateMenuItem,
  createMenuItem
);

router
  .route("/:id")
  .patch(
    authenticateUser,
    authorizePermissions("admin"),
    upload.single("image"),
    validateMenuItem,
    updateMenuItem
  )
  .delete(authenticateUser, authorizePermissions("admin"), deleteMenuItem);

export default router;
