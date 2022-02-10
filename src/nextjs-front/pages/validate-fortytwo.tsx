import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import HashLoader from "react-spinners/HashLoader";
import { BiSad } from "react-icons/bi";
import Image from "next/image";
import withWildLayout from "../components/hoc/withWildLayout";

import Head from "next/head";

import { authorizationLink } from "../constants/authorize42";
import {NextPageWithLayout} from "./_app";

const ValidateFortyTwo: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const router = useRouter();

  useEffect(() => {
    console.log('Validating');
    const searchParams = new URLSearchParams(window.location.search);
    const requestURI = `http://localhost/api/auth/login42`;

    fetch(requestURI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiCode: searchParams.get("code") }),
    }).then((res) => {
      if (res.status === 201) {
        res.json().then(({ access_token }) => {
          window.localStorage.setItem("bearer", access_token);
          router.push("/welcome");
        });
      } else {
        setError("An error occured");
        setIsLoading(false);
      }
    });
  }, [router]);

  return (
    <Fragment>
      <Head>
        <title>{!isLoading ? 'Authorization error' : 'Validating 42 authorization'}</title>
        <meta name="description" content="Validate authorization using the temporary code provided by the 42 API" />
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
          {isLoading ? (
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
                <h1 className="text-3xl font-bold text-white text-red-600 left-4 top-4">
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

//ValidateFortyTwo.getLayout = withWildLayout;

export default ValidateFortyTwo;
