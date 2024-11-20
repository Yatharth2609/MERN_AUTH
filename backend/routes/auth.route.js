import express from "express";
import {
  Signin,
  Signup,
  Logout,
  verifyEmail,
  forgetPassword,
  resetPassword,
  checkAuth,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/middleware.js";
const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth)

router.post("/signup", Signup);
router.post("/login", Signin);
router.post("/logout", Logout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgetPassword);

router.post("/reset-password/:token", resetPassword);

export default router;
