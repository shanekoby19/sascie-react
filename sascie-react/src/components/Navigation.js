import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaUserEdit, FaBookOpen, FaDoorOpen} from 'react-icons/fa';

import { useDispatch, useSelector } from 'react-redux';
import { getAuthUser, logout } from '../features/auth/authSlice';

const Navigation = () => {
    const authUser = useSelector(getAuthUser);
    const dispatch = useDispatch();

    return (
        <nav className='navigation'>
            <ul className='navigations'>
                <div className='navigation__item'>
                    <FaUserEdit className='navigation__item__icon'/>
                    <Link 
                        className='navigation__item__link' 
                        to={'/profile'}
                    >Profile</Link>
                </div>
                <div className='navigation__item'>
                    <FaBookOpen className='navigation__item__icon'/>
                    <Link 
                        className='navigation__item__link' 
                        to={'/sascie/dashboard'}
                    >Sascie</Link>
                </div>
                {
                    authUser?.role === 'admin' &&
                    <div className='navigation__item'>
                            <FaLock className='navigation__item__icon'/>
                            <Link 
                                className='navigation__item__link' 
                                to={'/admin/users'}
                            >Admin</Link>
                    </div>
                }
                <div className='navigation__item'>
                    <FaDoorOpen className='navigation__item__icon'/>
                    <Link 
                        className='navigation__item__link' 
                        to={'/'}
                        onClick={() => dispatch(logout)}
                    >Logout</Link>
                </div>
            </ul>
        </nav>
    )
}

export default Navigation