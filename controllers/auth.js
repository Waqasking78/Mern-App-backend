const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");
const { GenerateToken, verifyToken } = require("../utils/jwt");
const { GenerateHash, CompareHash } = require("../middlewares/bcrypt");

const Register = async function (req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
  } else {
    const existingUserEmail = await UserModel.findOne({ email });
    const existingUserUsername = await UserModel.findOne({ username });
    if (existingUserEmail) {
      res.status(400).json({ message: "Email already registered" });
    } else if (existingUserUsername) {
      res.status(400).json({ message: "Username not available" });

    } else {
      const hash = await GenerateHash(password);
      const newUser = await UserModel.create({ username, email, password: hash });
      const token = await GenerateToken(newUser);
      console.log("token", token);
      res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        })
        .json({ token, profileUser: newUser });
    }
  }
};

const Login = async function (req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(404).json({ message: "All fields are required" });
  } else {
    const existingUser = await UserModel.findOne({ email });
    const passwordIsCorrect = await CompareHash(password, existingUser.password);
    if (existingUser) {
      if (passwordIsCorrect) {
        console.log(existingUser)
        console.log(password, existingUser.password)
        const token = await GenerateToken(existingUser);
        res
          .cookie("token", token, {
            sameSite: "none",
            secure: true,
          })
          .json({ token, profileUser: existingUser });
      } else {
        res.status(400).json({ message: "Password is incorrect" });
      }
    } else {
      res.status(400).json({ message: "User not found. Please register" });
    }
  }
};



const profilePicUpload = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      console.log(req.file);
    } else {
      const user = req.user;
      const profileUser = await UserModel.findByIdAndUpdate(user.id, {profilePicture: req.file.filename});
      console.log("before", profileUser.profilePicture);
      await profileUser.save();
      console.log("AFter",profileUser.profilePicture);
      res.json({
        message: "File uploaded successfully",
        fileName: req.file.filename,
      });
    }
  } catch (error) {
    console.log(error)
  }
};

const Logout = async function (req, res) {
  res.clearCookie("token", {
    path: "/", // Important: should match the path used when the cookie was set
    sameSite: "none", // or "Strict" or "None" depending on how it was set
    secure: true, // if it was set with secure
  });
  res.status(200).json({ message: "Cookie deleted" });
}

module.exports = { Register, Login, profilePicUpload, Logout };
