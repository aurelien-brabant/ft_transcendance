import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useContext, useEffect, useState } from "react";
import { FaEquals } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { GiFalling, GiPodiumWinner } from "react-icons/gi";
import { RiPingPongLine, RiMessage2Line, RiUserSettingsLine } from "react-icons/ri";
import { ActiveUser } from "transcendance-types";
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

export type GameSummary = {
  id: string;
  winnerScore: number;
  looserScore: number;
  createdAt: string;
  endedAt: string;
  winnerId: string;
  looserId: string;
  opponent: string;
};

const renderScore = (score: [number, number]) => {
  const getColor = (n1: number, n2: number) =>
    n1 === n2 ? "text-gray-400" : n1 < n2 ? "text-red-400" : "text-green-400";
  const spanClassName = "text-lg";

  return (
    <Fragment>
      <span className={`${spanClassName} ${getColor(score[0], score[1])}`}>
        {score[0]}
      </span>
      {" - "}
      <span className={`${spanClassName} ${getColor(score[1], score[0])}`}>
        {score[1]}
      </span>
    </Fragment>
  );
};

const getDuration = (begin: number, end: number) => {
  const diff = end - begin;
  const minutes = Math.floor(diff / 60);
  const seconds = Math.floor(diff - minutes * 60);

  return `${minutes}` + " min " + (seconds < 10 ? "0" : "") + `${seconds} sec`;
};

const HistoryTable: React.FC<{ history: GameSummary[]; userId: string }> = ({
  history,
  userId,
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
            <Link
              href={`/users/${
                game.winnerId === userId ? game.looserId : game.winnerId
              }`}
            >
              <a>{game.opponent}</a>
            </Link>
          </td>
          <td className="p-3 text-neutral-200">
            {`${getDuration(parseInt(game.createdAt), parseInt(game.endedAt))}`}
          </td>
          <td className="p-3">
            {game.winnerId === userId
              ? renderScore([game.winnerScore, game.looserScore])
              : renderScore([game.looserScore, game.winnerScore])}
          </td>
          <td className="p-3 text-3xl">
            {game.winnerScore === game.looserScore ? (
              <FaEquals className="text-gray-400" />
            ) : game.winnerId === userId ? (
              <GiPodiumWinner className="text-green-400" />
            ) : (
              <GiFalling className="text-red-400" />
            )}
          </td>
          <td className="p-3">
            {new Date(parseInt(game.endedAt)).toLocaleDateString()}
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
  const [userId, setUserId] = useState<string | string[]>();

  useEffect(() => {
    const query = router.query;
    setUserId(query.id);
  }, [router.query]);

  const { user } = useSession();
  const actionTooltipStyles = "font-bold bg-gray-900 text-neutral-200";
  const { setAlert } = useContext(alertContext) as AlertContextType;
  const { createDirectMessage } = useContext(
    chatContext
  ) as ChatContextType;
  const [gamesHistory, setGamesHistory] = useState([]);
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

  /* Update user's information */
  const updateGamesHistory = async (games: any) => {
    for (var i in games) {
      const opponentId =
        games[i].winnerId === userId ? games[i].looserId : games[i].winnerId;
      const req = await fetch(`/api/users/${opponentId}`);
      const res = await req.json();
      games[i].opponent = res.username;
    }
    setGamesHistory(games);
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

  /* Send friendship invite */
  const requestFriend = async (id: string, username: string) => {
    const reqSent = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pendingFriendsSent: [ { "id": id } ]
      }),
    });
    const reqReceived = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pendingFriendsReceived: [ { "id": user.id } ]
      }),
    });

    if (reqSent.ok && reqReceived.ok) {
      setAlreadyFriend(true);
      setAlert({ type: "info", content: `Friend request sent to ${username}` });
    } else
      setAlert({
        type: "error",
        content: `Error while sending friend request to ${username}`,
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

      updateUserData(matchingUser);
      updateGamesHistory(JSON.parse(JSON.stringify(matchingUser)).games);
      if (!matchingUser.wins && !matchingUser.losses && !matchingUser.draws) setRank("-");
      else {
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
                    <button className="p-2 text-2xl text-gray-900 bg-pink-200 text-pink-700 rounded-full transition hover:scale-105">
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
                    <HistoryTable history={gamesHistory} userId={userData.id} />
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
