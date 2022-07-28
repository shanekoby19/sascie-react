import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';

import Message from '../../components/Message';
import { getUsersStatus, getAllUsers, deleteUser } from './usersSlice';

const UsersList = () => {
    // Hooks
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const status = useSelector(getUsersStatus);
    const inactiveRef = useRef('');
    const searchRef = useRef('');

    // Selectors
    const allUsers = useSelector(getAllUsers);
    
    // Component State
    const [selectedUserId, setSelectedUserId] = useState('');
    const [users, setUsers] = useState(allUsers.filter(user => user.active) || []);
    const [error, setError] = useState('');


    // Component Functions
    const setChecked = (e) => {
        const id = e?.nativeEvent?.path[1]?.innerHTML.split('value="')[1].split('"')[0];
        // Uncheck all.
        document.getElementsByName('userCheckbox').forEach(checkbox => {
            checkbox.value !== id ? checkbox.checked = false : checkbox.checked = true;
        });
       
        setSelectedUserId(id);
    }

    const handleUserSearch = () => {
        const search = searchRef.current.value.toLowerCase();
        const includeInactiveChecked = inactiveRef.current.checked;

        // Filter users that have any property matching the search
        let users = allUsers.filter(user =>
            user.email.toLowerCase().includes(search) ||
            user.firstName.toLowerCase().includes(search) ||
            user.lastName.toLowerCase().includes(search) ||
            user.role.toLowerCase().includes(search));
        users = users.filter(user => includeInactiveChecked ? true : user.active);
        setUsers(users);
    }

    const handleEditClicked = () => {
        if(selectedUserId) {
            setError('');
            return navigate(`/admin/users/edit/${selectedUserId}`);
        }
        setError('Please select a user to edit.');
    }

    const handleDeleteClicked = async () => {
        if(selectedUserId) {
            setError('');
            try {
                const response = await dispatch(deleteUser(selectedUserId)).unwrap();
                if(response.status === 'success') {
                    setUsers(users.filter(user => user._id !== response.data.updatedUser._id), response.data.updatedUser._id);
                }
                setError(response.error);
            } catch(err) {
                return err;
            }
        } else {
            setError('Please select a user to edit.')
        }
    }


    // Define User Content
    let content;
    if(status === 'pending') {
        content = <p className='users__loader'>...loading</p>
    } else if(status === 'fulfilled' || status === 'idle') {
        content = users.map(user => (
            <tr key={user._id} onClick={(e) => setChecked(e)}>
                <td><input 
                    type='checkbox'
                    name='userCheckbox'
                    value={user._id}
                    onChange={setChecked}
                ></input></td>
                <td>{user.email}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.role}</td>
                <td>{user.active ? 'Active' : 'Inactive'}</td>
            </tr>
        ));
        content = (
            <table className='users__table'>
                <thead>
                    <tr>
                        <td>Select</td>
                        <td>Email</td>
                        <td>First Name</td>
                        <td>Last Name</td>
                        <td>Role</td>
                        <td>Status</td>
                    </tr>
                </thead>
                <tbody>
                    {content}
                </tbody>
            </table>
        )
    }


    return (
        <section className='users'>
            <>
                <div className='users__search'>
                    <div className='users__search__container'>
                        <div className='users__search__container__input'>
                            <FaSearch  
                                onClick={() => document.querySelector('#search').focus()}
                                className='users__search__icon'
                            />
                            <input 
                                className='users__search__input' 
                                type='text' 
                                id='search'
                                placeholder='search'
                                onChange={handleUserSearch}
                                ref={searchRef}
                            />
                        </div>
        
                        <input 
                            className='users__search__container__inactive'
                            type='checkbox'
                            name='activeUserCheckbox'
                            value={''}
                            onChange={handleUserSearch}
                            ref={inactiveRef}
                        ></input> 
                        <span
                            className='users__search__container__text'
                        >Inactive</span>
                    </div>
                    <div className='users__search__buttons'>
                        <button 
                            className='users__search__buttons__add'
                            onClick={() => navigate('add')}
                        >Add User</button>
                        <button 
                            className='users__search__buttons__edit'
                            onClick={handleEditClicked}
                        >Edit User</button>
                        <button 
                            className='users__search__buttons__delete'
                            onClick={handleDeleteClicked}
                        >Delete User</button>
                    </div>
                </div>
                {error ? <Message message={error} className='error'></Message> : null}
                {content ? content : null}
            </>
        </section>
    )

}

export default UsersList;