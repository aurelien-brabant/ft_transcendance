import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { FaEquals } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { GiFalling, GiPodiumWinner } from "react-icons/gi";
import { RiPingPongLine, RiMessage2Line, RiUserSettingsLine } from "react-icons/ri";
import { ActiveUser, Game } from "transcendance-types";
import { NextPageWithLayout } from "../_app";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";
import Achievements from "../../components/Achievements";
import Selector from "../../components/Selector";
import Tooltip from "../../components/Tooltip";
import { UserStatusItem } from "../../components/UserStatus";
import withDashboardLayout from "../../components/hoc/withDashboardLayout";
import { useSession } from "../../hooks/use-session";
import { classNames } from "../../utils/class-names";

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
};

const convertDuration = (durationInMs: number) => {
  const minutes = Math.floor(durationInMs / 60000);
  const seconds = ((durationInMs % 60000) / 1000).toFixed(0);

  return `${minutes} mn ${(parseInt(seconds) < 10 ? "0" : "")}${seconds} sec`;
}

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
        <span className="text-red-400">{game.opponentScore}</span>
        -
        <span className="text-green-400">{game.userScore}</span>
      </div>
    );
  }

  return (
    <div className="text-lg flex gap-x-2">
      <span className="text-green-400">{game.opponentScore}</span>
      -
      <span className="text-red-400">{game.userScore}</span>
    </div>
  );
};

const getResultIcon = (game: PastGame) => {
  if (game.isDraw) {
    return (
      <FaEquals className="text-gray-400" />
    );
  }
  if (game.userIsWinner) {
    return (
      <GiPodiumWinner className="text-green-400" />
    );
  }
  return (
    <GiFalling className="text-red-400" />
  );
};

