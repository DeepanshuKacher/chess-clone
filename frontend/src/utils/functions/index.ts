import { message_enum } from "../constants";

export const sendJsonMessage = (type: message_enum, payload?: any) => {
  return JSON.stringify({ type, payload });
};
