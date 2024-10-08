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
const developmentUrl = process.env.DEVELOPMENT_URL;
const productionUrl = process.env.PRODUCTION_URL;
const gameManager = new GameManger();

// if (!isProduction)

if (isProduction) {
  app.use(
    cors({
      origin: productionUrl, // Your frontend's address
      credentials: true, // Allow cookies to be sent with requests
    })
  );
} else {
  app.use(
    cors({
      origin: developmentUrl, // Your frontend's address
      credentials: true, // Allow cookies to be sent with requests
    })
  );
}

// if (isProduction) {
//   // const outDir = path.join(__dirname, "out");
//   app.use(express.static("out"));
// }

app.use(express.json());
// Configure cookie-session middleware

app.use(cookieParser());

app.use((req, res, next) => {
  // console.log(req.cookies);
  next();
});
// Example route to initialize a session

app.get("/getGameObject", (req, res) => {
  res.json(gameManager.getGameObject);
});

app.get("/", (req, res) => {
  let userId = req.cookies.userId;

  // console.log("hitting");

  if (!userId) {
    userId = randomUUID(); // Generate a new userId

    res.cookie("userId", userId, {
      maxAge: 24 * 60 * 60 * 1000 * 24, // 24 days
      httpOnly: true, // Ensures the cookie is only accessible through HTTP(S), not by client-side scripts
      secure: isProduction, // Only send over HTTPS in production
      sameSite: isProduction ? "strict" : "lax", // Adjust SameSite for cross-origin in development
    });
  }

  const gameId = gameManager.findGameIdWithPlayerId(userId);

  res.json({
    message: "User ID set successfully",
    userId,
    gameId,
  });
});

app.get("/gamedata", (req, res) => {
  const userId = req.cookies.userId;

  if (userId) {
    const gameInfo = gameManager.findGameWithPlayerId(userId);

    if (gameInfo) {
      const gameData = {
        board: gameInfo.getChess.board(),
        fen: gameInfo.getChess.fen(),
      };

      res.json({
        message: "User ID set successfully",
        userId,
        gameData,
        color: gameInfo.player1.playerUniqueKey === userId ? "white" : "black",
      });
    } else res.status(404).send("No game found");
  } else {
    res.status(404).send("No user Id");
  }
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

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
  const cookies = req.headers.cookie;
  const userId = cookies?.split("=")[1];

  if (userId) {
    gameManager.reconnect(userId, ws);
    gameManager.addUser(userId, ws);

    ws.on("close", () => gameManager.playerdisconnected(userId));
  } else {
    console.log("no userid found");
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`${NODE_ENV} running on port ${PORT}`);
});
