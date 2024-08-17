import { WebSocket } from "ws";
import { Game } from "./Game";
import { messages } from "./messages";
import { getData, moveData } from "./valibot";
import { randomUUID } from "node:crypto";
import { sendSocketMessage } from "./utils";

export class GameManger {
  private pendingUser: { websocket: WebSocket; uniqueKey: string } | null;
  // private users: { [uniqueKey: string]: WebSocket };
  private games: { [uniqueKey: string]: Game | null };
  private playerToGame: { [playerUniqueKey: string]: string | null };

  constructor() {
    this.pendingUser = null;
    // this.users = {};
    this.games = {};
    this.playerToGame = {};
  }

  addUser(playerUniqueKey: string, socket: WebSocket) {
    // this.users.push(socket);
    this.addHandler(playerUniqueKey, socket);
  }

  removeUser(socket: WebSocket) {
    // this.users = this.users.filter((user) => user !== socket);
    //stop the game here because user left
  }

  private addHandler(uniquePlayerKey: string, socket: WebSocket) {
    const gameUniqueKey = this.playerToGame[uniquePlayerKey];

    if (gameUniqueKey) {
      console.log("user reconnected");
      const game = this.games[gameUniqueKey];

      if (game) {
        const gameState = game.getBoard;
        if (game.player1.playerUniqueKey === uniquePlayerKey) {
          game.player1.socket = socket;

          sendSocketMessage(socket, "RECONNECT", {
            board: gameState.board(),
            color: "white",
            fen: gameState.fen(),
          });
        } else if (game.player2.playerUniqueKey === uniquePlayerKey) {
          game.player2.socket = socket;

          sendSocketMessage(socket, "RECONNECT", {
            board: gameState.board(),
            color: "black",
            fen: gameState.fen(),
          });
        }
      } else {
        delete this.games[gameUniqueKey];
        delete this.playerToGame[uniquePlayerKey];
      }
    }

    socket.on("message", (message) => {
      const data = getData(message);

      if (data?.type === messages.INIT_GAME) {
        if (this.pendingUser) {
          const game = new Game(
            {
              playerUniqueKey: this.pendingUser.uniqueKey,
              socket: this.pendingUser.websocket,
            },
            {
              playerUniqueKey: uniquePlayerKey,
              socket: socket,
            }
          );

          const gameRandomUniqueKey = randomUUID();

          this.games[gameRandomUniqueKey] = game;

          this.playerToGame[uniquePlayerKey] = gameRandomUniqueKey;
          this.playerToGame[this.pendingUser.uniqueKey] = gameRandomUniqueKey;

          this.pendingUser = null;
        } else {
          this.pendingUser = { uniqueKey: uniquePlayerKey, websocket: socket };
        }
      } else if (data?.type === messages.MOVE) {
        // const game = this.games.find(
        //   (game) => game.player1 === socket || game.player2 === socket
        // );

        const gameUniqueKey = this.playerToGame[uniquePlayerKey];

        if (!gameUniqueKey)
          return sendSocketMessage(socket, "ERROR", "Could not find game");

        const game = this.games[gameUniqueKey];

        if (!game) return sendSocketMessage(socket, "ERROR", "No Game found");

        const movePayload = moveData(data?.payload);

        if (!movePayload)
          return sendSocketMessage(socket, "ERROR", "Invalid Move");

        game.makeMove(socket, movePayload.move);
      }
    });
  }
}
