import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { getAuthToken } from '../features/auth/authSlice';

const RequireAuth = ({ children }) => {
    const navigate = useNavigate();
    const token = useSelector(getAuthToken);

    if(!token) return navigate('/');

    return children;
}

export default RequireAuth;