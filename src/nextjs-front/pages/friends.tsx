import { useContext, useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import { FaUserClock, FaUserFriends, FaUsersSlash } from "react-icons/fa";
import { RiUserSettingsLine } from "react-icons/ri";
import Image from "next/image";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "./_app";
import relationshipContext, {
  RelationshipContextType,
} from "../context/relationship/relationshipContext";
import FriendsTable from "../components/FriendsTable";
import Selector from "../components/Selector";
import Tooltip from "../components/Tooltip";
import { useSession } from "../hooks/use-session";
import { UserStatusItem } from "../components/UserStatus";
import withDashboardLayout from "../components/hoc/withDashboardLayout";

export type Highlight = {
  n: number;
  label: string;
  hint: string;
  nColor: string;
};

const HighlightItem: React.FC<Highlight> = ({ n, label, hint, nColor }) => {
  return (
    <article
      style={label === "friends42" ? { color: "#00babc" } : {}}
      className={`flex flex-col items-center gap-y-2 ${nColor}`}
    >
      <div
        style={label === "friends42" ? { backgroundColor: "#00babc" } : {}}
        className="text-6xl rounded-full"
      >
        {label === "friends" && <FaUserFriends />}
        {label === "friends42" && (
          <div className="relative w-12 h-12 flex justify-center items-center text-center">
          <img
            className="object-cover object-center w-full h-full rounded-full"
            src="/plain_logo.svg"
          />
          </div>
        )}
        {label === "blocked" && <FaUsersSlash />}
        {label === "pending" && <FaUserClock />}
      </div>
      <h1 className="text-5xl">{n}</h1>
      <small className="font-bold">{hint}</small>
    </article>
  );
};

const FriendsPage: NextPageWithLayout = ({}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const { user } = useSession();
  const {
    friends,
    friends42,
    blocked,
    pendingFriendsReceived,
    pendingFriendsSent,
    suggested,
    getRelationshipsData,
  } = useContext(relationshipContext) as RelationshipContextType;
  const router = useRouter();

  const fetchUserRelationships = async () => {
    setIsLoading(true);
    await getRelationshipsData();
    setIsLoading(false);
  }

  useEffect(() => {
    fetchUserRelationships().catch(console.error);
  }, []);

  return (
    <div className="text-white bg-fixed bg-center bg-fill grow">
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
            <div className="relative w-48 h-48 flex justify-center items-center text-center">
              <img
                className="object-cover object-center w-full h-full rounded-full ring-pink-500 p-2 ring drop-shadow-md"
                src={`/api/users/${user.id}/photo`}
              />
              <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
                <Tooltip
                  className="font-bold bg-dark text-neutral-200"
                  content="Edit profile"
                >
                  <button className="p-2 text-2xl text-white/90 bg-01dp rounded-full transition hover:scale-105">
                    <RiUserSettingsLine
                      onClick={() => {
                        router.push("/welcome");
                      }}
                    />
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h1 className="text-2xl text-pink-600">{user.username}</h1>
              <UserStatusItem
                id={user.id}
              />
            </div>

            <div className="space-y-7 md:space-y-0 w-full p-2 bg-01dp border border-02dp rounded drop-shadow-md grid grid-cols-2 md:grid-cols-5 items-end">
              <HighlightItem
                n={friends.length}
                label="friends"
                hint="Friends"
                nColor="text-blue-500"
              />
              <HighlightItem
                n={friends42.length}
                label="friends42"
                hint="Friends @42"
                nColor="text-green-500"
              />
              <HighlightItem
                n={pendingFriendsReceived.length}
                label="pending"
                hint="Pending Requests"
                nColor="text-purple-500"
              />
              <HighlightItem
                n={pendingFriendsSent.length}
                label="pending"
                hint="Pending Requests"
                nColor="text-purple-500"
              />
              <HighlightItem
                n={blocked.length}
                label="blocked"
                hint="Blocked Users"
                nColor="text-red-500"
              />
            </div>

            <Selector
              selected={selected}
              setSelected={setSelected}
              items={[
                {
                  label: "Friends",
                  component: (
                    <FriendsTable
                      category="friends"
                      list={friends}
                      setSelected={setSelected}
                    />
                  ),
                },
                {
                  label: "Friends @42",
                  component: (
                    <FriendsTable
                      category="friends"
                      list={friends42}
                      setSelected={setSelected}
                    />
                  ),
                },
                {
                  label: "Received Requests",
                  component: (
                    <FriendsTable
                      category="pending"
                      list={pendingFriendsReceived}
                      setSelected={setSelected}
                    />
                  ),
                },
                {
                  label: "Sent Requests",
                  component: (
                    <FriendsTable
                      category="sent"
                      list={pendingFriendsSent}
                      setSelected={setSelected}
                    />
                  ),
                },
                {
                  label: "Blocked Users",
                  component: (
                    <FriendsTable
                      category="blocked"
                      list={blocked}
                      setSelected={setSelected}
                    />
                  ),
                },
                {
                  label: "Suggested Friends",
                  component: (
                    <FriendsTable
                      category="suggested"
                      list={suggested}
                      setSelected={setSelected}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

FriendsPage.getLayout = withDashboardLayout;
FriendsPage.authConfig = true;

export default FriendsPage;
