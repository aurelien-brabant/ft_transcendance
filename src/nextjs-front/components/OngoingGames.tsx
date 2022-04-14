import { Socket } from 'socket.io-client';
import React from "react";
    
const OngoingGames: React.FC<{currentGamesProps: Array<string>, socketProps: Socket}> = ({currentGamesProps, socketProps}) => {  
    let currentGames: Array<string> = currentGamesProps;

    const spectate = (e: React.MouseEvent<HTMLButtonElement>) => {
		socketProps.emit("spectateRoom", e.currentTarget.value);
	}

    return (
        <>
        {
            (currentGames.length !== 0) ?
                <tbody>
                {
                    currentGames.map((roomId: string) => (
                        <tr className='text-neutral-200'>
                            Room: {roomId}
                            <button onClick={spectate} value={roomId} className="px-6 py-2 text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">
							    Spectate
    						</button>
                        </tr>
                    ))
                }
                </tbody>
            :
                <p className="px-6 py-2 mx-auto mt-60 text-xl font-bold drop-shadow-md text-bold text-pink-600">Nobody is playing</p>
            }
        </>
    )
};

export default OngoingGames;
