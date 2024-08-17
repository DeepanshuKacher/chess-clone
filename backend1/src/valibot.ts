import * as v from "valibot";
import type { RawData } from "ws";

export const movePayloadSchema = v.object({
  move: v.object({
    from: v.string(),
    to: v.string(),
  }),
});

const propsSchema = v.object({
  type: v.string(),
  payload: v.any(),
});

export const moveData = (payload: any) => {
  try {
    return v.parse(movePayloadSchema, payload);
  } catch (error) {
    return null;
  }
};

export const getData = (message: RawData) => {
  try {
    const data = JSON.parse(message.toString());

    return v.parse(propsSchema, data);
  } catch (error) {
    return null;
  }
};
