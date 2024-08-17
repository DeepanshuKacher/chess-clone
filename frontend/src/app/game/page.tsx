"use client";

import { ChessBoard } from "@/components/ChessBoard";
import { useSocket } from "@/custom_hooks/useSocket";
import { messages } from "@/utils/constants";
import { sendJsonMessage } from "@/utils/functions";
import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";

function page() {
  const socket = useSocket();

  // const [gameStatus, setGameStatus] = useState<keyof typeof messages | null>(
  //   null
  // );

  const [whichSide, setWhichSide] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080", {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error: AxiosError) => {
        alert("Couldn't connect");
        console.log(error);
      });

    return () => {
      if (socket) socket.close();
    };
  }, [socket]);

  const InitializeGame = () => {
    socket?.send(sendJsonMessage("INIT_GAME"));
  };

  if (!socket) return <div>Connecting...</div>;
  return (
    <div className="border border-yellow-300 flex flex-col sm:flex-row items-center justify-around h-screen">
      <ChessBoard socket={socket} setWhichSide={setWhichSide} />
      <div className=" h-full flex flex-col justify-center space-y-7">
        {!whichSide ? (
          <h2>Initialized the game</h2>
        ) : (
          <h2>You are {whichSide} side</h2>
        )}
        <button
          onClick={InitializeGame}
          disabled={whichSide !== null}
          className="bg-blue-500 disabled:bg-slate-500 disabled:cursor-not-allowed text-white text-lg font-semibold py-3 px-6 rounded-md hover:bg-blue-600 active:bg-blue-700"
        >
          Start Match
        </button>
      </div>
    </div>
  );
}

export default page;
