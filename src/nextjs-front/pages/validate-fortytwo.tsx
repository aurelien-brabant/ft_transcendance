import { Fragment, useContext, useEffect, useState } from "react";
import HashLoader from "react-spinners/HashLoader";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
import { authorizationLink } from "../constants/authorize42";
import { NextPageWithLayout } from "./_app";
//import alertContext, {AlertContextType} from "../context/alert/alertContext";
//import authContext, {AuthContextType} from "../context/auth/authContext";
import { useSession } from "../hooks/use-session";

const ValidateFortyTwo: NextPageWithLayout = () => {
  //const router = useRouter();
  const { login } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (error !== null) {
      console.error(error);
    }
  }, [error]);

  const loginWith42 = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const fortyTwoApiCode = searchParams.get("code");

    if (fortyTwoApiCode === null) {
      setError("Missing 42 api code");
      return;
    }

    const hasLoggedIn = await login("42", {
      apiCode: fortyTwoApiCode,
    });

    if (!hasLoggedIn) {
      setError("Could not log in using 42");
    }
  };

  useEffect(() => {
    loginWith42().then(() => setIsLoading(false));
  }, []);

  return (
    <Fragment>
      <Head>
        <title>
          {!isLoading && error
            ? "Authorization error"
            : "Validating 42 authorization"}
        </title>
        <meta
          name="description"
          content="Validate authorization using the temporary code provided by the 42 API"
        />
        {/* we don't want to index that page nor indexing links on it */}
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div
        className="relative flex flex-col items-center justify-center min-h-screen bg-fixed bg-gray-900 bg-center bg-no-repeat bg-cover gap-y-4"
        style={{
          backgroundImage: `url('/triangles.png')`,
        }}
      >
        <main className="container flex flex-col items-center mx-auto gap-y-16">
          {isLoading || !error ? (
            <Fragment>
              <HashLoader color="#db2777" size={200} />
              <div className="flex flex-col text-center gap-y-2">
                <h1 className="text-3xl font-bold text-white left-4 top-4">
                  We are logging you in using your 42 account. You will be
                  redirected in a few seconds.
                </h1>
                <small className="text-xl text-neutral-200">
                  Not redirected after a few minutes? Try to{" "}
                  <a
                    href={authorizationLink}
                    className="underline underline-offset-4 hover:text-pink-600"
                  >
                    restart the authorization process
                  </a>
                  .
                </small>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <Image src={"/this_is_fine.gif"} width={498} height={280} />
              <div className="flex flex-col text-center gap-y-2">
                <h1 className="text-3xl font-bold text-red-600 left-4 top-4">
                  An error occured during the authorization process.
                </h1>
                <small className="text-xl leading-normal text-left text-neutral-200">
                  It may be because your authorization code has already been
                  used or has expired. <br /> You can try to{" "}
                  <a
                    href={authorizationLink}
                    className="underline underline-offset-4 hover:text-pink-600"
                  >
                    restart the authorization process
                  </a>
                  .<br />
                  If the problem persists, feel free to contact us.
                </small>
              </div>
            </Fragment>
          )}
        </main>
      </div>
    </Fragment>
  );
};

export default ValidateFortyTwo;
