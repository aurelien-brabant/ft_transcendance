import { Socket } from 'socket.io-client';
import React from "react";

const OngoingGames: React.FC<{currentGamesProps: Array<string>, socketProps: Socket}> = ({currentGamesProps, socketProps}) => {  
    let currentGames: Array<string> = currentGamesProps;

    const spectate = (e: React.MouseEvent<HTMLButtonElement>) => {
        socketProps.emit("spectateRoom", e.currentTarget.value);
    }

    return (
        <div className="flex flex-col py-3">
                {
                    (currentGames.length !== 0) ?
                        <div className='overflow-y-auto overflow-x-hidden max-h-96 w-max'>
                            <h2 className="flex justify-center py-10 mx-auto text-xl uppercase drop-shadow-md text-bold text-pink-600">
                                Currently Playing
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-10 gap-y-6 gap-x-6">
                            {
                                currentGames.map((roomId: string) => (
                                    // eslint-disable-next-line react/jsx-key
                                    <div className='my-2 text-neutral-200 flex align-items w-max border border-gray-500 bg-gray-500'>
                                        <div className="px-6 font-bold drop-shadow-md text-bold my-auto ">
                                            {roomId.split("&").join(" VS ")}
                                        </div>
                                        <button onClick={spectate} value={roomId} className="px-6 py-2 text-xl uppercase transition hover:bg-sky-600 bg-gray-600 drop-shadow-md text-bold text-neutral-200">
                                            Spectate
                                        </button>
                                    </div>
                                ))
                            }
                            </div>
                        </div>
                    :
                        <p className="px-6 py-2 my-10 mx-auto text-xl font-bold drop-shadow-md text-bold text-pink-600">Nobody is playing</p>
                }

        </div>
    )
};

export default OngoingGames;
