import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import * as authServices from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import {
  registerSchema,
  loginSchema,
  updateSubscriptionSchema,
} from "../schemas/authSchemas.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const avatarsDir = path.join(__dirname, "../public/avatars");

export const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;

    const existingUser = await authServices.findUserByEmail(email);
    if (existingUser) {
      throw HttpError(409, "Email in use");
    }

    const avatarURL = gravatar.url(email, { s: "250", d: "retro" }, true);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authServices.createUser({
      email,
      password: hashedPassword,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;

    const user = await authServices.findUserByEmail(email);
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw HttpError(401, "Email or password is wrong");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "23h",
    });
    await authServices.updateUserToken(user.id, token);

    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authServices.updateUserToken(req.user.id, null);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const current = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.json({ email, subscription });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { error } = updateSubscriptionSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const user = await authServices.updateUserSubscription(
      req.user.id,
      req.body.subscription
    );

    res.json({ email: user.email, subscription: user.subscription });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw HttpError(400, "No file uploaded");
    }

    const { id } = req.user;
    const { path: tempPath, originalname } = req.file;
    const ext = path.extname(originalname);
    const filename = `${id}${ext}`;
    const newPath = path.join(avatarsDir, filename);

    await fs.rename(tempPath, newPath);

    const avatarURL = `/avatars/${filename}`;
    await authServices.updateUserAvatar(id, avatarURL);

    res.json({ avatarURL });
  } catch (error) {
    next(error);
  }
};
