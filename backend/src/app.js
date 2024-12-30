import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutePath from "./routes/user.route.js";

const app = express();

// CORS Configuration
app.use(
    cors({
      origin: "http://localhost:3000", // Adjust for production if needed
      credentials: true, // Allow cookies and credentials
      methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
      allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
    })
  );
  

// Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRoutePath);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// 404 Middleware
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource could not be found.",
  });
});
  
export { app };
