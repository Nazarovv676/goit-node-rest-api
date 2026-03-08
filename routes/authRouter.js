import express from "express";
import {
  register,
  login,
  logout,
  current,
  updateSubscription,
  updateAvatar,
  verifyEmail,
  resendVerification,
} from "../controllers/authControllers.js";
import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/verify/:verificationToken", verifyEmail);
authRouter.post("/verify", resendVerification);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/current", authenticate, current);
authRouter.patch("/subscription", authenticate, updateSubscription);
authRouter.patch("/avatars", authenticate, upload.single("avatar"), updateAvatar);

export default authRouter;
