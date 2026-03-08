import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import * as authServices from "../services/authServices.js";
import { sendVerificationEmail } from "../services/mailService.js";
import HttpError from "../helpers/HttpError.js";
import {
  registerSchema,
  loginSchema,
  updateSubscriptionSchema,
  resendVerificationSchema,
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
    const verificationToken = uuidv4();
    const user = await authServices.createUser({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    });

    await sendVerificationEmail(email, verificationToken);

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

    if (!user.verify) {
      throw HttpError(401, "Email not verified");
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

export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await authServices.findUserByVerificationToken(verificationToken);
    if (!user) {
      throw HttpError(404, "User not found");
    }

    await authServices.updateUserVerification(user.id);

    res.json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { error } = resendVerificationSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email } = req.body;

    const user = await authServices.findUserByEmail(email);
    if (!user) {
      throw HttpError(404, "User not found");
    }

    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }

    await sendVerificationEmail(email, user.verificationToken);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};
