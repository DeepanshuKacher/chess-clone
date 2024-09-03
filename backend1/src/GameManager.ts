import { WebSocket } from "ws";
import { Game } from "./Game";
import { messages } from "./messages";
import { getData, moveData } from "./valibot";
import { randomUUID } from "node:crypto";
import { sendSocketMessage } from "./utils";

export class GameManger {
  private pendingUser: { websocket: WebSocket; uniqueKey: string } | null;
  // private users: { [uniqueKey: string]: WebSocket };
  private games: { [uniqueKey: string]: Game | null }; // development_comment make this private
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

  playerdisconnected(userId: string) {
    const gameUniqueKey = this.playerToGame[userId];

    // if both player has disconnected then

    if (gameUniqueKey) {
      const game = this.games[gameUniqueKey];

      if (game) {
        // Wait for 10 seconds before declaring the winner

        const winnerSocket =
          game.player1.playerUniqueKey === userId
            ? game.player2.socket
            : game.player1.socket;

        const disconnectedPlayer =
          game.player1.playerUniqueKey === userId ? 1 : 2;

        setTimeout(() => {
          const playerDetail =
            disconnectedPlayer === 1 ? game.player1 : game.player2;

          if (playerDetail.socket.readyState === WebSocket.CLOSED) {
            // console.log(first)

            // Check if the game is still ongoing

            delete this.games[gameUniqueKey];

            if (winnerSocket.readyState === WebSocket.OPEN) {
              // Declare the remaining player as the winner

              if (game.gameOver === false)
                game.endGame(`The opponent has left. You win!`);

              // also clear game data
            }
          }
        }, 10000); // 10-second delay
      }
    }
  }

  reconnect(userId: string, ws: WebSocket) {
    const gameUniqueKey = this.playerToGame[userId];

    if (gameUniqueKey) {
      const game = this.games[gameUniqueKey];

      if (game) {
        // console.log("this is reconnect");
        if (game.player1.playerUniqueKey === userId) {
          game.player1.socket = ws;
        } else if (game.player2.playerUniqueKey === userId) {
          game.player2.socket = ws;
        }
      }
    }
  }

  private addHandler(uniquePlayerKey: string, socket: WebSocket) {
    socket.on("message", (message) => {
      const data = getData(message);

      // console.log("get message");

      if (data?.type === messages.INIT_GAME) {
        // console.log("init game");
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
          return sendSocketMessage(socket, "ERROR", "No Move Payload");

        game.makeMove(socket, movePayload.move);
      }
    });
  }

  findGameIdWithPlayerId(uniquePlayerKey: string) {
    const gameUniqueKey = this.playerToGame[uniquePlayerKey];
    if (gameUniqueKey) {
      const game = this.games[gameUniqueKey];

      if (game) {
        return gameUniqueKey;
      } else {
        return null;
      }
    }
  }

  findGameWithPlayerId(uniquePlayerKey: string) {
    const gameUniqueKey = this.playerToGame[uniquePlayerKey];
    if (gameUniqueKey) {
      const game = this.games[gameUniqueKey];

      if (game) {
        return game;
      } else {
        return null;
      }
    }
  }

  get getGameObject() {
    return this.games;
  }
}
