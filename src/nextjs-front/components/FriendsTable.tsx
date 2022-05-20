import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  LockClosedIcon,
  LockOpenIcon,
  UserAddIcon,
  UserRemoveIcon,
  XIcon,
} from "@heroicons/react/outline";
import { IoIosArrowForward } from "react-icons/io";
import { User } from "transcendance-types";
import ResponsiveFade from "./ResponsiveFade";
import Tooltip from "./Tooltip";
import { useSession } from "../hooks/use-session";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import relationshipContext, {
  RelationshipContextType,
} from "../context/relationship/relationshipContext";

/* Friends and Duoquadra friends */
const FriendsTable: React.FC<{
  category: string;
  list: User[];
  setSelected: any;
}> = ({ category, list, setSelected }) => {
  const { user: currentUser, backend } = useSession();
  const { setAlert } = useContext(alertContext) as AlertContextType;
  const {
    friends,
    setFriends,
    friends42,
    setFriends42,
    blocked,
    setBlocked,
    suggested,
    setSuggested,
    setPendingFriendsReceived,
    pendingFriendsSent,
    setPendingFriendsSent,
  } = useContext(relationshipContext) as RelationshipContextType;
  const gridStyle =
    "place-items-stretch grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-center pt-10 pb-10";
  const userCardStyle =
    "text-pink-500 justity-items-center px-5 pt-2 pb-7 bg-01dp border border-pink-500 rounded hover:bg-03dp hover:text-inherit md:transition md:transform md:ease-in md:hover:-translate-y-1";
  const actionTooltipStyles = "font-bold bg-dark text-neutral-200";

  const getUserCard = (user: User) => {
    return (
      <Link href={`/users/${user.username}`}>
        <a>
          <div className="grid grid-cols-2 m-2 space-x-3">
            <div className="grid grid-cols-1 text-center place-items-center text-green-500 border-pink-500 bg-inherit">
              <ArrowUpIcon className="h-4 w-4" /> {user.wins}
            </div>
            <div className="grid grid-cols-1 text-center place-items-center text-red-400 bg-inherit">
              <ArrowDownIcon className="h-4 w-4" /> {user.losses}
            </div>
          </div>

          <div className="my-4  relative w-44 mx-auto h-44 max-w-full rounded-full overflow-hidden">
            <img
              className="object-cover object-center w-full h-full"
              src={`/api/users/${user.id}/photo`}
              alt="Profile picture"
            />
          </div>

          {user.duoquadra_login && (
            <div className="invisible md:visible absolute top-16 right-4">
              <div className="flex flex-col items-center p-2">
                <div
                  style={{ backgroundColor: "#00babc" }}
                  className="opacity-60 border border-black rounded-full pb-0 pt-2 pr-2 pl-2"
                >
                  <Image
                    src="/plain_logo.svg"
                    width={25}
                    height={25}
                    alt="42 Badge"
                  />
                </div>
              </div>
            </div>
          )}

          <p className="place-content-evenly text-ellipsis overflow-hidden cursor-pointer font-bold">
            {user.username}
          </p>
        </a>
      </Link>
    );
  };

  /* Send friend request */
  const sendFriendRequest = async (user: User) => {
    const res = await backend.request(`/api/users/${currentUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pendingFriendsSent: [...pendingFriendsSent, { id: user.id }],
      }),
    });

    const data = await res.json();

    if (res.status === 200) {
      setPendingFriendsSent(data.pendingFriendsSent);
      setSuggested(
        suggested.filter((suggestion) => {
          return suggestion.id !== user.id;
        })
      );
    } else {
      setAlert({
        type: "error",
        content: data.message,
      });
    }
  };

  /* Accept / decline friend request */
  const acceptFriendRequest = async (user: User) => {
    const res = await backend.request(
      `/api/users/${currentUser.id}/${user.id}/addFriend`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();

    if (res.status === 200) {
      setPendingFriendsReceived(data.pendingFriendsReceived);
      setFriends(data.friends);

      if (user.duoquadra_login) {
        setFriends42([...friends42, user]);
      }
      setSuggested(
        suggested.filter((suggestion) => {
          return suggestion.id !== user.id;
        })
      );
    } else {
      setAlert({
        type: "error",
        content: data.message,
      });
    }
  };

  const declineFriendRequest = async (user: User) => {
    const res = await backend.request(
      `/api/users/${currentUser.id}/${user.id}/rmRequest`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();

    if (res.status === 200) {
      setPendingFriendsReceived(data.pendingFriendsReceived);
      setSuggested([...suggested, user]);
    } else {
      setAlert({
        type: "error",
        content: data.message,
      });
    }
  };

  const removeFriend = async (user: User) => {
    const res = await backend.request(
      `/api/users/${currentUser.id}/${user.id}/rmFriend`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();

    if (res.status === 200) {
      setFriends(data.friends);

      if (user.duoquadra_login) {
        setFriends42(
          friends42.filter((friend) => {
            return friend.id !== user.id;
          })
        );
      }
    } else {
      setAlert({
        type: "error",
        content: data.message,
      });
    }
  };

  /* Block / Unblock */
  const blockUser = async (user: User) => {
    const res = await backend.request(`/api/users/${currentUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blockedUsers: [...blocked, { id: user.id }],
      }),
    });

    const data = await res.json();

    if (res.status === 200) {
      setBlocked(data.blockedUsers);
      setSuggested(
        suggested.filter((suggestion) => {
          return suggestion.id !== user.id;
        })
      );
      setFriends(
        friends.filter((friend) => {
          return friend.id !== user.id;
        })
      );
      if (user.duoquadra_login) {
        setFriends42(
          friends42.filter((friend) => {
            return friend.id !== user.id;
          })
        );
      }
    } else {
      setAlert({
        type: "error",
        content: "Unblocking failed.",
      });
    }
  };

  const unblockUser = async (user: User) => {
    const filteredUsers = blocked.filter((blockedUser) => {
      return blockedUser.id !== user.id;
    });
    const res = await backend.request(`/api/users/${currentUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blockedUsers: filteredUsers,
      }),
    });
    const data = await res.json();

    if (res.status === 200) {
      setBlocked(data.blockedUsers);
      setFriends([...friends, user]);

      if (user.duoquadra_login) {
        setFriends42([...friends42, user]);
      }
      setSuggested([...suggested, user]);
    } else {
      setAlert({
        type: "error",
        content: `Error while unblocking ${user.username}`,
      });
    }
  };

  /* Icons for sending invites, add/remove friend, block and so forth */
  const getActionButtons = (user: User, category: string) => {
    if (category === "sent") {
      return (
        <small className="text-pink-500">
          didn&apos;t accept the request yet
        </small>
      );
    }
    if (category === "blocked") {
      return (
        <div className="relative md:absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-6">
          <Tooltip className={actionTooltipStyles} content="Unblock">
            <button
              className="p-2 text-2xl bg-pink-200 text-pink-700 rounded-full"
              onClick={() => {
                unblockUser(user);
              }}
            >
              <LockOpenIcon className="h-6 w-6" />
            </button>
          </Tooltip>
        </div>
      );
    } else if (category === "pending") {
      return (
        <div className="relative md:absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-6">
          <Tooltip className={actionTooltipStyles} content="Add friend">
            <button
              className="p-2 text-2xl bg-green-200 text-green-700 rounded-full"
              onClick={() => {
                acceptFriendRequest(user);
              }}
            >
              <CheckIcon className="h-6 w-6" />
            </button>
          </Tooltip>

          <Tooltip className={actionTooltipStyles} content="Decline invite">
            <button
              className="p-2 text-2xl bg-red-200 text-red-700 rounded-full"
              onClick={() => {
                declineFriendRequest(user);
              }}
            >
              <XIcon className="h-6 w-6" />
            </button>
          </Tooltip>
        </div>
      );
    }

    return (
      <div className="relative md:absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-6">
        {category === "friends" && (
          <Tooltip className={actionTooltipStyles} content="Remove friend">
            <button
              className="p-2 text-2xl bg-pink-200 text-pink-700 rounded-full"
              onClick={() => {
                removeFriend(user);
              }}
            >
              <UserRemoveIcon className="h-6 w-6" />
            </button>
          </Tooltip>
        )}

        {category === "suggested" && (
          <Tooltip className={actionTooltipStyles} content="Send friend invite">
            <button
              className="p-2 text-2xl bg-pink-200 text-pink-700 rounded-full"
              onClick={() => {
                sendFriendRequest(user);
              }}
            >
              <UserAddIcon className="h-6 w-6" />
            </button>
          </Tooltip>
        )}

        <Tooltip className={actionTooltipStyles} content="Block">
          <button
            className="p-2 text-2xl bg-neutral-400 text-neutral-900 rounded-full"
            onClick={() => {
              blockUser(user);
            }}
          >
            <LockClosedIcon className="h-6 w-6" />
          </button>
        </Tooltip>
      </div>
    );
  };

  if (list.length > 0) {
    return (
      <ul className={gridStyle}>
        <ResponsiveFade
          useMediaQueryArg={{ query: "(min-width: 1280px)" }}
          cascade
          triggerOnce
          duration={500}
        >
          {list.map((user) => (
            <li key={user.id} className={userCardStyle}>
              {getUserCard(user)}
              {getActionButtons(user, category)}
            </li>
          ))}
        </ResponsiveFade>
      </ul>
    );
  } else {
    /* List is empty */
    const headline =
      category === "suggested" ? "No suggestion" : "Nothing here";
    const redirToSuggestion =
      category !== "suggested" && category !== "blocked";

    return (
      <div className="text-center pt-14">
        <h1 className="m-5 uppercase text-7xl text-gray-700 tracking-widest">
          {headline}
        </h1>
        {redirToSuggestion && (
          <>
            <h3 className="m-3 text-gray-500 text-2xl tracking-widest">
              Have a look at recommandations
            </h3>
            <button
              className="m-5"
              onClick={() => {
                setSelected(4);
              }}
            >
              <IoIosArrowForward className="text-pink-500 text-2xl hover:animate-bounceForward hover:cursor-pointer" />
            </button>
          </>
        )}
        {category === "suggested" && (
          <h3 className="m-3 text-gray-500 text-2xl tracking-widest">
            Go outside IRL make friends ;)
          </h3>
        )}
      </div>
    );
  }
};

export default FriendsTable;
