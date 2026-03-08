import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import * as authServices from "../services/authServices.js";

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer" || !token) {
    return next(HttpError(401, "Not authorized"));
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await authServices.findUserById(id);

    if (!user || user.token !== token) {
      return next(HttpError(401, "Not authorized"));
    }

    req.user = user;
    next();
  } catch {
    next(HttpError(401, "Not authorized"));
  }
};

export default authenticate;
