import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  generateTokenAndSetCookie,
  generateVerificationCode,
} from "../../utils/utils.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";
import crypto from "crypto";

export const Signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name)
      throw new Error("All field are required!!");

    const user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist! Kindly login" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPass = await bcrypt.hash(password, salt);
    const verificationCode = generateVerificationCode();

    const newUser = User({
      email,
      password: hashedPass,
      name,
      verificationToken: verificationCode,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, //24 hours
    });

    await newUser.save();

    generateTokenAndSetCookie(res, newUser._id);

    sendVerificationEmail(newUser.email, verificationCode);

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user: {
        ...newUser._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("ERROR: " + error.message);
  }
};

export const Signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    const isPassValid = await bcrypt.compare(password, user.password);

    if (!isPassValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged In Successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("ERROR in LOGIN: ", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const Logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "EMail Verified Successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in Verify Email: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const forgetPassword = async () => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials or User Does not exist!!",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password Reset Link sent to your mail!",
    });
  } catch (error) {
    console.log("ERROR: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async () => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "Invalid or Expired Reset Token" });
    }

    const salt = await bcrypt.genSalt(10);

    const hasdedPass = await bcrypt.hash(password, salt);

    user.password = hasdedPass;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password Reset Succesfully" });
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkAuth = async () => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User Not Found!!" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
