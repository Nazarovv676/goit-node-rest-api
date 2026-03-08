import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as authServices from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import {
  registerSchema,
  loginSchema,
  updateSubscriptionSchema,
} from "../schemas/authSchemas.js";

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

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authServices.createUser({ email, password: hashedPassword });

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
