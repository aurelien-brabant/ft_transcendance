import { Fragment, useEffect } from "react";
import io from 'socket.io-client';
import Head from "next/head";
import withDashboardLayout from "../../components/hoc/withDashboardLayout";

// const Hub: NextPageWithLayout = () => {
const Hub: React.FC = () => {
	useEffect((): any => {

    // connect to socket server
	const socket = io("localhost");

	// socket.emit('hello');

    // log socket connection
    socket.on("connected", () => {
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
		</Fragment>
	);
}

// Hub.getLayout = withDashboardLayout;
export default Hub
