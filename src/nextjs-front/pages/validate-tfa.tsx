import React, {
    Fragment,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
//import { BounceLoader } from 'react-spinners';
import { NextPageWithLayout } from './_app';
//import Image from 'next/image';
import Head from 'next/head';
//import Router, { useRouter } from 'next/router';
import alertContext, { AlertContextType } from '../context/alert/alertContext';
//import authContext, { AuthContextType } from '../context/auth/authContext';
import { FiRefreshCcw } from 'react-icons/fi';
import { useSession } from '../hooks/use-session';

const ValidateCode = () => {
    const { loginWithTfa } = useSession();
    const { setAlert } = useContext(alertContext) as AlertContextType;
    const [tfaCode, setTfaCode] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const inputToFocus = useRef<HTMLInputElement>(null);

    const userId = useMemo(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        const urlParams = new URLSearchParams(window.location.search);

        return urlParams.get('userId');
    }, []);

    const authenticateWithTfa = async () => {
        if (userId === null) {
            return;
        }
        const user = await loginWithTfa(userId, tfaCode);

        if (!user) {
            setAlert({ type: 'error', content: 'Invalid code!' });
            setTfaCode('');
            setCurrentStep(0);
        }
    };

    useEffect(() => {
        if (tfaCode.length === 6) {
            authenticateWithTfa();
        }
    }, [tfaCode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const key = e.target.value;

        if (/^[0-9]+$/.test(key)) {
            e.target.value = tfaCode[currentStep];
            setCurrentStep(currentStep + 1);
        } else if (key !== 'Escape') {
            e.target.value = '';
        }
    };

    const checkStep = (key: string) => {
        if (/^[0-9]+$/.test(key)) setTfaCode(tfaCode + key);

        if ((currentStep > 0 && key === 'Backspace') || key === 'ArrowLeft') {
            setTfaCode(tfaCode.substring(0, tfaCode.length - 1));
            setCurrentStep(currentStep - 1);
        } else if (key === 'Escape') {
            setTfaCode('');
            setCurrentStep(0);
        }
    };

    useEffect(() => {
        inputToFocus.current?.focus();
    }, [currentStep]);

    const getTfaForm = () => {
        let content = [];
        for (let i = 0; i < 6; i++) {
            content.push(
                <input
                    key={i}
                    ref={currentStep === i ? inputToFocus : null}
                    onChange={handleChange}
                    className="focus:ring-2 focus:ring-pink-200 focus:ring-offset-pink-200 text-xl md:text-3xl bg-inherit text-pink-600 font-bold text-center border-pink-600 border-2 rounded-lg h-10 md:h-20 w-10 md:w-20"
                    type="text"
                    pattern="[0-9]{1}"
                    onKeyDown={(e) => {
                        checkStep(e.key);
                    }}
                />
            );
        }
        return content;
    };

    return (
        <form
            onSubmit={authenticateWithTfa}
            className="flex flex-col gap-y-6 m-10"
        >
            <label>
                <h1 className="text-center text-xl text-pink-700 uppercase animate-pulse">
                    Enter the 6-digit code from your Authenticator App
                </h1>
            </label>
            <div className="space-x-5 flex justify-center">{getTfaForm()}</div>

            <div className="flex justify-center">
                <FiRefreshCcw
                    className="font-bold text-2xl text-pink-600 hover:animate-spin hover:cursor-pointer"
                    onClick={() => {
                        setCurrentStep(0);
                        setTfaCode('');
                    }}
                />
            </div>
        </form>
    );
};
const ValidateTfaPage: NextPageWithLayout = () => {
    return (
        <Fragment>
            <Head>
                <title>2FA Authentication</title>
                <meta
                    name="description"
                    content="Validate authorization using the temporary code provided by the Authenticator App"
                />
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div
                className="relative flex flex-col items-center justify-center min-h-screen bg-fixed bg-gray-900 bg-center bg-no-repeat bg-cover gap-y-4"
                style={{
                    backgroundImage: `url('/triangles.png')`,
                }}
            >
                <main className="container flex flex-col items-center mx-auto gap-y-16">
                    <ValidateCode />
                </main>
            </div>
        </Fragment>
    );
};

ValidateTfaPage.isAuthRestricted = false;

export default ValidateTfaPage;
