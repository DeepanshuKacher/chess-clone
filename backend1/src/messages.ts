export const messages = {
  INIT_GAME: "INIT_GAME",
  MOVE: "MOVE",
  GAME_OVER: "GAME_OVER",
  ERROR: "ERROR",
  RECONNECT: "RECONNECT",
} as const;

export type message_enum = keyof typeof messages;
