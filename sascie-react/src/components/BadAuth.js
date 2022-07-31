import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const BadAuth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            navigate('/')
        }, 2000);
    }, []);


    return (
        <div className='bad-auth'>
            <h1 className='bad-auth--header'>ERROR: You are not authorized to access this route.</h1>
            <p className='bad-auth--sub-header'>returning to the login...</p>
        </div>
    )
}

export default BadAuth;