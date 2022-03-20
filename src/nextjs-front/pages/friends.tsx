import withDashboardLayout from "../components/hoc/withDashboardLayout";
import { NextPageWithLayout } from "./_app";
import Selector from "../components/Selector";
import ResponsiveFade from "../components/ResponsiveFade";
import Image from 'next/image';
import { useContext, useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import { FaMedal, FaUserClock, FaUserFriends, FaUserSlash, FaUsersSlash } from "react-icons/fa";
import authContext, { AuthContextType } from "../context/auth/authContext";
import { UserStatusItem } from "../components/UserStatus";
import Tooltip from "../components/Tooltip";
import { RiUserHeartLine, RiUserSettingsLine } from "react-icons/ri";
import { useRouter } from "next/router";
import { AiOutlineFall, AiOutlineUserAdd, AiOutlineUserDelete } from "react-icons/ai";
import Link from "next/link";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import { MdCancel } from "react-icons/md";

export type List = {
  id: string;
  username: string;
  duoquadra_login: boolean;
  wins: number;
  losses: number;
  draws: number;
};

const Table: React.FC<{ type: string, list: List[], suggested: List[], setSuggested: any, friendsLen: number, setFriendsLen: any, blockedLen: number, setBlockedLen: any, blockedUsers: List[], setBlockedUsers: any, friends: List[], setFriends: any, friends42Len: number, setFriends42Len: any, friends42: List[], setFriends42: any, pendingFriendsSent: List[], setPendingFriendsSent: any, pendingFriendsReceived: List[], setPendingFriendsReceived: any, pendingLen: number, setPendingLen: any }> = ({
  type, list, suggested, setSuggested, friendsLen, setFriendsLen, blockedLen, setBlockedLen, blockedUsers, setBlockedUsers, friends, setFriends, friends42Len, setFriends42Len, friends42, setFriends42, pendingFriendsSent, setPendingFriendsSent, pendingFriendsReceived, setPendingFriendsReceived, pendingLen, setPendingLen
}) => {

  if (!list)
  return null;

  const { setAlert } = useContext(alertContext) as AlertContextType;
  const { getUserData } = useContext(authContext) as AuthContextType;
  
  const updateFriendsRequests = async (id: string) => {
    const upd = await fetch (`/api/users/${getUserData().id}/${id}/removeFriendsReceived`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
   const resUpd = await upd.json();
    console.log('upd', upd);
    console.log('resupd', resUpd);
    const upd2 = await fetch (`/api/users/${id}/${getUserData().id}/removeFriendsSent`, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json",
      },
    });
    const resUpd2 = await upd2.json();
    console.log('upd2', upd2);
    console.log('resupd2', resUpd2);
  }

  const requestFriend = async (id: string, username: string, isDuoQuadra: boolean) => {
    
    const r = await fetch (`/api/users/${getUserData().id}`);
    const data = await r.json();
    const received = data.pendingFriendsReceived;
    
    let isAsking: boolean = false;
    for (let i in received) {
      if (received[i].id === id)
        isAsking = true;    
    }
    if (isAsking) {
      updateFriendsRequests(id);
      const up = await fetch (`/api/users/${getUserData().id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({friends: [{"id": id}]}),
        });
      console.log('up', up);
      const up2 = await fetch (`/api/users/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({friends: [{"id": getUserData().id}]}),
        });
        console.log('up2', up2);
        if (up.ok && up2.ok) {
          setSuggested(suggested.filter(
            item => item.id !== id
          ));
          setPendingFriendsReceived(pendingFriendsReceived.filter(
            item => item.id !== id
          ));
          setPendingLen(pendingLen - 1);
          setFriendsLen(friendsLen + 1);
          console.log('friendsLen', friendsLen);
          setFriends([...friends, {"id": id, "username": username}]);
          console.log('friends after', [...friends, {"id": id, "username": username}]);
          isDuoQuadra && setFriends42Len(friends42Len + 1);
          isDuoQuadra && setFriends42([...friends42, {"id": id, "username": username}]);
          setAlert({ type: 'info', content: `New friend: ${username}` });
        }
        else
          setAlert({ type: 'error', content: `Error while adding ${username} as friend` });  
    }
    else {
      const reqSent = await fetch (`/api/users/${getUserData().id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({pendingFriendsSent: [{"id": id}]}),
      });
      const reqReceived = await fetch (`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({pendingFriendsReceived: [{"id": getUserData().id}]}),
      });

      if (reqSent.ok && reqReceived.ok) {
        setSuggested(suggested.filter(
          item => item.id !== id
        ));
        setPendingFriendsSent([...pendingFriendsSent, {"id": id, "username": username}]);
        setAlert({ type: 'info', content: `Friend request sent to ${username}` });
      }
      else
        setAlert({ type: 'error', content: `Error while sending friend request to ${username}` });
    }
  }
  
  const blockUser = async (id: string, username: string) => {
    const r = await fetch (`/api/users/${getUserData().id}`);
    const data = await r.json();
    const received = data.pendingFriendsReceived;
    
    let isAsking: boolean = false;
    for (let i in received) {
      if (received[i].id === id)
        isAsking = true;    
    }
    isAsking && updateFriendsRequests(id);

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
  

  const removeRelation = async (id: string, username:string, action: string, list42: boolean) => {
    const req = await fetch (`/api/users/${getUserData().id}/${id}/${action}`, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json",
      },
    });
    if (req.ok) {
      let updated: List[];
      let updated42: List[] = [];

      if (action === 'unblock') 
        updated = blockedUsers.filter(
          item => item.id !== id
      )
      else {
        updated = friends.filter(
          item => item.id !== id
        );
        updated42 = friends42.filter(
          item => item.id !== id
        )
      }
      if (action === 'friend') {
        setFriends(updated);
        setFriendsLen(updated.length);
        list42 && setFriends42(updated42);
        list42 && setFriendsLen(updated42.length);
        setSuggested([...suggested, {"id": id, "username": username}]);
      }
      else if (action === 'unblock') {
        setBlockedUsers(updated);
        setBlockedLen(updated.length);
        setSuggested(updated.filter(
          item => item.id !== id
        ));
      }
      setAlert({ type: 'success', content: `${action === 'friend' ? `Friendship with ${username} destroyed` : `User ${username} unblocked successfully`}` });
    }
    else
      setAlert({ type: 'error', content: `${action === 'friend' ? `Error while killing friendship with ${username}` : `Error while unblocking ${username}`}` });
  }

  const checkRelation = (id: string, list: List[]) => {
    for (let i in list) {
      if (list[i].id === id) {
        return true;
      }
    }
    return false
  }

  const hasAlreadyAsked = (id: string, list: any) => {
    const invites = list.pendingFriendsSent;
    for (let i in invites) {
      if (invites[i].id === id) {
        return true;
      }
    }
    return false

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
            {(!checkRelation(id, friends)) ?
            <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Add as friend">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                { !hasAlreadyAsked(id, friends) &&
                    <AiOutlineUserAdd  onClick={() => {requestFriend(id, username, duoquadra_login ? true : false)}} />
                }
              </button>
            </Tooltip>
             :
             <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Remove friendship">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                <AiOutlineUserDelete onClick={() => {removeRelation(id, username, 'friend', type === 'friends42' ? true : false)}} />
              </button>
            </Tooltip>
          }
          
          {(!checkRelation(id, blockedUsers)) ?
            <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Block user">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                <FaUserSlash onClick={() => {blockUser(id, username)}} />
              </button>
            </Tooltip>
          :
            <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Unblock user">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                <RiUserHeartLine onClick={() => {removeRelation(id, username, 'unblock', false)}} />
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
              <div className="invisible md:visible absolute top-16 right-4">
                <div className="flex flex-col items-center p-2">
                <div
                  style={{ backgroundColor: "#00babc" }}
                  className="opacity-60 border border-black rounded-full pb-0 pt-2 pr-2 pl-2">
                  <Image
                    src="/plain_logo.svg"
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

  const [friends, setFriends] = useState<List[]>([]);
  const [friends42, setFriends42] = useState<List[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<List[]>([]);
  const [suggested, setSuggested] = useState<List[]>([]);
  const [pendingFriendsSent, setPendingFriendsSent] = useState<List[]>([]);
  const [pendingFriendsReceived, setPendingFriendsReceived] = useState<List[]>([]);
  const [friendsLen, setFriendsLen] = useState(0);
  const [friends42Len, setFriends42Len] = useState(0);
  const [blockedLen, setBlockedLen] = useState(0);
  const [pendingLen, setPendingLen] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const { getUserData } = useContext(authContext) as AuthContextType;
  const router = useRouter();
console.log('friendsLen', friendsLen)
  const createLists = (data: any, suggestedList: List[]) => {

    let friends: List[] = [];
    let friends42: List[] = [];
    let blocked: List[] = [];
    let pendingReceived: List[] = [];
    let suggested: List[] = suggestedList;

    for (var i in data) {
      if (data[i].id === getUserData().id) {
        setFriends(data[i].friends);
        setBlockedUsers(data[i].blockedUsers);
        setPendingFriendsSent(data[i].pendingFriendsSent);
        pendingReceived = data[i].pendingFriendsReceived;
        setPendingFriendsReceived(pendingReceived);

        for (var j in data[i].friends) {
          if (data[i].friends[j].duoquadra_login)
            friends42 = [...friends42, data[i].friends[j]];  
        }
      }
    }
    setFriends42(friends42);

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
    
    setSuggested(suggested.filter(function(ele , pos){
      return suggested.indexOf(ele) == pos;
    }));

    friends.length && setFriendsLen(friends.length);
    friends42.length && setFriends42Len(friends42.length);
    blocked.length && setBlockedLen(blocked.length);
    pendingReceived.length && setPendingLen(pendingReceived.length);
 console.log('friends.length', friends.length)
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
       
          <div className="space-y-7 md:space-y-0 w-full p-2 bg-gray-800 border-2 border-gray-800 rounded drop-shadow-md grid grid-cols-2 md:grid-cols-4 items-end">
            <HighlightItem
              n={friendsLen}
              label="friends"
              hint="Friends"
              nColor="text-blue-600" />
            <HighlightItem
              n={friends42Len}
              label="friends42"
              hint="Friends @42"
              nColor="text-green-500" />
            <HighlightItem
              n={pendingLen}
              label="pending"
              hint="Pending Requests"
              nColor="text-purple-600" />
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
                component: <Table type={'friends'} list={friends} suggested={suggested} setSuggested={setSuggested} friendsLen={friendsLen} setFriendsLen={setFriendsLen} blockedLen={blockedLen} setBlockedLen={setBlockedLen} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} friends={friends} setFriends={setFriends} friends42Len={friends42Len} setFriends42Len={setFriends42Len} friends42={friends42} setFriends42={setFriends42} pendingFriendsSent={pendingFriendsSent} setPendingFriendsSent={setPendingFriendsSent} pendingFriendsReceived={pendingFriendsReceived} setPendingFriendsReceived={setPendingFriendsReceived} pendingLen={pendingLen} setPendingLen={setPendingLen}/>,
              },
              {
                label: "Friends @42",
                component: <Table type={'friends42'} list={friends42} suggested={suggested} setSuggested={setSuggested} friendsLen={friendsLen} setFriendsLen={setFriendsLen} blockedLen={blockedLen} setBlockedLen={setBlockedLen} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} friends={friends} setFriends={setFriends} friends42Len={friends42Len} setFriends42Len={setFriends42Len} friends42={friends42} setFriends42={setFriends42} pendingFriendsSent={pendingFriendsSent} setPendingFriendsSent={setPendingFriendsSent} pendingFriendsReceived={pendingFriendsReceived} setPendingFriendsReceived={setPendingFriendsReceived} pendingLen={pendingLen} setPendingLen={setPendingLen}/>,
              },
              {
                label: "Pending Requests",
                component: <Table type={'pending'} list={pendingFriendsReceived} suggested={suggested} setSuggested={setSuggested} friendsLen={friendsLen} setFriendsLen={setFriendsLen} blockedLen={blockedLen} setBlockedLen={setBlockedLen} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} friends={friends} setFriends={setFriends} friends42Len={friends42Len} setFriends42Len={setFriends42Len} friends42={friends42} setFriends42={setFriends42} pendingFriendsSent={pendingFriendsSent} setPendingFriendsSent={setPendingFriendsSent} pendingFriendsReceived={pendingFriendsReceived} setPendingFriendsReceived={setPendingFriendsReceived} pendingLen={pendingLen} setPendingLen={setPendingLen}/>,
              },
              {
                label: "Blocked Users",
                component: <Table type={'blocked'} list={blockedUsers} suggested={suggested} setSuggested={setSuggested} friendsLen={friendsLen} setFriendsLen={setFriendsLen} blockedLen={blockedLen} setBlockedLen={setBlockedLen} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} friends={friends} setFriends={setFriends} friends42Len={friends42Len} setFriends42Len={setFriends42Len} friends42={friends42} setFriends42={setFriends42} pendingFriendsSent={pendingFriendsSent} setPendingFriendsSent={setPendingFriendsSent} pendingFriendsReceived={pendingFriendsReceived} setPendingFriendsReceived={setPendingFriendsReceived} pendingLen={pendingLen} setPendingLen={setPendingLen}/>,
              },
              
              {
                label: "Suggested Friends",
                component: <Table type={'suggested'} list={suggested} suggested={suggested} setSuggested={setSuggested} friendsLen={friendsLen} setFriendsLen={setFriendsLen} blockedLen={blockedLen} setBlockedLen={setBlockedLen} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} friends={friends} setFriends={setFriends} friends42Len={friends42Len} setFriends42Len={setFriends42Len} friends42={friends42} setFriends42={setFriends42} pendingFriendsSent={pendingFriendsSent} setPendingFriendsSent={setPendingFriendsSent} pendingFriendsReceived={pendingFriendsReceived} setPendingFriendsReceived={setPendingFriendsReceived} pendingLen={pendingLen} setPendingLen={setPendingLen}/>,
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