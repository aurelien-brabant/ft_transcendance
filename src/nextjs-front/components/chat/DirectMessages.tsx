import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { DmChannel } from "transcendance-types";
import { UserStatusItem } from "../UserStatus";
import { useSession } from "../../hooks/use-session";
import chatContext, {
  ChatContextType,
  ChatGroupPrivacy,
  ChatMessagePreview,
  DirectMessage,
} from "../../context/chat/chatContext";
import relationshipContext, {
  RelationshipContextType,
} from "../../context/relationship/relationshipContext";

/* All DM conversations tab */
const DirectMessages: React.FC<{ viewParams: Object }> = ({ viewParams }) => {
  const { user } = useSession();
  const { socket, openChatView } = useContext(chatContext) as ChatContextType;
  const { blocked } = useContext(
    relationshipContext
  ) as RelationshipContextType;
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [filteredDms, setFilteredDms] = useState(directMessages);
  const [visiblityFilter, setVisiblityFilter] =
    useState<ChatGroupPrivacy | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* Direct Messages loading */
  const getLastMessage = (channel: DmChannel) => {
    let message: ChatMessagePreview = {
      createdAt: channel.createdAt,
      content: "",
    };

    if (channel.messages && channel.messages.length > 0) {
      const lastMessage = channel.messages.reduce(function (prev, current) {
        return prev.id > current.id ? prev : current;
      });

      message.createdAt = new Date(lastMessage.createdAt);
      message.content = lastMessage.content;
    }
    return message;
  };

  const updateDmsListener = (channels: DmChannel[]) => {
    const dms: DirectMessage[] = [];

    for (const channel of Array.from(channels)) {
      const friend =
        channel.users[0].id === user.id ? channel.users[1] : channel.users[0];
      const isBlocked = !!blocked.find((user) => user.id === friend.id);

      /* Don't display DMs from blocked users */
      if (!isBlocked) {
        const lastMessage: ChatMessagePreview = getLastMessage(channel);

        dms.push({
          id: channel.id,
          friendId: friend.id,
          friendUsername: friend.username,
          friendPic: `/api/users/${friend.id}/photo`,
          lastMessage: lastMessage.content,
          updatedAt: lastMessage.createdAt,
        });
      }
    }
    /* Sorts from most recent */
    dms.sort(
      (a: DirectMessage, b: DirectMessage) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setDirectMessages(dms);
  };

  /* Search a user */
  const handleSearch = (term: string) => {
    const searchTerm = term.toLowerCase();
    setFilteredDms(
      directMessages.filter((dm) =>
        dm.friendUsername.toLowerCase().includes(searchTerm)
      )
    );
  };

  useEffect(() => {
    handleSearch((searchInputRef.current as HTMLInputElement).value);
  }, [visiblityFilter]);

  /* Update filtered direct messages */
  useEffect(() => {
    setFilteredDms(directMessages);
  }, [directMessages]);

  const dmsChangeListener = () => {
    socket.emit("getUserDms", { userId: user.id });
  };

  useEffect(() => {
    socket.emit("getUserDms", { userId: user.id });

    /* Listeners */
    socket.on("updateUserDms", updateDmsListener);
    socket.on("dmCreated", dmsChangeListener);
    socket.on("newDm", dmsChangeListener);
    socket.on("newPongInvite", dmsChangeListener);

    return () => {
      socket.off("updateUserDms", updateDmsListener);
      socket.off("dmCreated", dmsChangeListener);
      socket.off("newDm", dmsChangeListener);
      socket.off("newPongInvite", dmsChangeListener);
    };
  }, []);

  return (
    <Fragment>
      <div className="h-[15%] gap-x-2 flex items-center p-4 bg-dark/90 border-b-4 border-04dp justify-between">
        <input
          ref={searchInputRef}
          type="text"
          className="py-1 bg-transparent border-b-2 border-pink-600 text-md outline-0 max-w-[45%]"
          placeholder="search for a user"
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
        />
        <button
          className="px-2 py-1 text-sm font-bold uppercase bg-pink-600 hover:bg-pink-500 rounded"
          onClick={() => {
            openChatView("dm_new", "Chat with a friend", {});
          }}
        >
          +DM
        </button>
      </div>
      <div className="h-[85%] overflow-x-auto">
        {filteredDms.map((dm) => (
          <div
            key={dm.friendUsername}
            className="relative items-center px-10 py-5 grid grid-cols-3 border-b border-04dp hover:bg-04dp/90 transition"
            onClick={() => {
              openChatView("dm", "dm", {
                channelId: dm.id,
                friendId: dm.friendId,
                friendUsername: dm.friendUsername,
              });
            }}
          >
            <div>
              <div className="relative z-20 w-16 h-16 max-w-full rounded-full">
                <img
                  src={dm.friendPic}
                  className="object-cover w-full h-full rounded-full"
                />
                <UserStatusItem
                  withText={false}
                  className="absolute bottom-0 right-0 z-50"
                  id={dm.friendId}
                />
              </div>
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between">
                <h6 className="text-base font-medium">{dm.friendUsername}</h6>
              </div>
              <p className="mt-1 text-sm text-neutral-200">
                {dm.lastMessage.substr(0, 60) +
                  (dm.lastMessage.length > 60 ? "..." : "")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Fragment>
  );
};

export default DirectMessages;
