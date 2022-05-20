import {Fragment, useContext, useEffect, useState} from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";
import isEmail from "validator/lib/isEmail";

import {NextPageWithLayout} from "./_app";
import {authorizationLink} from "../constants/authorize42";
import alertContext, {AlertContextType} from "../context/alert/alertContext";
import ProgressiveFrom, {ProgressiveFormConfig} from "../components/ProgressiveForm";
import withWildLayout from "../components/hoc/withWildLayout";
import {useSession} from "../hooks/use-session";

const SignIn: NextPageWithLayout = () => {
    const router = useRouter();
    const { login, state: authState } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [resetInputFormStep, setResetInputFormStep] = useState(false)
    const {setAlert} = useContext(alertContext) as AlertContextType;

    const formConfig: ProgressiveFormConfig = {
        steps: [
            {
                fields: [
                    {
                        label: "email",
                        name: "email",
                        inputType: "text",
                        placeholder: "example@gmail.com",
                        validate: (value) =>
                            isEmail(value) ? undefined : "Invalid e-mail address format",
                    },
                ],
                submitCta: "Continue with email",
            },
            {
                fields: [
                    {
                        label: "password",
                        name: "password",
                        inputType: "password",
                        shouldBeReset: true
                    },
                ],
                submitCta: !isLoading ? "Continue with password" : "Authenticating...",
            },
        ],
    };

    const handleFormSubmit = async ({email, password}: any) => {
        setIsLoading(true);
        const hasLoggedIn = await login('credentials', {
            email: email.toLowerCase(),
            password
        });
        setIsLoading(false);

        if (!hasLoggedIn) {
            setResetInputFormStep(true)
            setAlert({
                content: "Invalid credentials",
                type: "error",
            });
        }
    };

    useEffect(() => {
        if (authState === 'authenticated') {
            router.push('/welcome');
        }
    }, [router, authState])

    return (
        <Fragment>
            <Head>
                <title>Sign in and play | ft_transcendance</title>
                <meta
                    name="description"
                    content="Sign in with email or 42's intra and start playing pong online. Show the world you're the best pong player!"
                />
            </Head>
            <div className="pt-20 bg-fixed bg-center bg-fill" style={{backgroundImage: "url('/triangles.png')"}}>

                <main
                    className="flex flex-col items-center min-h-screen mx-auto pt-52 gap-y-8 text-neutral-200"
                    style={{maxWidth: "450px"}}
                >
                    <div className="text-center">
                        <h1 className="text-4xl text-white"> Sign In </h1>
                        <h2 className="py-2">
                            <Link href="/signup">
                                <a>Or sign up</a>
                            </Link>
                        </h2>
                    </div>
                    <div className="flex flex-col w-full gap-y-4">
                        <a
                            href={authorizationLink}
                            style={{backgroundColor: "#00babc"}}
                            className="flex items-center justify-center w-full px-8 py-2 text-xl font-bold text-white uppercase gap-x-4"
                        >
                            <Image
                                src="/plain_logo.svg"
                                width={35}
                                height={35}
                                alt="42 logo"
                            />
                            Continue with 42
                        </a>
                        <hr className="self-stretch border-gray-600 border-1"/>
                    </div>

                    <ProgressiveFrom
                        onSubmit={handleFormSubmit}
                        className="flex flex-col w-full gap-y-6"
                        inputGroupClassName="flex flex-col gap-y-2"
                        inputBoxClassName="text-xl text-neutral-200 border-2 border-transparent  bg-gray-900/90"
                        invalidInputBoxClassName="!border-red-200"
                        inputClassName="transition w-full px-6 py-2 border-2 focus:border-pink-600 "
                        invalidInputClassName="px-2 py-1 bg-red-200 text-red-600 text-lg flex justify-center"
                        submitClassName="w-full py-3 text-xl font-bold text-white uppercase bg-pink-600"
                        loaderColor="#ffffff"
                        isLoading={isLoading}
                        config={formConfig}
                        reset={resetInputFormStep}
                        setReset={setResetInputFormStep}
                    />
                </main>

            </div>
        </Fragment>
    );
};

SignIn.getLayout = withWildLayout;

export default SignIn;
