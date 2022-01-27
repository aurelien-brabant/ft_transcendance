import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { Fragment, useEffect, useState } from 'react';

const NoSsr = ({ children }: { children: React.ReactNode }) => {
  const [mountedState, setMountedState] = useState(false);
  useEffect(() => {
      setMountedState(true);
  }, []);
  return <>{mountedState ? children : null}</>;
};

function Infos() {

}

function Api42 () {
  const [header, setHeader] = useState('Log-in to continue');
  const [choise, setChoise] = useState('Who am I?');
  const [msg, setMsg] = useState('');

  let username = '';

  const handleChange = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    setChoise(value);
  }

  const querySearch = async (event: any) => {
    event.preventDefault();
		let apicall: string = '';
    if (choise == 'Who am I?') {
      apicall = `/users/${window.localStorage.user_id}/cursus_users`;
      const req = await fetch(`https://api.intra.42.fr/v2${apicall}?access_token=${window.localStorage.token}`);
      const res: any = await req.json();
      setMsg(`Grade: ${res[0].grade} - Level: ${res[0].level}`);

    }
    else if (choise === '42 cursus') {
      apicall = `/me`;
      const req = await fetch(`https://api.intra.42.fr/v2${apicall}?access_token=${window.localStorage.token}`);
      const res: any = await req.json();

      setMsg(`Piscine: ${res.pool_year} ${res.pool_year} - Alumni: ${res.alumni}`);
    }
	}

  if (typeof window !== 'undefined')
    username = window.localStorage.login;

  useEffect(() => { 
    if (username)
      setHeader(`Welcome ${username}`);
  }, []);
  
  return (
      <Fragment>
      <h4>{header}<br/><br/>{msg}</h4>
      {(username) ? <form onSubmit={querySearch}>
        <label htmlFor="apicall"></label>
		  	<select onChange={handleChange} name="apicall">
				<option>Who am I?</option>
				<option>42 cursus</option>
				</select>
        <button type="submit">Fetch datas from 42 API</button><br/><br/>
		  </form>
       : <></>}
      </Fragment>
  )
};

const Auth: NextPage = () => {
  return (
      <div className={styles.container}>
      <h1>Dashboard</h1>
      <NoSsr>
        <Api42 />
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