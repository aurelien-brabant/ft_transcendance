import { createContext } from "react";
import { Socket } from "socket.io-client";
import { BaseUserData, Channel, DmChannel } from "transcendance-types";

export type ChatView =
  | "dms"
  | "dm"
  | "dm_new"
  | "groups"
  | "group"
  | "group_new"
  | "group_add"
  | "group_users"
  | "group_settings"
  | "password_protection"; // plural form denotes the list, singular the chat itself

export type ChatMessagePreview = {
  createdAt: Date;
  content: string;
};

export type ChatMessage = ChatMessagePreview & {
  id: string;
  author?: string;
  displayAuthor: boolean;
  displayStyle: string;
  isInvite: boolean;
  roomId?: string;
};

export type ChatGroupPrivacy = "public" | "protected" | "private";

export type ChatGroup = {
  id: string;
  label: string;
  lastMessage: string;
  in: boolean;
  peopleCount: number;
  privacy: ChatGroupPrivacy;
  updatedAt: Date;
};

export type DirectMessage = {
  id: string;
  friendId: string;
  friendUsername: string;
  friendPic: string;
  lastMessage: string;
  updatedAt: Date;
};

export type ChatContextType = {
  isChatOpened: boolean;
  socket: Socket;

  /* Chat manipulation */
  openChat: () => void;
  closeChat: () => void;
  openChatView: (view: ChatView, label: string, params: Object) => void;
  setChatView: (view: ChatView, label: string, params: Object) => void;
  closeRightmostView: (n?: number) => void;

  createDirectMessage: (userId: string, friendId: string) => void;
  getMessageStyle: (author: BaseUserData | undefined) => string;

  /* Event listeners */
  channelCreatedListener: (newChannel: Channel) => void;
  openCreatedDmListener: (newDm: DmChannel) => void;
  chatWarningListener: (message: string) => void;

  /* Draggable */
  lastX: number;
  lastY: number;
  setLastX: (data: any) => any;
  setLastY: (data: any) => any;
};

const chatContext = createContext<ChatContextType | null>(null);

export default chatContext;
