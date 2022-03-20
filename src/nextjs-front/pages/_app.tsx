import "../styles/globals.css";
import type { AppProps } from "next/app";
import { NextPage } from "next";
import { ReactElement, ReactNode, useEffect } from "react";
import Authenticator, { AuthConfig } from "../components/hoc/withAuth";
import AuthProvider from "../context/auth/AuthProvider";
import AlertProvider from "../context/alert/AlertProvider";
import { useRouter } from "next/router";

export type NextPageWithLayout<T = {}> = NextPage<T> & {
  getLayout?: (page: ReactElement) => ReactNode;
  isAuthRestricted?: boolean;
  authConfig?: AuthConfig;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps, ...rest }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);
  const router = useRouter();

  return (
    <AlertProvider>
      <AuthProvider>
        <Authenticator
            key={router.asPath}
            authConfig={
              Component.isAuthRestricted
                ? Component.authConfig
                : { shouldBeAuthenticated: false }
            }
          >
          {getLayout(<Component {...pageProps} />)}
        </Authenticator>
      </AuthProvider>
    </AlertProvider>
  );
}

export default MyApp;
