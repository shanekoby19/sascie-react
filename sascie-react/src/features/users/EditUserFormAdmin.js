import { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router';
import { useParams } from 'react-router';
import { FaAngleDown } from 'react-icons/fa';

import Message from '../../components/Message';
import { getUserById, updateUser } from './usersSlice';
import { getAuthUser } from '../auth/authSlice';

const EditUserFormAdmin = () => {
    // Hooks
    const { userId } = useParams();
    const user = useSelector(state => getUserById(state, userId));
    const authUser = useSelector(getAuthUser);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // State
    const [email, setEmail] = useState(user.email);
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [role, setRole] = useState(user.role);
    const [active, setActive] = useState(user.active);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [serviceAreas, setServiceAreas] = useState([]);
    const [programIds, setProgramIds] = useState(user?.programs?.map(program => program._id) || []);
    const [serviceAreaIds, setServiceAreaIds] = useState(user?.serviceAreas?.map(serviceArea => serviceArea._id) || []);

    // Event Handlers
    const onFirstNameUpdate = (e) => setFirstName(e.target.value);
    const onLastNameUpdate = (e) => setLastName(e.target.value);
    const onEmailUpdate = (e) => setEmail(e.target.value);
    const onPasswordUpdate = (e) => setPassword(e.target.value);
    const onConfirmPasswordUpdate = (e) => setConfirmPassword(e.target.value);

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

    const handleSave = async (e) => {
        e.preventDefault();
        let updatedUser = {
            email,
            role,
            firstName,
            lastName,
            password,
            confirmPassword,
            programs: programIds,
            serviceAreas: serviceAreaIds,
            active
        }

        // remove properties that are the same as the current user or null
        // eslint-disable-next-line
        Object.entries(updatedUser).map(([key, value]) => {
            if(updatedUser[key] === '' || user[key] === updatedUser[key] ) delete updatedUser[key];
        })

        // If no updates are found, send an error to the client.
        if(Object.entries(updatedUser).length < 1) {
            return setError('No updates found, please update a field before saving.')
        }

        // Dispatch the update which will rerender the component.
        try {
            const response = await dispatch(updateUser({userId, updatedUser})).unwrap();
            if(response.status === 'success') return navigate('/admin/users');
            setError(response.error);
        } catch(err) {
            setError(err);
        }
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
            defaultValue={user.role}
            className='select__base'
        >
            <option key={3} label='' value=''></option>
            {options}
        </select>
    )

    return (
        <section className='edit__admin'>
            <form 
                className='edit__admin__form' 
                name="edit__admin-user-form"
                onSubmit={handleSave}
            >
                <h1 className='edit__admin__form__title'>Edit User</h1>
                <div className='edit__admin__form__grid'>
                    <div className='edit__admin__form__input edit__admin__form__input__active'>
                        <div className='edit__admin__form__input__active__container'>
                            <input 
                                type='checkbox'
                                name='activeUserCheckbox'
                                value={''}
                                defaultChecked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                className='input__base'
                            ></input> 
                            <span
                                className='edit__admin__form__input__active--text'
                            >Active</span>
                        </div>
                    </div>
                    <div className='edit__admin__form__input edit__admin__form__input__email'>
                        <label htmlFor="email">Email:</label>
                        <input 
                            onChange={e => onEmailUpdate(e)} 
                            type="email" id="email" 
                            required
                            defaultValue={email}
                            className='input__base'
                        ></input>
                    </div>
                    <div className='edit__admin__form__input edit__admin__form__input__role'>
                        <label htmlFor="role">Role:</label>
                        {select}
                        <FaAngleDown />
                    </div>
                    <div className='edit__admin__form__input edit__admin__form__input__firstName'>
                        <label htmlFor="fNmame">First Name:</label>
                        <input 
                            onChange={e => onFirstNameUpdate(e)} 
                            type="text" id="fNmame" 
                            required
                            defaultValue={firstName}
                            className='input__base'
                        ></input>
                    </div>
                    <div className='edit__admin__form__input edit__admin__form__input__lastName'>
                        <label htmlFor="lName">Last Name:</label>
                        <input 
                            onChange={e => onLastNameUpdate(e)} 
                            type="text" id="lName" 
                            required
                            defaultValue={lastName}
                            className='input__base'
                        ></input>
                    </div>
                    <div className='edit__admin__form__input edit__admin__form__input__programs'>
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
                    <div className='edit__admin__form__input edit__admin__form__input__service-areas'>
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
                    <div className='edit__admin__form__input edit__admin__form__input__password'>
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
                    <div className='edit__admin__form__input edit__admin__form__input__confirmPassword'>
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
                { error ? <Message message={error} className='error' /> : null }
                <div className='edit__admin__form__input__btn__container'>
                    <button
                        type="submit" 
                        className='edit__admin__form__input__btn'
                    >Save</button>
                </div>
            </form>
        </section>
    )
}

export default EditUserFormAdmin;