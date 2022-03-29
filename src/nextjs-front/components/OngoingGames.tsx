import {io, Socket} from 'socket.io-client';
import { useEffect, useState } from "react";
import { IRoom } from "../gameObjects/GameObject";

let socket: Socket;

// const getCurrentGames = async () => {
//     const req = await fetch(`/api/games`, {
//         headers: {
//             "Content-Type": "application/json",
//           },
//     })
//     const data = await req.json();
//     const dataToKeep = []
//     for (const element of data) {
//         if (element.endedAt) {
//             console.log("hello")
//         } else {
//             dataToKeep.push(element)
//             console.log("ongoing")
//         }
//     }
//     console.log(dataToKeep)
//     console.log(getCurrentGames)
// }
//  const displayCurrentGames = async (getCurrentGames:any) => {
    // 	const gamesToMap = getCurrentGames()
    //     for (const i in gamesToMap) {
    //       const ongoingGamesId = (gamesToMap[i].endedAt !== null) ? gamesToMap[i].id : "";
    //       const req = await fetch (`/api/games/${ongoingGamesId}`)
    //       const res = await req.json();
    //     }
//   }
    
const OngoingGames:React.FC = () => {
    // let roomData: IRoom;
    // let roomId: string | undefined;
    const [rooms, setRooms] = useState<Map<string, IRoom> | null>(null);
    // const [rooms, setRooms] = useState<Map<string, IRoom> | null>(null);
    useEffect((): any => {
		socket = io("localhost");
        // Allow reconnection    
        socket.on("currentGamesUpdate", (newRoomData: Map<string, IRoom>) => {
            setRooms(newRoomData);
            // return () => {};
        });
    }, [])
    // const [room, setRoom] = useState<IRoom | null>(null);
    
    return (
        // <tbody>
        (rooms) ?
            rooms.forEach((room:IRoom) => {
                <tr>
                    key={room.id}
                </tr>
            })
            :
            <p className="px-6 py-2 mx-auto mt-60 text-xl font-bold drop-shadow-md text-bold text-pink-600">Nobody is playing</p>
        // </tbody>
    )
};

export default OngoingGames;
