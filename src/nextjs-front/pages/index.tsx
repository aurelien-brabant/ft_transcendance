import type { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

function Connect42 () {
  const [Logged, setLogged] = useState();
  const [token, setToken] = useState();
  const [Link, setLink] = useState("https://api.intra.42.fr/oauth/authorize?client_id=3abe804af24b93683af50cc13f370833e49b97d8431026f7333497922021abf0&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code");
	
	if (!Logged) {
		try {
			const url = window.location.href;
			const ret = url.substring(url.indexOf('?') + 1);
			if (ret.startsWith('error='))
				setLogged('invalids_creds');
			else if (ret.startsWith('code=')) {
				setToken(ret.substring(5))
    		setLogged('logged');
        console.log(token);
			}
		} catch (error) { console.error(error) }
	}
  console.log(token);
  console.log(Logged);
  console.log('---------------');

  let msg, link, btn_title, btn_msg;
  
  if (token) {
    msg = "Login successfull";
    setLink("/dashboard");
    btn_title = "ENTER";
    btn_msg = "PONG"
  }
	else {
    msg = "Log in to continue";
    btn_title = "CONNECT";
    btn_msg = "Log-in to 42 intra"
  }

  return (
		  <div className={styles.grid}>
        <p>{msg}</p>
			  <a href={Link} className={styles.card}>
        	 <h2>{btn_title} &rarr;</h2>
        	 <p>{btn_msg}</p>
        </a>
		</div>
	)
}

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>ft_transcendance</title>
        <meta name="description" content="validate the common core" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          ft_transcendance
		    </h1>

        <p className={styles.description}>
          Let's transcend ourself!
        </p>
		
		    <Connect42 />
      </main>

      <footer className={styles.footer}>
        <a href="/" rel="noopener noreferrer">
          Powered by us
        </a>
      </footer>
    </div>
  )
}

export default Home
