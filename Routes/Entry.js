import express from "express";
import { body, validationResult } from "express-validator";
import User from "../Models/Entrymodal.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();
router.post(
  "/signup",
  [
    body("name")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Your name should have at least 3 character "),
    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Your password should be 8 character long "),
    body("email").isEmail().withMessage("Enter a valid email"),
  ],
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(401).json({
          success: false,
          message: "Invalid form",
          data: result.array(),
        });
      }
      const { name, password, email } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(401).json({
          success: false,
          message: "User already exist",
        });
      }
      const salt  = await bcrypt.genSalt(10)
      const hashpass = await bcrypt.hash(password , salt)
      const newUser = await User.create({
        name,
        password : hashpass,
        email,
      });
      const data = {
        user : {
          id : newUser.id
        }
      }
      const  Token = await jwt.sign(data,process.env.JWT_SECRET)
      if (newUser) {
        return res.status(200).json({
          success: true,
          message: "User created successfully",
          authToken : Token
        });
      }

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Some error occured",
        data: error.message,
      });
    }
  },
);
router.post(
  "/signin",
  [
    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Your password should be 8 characters long"),

    body("email")
      .isEmail()
      .withMessage("Enter a valid email"),
  ],

  async (req, res) => {
    try {
     
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Invalid form",
          data: result.array(),
        });
      }

    
      const { password, email } = req.body;

      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

     
      const isMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Password doesn't match",
        });
      }

  
      const data = {
        user: {
          id: existingUser._id,
        },
      };

      const token = jwt.sign(
        data,
        process.env.JWT_SECRET
      );

     
      return res.status(200).json({
        success: true,
        message: "Login successful",
        authToken: token,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Something went wrong",
        data: error.message,
      });
    }
  }
);
export default router;