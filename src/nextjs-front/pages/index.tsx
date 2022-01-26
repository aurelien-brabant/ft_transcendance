import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

function Connect42 () {
  const [logged, setLogged] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [expIn, setExpIn] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [iat, setIat] = useState('');
  const [msg, setMsg] = useState('Log in to continue');
  const [btnTitle, setBtnTitle] = useState('ENTER');
  const [btnMsg, setBtnMsg] = useState('Log-in to 42 intra');
  const [link, setLink] = useState('https://api.intra.42.fr/oauth/authorize?client_id=3abe804af24b93683af50cc13f370833e49b97d8431026f7333497922021abf0&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code&state=Unguessable_random_string');
  const [login, setLogin] = useState('');
  //const [firstName, setFirstName] = useState('');
  //const [lastName, setLastName] = useState('');
  //const [email, setEmail] = useState('');
  const [userInfos, setUserInfos] = useState('');
  const [picUrl, setPicUrl] = useState('');
  let picStatus = '';

  const querySearch = async (code: string) => {
    const req = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=authorization_code&client_id=3abe804af24b93683af50cc13f370833e49b97d8431026f7333497922021abf0&client_secret=f90c0a91ba638e2223192c3ab3b3278d2cf53ef313130e70c531690dff8a0e50&code=${code}&redirect_uri=http://localhost:3000/`
    });
    const res = await req.json();
    setToken(res.access_token);
    setExpIn(res.expires_in);
    setRefreshToken(res.refresh_token);
    setIat(res.created_at);

    const reqInfos = await fetch(`https://api.intra.42.fr/v2/me?access_token=${res.access_token}`);
    const resInfos = await reqInfos.json();
    setLogin(resInfos.login);
   // setFirstName(resInfos.first_name);
    //setLastName(resInfos.last_name);
    //setEmail(resInfos.email);
    
    setPicUrl(resInfos.image_url);
    setMsg(`Login successfull as ${resInfos.first_name} ${resInfos.last_name}`);
    setUserInfos(`${resInfos.login} - ${resInfos.wallet} wallets - ${resInfos.email}`);
    setLink('/dashboard');
    setBtnTitle('ENTER');
    setBtnMsg('PONG');
  }
  if (!logged) {
		try {
			const url = window.location.href;
			const ret = url.substring(url.indexOf('?') + 1);

      if (ret.startsWith('error='))
        setLogged('refused');
      else if (ret.startsWith('code=') && (ret.substring(76) === 'Unguessable_random_string')) {
        setLogged('authenticated');
        setCode(ret.substring(5, 69));
      }
    } catch (error) { }
	}

  useEffect(() => { 
    if (code && !token) { 
      setMsg('Authenticated');
      querySearch(code);
    }
    else if (logged === 'refused')
      setMsg('You need to login to continue');
  }, []);
  
  if (!picUrl)
    picStatus = 'hide';
  
  return (
		  <div className={styles.grid}>
        <img className={styles[picStatus]} src={picUrl} alt={login} width="20%" />
        <p>{msg}<br/>{userInfos}</p>
			  <a href={link} className={styles.card}>
        	 <h2>{btnTitle} &rarr;</h2>
        	 <p>{btnMsg}</p>
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