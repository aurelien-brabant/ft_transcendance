import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { FaEquals } from "react-icons/fa";
import { GiAlarmClock, GiFalling, GiPingPongBat, GiPodiumWinner } from "react-icons/gi";
import { RiPingPongLine } from "react-icons/ri";
import { ChatIcon, CogIcon, UserAddIcon } from "@heroicons/react/outline";
import { ActiveUser } from "transcendance-types";
import { NextPageWithLayout } from "../_app";
import alertContext, {
  AlertContextType,
} from "../../context/alert/alertContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";
import Achievements from "../../components/Achievements";
import Selector from "../../components/Selector";
import Tooltip from "../../components/Tooltip";
import { UserStatusItem } from "../../components/UserStatus";
import withDashboardLayout from "../../components/hoc/withDashboardLayout";
import { useSession } from "../../hooks/use-session";
import { classNames } from "../../utils/class-names";
import { Game } from "../../transcendance-types";
import { GameMode } from "../../gameObjects/GameObject";

/**
 * Game history
 */

type PastGame = {
  id: string;
  date: Date;
  duration: number;
  isDraw: boolean;
  userIsWinner: boolean;
  opponentId: number;
  opponentUsername: string;
  opponentScore: number;
  userScore: number;
  mode: GameMode;
};

const convertDuration = (durationInMs: number) => {
  const minutes = Math.floor(durationInMs / 60000);
  const seconds = ((durationInMs % 60000) / 1000).toFixed(0);

  return `${minutes} mn ${parseInt(seconds) < 10 ? "0" : ""}${seconds} sec`;
};

const renderScore = (game: PastGame) => {
  if (game.isDraw) {
    return (
      <div className="text-lg flex gap-x-2">
        <span className="text-gray-400">{game.opponentScore}</span>
        <span className="text-gray-400">{game.userScore}</span>
      </div>
    );
  }
  if (game.userIsWinner) {
    return (
      <div className="text-lg flex gap-x-2">
        <span className="text-red-400">{game.opponentScore}</span>-
        <span className="text-green-400">{game.userScore}</span>
      </div>
    );
  }

  return (
    <div className="text-lg flex gap-x-2">
      <span className="text-green-400">{game.opponentScore}</span>-
      <span className="text-red-400">{game.userScore}</span>
    </div>
  );
};

const getResultIcon = (game: PastGame) => {
  if (game.isDraw) {
    return <FaEquals className="text-gray-400" />;
  }
  if (game.userIsWinner) {
    return <GiPodiumWinner className="text-green-400" />;
  }
  return <GiFalling className="text-red-400" />;
};

