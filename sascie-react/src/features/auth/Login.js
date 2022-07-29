import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

import { getAuthStatus, login } from './authSlice';
import { getUsersStatus, fetchUsers } from '../users/usersSlice';
import { setSascieData } from '../sascie/sascieSlice';
import Message from '../../components/Message';

const parentVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.015
        }
    }
}

const loadingVariants = {
    hidden: {
        y: 5
    },
    visible: {
        y: -15,
        transition: {
            repeat: Infinity,
            repeatType: 'mirror',
            duration: 0.6
        }
    }
}

const slides = [{
    name: 'Our Vision',
    text: 'At Acelero, Inc., we envision a world where children become champions of their own making; where historical biases and systemic inequities no longer stand in the way of their infinite promise.'
}, {
    name: 'Our Mission',
    text: 'Acelero, Inc. designs and delivers inclusive, anti-bias, and rigorous approaches to eliminate the gaps between young children’s inherent potential and their achievement in school and life. With our partners, we accelerate child and family outcomes that honor the aspirations and cultures of the communities we serve.'
}];

const Login = () => {
    useEffect(() => {
        typeWriter();
    }, [])

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authStatus = useSelector(getAuthStatus);
    const usersStatus = useSelector(getUsersStatus);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [viewPassword, setViewPassword] = useState(false);

    const onEmailUpdate = (e) => setEmail(e.target.value);
    const onPasswordUpdate = (e) => setPassword(e.target.value);

    const handleLogin = async (e) => {
        e && e.preventDefault();

        setError('');
        try {
            const res = await dispatch(login({ email, password })).unwrap();
            if(res.status === 'error') return setError(res.error);
            console.log('Server Respone: ', res);

            // If the user successfully logged in, set there sascie data and fetch all users.
            dispatch(setSascieData(res.data));
            loadUsers();
        } catch(err) {
            return;
        }
    }

    const loadUsers = async () => {
        try {
            const res = await dispatch(fetchUsers()).unwrap();
            console.log('Users Response: ', res);
            if(res.status === 'success') return navigate('/sascie/dashboard');
            setError(res.error);
        } catch(err) {
            return;
        }
    }

    let i = 0;
    const typeWriter = () => {
        try {
            let text = slides[0].text;
            if(i < text.length) {
                document.getElementById('text').innerHTML += text[i];
                i++
                setTimeout(typeWriter, 85);
            }
        } 
        // Fail silently if a user logs in before the animation is complete.
        catch(err) {
            
        }
    }

    const setDemoCredentials = () => {
        const demoEmail = 'demo@sasciedemo.com';
        const demoPassword = 'root1234';

        document.getElementById('email').value = demoEmail;
        document.getElementById('password').value = demoPassword;

        setEmail(demoEmail);
        setPassword(demoPassword);
    }

    return (
        <main>
            <section className='slides'>
                <div className='slide'>
                    <h2 className='slide__text' id="text"></h2>
                    <h4 className='slide__name'>{`${slides[1].name}`}</h4>
                </div>
            </section>
            <section className='login'>
                <form className='login__form' name="login-form" onSubmit={handleLogin}>
                    <img 
                        src='./img/site/shine-early-learning.png'
                        className='login__form__img'
                        alt='Shine logo'
                    />
                    <h1 className='login__form__title'>Welcome Back!</h1>
                    <div className='login__form__input'>
                        <label htmlFor="email">Email</label>
                        <input 
                            onChange={e => onEmailUpdate(e)} 
                            type="email" 
                            id="email"
                            required
                            placeholder='example@example.com'
                            autoComplete='username'
                            className='input__base'
                        ></input>
                        <span className='login__form__input__email__icon'>@</span>
                    </div>
                    <div className='login__form__input'>
                        <label htmlFor="password">Password</label>
                        <input 
                            onChange={e => onPasswordUpdate(e)} 
                            type="password" 
                            id="password" 
                            minLength="8" 
                            required
                            autoComplete='current-password'
                            className='input__base'
                        ></input>
                        { 
                            viewPassword ? 
                            <FaEye 
                                className='login__form__input__password__icon'
                                id='login__form__input__password__icon--open'
                                onClick={() => {
                                    // Change the password input from type "text" to type "password"
                                    document
                                        .getElementById('login__form__input__password__icon--open')
                                        .parentElement.childNodes[1]
                                        .setAttribute("type", "password");
                                    setViewPassword(false);
                                }}
                            /> : 
                            <FaEyeSlash 
                                className='login__form__input__password__icon'
                                id='login__form__input__password__icon--shut'
                                onClick={() => {
                                    // Change the password input from type "password" to type "text"
                                    document
                                        .getElementById('login__form__input__password__icon--shut')
                                        .parentElement.childNodes[1]
                                        .setAttribute("type", "text");
                                    setViewPassword(true);
                                }}
                            />
                        }
                    </div>
                    {error ? <Message message={error} className='error'/> : null}
                    <div className='login__form__input'>
                        <button 
                            className='login__form__input__btn'
                            onClick={handleLogin}
                        >
                        {
                            authStatus === 'pending' || authStatus === 'fulfilled' ||
                            usersStatus === 'pending' || usersStatus === 'fulfilled' ?  
                            <motion.div
                                className='login__form__loader'
                                variants={parentVariants}
                                initial="hidden"
                                animate="visible"
                            >{"...Loading".split('').map(char => (
                                <motion.p
                                    key={uuidv4()}
                                    className='login__form__loader__character'
                                    variants={loadingVariants}
                                >{char}</motion.p>
                            ))}</motion.div> :
                            "Login"
                        }
                        </button>
                    </div>
                    <div className='login__form__actions'>
                        <span 
                            className='login__form__action login__form__action--forgot__password'
                            onClick={() => navigate('/auth/forgot-password')}>Forgot Password?
                        </span>
                        <span 
                            className='login__form__action login__form__action--demo'
                            onClick={setDemoCredentials}>Don't have an account, use our demo?
                        </span>
                    </div>
                </form>
            </section>
        </main>
    )
}

export default Login;