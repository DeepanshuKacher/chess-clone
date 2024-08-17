import { WebSocket } from "ws";
import { message_enum } from "./messages";

export const sendJsonReponse = <T>(type: message_enum, payload: T) =>
  JSON.stringify({ type, payload });

export const sendSocketMessage = <T>(
  ws: WebSocket,
  type: message_enum,
  payload: T
) => ws.send(sendJsonReponse<T>(type, payload));
