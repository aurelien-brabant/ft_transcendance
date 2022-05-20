import { useEffect, useState } from "react";
import { FaUserFriends, FaGamepad } from "react-icons/fa";
import { RiMedalLine } from "react-icons/ri";
import { Achievement } from "transcendance-types";

type UserAchievement = {
    id: string;
    type: string;
    levelReached: number;
};

const Achievements: React.FC<{ userId: string }> = ({ userId }) => {
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
    const [achievementsList, setAchievementsList] = useState<Achievement[]>([]);

    /* Update user's informations */
    const updateUserAchievements = async (achievements: Achievement[]) => {
        const userAchievements: UserAchievement[] = [];

        for (const achievement of achievements) {
            userAchievements.push({
                id: userAchievements.length.toString(),
                type: achievement.type,
                levelReached: achievement.levelToReach,
            });
        }
        setUserAchievements(userAchievements);
    };

    /* Fetch achievements data on mount */
    const getUserAchievements = async (userId: string) => {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();

        updateUserAchievements(data.achievements);
    }

    const getAchievementsData = async () => {
        const res = await fetch('/api/achievements');
        const data = await res.json();

        setAchievementsList(data);
    }

    useEffect(() => {
        getAchievementsData();
        getUserAchievements(userId);
    }, [])

    /* Set list */
    const getAchievementColor = (levelToReach: number, type: string) => {
        for (const achievement of userAchievements) {
            if (achievement.levelReached === levelToReach && achievement.type === type && levelToReach === 10)
                return "text-yellow-400"
            else if (achievement.levelReached === levelToReach && achievement.type === type && levelToReach === 3)
                return "text-stone-400"
            else if (achievement.levelReached === levelToReach && achievement.type === type && levelToReach === 1)
                return "text-amber-700"
        }
        return "text-gray-500/50"
    }

    const getBorderColor = (levelToReach: number, type: string) => {
        for (const achievement of userAchievements) {
            if (achievement.levelReached === levelToReach && achievement.type === type && levelToReach === 10)
                return "ring-4 ring-yellow-400/20 border border-yellow-400 border-8"
            else if (achievement.levelReached === levelToReach && achievement.type === type && levelToReach === 3)
                return "ring-2 ring-stone-400/20 border border-stone-400 border-4"
            else if (achievement.levelReached === levelToReach && achievement.type === type && levelToReach === 1)
                return "ring ring-amber-700/20 border border-amber-700 border-2"
        }
        return "border border-dashed border-gray-500"
    }

    const getAchievementIcon = (type: string) => {
        return (
            <div className="flex justify-center">
                {type === 'friends' && <FaUserFriends className="text-7xl"/>}
                {type === 'wins' && <RiMedalLine className="text-7xl"/>}
                {type === 'games' && <FaGamepad className="text-7xl"/>}
            </div>
        );
    }

    return (
        <ul className="text-gray-500 place-items-stretch grid grid-cols-3 text-center my-10">
            {achievementsList.map(({id, type, description, levelToReach}) => (
                <li
                    key={id}
                    className={`${getAchievementColor(levelToReach, type)} flex-col justify-center my-5 p-3`}
                >
                    <div className={`${getBorderColor(levelToReach, type)} flex-col justify-center rounded-full p-5`}>
                        {getAchievementIcon(type)}
                        <div>{description}</div>
                    </div>
                </li>
            ))}
        </ul>
    )
};

export default Achievements;