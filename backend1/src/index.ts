import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { randomUUID } from "node:crypto";
import cookieParser from "cookie-parser";
import { GameManger } from "./GameManager";
import cors from "cors";

import * as dotenv from "dotenv";
dotenv.config();

// Create Express application
const app = express();

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction)
  app.use(
    cors({
      origin: "http://localhost:3000", // Your frontend's address
      credentials: true, // Allow cookies to be sent with requests
    })
  );

app.use(express.json());
// Configure cookie-session middleware

app.use(cookieParser());

// Example route to initialize a session

app.get("/", (req, res) => {
  let userId = req.cookies.userId;

  if (!userId) {
    userId = randomUUID(); // Generate a new userId

    res.cookie("userId", userId, {
      maxAge: 24 * 60 * 60 * 1000 * 24, // 24 days
      httpOnly: true, // Ensures the cookie is only accessible through HTTP(S), not by client-side scripts
      secure: isProduction, // Only send over HTTPS in production
      sameSite: isProduction ? "strict" : "lax", // Adjust SameSite for cross-origin in development
    });
  }

  res.json({ message: "User ID set successfully", userId });
});

// Endpoint to get the userId cookie data
// app.get("/get-user", (req, res) => {
//   const userId = req?.session?.userId;

//   if (!userId) {
//     return res.status(404).json({ message: "User ID not found" });
//   }

//   res.json({ userId });
// });

// Create HTTP server and pass it to both Express and WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const gameManager = new GameManger();

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
  const cookies = req.headers.cookie;
  const userId = cookies?.split("=")[1];

  if (userId) {
    gameManager.addUser(userId, ws);

    ws.on("disconnect", () => gameManager.removeUser(ws));

    // Handle user reconnection logic here (e.g., reassigning player roles)
  } else {
    console.log("user ID found");
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`${NODE_ENV} running on port ${PORT}`);
});

// Utility function to generate a unique ID

wss.on("connection", function connection(ws) {});
