import withWildLayout from "../components/hoc/withWildLayout";
import Link from "next/link";
import Image from "next/image";
import { TiArrowDown } from "react-icons/ti";
import { Feature, features } from "../constants/feature";
import { team, TeamMember } from "../constants/team";
import { VscGithub } from 'react-icons/vsc';
import { SiLinkedin } from 'react-icons/si';

const Feature: React.FC<Feature> = ({ label, description, Icon }) => (
  <div className="flex flex-col items-center justify-between h-full text-xl text-center text-neutral-200 gap-y-8">
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center justify-center p-5 text-white bg-pink-600 rounded-full drop-shadow-md">
        <Icon className="text-6xl fill-white" />
      </div>
      <h3 className="text-3xl font-bold text-white">{label}</h3>
    </div>
    <p>{description}</p>
  </div>
);

const TeamMember: React.FC<TeamMember> = ({
  login42,
  role,
  firstname,
  lastname,
  imageSrc,
  githubLink,
  linkedinLink
}) => (
  <div className="relative z-10 h-96 drop-shadow-md">
      <Image
        src={imageSrc}
        layout="fill"
        objectFit="cover"
        objectPosition="center"
      ></Image>

    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between h-full p-4 text-center text-gray-900 bg-gray-100 opacity-0 transition hover:opacity-90 gap-y-2 ">
    <div className="flex flex-col items-center gap-y-2">
      <div className="flex items-center gap-x-2">
        <h4 className="text-lg font-bold">
          {firstname} {lastname}
        </h4>
        <small className="gray-900">{login42}</small>
      </div>
      <h5 className="uppercase">{role}</h5>
    </div>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum non
      pellentesque elit. Nam non eros sed elit consequat efficitur.
    </p>

    <div className="flex text-4xl gap-x-4" >
      {githubLink && (
        <a href={githubLink} target="_blank" rel="noreferrer" className="hover:opacity-75 transition">
      <VscGithub />
        </a>
      )}
      {linkedinLink && (
        <a href={linkedinLink} target="_blank" rel="noreferrer" className="hover:opacity-75 transition">
      <SiLinkedin />
        </a>
      )}
    </div>
    </div>
  </div>
);

const HomePage: React.FC = () => {
  return (
    <main>
      {/* hero banner section */}
      <section
        className="bg-fixed bg-gray-900 bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.90), rgba(0, 0, 0, 0.90)),
      url('/landing.webp')`,
        }}
      >
        {/* Hero banner */}
        <div className="absolute z-0 hidden lg:block top-36 left-24 animate-blinkSlow">
          <Image src="/starplanet.webp" height={400} width={400} />
        </div>

        <div className="absolute z-0 hidden lg:block bottom-24 right-32 animate-fuse">
          <Image src="/rocket.webp" height={400} width={400} />
        </div>

        <div
          className="container relative flex flex-col items-center justify-center px-2 mx-auto text-center text-white sm gap-y-8"
          style={{ minHeight: "95vh" }}
        >
          <h1 className="text-3xl leading-tight text-pink-600 uppercase lg:text-5xl md:text-5xl">
            It's time for your
            <br /> <b>self-transcendance</b>
          </h1>
          <h3 className="text-2xl lg:text-3xl text-neutral-200">
            Let’s have the most entertaining pong game of your life.
          </h3>
          <Link href="/">
            <a className="px-6 py-2 text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">
              Play now
            </a>
          </Link>
        </div>
      </section>

      <section className={"relative py-20 md:py-32 bg-gray-900 "} id="discover">
        <div className="absolute top-0 left-0 right-0 flex justify-center -translate-y-10">
          <div className="flex items-start p-3 bg-white rounded-full">
            <TiArrowDown className="block text-6xl drop-shadow-md animate-upAndDown" />
          </div>
        </div>
        <div className="container px-3 mx-auto text-neutral-200">
          <div className="grid lg:grid-cols-2 gap-x-16 gap-y-8">
            <div className="flex flex-col items-start justify-center">
              <div>
                <h2 className="pb-4 text-4xl text-center lg:text-left">
                  The pong reboot 2022 needs
                </h2>
                <p className="py-4 text-xl">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Vestibulum non pellentesque elit. Nam non eros sed elit
                  consequat efficitur. Suspendisse efficitur libero eget diam
                  semper, et eleifend nisl vulputate.
                </p>
                <p className="py-4 text-xl">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
                  luctus, lorem non efficitur laoreet, ante arcu vehicula eros,
                  quis rutrum ligula ligula eu purus. Vestibulum tempus orci
                  ipsum, eu condimentum neque egestas non.
                </p>
                <p className="py-4 text-xl">
                  Nulla pulvinar luctus orci, facilisis faucibus urna tempus
                  volutpat. Sed tempor tortor orci, sit amet consequat tellus
                  mattis quis. Mauris vitae consequat mauris, non pretium velit.
                </p>
              </div>
              <Link href="/">
                <a className="px-10 py-2 mx-auto mt-4 text-xl font-bold uppercase bg-pink-600 lg:mx-0 drop-shadow-md text-bold text-neutral-200">
                  Try it
                </a>
              </Link>
            </div>
            <Image src="/pong_mac.webp" width={1300} height={1096} />
          </div>
        </div>
      </section>

      <section id="features" className="bg-gray-900">
        <div className="flex flex-col items-center py-16 md:mx-auto md:container gap-y-8">
          <div className="relative grid md:grid-cols-3 gap-16">
            <div className="absolute hidden h-1 bg-white rounded left-48 right-48 top-12 lg:block" />
            {features.map((feature) => (
              <Feature key={feature.label} {...feature} />
            ))}
          </div>
          <Link href="/">
            <a className="px-10 py-2 mx-auto mt-4 text-xl font-bold uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">
              Enter the fight
            </a>
          </Link>
        </div>
      </section>

      <section id="team" className="pt-16 pb-16 bg-center bg-cover"
style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.90), rgba(0, 0, 0, 0.90)),
      url('/42paris.webp')`,
        }}

      >
        <div className="flex flex-col px-2 md:container md:mx-auto gap-y-16">
          <div className="flex flex-col gap-y-2">
          <h2 className="text-5xl font-bold text-center text-pink-600 uppercase">
            The team
          </h2>
          <h3 className="text-3xl text-center text-white" > They made it happen!</h3>
          </div>
          <div className="grid grid-cols-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {team.map((member) => (
              <TeamMember key={member.login42} {...member} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default withWildLayout(HomePage);
