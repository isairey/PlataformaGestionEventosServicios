import { Router } from "express";
import { addPhotographer, getAllPhotographers, deletePhotographer, updatePhotographer } from "../Controllers/photographerController.js";
import { validatePhotographerInput, validateUpdatePhotographerInput } from "../middleware/ValidatorMiddleware.js";
import { authorizePermissions, authenticateUser } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

// Public routes
router.get("/", getAllPhotographers);

// Protected routes
router.post(
  "/",
  authenticateUser,
  authorizePermissions("admin"),
  upload.single("image"),
  validatePhotographerInput,
  addPhotographer
);

router.delete("/:id",
  authenticateUser, 
  authorizePermissions("admin"), 
  deletePhotographer
);

router.patch("/:id", 
  authenticateUser,
  authorizePermissions("admin"),
  validateUpdatePhotographerInput,
  updatePhotographer
);





export default router;
