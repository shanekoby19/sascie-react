import { useRef, useState } from 'react'
import { useDispatch } from 'react-redux';

import Message from '../../components/Message';
import { sendResetToken } from './authSlice';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    // Hooks
    const emailRef = useRef('');
    const passwordRef = useRef('');
    const confirmPasswordRef = useRef('');
    const resetTokenRef = useRef('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Component State
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [buttonText, setButtonText] = useState('Send Reset Token');
    const [showResetInput, setShowResetInput] = useState(false);

    const handleForgotPassword = async (e) => {
        // Reset the state if the reset token has not yet been sent
        e.preventDefault();
        const email = emailRef.current.value;

        if(buttonText === 'Send Reset Token') {
            try {
                const response = await dispatch(sendResetToken(email)).unwrap();
                if(response.status !== 'success') return setError(response.error);
                setShowResetInput(true);
                setSuccess(`A reset token has been sent to ${email}, please enter it below to continue.`);
                setButtonText('Verify Reset Token');
            } catch(err) {
                setError(err);
                setSuccess('');
            }
        }
        else if(buttonText === 'Verify Reset Token') {
            setSuccess('');
            setError('');
            try {
                let response = await fetch(`http://localhost:5000/api/v1/auth/reset-password/${resetTokenRef.current.value}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'  },
                    body: JSON.stringify({
                        password: passwordRef.current.value,
                        confirmPassword: confirmPasswordRef.current.value,
                    }),
                });
                response = await response.json();
                console.log(response);
                if(response.status !== 'success') return setError(response.error);
                navigate('/');

            } catch(err) {
                return err;
            }
        }
    }

    return (
        <section className='forgot__password'>
            <form className='forgot__password__form' name="forgot__password-form" onSubmit={handleForgotPassword}>
                <h1 className='forgot__password__form__title'>Forgot Password?</h1>
                <div className='forgot__password__form__input'>
                    <label htmlFor="email">Email:</label>
                    <input 
                        ref={emailRef}
                        type="email"
                        required
                        placeholder='example@example.com'
                        autoComplete='username'
                    ></input>
                </div>
                {
                    showResetInput &&
                    <>
                        <div className='forgot__password__form__input'>
                            <label htmlFor="text">Reset Token:</label>
                            <input 
                                ref={resetTokenRef}
                                id="text"
                                required
                            ></input>
                        </div>
                        <div className='forgot__password__form__input'>
                            <label htmlFor="password">Password: (Minimum 8 Characters)</label>
                            <input 
                                ref={passwordRef}
                                type="password" 
                                id="password" 
                                minLength="8" 
                                required
                                autoComplete='new-password'
                            ></input>
                        </div>
                        <div className='forgot__password__form__input'>
                            <label htmlFor="confirmPassword">Confirm Password: (Minimum 8 Characters)</label>
                            <input 
                                ref={confirmPasswordRef}
                                type="password" 
                                id="confirmPassword" 
                                minLength="8" 
                                required
                                autoComplete='new-password'
                            ></input>
                        </div>
                    </>
                }
                {error ? <Message message={error} className='error'/> : null}
                {success ? <Message message={success} className='success'/> : null}
                <div className='login__form__input'>
                    <button 
                        className='login__form__input__btn'
                        onClick={handleForgotPassword}
                    >{buttonText}</button>
                </div>
            </form>
        </section>
    )
}

export default ForgotPassword;