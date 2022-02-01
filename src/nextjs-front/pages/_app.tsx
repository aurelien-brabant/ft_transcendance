import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {NextPage} from 'next'
import {ReactElement, ReactNode} from 'react';

export type NextPageWithLayout<T = {}> = NextPage<T> & {
  getLayout?: (page: ReactElement) => ReactNode
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);
  
  return getLayout(<Component {...pageProps} />);
}

export default MyApp
