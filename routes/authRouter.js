import { Router } from "express";
const router = Router();
import { login, logout, register } from "../Controllers/authController.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../middleware/ValidatorMiddleware.js";

router.post("/register", validateRegisterInput, register);
router.post("/login", validateLoginInput, login);
router.post("/logout", logout);

export default router;
