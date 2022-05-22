/*
  This example requires Tailwind CSS v2.0+

  This example requires some changes to your config:

  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import {
  ChangeEvent,
  Fragment,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  FireIcon,
  HomeIcon,
  MenuAlt2Icon,
  UsersIcon,
  XIcon,
} from "@heroicons/react/outline";
import { SearchIcon } from "@heroicons/react/solid";
import { classNames } from "../../utils/class-names";
import { useSession } from "../../hooks/use-session";
import { CheckIcon } from "@heroicons/react/solid";
import { Combobox } from "@headlessui/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useLiveSearch } from "../../hooks/use-live-search";
import { SimpleSpinner } from "../simple-spinner";
import { BiTrophy } from "react-icons/bi";

const TOPNAV_OFFSET = "64px";

/**
 * Search bar used to search for users and go to their profile page.
 * Implements a query caching system and make uses of the special
 * /users/search API route.
 */

type SearchedUser = {
  username: string;
  duoquadra_login?: string;
  id: number;
};

const SearchBar = () => {
  const fetchUsers = async (searchTerm: string): Promise<SearchedUser[]> => {
    const res = await fetch(`/api/users/search?v=${searchTerm}`);

    if (res.ok) {
      const fetchedUsers: SearchedUser[] = await res.json();

      return fetchedUsers;
    }

    return [];
  };

  const [selectedPerson, setSelectedPerson] = useState();
  const router = useRouter();

  const {
    elements: users,
    setSearchQuery,
    searchQuery,
    isProcessing,
  } = useLiveSearch<SearchedUser>(fetchUsers, (user) => user.username);

  const filteredPeople =
    searchQuery === ""
      ? users
      : users.filter((user) => {
          return user.username
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        });

  const handleSelect = async (user: any) => {
    setSelectedPerson(user);
    await router.push(`/users/${user.username}`);
  };

  const handleQueryChange = async ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(value);
  };

  return (
    <Combobox as={Fragment} value={selectedPerson} onChange={handleSelect}>
      <div className="relative mt-1 w-1/2">
        <Combobox.Input
          className="w-full rounded-md border border-white/10 bg-01dp py-2 pl-3 pr-10 text-white/80 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 sm:text-sm"
          onChange={handleQueryChange}
          displayValue={(user: any) => user.username}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          {isProcessing && (
            <SimpleSpinner className="mr-3 h-5 w-5 text-pink-500" />
          )}
          <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredPeople.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-01dp text-white/80 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredPeople.map((user) => (
              <Combobox.Option
                key={user.id}
                value={user}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-04dp text-white" : "text-white/80"
                  )
                }
              >
                {({ active, selected }) => (
                  <div className={"flex items-center gap-x-2"}>
                    {/* eslint-disable-next-line */}
                    <img
                      src={`/api/users/${user.id}/photo`}
                      alt={"photo"}
                      className={"rounded-full w-7 h-7 object-cover"}
                    />
                    <span
                      className={classNames(
                        "block truncate",
                        selected && "font-semibold"
                      )}
                    >
                      {user.username}
                    </span>

                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-pink-600"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

export const DashboardLayout: FunctionComponent = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useSession();

  const navigation = [
    { name: "My profile", href: `/users/${user.username}`, icon: HomeIcon, current: true },
    { name: "Friends", href: "/friends", icon: UsersIcon, current: false },
    { name: "Play", href: "/hub", icon: FireIcon, current: false },
    { name: "Leaderboard", href: "/leaderboard", icon: BiTrophy, current: false },
  ];

  const [selectedTabHref, setSelectedTabHref] = useState(navigation[0].href);
  const router = useRouter();

  useEffect(() => {
    let currentlySelectedHref = "";

    for (const { href } of navigation) {
      if (
        router.asPath.startsWith(href) &&
        href.length > currentlySelectedHref.length
      ) {
        currentlySelectedHref = href;
      }
    }

    setSelectedTabHref(currentlySelectedHref);
  }, [router.asPath]);



  const userNavigation = [
    { name: "Settings", href: "/welcome" },
    // { name: "My profile", href: `/users/${user.id}` },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          {/* @ts-ignore */}
          <Dialog
            as="div"
            className="fixed inset-0 flex z-40 md:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-02dp">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-shrink-0 flex items-center justify-center px-4">
                  <div className="h-14 relative w-14">
                    <Image
                      layout={"fill"}
                      src={"/logo_pink.svg"}
                      alt="Transcendance"
                    />
                  </div>
                </div>
                <div className="mt-5 flex-1 h-0 overflow-y-auto">
                  <nav className="px-2 space-y-1">
                    {navigation.map((item) => (
                      <Link href={item.href} key={item.name}>
                        <a
                          className={classNames(
                            item.href === selectedTabHref
                              ? "bg-01dp text-white"
                              : "text-gray-300 hover:bg-01dp hover:text-white",
                            "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.href === selectedTabHref
                                ? "text-gray-300"
                                : "text-gray-400 group-hover:text-gray-300",
                              "mr-4 flex-shrink-0 h-6 w-6"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex-1 flex flex-col min-h-0 bg-02dp">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-01dp">
              <div className="w-12 h-12 relative">
                <Image src="/logo_pink.svg" layout={"fill"} alt="Workflow" />
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link href={item.href} key={item.name}>
                    <a
                      className={classNames(
                        item.href === selectedTabHref
                          ? "bg-01dp text-white"
                          : "text-gray-300 hover:bg-01dp hover:text-white",
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.href === selectedTabHref
                            ? "text-gray-300"
                            : "text-gray-400 group-hover:text-gray-300",
                          "mr-3 flex-shrink-0 h-6 w-6"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="md:pl-64 flex flex-col">
          <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-01dp shadow">
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex items-center">
                <SearchBar />
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                {/* Profile dropdown */}
                {/* @ts-ignore */}
                <Menu as="div" className="ml-3 relative">
                  <div>
                    <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                      <span className="sr-only">Open user menu</span>
                      <div
                        className={
                          "relative h-8 w-8 rounded-full overflow-hidden"
                        }
                      >
                        {/* eslint-disable-next-line */}
                        <img
                          src={`/api/users/${user.id}/photo`}
                          alt=""
                          className={"h-full w-full object-cover"}
                        />
                      </div>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-03dp ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }: { active: boolean }) => (
                            <Link href={item.href}>
                              <a
                                className={classNames(
                                  active ? "bg-01dp" : "",
                                  "block px-4 py-2 text-sm text-white/80"
                                )}
                              >
                                {item.name}
                              </a>
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                      <button
                        className="block px-4 py-2 text-sm text-pink-600"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <main
            className="bg-dark flex-1 relative"
            style={{
              background:
                "repeating-linear-gradient(rgba(18,18,18,0.90), rgba(18,18,18,0.90)), url('/triangles.png') repeat",
              minHeight: `calc(100vh - ${TOPNAV_OFFSET})`,
            }}
          >
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
