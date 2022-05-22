import { Socket } from 'socket.io-client';
import React from "react";
import { EyeIcon } from '@heroicons/react/outline';
import { onGoingGame } from '../pages/hub';

const OngoingGames: React.FC<{currentGamesProps: onGoingGame[], socketProps: Socket}> = ({currentGamesProps, socketProps}) => {  
    const currentGames: onGoingGame[] = currentGamesProps;

    const spectate = (e: React.MouseEvent<HTMLButtonElement>) => {
        socketProps.emit("spectateRoom", e.currentTarget.value);
    }

    return (
        <div className={'mt-14'}>
        <h2 className={'text-xl md:text-2xl lg:text-3xl border-b-4 rounded-sm pb-2 border-02dp'}>On going games</h2>
        <ul role="list" className="mt-8 grid grid-cols-1 gap-6 xs:grid-cols-2 xl:grid-cols-3">
            {currentGames.map((room) => {
                return (
                    <li key={room.roomId} className="col-span-1 bg-04dp rounded-lg shadow divide-y divide-01dp">
                        <div className="w-full flex items-center justify-between p-6 space-x-6">
                            <div className={'flex items-center flex-col gap-y-3'}>
                                <img className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" src={`/api/users/${room.playerOne}/photo`} alt="" />
                                <span className={'text-white/90 text-xs font-medium'}>{room.playerOne}</span>
                            </div>
                            <span className={'text-xl text-pink-500 font-extrabold'}>VS</span>
                            <div className={'flex items-center flex-col gap-y-3'}>
                                <img className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" src={`/api/users/${room.playerTwo}/photo`} alt="" />
                                <span className={'text-white/90 text-xs font-medium'}>{room.playerTwo}</span>
                            </div>
                        </div>

                        <div>
                            <div className="-mt-px flex divide-x divide-gray-200">
                                <div className="w-0 flex-1 flex">
                                    <button
                                        value={room.roomId}
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
};

export default OngoingGames;
