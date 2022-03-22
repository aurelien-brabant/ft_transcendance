import Link from "next/link";
import Image from 'next/image';
import { useContext } from "react";
import { AiOutlineFall, AiOutlineUserAdd, AiOutlineUserDelete } from "react-icons/ai";
import { FaMedal, FaUserSlash } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { RiUserHeartLine } from "react-icons/ri";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import authContext, { AuthContextType } from "../context/auth/authContext";
import ResponsiveFade from "./ResponsiveFade";
import Tooltip from "./Tooltip";
import { IoIosArrowForward } from "react-icons/io";
import relationshipContext, { RelationshipContextType, User } from "../context/relationship/relationshipContext";

const FriendsTable: React.FC<{ type: string, list: User[], suggested: User[], setSuggested: any, setSelected: any }> = ({
  type, list, suggested, setSuggested, setSelected
}) => {

  const { setAlert } = useContext(alertContext) as AlertContextType;
  const { getUserData } = useContext(authContext) as AuthContextType;
   const { friends, setFriends, friends42, setFriends42, blocked, setBlocked,
    pendingFriendsReceived, setPendingFriendsReceived, pendingFriendsSent, setPendingFriendsSent
   } = useContext(relationshipContext) as RelationshipContextType;

  const updateFriendsRequests = (id: string) => {
    fetch (`/api/users/${getUserData().id}/${id}/removeFriendsReceived`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    fetch (`/api/users/${id}/${getUserData().id}/removeFriendsSent`, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json",
      },
    });
  }

  const requestFriend = async (id: string, username: string, isDuoQuadra: boolean) => {
    
    const req = await fetch (`/api/users/${getUserData().id}`);
    const data = await req.json();
    const received = data.pendingFriendsReceived;
    
    let isAsking: boolean = false;
    for (let i in received) {
      if (received[i].id === id)
        isAsking = true;    
    }
    if (isAsking) {
      updateFriendsRequests(id);
      const addFriend = await fetch (`/api/users/${getUserData().id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({friends: [{"id": id}]}),
        });
      const addFriend2 = await fetch (`/api/users/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({friends: [{"id": getUserData().id}]}),
        });
        if (addFriend.ok && addFriend2.ok) {
          setSuggested(suggested.filter(
            item => item.id !== id
          ));
          setPendingFriendsReceived(pendingFriendsReceived.filter(
            item => item.id !== id
          ));
          setFriends([...friends, {"id": id, "username": username}]);
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
    let isAsking: boolean = false;
    for (let i in pendingFriendsReceived) {
      if (pendingFriendsReceived[i].id === id)
        isAsking = true;    
    }
    isAsking && updateFriendsRequests(id);

    const block = await fetch (`/api/users/${getUserData().id}`, {
      method: "PATCH",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({blockedUsers: [{"id": id}]}),
    });
    if (block.ok) {
      setBlocked([...blocked, {"id": id, "username": username}]);
      setSuggested(suggested.filter(
        item => item.id !== id
      ));
      setAlert({ type: 'success', content: `User ${username} blocked` });
    }
    else
      setAlert({ type: 'error', content: `Error while blocking ${username}` });
  }
  

  const removeRelation = async (id: string, username:string, action: string, list42: boolean) => {
    const remove = await fetch (`/api/users/${getUserData().id}/${id}/${action}`, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json",
      },
    });
    if (remove.ok) {
      let updated: User[];
      let updated42: User[] = [];

      if (action === 'unblock') 
        updated = blocked.filter(
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
        list42 && setFriends42(updated42);
        setSuggested([...suggested, {"id": id, "username": username}]);
        await fetch (`/api/users/${id}/${getUserData().id}/${action}`, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json",
          },
        });
      }
      else if (action === 'unblock') {
        setBlocked(updated);
        setSuggested(updated.filter(
          item => item.id !== id
        ));
      }
      setAlert({ type: 'success', content: `${action === 'friend' ? `Friendship with ${username} destroyed` : `User ${username} unblocked successfully`}` });
    }
    else
      setAlert({ type: 'error', content: `${action === 'friend' ? `Error while killing friendship with ${username}` : `Error while unblocking ${username}`}` });
  }

  const checkRelation = (id: string, list: User[]) => {
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
    (list.length) ?
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
          
          {(!checkRelation(id, blocked)) ?
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
    :
    (type === 'friends' || type === 'friends42' || type === 'pending') ?
    <div className="text-center py-16">
      <h1 className="m-5 uppercase text-7xl text-gray-700 tracking-widest">
        Nothing here
      </h1>
      <h3 className="m-3 text-gray-500 text-2xl tracking-widest">
          Have a look at recommandations
      </h3>
      <button className="m-5" onClick={() => {setSelected(4);}}>
          <IoIosArrowForward className="text-pink-600 text-2xl hover:animate-bounceForward hover:cursor-pointer"/>
      </button>
    </div>
    :
    (type === 'blocked') ?
    <h1 className="py-16 text-center m-5 uppercase text-7xl text-gray-700 tracking-widest">
        Nothing here
    </h1>
    :
    <div className="text-center py-16">
      <h1 className="m-5 uppercase text-7xl text-gray-700 tracking-widest">
          No suggestion
      </h1>
      <h3 className="m-3 text-gray-500 text-2xl tracking-widest">
          Go outside IRL make friends ;)
      </h3>
    </div>
  )
}

export default FriendsTable;