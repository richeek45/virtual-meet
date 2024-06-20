import { atom } from "jotai";

export enum MESSAGE_TYPES {
  DISCONNECTED = "DISCONNECTED",
  LOGIN = "LOGIN",
  OFFER = "OFFER",
  ANSWER = "ANSWER",
  ICE_CANDIDATE = "ICE_CANDIDATE",
  LEAVE = "LEAVE" 
}

export interface WsDataI {
  type: MESSAGE_TYPES;
  success: boolean;
  error: boolean;
  message: string;
}

export const defaultWsData = {
  success: false,
  error: false,
  type: MESSAGE_TYPES.DISCONNECTED,
  message: "not connected"
}

export const usernameAtom = atom('');
export const wsDataAtom = atom({} as WsDataI);
export const loggedInAtom = atom(false);







