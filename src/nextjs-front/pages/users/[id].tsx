//import { GetServerSideProps, NextPage } from "next";
import { UserStatusItem } from "../../components/UserStatus";
import withDashboardLayout from "../../components/hoc/withDashboardLayout";
import { NextPageWithLayout } from "../_app";
import Selector from "../../components/Selector";
import Link from "next/link";
import { Fragment, useContext, useEffect, useState } from "react";
import { RiPingPongLine, RiMessage2Line } from 'react-icons/ri';
import { IoMdPersonAdd } from 'react-icons/io';
import Tooltip from "../../components/Tooltip";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import { GiFalling, GiPodiumWinner } from "react-icons/gi";
import { FaEquals } from "react-icons/fa";

/*export const getServerSideProps: GetServerSideProps = async function (context) {
  return {
    props: {
      user: getUserData(),
    },
  };
};
*/

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
  rank: number;
  losses: number;
  wins: number;
  ratio: number | string;
  id: number;
};

//type UserProfilePageProps = {
//user: CurrentUser;
//};


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
        .map((unranked, index) => (
          <tr
            key={unranked.id}
            className={`py-6 ${index % 2 ? "bg-gray-800" : "bg-gray-700"}`}
          >
            <td className="p-3 font-bold">
              <Link href={`/users/${unranked.winnerId === userId ? unranked.looserId : unranked.winnerId}`}>
                <a>{unranked.opponent}</a>
              </Link>
            </td>
            <td className="p-3 text-neutral-200">
              {`${getDuration(parseInt(unranked.createdAt), parseInt(unranked.endedAt))}`}
            </td>
            <td className="p-3">
              {unranked.winnerId === userId ?
                renderScore([unranked.winnerScore, unranked.looserScore])
                :
                renderScore([unranked.looserScore, unranked.winnerScore])
              }
            </td>
            <td className="p-3 text-3xl">
              {(unranked.winnerScore === unranked.looserScore) ? <FaEquals className="text-gray-400" />
                  : (unranked.winnerId === userId) ?
                      <GiPodiumWinner className="text-green-400" />
                      :
                      <GiFalling className="text-red-400" />
              }
            </td>
            <td className="p-3">
              {new Date(parseInt(unranked.endedAt)).toLocaleDateString()}
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


const UserProfilePage: NextPageWithLayout = ({//<UserProfilePageProps> = ({
  //  user,
}) => {
  const actionTooltipStyles = 'font-bold bg-gray-900 text-neutral-200';
  const { getUserData } = useContext(authContext) as AuthContextType;
  const [gamesHistory, setGamesHistory] = useState([]);
  const [userData] = useState<CurrentUser>(
    {
      id: getUserData().id,
      username: getUserData().username,
      avatar: getUserData().pic,
      rank: getUserData().rank ? getUserData().rank : "-",
      losses: getUserData().losses,
      wins: getUserData().wins,
      ratio: (String(getUserData().wins / getUserData().losses) === 'NaN') ? "-" : (getUserData().wins / getUserData().losses),
    }
  );

  const updateGamesHistory = async (games: any) => {
    for (var i in games) {
      const id = (games[i].winnerId === getUserData().id) ? games[i].looserId : games[i].winnerId;
      const req = await fetch (`/api/users/${id}`)
      const res = await req.json();
      games[i].opponent = res.username;
    }
    setGamesHistory(games);
  }

  useEffect(() => {
    const fetchData = async () => {
      const req = await fetch(`/api/users/${getUserData().id}`);
      const data = await req.json();
      updateGamesHistory(JSON.parse(JSON.stringify(data)).games)
    }
  
    fetchData()
    .catch(console.error);
  }, [])

  return (
    <div className="min-h-screen overflow-x-auto text-white bg-fixed bg-center bg-fill grow" style={{
      backgroundImage: "url('/triangles.png')"
    }}>
      <div style={{ maxWidth: "800px" }} className="px-2 py-16 mx-auto">
        <div className="flex flex-col items-center gap-y-10">
          <div className="relative w-48 h-48">
            <img
              className="object-cover object-center w-full h-full rounded drop-shadow-md"
              src={`/api/users/${getUserData().id}/photo`} />

            {/* actions */}
            <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
              <Tooltip className={actionTooltipStyles} content="challenge">
                <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                  <RiPingPongLine />
                </button>
              </Tooltip>

              <Tooltip className={actionTooltipStyles} content="message">
                <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                  <RiMessage2Line />
                </button>
              </Tooltip>

              <Tooltip className={actionTooltipStyles} content="Add as friend">
                <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                  <IoMdPersonAdd className="text-black" />
                </button>
              </Tooltip>
            </div>

          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl text-pink-600">{userData.username}</h1>
            <UserStatusItem status="online" />
          </div>
          <div className="w-full p-5 bg-gray-800 border-2 border-gray-800 rounded drop-shadow-md grid lg:grid-cols-3">
            <HighlightItem
              n={userData.rank}
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
          <Selector
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
    </div>
  );
}

UserProfilePage.getLayout = withDashboardLayout;

export default UserProfilePage;