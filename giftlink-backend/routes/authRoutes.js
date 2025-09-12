const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const connectToDatabase = require("../models/db");
const logger = require("../logger");
require("dotenv").config();

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// User registration endpoint
router.post(
  "/register",
  [
    // Validation middleware
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error("Validation errors in registration:", errors.array());
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { firstName, lastName, email, password } = req.body;

      // Connect to database
      const db = await connectToDatabase();
      const collection = db.collection("users");

      // Check if user already exists
      const existingUser = await collection.findOne({
        email: email.toLowerCase(),
      });
      if (existingUser) {
        logger.warn(`Registration attempt with existing email: ${email}`);
        return res.status(400).json({
          error: "User with this email already exists",
        });
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcryptjs.hash(password, saltRounds);

      // Create user object
      const newUser = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert user into database
      const result = await collection.insertOne(newUser);

      if (!result.acknowledged) {
        logger.error("Failed to insert user into database");
        return res.status(500).json({
          error: "Failed to create user account",
        });
      }

      // Create JWT token
      const payload = {
        userId: result.insertedId,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "24h",
      });

      logger.info(`User registered successfully: ${email}`);

      // Return success response (don't send password)
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: result.insertedId,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
        token: token,
      });
    } catch (error) {
      logger.error("Error in user registration:", error);
      res.status(500).json({
        error: "Internal server error during registration",
      });
    }
  }
);

// User login endpoint
router.post(
  "/login",
  [
    // Validation middleware
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error("Validation errors in login:", errors.array());
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Connect to giftsdb in MongoDB through connectToDatabase
      const db = await connectToDatabase();

      // Access MongoDB users collection
      const collection = db.collection("users");

      // Check for user credentials in database
      const user = await collection.findOne({
        email: email.toLowerCase().trim(),
      });

      // Send appropriate message if user not found
      if (!user) {
        logger.warn(`Login attempt with non-existent email: ${email}`);
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // Check if the user entered password matches the stored encrypted password
      const isPasswordValid = await bcryptjs.compare(password, user.password);

      // Send appropriate message on password mismatch
      if (!isPasswordValid) {
        logger.warn(`Login attempt with invalid password for email: ${email}`);
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // Create JWT authentication if passwords match with user._id as payload
      const payload = {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "24h",
      });

      logger.info(`User logged in successfully: ${email}`);

      // Fetch user details from database and send response (don't send password)
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          createdAt: user.createdAt,
        },
        token: token,
      });
    } catch (error) {
      logger.error("Error in user login:", error);
      res.status(500).json({
        error: "Internal server error during login",
      });
    }
  }
);

module.exports = router;
