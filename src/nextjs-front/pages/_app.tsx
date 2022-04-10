import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { ReactElement, ReactNode } from 'react';
import AlertProvider from '../context/alert/AlertProvider';
import AuthProvider from '../context/auth/AuthProvider';
// import RelationshipProvider from '../context/relationship/RelationshipProvider';
import { useSession } from '../hooks/use-session';
import PageLoadingScreen from '../components/page-loading-screen';

export type PageAuthConfig =
    | {
          fallbackUrl?: string;
      }
    | boolean;

export type NextPageWithLayout<T = {}> = NextPage<T> & {
    getLayout?: (page: ReactElement) => ReactNode;
    isAuthRestricted?: boolean;
    authConfig?: PageAuthConfig;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

const AuthenticatedPage: React.FC<{ config: PageAuthConfig }> = ({
    config,
    children,
}) => {
    const session = useSession({ waitingTime: 1500 });
    const router = useRouter();

    console.log(session.state);

    if (session.state !== 'authenticated') {
        if (session.state === 'unauthenticated') {
            router.push(
                (typeof config !== 'boolean' && config.fallbackUrl) || '/signin'
            );
        } else if (session.state === 'tfa_required') {
            router.push('/validate-tfa');
        }

        return <PageLoadingScreen />;
    }

    return <>{children}</>;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout = Component.getLayout || ((page) => page);

    return (
        <AlertProvider>
            <AuthProvider>
                {/*<RelationshipProvider>*/}
                    {Component.authConfig ? (
                        <AuthenticatedPage config={Component.authConfig}>
                            {getLayout(<Component {...pageProps} />)}
                        </AuthenticatedPage>
                    ) : (
                        getLayout(<Component {...pageProps} />)
                    )}
                {/*</RelationshipProvider>*/}
            </AuthProvider>
        </AlertProvider>
    );
}

export default MyApp;
