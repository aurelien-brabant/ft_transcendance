import withDashboardLayout from "../components/hoc/withDashboardLayout";
import { NextPageWithLayout } from "./_app";
import Selector from "../components/Selector";
import ResponsiveFade from "../components/ResponsiveFade";
import Image from 'next/image';
import { useContext, useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import { FaMedal, FaUserFriends, FaUserSlash, FaUsersSlash } from "react-icons/fa";
import authContext, { AuthContextType } from "../context/auth/authContext";
import { UserStatusItem } from "../components/UserStatus";
import Tooltip from "../components/Tooltip";
import { RiUserHeartLine, RiUserSettingsLine } from "react-icons/ri";
import { useRouter } from "next/router";
import { AiOutlineFall, AiOutlineUserAdd, AiOutlineUserDelete } from "react-icons/ai";
import Link from "next/link";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import { MdCancel } from "react-icons/md";
import { GiFalling, GiPodiumWinner } from "react-icons/gi";

export type List = {
  id: string;
  username: string;
  duoquadra_login: boolean;
  wins: number;
  losses: number;
 // rank: number
};

const Table: React.FC<{ type: string, list: List[], suggested: List[], setSuggested: any, friendsLen: number, setFriendsLen: any, blockedLen: number, setBlockedLen: any, blockedUsers: List[], setBlockedUsers: any, friends: List[], setFriends: any, friends42Len: number, setFriends42Len: any }> = ({
  type, list, suggested, setSuggested, friendsLen, setFriendsLen, blockedLen, setBlockedLen, blockedUsers, setBlockedUsers, friends, setFriends, friends42Len, setFriends42Len
}) => {

  const { setAlert } = useContext(alertContext) as AlertContextType;
  const { getUserData } = useContext(authContext) as AuthContextType;
  
  //TODO transofmr adding to requesting 
  const requestFriend = async (id: string, username: string, isDuoQuadra: boolean) => {
    const req = await fetch (`/api/users/${getUserData().id}`, {
      method: "PATCH",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({friends: [{"id": id}]}),
    });
    const req2 = await fetch (`/api/users/${id}`, {
      method: "PATCH",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({friends: [{"id": getUserData().id}]}),
    });

    if (req.ok && req2.ok) {
      setSuggested(suggested.filter(
        item => item.id !== id
      ));
      setFriendsLen(friendsLen + 1);
      isDuoQuadra && setFriends42Len(friends42Len + 1);
      setAlert({ type: 'info', content: `Friend request sent to ${username}` });
    }
    else
      setAlert({ type: 'error', content: `Error while sending friend request to ${username}` });
  }
  
  const blockUser = async (id: string, username: string) => {
    const req = await fetch (`/api/users/${getUserData().id}`, {
      method: "PATCH",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({blockedUsers: [{"id": id}]}),
    });
    if (req.ok) {
      setBlockedUsers([...blockedUsers, {"id": id, "username": username}]);
      setBlockedLen(blockedLen + 1);
      setSuggested(suggested.filter(
        item => item.id !== id
      ));
      setAlert({ type: 'success', content: `User ${username} blocked` });
    }
    else
      setAlert({ type: 'error', content: `Error while blocking ${username}` });
  }
  

  const removeRelation = async (id: string, username:string, action: string) => {
    const req = await fetch (`/api/users/${getUserData().id}/${id}/${action}`, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json",
      },
    });
    if (req.ok) {
      let updated: List[];
      updated = (action === 'unblock') ? blockedUsers.filter(
        item => item.id !== id
      ) : friends.filter(
        item => item.id !== id
      );
      (action === 'friend') ? setFriends(updated) : setBlockedUsers(updated) && setSuggested(updated.filter(
        item => item.id !== id
      ));;
      (action === 'unblock') && setBlockedLen(blockedLen - 1);
      (action === 'friend') && setFriendsLen(friendsLen - 1);
      setAlert({ type: 'success', content: `${action === 'friend' ? `Friendship with ${username} destroyed` : `User ${username} unblocked successfully`}` });
    }
    else
      setAlert({ type: 'error', content: `${action === 'friend' ? `Error while killing friendship with ${username}` : `Error while unblocking ${username}`}` });
  }

  return (
    <ul className={`place-items-stretch grid md:grid grid-cols-2 md:grid-cols-3 gap-10 text-center pt-10 pb-10 ${type === 'suggested' && "pr-0 md:pr-3"}`}>
      <ResponsiveFade 
        useMediaQueryArg={{ query: "(min-width: 1280px)" }}
        cascade triggerOnce duration={500}
      >
      {list.map(({ id, username, duoquadra_login, wins, losses }) => (
        <li
          className="text-pink-600 justity-items-center px-5 pt-2 pb-7 bg-gray-800/70 border border-pink-600 rounded  hover:border-white hover:bg-pink-700 hover:text-inherit md:transition md:transform md:ease-in md:duration-500 md:hover:-translate-y-2"
          key={id}
        >
          { type === 'suggested' && 
          <div className="relative flex items-center justify-center -bottom-4 gap-x-2">
            <div className="border rounded-full absolute -top-3 md:-top-10 -right-2 md:-right-8 border-pink-600 hover:border-white bg-pink-600 hover:bg-white text-white hover:text-pink-600">
              <MdCancel
                className="cursor-pointer text-2xl"
                onClick={() => setSuggested(suggested.filter(
                  item => item.id !== id
                ))}
              />
            </div>
          </div>
          }
         
          <div className="relative md:absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
          {(type === 'suggested' || type === 'blocked')  &&
            <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Add as friend">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                <AiOutlineUserAdd onClick={() => {requestFriend(id, username, duoquadra_login ? true : false)}} />
              </button>
            </Tooltip>
          }
          
          {(type !== 'blocked') &&
            <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Block user">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                <FaUserSlash onClick={() => {blockUser(id, username)}} />
              </button>
            </Tooltip>
          }
          {(type === 'blocked') && <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Unblock user">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                <RiUserHeartLine onClick={() => {removeRelation(id, username, 'unblock')}} />
              </button>
            </Tooltip>
          }
          {(type === 'friends' || type === 'friends42') &&
          <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Remove friendship">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                <AiOutlineUserDelete onClick={() => {removeRelation(id, username, 'friend')}} />
              </button>
            </Tooltip>
          }
          </div>

          <Link href={`/users/${id}`}>
            <a>
              <div className={`grid grid-cols-2 m-2 space-x-3`}>
              <div className="grid grid-cols-1 text-center place-items-center text-yellow-500 border-pink-600 bg-inherit">
                <FaMedal/> {wins}
              </div>
              <div className="grid grid-cols-1 text-center place-items-center text-red-500 bg-inherit">
                <AiOutlineFall className="text-xl font-bold"/> {losses}
              </div>
              </div>
                <img
		  	        className="justify-content-center"
	  		        src={`/api/users/${id}/photo`}
  	        		height="100%"
	  	  	      width="100%"
                />
              {duoquadra_login &&
              <div className="invisible md:visible absolute top-16 right-5">
                <div className="flex flex-col items-center p-2">
                <div className="opacity-70 border border-pink-600 bg-white rounded-full pb-0 pt-2 pr-2 pl-2">
                  <Image
                    src="/logo.svg"
                    width={25}
                    height={25}
                    alt="42 Badge"
                  />
                </div>
              </div></div>
              }
              <p className="place-content-evenly text-ellipsis overflow-hidden cursor-pointer font-bold">
                  {username}
              </p>
            </a>
          </Link>
        </li>
        ))}
      </ResponsiveFade>
    </ul>
  )
}


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
  const [friendsLen, setFriendsLen] = useState(0);
  const [friends42Len, setFriends42Len] = useState(0);
  const [blockedLen, setBlockedLen] = useState(0);
 // const [suggestedLen, setSuggestedLen] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const { getUserData } = useContext(authContext) as AuthContextType;
  const router = useRouter();

  const createLists = (data: any, suggestedList: List[]) => {

    let friends: List[] = [];
    let friends42: List[] = [];
    let blocked: List[] = [];
    let suggested: List[] = suggestedList;

    for (var i in data) {
      if (data[i].id === getUserData().id) {
        friends = data[i].friends;
        blocked = data[i].blockedUsers;

        for (var j in data[i].friends) {
          if (data[i].friends[j].duoquadra_login)
            friends42 = [...friends42, data[i].friends[j]];  
        }
      }
    }

    const checkSuggested = (list: List[], id: String) => {
      for (var i in list) {
        if (list[i].id === id) {
          return false;
        }
      }
      return true;
    }
  
    if (!suggested.length) {
      for (var i in data) {
        if (data[i].id !== getUserData().id
          && checkSuggested(blocked, data[i].id)
          && checkSuggested(friends, data[i].id))
            suggested = [...suggested, data[i]]
      }
    }
    
    setFriends(friends);
    setFriends42(friends42);
    setBlockedUsers(blocked);
    setSuggested(suggested.filter(function(ele , pos){
      return suggested.indexOf(ele) == pos;
    }));

    friends.length && setFriendsLen(friends.length);
    friends42.length && setFriends42Len(friends42.length);
    blocked.length && setBlockedLen(blocked.length);
 
    setIsLoading(false);
  }

  useEffect(() => {
    const fetchData = async () => {

      const req = await fetch('/api/users/');
      const data = await req.json();
      
      createLists(data, suggested);
    }
  
    fetchData()
    .catch(console.error);
  }, [selected])

  console.log('suggested', suggested);
  
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
            <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
              <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Edit user">
                <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                  <RiUserSettingsLine onClick={() => {router.push("/welcome")}} />
                </button>
              </Tooltip>
            </div>
          </div>
       
          <div className="flex flex-col items-center">
            <h1 className="text-2xl text-pink-600">{getUserData().username}</h1>
            <UserStatusItem status={(getUserData().accountDeactivated) ? "deactivated" : "online"}/>
          </div>
       
          <div className="w-full p-2 bg-gray-800 border-2 border-gray-800 rounded drop-shadow-md grid lg:grid-cols-3 items-end">
            <HighlightItem
              n={friendsLen}
              label="friends"
              hint="Friends"
              nColor="text-pink-600" />
            <HighlightItem
              n={friends42Len}
              label="friends42"
              hint="Friends @42"
              nColor="text-green-500" />
            <HighlightItem
              n={blockedLen}
              label="blocked"
              hint="Blocked Users"
              nColor="text-red-600" />
          </div>
         
          <Selector selected={selected} setSelected={setSelected}
            items={[
              {
                label: "Friends",
                component: <Table type={'friends'} list={friends} suggested={suggested} setSuggested={setSuggested} friendsLen={friendsLen} setFriendsLen={setFriendsLen} blockedLen={blockedLen} setBlockedLen={setBlockedLen} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} friends={friends} setFriends={setFriends} friends42Len={friends42Len} setFriends42Len={setFriends42Len}/>,
              },
              {
                label: "Friends @42",
                component: <Table type={'friends42'} list={friends42} suggested={suggested} setSuggested={setSuggested} friendsLen={friendsLen} setFriendsLen={setFriendsLen} blockedLen={blockedLen} setBlockedLen={setBlockedLen} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} friends={friends} setFriends={setFriends} friends42Len={friends42Len} setFriends42Len={setFriends42Len}/>,
              },
              {
                label: "Blocked Users",
                component: <Table type={'blocked'} list={blockedUsers} suggested={suggested} setSuggested={setSuggested} friendsLen={friendsLen} setFriendsLen={setFriendsLen} blockedLen={blockedLen} setBlockedLen={setBlockedLen} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} friends={friends} setFriends={setFriends} friends42Len={friends42Len} setFriends42Len={setFriends42Len}/>,
              },
              {
                label: "Suggested Friends",
                component: <Table type={'suggested'} list={suggested} suggested={suggested} setSuggested={setSuggested} friendsLen={friendsLen} setFriendsLen={setFriendsLen} blockedLen={blockedLen} setBlockedLen={setBlockedLen} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} friends={friends} setFriends={setFriends} friends42Len={friends42Len} setFriends42Len={setFriends42Len}/>,
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

FriendsPage.getLayout = withDashboardLayout;
FriendsPage.isAuthRestricted = true;

export default FriendsPage;