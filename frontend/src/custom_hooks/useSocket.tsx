import { useEffect, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_BASE_URL;

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("socket opened");
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("socket closed");
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, []);

  return socket;
};
