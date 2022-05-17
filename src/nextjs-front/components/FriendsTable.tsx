import Link from "next/link";
import Image from 'next/image';
import { useContext } from "react";
import { AiOutlineCheck, AiOutlineClose, AiOutlineFall, AiOutlineUserAdd, AiOutlineUserDelete } from "react-icons/ai";
import { FaMedal, FaUserSlash } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { RiUserHeartLine } from "react-icons/ri";
import { User } from 'transcendance-types';
import ResponsiveFade from "./ResponsiveFade";
import Tooltip from "./Tooltip";
import { useSession } from "../hooks/use-session";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import relationshipContext, { RelationshipContextType } from "../context/relationship/relationshipContext";

/* Friends and Duoquadra friends */
const FriendsTable: React.FC<{ category: string, list: User[], setSelected: any }> = ({
  category, list, setSelected
}) => {
  // const { user: currentUser, backend } = useSession();
  // const { setAlert } = useContext(alertContext) as AlertContextType;
  // const {
  //   friends, setFriends,
  //   friends42, setFriends42,
  //   blocked, setBlocked,
  //   pendingFriendsReceived, setPendingFriendsReceived,
  //   pendingFriendsSent, setPendingFriendsSent
  // } = useContext(relationshipContext) as RelationshipContextType;
  const gridStyle = "place-items-stretch grid md:grid grid-cols-2 md:grid-cols-3 gap-10 text-center pt-10 pb-10"; // ${category === 'suggested' && "pr-0 md:pr-3"}
  const userCardStyle = "text-pink-600 justity-items-center px-5 pt-2 pb-7 bg-01dp border border-pink-600 rounded  hover:bg-03dp hover:text-inherit md:transition md:transform md:ease-in md:hover:-translate-y-2";
  const actionTooltipStyles = "font-bold bg-dark text-neutral-200";
  const neutralIconStyle = "p-2 text-2xl text-gray-900 bg-white rounded-full transition hover:scale-105";

  const getUserCard = (user: User) => {
    return (
      <Link href={`/users/${user.id}`}>
      <a>
        <div className="grid grid-cols-2 m-2 space-x-3">
          <div className="grid grid-cols-1 text-center place-items-center text-yellow-500 border-pink-600 bg-inherit">
            <FaMedal/> {user.wins}
          </div>
          <div className="grid grid-cols-1 text-center place-items-center text-red-500 bg-inherit">
            <AiOutlineFall className="text-xl font-bold"/> {user.losses}
          </div>
        </div>
  
        <img
        className="justify-content-center"
        src={`/api/users/${user.id}/photo`}
        height="100%"
        width="100%"
        />
  
        {user.duoquadra_login &&
        <div className="invisible md:visible absolute top-16 right-4">
          <div className="flex flex-col items-center p-2">
            <div
              style={{ backgroundColor: "#00babc" }}
              className="opacity-60 border border-black rounded-full pb-0 pt-2 pr-2 pl-2"
            >
            <Image
              src="/plain_logo.svg"
              width={25}
              height={25}
              alt="42 Badge"
            />
            </div>
          </div>
        </div>}
  
        <p className="place-content-evenly text-ellipsis overflow-hidden cursor-pointer font-bold">
          {user.username}
        </p>
      </a>
    </Link>
    );
  }

  const getActionButtons = (category: string) => {
    if (category === "blocked") {
      return (
        <div className="relative md:absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-6">
  
          <Tooltip className={actionTooltipStyles} content="Unblock">
            <button className={neutralIconStyle}>
              <RiUserHeartLine />
            </button>
          </Tooltip>
  
        </div>
      );
    } else if (category === "pending") {
      return (
        <div className="relative md:absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-6">
  
          <Tooltip className={actionTooltipStyles} content="Accept friend">
            <button className={neutralIconStyle}>
              <AiOutlineCheck />
            </button>
          </Tooltip>

          <Tooltip className={actionTooltipStyles} content="Decline invite">
            <button className={neutralIconStyle}>
              <AiOutlineClose />
            </button>
          </Tooltip>
  
        </div>
      );
    }

    return (
      <div className="relative md:absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-6">

        {(category === "friends") &&
        <Tooltip className={actionTooltipStyles} content="Remove friend">
          <button className={neutralIconStyle}>
            <AiOutlineUserDelete />
          </button>
        </Tooltip>}

        {(category === "suggested") &&
        <Tooltip className={actionTooltipStyles} content="Add friend">
          <button className={neutralIconStyle}>
            <AiOutlineUserAdd />
          </button>
        </Tooltip>}

        <Tooltip className={actionTooltipStyles} content="Block">
          <button className={neutralIconStyle}>
            <FaUserSlash />
          </button>
        </Tooltip>

      </div>
    );
  }

  if (list.length > 0) {
    return (
      <ul className={gridStyle}>
        <ResponsiveFade 
          useMediaQueryArg={{ query: "(min-width: 1280px)" }}
          cascade triggerOnce duration={500}
        >

        {/* List */}
        {list.map((user) => (
          <li key={user.id} className={userCardStyle} >
            {getUserCard(user)}
            {getActionButtons(category)}
          </li>
        ))}

        </ResponsiveFade>
      </ul>
    );
  } else {
    /* List is empty */
    const headline = (category === 'suggested') ? "No suggestion" : "Nothing here";
    const redirToSuggestion = (category !== 'suggested' && category !== 'blocked');

    return (
      <div className="text-center pt-14">
        <h1 className="m-5 uppercase text-7xl text-gray-700 tracking-widest">
          {headline}
        </h1>
        {redirToSuggestion &&
        <>
          <h3 className="m-3 text-gray-500 text-2xl tracking-widest">
              Have a look at recommandations
          </h3>
          <button className="m-5" onClick={() => {setSelected(4);}}>
              <IoIosArrowForward className="text-pink-600 text-2xl hover:animate-bounceForward hover:cursor-pointer"/>
          </button>
        </>}
        {(category === 'suggested') &&
        <h3 className="m-3 text-gray-500 text-2xl tracking-widest">
          Go outside IRL make friends ;)
        </h3>}
      </div>
    );
  }
}

  // const updateFriendsRequests = (id: string) => {
  //   backend.request(`/api/users/${user.id}/${id}/removeFriendsReceived`, {
  //     method: "DELETE",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  // }

  // const requestFriend = async (id: string, username: string, isDuoQuadra: boolean) => {
  //   const req = await backend.request(`/api/users/${user.id}`);
  //   const data = await req.json();
  //   const received = data.pendingFriendsReceived;
  //   let isAsking: boolean = false;

  //   for (let i in received) {
  //     if (received[i].id === id)
  //       isAsking = true;
  //   }

  //   if (isAsking) {
  //     updateFriendsRequests(id);

  //     const addFriend = await backend.request(`/api/users/${user.id}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         friends: [ { "id": id } ]
  //       }),
  //     });

  //     if (addFriend.ok) {
  //       setPendingFriendsReceived(pendingFriendsReceived.filter(
  //         item => item.id !== id
  //       ));
  //       setFriends([...friends, {"id": id, "username": username}]);
  //       isDuoQuadra && setFriends42([...friends42, {"id": id, "username": username}]);
  //       setAlert({ type: 'info', content: `New friend: ${username}` });
  //     }
  //     else
  //       setAlert({ type: 'error', content: `Error while adding ${username} as friend` });  
  //   }
  //   else {
  //     const reqSent = await backend.request(`/api/users/${user.id}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         pendingFriendsSent: [ { "id": id } ]
  //       }),
  //     });

  //     if (reqSent.ok) {
  //       //TO DO CHECK ACHIEVEMENTS FOR UPDATING
  //       setSuggested(suggestedUsers.filter(
  //         item => item.id !== id
  //       ));
  //       setPendingFriendsSent([ ...pendingFriendsSent, { "id": id, "username": username } ]);
  //       setAlert({
  //         type: 'info',
  //         content: `Friend request sent to ${username}`
  //       });
  //     }
  //     else {
  //       setAlert({
  //         type: 'error',
  //         content: `Error while sending friend request to ${username}`
  //       });
  //     }
  //   }
  // }

  // const blockUser = async (id: string, username: string) => {
  //   let isAsking: boolean = false;

  //   for (let i in pendingFriendsReceived) {
  //     if (pendingFriendsReceived[i].id === id)
  //       isAsking = true;
  //   }
  //   isAsking && updateFriendsRequests(id);

  //   const block = await backend.request(`/api/users/${user.id}`, {
  //     method: "PATCH",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       blockedUsers: [ { "id": id } ]
  //     }),
  //   });

  //   if (block.ok) {
  //     setBlocked([ ...blocked, { "id": id, "username": username } ]);
  //     setSuggested(suggestedUsers.filter(
  //       item => item.id !== id
  //     ));
  //     setAlert({
  //       type: 'success',
  //       content: `User ${username} blocked`
  //     });
  //   } else {
  //     setAlert({
  //       type: 'error',
  //       content: `Error while blocking ${username}`
  //     });
  //   }
  // }

  // const removeRelation = async (id: string, username:string, action: string, list42: boolean) => {
  //   const remove = await backend.request(`/api/users/${user.id}/${id}/${action}`, {
  //     method: "DELETE",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });

  //   if (remove.ok) {
  //     let updated: User[];
  //     let updated42: User[] = [];

  //     if (action === 'unblock') {
  //       updated = blocked.filter(
  //         item => item.id !== id
  //       );
  //     } else {
  //       updated = friends.filter(
  //         item => item.id !== id
  //       );
  //       updated42 = friends42.filter(
  //         item => item.id !== id
  //       );
  //     }

  //     if (action === 'friend') {
  //       setFriends(updated);
  //       list42 && setFriends42(updated42);
  //       setSuggested([ ...suggestedUsers, { "id": id, "username": username } ]);
  //     } else if (action === 'unblock') {
  //       setBlocked(updated);
  //       setSuggested(updated.filter(
  //         item => item.id !== id
  //       ));
  //     }

  //     setAlert({
  //       type: 'success',
  //       content: `${action === 'friend' ? `Friendship with ${username} destroyed` : `User ${username} unblocked successfully`}`
  //     });
  //   } else {
  //     setAlert({
  //       type: 'error',
  //       content: `${action === 'friend' ? `Error while killing friendship with ${username}` : `Error while unblocking ${username}`}`
  //     });
  //   }
  // }

  // const checkRelation = (id: string, list: User[]) => {
  //   for (let i in list) {
  //     if (list[i].id === id) {
  //       return true;
  //     }
  //   }
  //   return false
  // }

  // const hasAlreadyAsked = (id: string, list: any) => {
  //   const invites = list.pendingFriendsSent;

  //   for (let i in invites) {
  //     if (invites[i].id === id) {
  //       return true;
  //     }
  //   }
  //   return false
  // }

export default FriendsTable;
