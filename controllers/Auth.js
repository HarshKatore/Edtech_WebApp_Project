// const User = require("../models/User");
// const Profile = require("../models/Profile");
// const OTP = require("../models/OTP");
// const mailSender = require("../utils/mailSender");
// const {passwordUpdated} = require("../mail/templates/passwordUpdated");
// const otpGenerator = require("otp-generator");//this is a package instance like mongoose ,express etc so first inatsall by npm i ... ,then instance in file  
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();



// // send otp 
// exports.sendotp = async(req,res)=>{
//     try{
//             //fetch email
//     const {email} = req.body;
//     //check if already a user
//     const checkUserPresent = await User.findOne({email});

//     //if already exist , then return response
//     if(checkUserPresent){
//         return res.status(401).json({
//             success:false,
//             message:"User already registered"
//         });
//     }

//     //generate otpinstall package)
//     var otp =  otpGenerator.generate(6,{
//         upperCaseAlphabets:false,
//         lowerCaseAlphabets:false,
//         specialChars:false
//     });
//     console.log("OTP generated:", otp);
//     //chaek is unique or not (see in otp db the otp active at that time exists after expiry that particular get erase, check its repeating with current active otp )
//     const result = await OTP.findOne({otp:otp});

//     //if not unique repeat till not get uinique
//     while(result){
//         var otp =  otpGenerator.generate(6,{
//             upperCaseAlphabets:false,
//             lowerCaseAlphabets:false, 
//             specialChars:false
//         });
//         result = await OTP.findOne({otp:otp});
//     }

//     //entry in db
//     const otpBody = await OTP.create({email,otp});
//     console.log(otpBody);

//     // seccess response
//     return res.status(200).json({
//         success:true,
//         message:"OTP Sent Sucessfully",
//         otp
//     })

// }
//     catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:error.message
//         })
//     }

// };




// //sign up
// exports.signup = async (req, res) => {
//     try {
//         //fetch data
//       const { firstName, lastName, email, password,confirmPassword,accountType, contactNumber,otp } = req.body;
//         //validate(a/c-type switch button ahe so confirm midnarch,ph no not req)
//         if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
//             return res.status(403).json({
//                 success:false,
//                 message:"All fields are required"

//             });
//         }

//         //both pass same?
//         if(confirmPassword!== password){
//             return res.status(400).json({
//                 success:false,
//                 message:"Password and ConfirmPassword value doesnt matched, Please try again"

//             });
//         }


//         //check already user
//       const existingUser = await User.findOne({ email });

//       if (existingUser) {
//         return res.status(400).json({
//           success: false,
//           message: "User is already registered, please sign in to continue.",
//         });
//       }

//       //find most recent OTP *object* stored for this email(-1 means descending ,limit means only one)
//       const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
//       //getting array bcz find give all matching entry then we sort and return array with one entry so
//       console.log(recentOtp[0].otp); //its no
//       console.log(otp); //its string so != not !==

//         //validate otp 
//       if(recentOtp.length == 0){
//         return res.status(400).json({
//             success: false,
//             message: "OTP not found",
//           });
//       }
//       else if(otp != recentOtp[0].otp){ //otp is the one entered by user
//         return res.status(400).json({
//             success: false,
//             message: "Invalid OTP",
//           });
//       }
//       //hash password
//       const hashedPassword= await bcrypt.hash(password, 10);
      
//       //entry create in user db(user has refrence toprofiledetail so we have to ceeate null entry in profile model also to map profile id with user like foreng  key for fk there need a pk in other table)
//       const profileDetails = await Profile.create({  //imp concept
//         gender:null,
//         dateOfBirth:null,
//         about:null,
//         contactNumber:null
//       });

//       const user = await User.create({
//         firstName,
//         lastName,
//         email,
//         contactNumber,
//         password: hashedPassword,
//         accountType,
//         additionalDetails:profileDetails._id,
//         image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

//       });


//       return res.status(200).json({
//         success: true,
//         message: "User is registered successfully",
//         user
//       });

//     } catch (error) {
//       console.error("error");
//       return res.status(500).json({
//         success: false,
//         message: "User can not be registered. Please try again",
//       });
//     }
//   };






// //login
// exports.login = async (req,res) => {
//     try{
//         //fetch data
//       const {email,password} = req.body;
//       //validation
//       if(!email || !password){
//         return res.status(403).json({
//           success:false,
//           message:"All fields  are required, please try again"
//         });
//       }
//       //check user exists ?
//       let user = await User.findOne({email});
//       if(!user){
//         return res.status(401).json({
//           success:false,
//           message:"User is not registered, please signup first"
//         });
//       }


      

//       //user exists..now match pass from db and user  then generate JWT token
//     if(await bcrypt.compare(password, user.password)){

//         const payload = {
//             email:user.email,
//             id:user._id,
//             accountType:user.accountType,
//         };
//         //token is encoded , not same json as it is
//         let token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"2h"});
  
//         // token created now where to store  so we will use that instance user of enetity in db ,manupulate it and send 
//         //not changing actual entry in db

//         // user = user.toObject(); //make it editable object
//         user.token = token; //adding token field in user
//         user.password =undefined; //vanish password from instance user
  


//         //cookie creation
//         const options = {
//           expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),//3 days
//           httpOnly:true   //client side access only 
  
