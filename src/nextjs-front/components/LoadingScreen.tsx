import { BounceLoader } from "react-spinners";
import Image from 'next/image';

const LoadingScreen = () => {
	return <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 gap-y-4">
		<div className="absolute top-4 left-8">
			<h1 className="text-xl text-white">Authenticating. This should take at most a few seconds.</h1>
		</div>
		<div className="absolute inset-0 z-50 flex items-center justify-center">
			<Image src="/logo.svg" height="200" width="200" />
		</div>
		<BounceLoader size={400} color="#db2777" />
	</div>
}

export default LoadingScreen;
