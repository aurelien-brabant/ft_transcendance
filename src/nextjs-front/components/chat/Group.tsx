import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { ArrowSmLeftIcon, CogIcon, UserAddIcon, UserGroupIcon, XIcon } from "@heroicons/react/outline";
import { Channel, ChannelMessage } from "transcendance-types";
import Tooltip from "../../components/Tooltip";
import { useSession } from "../../hooks/use-session";
import chatContext, {
  ChatContextType,
  ChatMessage,
} from "../../context/chat/chatContext";
import relationshipContext, {
  RelationshipContextType,
} from "../../context/relationship/relationshipContext";

/* Header */
export const GroupHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
  const channelId: string = viewParams.channelId;
  const { user } = useSession();
  const { socket, closeChat, openChatView, setChatView, closeRightmostView } =
    useContext(chatContext) as ChatContextType;
  const [channelName, setChannelName] = useState(viewParams.channelName);
  const [privacy, setChannelPrivacy] = useState(viewParams.privacy);
  const [userInChan, setUserInChan] = useState(
    privacy === "protected" ? true : false
  );
  const actionTooltipStyles = "font-bold bg-dark text-neutral-200";

  const defineOptions = (channel: Channel) => {
    setUserInChan(
      !!channel.users.find((chanUser) => {
        return chanUser.id === user.id;
      })
    );
  };

  const channelUpdatedListener = (channel: Channel) => {
    setChannelName(channel.name);
    setChannelPrivacy(channel.privacy);
  };

  const channelDeletedListener = (deletedId: string) => {
    if (deletedId === channelId) {
      setChatView("groups", "Group chats", {});
    }
  };

  const userJoinedListener = (res: { message: string; userId: string }) => {
    if (res.userId === user.id) {
      setUserInChan(true);
    }
  };

  useEffect(() => {
    /* Listeners */
    socket.on("channelData", defineOptions);
    socket.on("channelUpdated", channelUpdatedListener);
    socket.on("channelDeleted", channelDeletedListener);
    socket.on("joinedChannel", userJoinedListener);

    return () => {
      socket.off("channelData", defineOptions);
      socket.off("channelUpdated", channelUpdatedListener);
      socket.off("channelDeleted", channelDeletedListener);
      socket.off("joinedChannel", userJoinedListener);
    };
  }, []);

  return (
    <Fragment>
      <div className="flex items-start justify-between pt-3 px-5 text-2xl">
        <div className="flex gap-x-2">
          <button
            onClick={() => {
              closeChat();
            }}
          >
            <XIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => {
              setChatView("groups", "Group chats", {});
            }}
          >
            <ArrowSmLeftIcon className="h-6 w-6" />
          </button>
        </div>
        {userInChan === true && (
          <div className="flex items-right gap-x-3">
            <Tooltip className={actionTooltipStyles} content="add user">
              <button
                onClick={() => {
                  openChatView("group_add", "Add a user to group", {
                    channelId: viewParams.channelId,
                  });
                }}
              >
                <UserAddIcon className="h-5 w-5" />
              </button>
            </Tooltip>
            <Tooltip className={actionTooltipStyles} content="users">
              <button
                onClick={() => {
                  openChatView("group_users", "group users", {
                    channelId: viewParams.channelId,
                    channelName,
                  });
                }}
              >
                <UserGroupIcon className="h-6 w-6" />
              </button>
            </Tooltip>
            <button
              onClick={() => {
                openChatView("group_settings", "group settings", {
                  channelId: viewParams.channelId,
                  channelName,
                  privacy,
                });
              }}
            >
              <CogIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center">
        <h6 className="text-lg font-bold text-pink-600">{channelName}</h6>
      </div>
    </Fragment>
  );
};

