import { Game } from "./Game";

export const storeUsers: { [userUniquecookies: string]: WebSocket } = {};

export const mapUsersToGame: { [playerUniqueCookie: string]: Game } = {};