const HistoryTable: React.FC<{ history: PastGame[] }> = ({ history }) => (
  <table className="w-full my-4 text-left">
    <thead>
      <tr className="text-pink-600 bg-01dp">
        <th className="p-3 uppercase">Opponent</th>
        <th className="p-3 uppercase">Duration</th>
        <th className="p-3 uppercase">Score</th>
        <th className="p-3 uppercase">Result</th>
        <th className="p-3 uppercase">Date</th>
        <th className="p-3 uppercase">Mode</th>
      </tr>
    </thead>
    <tbody>
      {history.map((game, index) => (
        <tr
          key={game.id}
          className={`py-6 ${index % 2 ? "bg-02dp" : "bg-03dp"}`}
        >
          <td className="p-3 font-bold">
            <Link href={`/users/${game.opponentUsername}`}>
              <a>{game.opponentUsername}</a>
            </Link>
          </td>
          <td className="p-3 text-neutral-200">
            {`${convertDuration(game.duration)}`}
          </td>
          <td className="p-3">{renderScore(game)}</td>
          <td className="p-3 text-3xl">{getResultIcon(game)}</td>
          <td className="p-3">{new Date(game.date).toLocaleDateString()}</td>
          <td className="p-3 text-3xl">
            {game.mode === GameMode.DEFAULT ? (
              <GiPingPongBat className="text-blue-400" />
            ) : (
              <GiAlarmClock className="text-blue-400" />
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export type Highlight = {
  n: number | string;
  label: string;
  hint: string;
  nColor: string;
};

const HighlightItem: React.FC<Highlight> = ({ n, label, hint, nColor }) => (
  <article className="flex flex-col items-center gap-y-2">
    <h3 className={`text-5xl font-bold ${nColor}`}>{n}</h3>
    <h4 className="text-3xl uppercase text-neutral-200">{label}</h4>
    <small>{hint}</small>
  </article>
);

const UserProfilePage: NextPageWithLayout = ({}) => {
  const router = useRouter();
  const { asPath } = useRouter();
  const [profileUsername, setProfileUsername] = useState<string>();

  useEffect(() => {
    const query = router.query;

    if (query.id) {
      setProfileUsername(query.id.toString());
    }
  }, [router.query]);

  const { user, backend } = useSession();
  const actionTooltipStyles = "font-bold bg-dark text-neutral-200";
  const { setAlert } = useContext(alertContext) as AlertContextType;
  const {
    socket: chatSocket,
    closeChat,
    createDirectMessage
  } = useContext( chatContext ) as ChatContextType;
  const {
    friends,
    suggested,
    setSuggested,
    pendingFriendsSent,
    setPendingFriendsSent,
    getRelationshipsData
  } = useContext(relationshipContext) as RelationshipContextType;
  const [gamesHistory, setGamesHistory] = useState<PastGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const [rank, setRank] = useState("-");
  const [userData, setUserData] = useState<ActiveUser>(user);
  const [alreadyFriend, setAlreadyFriend] = useState(false);
  const [alreadyInvited, setAlreadyInvited] = useState(false);

  /* Send DM to user */
  const handleMessageToUser = async () => {
    const from: string = user.id;
    const to: string = userData.id;

    if (from !== to) {
      createDirectMessage(from, to);
    }
  };

  /* Send Pong invite */
  const sendPongInvite = async (userId: string) => {
    chatSocket.emit("sendPongInvite", {
      senderId: user.id,
      receiverId: parseInt(userId),
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

  /* Send friendship invite */
  const requestFriend = async (userId: string) => {
    if (alreadyInvited) return ;

    const res = await backend.request(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pendingFriendsSent: [...pendingFriendsSent, { id: userId }],
      }),
    });

    const data = await res.json();

    if (res.status === 200) {
      setAlreadyInvited(true);
      setAlert({
        type: "info",
        content: "Friend request sent"
      });
      setPendingFriendsSent(data.pendingFriendsSent);
      setSuggested(
        suggested.filter((suggestion) => {
          return suggestion.id !== userId;
        })
      );
    } else {
      setAlert({
        type: "error",
        content: data.message,
      });
    }
  };

  /* Update user's information */
  const updateGamesHistory = async (games: Game[], userId: string) => {
    const gameHistory: PastGame[] = [];

    /* Sorts from most recent */
    games.sort(
      (a: Game, b: Game) =>
      ((new Date(b.endedAt)).getTime() - (new Date(a.endedAt)).getTime())
    );

    for (const game of games) {
      const opponentId =
        game.winnerId === parseInt(userId) ? game.loserId : game.winnerId;
      const userIsWinner = game.winnerId === parseInt(userId);
      const res = await fetch(`/api/users/${opponentId}`);
      const data = await res.json();

      gameHistory.push({
        id: gameHistory.length.toString(),
        date: new Date(game.createdAt),
        duration: game.gameDuration,
        isDraw: false, // used in Leaderboard
        userIsWinner,
        opponentId,
        opponentUsername: data.username,
        opponentScore: !userIsWinner ? game.winnerScore : game.loserScore,
        userScore: userIsWinner ? game.winnerScore : game.loserScore,
        mode: game.mode,
      });
    }
    setGamesHistory(gameHistory);
  };

  const updateUserData = async (data: any) => {
    setUserData({
      id: data.id,
      username: data.username,
      pic: !data.pic
        ? ""
        : data.pic.startsWith("https://")
        ? data.pic
        : `/api/users/${data.id}/photo`,
      accountDeactivated: data.accountDeactivated,
      games: data.games,
      wins: data.wins,
      losses: data.losses,
      draws: data.draws,
      ratio: !data.wins && !data.losses && !data.draws ? "-" : data.ratio,
      achievements: data.achievements,
      friends: data.friends,
      blockedUsers: data.blockedUsers,
      pendingFriendsSent: data.pendingFriendsSent,
      pendingFriendsReceived: data.pendingFriendsReceived,
    });
  };

  useEffect(() => {
    if (!profileUsername || !user) return;

    const fetchData = async () => {
      /* search by username */
      const res = await fetch(`/api/users/${profileUsername}`);

      if (!res.ok) {
        router.push("/404");
        return;
      }

      const matchingUser: any = await res.json();
      const gamesData: Game[] = JSON.parse(JSON.stringify(matchingUser)).games;

      await updateUserData(matchingUser);
      await updateGamesHistory(gamesData, matchingUser.id);

      /* Didn't play yet */
      if (!matchingUser.wins && !matchingUser.losses && !matchingUser.draws) {
        setRank("-");
      } else {
        /* Else set rank */
        const reqRank = await fetch(`/api/users/${profileUsername}/rank`);
        const res = await reqRank.json();
        setRank(res);
      }

      await getRelationshipsData();

      setAlreadyFriend(!!friends.find((friend) => {
        return friend.id === matchingUser.id;
      }));
      setAlreadyInvited(!!pendingFriendsSent.find((pending) => {
        return pending.id === matchingUser.id;
      }));
      setIsLoading(false);
    };

    fetchData().catch(console.error);
  }, [profileUsername, user]);

  useEffect(() => {
    if (!chatSocket) {
      return ;
    }
    /* Listeners */
    chatSocket.on("launchInviteGame", goToHub);

    return () => {
      if (chatSocket) {
        chatSocket.off("launchInviteGame", goToHub);
      }
    };
  }, []);

  const Skeleton = () => (
    <div style={{ maxWidth: "800px" }} className="px-2 py-16 mx-auto">
      <div className="flex flex-col items-center gap-y-10">
        <div className="relative w-48 h-48 rounded-full bg-04dp animate-pulse" />
        <div className="flex flex-col items-center">
          <div className={"bg-04dp w-48 h-6 rounded animate-pulse"} />
          <div className={"flex items-center animate-pulse gap-x-2 mt-6"}>
            <span className={"w-4 h-4 flex-shrink-0 rounded-full bg-04dp"} />
            <div className={"bg-04dp w-24 h-4 rounded"} />
          </div>
        </div>
        <div className="w-full h-32 bg-04dp animate-pulse rounded" />
        <div className={"mt-8 w-full"}>
          {Array.from({ length: 10 }, (_, index) => (
            <div
              className={classNames(
                "animate-pulse h-10 w-full",
                index % 2 ? "bg-03dp" : "bg-04dp"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-auto text-white bg-fixed bg-center bg-fill grow">
      {!isLoading ? (
        <div style={{ maxWidth: "800px" }} className="px-2 py-16 mx-auto">
          <div className="flex flex-col items-center gap-y-10">
            <div className="relative w-48 h-48 ">
              <img
                className="object-cover object-center w-full h-full rounded-full ring-pink-500 p-2 ring drop-shadow-md"
                src={userData.pic}
              />

              {/* actions */}
              {userData.accountDeactivated ? (
                <></>
              ) : userData.id === user.id ? (
                <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
                  <Tooltip className={actionTooltipStyles} content="Edit user">
                    <button className="p-2 text-2xl text-white/90 bg-01dp rounded-full transition hover:scale-105">
                      <CogIcon
                        className="h-6 w-6"
                        onClick={() => {
                          router.push("/welcome");
                        }}
                      />
                    </button>
                  </Tooltip>
                </div>
              ) : (
                <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
                  <Tooltip className={actionTooltipStyles} content="challenge">
                    <button
                      className="p-2 text-2xl text-pink-700 bg-pink-200 rounded-full transition hover:scale-105"
                      onClick={() => sendPongInvite(userData.id)}
                    >
                      <RiPingPongLine />
                    </button>
                  </Tooltip>

                  <Tooltip className={actionTooltipStyles} content="message">
                    <button
                      className="p-2 text-pink-700 bg-pink-200 text-2xl rounded-full transition hover:scale-105"
                      onClick={handleMessageToUser}
                    >
                      <ChatIcon className="h-6 w-6"/>
                    </button>
                  </Tooltip>

                  <Tooltip
                    className={actionTooltipStyles}
                    content="Add as friend"
                  >
                    <button
                      className={`${
                        (alreadyFriend || alreadyInvited)
                          ? "cursor-normal opacity-70"
                          : "cursor-pointer"
                      } p-2 text-2xl bg-pink-200 text-pink-700 rounded-full transition hover:scale-105`}
                    >
                      {alreadyFriend ? (
                        <UserAddIcon
                          className="h-6 w-6"
                          onClick={() =>
                            setAlert({
                              type: "warning",
                              content: `You already asked to ${userData.username}`,
                            })
                          }
                        />
                      ) : (
                        <UserAddIcon
                          className="h-6 w-6"
                          onClick={() =>
                            requestFriend(userData.id)
                          }
                        />
                      )}
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-2xl uppercase text-pink-500 font-extrabold">
                {userData.username}
              </h1>
              <UserStatusItem className={"mt-2"} id={userData.id} />
            </div>
            <div className="w-full p-5 bg-01dp grid lg:grid-cols-3">
              <HighlightItem
                n={rank}
                label="Ranking"
                hint="Place in the global ranking"
                nColor="text-orange-500"
              />
              <HighlightItem
                n={userData.wins}
                label="TOTAL WINS"
                hint="Number of wins"
                nColor="text-emerald-500"
              />
              <HighlightItem
                n={userData.ratio}
                label="Ratio"
                hint="Wins divided by total played games"
                nColor="text-blue-500"
              />
            </div>
            <Selector
              selected={selected}
              setSelected={setSelected}
              items={[
                {
                  label: "Games history",
                  component: <HistoryTable history={gamesHistory} />,
                },
                {
                  label: "Achievements",
                  component: <Achievements userId={userData.id} />,
                },
              ]}
            />
          </div>
        </div>
      ) : (
        <Skeleton />
      )}
    </div>
  );
};

UserProfilePage.getLayout = withDashboardLayout;
UserProfilePage.authConfig = true;

export default UserProfilePage;
