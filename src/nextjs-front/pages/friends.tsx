import withDashboardLayout from "../components/hoc/withDashboardLayout";
import { NextPageWithLayout } from "./_app";
import Selector from "../components/Selector";
import Link from "next/link";
import Image from 'next/image';
import { useContext, useEffect, useState } from "react";
import { GiPodiumSecond, GiThreeFriends } from "react-icons/gi";
import { BounceLoader } from "react-spinners";
import { FaUserFriends, FaUsersSlash } from "react-icons/fa";
import authContext, { AuthContextType } from "../context/auth/authContext";
import { UserStatusItem } from "../components/UserStatus";

export type List = {
  id: string;
  username: string;
  avatar: string;
  losses: number,
  wins: number,
  accountDeactivated: boolean,
  ratio: number,
};

const Table: React.FC<{ list: List[] }> = ({
  list
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
      {list
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
            <td className={`p-3 ${(String(user.ratio) === "1") ? "text-neutral-200" :
                                (user.ratio > 1) ? "text-green-500" : "text-red-500"}`}>
              {String(user.ratio) === "0" && !user.wins && !user.losses ? "-" : user.ratio}
            </td>
          </tr>
        ))}
    </tbody>
  </table>
);

export type Highlight = {
  n: string;
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

  const [friends, setFriends] = useState<List[]>([]);
  const [friends42, setFriends42] = useState<List[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<List[]>([]);
  const [suggested, setSuggested] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeList, setActiveList] = useState<List[]>([]);
  const [selected, setSelected] = useState(0);
  const { getUserData } = useContext(authContext) as AuthContextType;
  
  const createLists = (data: any) => {

    let friends: List[] = [];
    let friends42: List[] = [];
    let blocked: List[] = [];
    let suggested: List[] = [];

    for (var i in data) {
      if (parseInt(i) % 2) {
        friends42 = [...friends42, {
          id: data[i].id,
          username: data[i].username,
          avatar: `/api/users/${data[i].id}/photo`,
          losses: data[i].losses,
          wins: data[i].wins,
          accountDeactivated: data[i].accountDeactivated,
          ratio: data[i].ratio,
      }];  
      }
      else {
        blocked = [...blocked, {
          id: data[i].id,
          username: data[i].username,
          avatar: `/api/users/${data[i].id}/photo`,
          losses: data[i].losses,
          wins: data[i].wins,
          accountDeactivated: data[i].accountDeactivated,
          ratio: data[i].ratio,
      }];
      }

      friends = [...friends, {
          id: data[i].id,
          username: data[i].username,
          avatar: `/api/users/${data[i].id}/photo`,
          losses: data[i].losses,
          wins: data[i].wins,
          accountDeactivated: data[i].accountDeactivated,
          ratio: data[i].ratio,
      }];
    }
    setFriends(friends);
    setFriends42(friends42);
    setBlockedUsers(blocked);
    setSuggested(suggested);
    setActiveList(friends);
  }


  useEffect(() => {
    const fetchData = async () => {

      const req = await fetch('/api/users');
      const data = await req.json();
      
      createLists(data);
      setIsLoading(false);
    }
  
    fetchData()
    .catch(console.error);
  }, [])

  useEffect(() => {
    if (!selected)
      setActiveList(friends);
    else if (selected === 1)
      setActiveList(friends42);
    else if (selected === 2)
      setActiveList(blockedUsers);
    else if (selected === 3)
      setActiveList(suggested);
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
              src={`/api/users/${getUserData().id}/photo`} />
          </div>
       
          <div className="flex flex-col items-center">
            <h1 className="text-2xl text-pink-600">{getUserData().username}</h1>
            <UserStatusItem status={(getUserData().accountDeactivated) ? "deactivated" : "online"}/>
          </div>
       
          <div className="w-full p-2 bg-gray-800 border-2 border-gray-800 rounded drop-shadow-md grid lg:grid-cols-3 items-end">
            <HighlightItem
              n={String(friends.length)}
              label="friends"
              hint="Friends"
              nColor="text-pink-600" />
            <HighlightItem
              n={String(friends42.length)}
              label="friends42"
              hint="Friends @42"
              nColor="text-green-500" />
            <HighlightItem
              n={String(blockedUsers.length)}
              label="blocked"
              hint="Blocked Users"
              nColor="text-red-600" />
          </div>
         
          <Selector selected={selected} setSelected={setSelected}
            items={[
              {
                label: "Friends",
                component: <Table list={friends} />,
              },
              {
                label: "Friends @42",
                component: <Table list={friends42} />,
              },
              {
                label: "Blocked Users",
                component:  <Table list={blockedUsers} />,
              },
              {
                label: "Suggested Friends",
                component:  <Table list={suggested} />,
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

export default FriendsPage;