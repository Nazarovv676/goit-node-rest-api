import express from "express";
import {
  register,
  login,
  logout,
  current,
  updateSubscription,
} from "../controllers/authControllers.js";
import authenticate from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/current", authenticate, current);
authRouter.patch("/subscription", authenticate, updateSubscription);

export default authRouter;
