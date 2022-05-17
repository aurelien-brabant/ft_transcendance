import { useContext, useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import { useMediaQuery } from "react-responsive";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { BiTrophy } from "react-icons/bi";
import { GiPodiumSecond, GiPodiumThird, GiPodiumWinner } from "react-icons/gi";
import Link from "next/link";
import Image from 'next/image';
import { NextPageWithLayout } from "./_app";
import Achievements from "../components/Achievements";
import Selector from "../components/Selector";
import withDashboardLayout from "../components/hoc/withDashboardLayout";
import relationshipContext, { RelationshipContextType } from "../context/relationship/relationshipContext";
import { User } from "transcendance-types";

type Player = {
  id: string;
  username: string;
  avatar: string;
  hasPlayed: boolean;
  wins: number;
  losses: number;
  draws: number;
  ratio: number;
};

type TopPlayer = {
  label: string;
  hint: string;
  nColor: string;
  ranking: Player[];
};

/* Users are sorted from highest scorer */
const getUserRank = (user: Player) => {
  if (!user.hasPlayed) {
    return (
      <td className="p-3 text-white font-normal">-</td>
    );
  }

  if (parseInt(user.id) === 1) {
    return (
      <td className="p-3 text-yellow-400 font-extrabold">{user.id}</td>
    );
  } else if (parseInt(user.id) === 2) {
    return (
      <td className="p-3 text-stone-400 font-extrabold">{user.id}</td>
    );
  } else if (parseInt(user.id) === 3) {
    return (
      <td className="p-3 text-amber-700 font-extrabold">{user.id}</td>
    );
  }
  return (
    <td className="p-3 text-white font-normal">{user.id}</td>
  );
};

const getUserRatio = (user: Player) => {
  if (!user.hasPlayed) {
    return (
      <td className="p-3 text-neutral-200" >-</td>
    );
  }

  const ratioColor = (user.ratio > 0.6) ? "text-green-500" :
                     (user.ratio >= 0.4) ? "text-neutral-200" : "text-red-500";

  return (
    <td className={`p-3 ${ratioColor}`} >{user.ratio}</td>
  );
};

/* Ranking List */
const RankingTable: React.FC<{ ranking: Player[] }> = ({
  ranking
}) => (
  <table
    className="w-full my-4 text-left"
  >
    <thead>
      <tr className="text-pink-600 bg-01dp">
        <th className="p-3 uppercase">Rank</th>
        <th className="p-3 uppercase">Username</th>
        <th className="p-3 uppercase">Wins</th>
        <th className="p-3 uppercase">Losses</th>
        <th className="p-3 uppercase">Draws</th>
        <th className="p-3 uppercase">Ratio</th>
      </tr>
    </thead>

    <tbody>
      {ranking.map((user, index) => (
        <tr
          key={user.id}
          className={`py-6 ${(index % 2) ? "bg-03dp" : "bg-04dp no-underline"}`}
        >
          {getUserRank(user)}
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
          {getUserRatio(user)}
        </tr>
      ))}
    </tbody>
  </table>
);

/* To display the top 3 players */
const TopPlayerItem: React.FC<TopPlayer> = (
  { label, hint, nColor, ranking }
) => {

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
      <h3 className="text-4xl font-bold">
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
          <AiOutlineQuestionCircle className="text-9xl"/>
        }
      </h3>
      <div className="text-6xl">
        {label === 'first' && <GiPodiumWinner />}
        {label === 'second' && <GiPodiumSecond />}
        {label === 'third' && <GiPodiumThird />}
      </div>
      <small>{hint}</small>
    </article>
  );
}

const LeaderboardPage: NextPageWithLayout = ({}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [rankingGlobal, setRankingGlobal] = useState<Player[]>([]);
  const [ranking42, setRanking42] = useState<Player[]>([]);
  const [activeRank, setActiveRank] = useState<Player[]>([]);
  const [selected, setSelected] = useState(0);
  const [desktopScreen] = useState(useMediaQuery({ query: "(min-width: 1280px)"}));
  const { users, getRelationshipsData } = useContext(relationshipContext) as RelationshipContextType;

  const createRankingLists = (users: User[]) => {
    const ranking: Player[] = [];
    const ranking42: Player[] = [];

    const activeUsers = users.filter((user) => {
      return user.accountDeactivated == false;
    });

    for (var user of activeUsers) {
      if (user.duoquadra_login) {
        ranking42.push({
          id: user.id,
          username: user.username,
          avatar: `/api/users/${user.id}/photo`,
          hasPlayed: (user.games.length > 0),
          losses: user.losses,
          wins: user.wins,
          draws: user.draws,
          ratio: user.ratio,
        });
      }
      ranking.push({
        id: user.id,
        username: user.username,
        avatar: `/api/users/${user.id}/photo`,
        hasPlayed: (user.games.length > 0),
        losses: user.losses,
        wins: user.wins,
        draws: user.draws,
        ratio: user.ratio,
      });
    }

    setRanking42(ranking42);
    setRankingGlobal(ranking);
    setActiveRank(ranking);
  }

  useEffect(() => {
    (!selected) ? setActiveRank(rankingGlobal) : setActiveRank(ranking42);
  }, [selected])

  useEffect(() => {
    const fetchUsersData = async () => {
      setIsLoading(true);
      await getRelationshipsData();
      createRankingLists(users);
      setIsLoading(false);
    }

    fetchUsersData().catch(console.error);
  }, [])

  return (
    <div className="overflow-x-auto text-white bg-fixed bg-center bg-fill grow" >

      {isLoading ? (
        <div className="relative flex flex-col items-center justify-center min-h-screen gap-y-4">
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <Image src="/logo.svg" height="200" width="200" />
          </div>
          <BounceLoader size={400} color="#db2777" />
        </div>
        ) : (
        <div style={{ maxWidth: "800px" }} className="px-2 py-10 mx-auto">
          <div className="flex flex-col items-center gap-y-10">

            <div className="flex justify-center items-center text-center gap-x-2">
              <h1 className="text-2xl uppercase text-pink-600 font-extrabold">
                Top players
              </h1>
              <BiTrophy className="text-4xl text-yellow-400"/>
            </div>

            <div className="w-full p-5 bg-01dp border-2 border-02dp rounded drop-shadow-md grid lg:grid-cols-3">
              {desktopScreen &&
              <TopPlayerItem
                label="second"
                hint="#2"
                nColor="text-stone-400"
                ranking={activeRank}
              />}
              <TopPlayerItem
                label="first"
                hint="#1"
                nColor="text-yellow-400"
                ranking={activeRank}
              />
              {!desktopScreen &&
              <TopPlayerItem
                label="second"
                hint="#2"
                nColor="text-stone-400"
                ranking={activeRank}
              />}
              <TopPlayerItem
                label="third"
                hint="#3"
                nColor="text-amber-700"
                ranking={activeRank}
              />
            </div>

            <Selector
              selected={selected}
              setSelected={setSelected}
              items={[
                {
                  label: "Ranking",
                  component: <RankingTable ranking={rankingGlobal} />,
                },
                {
                  label: "42 ranking",
                  component: <RankingTable ranking={ranking42} />,
                },
                {
                  label: "Achievements",
                  component:  <Achievements />,
                }
              ]}
            />
          </div>
        </div>
      )}

    </div>
  );
}

LeaderboardPage.getLayout = withDashboardLayout;
LeaderboardPage.authConfig = true;

export default LeaderboardPage;