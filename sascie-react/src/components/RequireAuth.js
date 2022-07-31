import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import BadAuth from './BadAuth';
import { getAuthToken, getAuthUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router';


const RequireAuth = ({ children, minimumAuthLevel }) => {
    const token = useSelector(getAuthToken);
    const authUser = useSelector(getAuthUser);
    const navigate = useNavigate();

    useEffect(() => {
        if(!authUser) {
            navigate('/');
        }
    }, [])

    const authLevels = ['viewer', 'inputer', 'admin'];
    const authUserLevel = authLevels.indexOf(authUser?.role);
    const requiredAuthLevel = minimumAuthLevel ? authLevels.indexOf(minimumAuthLevel) : 0;

    if(!token || authUserLevel < requiredAuthLevel) {
        return <BadAuth />
    };

    return children;
}

export default RequireAuth;