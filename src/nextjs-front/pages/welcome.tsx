import { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FiEdit2, FiUploadCloud } from "react-icons/fi";
import { MdCameraswitch, MdCancel, MdOutlineArrowBackIos } from 'react-icons/md';
import Link from 'next/link';
import Image from "next/image";
import { useRouter } from 'next/router';
import isEmail from "validator/lib/isEmail";
import { NextPageWithLayout } from './_app';
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import Tooltip from '../components/Tooltip';
import ResponsiveSlide from '../components/ResponsiveSlide';
import withDashboardLayout from "../components/hoc/withDashboardLayout";
import { useSession } from "../hooks/use-session";

const labelClassName = "grow uppercase text-neutral-400";
const inputClassName =
  "transition col-span-2 grow bg-transparent outline-0 border-04dp pb-1 border-b-2 focus:border-pink-600";
const inputGroupClassName = "grid md:grid-cols-4 grid-cols-1 items-center gap-x-8 gap-y-2";

type FormData = {
  username: string;
  email: string;
  tfa: boolean;
  pic: string;
};

type InvalidInputs = {
  username?: string;
  email?: string;
  tfa?: string;
};

const InputErrorProvider: React.FC<{ error?: string | null }> = ({
  children,
  error,
}) => (
  <div className="flex flex-col col-span-2">
    <small className="min-h-[1.5em] text-red-500">{error && error}</small>
    {children}
  </div>
);


