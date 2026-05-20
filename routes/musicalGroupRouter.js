import { Router } from "express";
import {
  createMusicalGroup,
  getAllMusicalGroups,
  getMusicalGroupById,
  updateMusicalGroup,
  deleteMusicalGroup,
} from "../Controllers/musicGroupController.js";
import { validateMusicalGroup } from "../middleware/ValidatorMiddleware.js"; // Assuming you have a validation middleware for the musical group
import { authorizePermissions, authenticateUser } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js"; // Middleware for image upload

const router = Router();

// Public routes
router.get("/", getAllMusicalGroups); 
router.get("/:id", getMusicalGroupById); 

// Protected routes
router.post(
  "/",
  authenticateUser,
  authorizePermissions("admin"),
  upload.single("image"),
  validateMusicalGroup,
  createMusicalGroup
);

router
  .route("/:id")
  .patch(
    authenticateUser,
    authorizePermissions("admin"),
    upload.single("image"),
    validateMusicalGroup,
    updateMusicalGroup
  )
  .delete(
    authenticateUser,
    authorizePermissions("admin"),
    deleteMusicalGroup
  );

export default router;
