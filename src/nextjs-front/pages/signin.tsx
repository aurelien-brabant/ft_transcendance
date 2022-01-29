import isEmail from "validator/lib/isEmail";
import withWildLayout from "../components/hoc/withWildLayout";
import ProgressiveFrom, { defaultConfig, ProgressiveFormConfig } from "../components/ProgressiveForm";

import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import {Fragment} from "react";

const formConfig: ProgressiveFormConfig = {
	steps: [
		{
			fields: [
				{
					label: "email",
					name: "email",
					inputType: "text",
					placeholder: "example@gmail.com",
                    validate: (value) => isEmail(value) ? undefined : 'Invalid e-mail address format'
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
				},
			],
			submitCta: "Continue with password",
		},
	],
};


const SignIn: React.FC<{}> = () => {
  const handleFormSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <Fragment>
    <Head>
      <title>Sign in and play | ft_transcendance</title>
      <meta name="description" content="Sign in with email or 42's intra and start playing pong online. Show the world you're the best pong player!" />
    </Head>
    <div className="pt-20 bg-gray-900 ">
      <main
        className="flex flex-col items-center min-h-screen mx-auto pt-52 gap-y-8 text-neutral-200"
        style={{ maxWidth: "450px" }}
      >
        <div className="text-center">
        <h1 className="text-4xl text-white"> Sign In </h1>
          <h2 className="py-2"><Link href="/signup"><a>Or sign up</a></Link></h2>
        </div>
        <div className="flex flex-col w-full gap-y-4">
          <button
            style={{ backgroundColor: "#00babc" }}
            className="flex items-center justify-center w-full px-8 py-2 text-xl font-bold text-white uppercase gap-x-4"
          >
            <Image src="/plain_logo.svg" width={35} height={35} alt="42 logo" />
            Continue with 42
          </button>
          <hr className="self-stretch border-gray-600 border-1" />
        </div>

        <ProgressiveFrom
          onSubmit={handleFormSubmit}
          className="flex flex-col w-full gap-y-6"
          inputGroupClassName="flex flex-col gap-y-2"
          inputBoxClassName="text-xl text-gray-900 border-2 border-transparent  bg-neutral-200"
          invalidInputBoxClassName="!border-red-200"
          inputClassName="transition w-full px-6 py-2 border-2 focus:border-pink-600 "
          invalidInputClassName="px-2 py-1 bg-red-200 text-red-600 text-lg flex justify-center"
          submitClassName="w-full py-3 text-xl font-bold text-white uppercase bg-pink-600"
          config={formConfig}
        />
      </main>
    </div>
    </Fragment>
  );
};

export default withWildLayout(SignIn);