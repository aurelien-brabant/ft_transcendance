import { Fragment, useEffect } from "react";
import io from 'socket.io-client';
import Head from "next/head";
import withDashboardLayout from "../../components/hoc/withDashboardLayout";

// const Hub: NextPageWithLayout = () => {
const Hub: React.FC = () => {
	useEffect((): any => {
    // connect to socket server
	const socket = io("ws://localhost", {
	  reconnectionDelayMax: 10000,
	  path: '/api'
	});
	// .connect("/api")
	socket.emit('hello', { msg: "Hello"});

    // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
    });

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

	// useEffect(() => socketInitializer(), []);
	//
	// const socketInitializer = async () => {
	// 	await fetch("/api/games");
	// 	// socket = io("http://localhost/api/games", { cors: { origin: "*"}});
	// 	// socket = io();
	//
	// 	console.log("Trying to join", socket);
	//
	// 	socket.on('connect', (data) => {
	// 		console.log(data);
	// 		console.log("connected");
	// 	});
	//
	// 	socket.emit('hello');
	// 	return null;
	// }

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
		</Fragment>
	);
}

// Hub.getLayout = withDashboardLayout;
export default Hub
