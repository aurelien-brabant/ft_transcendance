import { useEffect, useState } from "react";
import { FaUserFriends, FaGamepad } from "react-icons/fa";
import { RiMedalLine } from "react-icons/ri";
import { useSession } from "../hooks/use-session";

const getAchievements = (type: string) => {
    return (
        <div className="flex justify-center">
            {type === 'friends' && <FaUserFriends className="text-7xl"/>}
            {type === 'wins' && <RiMedalLine className="text-7xl"/>}
            {type === 'games' && <FaGamepad className="text-7xl"/>}
        </div>
    );
}

const Achievements: React.FC<{}> = () => {
    const { user } = useSession();
//    const { getUserData } = useContext(authContext) as AuthContextType;
//    const [achievements, setAchievements] = useState(getUserData().achievements);
    const [achievements, setAchievements] = useState(user.achievements);
    const [achievementsList, setAchievementsList] = useState([]);
  
    const getData = async () => {
        const reqList = await fetch('/api/achievements')
        const list = await reqList.json();
        setAchievementsList(list);
        setAchievements(user.achievements);
//        setAchievements(getUserData().achievements)
    }

    useEffect(() => {
        getData();
      }, [])

    const getColor = (levelToReach: number, type: string) => {

        for (let i in achievements) {
            if (achievements[i].levelToReach === levelToReach && achievements[i].type === type  && levelToReach === 10)
                return "text-yellow-500"
            else if (achievements[i].levelToReach === levelToReach && achievements[i].type === type && levelToReach === 3)
                return "text-zinc-400"
            else if (achievements[i].levelToReach === levelToReach && achievements[i].type === type && levelToReach === 1)
                return "text-orange-800"
        }
        return "text-gray-500/50"
    }

    const getBorderColor = (levelToReach: number, type: string) => {

        for (let i in achievements) {
            if (achievements[i].levelToReach === levelToReach && achievements[i].type === type  && levelToReach === 10)
                return "ring-4 ring-yellow-500/20 border border-yellow-500 border-8"
            else if (achievements[i].levelToReach === levelToReach && achievements[i].type === type && levelToReach === 3)
                return "ring-2 ring-zinc-400/20 border border-zinc-400  border-4"
            else if (achievements[i].levelToReach === levelToReach && achievements[i].type === type && levelToReach === 1)
                return "ring ring-orange-800/20 border border-orange-800 border-2"
        }
        return "border border-dashed border-gray-500"
    }
    return (
        <ul className="text-gray-500 place-items-stretch grid grid-cols-3 text-center my-10">
            {achievementsList.map(({id, type, description, levelToReach}) => (
                <li
                    className={`${getColor(levelToReach, type)} flex-col justify-center my-5 p-3`}
                    key={id}>
                        <div className={`${getBorderColor(levelToReach, type)} flex-col justify-center rounded-full p-5`}>
                            {getAchievements(type)}
                            <div>
                                {description}
                            </div>
                        </div>
                </li>
            ))}
        </ul>
    )
};

export default Achievements;