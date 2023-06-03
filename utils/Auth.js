const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../models/User");

//Create a new User
const userRegister = async (userDetails, role, res) => {
  try {
    // Validate the username
    let usernameNotTaken = await validateUsername(userDetails.username);
    if (!usernameNotTaken) {
      return res.status(400).json({
        message: `Username is already taken.`,
        success: false,
      });
    }

    // validate the email
    let emailNotRegistered = await validateEmail(userDetails.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email is already registered.`,
        success: false,
      });
    }
    const password = await userDetails.password;

    // Validate the new password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 8 characters long",
      });
    } else {
      let password = await bcrypt.hash(userDetails.password, 12); //Hash of 12 round of salts
      // create a new user
      const newUser = new User({
        ...userDetails,
        user_status: "Active",
        password,
        role,
      });

      await newUser.save();
      return res.status(201).json({
        message: "User is saved successfully",
        success: true,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Unable to create your account.",
      success: false,
    });
  }
};

//Login user
const userLogin = async (userCreds, res) => {
  try {
    let { username, password } = userCreds;
    // First Check if the username is in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }
    const user_status = user.user_status;
    if (user_status === "Inactive") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    //Now check for the password
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // create JWT Token for the user
      let token = jwt.sign(
        {
          user_id: user._id,
          role: user.role,
          username: user.username,
          name: user.name,
          farm_Id: user?.farm_Id,
          slaughter_house_Id: user?.slaughter_house_Id,
        },
        "SUPER-SECRETKEY",
      );
      let result = {
        username: user.username,
        token,
      };
      return res.status(200).json({
        message: "Login Successfully",
        success: true,
        data: result,
      });
    } else {
      return res.status(401).json({
        //403 = Unauthorized
        message: "Invalid credentials",
        success: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again",
      error: error?.message,
    });
  }
};

// Reset Password
const resetUserPassword = async (req, res) => {
  const userId = req.body.userId;
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  try {
    // Find the user by ID in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Compare the current password with the hashed password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Incorrect Password",
        success: false,
      });
    }
    // Validate the new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 8 characters long",
      });
    }
    // Generate a new hashed password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err?.message,
      error: err,
    });
  }
};

const validateUsername = async (username) => {
  let user = await User.findOne({ username });
  return user ? false : true;
};

const validateEmail = async (email) => {
  let user = await User.findOne({ email });
  return user ? false : true;
};

//Passport middleware for proctecting
const userAuth = passport.authenticate("jwt", { session: false });

// Check role middleware
const checkRole = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    return next();
  }
  return res.status(401).json({
    message: "Unauthorized",
    success: false,
  });
};

module.exports = {
  userAuth,
  checkRole,
  userRegister,
  userLogin,
  resetUserPassword,
};
