# frontend

**IMPORTANT NOTE**: now that the frontend and the backend are connected together, the recommended way
to access the frontend is to make use of the nginx reverse proxy. In summary, connect on port 80 and not on
port 3000 unless you need to use the NextJS development server directly.

## Manage authentication and route authorization

For this app, the authentication process is handled on the client-side so that NextJS is able to perform static rendering
most of the time. That's the reason why on each new request, a small loading screen is displayed.

Every page of the app triggers the authentication process. If the user is not logged in (i.e doesn't have a JWT in local storage)
nothing happens but this is checked by the `Authenticator` component.

By default a NextJS page is not protected, which means that everyone, logged or not, can access it.
Here is an example on how to protect a route if it's needed:

```tsx
import { NextPageWithLayout } from './_app';

const Page: NextPageWithLayout = () => {
	return (
		<h1> Hi there, this is a protected page </h1>
	);
}

Page.isAuthRestricted = true; // only logged in users can access this page, the component will never be mounted if it's not the case

export default Page; // we are exporting the page as usual no change needed here
```

Set the `isAuthRestricted` property of the page, and the `_app.tsx` logic will take care of the rest.

Note that you can add specific configuration by setting the `Page.authConfig` property that will merge the config object
it is set to with the default one. See the `AuthConfig` type for more info.
