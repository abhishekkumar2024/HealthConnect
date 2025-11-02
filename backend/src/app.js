import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutePath from "./routes/user.route.js";
import admin from "firebase-admin";
import { ApiErrors } from "./utilities/ApiError.js";

const app = express();

// CORS Configuration
app.use(
    cors({
        origin: process.env.ORIGIN_DB, // Adjust for production if needed
        credentials: true, // Allow cookies and credentials
        methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
        allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
    })
);

// Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
//   // Add your Firebase project configuration here
//   projectId: 'your-project-id'
// });

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRoutePath);

// Enhanced Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.message);

    // Check if it's an instance of ApiErrors
    if (err instanceof ApiErrors) {
        return res.status(err.statuscode).json({
            success: err.success,
            message: err.message,
            errors: err.Errors,
            data: err.data || null,
        });
    }

    // For unhandled errors, return a generic message
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// 404 Middleware
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: "The requested resource could not be found.",
    });
});

// Unhandled Rejection Handling
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
    // Optionally log and exit for critical issues
});

// Uncaught Exception Handling
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    // Gracefully shut down or restart the server
});

// Graceful Shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Closing server...");
    app.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});

export { app };
