import withDashboardLayout from "../components/hoc/withDashboardLayout";
import { NextPageWithLayout } from "./_app";
import Selector from "../components/Selector";
import Link from "next/link";
import Image from 'next/image';
import { Fragment, useContext, useEffect, useState } from "react";
import authContext, { AuthContextType } from "../context/auth/authContext";
import { GiFalling, GiLaurelsTrophy, GiPodiumSecond, GiPodiumThird, GiPodiumWinner } from "react-icons/gi";
import { FaEquals } from "react-icons/fa";
import { BounceLoader } from "react-spinners";

export type RankingList = {
  winnerScore: number;
  looserScore: number;
  createdAt: string;
  endedAt: string;
  id: string;
  winnerId: number;
  looserId: number;
  opponent: string;
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

const HistoryTable: React.FC<{ history: RankingList[] }> = ({
  history
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
              <Link href={`/users/${unranked.opponent}`}>
                <a>{unranked.opponent}</a>
              </Link>
            </td>
            <td className="p-3 text-neutral-200">
              {`${getDuration(parseInt(unranked.createdAt), parseInt(unranked.endedAt))}`}
            </td>
            <td className="p-3">
              {renderScore([unranked.winnerScore, unranked.looserScore])}
            </td>
            <td className="p-3 text-3xl">
              <FaEquals className="text-gray-400" />
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

const HighlightItem: React.FC<Highlight> = ({ n, label, hint, nColor }) => { 
  
  return (

  <article className={`flex flex-col items-center gap-y-2 ${nColor}`}>
    <h3 className="text-5xl font-bold">
      <img
        className="object-cover object-center w-full h-full rounded-full drop-shadow-md"
        src={`/api/users/${13}/photo`}
      />
      {/*n*/}
    </h3>
    <div className="text-8xl">
      {label === 'first' && <GiPodiumWinner />}
      {label === 'second' && <GiPodiumSecond />}
      {label === 'third' && <GiPodiumThird />}
    </div>
    <small>{hint}</small>
  </article>  
  );
}

const LeaderboardPage: NextPageWithLayout = ({}) => {

  const { getUserData } = useContext(authContext) as AuthContextType;
  const [ranking, setRanking] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
/*
  useEffect(() => {
    const fetchData = async () => {

      const req = await fetch(`/api/users/${userId}`);
      const data = await req.json();
      
      updateUserData(data);
      updateGamesHistory(JSON.parse(JSON.stringify(data)).games);
      setIsLoading(false);
    }
  
    fetchData()
    .catch(console.error);
  }, [userId])
*/
  return (
    <div className="min-h-screen overflow-x-auto text-white bg-fixed bg-center bg-fill grow" style={{
      backgroundImage: "url('/triangles.png')"
    }}>
      { !isLoading ?
      <div style={{ maxWidth: "800px" }} className="px-2 py-16 mx-auto">
        <div className="flex flex-col items-center gap-y-10">
          <div className="relative w-48 h-48 flex justify-center items-center text-center">
            <GiLaurelsTrophy className="text-9xl text-yellow-500"/>
          </div>
          <div className="w-full p-5 bg-gray-800 border-2 border-gray-800 rounded drop-shadow-md grid lg:grid-cols-3">
            <HighlightItem
              n={ranking[1]}
              label="second"
              hint="#2"
              nColor="text-zinc-400" />
            <HighlightItem
              n={ranking[0]}
              label="first"
              hint="#1"
              nColor="text-yellow-500" />
            <HighlightItem
              n={ranking[2]}
              label="third"
              hint="#3"
              nColor="text-orange-800" />
          </div>
          <Selector
            items={[
              {
                label: "Ranking",
                component: <HistoryTable history={ranking} />,
              },
              {
                label: "42 ranking",
                component: (
                  <div className="flex flex-col items-center justify-center mt-8">
                    <h3 className="text-2xl text-gray-600">42 ranking is coming soon...</h3>
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

LeaderboardPage.getLayout = withDashboardLayout;

export default LeaderboardPage;