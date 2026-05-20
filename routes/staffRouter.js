import { Router } from "express";
import {
    createStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    deleteStaff,
} from "../Controllers/staffController.js";
import { authorizePermissions, authenticateUser } from "../middleware/authMiddleware.js";
import { validateStaff } from "../middleware/ValidatorMiddleware.js";

const router = Router();

// protected routes
router.post(
  "/",
  authenticateUser,
  authorizePermissions("admin"),
  validateStaff,
  createStaff
);

router.get("/", authenticateUser, authorizePermissions("admin"), getAllStaff);
router.get("/:id", authenticateUser, authorizePermissions("admin"), getStaffById);
router.patch("/:id", authenticateUser, authorizePermissions("admin"), updateStaff);
router.delete("/:id", authenticateUser, authorizePermissions("admin"), deleteStaff);


export default router;
