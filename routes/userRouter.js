import { Router } from "express";
import {
  getApplicationStats,
  getCurrentUser,
  updateUser,
  getAllUsers,
  deleteUser,
  getUserById,
  adminUpdateUser,
  adminAddUser,
} from "../Controllers/userController.js";

import {
  validateUpdateUserInput,
  validateAdminUserUpdate,
  validateAdminAddUser,
} from "../middleware/ValidatorMiddleware.js";
import { authorizePermissions } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
const router = Router();

// Regular user routes
router.get("/current-user", getCurrentUser);
router.patch(
  "/update-user",
  upload.single("avatar"),
  validateUpdateUserInput,
  updateUser
);

// Admin only routes
router.get(
  "/admin/stats",
  [authorizePermissions("admin")],
  getApplicationStats
);
router.get("/admin/all-users", [authorizePermissions("admin")], getAllUsers);
router.get("/admin/user/:id", [authorizePermissions("admin")], getUserById);
router.delete("/admin/user/:id", [authorizePermissions("admin")], deleteUser);
router.patch(
  "/admin/update-user/:id",
  authorizePermissions("admin"),
  validateAdminUserUpdate,
  adminUpdateUser
);
router.post(
  "/admin/add-user",
  authorizePermissions("admin"),
  validateAdminAddUser,
  adminAddUser
);

export default router;