const Welcome: NextPageWithLayout = () => {
  const { user, logout, reloadUser } = useSession();
  const [invalidInputs, setInvalidInputs] = useState<InvalidInputs>({});
  const { setAlert } = useContext(alertContext) as AlertContextType;
  const router = useRouter();
  const [pendingPic, setPendingPic] = useState(false);
  const [pendingQR, setPendingQR] = useState(false);
  const [tfaCode, setTfaCode] = useState('');
  const [tfaStatus, setTfaStatus] = useState(user.tfa ? 'enabled' : 'disabled');
  const [currentStep, setCurrentStep] = useState(0);
  const inputToFocus = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    username: user.username,
    email: user.email,
    tfa: user.tfa,
    pic: user.pic
  });

  let baseObject: FormData;

  const reactivateAccount = () => {
    fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({accountDeactivated: false})
    });
  }

  useEffect(() => {
    if (user.accountDeactivated)
      reactivateAccount();

    const basePhoneNb = user.phone;

    baseObject = {
      username: user.username,
      email: user.email,
      tfa: user.tfa,
      pic: user.pic
    }
  }, [])

  // recompute this only when formData changes
  const hasPendingChanges = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(baseObject),
    [formData]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvalidInputs({ ...invalidInputs, [e.target.name]: undefined });
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogout = async () => {
		setAlert({type: 'success', content: 'Logged out'});
		await logout();
	}

  const deactivateAccount = async () => {
    const req = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({accountDeactivated: true})
    });

    const res = await req.json();

    if (req.status === 200) {
      await handleLogout();
    }
  }

  const editUser = async (formData: FormData) => {
  	const req = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(formData)
    });

    const res = await req.json();

    if (req.status === 200) {
      await reloadUser();
      setAlert({ type: 'success', content: 'User edited successfully' });
    }
    else
      setAlert({ type: 'error', content: 'Error while editing user!' });
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!hasPendingChanges) return;

    const tmp: InvalidInputs = {};

    if (formData.username.length < 5 || formData.username.length > 50) {
      tmp.username = "nickname can contain between 5 and 50 characters";
    }

    if (!isEmail(formData.email)) {
      tmp.email = "Not a valid email";
    }

    setInvalidInputs(tmp);
    if (!tmp.username && !tmp.email) {
        editUser(formData);
    }
  };

  const activateTfa = async () => {
 
    const req = await fetch(`/api/users/${user.id}/enableTfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({tfaCode: tfaCode})
    });

    if (req.status === 200) {
      setAlert({ type: 'success', content: '2FA activated successfully' });
      setTfaStatus('enabled');
      setPendingQR(false);
    }
    else {
      setAlert({ type: 'error', content: 'Wrong verification code!' });
      setTfaStatus('disabled');
      setTfaCode(''); 
      setCurrentStep(0);   
    }
  }

  const deactivateTfa = async () => {

    const req = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({tfa: false, tfaSecret: null})
    });

    if (req.status === 200) {
      setAlert({ type: 'success', content: '2FA deactivated successfully' });
      setTfaStatus('disabled');
    }
    else {
      setAlert({ type: 'error', content: 'Error while deactivating 2FA!' });
      setTfaStatus('enabled');
    }
  }

  useEffect(() => {
    if (!tfaCode.length && pendingQR) {
        setAlert({
            type: "info",
            content: "Waiting for 2FA code...",
        });
    }
    else if (tfaCode.length === 6)
        activateTfa();
  }, [tfaCode])

  const handleChangeTfa = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      const key = e.target.value;

      if (/^[0-9]+$/.test(key)) {
          e.target.value = tfaCode[currentStep];
          setCurrentStep(currentStep + 1);
      }
      else if (key !== "Escape") {
          setAlert({ type: 'warning', content: 'Only digit!' });
          e.target.value = ""
      }
  }

  const checkStep = (key: string) => {
      if (/^[0-9]+$/.test(key))
          setTfaCode(tfaCode + key);

      if ((currentStep > 0 && (key === "Backspace")) || key === "ArrowLeft") {
          setTfaCode(tfaCode.substring(0, tfaCode.length - 1));
          setCurrentStep(currentStep - 1);
      }
      else if (key === "Escape") {
          setPendingQR(false);
          setTfaCode('');
          setCurrentStep(0);
      }
  }

  const getTfaForm = () => {
    
      let content = [];
      for (let i = 0; i < 6; i++) {
        content.push(
          <input
              key={i}
              ref={currentStep === i ? inputToFocus : null}
              onChange={handleChangeTfa}
              className="focus:ring-4 focus:ring-pink-200 focus:ring-offset-pink-200 text-xl md:text-3xl bg-inherit text-pink-600 font-bold text-center border-pink-600 border-2 rounded-lg h-10 md:h-20 w-10 md:w-20"
              type="text"
              pattern="[0-9]{1}"
              onKeyDown={(e) => {checkStep(e.key)}}
          />
      );
      }

      return (
        <div>
          <div className="space-x-3 md:space-x-5 my-5 text-center">
            <h1 className="my-10 text-center text-xl text-pink-700 uppercase animate-pulse">
                    Enter the 6-digit code from your Authenticator App<br/>
                    Press ECHAP to cancel
            </h1>
            {content}
          </div>
          <div className="flex justify-center p-5">
            <MdOutlineArrowBackIos className="font-bold text-2xl text-pink-600 hover:animate-bounceBack hover:cursor-pointer" onClick={() => {setPendingQR(false)}}/>
          </div>
        </div>
      );
  };

  const UploadPic = () => {

    const [image, setImage] = useState('');

    const uploadToClient = (event:any) => {
    
      if (event.target.files && event.target.files[0]) {
        const img = event.target.files[0];
        setImage(img);
      }
  };

    const uploadToServer = async () => {

      const body = new FormData();
      body.append("image", image);

      const req = await fetch(`/api/users/${user.id}/uploadAvatar`, {
        method: "POST",
        body
      });
     
      if (req.ok) {
        const res = await req.json();
        console.log(res);
        setPendingPic(false);
        setAlert({type: 'success', content: 'Avatar uploaded successfully'})
        router.reload();
      }
      else if (req.status === 406)
        setAlert({type: 'warning', content: 'Only JPG/JPEG/PNG/GIF are accepted'})
      else if (req.status === 413)
        setAlert({type: 'warning', content: 'File size too big!'})
      else
        setAlert({type: 'error', content: 'Error while uploading!'})
    };

    return (
      <ResponsiveSlide
        useMediaQueryArg={{ query: "(min-width: 1280px)" }}
        direction="left" duration={200} triggerOnce
      >
        <div className="flex justify-center text-pink-600 space-x-5 text-center items-center">
          <input
            type="file"
            name="uploadAvatar"
            className="border border-pink-600 p-1"
            onChange={uploadToClient}
          />
          <FiUploadCloud onClick={uploadToServer} className="text-3xl hover:animate-pulse"/>
        </div>
      </ResponsiveSlide>
    )
  }

  const getRandomPic = async () => {

    setAlert({type: 'info', content: 'New random avatar'})

    const req = await fetch(`/api/users/${user.id}/randomAvatar`);

    if (req.ok)
      router.reload();
    else
      setAlert({type: 'error', content: 'Error while changin avatar!'})
  }

  const get42Pic = async () => {

    setAlert({type: 'info', content: 'Default 42 pic requested'})

    const req = await fetch(`/api/users/${user.id}/avatar42`);
   
    if (req.ok)
      router.reload();
    else
      setAlert({type: 'error', content: 'Error while changin avatar!'})
  }

  useEffect(() => {
    inputToFocus.current?.focus();
  }, [currentStep, pendingQR]);
  
  return (
    <div className="min-h-screen text-white grow" id="main-content">
      <div 
        style={{ maxWidth: "800px" }}
        className="px-2 mx-auto"
      >
      
      {(user.duoquadra_login) ?
      <div className="flex flex-col items-center p-2">
        <div className="border border-gray-900 hover:border-pink-600 rounded-full pb-0 pt-2 pr-2 pl-2">
          <Image
            src="/logo.svg"
            width={35}
            height={35}
            alt="42 logo"
            title="Get intra picture profile"
            className="hover:cursor-pointer"
            onClick={() => {get42Pic()}}
          />
        </div>
      </div>
      :
      <></>
      }

        {!pendingQR ?
        <Fragment>
        <div className="flex flex-col items-center gap-y-4">
          <div className="relative w-48 h-48">
           <img
              className="object-cover object-center w-full h-full rounded drop-shadow-md"
              src={`/api/users/${user.id}/photo`}
            /> 

            {pendingPic ?
            <div className="absolute p-2 bg-white border-2 border-gray-900 rounded-full -top-4 -right-4">
              <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
                <Tooltip className="font-bold bg-gray-900 text-neutral-200" content="Cancel">
                  <button className="p-2 text-xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                    <MdCancel
                        className="text-red-600"
                        onClick={() => {setPendingPic(false)}}
                    />
                  </button>
                </Tooltip>
              </div>
            </div>
            :
            <div>
              <div className="absolute flex -top-4 -left-4">
                <Tooltip className="font-bold bg-gray-900 text-neutral-200" content="Random avatar">
                  <button className="p-2 text-xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                    <MdCameraswitch
                      className="text-gray-900 hover:text-pink-600"
                      onClick={() => {getRandomPic()}}
                    />
                  </button>
                </Tooltip>
              </div>
              <div className="absolute flex -top-4 -right-4">
                <Tooltip className="font-bold bg-gray-900 text-neutral-200" content="Upload avatar">
                  <button className="p-2 text-xl text-gray-900 bg-white rounded-full transition hover:scale-105">
                    <FiEdit2
                      className="text-gray-900 hover:text-pink-600"
                      onClick={() => {setPendingPic(true)}}
                    />
                  </button>
                </Tooltip>
              </div>
            </div>
            }
          </div>

          { pendingPic ?
          <UploadPic />
          :
          <div className="text-center">
            <h2 className="text-xl font-bold text-pink-600">
              {user.username}
            </h2>
            <Link href={`/users/${user.id}`}>
              <a className="block py-1 text-sm uppercase text-neutral-200 hover:underline">
                See public profile
              </a>
            </Link>
          </div>
          }
        </div>

        <div className="flex flex-col py-12 gap-y-10">
            <h1 className="text-2xl">
              Edit profile
            </h1>
          
          {/* Inputs */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
            <div className={inputGroupClassName}>
              <label htmlFor="username" className={labelClassName}>
                Username
              </label>
              <InputErrorProvider error={invalidInputs.username}>
                <input
                  value={formData.username}
                  onChange={handleChange}
                  type="text"
                  name="username"
                  className={inputClassName}
                />
              </InputErrorProvider>
              <small></small>
            </div>

            <div className={inputGroupClassName}>
              <label htmlFor="email" className={labelClassName}>
                Email address
              </label>
              <InputErrorProvider error={invalidInputs.email}>
                <input
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  name="email"
                  className={inputClassName}
                />
              </InputErrorProvider>
            </div>

            <div className={inputGroupClassName}>
              <label htmlFor="tfa" className={labelClassName}>
                2FA - Authenticator App
              </label>
              <button
                type="button"
                className={`px-6 py-2 col-span-2 ${(tfaStatus === 'enabled') ? "bg-red-500" : "bg-green-500"}`}
                onClick={() => {
                  if (tfaStatus === 'disabled') {
                    setAlert({ type: 'info', content: 'Scan the QR code to get the 6-digits code given by your authenticator app'})
                    setPendingQR(true);
                  }
                  else {
                    if (confirm("Deactivated 2FA with Authenticator App?\nYou can reactivate it when you want.\n\nClick OK to proceed.") == true)
                      deactivateTfa();
                    }
                }}
              >
                {(tfaStatus === 'enabled') ? "DEACTIVATE 2FA" : "ACTIVATE 2FA"}
              </button>
              <small>
                Confirm each connection to your account using an Authenticator App
              </small>
            </div>

            {/* actions */}

            <div className="flex flex-col justify-between py-5 gap-y-4 md:gap-y-0 md:flex-row">
              <button
                type="submit"
                className={`px-1 md:px-6 py-2 font-bold uppercase bg-green-600 text-sm md:text-lg ${
                  !hasPendingChanges && "opacity-70"
                }`}
              >
                Save changes
              </button>

              <button
                className="px-1 py-2 text-sm font-bold uppercase bg-red-600 md:px-6 md:text-lg"
                onClick={() => {
                  if (confirm("Deactivated account?\nJust login again to reactivate your account.\n\nClick OK to proceed.") == true) {
                    deactivateAccount();
                  }
                }}
              >
                Deactivate account
              </button>
            </div>
          </form>
        </div>
        </Fragment>
        :
        <div className="flex flex-col items-center gap-y-4">
          <div className="relative w-48 h-48">
            <img
              className="object-cover object-center w-full h-full rounded drop-shadow-md"
              src={`/api/users/${user.id}/generateTfa`}
            />
          </div>
          {getTfaForm()}
        </div>
        }
      </div>
    </div>
  );
};

Welcome.getLayout = withDashboardLayout;
Welcome.authConfig = true;

export default Welcome;
