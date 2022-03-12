import withDashboardLayout from "../components/hoc/withDashboardLayout";
import { NextPageWithLayout } from "./_app";
import Selector from "../components/Selector";
import Link from "next/link";
import Image from 'next/image';
import { Fragment, useEffect, useState } from "react";
import { GiLaurelsTrophy, GiPodiumSecond, GiPodiumThird, GiPodiumWinner } from "react-icons/gi";
import { BounceLoader } from "react-spinners";

export type RankingList = {
  id: string;
  username: string;
  avatar: string;
  rank: number | string,
  losses: number,
  wins: number,
  accountDeactivated: boolean,
  ratio: number | string,
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

const HistoryTable: React.FC<{ ranking: RankingList[] }> = ({
  ranking
}) => (

  <table
    className="w-full my-4 text-left"
  >
    <thead>
      <tr className="text-pink-600 bg-gray-800">
        <th className="p-3 uppercase">Rank</th>
        <th className="p-3 uppercase">Username</th>
        <th className="p-3 uppercase">Wins</th>
        <th className="p-3 uppercase">Losses</th>
        <th className="p-3 uppercase">Ratio</th>
      </tr>
    </thead>
    <tbody>
      {ranking
        .map((unranked, index) => (
          <tr
            key={unranked.id}
            className={`py-6 ${index % 2 ? "bg-gray-800" : "bg-gray-700"}`}
          >
            <td>
              {unranked.rank}
            </td>
            <td className="p-3 font-bold">
              <Link href={`/users/${unranked.id}`}>
                <a>{unranked.username}</a>
              </Link>
            </td>
            <td className="p-3 text-neutral-200">
              {unranked.wins}
            </td>
            <td className="p-3">
              {unranked.losses}
            </td>
            <td className="p-3">
              {unranked.ratio}
            </td>
          </tr>
        ))}
    </tbody>
  </table>
);

export type Highlight = {
  label: string;
  hint: string;
  nColor: string;
  ranking: any;
};

const HighlightItem: React.FC<Highlight> = ({ label, hint, nColor, ranking }) => { 
  
  let pic: string = "";

  if (ranking[0] && ranking[1] && ranking[2])
    pic = label === 'first' ? ranking[0].avatar :
      label === 'second' ? ranking[1].avatar : ranking[2].avatar;

  return (

  <article className={`flex flex-col items-center gap-y-2 ${nColor}`}>
    <h3 className="text-5xl font-bold">
      <img
        className="object-cover object-center w-full h-full rounded-full drop-shadow-md"
        src={pic}
      />
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

  const [ranking, setRanking] = useState<RankingList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createRankingList = (data: any) => {

    let tmp: any = [];

    for (var i in data) {
      tmp = [...tmp, {
        id: data[i].id,
        username: data[i].username,
        avatar: data[i].pic.startsWith("https://") ? data[i].pic : `/api/users/${data[i].id}/photo`,
        rank: data[i].rank ? data[i].rank : "-",
        losses: data[i].losses,
        wins: data[i].wins,
        accountDeactivated: data[i].accountDeactivated,
        ratio: (!data[i].wins && !data[i].losses) ? "-" : data[i].ratio,
      }];
    }
    setRanking(tmp);
  }


  useEffect(() => {
    const fetchData = async () => {

      const req = await fetch('/api/users');
      const data = await req.json();
      
      createRankingList(data);
      setIsLoading(false);
    }
  
    fetchData()
    .catch(console.error);
  }, [])

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
              label="second"
              hint="#2"
              nColor="text-zinc-400"
              ranking={ranking}
            />
            <HighlightItem
              label="first"
              hint="#1"
              nColor="text-yellow-500"
              ranking={ranking}
            />
            <HighlightItem
              label="third"
              hint="#3"
              nColor="text-orange-800"
              ranking={ranking}
            />
          </div>
          <Selector
            items={[
              {
                label: "Ranking",
                component: <HistoryTable ranking={ranking} />,
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