import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { messages } from "./messages";
import { sendJsonReponse } from "./utils";

export class Game {
  private board: Chess;
  // private moves: string[];
  private startTime: Date;
  private moveCount: number;
  constructor(
    public player1: { socket: WebSocket; playerUniqueKey: string },
    public player2: { socket: WebSocket; playerUniqueKey: string }
  ) {
    this.board = new Chess();
    // this.moves = [];
    this.startTime = new Date();
    this.moveCount = 0;

    player1.socket.send(sendJsonReponse("INIT_GAME", { color: "white" }));
    player2.socket.send(sendJsonReponse("INIT_GAME", { color: "black" }));
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    // validate type of move using zod

    if (this.moveCount % 2 === 0 && socket !== this.player1.socket) {
      return socket.send(sendJsonReponse(messages.ERROR, "Invalid move"));
    }
    if (this.moveCount % 2 === 1 && socket !== this.player2.socket) {
      return socket.send(sendJsonReponse(messages.ERROR, "Invalid move"));
    }
    try {
      this.board.move({
        from: move.from,
        to: move.to,
      });

      // if (this.board.isGameOver()) {
      //   const gameOverMessage = this.formatMessageTypeAndPayload("GAME_OVER", {
      //     winner: this.board.isCheckmate() ? this.board.turn() : null,
      //   });
      //   this.player1.send(gameOverMessage);
      //   this.player2.send(gameOverMessage);
      //   return;
      // }
      this.player2.socket.send(sendJsonReponse(messages.MOVE, move));
      this.player1.socket.send(sendJsonReponse(messages.MOVE, move));
      this.moveCount++;
    } catch (error) {
      socket.send(sendJsonReponse(messages.ERROR, "Invalid Move"));
    }
  }

  get getBoard() {
    return this.board;
  }
}
