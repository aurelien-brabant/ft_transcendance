import { useContext, useEffect, useState } from "react";
//import notificationsContext, { NotificationsContextType } from "../context/notifications/notificationsContext";

const Achievements: React.FC<{}> = () => {
    //const { notifications, notify, setNotifications } = useContext(notificationsContext) as NotificationsContextType;
    const [achievements, setAchievements] = useState([])
    
    const getData = async () => {
        const req = await fetch('/api/achievements')
        const data = await req.json();
        setAchievements(data);
    }
    
//    const list = [{id: 1, name:"test"},{id: 2, name:"test2"}]

    useEffect(() => {
        getData();
        //        setNotifications([...notifications, {category: 'test3', content: 'test3'}])
  //      setNotifications([...notifications, {category: 'test', content: 'test'}])
//           setNotifications([...notifications, {id: 13, category: 'test', content: 'test from id 13', issuedAt: new Date(Date.now())}, {id: 3, category: 'test2', content: 'test2 from id3', issuedAt: new Date(Date.now())}])
  //       setNotifications([...notifications, {id: 13, category: 'test3', content: 'test3 from id 13', issuedAt: new Date(Date.now())}, {id: 3, category: 'test4', content: 'test4 from id3', issuedAt: new Date(Date.now())}])
      }, [])
    
    return (
        <li>
            {achievements.map(({id, achievement}) => (
                <ul key={id}>
                    <p>{achievement}</p>
                </ul>
            ))}
        </li>
    )
};

export default Achievements;