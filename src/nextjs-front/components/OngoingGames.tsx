import { Socket } from 'socket.io-client';
import React from "react";
import { EyeIcon } from '@heroicons/react/outline'

const OngoingGames: React.FC<{currentGamesProps: Array<string>, socketProps: Socket}> = ({currentGamesProps, socketProps}) => {  
    let currentGames: Array<string> = currentGamesProps;

    const spectate = (e: React.MouseEvent<HTMLButtonElement>) => {
        socketProps.emit("spectateRoom", e.currentTarget.value);
    }

    const removeTimestamp = (roomId: string) => {
        /**
         * If the room ID starts with a number, remove the timestamp.
         * Usernames never start with a number.
         */
        let i = 0;

        if (!isNaN(Number(roomId[i]))) {
            while (!isNaN(Number(roomId[i])))
                ++i;
            return roomId.substring(i);
        }
        return roomId;
    }

    return (
        <div className={'mt-14'}>
        <h2 className={'text-xl md:text-2xl lg:text-3xl border-b-4 rounded-sm pb-2 border-02dp'}>On going games</h2>
        <ul role="list" className="mt-8 grid grid-cols-1 gap-6 xs:grid-cols-2 xl:grid-cols-3">
            {currentGamesProps.map((roomId) => {
                const [username1, username2] = removeTimestamp(roomId).split('&');
                return (
                    <li key={roomId} className="col-span-1 bg-04dp rounded-lg shadow divide-y divide-01dp">
                        <div className="w-full flex items-center justify-between p-6 space-x-6">
                            <div className={'flex items-center flex-col gap-y-3'}>
                                <img className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" src={`/api/users/${username1}/photo`} alt="" />
                                <span className={'text-white/90 text-xs font-medium'}>{username1}</span>
                            </div>
                            <span className={'text-xl text-pink-500 font-extrabold'}>VS</span>
                            <div className={'flex items-center flex-col gap-y-3'}>
                                <img className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" src={`/api/users/${username2}/photo`} alt="" />
                                <span className={'text-white/90 text-xs font-medium'}>{username2}</span>
                            </div>
                        </div>

                        <div>
                            <div className="-mt-px flex divide-x divide-gray-200">
                                <div className="w-0 flex-1 flex">
                                    <button
                                        value={roomId}
                                        onClick={spectate}
                                        className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-white/90 font-medium border border-transparent rounded-bl-lg hover:text-white"
                                    >
                                        <EyeIcon className="w-5 h-5 text-white/90" aria-hidden="true" />
                                        <span className="ml-3">Spectate</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>
                );
            }
            )}
        </ul></div>
    )
    

    /*
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
                                    <div key={roomId} className='my-2 text-neutral-200 flex align-items w-max border border-gray-500 bg-gray-500'>
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
    */
};

export default OngoingGames;
