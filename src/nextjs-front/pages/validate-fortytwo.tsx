import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ValidateFortyTwo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const requestURI = `http://localhost/api/auth/login42`;

    fetch(requestURI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiCode: searchParams.get('code')})
    }).then((res) => {
      if (res.status === 201) {
        res.json().then(({ access_token }) => {
          window.localStorage.setItem("bearer", access_token);
          router.push("/welcome");
        });
      } else {
        setError("An error occured");
      }

      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <h1> Validating forty two... </h1>;
  }

  return <h1 className="text-white bg-red-600">{error}</h1>;
};

export default ValidateFortyTwo;