const HistoryTable: React.FC<{ history: PastGame[] }> = ({
  history,
}) => (
  <table className="w-full my-4 text-left">
    <thead>
      <tr className="text-pink-600 bg-01dp">
        <th className="p-3 uppercase">Opponent</th>
        <th className="p-3 uppercase">Duration</th>
        <th className="p-3 uppercase">Score</th>
        <th className="p-3 uppercase">Result</th>
        <th className="p-3 uppercase">Date</th>
      </tr>
    </thead>
    <tbody>
      {history.map((game, index) => (
        <tr
          key={game.id}
          className={`py-6 ${index % 2 ? "bg-02dp" : "bg-03dp"}`}
        >
          <td className="p-3 font-bold">
            <Link href={`/users/${game.opponentId}`} >
              <a>{game.opponentUsername}</a>
            </Link>
          </td>
          <td className="p-3 text-neutral-200">
            {`${convertDuration(game.duration)}`}
          </td>
          <td className="p-3">
            {renderScore(game)}
          </td>
          <td className="p-3 text-3xl">
            {getResultIcon(game)}
          </td>
          <td className="p-3">
            {new Date(game.date).toLocaleDateString()}
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
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const query = router.query;

    if (query.id) {
      setUserId(query.id.toString());
    }
  }, [router.query]);

  const { user } = useSession();
  const actionTooltipStyles = "font-bold bg-gray-900 text-neutral-200";
  const { setAlert } = useContext(alertContext) as AlertContextType;
  const { socket: chatSocket, createDirectMessage } = useContext(chatContext) as ChatContextType;
  const [gamesHistory, setGamesHistory] = useState<PastGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alreadyFriend, setAlreadyFriend] = useState(false);
  const [selected, setSelected] = useState(0);
  const [rank, setRank] = useState("-");
  const [userData, setUserData] = useState<ActiveUser>(user);

  /* Send DM to user */
  const handleMessageToUser = async () => {
    const from: string = user.id;
    const to: string = userData.id;

    if (from !== to) {
      createDirectMessage(from, to);
    }
  };

  /* Send Pong invite */
  const sendPongInvite = (userId: string) => {
    console.log(`[users/:id] Invite user [${userId}] to play Pong`);
    chatSocket.emit("sendPongInvite", {
      from: user.id,
      to: parseInt(userId),
    });
  };

  /* Send friendship invite */
  const requestFriend = async (id: string, username: string) => {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pendingFriendsSent: [ { "id": id } ]
      }),
    });

    if (res.ok) {
      setAlreadyFriend(true);
      setAlert({ type: "info", content: `Friend request sent to ${username}` });
    } else
      setAlert({
        type: "error",
        content: `Error while sending friend request to ${username}`,
      });
  };

  /* Update user's information */
  const updateGamesHistory = async (games: Game[], userId: string) => {
    const gameHistory: PastGame[] = [];

    /* Sorts from most recent */
    games.sort(
      (a: Game, b: Game) =>
      ((new Date(b.endedAt)).valueOf() - (new Date(a.endedAt)).valueOf())
    );

    for (var game of games) {
      const opponentId = (game.winnerId === parseInt(userId)) ? game.loserId : game.winnerId;
      const userIsWinner = (game.winnerId === parseInt(userId));
      const res = await fetch(`/api/users/${opponentId}`);
      const data = await res.json();

      gameHistory.push({
        id: gameHistory.length.toString(),
        date: new Date(game.createdAt),
        duration: game.gameDuration,
        isDraw: (game.winnerScore === game.loserScore),
        userIsWinner,
        opponentId,
        opponentUsername: data.username,
        opponentScore: !userIsWinner ? game.winnerScore : game.loserScore,
        userScore: userIsWinner ? game.winnerScore : game.loserScore,
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

  const alreadyFriendOrAsked = (
    pending: ActiveUser[],
    friends: ActiveUser[]
  ) => {
    for (let i in pending) {
      if (pending[i].id === userId) return true;
    }
    for (let i in friends) {
      if (friends[i].id === userId) return true;
    }

    return false;
  };

  useEffect(() => {
    if (!userId || !user) return;

    const fetchData = async () => {
      /* search by username */
      const res = await fetch(`/api/users/${userId}`);

      if (!res.ok) {
        router.push('/404');
        return ;
      }

      const matchingUser: any = await res.json();
      const gamesData: Game[] = JSON.parse(JSON.stringify(matchingUser)).games;

      updateUserData(matchingUser);
      updateGamesHistory(gamesData, userId);

      /* Didn't play yet */
      if (!matchingUser.wins && !matchingUser.losses && !matchingUser.draws) {
        setRank("-");
      } else { /* Else set rank */
        const reqRank = await fetch(`/api/users/${userId}/rank`);
        const res = await reqRank.json();
        setRank(res);
      }

      const already = alreadyFriendOrAsked(
        user.pendingFriendsSent,
        user.friends
      );

      setAlreadyFriend(already);
      setIsLoading(false);
    };

    fetchData().catch(console.error);
  }, [userId, user]);

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
            <div className={classNames("animate-pulse h-10 w-full", index % 2 ? 'bg-03dp' : 'bg-04dp')} />
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
                      <RiUserSettingsLine
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
                      className="p-2 text-2xl text-gray-900 bg-pink-200 text-pink-700 rounded-full transition hover:scale-105"
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
                      <RiMessage2Line />
                    </button>
                  </Tooltip>

                  <Tooltip
                    className={actionTooltipStyles}
                    content="Add as friend"
                  >
                    <button
                      className={`${
                        alreadyFriend
                          ? "cursor-normal opacity-80"
                          : "cursor-pointer"
                      } p-2 text-2xl bg-pink-200 text-pink-700 rounded-full transition hover:scale-105`}
                    >
                      {alreadyFriend ? (
                        <IoMdPersonAdd
                          onClick={() =>
                            setAlert({
                              type: "warning",
                              content: `You already asked to ${userData.username}`,
                            })
                          }
                        />
                      ) : (
                        <IoMdPersonAdd
                          onClick={() =>
                            requestFriend(String(userId), userData.username)
                          }
                        />
                      )}
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-2xl uppercase text-pink-600 font-extrabold">
                {userData.username}
              </h1>
              <UserStatusItem
                className={"mt-2"}
                id={userData.id}
              />
            </div>
            <div className="w-full p-5 bg-01dp border-2 border-02dp rounded drop-shadow-md grid lg:grid-cols-3">
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
                nColor="text-green-300"
              />
              <HighlightItem
                n={userData.ratio}
                label="Ratio"
                hint="Wins divided by looses"
                nColor="text-blue-500"
              />
            </div>
            <Selector
              selected={selected}
              setSelected={setSelected}
              items={[
                {
                  label: "Games history",
                  component: (
                    <HistoryTable history={gamesHistory} />
                  ),
                },
                {
                  label: "Achievements",
                  component: <Achievements />,
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
