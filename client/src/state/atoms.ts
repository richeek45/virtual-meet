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
  success?: boolean;
  error?: boolean;
  message: string;
  user?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export enum MessageEnum {
  MESSAGE = "MESSAGE",
  FILE = "FILE"
} 

export enum ShareStatusEnum {
  START = "START",
  END = "END",

}

export interface FileMetadata {
  name: string;
  size: number;
  fileType: string;
}

export interface MessageI {
  id: number;
  user: string;
  type: MessageEnum;
  message?: string;
  shareStatus?: ShareStatusEnum,
  fileMetadata?: FileMetadata;
}

export interface FileData {
  fileMetadata: FileMetadata,
  currentFile: string[]
}

export const defaultWsData = {
  success: false,
  error: false,
  type: MESSAGE_TYPES.DISCONNECTED,
  message: "not connected"
}

export const usernameAtom = atom('');
export const remoteUsernameAtom = atom('');
export const wsDataAtom = atom({} as WsDataI);
export const loggedInAtom = atom(false);
export const streamAtom = atom(null as unknown as MediaStream);
export const mediaAtom = atom({ audio: true, video: true });
export const messageAtom = atom([] as MessageI[]);
export const progressAtom = atom(0);
export const fileDataAtom = atom(null as unknown as FileData);
