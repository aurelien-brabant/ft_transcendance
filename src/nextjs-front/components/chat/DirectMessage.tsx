import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { RiPingPongLine } from "react-icons/ri";
import { ArrowSmLeftIcon, XIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { DmChannel, DmMessage } from "transcendance-types";
import { UserStatusItem } from "../UserStatus";
import { useSession } from "../../hooks/use-session";
import Tooltip from "../../components/Tooltip";
import chatContext, {
  ChatContextType,
  ChatMessage,
} from "../../context/chat/chatContext";

/* Header */
export const DirectMessageHeader: React.FC<{ viewParams: any }> = ({
  viewParams,
}) => {
  const { user } = useSession();
  const { asPath } = useRouter();
  const router = useRouter();
  const {
    socket,
    closeChat,
    setChatView
  } = useContext(chatContext) as ChatContextType;
  const actionTooltipStyles = "font-bold bg-dark text-neutral-200";
  const pongIconStyle =
    "p-1 text-pink-700 bg-pink-200 rounded-full transition hover:scale-110  hover:text-pink-600";

  /* Invite for a Pong game */
  const sendPongInvite = async (userId: string) => {
    socket.emit("sendPongInvite", {
      senderId: user.id,
      receiverId: parseInt(userId),
    });
  };

  return (
    <Fragment>
      <div className="flex items-start justify-between pt-3 px-5">
        <div className="flex gap-x-2">
          <button
            className="text-2xl"
            onClick={() => {
              closeChat();
            }}
          >
            <XIcon className="h-6 w-6" />
          </button>
          <button
            className="text-2xl"
            onClick={() => {
              setChatView("dms", "Direct messages", {});
            }}
          >
            <ArrowSmLeftIcon className="h-6 w-6" />
          </button>
        </div>
        <Tooltip className={actionTooltipStyles} content="play">
          <button
            className={pongIconStyle}
            onClick={() => sendPongInvite(viewParams.friendId)}
          >
            <RiPingPongLine />
          </button>
        </Tooltip>
      </div>
      <div className="flex items-center justify-center gap-x-3">
        <Link href={`/users/${viewParams.friendUsername}`}>
          <h6 className="font-bold hover:text-pink-600">
            {viewParams.friendUsername}
          </h6>
        </Link>{" "}
        <UserStatusItem withText={false} id={viewParams.friendId} />
      </div>
    </Fragment>
  );
};

/* Conversation */
const DirectMessage: React.FC<{ viewParams: { [key: string]: any } }> = ({
  viewParams,
}) => {
  const dmId: string = viewParams.channelId;
  const { user } = useSession();
  const { asPath } = useRouter();
  const router = useRouter();
  const { socket, closeChat, getMessageStyle } = useContext(
    chatContext
  ) as ChatContextType;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [sendingEnabled, setSendingEnabled] = useState(false);
  const chatBottom = useRef<HTMLDivElement>(null);
  const pongAcceptIconStyle = "p-1 text-green-800 bg-green-300 rounded-full hover:text-green-600";

  /* Send new message */
  const handleDmSubmit = async () => {
    if (currentMessage.trim().length === 0) return;

    socket.emit("dmSubmit", {
      content: currentMessage.trim(),
      author: { id: user.id },
      dm: { id: dmId },
    });
    setCurrentMessage("");
  };

  /* a message can't start with an empty line */
  useEffect(() => {
    setCurrentMessage(currentMessage.replace(/^\n.*/g, ""));
  }, [currentMessage]);

  const handleOnKeyDown = ({
    code,
    shiftKey,
  }: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!shiftKey && code === "Enter") {
      handleDmSubmit();
    }
  };

  const handleChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLTextAreaElement>) => {
    const len = value.trim().length;

    if (len === 0 || len > 640) {
      setSendingEnabled(false);
    } else {
      setSendingEnabled(true);
    }
    setCurrentMessage(value);
  };

  /* Receive new message */
  const handleNewMessage = ({ message }: { message: DmMessage }) => {
    setMessages((prevMessages) => {
      const newMessages: ChatMessage[] = [...prevMessages];

      newMessages.push({
        id: prevMessages.length.toString(),
        createdAt: message.createdAt,
        content: message.content,
        author: message.author.username,
        displayAuthor: !(message.author.id === user.id),
        displayStyle: getMessageStyle(message.author),
        isInvite: message.type === "invite",
        roomId: message.roomId ? message.roomId : undefined,
      });
      return newMessages;
    });
  };

  /* Load all messages in channel */
  const updateDmView = async (dm: DmChannel) => {
    if (dm.id !== dmId || !dm.messages) return;

    const messages: ChatMessage[] = [];

    dm.messages.sort(
      (a: DmMessage, b: DmMessage) => parseInt(a.id) - parseInt(b.id)
    );

    for (const message of dm.messages) {
      messages.push({
        id: messages.length.toString(),
        createdAt: message.createdAt,
        content: message.content,
        author: message.author.username,
        displayAuthor: !(message.author.id === user.id),
        displayStyle: getMessageStyle(message.author),
        isInvite: message.type === "invite",
        roomId: message.roomId ? message.roomId : undefined,
      });
    }
    setMessages(messages);
  };

  /* Scroll to bottom if a new message is sent */
  useEffect(() => {
    chatBottom.current?.scrollIntoView();
  }, [messages]);

  const acceptPongInvite = (roomId: string | undefined) => {
    if (!roomId) return ;

    socket.emit("acceptPongInvite", {
      roomId,
      userId: user.id,
    });

    socket.on("redirectToGame", () => {
      closeChat();

      if (asPath === "/hub") {
        router.reload();
      } else {
        router.push("/hub");
      }
    });
  };

  const goToHub = async () => {
    closeChat();
    if (asPath === "/hub") {
      router.reload();
    } else {
      await router.push("/hub");
    }
  };

  useEffect(() => {
    socket.emit("getDmData", { dmId });

    /* Listeners */
    socket.on("updateDm", updateDmView);
    socket.on("newDm", handleNewMessage);
    socket.on("newPongInvite", handleNewMessage);
    socket.on("launchInviteGame", goToHub);

    return () => {
      socket.off("updateDm", updateDmView);
      socket.off("newDm", handleNewMessage);
      socket.off("newPongInvite", handleNewMessage);
      socket.off("launchInviteGame", goToHub);
    };
  }, []);

  return (
    <div className="h-full">
      <div className="flex flex-col items-start max-h-[87%] h-auto px-5 pb-5 overflow-auto">
        {messages.map((msg: ChatMessage) => (
          <div
            key={msg.id}
            className={`
              ${msg.displayStyle}
              max-w-[80%] p-2 my-2 rounded whitespace-wrap break-all`}
          >
            <p className="whitespace-pre-line">{msg.content}</p>
            {msg.isInvite && (
              <p>
                <div className="flex justify-around">
                  <button
                    className={pongAcceptIconStyle}
                    onClick={() => {
                      acceptPongInvite(msg.roomId);
                    }}
                  >
                    <RiPingPongLine />
                  </button>
                </div>
                Click to join the game
              </p>
            )}
          </div>
        ))}
        <div ref={chatBottom} />
      </div>
      <div className="absolute inset-x-0 bottom-0 border-t-2 border-04dp min-h-[13%] flex gap-x-2 items-center px-8 py-2 bg-dark drop-shadow-md">
        <textarea
          placeholder="Your message"
          className="p-2 bg-transparent border border-pink-600 resize-none grow outline-0"
          value={currentMessage}
          onChange={handleChange}
          onKeyDown={handleOnKeyDown}
        />
        {sendingEnabled ? (
          <button
            onClick={handleDmSubmit}
            className="self-stretch px-3 py-2 text-lg text-white uppercase bg-pink-600 rounded"
          >
            <FiSend />
          </button>
        ) : (
          <button className="self-stretch px-3 py-2 text-lg text-white uppercase bg-pink-900 rounded">
            <FiSend />
          </button>
        )}
      </div>
    </div>
  );
};

export default DirectMessage;
