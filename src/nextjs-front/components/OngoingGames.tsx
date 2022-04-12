import { Socket } from 'socket.io-client';
import React, { useEffect, useState } from "react";
import { IRoom } from "../gameObjects/GameObject";
    
const OngoingGames: React.FC<{socketProps: Socket}> = ({socketProps}) => {

    const [rooms, setRooms] = useState<Map<string, IRoom> | null>(null);
    const socket: Socket = socketProps;

    useEffect((): any => {
        if (socket) {
            console.log("socket is defined");
            socket.on("updateCurrentGames", (newRoomData: Map<string, IRoom>) => {
                console.log("received new rooom data");
                console.log(newRoomData);
                
                setRooms(newRoomData);
            });
            socket.emit("getCurrentGames");
        } else
            console.log("Socket is undefined");
            
        // return () => {};
    }, []);
    
    return (
        <>
        {
            (rooms) ?
                rooms.forEach((room:IRoom) => {
                    <tr>
                        key={room.roomId}
                    </tr>
                })
            :
                <p className="px-6 py-2 mx-auto mt-60 text-xl font-bold drop-shadow-md text-bold text-pink-600">Nobody is playing</p>
            }
        </>
    )
};

export default OngoingGames;
