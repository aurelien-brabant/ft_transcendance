import Link from "next/link";
import Image from 'next/image';
import { Fragment, useContext, useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import { FaEquals } from "react-icons/fa";
import { IoMdPersonAdd } from 'react-icons/io';
import { GiFalling, GiPodiumWinner } from "react-icons/gi";
import { RiPingPongLine, RiMessage2Line } from 'react-icons/ri';
import { NextPageWithLayout } from "../_app";
import authContext, { AuthContextType } from "../../context/auth/authContext";
// import PreventSSR from "../../components/PreventSSR";
import Selector from "../../components/Selector";
import Tooltip from "../../components/Tooltip";
import { UserStatusItem } from "../../components/UserStatus";
import withDashboardLayout from "../../components/hoc/withDashboardLayout";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";

export type GameSummary = {
  winnerScore: number;
  looserScore: number;
  createdAt: string;
  endedAt: string;
  id: string;
  winnerId: number;
  looserId: number;
  opponent: string;
};

type CurrentUser = {
  username: string;
  avatar: string;
  losses: number;
  wins: number;
  ratio: number | string;
  id: number;
  accountDeactivated: boolean;
};

const renderScore = (score: [number, number]) => {
  const getColor = (n1: number, n2: number) =>
    (n1 === n2) ? "text-gray-400" :
        (n1 < n2) ? "text-red-400" : "text-green-400";
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
  const seconds = Math.floor(diff - (minutes * 60));

  return (`${minutes}` + ' min ' + (seconds < 10 ? '0' : '') + `${seconds} sec`);
}

const HistoryTable: React.FC<{ history: GameSummary[], userId: number }> = ({
  history,
  userId
}) => (

  <table
    className="w-full my-4 text-left"
  >
    <thead>
      <tr className="text-pink-600 bg-gray-800">
        <th className="p-3 uppercase">Opponent</th>
        <th className="p-3 uppercase">Duration</th>
        <th className="p-3 uppercase">Score</th>
        <th className="p-3 uppercase">Result</th>
        <th className="p-3 uppercase">Date</th>
      </tr>
    </thead>
    <tbody>
      {/* NOTE: OBVIOUSLY we won't sort on the client side this is only for simulation purpose */}
      {history
        .sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime())
        .map((game, index) => (
          <tr
            key={game.id}
            className={`py-6 ${index % 2 ? "bg-gray-800" : "bg-gray-700"}`}
          >
            <td className="p-3 font-bold">
              <Link href={`/users/${game.winnerId === userId ? game.looserId : game.winnerId}`}>
                <a>{game.opponent}</a>
              </Link>
            </td>
            <td className="p-3 text-neutral-200">
              {`${getDuration(parseInt(game.createdAt), parseInt(game.endedAt))}`}
            </td>
            <td className="p-3">
              {game.winnerId === userId ?
                renderScore([game.winnerScore, game.looserScore])
                :
                renderScore([game.looserScore, game.winnerScore])
              }
            </td>
            <td className="p-3 text-3xl">
              {(game.winnerScore === game.looserScore) ? <FaEquals className="text-gray-400" />
                  : (game.winnerId === userId) ?
                      <GiPodiumWinner className="text-green-400" />
                      :
                      <GiFalling className="text-red-400" />
              }
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

  const actionTooltipStyles = 'font-bold bg-gray-900 text-neutral-200';
  const { getUserData } = useContext(authContext) as AuthContextType;
  const [gamesHistory, setGamesHistory] = useState([]);
  const url: string = window.location.href;
  const userId: number = parseInt(url.substring(url.lastIndexOf('/') + 1));
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const [rank, setRank] = useState("-");
  const [userData, setUserData] = useState<CurrentUser>(
    {
      id: getUserData().id,
      username: getUserData().username,
      avatar: getUserData().pic,
      losses: getUserData().losses,
      wins: getUserData().wins,
      accountDeactivated: getUserData().accountDeactivated,
      ratio: (!getUserData().wins && !getUserData().losses) ? "-" : getUserData().ratio,
    }
  );

  const updateGamesHistory = async (games: any) => {
    for (var i in games) {
      const opponentId = (games[i].winnerId === userId) ? games[i].looserId : games[i].winnerId;
      const req = await fetch (`/api/users/${opponentId}`)
      const res = await req.json();
      games[i].opponent = res.username;
    }
    setGamesHistory(games);
  }

  const updateUserData = async (data: any) => {
    setUserData({
      id: data.id,
      username: data.username,
      avatar: !data.pic ? "" : data.pic.startsWith("https://") ? data.pic : `/api/users/${data.id}/photo`,
      losses: data.losses,
      wins: data.wins,
      accountDeactivated: data.accountDeactivated,
      ratio: (!data.wins && !data.losses) ? "-" : data.ratio,
    });
  }

  useEffect(() => {
    const fetchData = async () => {

      const req = await fetch(`/api/users/${userId}`);
      const data = await req.json();

      updateUserData(data);
      updateGamesHistory(JSON.parse(JSON.stringify(data)).games);

      const reqRank = await fetch(`/api/users/${userId}/rank`);
      const res = await reqRank.json();
      setRank(res);
      setIsLoading(false);
    }

    fetchData()
    .catch(console.error);
  }, [userId])
  const { setChatView, openChat } = useContext(chatContext) as ChatContextType;

  const handleMessage = () => {
    setChatView('dm', 'direct message', { targetUsername: userData.username });
    openChat();
  }

  return (
    <div className="min-h-screen overflow-x-auto text-white bg-fixed bg-center bg-fill grow" style={{
      backgroundImage: "url('/triangles.png')"
    }}>
      { !isLoading ?
      <div style={{ maxWidth: "800px" }} className="px-2 py-16 mx-auto">
        <div className="flex flex-col items-center gap-y-10">
          <div className="relative w-48 h-48">
            <img
              className="object-cover object-center w-full h-full rounded drop-shadow-md"
              src={userData.avatar} />

            {/* actions */}
            {(userData.id === getUserData().id || userData.accountDeactivated) ?
            <></>
            :
            <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
              <Tooltip className={actionTooltipStyles} content="challenge">
                <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                  <RiPingPongLine />
                </button>
              </Tooltip>

              <Tooltip className={actionTooltipStyles} content="message">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105"
                onClick={handleMessage}
              >
                <RiMessage2Line />
              </button>
              </Tooltip>

              <Tooltip className={actionTooltipStyles} content="Add as friend">
                <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                  <IoMdPersonAdd className="text-black" />
                </button>
              </Tooltip>
            </div>
            }
            
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl text-pink-600">{userData.username}</h1>
            <UserStatusItem status={(userData.accountDeactivated) ? "deactivated" : "online"}/>
          </div>
          <div className="w-full p-5 bg-gray-800 border-2 border-gray-800 rounded drop-shadow-md grid lg:grid-cols-3">
            <HighlightItem
              n={rank}
              label="Ranking"
              hint="Place in the global ranking"
              nColor="text-orange-500" />
            <HighlightItem
              n={userData.wins}
              label="TOTAL WINS"
              hint="Number of wins"
              nColor="text-green-300" />
            <HighlightItem
              n={userData.ratio}
              label="Ratio"
              hint="Wins divided by looses"
              nColor="text-blue-500" />
          </div>
          <Selector selected={selected} setSelected={setSelected}
            items={[
              {
                label: "Games history",
                component: <HistoryTable history={gamesHistory} userId={userData.id} />,
              },
              {
                label: "Last achievements",
                component: (
                  <div className="flex flex-col items-center justify-center mt-8">
                    <h3 className="text-2xl text-gray-600">Achievements are coming soon...</h3>
                  </div>
                ),
              },
            ]} />
        </div>
      </div>
      :
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 gap-y-4">
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <Image src="/logo.svg" height="200" width="200" />
        </div>
        <BounceLoader size={400} color="#db2777" />
      </div>
      }
    </div>
  );
}

UserProfilePage.getLayout = withDashboardLayout;

export default UserProfilePage;