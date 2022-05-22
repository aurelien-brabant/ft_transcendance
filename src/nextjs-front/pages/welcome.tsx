import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { MdCameraswitch, MdOutlineArrowBackIos } from "react-icons/md";
import { CloudUploadIcon, UploadIcon, XIcon } from "@heroicons/react/outline";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import isEmail from "validator/lib/isEmail";
import { NextPageWithLayout } from "./_app";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import Tooltip from "../components/Tooltip";
import ResponsiveSlide from "../components/ResponsiveSlide";
import withDashboardLayout from "../components/hoc/withDashboardLayout";
import { useSession } from "../hooks/use-session";

const labelClassName = "grow uppercase text-neutral-400";
const inputClassName =
  "transition col-span-2 grow bg-transparent outline-0 border-04dp pb-1 border-b-2 focus:border-pink-600";
const inputGroupClassName =
  "grid md:grid-cols-4 grid-cols-1 items-center gap-x-8 gap-y-2";
const actionTooltipStyles = "font-bold bg-dark text-neutral-200";

type FormData = {
  username?: string;
  email?: string;
  tfa?: boolean;
  pic?: string;
};

const InputErrorProvider: React.FC<{ error?: string | null }> = ({
  children,
  error,
}) => (
  <div className="flex flex-col col-span-2">
    <small className="min-h-[1.5em] text-red-400">{error && error}</small>
    {children}
  </div>
);

