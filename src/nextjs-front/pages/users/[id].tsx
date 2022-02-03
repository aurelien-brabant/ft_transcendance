import { GetServerSideProps, NextPage } from "next";
import { UserStatusItem } from "../../components/UserStatus";
import withDashboardLayout from "../../components/hoc/withDashboardLayout";
import { genUser, SeedUser } from "../../seed/user";
import { NextPageWithLayout } from "../_app";
import Selector from "../../components/Selector";
import { SeedGameSummary, SeedRankedGameSummary } from "../../seed/game";
import { GoArrowDown, GoArrowUp } from "react-icons/go";
import Link from "next/link";
import { Fragment, ReactElement, useContext } from "react";
import { RiPingPongLine, RiMessage2Line } from "react-icons/ri";
import { IoMdPersonAdd } from "react-icons/io";
import Tooltip from "../../components/Tooltip";
import ChatProvider from "../../context/chat/ChatProvider";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";

export const getServerSideProps: GetServerSideProps = async function (context) {
  return {
    props: {
      user: genUser(),
    },
  };
};

type UserProfilePageProps = {
  user: SeedUser;
};

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);

  return `${("" + minutes).length === 1 ? "0" : ""}${minutes}:${
    ("" + seconds).length === 1 ? "0" : ""
  }${seconds}`;
};

const renderScore = (score: [number, number]) => {
  const getColor = (n1: number, n2: number) =>
    n1 < n2 ? "text-red-400" : "text-green-400";
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

const Stonks: React.FC<{ n: number }> = ({ n }) => {
  let color = n > 0 ? "text-green-400" : n < 0 ? "text-red-400" : "";

  return (
    <div className="flex items-center gap-x-2">
      {n < 0 ? <GoArrowDown /> : n > 0 ? <GoArrowUp /> : ""}
      <span className={color}>{Math.abs(n)}</span>
    </div>
  );
};

const UnrankedHistoryTable: React.FC<{ history: SeedGameSummary[] }> = ({
  history,
}) => (
  <table
    className="w-full my-4 text-left"
  >
    <thead>
      <tr className="text-pink-600 bg-gray-800">
        <th className="p-3 uppercase">Opponent</th>
        <th className="p-3 uppercase">Duration</th>
        <th className="p-3 uppercase">Score</th>
        <th className="p-3 uppercase">Date</th>
      </tr>
    </thead>
    <tbody>
      {/* NOTE: OBVIOUSLY we won't sort on the client side this is only for simulation purpose */}
      {history
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((unranked, index) => (
          <tr
            key={unranked.id}
            className={`py-6 ${index % 2 ? "bg-gray-800" : "bg-gray-700"}`}
          >
            <td className="p-3 font-bold">
              <Link href={`/users/${unranked.players[1]}`}>
                <a>{unranked.players[1]}</a>
              </Link>
            </td>
            <td className="p-3 text-neutral-200">
              {formatDuration(unranked.duration)}
            </td>
            <td className="p-3">{renderScore(unranked.score)}</td>
            <td className="p-3">
              {new Date(unranked.date).toLocaleDateString()}
            </td>
          </tr>
        ))}
    </tbody>
  </table>
);

const RankedHistoryTable: React.FC<{ history: SeedRankedGameSummary[] }> = ({
  history,
}) => (
  <table
    className="w-full my-4 text-left"
  >
    <thead>
      <tr className="text-pink-600 bg-gray-800">
        <th className="p-3 uppercase">Opponent</th>
        <th className="p-3 uppercase">Duration</th>
        <th className="p-3 uppercase">Score</th>
        <th className="p-3 uppercase">ELO change</th>
        <th className="p-3 uppercase">Ranking change</th>
        <th className="p-3 uppercase">Date</th>
      </tr>
    </thead>
    <tbody>
      {/* NOTE: OBVIOUSLY we won't sort on the client side this is only for simulation purpose */}
      {history
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((unranked, index) => (
          <tr
            key={unranked.id}
            className={`py-6 ${index % 2 ? "bg-gray-800" : "bg-gray-700"}`}
          >
            <td className="p-3 font-bold">
              <Link href={`/users/${unranked.players[1]}`}>
                <a>{unranked.players[1]}</a>
              </Link>
            </td>
            <td className="p-3 text-neutral-200">
              {formatDuration(unranked.duration)}
            </td>
            <td className="p-3">{renderScore(unranked.score)}</td>
            <td className="p-3">
              <Stonks n={unranked.eloDiff} />
            </td>
            <td className="p-3">
              <Stonks n={unranked.rankingDiff} />
            </td>
            <td className="p-3">
              {new Date(unranked.date).toLocaleDateString()}
            </td>
          </tr>
        ))}
    </tbody>
  </table>
);

export type Highlight = {
  n: number;
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

const UserProfilePage: NextPageWithLayout<UserProfilePageProps> = ({
  user,
}) => {
  const actionTooltipStyles = "font-bold bg-gray-900 text-neutral-200";

  const { openChat, setChatView } = useContext(chatContext) as ChatContextType;
  console.log(openChat);

  return (
    <div className="min-h-screen overflow-x-auto text-white bg-fixed bg-center bg-fill grow" style={{
        backgroundImage: "url('/triangles.png')"
      }}>
      <div style={{ maxWidth: "800px" }} className="px-2 py-16 mx-auto">
        <div className="flex flex-col items-center gap-y-10">
          <div className="relative w-48 h-48">
            <img
              className="object-cover object-center w-full h-full rounded drop-shadow-md"
              src={user.avatar}
            />

            {/* actions */}
            <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
              <Tooltip className={actionTooltipStyles} content="challenge">
                <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                  <RiPingPongLine />
                </button>
              </Tooltip>

              <Tooltip className={actionTooltipStyles} content="message">
                <button
                  className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105"
                  onClick={() => {
                    setChatView('dm', user.username, {targetUsername: user.username});
                    openChat();
                  }}
                >
                  <RiMessage2Line />
                </button>
              </Tooltip>

              <Tooltip className={actionTooltipStyles} content="Add as friend">
                <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                  <IoMdPersonAdd />
                </button>
              </Tooltip>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl text-pink-600">{user.username}</h1>
            <UserStatusItem status="online" />
          </div>
          <div className="w-full p-5 bg-gray-800 border-2 border-gray-800 rounded drop-shadow-md grid lg:grid-cols-3">
            <HighlightItem
              n={10}
              label="Ranking"
              hint="Place in the global ranking"
              nColor="text-orange-500"
            />
            <HighlightItem
              n={1300}
              label="ELO"
              hint="Ranking score"
              nColor="text-green-300"
            />
            <HighlightItem
              n={10 / 4}
              label="Ratio"
              hint="Ranked wins divided by ranking looses"
              nColor="text-blue-500"
            />
          </div>
          <Selector
            items={[
              {
                label: "Unranked 1v1",
                component: (
                  <UnrankedHistoryTable history={user.unrankedHistory} />
                ),
              },
              {
                label: "Ranked 1v1",
                component: <RankedHistoryTable history={user.rankedHistory} />,
              },
              {
                label: "Last achievements",
                component: (
                  <div className="flex flex-col items-center justify-center mt-8">
                    <h3 className="text-2xl text-gray-600">
                      Achievements are coming soon...
                    </h3>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

UserProfilePage.getLayout = withDashboardLayout;

export default UserProfilePage;
