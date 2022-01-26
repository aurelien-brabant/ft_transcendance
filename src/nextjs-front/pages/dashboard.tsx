import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'

const Auth: NextPage = () => {
  const username = 'USERNAME_TEST';
    return (
      <div className={styles.container}>
      <h1>Dashboard</h1>
      <h4>You are logged in as {username}</h4>      
      <footer className={styles.footer}>
        <a href="/" rel="noopener noreferrer">
            Back to Home
        </a>
      </footer>
      </div>
    )
  }
  
  export default Auth