//         }
//         //sending in the form of cookie(name of coookie, data to pass, options like expiry,edit on server only etc)
//         res.cookie("token",token,options).status(200).json({
//           success:true,
//           token,
//           user,
//           message:"Logged in successfully "
//         });
//     }
//       else{
//         return res.status(403).json({
//           success:false,
//           message:"password is incorrect"
//         });
//       }
  
  
//     }
//     catch(error){
//       console.log(error);
//       return res.status(500).json({
//         success:false,
//         message:'Login failure, please try again'
//       })
//     }
//   };
   











// //change pass
// exports.changePassword = async (req, res) => {
// 	try {
// 		// Get user data from req.user
// 		const userDetails = await User.findById(req.user.id);

// 		// Get old password, new password, and confirm new password from req.body
// 		const { oldPassword, newPassword, confirmNewPassword } = req.body;

// 		// Validate old password
// 		const isPasswordMatch = await bcrypt.compare(
// 			oldPassword,
// 			userDetails.password
// 		);
// 		if (!isPasswordMatch) {
// 			// If old password does not match, return a 401 (Unauthorized) error
// 			return res
// 				.status(401)
// 				.json({ success: false, message: "The password is incorrect" });
// 		}

// 		// Match new password and confirm new password
// 		if (newPassword !== confirmNewPassword) {
// 			// If new password and confirm new password do not match, return a 400 (Bad Request) error
// 			return res.status(400).json({
// 				success: false,
// 				message: "The password and confirm password does not match",
// 			});
// 		}

// 		// Update password
// 		const encryptedPassword = await bcrypt.hash(newPassword, 10);
// 		const updatedUserDetails = await User.findByIdAndUpdate(
// 			req.user.id,
// 			{ password: encryptedPassword },
// 			{ new: true }
// 		);

// 		// Send notification email
// 		try {
// 			const emailResponse = await mailSender(
// 				updatedUserDetails.email,
// 				passwordUpdated(
// 					updatedUserDetails.email,
// 					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
// 				)
// 			);
// 			console.log("Email sent successfully:", emailResponse.response);
// 		} catch (error) {
// 			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
// 			console.error("Error occurred while sending email:", error);
// 			return res.status(500).json({
// 				success: false,
// 				message: "Error occurred while sending email",
// 				error: error.message,
// 			});
// 		}

// 		// Return success response
// 		return res
// 			.status(200)
// 			.json({ success: true, message: "Password updated successfully" });
// 	} catch (error) {
// 		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
// 		console.error("Error occurred while updating password:", error);
// 		return res.status(500).json({
// 			success: false,
// 			message: "Error occurred while updating password",
// 			error: error.message,
// 		});
// 	}
// };

const bcrypt = require("bcrypt");
const User = require("../models/User")
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdated")
const Profile = require("../models/Profile")
require("dotenv").config()

// Signup Controller for Registering USers

//sign up
exports.signup = async (req, res) => {
    try {
        //fetch data
      const { firstName, lastName, email, password,confirmPassword,accountType, contactNumber,otp } = req.body;
        //validate(a/c-type switch button ahe so confirm midnarch,ph no not req)
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required"

            });
        }

        //both pass same?
        if(confirmPassword!== password){
            return res.status(400).json({
                success:false,
                message:"Password and ConfirmPassword value doesnt matched, Please try again"

            });
        }


        //check already user
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User is already registered, please sign in to continue.",
        });
      }

      //find most recent OTP *object* stored for this email(-1 means descending ,limit means only one)
      const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
      //getting array bcz find give all matching entry then we sort and return array with one entry so
      console.log(recentOtp[0].otp); //its no
      console.log(otp); //its string so != not !==

        //validate otp 
      if(recentOtp.length == 0){
        return res.status(400).json({
            success: false,
            message: "OTP not found",
          });
      }
      else if(otp != recentOtp[0].otp){ //otp is the one entered by user
        return res.status(400).json({
            success: false,
            message: "Invalid OTP",
          });
      }
      //hash password
      const hashedPassword= await bcrypt.hash(password, 10);
      
      //entry create in user db(user has refrence toprofiledetail so we have to ceeate null entry in profile model also to map profile id with user like foreng  key for fk there need a pk in other table)
      const profileDetails = await Profile.create({  //imp concept
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null
      });

      const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

      });


      return res.status(200).json({
        success: true,
        message: "User is registered successfully",
        user
      });

    } catch (error) {
      console.error("error");
      return res.status(500).json({
        success: false,
        message: "User can not be registered. Please try again",
      });
    }
  };

// Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body

    // Check if email or password is missing
    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      })
    }

    // Find user with provided email
    const user = await User.findOne({ email }).populate("additionalDetails")

    // If user not found with provided email
    if (!user) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      })
    }

    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      )

      // Save token to user document in database
      user.token = token
      user.password = undefined
      // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      }
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      })
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      })
    }
  } catch (error) {
    console.error(error)
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    })
  }
}
// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body

    // Check if user is already present
    // Find user with provided email
    const checkUserPresent = await User.findOne({ email })
    // to be used in case of signup

    // If user found with provided email
    if (checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      })
    }

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    const result = await OTP.findOne({ otp: otp })
    console.log("Result is Generate OTP Func")
    console.log("OTP", otp)
    console.log("Result", result)
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      })
    }
    const otpPayload = { email, otp }
    const otpBody = await OTP.create(otpPayload)
    console.log("OTP Body", otpBody)
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}