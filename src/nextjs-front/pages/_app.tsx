import "../styles/globals.css";
import { NextPage } from "next";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ReactElement, ReactNode } from "react";
import Authenticator, { AuthConfig } from "../components/hoc/withAuth";
import AuthProvider from "../context/auth/AuthProvider";
import AlertProvider from "../context/alert/AlertProvider";
import RelationshipProvider from "../context/relationship/RelationshipProvider";
//import AchievementsProvider from "../context/achievements/AchievementsProvider";

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
          <RelationshipProvider>
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
          </RelationshipProvider>
        </AuthProvider>
    </AlertProvider>
  );
}

export default MyApp;
