import { Router } from "express";
import {
  createRentalItem,
  getAllRentalItems,
  getRentalItemById,
  updateRentalItem,
  deleteRentalItem,
} from "../Controllers/rentalItemController.js";
import { authorizePermissions, authenticateUser } from "../middleware/authMiddleware.js";
import { validateRentalItem } from "../middleware/ValidatorMiddleware.js";

const router = Router();

// Admin routes
router.post(
  "/",
  authenticateUser,
  authorizePermissions("admin"),
  validateRentalItem,
  createRentalItem
);

router.get("/", authenticateUser, authorizePermissions("admin"), getAllRentalItems);
router.get("/:id", authenticateUser, authorizePermissions("admin"), getRentalItemById);
router.patch(
  "/:id",
  authenticateUser,
  authorizePermissions("admin"),
  validateRentalItem,
  updateRentalItem
);
router.delete("/:id", authenticateUser, authorizePermissions("admin"), deleteRentalItem);

export default router;