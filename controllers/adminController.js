const userModel = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.createUser = async (req, res) => {
  // const hashedPassword = await bcrypt.hash(req.body.password, 10)
  // try {
  //     const registerUser = new userModel({
  //         firstName: req.body.firstName,
  //         lastName: req.body.lastName,
  //         email: req.body.email,
  //         password: hashedPassword,
  //         phone: req.body.phone,
  //         avatar: req.body.avatar
  //     })
  //     await registerUser.save()

  //     res.status(201).json({
  //         success: true,
  //         message: "User created successfully",
  //         registerUser
  //     })
  // } catch (error) {
  //     res.status(500).json({
  //         success: false,
  //         error
  //     })
  // }
  const { firstName, lastName, email, password, phone, avatar } = req.body;
  //   try {
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      msg: "Email already exists, please use another email",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await userModel.create({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: hashedPassword,
    phone: phone,
    avatar: avatar,
  });
  const token = jwt.sign(
    {
      email: result.email,
      id: result._id,
    },
    process.env.JWT_SECRET
  );
  res.status(201).json({
    success: true,
    result,
    token,
  });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       error,
  //     });
  //   }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  //   try {
  const existingUser = await userModel.findOne({ email });
  if (!existingUser) {
    return res.status(404).json({
      success: false,
      msg: "User not found, please register first",
    });
  }
  const matchedPassword = await bcrypt.compare(password, existingUser.password);
  if (!matchedPassword) {
    return res.status(409).json({
      success: false,
      msg: "Invalid credentials",
    });
  }
  const token = jwt.sign(
    {
      email: existingUser.email,
      password: existingUser.password,
      role: existingUser.role,
      id: existingUser._id,
    },
    process.env.JWT_SECRET
  );
  res.status(200).json({
    user: {
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      role: existingUser.role,
      token,
    },
  });
  // } catch (error) {}
};

const sendResetPasswordEmil = async (email, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Reset your password",
      html: `<p>Hello, <p>Please click on the following link to reset your password:</p>
                <a href=${resetLink}>${resetLink}</a>
            </p>`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Reset password link send to ${email}`);
  } catch (error) {
    console.log("Error sending reset password email");
  }
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }
    const resetToken = jwt.sign(
      {
        email: user.email,
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    (user.resetPasswordToken = resetToken),
      (user.resetPasswordTokenExpiry = Date.now() + 3600000);
    await user.save();

    await sendResetPasswordEmil(email, resetToken);
    res.status(200).json({
      msg: "password reset token send to your email",
    });
  } catch (error) {
    res.status(500).json({
      msg: "Internal server error",
      error,
    });
  }
};
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: {
        $gt: Date.now(),
      },
    });
    if (!user) {
      return res.status(400).json({
        msg: "Invalid Token or expired token",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();

    const resetEmail = user.email;
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: resetEmail,
      subject: "Reset your password",
      html: `<h1>Password reset successfully</h1><p>Password reset successfully, you can now login with new password</p>`,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    await transporter.sendMail(mailOptions);
    console.log("Reset Password token", token);
    res.status(200).json({
      msg: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg: "Internal server error",
      error,
    });
  }
};
// module.exports = createUser
