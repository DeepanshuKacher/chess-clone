import { message_enum, messages } from "@/utils/constants";
import { sendJsonMessage } from "@/utils/functions";
import axios, { AxiosError } from "axios";
import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import { useEffect, useState } from "react";

interface Props {
  socket: WebSocket;
  setWhichSide: React.Dispatch<React.SetStateAction<string | null>>;
  setWhoseturn: React.Dispatch<React.SetStateAction<string | null>>;
}

interface ResSquare {
  square: string; // e.g., "a8"
  type: "p" | "r" | "n" | "b" | "q" | "k"; // pawn, rook, knight, bishop, queen, king
  color: "w" | "b"; // white or black
}

// Define a type for the game board
interface BoardRow {
  [index: number]: ResSquare | null;
}

// Define the type for the entire board
interface Board {
  [rowIndex: number]: BoardRow;
}

// Define the type for the game data
interface GameData {
  board: Board;
  fen: string; // Forsyth-Edwards Notation for the game state
}

// Define the type for the response message
interface ResponseMessage {
  message: string; // e.g., "User ID set successfully"
  userId: string; // e.g., "5e63171b-674b-466e-816c-79f2a615b9d7"
  gameData: GameData;
  color: "white" | "black"; // Player color
}

const reuseTailwindClass = {
  lightGreen: "bg-green-400",
  darkGreen: "bg-green-800",
  textWhite: "text-white",
  textBlack: "text-black",
  lightYellow: "bg-yellow-300",
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
  const { socket, setWhichSide, setWhoseturn } = props;

  const [chess, setChess] = useState<Chess>(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [from, setFrom] = useState<Square | null>(null);
  const [moveLoading, setMoveLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/gamedata", {
        withCredentials: true,
      })
      .then((response) => {
        const data: ResponseMessage = response.data;

        const newChess = new Chess(data.gameData.fen);

        setChess(newChess);

        setBoard(newChess.board());
        setWhoseturn(newChess.turn());

        setWhichSide(data.color);
      })
      .catch((error: AxiosError) => {
        console.log(error.response?.data);
        // console.log(error.message);
        // console.log(error.cause);
        // console.log(error.response?.data);
      });
  }, []);

  useEffect(() => {
    if (socket)
      socket.onmessage = (event) => {
        const message: { type: message_enum; payload: any } = JSON.parse(
          event.data
        );

        switch (message.type) {
          case messages.INIT_GAME:
            const chessInit = new Chess();
            setChess(chessInit);
            setBoard(chessInit.board());
            setWhoseturn(chessInit.turn());

            setWhichSide(message.payload.color);
            break;

          case messages.MOVE:
            const move = message.payload;

            const newChess = new Chess(move);

            setChess(newChess);

            setBoard(newChess.board());

            setWhoseturn(newChess.turn());

            setMoveLoading(false);
            break;

          case messages.ERROR:
            // console.log(message.payload);
            alert(message.payload);
            setMoveLoading(false);
            break;

          case messages.GAME_OVER:
            alert(message.payload);
            break;

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

  const onSquareClick = (colIndex: number, rowIndex: number) => {
    handleMove((boardLetter[colIndex] + (8 - rowIndex)) as Square);
  };

  return (
    <div className="grid relative grid-cols-8 w-[32rem] border border-black">
      {moveLoading ? (
        <div className="absolute h-full w-full bg-[#c57c7c82] flex justify-center items-center">
          <span className="text-3xl">Loading...</span>
        </div>
      ) : null}
      {board?.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => {
                onSquareClick(colIndex, rowIndex);
              }}
              className={`flex items-center justify-center h-16 w-16 ${
                cell?.square === from
                  ? reuseTailwindClass.lightYellow
                  : (rowIndex + colIndex) % 2 === 0
                  ? reuseTailwindClass.lightGreen
                  : reuseTailwindClass.darkGreen
              }`}
            >
              {cell && (
                <span
                  className={`text-5xl cursor-pointer ${
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
          );
        })
      )}
    </div>
  );
};

interface TableData {
  table: string | null[][];
}
