import { message_enum, messages } from "@/utils/constants";
import { sendJsonMessage } from "@/utils/functions";
import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import { useEffect, useState } from "react";

interface Props {
  // board: ({
  //   square: Square;
  //   type: PieceSymbol;
  //   color: Color;
  // } | null)[][];
  // handleMove: (location: Square) => void;
  socket: WebSocket;
  setWhichSide: React.Dispatch<React.SetStateAction<string | null>>;
}

const reuseTailwindClass = {
  lightGreen: "bg-green-400",
  darkGreen: "bg-green-800",
  textWhite: "text-white",
  textBlack: "text-black",
};

const boardLetter = ["a", "b", "c", "d", "e", "f", "g", "h"];

const getPieceUnicode = (piece: {
  square: Square;
  type: PieceSymbol;
  color: Color;
}) => {
  const unicodePieces = {
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    P: "♙",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
  };
  return unicodePieces[piece.type] || "";
};

export const ChessBoard = (props: Props) => {
  const { socket, setWhichSide } = props;

  const [chess, setChess] = useState<Chess | null>(null);
  const [board, setBoard] = useState<
    | ({
        square: Square;
        type: PieceSymbol;
        color: Color;
      } | null)[][]
    | null
  >(null);
  const [from, setFrom] = useState<Square | null>(null);
  const [moveLoading, setMoveLoading] = useState(false);

  useEffect(() => {
    if (socket)
      socket.onmessage = (event) => {
        const message: { type: message_enum; payload: any } = JSON.parse(
          event.data
        );
        console.log(message);

        switch (message.type) {
          case messages.INIT_GAME:
            const chessInit = new Chess();
            setChess(chessInit);
            setBoard(chessInit.board());

            setWhichSide(message.payload.color);
            console.log("Game initialized");
            break;

          case messages.MOVE:
            const move = message.payload;
            // console.log(move);
            chess?.move(move);
            if (chess) setBoard(chess?.board());
            setMoveLoading(false);
            break;

          case messages.ERROR:
            // console.log(message.payload);
            alert(message.payload);
            setMoveLoading(false);

          case messages.GAME_OVER:
            console.log("Game over");
            break;

          case messages.RECONNECT:
            const data: {
              board: ({
                square: Square;
                type: PieceSymbol;
                color: Color;
              } | null)[][];
              color: string;
              fen: string;
            } = message.payload;
            const chessReconnect = new Chess(data.fen);
            setChess(chessReconnect);
            setBoard(chessReconnect.board());
            setWhichSide(data.color);

          default:
            console.log(message);
        }
      };
  }, [socket]);

  const handleMove = (location: Square) => {
    if (from) {
      setMoveLoading(true);
      try {
        socket.send(
          sendJsonMessage("MOVE", { move: { from: from, to: location } })
        );
      } catch (error) {
        console.log("error on handleMove");
        alert("Invalid move");
      }
      setFrom(null);
    } else {
      setFrom(location);
    }
  };

  return (
    <div className="grid relative grid-cols-8 w-[32rem] border border-black">
      {moveLoading ? (
        <div className="absolute h-full w-full bg-[#c57c7c82] flex justify-center items-center">
          <span className="text-3xl">Loading...</span>
        </div>
      ) : null}
      {board?.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            onClick={() =>
              handleMove((boardLetter[colIndex] + (8 - rowIndex)) as Square)
            }
            className={`flex items-center justify-center h-16 w-16  ${
              (rowIndex + colIndex) % 2 === 0
                ? reuseTailwindClass.lightGreen
                : reuseTailwindClass.darkGreen
            }`}
          >
            {cell && (
              <span
                className={`text-5xl ${
                  cell.color === "w"
                    ? reuseTailwindClass.textWhite
                    : reuseTailwindClass.textBlack
                }`}
              >
                {getPieceUnicode(cell)}
                {/* {boardLetter[colIndex] + (8 - rowIndex)} */}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
};

interface TableData {
  table: string | null[][];
}
