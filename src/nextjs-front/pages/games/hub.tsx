import { Fragment, useEffect } from "react";
import { io, Socket }from 'socket.io-client';
import Head from "next/head";
// import withDashboardLayout from "../../components/hoc/withDashboardLayout";

let socket: Socket;
// const Hub: NextPageWithLayout = () => {
const Hub: React.FC = () => {

	const joinQueue = () => {
		console.log("Joining Queue");
		socket.emit("joinQueue");
	}

	useEffect((): any => {
		// connect to socket server
		socket = io("localhost");

		socket.on("connect", () => {
			console.log("Socket connected !", socket.id);

			socket.on("addedToQueue", () => {
				console.log("You were added to the queue");
			});

			socket.on("roomId", function(room: string) {
					socket.emit("joinRoom", room);
			});

			socket.on("joinedRoom", (data: string) => {
				console.log(data);
			});
		});

		// socket disconnect onUnmount if exists
		return () => {
			if (socket)
				socket.disconnect();
		}
  }, []);

	return (
		<Fragment>
			<Head>
				<title>Hub | ft_transcendance</title>
				<meta
					name="description"
					content="This is the Hub"
				/>
			</Head>
			<h1>Hello World!</h1>
			<button onClick={joinQueue}>Find a match</button>
		</Fragment>
	);
}

// Hub.getLayout = withDashboardLayout;
export default Hub
