//flow of reset/forgot pass: sent frontend link on email which take on UI to set NEW PASS -> get new pass and changed in DB
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//reset password token(email sending)
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req body
    const email = req.body.email;
    //check user for email , email validation
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Your email is not registered with us",
      });
    }
    //generate token(just a number so as to differentiale link  bcz link cant be same to every user and its should be unique so that we ca  expire it )
    const token = crypto.randomUUID(); //initailly it was in seperate npm pack not its built in , so no inatall req.
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email },
      { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 },
      { new: true }
    ); //new means updated document is returned to variable in lhs
    //create url
    const url = `http://localhost:3000/update-password/${token}`;
    //send email
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link: ${url}`
    );
    //reponse ret
    return res.json({
      success: true,
      message:
        "Email sent successfully , please check email and change Password",
    });
  } catch (error) {
    console.log(error);
    return res.status.json({
      success: false,
      message: "Something went wrong while sending reset password email",
    });
  }
};

//reset pass(db pass update)
exports.resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body; //token is put in body by frointend from url
    //validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "password not matching",
      });
    }
    //get user details
    const userDetails = await User.findOne({ token }); //put token in url so that when that frontend page asks to enter pass and call api to reset then pass in req body that token taking from url ,,, put token in db entry before so that this sent token can be matched and fetch entry from db
    //if no entry for token - invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is invalid",
      });
    }
    //token time check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token is expired, please regenerate your token",
      });
    }
    //hash  pwd
    const hashedPassword = await bcrypt.hash(password, 10);

    //update pass
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    //return response
    return res.status(200).json({
      success: true,
      message: "Password reset sucessful",
    });
  } catch (error) {
    console.log(error);
    return req.status(500).json({
      success: false,
      message: "something went wrong while sending reset pwd mail",
    });
  }
};
