import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import styles from '../styles/Home.module.css'

function LoginForm () {
	const [Logged, setLogged] = useState();
	const [token, setToken] = useState();
	
	if (!Logged) {
		try {
			const url = window.location.href;
			const ret = url.substring(url.indexOf('?') + 1);
			if (ret.startsWith('error='))
				setLogged('invalids_creds');
			else if (ret.startsWith('code=')) {
				setToken(ret.substring(5))
    			setLogged('logged');
			}
		} catch (error) { console.error(error)}
		}
	if (token)
		return (<p>Login successfull</p>)
	else
		return (<p>You must be logged in to view content...</p>)
}

const Auth: NextPage = () => {
  return (
    <div className={styles.container}>
	<h1>42 Log-in</h1>
	<LoginForm />
    <footer className={styles.footer}>
      <a
          href="/"
          rel="noopener noreferrer"
      >
          Back to Home
      </a>
    </footer>
	</div>
  )
}

export default Auth
