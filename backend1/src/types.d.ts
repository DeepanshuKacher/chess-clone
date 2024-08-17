// src/types.d.ts
import 'http';

declare module 'http' {
  interface IncomingMessage {
    session?: {
      userId?: string;
    };
  }
}
