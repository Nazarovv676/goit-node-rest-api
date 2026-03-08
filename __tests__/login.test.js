import { jest, describe, it, expect, beforeEach } from "@jest/globals";

process.env.JWT_SECRET = "test_secret";

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: jest.fn().mockResolvedValue(true),
    hash: jest.fn().mockResolvedValue("hashedpassword"),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn().mockReturnValue("mocked_token"),
    verify: jest.fn(),
  },
}));

const mockUser = {
  id: 1,
  email: "test@example.com",
  password: "hashedpassword",
  subscription: "starter",
  token: null,
  verify: true,
};

jest.unstable_mockModule("../services/authServices.js", () => ({
  findUserByEmail: jest.fn().mockResolvedValue(mockUser),
  updateUserToken: jest.fn().mockResolvedValue([1]),
}));

const { login } = await import("../controllers/authControllers.js");

describe("login controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: { email: "test@example.com", password: "password123" },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should respond with status 200", async () => {
    await login(req, res, next);
    expect(next).not.toHaveBeenCalledWith(expect.objectContaining({ status: expect.any(Number) }));
    expect(res.json).toHaveBeenCalled();
  });

  it("should return a token", async () => {
    await login(req, res, next);
    const responseData = res.json.mock.calls[0][0];
    expect(typeof responseData.token).toBe("string");
  });

  it("should return a user object with email and subscription string fields", async () => {
    await login(req, res, next);
    const responseData = res.json.mock.calls[0][0];
    expect(typeof responseData.user.email).toBe("string");
    expect(typeof responseData.user.subscription).toBe("string");
  });
});
