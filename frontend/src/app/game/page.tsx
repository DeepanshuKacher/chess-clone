"use client";

import { ChessBoard } from "@/components/ChessBoard";
import { useSocket } from "@/custom_hooks/useSocket";
import { sendJsonMessage } from "@/utils/functions";
import React, { useState } from "react";

const GamePage = () => {
  const socket = useSocket();

  const [whichSide, setWhichSide] = useState<string | null>(null);
  const [whoseturn, setWhoseturn] = useState<string | null>(null);

  const InitializeGame = () => {
    setWhichSide("initialize");
    socket?.send(sendJsonMessage("INIT_GAME"));
  };

  if (!socket) return <div>Please Reload browser</div>;
  return (
    <div className="border border-yellow-300 flex flex-col sm:flex-row items-center justify-around h-screen">
      <ChessBoard
        setWhoseturn={setWhoseturn}
        socket={socket}
        setWhichSide={setWhichSide}
      />
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
        {whoseturn ? (
          <h2>{whoseturn === "b" ? "Black" : "White"} turn</h2>
        ) : null}
      </div>
    </div>
  );
};

export default GamePage;
