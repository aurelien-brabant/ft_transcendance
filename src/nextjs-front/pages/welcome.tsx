import Link from 'next/link';
import { useContext, useEffect, useMemo } from "react";
import withDashboardLayout from "../components/hoc/withDashboardLayout";
import { FiEdit2 } from "react-icons/fi";
import { useState } from "react";
import isEmail from "validator/lib/isEmail";
import isMobilePhone from "validator/lib/isMobilePhone";
import {NextPageWithLayout} from './_app';
import withAuth from '../components/hoc/withAuth';
import authContext, {AuthContextType} from '../context/auth/authContext';

const labelClassName = "grow uppercase text-neutral-400";
const inputClassName =
  "transition col-span-2 grow bg-transparent outline-0 border-gray-800 pb-1 border-b-2 focus:border-pink-600";
const inputGroupClassName = "grid md:grid-cols-4 grid-cols-1 items-center gap-x-8 gap-y-2";

type FormData = {
  nickname: string;
  email: string;
  phone: string;
  tfa: boolean;
};

type InvalidInputs = {
  nickname?: string;
  email?: string;
  phone?: string;
  tfa?: string;
};

const InputErrorProvider: React.FC<{ error?: string }> = ({
  children,
  error,
}) => (
  <div className="flex flex-col col-span-2">
    <small className="min-h-[1.5em] text-red-500">{error && error}</small>
    {children}
  </div>
);

const validatePhone = (phone: string) => {
  return isMobilePhone(phone.replace(/ /g, ""));
};

const baseObject: FormData = {
  nickname: "Lord Norminet",
  email: "lordnorminet@42.fr",
  phone: "+33 7 52 63 43 53",
  tfa: false,
};

const Welcome: NextPageWithLayout = () => {
  const { getUserData } = useContext(authContext) as AuthContextType;
  const [formData, setFormData] = useState<FormData>({
    nickname: getUserData().username,
    email: getUserData().email,
    phone: getUserData().phone ? getUserData().phone : '',
    tfa: false
  });

  const [invalidInputs, setInvalidInputs] = useState<InvalidInputs>({});

  useEffect(() => {
    console.log(getUserData());
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!hasPendingChanges) return;

    const tmp: InvalidInputs = {};

    if (formData.nickname.length < 5 || formData.nickname.length > 50) {
      tmp.nickname = "nickname can contain between 5 and 50 characters";
    }

    if (!isEmail(formData.email)) {
      tmp.email = "Not a valid email";
    }

    if (formData.phone && !isMobilePhone(formData.phone.replace(/ /g, ""))) {
      tmp.phone = "Not a valid phone number";
    }

    setInvalidInputs(tmp);
  };

  const hasValidPhone = validatePhone(formData.phone);

  const tfaBgColor = hasValidPhone
    ? formData.tfa
      ? "bg-red-500"
      : "bg-green-500"
    : "bg-gray-800";
  const tfaText = hasValidPhone
    ? (formData.tfa ? "Disable" : "Enable") + " 2FA"
    : "Valid phone number required";

  return (
    <div className="min-h-screen text-white bg-gray-900 grow" id="main-content">
      <div
        style={{ minHeight: "300vh", maxWidth: "800px" }}
        className="px-2 py-16 mx-auto"
      >
        <div className="flex flex-col items-center gap-y-4">
          <div className="relative w-48 h-48">
            <img
              className="object-cover object-center w-full h-full rounded drop-shadow-md"
              src={`/api/users/${getUserData().id}/photo`}
            />
            <div className="absolute p-2 bg-white border-2 border-gray-900 rounded-full -top-4 -right-4">
              <FiEdit2 className="text-gray-900" />
            </div>
          </div>
          <div className="text-center">
          <h2 className="text-xl font-bold text-pink-600">{getUserData().username}</h2>
            <Link href={`/users/lordnorminet`}><a className="block py-1 text-sm uppercase text-neutral-200">See public profile</a></Link>
          </div>
        </div>
        <div className="flex flex-col py-12 gap-y-10">
          <h1 className="text-2xl">Edit profile</h1>

          {/* Inputs */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
            <div className={inputGroupClassName}>
              <label htmlFor="nickname" className={labelClassName}>
                Nickname
              </label>
              <InputErrorProvider error={invalidInputs.nickname}>
                <input
                  value={formData.nickname}
                  onChange={handleChange}
                  type="text"
                  name="nickname"
                  className={inputClassName}
                />
              </InputErrorProvider>
              <small></small>
            </div>

            <div className={inputGroupClassName}>
              <label htmlFor="nickname" className={labelClassName}>
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
              <small></small>
            </div>

            <div className={inputGroupClassName}>
              <label htmlFor="phone" className={labelClassName}>
                Phone
              </label>
              <InputErrorProvider error={invalidInputs.phone}>
                <input
                  value={formData.phone}
                  onChange={handleChange}
                  type="text"
                  name="phone"
                  className={inputClassName}
                />
              </InputErrorProvider>
              <small>
                We will use that data for two factor authentication, nothing
                else!
              </small>
            </div>

            <div className={inputGroupClassName}>
              <label htmlFor="tfa" className={labelClassName}>
                Two factor authentication
              </label>
              <button
                type="button"
                className={`px-6 py-2 col-span-2 ${tfaBgColor}`}
                onClick={() => {
                  if (hasValidPhone) {
                    setFormData({ ...formData, tfa: !formData.tfa });
                  }
                }}
              >
                {tfaText}
              </button>
              <small>
                Confirm each connection to your account using your mobile device
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

              <button className="px-1 py-2 text-sm font-bold uppercase bg-red-600 md:px-6 md:text-lg">
                Deactivate account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

Welcome.getLayout = withDashboardLayout;
Welcome.isAuthRestricted = true;

export default Welcome;
