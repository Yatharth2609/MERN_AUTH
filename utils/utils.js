import jwt from "jsonwebtoken";

export const generateVerificationCode = () => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    return code;
  } catch (error) {
    console.log("ERROR: " + error.message);
  }
};

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
