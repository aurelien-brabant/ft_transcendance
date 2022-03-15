import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import authContext, { AuthContextType } from "../context/auth/authContext";
import { NextPageWithLayout } from "./_app";
import Image from 'next/image';

const ValidateTfa: NextPageWithLayout = () => {

    const [tfaCode, setTfaCode] = useState('');
    const { setAlert } = useContext(alertContext) as AlertContextType;
    const { getUserData } = useContext(authContext) as AuthContextType;
    const [tfa] = useState(getUserData().tfa);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const handleSubmitTfa = async () => {
        const req = await fetch(`/api/users/${getUserData().id}/authenticateTfa`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({tfaCode: String(tfaCode)}),
        });
    
        const res = await req.json();
    
        if (res.tfaValidated) {
            setAlert({ type: 'success', content: '2FA validated. Redirecting...' });
            router.push('/welcome')
        }
        else {
            setAlert({ type: 'error', content: 'Invalid code!' });
            setTfaCode(''); 
        }
    }

    const handleChangeTfa = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTfaCode(e.target.value);
    };
    useEffect(() => {
        if (!tfa)
            router.push("/welcome");

        else if (!tfaCode.length) {
             setAlert({
                type: "info",
                content: "Waiting for 2FA code...",
            });
            setIsLoading(false);
        }

        else if (tfaCode.length === 6)
            handleSubmitTfa();

    }, [tfaCode])
    
    return (
        (isLoading) ? 
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 gap-y-4">
            <div className="absolute inset-0 z-50 flex items-center justify-center">
			    <Image src="/logo.svg" height="200" width="200" />
		    </div>
    		<BounceLoader size={400} color="#db2777" />
	    </div>
        :
        <div>
            <form onSubmit={handleSubmitTfa} className="flex flex-col gap-y-6">
            <input
                value={tfaCode}
                onChange={handleChangeTfa}
                type="text"
                name="tfaCode"
                className="text-black text-center"
                autoFocus
            />
    
            <button
                type="submit"
                className="px-1 py-2 text-sm font-bold uppercase bg-red-600 md:px-6 md:text-lg"
            >
                Validate Code
            </button>
            </form>
        </div>
    );
}


export default ValidateTfa;
