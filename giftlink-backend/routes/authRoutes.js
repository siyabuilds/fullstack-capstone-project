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

module.exports = router;
