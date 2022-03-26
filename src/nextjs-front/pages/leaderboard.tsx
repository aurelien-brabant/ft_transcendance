import withDashboardLayout from "../components/hoc/withDashboardLayout";
import { NextPageWithLayout } from "./_app";
import Selector from "../components/Selector";
import Link from "next/link";
import Image from 'next/image';
import { useEffect, useState } from "react";
import { GiLaurelsTrophy, GiPodiumSecond, GiPodiumThird, GiPodiumWinner } from "react-icons/gi";
import { BounceLoader } from "react-spinners";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { useMediaQuery } from "react-responsive";
import Achievements from "../components/Achievements";
  
export type RankingList = {
  id: string;
  username: string;
  avatar: string;
  losses: number,
  wins: number,
  draws: number,
  accountDeactivated: boolean,
  ratio: number,
};

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
        <th className="p-3 uppercase">Draws</th>
        <th className="p-3 uppercase">Ratio</th>
      </tr>
    </thead>
    <tbody>
      {ranking
        .map((user, index) => (
          <tr
            key={user.id}
            className={`py-6 ${index % 2 ? "bg-gray-800" : "bg-gray-700"} ${user.accountDeactivated ? "line-through": "no-underline"}`}
          >
            <td className={`p-3 ${(String(index) === "0") ? "text-yellow-500 font-extrabold" :
                                (String(index) === "1") ? "text-zinc-400 font-extrabold" : 
                                (String(index) === "2") ? "text-orange-800 font-extrabold" : "text-white font-normal"}`}>
              {String(user.ratio) === "0" && !user.wins && !user.losses ? "-" : index + 1}
            </td>
            <td className="p-3 font-bold">
              <Link href={`/users/${user.id}`}>
                <a>{user.username}</a>
              </Link>
            </td>
            <td className={`p-3 text-neutral-200 ${user.wins >= user.losses ? "font-bold" : "font-normal"}`}>
              {user.wins}
            </td>
            <td className={`p-3 text-neutral-200 ${user.wins <= user.losses ? "font-bold" : "font-normal"}`}>
              {user.losses}
            </td>
            <td className="p-3 text-neutral-200 font-normal">
              {user.draws}
            </td>
            <td className={`p-3 ${(user.ratio >= 0.4 && user.ratio < 0.6) ? "text-neutral-200" :
                                (user.ratio > 0.6) ? "text-green-500" : "text-red-500"}`}>
              {String(user.ratio) === "0" && !user.wins && !user.losses ? "-" : user.ratio}
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
  ranking: RankingList[];
};

const HighlightItem: React.FC<Highlight> = ({ label, hint, nColor, ranking }) => { 
  
  let pic: string = "";
  let userUrl: string = "";

  if (ranking[0] && label == 'first') {
    pic = ranking[0].avatar;
    userUrl = `/users/${ranking[0].id}`;
  }
  else if (ranking[1] && label == 'second') {
    pic = ranking[1].avatar;
    userUrl = `/users/${ranking[1].id}`
  }
  else if (ranking[2] && label == 'third') {
    pic = ranking[2].avatar;
    userUrl = `/users/${ranking[2].id}`
  }

  return (

  <article className={`flex flex-col items-center gap-y-2 ${nColor}`}>
    <h3 className="text-5xl font-bold">
      { (userUrl !== "") ?
        <a href={userUrl}>
          <img
            className="object-cover object-center rounded-full drop-shadow-md"
            src={pic}
            width={150}
            height={150}
          />
        </a>
        :
        <BsFillQuestionCircleFill className="text-9xl"/>
      }
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
  const [ranking42, setRanking42] = useState<RankingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRank, setActiveRank] = useState<RankingList[]>([]);
  const [selected, setSelected] = useState(0);
	const [mobileScreen] = useState(useMediaQuery({ query: "(min-width: 1280px)"}));

  const createRankingLists = (data: any) => {

    let rank: RankingList[] = [];
    let rank42: RankingList[] = [];

    for (var i in data) {

      if (data[i].duoquadra_login)
          rank42 = [...rank42, {
            id: data[i].id,
            username: data[i].username,
            avatar: `/api/users/${data[i].id}/photo`,
            losses: data[i].losses,
            wins: data[i].wins,
            draws: data[i].draws,
            accountDeactivated: data[i].accountDeactivated,
            ratio: data[i].ratio,
          }];
  
      rank = [...rank, {
          id: data[i].id,
          username: data[i].username,
          avatar: `/api/users/${data[i].id}/photo`,
          losses: data[i].losses,
          wins: data[i].wins,
          draws: data[i].draws,
          accountDeactivated: data[i].accountDeactivated,
          ratio: data[i].ratio,
      }];
    }
    setRanking42(rank42);
    setRanking(rank);
    setActiveRank(rank);
  }


  useEffect(() => {
    const fetchData = async () => {

      const req = await fetch('/api/users');
      const data = await req.json();
      
      createRankingLists(data);
      setIsLoading(false);
    }
  
    fetchData()
    .catch(console.error);
  }, [])

  useEffect(() => {
    (!selected) ? setActiveRank(ranking) : setActiveRank(ranking42);
  }, [selected])

  return (
    <div className="min-h-screen overflow-x-auto text-white bg-fixed bg-center bg-fill grow" style={{
      backgroundImage: "url('/triangles.png')"
    }}>
      { !isLoading ?
      <div style={{ maxWidth: "800px" }} className="px-2 py-10 mx-auto">
        <div className="flex flex-col items-center gap-y-10">
          <div className="relative w-48 h-48 flex justify-center items-center text-center">
            <GiLaurelsTrophy className="text-9xl text-yellow-500"/>
          </div>
          <div className="w-full p-5 bg-gray-800 border-2 border-gray-800 rounded drop-shadow-md grid lg:grid-cols-3">
            {mobileScreen ?
            <HighlightItem
              label="second"
              hint="#2"
              nColor="text-zinc-400"
              ranking={activeRank}
            /> : 
            <HighlightItem
              label="first"
              hint="#1"
              nColor="text-yellow-500"
              ranking={activeRank}
            />
            }
            {mobileScreen ?
            <HighlightItem
              label="first"
              hint="#1"
              nColor="text-yellow-500"
              ranking={activeRank}
            />
            :<HighlightItem
              label="second"
              hint="#2"
              nColor="text-zinc-400"
              ranking={activeRank}
            />
            }
            <HighlightItem
              label="third"
              hint="#3"
              nColor="text-orange-800"
              ranking={activeRank}
            />
          </div>
          <Selector selected={selected} setSelected={setSelected}
            items={[
              {
                label: "Ranking",
                component: <HistoryTable ranking={ranking} />,
              },
              {
                label: "42 ranking",
                component:  <HistoryTable ranking={ranking42} />,
              },
              {
                label: "Achievements",
                component:  <Achievements />,
              }
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
LeaderboardPage.isAuthRestricted = true;

export default LeaderboardPage;