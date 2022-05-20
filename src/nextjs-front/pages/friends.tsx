import { useContext, useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import {
  ClockIcon,
  CogIcon,
  InboxInIcon,
  LockClosedIcon,
  UserAddIcon,
  UsersIcon,
} from "@heroicons/react/outline";
import Image from "next/image";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "./_app";
import { useSession } from "../hooks/use-session";
import { UserStatusItem } from "../components/UserStatus";
import FriendsTable from "../components/FriendsTable";
import Selector from "../components/Selector";
import Tooltip from "../components/Tooltip";
import withDashboardLayout from "../components/hoc/withDashboardLayout";
import relationshipContext, { RelationshipContextType } from "../context/relationship/relationshipContext";

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

  /* Header between the user picture and the other users cards */
  const friendHeader = [
    {
      name: "Friends",
      icon: UsersIcon,
      nb: friends.length,
      color: "text-pink-500",
    },
    {
      name: "Friends@42",
      icon: UsersIcon,
      nb: friends42.length,
      color: "text-emerald-500",
    },
    {
      name: "Received requests",
      icon: InboxInIcon,
      nb: pendingFriendsReceived.length,
      color: "text-blue-500",
    },
    {
      name: "Sent requests",
      icon: ClockIcon,
      nb: pendingFriendsSent.length,
      color: "text-blue-700",
    },
    {
      name: "Blocked users",
      icon: LockClosedIcon,
      nb: blocked.length,
      color: "text-slate-700",
    },
    {
      name: "Suggested friends",
      icon: UserAddIcon,
      nb: suggested.length,
      color: "text-purple-400",
    },
  ];

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
                    <CogIcon
                      className="h-6 w-6"
                      onClick={() => {
                        router.push("/welcome");
                      }}
                    />
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h1 className="text-2xl uppercase text-pink-500 font-extrabold">
                {user.username}
              </h1>
              <UserStatusItem
                className={"mt-2"}
                id={user.id}
              />
            </div>

            <div className="grid grid-cols-6 gap-2 bg-01dp p-6">
              {friendHeader.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col items-center align-end gap-y-2 text-gray-400"
                >
                  <item.icon
                    className={`h-6 w-6 ${item.color}`}
                    aria-hidden="true"
                  />
                  <h1 className={(item.nb > 0) ? "font-bold" : ""}>{item.nb}</h1>
                  <p className="text-center text-sm">{item.name}</p>
                </div>
              ))}
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
