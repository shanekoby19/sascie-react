import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaUserEdit, FaBookOpen, FaDoorOpen} from 'react-icons/fa';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { getAuthUser, logout } from '../features/auth/authSlice';

const Navigation = () => {
    const authUser = useSelector(getAuthUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return (
        <nav className='navigation'>
            <ul className='navigations'>
                <div 
                    className='navigation__item'
                    onClick={() => navigate('/profile')}
                >
                    <FaUserEdit 
                        className='navigation__item__icon'
                        onClick={() => navigate('/profile')}
                    />
                    <Link 
                        className='navigation__item__link' 
                        to={'/profile'}
                    >Profile</Link>
                </div>
                <div 
                    className='navigation__item'
                    onClick={() => navigate('/sascie/dashboard')}
                >
                    <FaBookOpen 
                        className='navigation__item__icon'
                        onClick={() => navigate('/sascie/dashboard')}
                    />
                    <Link 
                        className='navigation__item__link' 
                        to={'/sascie/dashboard'}
                    >Sascie</Link>
                </div>
                {
                    authUser?.role === 'admin' &&
                    <div 
                        className='navigation__item'
                        onClick={() => navigate('/admin/users')}
                    >
                            <FaLock 
                                className='navigation__item__icon'
                                onClick={() => navigate('/admin/users')}
                            />
                            <Link 
                                className='navigation__item__link' 
                                to={'/admin/users'}
                            >Admin</Link>
                    </div>
                }
                <div 
                    className='navigation__item'
                    onClick={async () => {
                        navigate('/');
                        dispatch(logout());
                    }}
                >
                    <FaDoorOpen 
                        className='navigation__item__icon'
                        onClick={async () => {
                            navigate('/');
                            await dispatch(logout());  
                        }}
                    />
                    <a 
                        className='navigation__item__link' 
                        to={'/'}
                        onClick={async () => {
                            navigate('/')
                            await dispatch(logout());
                        }}
                    >Logout</a>
                </div>
            </ul>
        </nav>
    )
}

export default Navigation