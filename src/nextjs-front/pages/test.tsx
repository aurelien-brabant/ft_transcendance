import { NextPageWithLayout } from './_app';

const TestPage: NextPageWithLayout = () => {
    return <h1>Hello this is a test page</h1>;
};

TestPage.authConfig = {
    fallbackUrl: '/test-signin',
};

export default TestPage;
