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

    // console.log("user is fucked-off");
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
}
