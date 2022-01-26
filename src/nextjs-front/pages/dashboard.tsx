import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react';

const NoSsr = ({ children }: { children: React.ReactNode }) => {
  const [mountedState, setMountedState] = useState(false);
  useEffect(() => {
      setMountedState(true);
  }, []);
  return <>{mountedState ? children : null}</>;
};

const Auth: NextPage = () => {
  let username = '';
  if (typeof window !== "undefined")
    username = window.localStorage.login;

  return (
      <div className={styles.container}>
      <h1>Dashboard</h1>
      <NoSsr> 
        <h4>Welcome {username}</h4> 
      </NoSsr>     
      <footer className={styles.footer}>
        <a href="/" rel="noopener noreferrer">
            Back to Home
        </a>
      </footer>
      </div>
    )
  }
  
  export default Auth