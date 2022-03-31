import { useSession } from '../hooks/use-session';
import React, { useState } from 'react';

const TestSignin = () => {
    const { login } = useSession();
    const [formData, setFormData] = useState<any>({ email: '', password: '' });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { email, password } = formData;
        console.log(email, password);
        await login(email, password);
    };

    return (
        <>
            <h1>Please Sign In</h1>
            <form
                className={'flex gap-y-2 flex-col items-center text-xl'}
                onSubmit={handleSubmit}
            >
                <input
                    type={'text'}
                    className={'bg-gray-900 text-white'}
                    name={'email'}
                    value={formData['email']}
                    onChange={handleChange}
                />
                <input
                    type={'password'}
                    name={'password'}
                    className={'bg-gray-900 text-white'}
                    onChange={handleChange}
                />
                <button type={'submit'}>Submit</button>
            </form>
        </>
    );
};

export default TestSignin;
