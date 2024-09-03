import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { messages } from "./messages";
import { sendJsonReponse } from "./utils";

export class Game {
  private chess: Chess;
  // private moves: string[];
  private moveCount: number;
  public gameOver: boolean = false;
  constructor(
    public player1: { socket: WebSocket; playerUniqueKey: string },
    public player2: { socket: WebSocket; playerUniqueKey: string }
  ) {
    this.chess = new Chess();
    // this.moves = [];
    this.moveCount = 0;

    player1.socket.send(sendJsonReponse("INIT_GAME", { color: "white" }));
    player2.socket.send(sendJsonReponse("INIT_GAME", { color: "black" }));
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    if (this.gameOver) {
      return socket.send(
        sendJsonReponse(
          messages.ERROR,
          "The game is over, no more moves allowed."
        )
      );
    }

    if (this.moveCount % 2 === 0 && socket !== this.player1.socket) {
      return socket.send(
        sendJsonReponse(messages.ERROR, "This is white player move")
      );
    }
    if (this.moveCount % 2 === 1 && socket !== this.player2.socket) {
      return socket.send(
        sendJsonReponse(messages.ERROR, "This is black player move")
      );
    }
    try {
      this.chess.move({
        from: move.from,
        to: move.to,
        promotion: "q", // Pawn can be promoted to queen in chess.js
      });

      this.player2.socket.send(
        sendJsonReponse(messages.MOVE, this.chess.fen())
      );
      this.player1.socket.send(
        sendJsonReponse(messages.MOVE, this.chess.fen())
      );
      this.moveCount++;

      // Check for game-over conditions
      if (this.chess.isCheckmate()) {
        this.gameOver = true;
        const winner = socket === this.player1.socket ? "White" : "Black";
        this.endGame(`Checkmate! ${winner} wins.`);
      } else if (this.chess.isStalemate()) {
        this.gameOver = true;
        this.endGame("Stalemate! Game over");
      } else if (this.chess.isDraw()) {
        this.gameOver = true;
        this.endGame("Draw! Game over");
      } else if (this.chess.isThreefoldRepetition()) {
        this.gameOver = true;
        this.endGame("Threefold repetition! Game over");
      } else if (this.chess.isInsufficientMaterial()) {
        this.gameOver = true;
        this.endGame("Insufficient material! Game over");
      }
    } catch (error) {
      if (this.chess.inCheck()) {
        socket.send(sendJsonReponse(messages.ERROR, "In Check"));
      } else {
        socket.send(sendJsonReponse(messages.ERROR, "Invalid Move"));
      }
    }
  }

  get getChess() {
    return this.chess;
  }

  public endGame(message: string) {
    this.player1.socket.send(sendJsonReponse(messages.GAME_OVER, message));
    this.player2.socket.send(sendJsonReponse(messages.GAME_OVER, message));
  }
}
