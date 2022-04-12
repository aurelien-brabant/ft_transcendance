import { useContext, useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import { FaUserClock, FaUserFriends, FaUsersSlash } from "react-icons/fa";
import { RiUserSettingsLine } from "react-icons/ri";
import Image from 'next/image';
import { useRouter } from "next/router";
import { NextPageWithLayout } from "./_app";
import relationshipContext, { RelationshipContextType } from "../context/relationship/relationshipContext";
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
      style={label === 'friends42' ? { color: "#00babc" } : {}}
      className={`flex flex-col items-center gap-y-2 ${nColor}`}
    >

      <div
        style={label === 'friends42' ? { backgroundColor: "#00babc" } : {}}
        className="text-8xl rounded-full"
      >
          {label === 'friends' && <FaUserFriends/>}
          {label === 'friends42' &&
            <div className="text-black hover:border-pink-600 pb-0 pt-2 pr-2 pl-2">
                <Image
                  src="/plain_logo.svg"
                  width={90}
                  height={90}
                  alt="Friends @42"
                />
            </div>
          }
          {label === 'blocked' && <FaUsersSlash/>}
          {label === 'pending' && <FaUserClock/>}
      </div>
      <h1 className="text-5xl">
        {n}
      </h1>
      <small className="font-bold">
        {hint}
      </small>
    </article>
  );
}

const FriendsPage: NextPageWithLayout = ({}) => {

  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const { user } = useSession();
  const { getData, getRelationships, createSuggested, setSuggested, suggested,
    users, friends, friends42, blocked, pendingFriendsReceived
  } = useContext(relationshipContext) as RelationshipContextType;
  const router = useRouter();

  if (!user)
    return null;

  useEffect(() => {
      getData();
      setIsLoading(false);
    }, [])

  useEffect(() => {
    setIsLoading(true);
    getRelationships(users, user.id);
    createSuggested(users, friends, blocked);
    setIsLoading(false);
  }, [selected])

  return (
    <div className="min-h-screen overflow-x-auto text-white bg-fixed bg-center bg-fill grow" style={{
      backgroundImage: "url('/triangles.png')"
    }}>
      { !isLoading ?
      <div style={{ maxWidth: "800px" }} className="px-2 py-10 mx-auto">
        <div className="flex flex-col items-center gap-y-10">
          <div className="relative w-48 h-48 flex justify-center items-center text-center">
            <img
              className="object-cover object-center w-full h-full rounded drop-shadow-md"
              src={`/api/users/${user.id}/photo`} />
            <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
              <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Edit user">
                <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                  <RiUserSettingsLine onClick={() => {router.push("/welcome")}} />
                </button>
              </Tooltip>
            </div>
          </div>
       
          <div className="flex flex-col items-center">
            <h1 className="text-2xl text-pink-600">{user.username}</h1>
            <UserStatusItem status={(user.accountDeactivated) ? "deactivated" : "online"} id={user.id}/>
          </div>
       
          <div className="space-y-7 md:space-y-0 w-full p-2 bg-gray-800 border-2 border-gray-800 rounded drop-shadow-md grid grid-cols-2 md:grid-cols-4 items-end">
            <HighlightItem
              n={friends.length}
              label="friends"
              hint="Friends"
              nColor="text-blue-600" />
            <HighlightItem
              n={friends42.length}
              label="friends42"
              hint="Friends @42"
              nColor="text-green-500" />
            <HighlightItem
              n={pendingFriendsReceived.length}
              label="pending"
              hint="Pending Requests"
              nColor="text-purple-600" />
            <HighlightItem
              n={blocked.length}
              label="blocked"
              hint="Blocked Users"
              nColor="text-red-600" />
          </div>

          <Selector selected={selected} setSelected={setSelected}
            items={[
              {
                label: "Friends",
                component: <FriendsTable type={'friends'} list={friends} suggested={suggested} setSuggested={setSuggested} setSelected={setSelected}/>,
              },
              {
                label: "Friends @42",
                component: <FriendsTable type={'friends42'} list={friends42} suggested={suggested} setSuggested={setSuggested} setSelected={setSelected}/>,
              },
              {
                label: "Pending Requests",
                component: <FriendsTable type={'pending'} list={pendingFriendsReceived} suggested={suggested} setSuggested={setSuggested} setSelected={setSelected}/>,
              },
              {
                label: "Blocked Users",
                component: <FriendsTable type={'blocked'} list={blocked} suggested={suggested} setSuggested={setSuggested} setSelected={setSelected}/>,
              },
              
              {
                label: "Suggested Friends",
                component: <FriendsTable type={'suggested'} list={suggested} suggested={suggested} setSuggested={setSuggested} setSelected={setSelected}/>,
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

FriendsPage.getLayout = withDashboardLayout;
FriendsPage.isAuthRestricted = true;

export default FriendsPage;