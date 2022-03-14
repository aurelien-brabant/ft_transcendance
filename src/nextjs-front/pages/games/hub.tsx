import { Fragment, useEffect } from "react";
import { io, Socket }from 'socket.io-client';
import Head from "next/head";
// import withDashboardLayout from "../../components/hoc/withDashboardLayout";

let socket: Socket;
// const Hub: NextPageWithLayout = () => {
const Hub: React.FC = () => {

	const joinQueue = () => {
		console.log("Joining Queue");
		socket.emit("join");
	}

	useEffect((): any => {
		// connect to socket server
		socket = io("localhost");

		// log socket connection
		socket.on("connect", () => {
			console.log("SOCKET CONNECTED!", socket.id);
		});

		// // socket disconnet onUnmount if exists
		// if (socket) return () => socket.disconnect();
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
