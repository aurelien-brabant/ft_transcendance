import { Fragment, useEffect, useState, useContext } from "react";
import { io, Socket } from 'socket.io-client';
import Head from "next/head";
import withDashboardLayout from "../components/hoc/withDashboardLayout";
import Canvas from "../components/Canvas";
import { IRoom, User } from "../gameObjects/GameObject";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import { useSession } from "../hooks/use-session";
import { NextPageWithLayout } from "./_app";
// import socketContext, { SocketContextType } from "../context/socket/socketContext";
import { Feature, features } from "../constants/feature";
import ResponsiveFade from "../components/ResponsiveFade";
import Link from "next/link";

let socket: Socket;

const Hub: NextPageWithLayout = () => {
	const { user } = useSession();
	const { setAlert } = useContext(alertContext) as AlertContextType;
	// const { socket } = useContext(socketContext) as SocketContextType;
	const [displayGame, setDisplayGame] = useState(false);
	const [inQueue, setInQueue] = useState(false);
	const [room, setRoom] = useState<IRoom | null>(null);

	let roomData: IRoom;
	let roomId: string | undefined;
	let userData: User = {id: user.id, username: user.username};

	const joinQueue = () => {
		socket.emit("joinQueue", userData.username);
	}

	const leaveQueue = () => {
		socket.emit("leaveQueue");
	}

	const spectate = () => {
		socket.emit("spectateRoom", "funny_test212&ancient_test211");
	}

	useEffect((): any => {
		// connect to socket server
		socket = io("localhost:8080");

		socket.on("connect", () => {
			// Allow reconnection
			socket.emit("handleUserConnect", userData);

			socket.on("newRoom", (newRoomData: IRoom) => {
					socket.emit("joinRoom", newRoomData.roomId);
					roomData = newRoomData;
					roomId = newRoomData.roomId;
					setRoom(roomData);
					setInQueue(false);
			});

			socket.on("joinedQueue", (data: IRoom) => {
				setInQueue(true);
				setAlert({
					type: "info",
					content: "You were added to Queue"
				});
			});

			socket.on("leavedQueue", (data: IRoom) => {
				setInQueue(false);
				setAlert({
					type: "info",
					content: "You were removed from Queue"
				});	
			});

			socket.on("joinedRoom", (data: IRoom) => {
				setDisplayGame(true);
				setAlert({
					type: "info",
					content: `Game joined`
				});
			});

			socket.on("leavedRoom", (data: IRoom) => {
				roomId = undefined;
				setDisplayGame(false);
				setRoom(null);
			});
		});

		return () => {
			if (socket)
				socket.disconnect();
		}
  }, []);


  const lastGames = async () => {

    const req = await fetch(`/api/games`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
//        body: JSON.stringify({accountDeactivated: false})
      });
      const res = await req.json();
    //   console.log('req', req);
    //   console.log('res', res)
	  return (JSON.parse(JSON.stringify(res)))
  }

  const FeatureItem: React.FC<Feature> = ({ label, description, Icon }) => (
	<div className="flex flex-col items-center justify-between h-full text-xl text-center text-neutral-200 gap-y-8">
	  <div className="flex flex-col items-center gap-8">
		<div className="flex items-center justify-center p-5 text-white bg-pink-600 rounded-full drop-shadow-md">
		  <Icon className="text-6xl fill-white" />
		</div>
		<ResponsiveFade
		  useMediaQueryArg={{ query: "(min-width: 1280px)" }}
		  direction="down"
		  duration={800}
		>
		  <h3 className="text-3xl font-bold text-white">{label}</h3>
		</ResponsiveFade>
	  </div>
	  <ResponsiveFade useMediaQueryArg={{ query: "(min-width: 1280px)" }}>
		<p>{description}</p>
	  </ResponsiveFade>
	</div>
  );


//     const competitors = async () => {

//     const req = await fetch(`/api/users`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//       });
//       const res = await req.json();
// 	  console.log('req', req);
//       console.log('res', res)
//   }
  

	return (
		<Fragment>
			<Head>
				<title>Hub | ft_transcendance</title>
				<meta
					name="description"
					content="This is the Hub"
				/>
			</Head>
			
			{
				displayGame ?
						<Canvas socketProps={socket} roomProps={room}></Canvas>
				:
				(
					<>
						<h1>Hello World!</h1>
						<section id="features" className="bg-gray-900">
							<div className="flex flex-col items-center py-16 md:mx-auto md:container gap-y-8">
								<div className="relative grid md:grid-cols-3 gap-16">
								<div className="absolute hidden h-1 bg-white rounded left-48 right-48 top-12 lg:block" />
								{/* {features.map((feature) => (
									<FeatureItem key={feature.label} {...feature} />
								))} */}
								</div>
								<Link href="/">
								<a className="px-10 py-2 mx-auto mt-4 text-xl font-bold uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">
									Enter the fight
								</a>
								</Link>
							</div>
						</section>
						{
						inQueue ?
							<button onClick={leaveQueue} className="px-6 py-2 text-xl uppercase bg-grey-600 drop-shadow-md text-bold text-neutral-200">Cancel</button>
						:
							<button onClick={joinQueue} className="px-6 py-2 text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">Find a match</button>
						}
						<button onClick={spectate} className="px-6 py-2 text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">
							Spectate
						</button>
					</>
				)
			}
			

		</Fragment>
		
	);
}


Hub.getLayout = withDashboardLayout;
Hub.authConfig = true;
export default Hub
