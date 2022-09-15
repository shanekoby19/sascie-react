import { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";

import Message from '../../components/Message';
import { addUser } from './usersSlice';
import { getAuthUser } from '../auth/authSlice';

const AddUserFormAdmin = () => {
    // Hooks
    const dispatch = useDispatch();
    const authUser = useSelector(getAuthUser)

    // State
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [serviceAreas, setServiceAreas] = useState([]);
    const [programIds, setProgramIds] = useState([]);
    const [serviceAreaIds, setServiceAreaIds] = useState([]);

    // Event Handlers
    const onFirstNameUpdate = (e) => setFirstName(e.target.value);
    const onLastNameUpdate = (e) => setLastName(e.target.value);
    const onEmailUpdate = (e) => setEmail(e.target.value);
    const onPasswordUpdate = (e) => setPassword(e.target.value);
    const onConfirmPasswordUpdate = (e) => setConfirmPassword(e.target.value);

    const handleSave = async (e) => {
        e.preventDefault();

        let newUser = {
            email,
            role,
            firstName,
            lastName,
            password,
            programs: programIds,
            serviceAreas: serviceAreaIds,
            confirmPassword
        }        

        // Dispatch the add user and navigate to the users list if successful.
        try {
            const response = await dispatch(addUser(newUser)).unwrap();
            if(response.status === 'success') {
                setError('');
                setSuccess('User created successfully');
            } else {
                setError(response.error);
            }
        } catch(err) {
            setError(err);
        }
    }

    const handleProgramsSelected = (e) => {
        const booleans = Array.from(e.target.children).map(optionEl => optionEl.selected);
        setProgramIds(authUser.programs.filter((_, index) => booleans[index]).map(program => program._id));
        setServiceAreas(authUser.programs.filter((_, index) => booleans[index]).map(program => program.serviceAreas.map(serviceArea => ({
            ...serviceArea,
            name: `${program.name} - ${serviceArea.name}`
        }))).flat(1));
    }

    const handleServiceAreaSelected = (e) => {
        const booleans = Array.from(e.target.children).map(optionEl => optionEl.selected);
        setServiceAreaIds(serviceAreas.filter((_, index) => booleans[index]).map(serviceArea => serviceArea._id));
    }

    // HTML Components
    const options = ['admin', 'inputer', 'viewer'].map((role, index) => (
        <option 
            key={index} 
            label={role} 
            value={role}
        ></option>
    ));

    const select = (
        <select 
            onChange={(e) => setRole(e.target.value)}
            defaultValue={''}
            className='select__base'
        >
            <option key={3} label='' value=''></option>
            {options}
        </select>
    )

    return (
        <section className='add'>
            <form 
                className='add__form' 
                name="add-user-form"
                onSubmit={handleSave}
            >
                <h1 className='add__form__title'>Add User</h1>
                <div className='add__form__grid'>
                    <div className='add__form__input add__form__input__email'>
                        <label htmlFor="email">Email:</label>
                        <input 
                            onChange={e => onEmailUpdate(e)} 
                            type="email" id="email" 
                            required
                            defaultValue={email}
                            className='input__base'
                        ></input>
                    </div>
                    <div className='add__form__input add__form__input__role'>
                        <label 
                            htmlFor="role"
                        >Role:</label>
                        {select}
                    </div>
                    <div className='add__form__input add__form__input__firstName'>
                        <label htmlFor="fNmame">First Name:</label>
                        <input 
                            onChange={e => onFirstNameUpdate(e)} 
                            type="text" id="fNmame" 
                            required
                            defaultValue={firstName}
                            className='input__base'
                        ></input>
                    </div>
                    <div className='add__form__input add__form__input__lastName'>
                        <label htmlFor="lName">Last Name:</label>
                        <input 
                            onChange={e => onLastNameUpdate(e)} 
                            type="text" id="lName" 
                            required
                            defaultValue={lastName}
                            className='input__base'
                        ></input>
                    </div>
                    <div className='add__form__input add__form__input__programs'>
                        <label htmlFor="programs">Programs:</label>
                        <select 
                            className='select__base' 
                            id='programs'
                            name='programs' 
                            multiple 
                            size={authUser.programs.length < 5 ? authUser.programs.length : 5}
                            onChange={handleProgramsSelected}
                        >
                        {   
                            authUser.programs.map(program => (
                                <option 
                                    className='programs__option' 
                                    key={program._id} 
                                    value={program._id}
                                    selected={programIds.includes(program._id)}
                                >
                                    {program.name}
                                </option>
                            ))
                        }
                        </select>
                    </div>
                    <div className='add__form__input add__form__input__service-areas'>
                        <label htmlFor="service-areas">Service Areas:</label>
                        <select 
                            className='select__base' 
                            id='service-areas'
                            name='programs' 
                            multiple 
                            size={serviceAreas.length < 5 ? serviceAreas.length : 5}
                            onChange={handleServiceAreaSelected}
                        >
                        {   
                            serviceAreas.map(serviceArea => (
                                <option 
                                    className='service-area__option' 
                                    key={serviceArea._id} 
                                    value={serviceArea._id}
                                    selected={serviceAreaIds.includes(serviceArea._id)}
                                >
                                    {serviceArea.name}
                                </option>
                            ))
                        }
                        </select>
                    </div>
                    <div className='add__form__input add__form__input__password'>
                        <label htmlFor="password">Password:</label>
                        <input 
                            onChange={e => onPasswordUpdate(e)} 
                            type="password"
                            minLength="8" 
                            maxLength="30"
                            defaultValue={password}
                            className='input__base'
                        ></input>
                    </div>
                    <div className='add__form__input add__form__input__confirmPassword'>
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input 
                            onChange={e => onConfirmPasswordUpdate(e)} 
                            type="password"
                            minLength="8"
                            maxLength="30"
                            defaultValue={confirmPassword}
                            className='input__base'
                        ></input>
                    </div>
                </div>
                { success ? <Message message={success} className='success'/> : null }
                { error ? <Message message={error} className='error' /> : null }
                <div className='add__form__input__btn__container'>
                    <button
                        type="submit" 
                        className='add__form__input__btn'
                    >Save</button>
                </div>
            </form>
        </section>
    )
}

export default AddUserFormAdmin;