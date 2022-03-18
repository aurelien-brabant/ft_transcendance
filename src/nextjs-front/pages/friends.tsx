import withDashboardLayout from "../components/hoc/withDashboardLayout";
import { NextPageWithLayout } from "./_app";
import Selector from "../components/Selector";
import ResponsiveFade from "../components/ResponsiveFade";
import Link from "next/link";
import Image from 'next/image';
import { useContext, useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import { FaUserFriends, FaUserSlash, FaUsersSlash } from "react-icons/fa";
import authContext, { AuthContextType } from "../context/auth/authContext";
import { UserStatusItem } from "../components/UserStatus";
import Tooltip from "../components/Tooltip";
import { RiUserHeartLine, RiUserSettingsLine } from "react-icons/ri";
import { useRouter } from "next/router";
import { AiOutlineUserAdd, AiOutlineUserDelete } from "react-icons/ai";

export type List = {
  id: string;
  username: string;
  avatar: string;
  losses: number,
  wins: number,
  accountDeactivated: boolean,
  ratio: number,
};

const Table: React.FC<{ list: List[], type: string }> = ({
  list, type
}) => {

  const removeFriend = (id: string) => {
    console.log('remove friend ID', id);
  }

  const requestFriend = (id: string) => {
    console.log('request friend ID', id);
  }

  const blockUser = (id: string) => {
    console.log('block user ID', id);
  }

  const unblockUser = (id: string) => {
    console.log('unblock user ID', id);
  }


  return (
    <ul className="place-items-stretch grid grid-cols-3 gap-10 text-center pt-10 pb-10">
      <ResponsiveFade 
        useMediaQueryArg={{ query: "(min-width: 1280px)" }}
        cascade triggerOnce duration={500}
      >
      {list.map(({ id, username }) => (
        <li
          className="text-pink-600 justity-items-center p-5 bg-gray-800/70 border border-pink-600 rounded  hover:border-white hover:bg-pink-700 hover:text-inherit md:transition md:transform md:ease-in md:duration-500 md:hover:-translate-y-2"
          key={id}
        >
          <p className="pb-5 place-content-evenly text-ellipsis overflow-hidden cursor-pointer font-bold">
            {username}
          </p>
        
          <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
          {(type === 'suggested' || type === 'blocked')  &&
            <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Add as friend">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                <AiOutlineUserAdd onClick={() => {requestFriend(id)}} />
              </button>
            </Tooltip>
          }
          
          {(type !== 'blocked') &&
            <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Block user">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                <FaUserSlash onClick={() => {blockUser(id)}} />
              </button>
            </Tooltip>
          }
          {(type === 'blocked') && <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Unblock user">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                <RiUserHeartLine onClick={() => {unblockUser(id)}} />
              </button>
            </Tooltip>
          }
          {(type === 'friends' || type === 'friends42') &&
          <Tooltip className='font-bold bg-gray-900 text-neutral-200' content="Unblock user">
              <button className="p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                <AiOutlineUserDelete onClick={() => {removeFriend(id)}} />
              </button>
            </Tooltip>
          }
          </div>

          <Link href={`/users/${id}`}>
            <a>
              <img
		  	        className="justify-content-center cursor-pointer"
	  		        src={`/api/users/${id}/photo`}
  	        		height="100%"
	  	  	      width="100%"
              />
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
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const { getUserData } = useContext(authContext) as AuthContextType;
  const router = useRouter();

  const createLists = (data: any) => {

    let friends: List[] = [];
    let friends42: List[] = [];
    let blocked: List[] = [];
    let suggested: List[] = [];

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

    for (var i in data) {
      if (data[i].id !== getUserData().id) {
        for (var j in blocked) {
          if (blocked[j].id !== data[i].id) {
            suggested = [...suggested, data[i]];
          }
        }
      }
    }

    const filtered = suggested.filter(function(ele , pos){
      return suggested.indexOf(ele) == pos;
    })
    
    setFriends(friends);
    setFriends42(friends42);
    setBlockedUsers(blocked);
    setSuggested(filtered);

    friends.length && setFriendsLen(friends.length);
    friends42.length && setFriends42Len(friends42.length);
    blocked.length && setBlockedLen(blocked.length);

    setIsLoading(false);
  }

  useEffect(() => {
    const fetchData = async () => {

      const req = await fetch('/api/users/');
      const data = await req.json();
      
      createLists(data);
    }
  
    fetchData()
    .catch(console.error);
  }, [])

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
                component: <Table list={friends} type={'friends'}/>,
              },
              {
                label: "Friends @42",
                component: <Table list={friends42} type={'friends42'}/>,
              },
              {
                label: "Blocked Users",
                component:  <Table list={blockedUsers} type={'blocked'}/>,
              },
              {
                label: "Suggested Friends",
                component:  <Table list={suggested} type={'suggested'}/>,
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