"use client";

import axios, { type AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    axios
      .get("http://localhost:8080", {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response.data);
        // connectWebSocket();
      })
      .catch((error: AxiosError) => {
        alert("Couldn't connect");
        console.log(error);
      });

    // return () => {
    //   if (socket) socket.close();
    // };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8 p-8 bg-white shadow-lg rounded-lg">
        {/* Image Section */}
        <div className="w-full md:w-1/2">
          <Image
            src="/chess_board.jpg"
            alt="Chess Board"
            width={500}
            height={500}
            className="w-full h-auto rounded-lg"
          />
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4">Play Chess Online</h2>
          <p className="text-gray-700 mb-6">
            Join our online chess community and compete with players from around
            the world. Whether you&apos;re a beginner or a grandmaster, there&apos;s
            always a challenge waiting for you.
          </p>
          <Link
            href="/game"
            className="inline-block bg-blue-500 text-white text-lg font-semibold py-3 px-6 rounded-md hover:bg-blue-600 active:bg-blue-700"
          >
            Play Online
          </Link>
        </div>
      </div>
    </div>
  );
}