/* Conversation */
const Group: React.FC<{ viewParams: { [key: string]: any } }> = ({
  viewParams,
}) => {
  const channelId: string = viewParams.channelId;
  const { user } = useSession();
  const { socket, setChatView, getMessageStyle } = useContext(
    chatContext
  ) as ChatContextType;
  const { blocked } = useContext(
    relationshipContext
  ) as RelationshipContextType;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [sendingEnabled, setSendingEnabled] = useState(false);
  const [userInChan, setUserInChan] = useState(false);
  const chatBottom = useRef<HTMLDivElement>(null);

  const joinGroup = async () => {
    socket.emit("joinChannel", {
      channelId: viewParams.channelId,
      userId: user.id,
    });
  };

  /* Send new message */
  const handleGmSubmit = async () => {
    if (currentMessage.trim().length === 0) return;

    socket.emit("gmSubmit", {
      content: currentMessage,
      author: { id: user.id },
      channel: { id: channelId },
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
      handleGmSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const len = e.target.value.trim().length;

    if (len === 0 || len > 640) {
      setSendingEnabled(false);
    } else {
      setSendingEnabled(true);
    }
    setCurrentMessage(e.target.value);
  };

  const addNewMessage = (message: ChannelMessage) => {
    setMessages((prevMessages) => {
      const newMessages: ChatMessage[] = [...prevMessages];

      const author = message.author;
      const isBlocked =
        author && !!blocked.find((blockedUser) => blockedUser.id === author.id);
      const isMe = author && author.id === user.id;

      newMessages.push({
        id: prevMessages.length.toString(),
        createdAt: message.createdAt,
        content: isBlocked ? "Blocked message" : message.content,
        author: author && author.username,
        displayAuthor: author !== null && !isMe && !isBlocked,
        displayStyle: getMessageStyle(message.author),
        isInvite: false,
      });
      return newMessages;
    });
  };

  /* Listeners */
  const channelDeletedListener = (deletedId: string) => {
    if (deletedId === channelId) {
      setChatView("groups", "Group chats", {});
    }
  };

  /* Receive new message */
  const newGmListener = ({ message }: { message: ChannelMessage }) => {
    addNewMessage(message);
  };

  const userJoinedListener = ({
    message,
    userId,
  }: {
    message: ChannelMessage;
    userId: string;
  }) => {
    addNewMessage(message);
    if (userId === user.id) {
      setUserInChan(true);
    }
  };

  const userLeftListener = ({ message }: { message: ChannelMessage }) => {
    addNewMessage(message);
  };

  const userPunishedListener = (message: string) => {
    setChatView("groups", "Group chats", {});
  };

  /* Load all messages in channel */
  const updateGroupView = (channel: Channel) => {
    if (channel.id !== channelId) return;

    setUserInChan(
      !!channel.users.find((chanUser) => {
        return chanUser.id === user.id;
      })
    );

    if (channel.messages) {
      const messages: ChatMessage[] = [];

      channel.messages.sort(
        (a: ChannelMessage, b: ChannelMessage) =>
          parseInt(a.id) - parseInt(b.id)
      );

      for (const message of channel.messages) {
        const author = message.author;
        const isBlocked =
          author &&
          !!blocked.find((blockedUser) => blockedUser.id === author.id);
        const isMe = author && author.id === user.id;

        messages.push({
          id: messages.length.toString(),
          createdAt: message.createdAt,
          content: isBlocked ? "Blocked message" : message.content,
          author: author && author.username,
          displayAuthor: author !== null && !isMe && !isBlocked,
          displayStyle: getMessageStyle(message.author),
          isInvite: false,
        });
      }
      setMessages(messages);
    }
  };

  /* Scroll to bottom if new message is sent */
  useEffect(() => {
    chatBottom.current?.scrollIntoView();
  }, [messages]);

  useEffect(() => {
    socket.emit("getChannelData", { channelId });

    /* Listeners */
    socket.on("channelData", updateGroupView);
    socket.on("channelDeleted", channelDeletedListener);
    socket.on("newGm", newGmListener);
    socket.on("joinedChannel", userJoinedListener);
    socket.on("leftChannel", userLeftListener);
    socket.on("userKicked", userLeftListener);
    socket.on("punishedInChannel", userPunishedListener);
    socket.on("kickedFromChannel", userPunishedListener);

    return () => {
      socket.off("channelData", updateGroupView);
      socket.off("channelDeleted", channelDeletedListener);
      socket.off("newGm", newGmListener);
      socket.off("joinedChannel", userJoinedListener);
      socket.off("leftChannel", userLeftListener);
      socket.off("userKicked", userLeftListener);
      socket.off("punishedInChannel", userPunishedListener);
      socket.off("kickedFromChannel", userPunishedListener);
    };
  }, []);

  return (
    <div className="h-full">
      <div className="flex flex-col items-start max-h-[87%] h-auto px-5 pb-5 overflow-auto">
        {messages.map((message: ChatMessage) => (
          <div
            key={message.id}
            className={`
							${message.displayStyle} 
							max-w-[80%] p-2 my-2 rounded whitespace-wrap break-all`}
          >
            {message.displayAuthor && (
              <span className="text-xs uppercase">{message.author}</span>
            )}
            <p className="whitespace-pre-line">{message.content}</p>
          </div>
        ))}
        <div ref={chatBottom} />
      </div>
      {userInChan ? (
        <div className="absolute inset-x-0 bottom-0 border-t-2 border-gray-800 min-h-[13%] flex gap-x-2 items-center px-8 py-2 bg-dark drop-shadow-md">
          <textarea
            placeholder="Your message"
            className="p-2 bg-transparent border border-pink-600 resize-none grow outline-0"
            value={currentMessage}
            onChange={handleChange}
            onKeyDown={handleOnKeyDown}
          />
          {sendingEnabled ? (
            <button
              onClick={handleGmSubmit}
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
      ) : (
        <div className="absolute inset-x-0 bottom-0 border-t-2 border-gray-800 min-h-[13%] flex gap-x-2 items-center justify-center px-8 py-2 bg-dark drop-shadow-md">
          <button
            className="px-2 py-1 text-sm font-bold uppercase bg-pink-600 rounded"
            onClick={() => {
              joinGroup();
            }}
          >
            Join Group
          </button>
        </div>
      )}
    </div>
  );
};

export default Group;