const Welcome: NextPageWithLayout = () => {
  const { user, logout, reloadUser, backend } = useSession();
  const router = useRouter();
  const { setAlert } = useContext(alertContext) as AlertContextType;
  const [pendingChanges, setPendingChanges] = useState(false);
  const [pendingPic, setPendingPic] = useState(false);
  const [pendingQR, setPendingQR] = useState(false);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaStatus, setTfaStatus] = useState(user.tfa ? "enabled" : "disabled");
  const [currentStep, setCurrentStep] = useState(0);
  const inputToFocus = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<FormData>>({});

  /* Send new informations */
  const editUser = async (formData: FormData) => {
    const res = await backend.request(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(formData),
    });

    if (res.status === 200) {
      await reloadUser();

      setAlert({
        type: "success",
        content: "User edited successfully",
      });
    } else {
      const data = await res.json();

      setAlert({
        type: "error",
        content: data.message,
      });
    }
  };

  /* Form */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldErrors({
      ...fieldErrors,
      [e.target.name]: undefined,
    });
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isUsernameValid = (username: string) => {
    return /^[^0-9][a-zA-Z0-9_]+$/.test(username);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: Partial<FormData> = {};

    if (!pendingChanges) return;

    if (formData.username) {
      const usernameLen = formData.username.trim().length;

      if (usernameLen < 2 || usernameLen > 30) {
        errors["username"] = "Username can contain between 2 and 30 characters";
      } else if (formData.username === user.username) {
        errors["username"] = "This is already your username";
      } else if (!isUsernameValid(formData.username)) {
        errors["username"] =
          "The username must not start with a number and contain alphanumeric characters and underscores only";
      }
    }

    if (formData.email) {
      formData.email = formData.email.toLowerCase();

      if (!isEmail(formData.email)) {
        errors["email"] = "Not a valid email";
      } else if (formData.email === user.email) {
        errors["email"] = "This is already your email";
      }
    }

    if (Object.keys(errors).length === 0) {
      editUser(formData);
    }
    setFieldErrors(errors);
    setPendingChanges(false);
    setFormData({});
  };

  useEffect(() => {
    /* Remove empty strings or undefined fields */
    Object.keys(formData).forEach(
      (key) =>
        (formData[key as keyof FormData] === undefined ||
          formData[key as keyof FormData] === "") &&
        delete formData[key as keyof FormData]
    );

    setPendingChanges(
      !(!formData.username && !formData.email && !formData.tfa && !formData.pic)
    );
  }, [formData]);

  /* User's avatar */
  const get42Pic = async () => {
    setAlert({ type: "info", content: "Default 42 avatar requested" });
    const res = await backend.request(`/api/users/${user.id}/avatar42`);

    if (res.ok) {
      router.reload();
    } else {
      setAlert({ type: "error", content: "Error while loading 42 avatar" });
    }
  };

  const getRandomPic = async () => {
    setAlert({ type: "info", content: "Random avatar requested" });
    const res = await backend.request(`/api/users/${user.id}/randomAvatar`);

    if (res.ok) {
      router.reload();
    } else {
      setAlert({ type: "error", content: "Error while loading random avatar" });
    }
  };

  const UploadPic = () => {
    const [image, setImage] = useState("");
    const [imageChosen, setImageChosen] = useState(false);

    const uploadToClient = (event: any) => {
      if (event.target.files && event.target.files[0]) {
        const img = event.target.files[0];
        setImage(img);
        setImageChosen(true);
      }
    };

    const uploadToServer = async () => {
      if (!imageChosen) return;

      const body = new FormData();
      body.append("image", image);

      const res = await backend.request(`/api/users/${user.id}/uploadAvatar`, {
        method: "POST",
        body,
      });

      if (res.ok) {
        setPendingPic(false);
        router.reload();
      } else if (res.status === 406) {
        setAlert({
          type: "warning",
          content: "Only JPG/JPEG/PNG/GIF are accepted",
        });
      } else if (res.status === 413) {
        setAlert({ type: "warning", content: "File size too big!" });
      } else {
        setAlert({
          type: "error",
          content: "Error while uploading new avatar",
        });
      }
    };

    return (
      <ResponsiveSlide
        useMediaQueryArg={{ query: "(min-width: 1280px)" }}
        direction="left"
        duration={200}
        triggerOnce
      >
        <div className="flex justify-center text-pink-500 space-x-5 text-center items-center">
          <input
            type="file"
            name="uploadAvatar"
            className="border border-pink-500 p-1"
            onChange={uploadToClient}
          />
          <Tooltip className={actionTooltipStyles} content="Upload">
            <button className="p-2 text-2xl text-pink-600 rounded-full transition">
              <CloudUploadIcon
                className={`h-6 w-6 ${
                  imageChosen ? "hover:hover:scale-120" : "opacity-70"
                }`}
                onClick={uploadToServer}
              />
            </button>
          </Tooltip>
        </div>
      </ResponsiveSlide>
    );
  };

  /* TFA */
  const activateTfa = async () => {
    const res = await backend.request(`/api/users/${user.id}/enableTfa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify({ tfaCode: tfaCode }),
    });

    if (res.status === 200) {
      setAlert({ type: "success", content: "2FA activated successfully" });
      setTfaStatus("enabled");
      setPendingQR(false);
    } else {
      setAlert({ type: "error", content: "Wrong verification code!" });
      setTfaStatus("disabled");
      setTfaCode("");
      setCurrentStep(0);
    }
  };

  const deactivateTfa = async () => {
    const res = await backend.request(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify({
        tfa: false,
        tfaSecret: null,
      }),
    });

    if (res.status === 200) {
      setAlert({ type: "success", content: "2FA deactivated successfully" });
      setTfaStatus("disabled");
    }
  };

  const handleChangeTfa = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const key = e.target.value;

    if (/^[0-9]+$/.test(key)) {
      e.target.value = tfaCode[currentStep];
      setCurrentStep(currentStep + 1);
    }
    // else if (key !== "Escape") {
    //   setAlert({ type: "warning", content: "Only digit!" });
    //   e.target.value = "";
    // }
  };

  const checkStep = (key: string) => {
    if (/^[0-9]+$/.test(key)) {
      setTfaCode(tfaCode + key);
    }

    if ((currentStep > 0 && key === "Backspace") || key === "ArrowLeft") {
      setTfaCode(tfaCode.substring(0, tfaCode.length - 1));
      setCurrentStep(currentStep - 1);
    } else if (key === "Escape") {
      setPendingQR(false);
      setTfaCode("");
      setCurrentStep(0);
    }
  };

  useEffect(() => {
    inputToFocus.current?.focus();
  }, [currentStep, pendingQR]);

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
          onKeyDown={(e) => {
            checkStep(e.key);
          }}
        />
      );
    }

    return (
      <div>
        <div className="space-x-3 md:space-x-5 my-5 text-center">
          <h1 className="my-10 text-center text-xl text-pink-700 uppercase animate-pulse">
            Enter the 6-digit code from your Authenticator App
            <br />
            Press ECHAP to cancel
          </h1>
          {content}
        </div>
        <div className="flex justify-center p-5">
          <MdOutlineArrowBackIos
            className="font-bold text-2xl text-pink-600 hover:animate-bounceBack hover:cursor-pointer"
            onClick={() => {
              setPendingQR(false);
            }}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (tfaCode.length === 6) {
      activateTfa();
    }
  }, [tfaCode]);

  /* Account deactivation/reactivation */
  const handleLogout = async () => {
    await logout();
  };

  const deactivateAccount = async () => {
    const res = await backend.request(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountDeactivated: true,
      }),
    });

    if (res.status === 200) {
      await handleLogout();
    }
  };

  const reactivateAccount = () => {
    backend.request(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountDeactivated: false,
      }),
    });
  };

  useEffect(() => {
    if (user.accountDeactivated) {
      reactivateAccount();
    }
  }, []);

  return (
    <div className="text-white" id="main-content">
      <div style={{ maxWidth: "800px" }} className="px-2 mx-auto">
        {!pendingQR && user.duoquadra_login && (
          <div className="flex flex-col items-center p-2">
            <div className="bg-pink-200 rounded-full pb-0 pt-2 pr-2 pl-2">
              <Image
                src="/logo.svg"
                width={25}
                height={25}
                alt="42 logo"
                title="Get intra picture profile"
                className="hover:cursor-pointer"
                onClick={() => {
                  get42Pic();
                }}
              />
            </div>
          </div>
        )}

        {!pendingQR ? (
          <Fragment>
            <div className="flex flex-col items-center gap-y-10">
              <div className="relative w-48 h-48">
                <img
                  className="object-cover object-center w-full h-full rounded-full ring-pink-500 p-2 ring drop-shadow-md"
                  src={`/api/users/${user.id}/photo`}
                />

                {pendingPic ? (
                  <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
                    <Tooltip className={actionTooltipStyles} content="Cancel">
                      <button className="p-2 text-2xl text-pink-200 bg-pink-700 rounded-full transition hover:scale-105">
                        <XIcon
                          className="h-6 w-6"
                          onClick={() => {
                            setPendingPic(false);
                          }}
                        />
                      </button>
                    </Tooltip>
                  </div>
                ) : (
                  <div className="absolute left-0 right-0 flex items-center justify-center -bottom-4 gap-x-2">
                    <Tooltip
                      className={actionTooltipStyles}
                      content="Random avatar"
                    >
                      <button className="p-2 text-2xl text-pink-700 bg-pink-200 rounded-full transition hover:scale-105">
                        <MdCameraswitch
                          onClick={() => {
                            getRandomPic();
                          }}
                        />
                      </button>
                    </Tooltip>
                    <Tooltip
                      className={actionTooltipStyles}
                      content="Upload avatar"
                    >
                      <button className="p-2 text-2xl text-pink-700 bg-pink-200 rounded-full transition hover:scale-105">
                        <UploadIcon
                          className="h-6 w-6"
                          onClick={() => {
                            setPendingPic(true);
                          }}
                        />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>

              <div className="container mx-auto h-24">
                {pendingPic ? (
                  <UploadPic />
                ) : (
                  <div className="flex flex-col items-center">
                    <h1 className="text-2xl uppercase text-pink-500 font-extrabold">
                      {user.username}
                    </h1>
                    <Link href={`/users/${user.id}`}>
                      <a className="block py-1 text-sm uppercase text-neutral-200 hover:underline">
                        See public profile
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col py-12 gap-y-2">
              <h1 className="text-2xl">Edit profile</h1>

              {/* Inputs */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
                <div className={inputGroupClassName}>
                  <label htmlFor="username" className={labelClassName}>
                    Username
                  </label>
                  <InputErrorProvider error={fieldErrors["username"]}>
                    <input
                      className={inputClassName}
                      type="text"
                      name="username"
                      placeholder={user.username}
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </InputErrorProvider>
                </div>

                <div className={inputGroupClassName}>
                  <label htmlFor="email" className={labelClassName}>
                    Email address
                  </label>
                  <InputErrorProvider error={fieldErrors["email"]}>
                    <input
                      className={inputClassName}
                      type="text"
                      name="email"
                      placeholder={user.email}
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </InputErrorProvider>
                </div>

                <div className={inputGroupClassName}>
                  <label htmlFor="tfa" className={labelClassName}>
                    2FA - Authenticator App
                  </label>
                  <button
                    type="button"
                    className={`px-6 py-2 col-span-2 ${
                      tfaStatus === "enabled"
                        ? "bg-slate-700 hover:bg-slate-600"
                        : "bg-emerald-500 hover:bg-emerald-400"
                    }`}
                    onClick={() => {
                      if (tfaStatus === "disabled") {
                        setPendingQR(true);
                      } else {
                        if (
                          confirm(
                            "Deactivated 2FA with Authenticator App?\nYou can reactivate it when you want.\n\nClick OK to proceed."
                          ) == true
                        )
                        deactivateTfa();
                      }
                    }}
                  >
                    {tfaStatus === "enabled"
                      ? "DEACTIVATE 2FA"
                      : "ACTIVATE 2FA"}
                  </button>
                  <small>
                    Confirm each connection to your account using an
                    Authenticator App
                  </small>
                </div>

                {/* actions */}
                <div className="flex flex-col justify-between py-5 gap-y-4 md:gap-y-0 md:flex-row">
                  <button
                    type="submit"
                    className={`px-1 md:px-6 py-2 font-bold uppercase bg-emerald-500 text-sm md:text-lg ${
                      pendingChanges ? "hover:bg-emerald-400" : "opacity-70"
                    }`}
                  >
                    Save changes
                  </button>

                  <button
                    className="px-1 py-2 text-sm font-bold uppercase bg-slate-700 md:px-6 md:text-lg hover:bg-slate-600"
                    onClick={(e) => {
                      e.preventDefault();
                      if (
                        confirm(
                          "Deactivated account?\nJust login again to reactivate your account.\n\nClick OK to proceed."
                        ) == true
                      ) {
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
        ) : (
          <div className="flex flex-col items-center gap-y-4">
            <div className="relative w-48 h-48">
              <img
                className="object-cover object-center w-full h-full rounded drop-shadow-md"
                src={`/api/users/${user.id}/generateTfa`}
              />
            </div>
            {getTfaForm()}
          </div>
        )}
      </div>
    </div>
  );
};

Welcome.getLayout = withDashboardLayout;
Welcome.authConfig = true;

export default Welcome;
