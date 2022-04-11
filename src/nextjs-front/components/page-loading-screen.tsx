import Image from 'next/image';

const PageLoadingScreen = () => {
    return (
        <main
            className={
                'bg-gray-900 min-h-screen flex items-center justify-center'
            }
        >
            <Image
                className={'animate-pulse'}
                src="/logo.svg"
                alt={'transcendance logo'}
                height="200"
                width="200"
            />
        </main>
    );
};

export default PageLoadingScreen;
