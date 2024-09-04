export const messages = {
  INIT_GAME: "INIT_GAME",
  MOVE: "MOVE",
  GAME_OVER: "GAME_OVER",
  ERROR: "ERROR",
} as const;

export type message_enum = keyof typeof messages;

export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
