import { Fragment, useContext, useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";
import { NextPageWithLayout } from "./_app";
import Image from 'next/image';
import Head from "next/head";
import Router, { useRouter } from "next/router";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import authContext, { AuthContextType } from "../context/auth/authContext";

const formArray = [
    {
    }
];

const ValidateCode = () => {
    
    const { setAlert } = useContext(alertContext) as AlertContextType;
    const { getUserData } = useContext(authContext) as AuthContextType;
    const [tfaCode, setTfaCode] = useState('');
    const [tfaArray, setTfaArray] = useState(formArray);
    const router = useRouter();
    
    const authenticateWithTfa = async () => {
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

 //   const handleChangeTfa = (e: React.ChangeEvent<HTMLInputElement>) => {
   //     setTfaCode(e.target.value);
    //};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
//        array[i] = value;
        setTfaCode(value);
    };

    let array: (string[]) = [];
    for (let i = 1; i < 7; i++) {
        array[i] = String(i);
    } 
    useEffect(() => {
      
        if (!tfaCode.length) {
            setAlert({
                type: "info",
                content: "Waiting for 2FA code...",
            });
        }
        else if (tfaCode.length === 6)// && (/^[0-9]+$/.test(tfaCode))) {
             authenticateWithTfa();
//        }
        else if (tfaCode.length === 6){// && !(/^[0-9]+$/.test(tfaCode))) {
            setAlert({
                type: "error",
                content: "Only digits are allowed!",
            });
            setTfaCode('');

        }
    }, [tfaCode])
console.log(tfaCode);

  const getTfaForm = () => {
    let content = [];
    for (let i = 0; i < 6; i++) {
      content.push(
        <input
        key={i}
        value={''}
        onChange={handleChange}
        type="text"
        name="tfaCode"
        className="text-xl md:text-3xl bg-pink-600 text-white font-bold text-center border-white border-2 rounded-lg h-10 md:h-20 w-10 md:w-20"
        />
      );
    }
    return content;
  };


    return (
        <form onSubmit={authenticateWithTfa} className="flex flex-col gap-y-6 m-10">
            <h1 className="text-center text-xl text-pink-600 uppercase animate-pulse">
                Enter the 6-digit code from your Authenticator App
            </h1>
            <div className="space-x-5 flex justify-center">
                {getTfaForm()} 
            </div>
            <input
              value={tfaCode}
              onChange={handleChange}
              type="text"
              name="tfaCode"
              placeholder="2FA Code"
              className="text-black text-center"
              autoFocus
            />
        
              <button
                type="submit"
                className="hidden px-1 py-2 text-sm font-bold uppercase bg-red-600 md:px-6 md:text-lg"
              >
                2FA Code
              </button>
        </form>
    );
}

const ValidateTfa: NextPageWithLayout = () => {

    const { getUserData } = useContext(authContext) as AuthContextType;
    const [isLoading, setIsLoading] = useState(true);
    const [tfa] = useState(getUserData().tfa);

    useEffect(() => {
        (!tfa) ? Router.push('/welcome') : setIsLoading(false);
    }, [])

    return (

    <Fragment>
        <Head>
          <title>{!isLoading ? '2FA Authentication' : 'Validating 2FA authorization'}</title>
          <meta name="description" content="Validate authorization using the temporary code provided by the Authenticator App" />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div
          className="relative flex flex-col items-center justify-center min-h-screen bg-fixed bg-gray-900 bg-center bg-no-repeat bg-cover gap-y-4"
          style={{
            backgroundImage: `url('/triangles.png')`,
          }}
        >
        <main className="container flex flex-col items-center mx-auto gap-y-16">
            
        {(isLoading) ? 
        <Fragment>
            <div className="relative flex flex-col items-center justify-center min-h-screen gap-y-4">
                <div className="absolute inset-0 z-50 flex items-center justify-center">
			        <Image src="/logo.svg" height="200" width="200" />
		        </div>
    		    <BounceLoader size={400} color="#db2777" />
	        </div>
        </Fragment>
        :
        <Fragment>
             <ValidateCode />
        </Fragment>
        }
        </main>
      </div>
    </Fragment>
    );
}


export default ValidateTfa;
