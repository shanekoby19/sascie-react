import { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";

import { updateMe } from "./usersSlice";
import { getAuthUser } from '../auth/authSlice';
import Message from '../../components/Message';

import { FaEdit } from 'react-icons/fa';

const EditMe = () => {
  // Hooks
  const authUser = useSelector(getAuthUser);
  const dispatch = useDispatch();

  // Componenet State
  const [email, setEmail] = useState(authUser?.email);
  const [firstName, setFirstName] = useState(authUser?.firstName);
  const [lastName, setLastName] = useState(authUser?.lastName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userPhotoFile, setUserPhotoFile] = useState(undefined);
  const [imageSource, setImageSource] = useState(`./img/users/${authUser.photo}`);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State update functions.
  const onFirstNameUpdate = (e) => setFirstName(e.target.value);
  const onLastNameUpdate = (e) => setLastName(e.target.value);
  const onEmailUpdate = (e) => setEmail(e.target.value);
  const onPasswordUpdate = (e) => setPassword(e.target.value);
  const onConfirmPasswordUpdate = (e) => setConfirmPassword(e.target.value);
  
  // Component functions
  const handleSave = async (e) => {
    // Reset State
    setError('');
    setSuccess('');

    let body = {
      email,
      firstName,
      lastName,
      password,
      confirmPassword
    }

    // remove properties that are the same as the authUser or null
    // eslint-disable-next-line
    Object.entries(body).map(([key, value]) => {
      if(body[key] === '' || authUser[key] === body[key] ) delete body[key];
    });

    if(Object.entries(body).length < 1 && !userPhotoFile) {
      return setError('No updates found, please update a field before saving.')
    }

    // Turn the body into form data before sending to the server.
    const formData = new FormData();

    // If the user uploaded a new profile image, save it to the formData.
    if(userPhotoFile) formData.append("photo", userPhotoFile);

    // If the user changed  any of their current profile values, save them to the formData.
    Object.entries(body).map(([key, value]) => {
      formData.append(key, value);
    });

    try {
      let response = await dispatch(updateMe(formData)).unwrap();
      console.log('Response: ', response)
      if(response.status === 'error') return setError(response.error);
      setError('');
      setSuccess('Your profile has been updated successfully.');
      setTimeout(() => {
        setSuccess('')
      }, 3000);
    } catch(err) {
      return;
    }
  }

  return (
      <section className='edit'>
          <div 
            className='edit__form' 
            name="edit-user-form"
          >
            <div className='edit__form__user__image'>
              <div className='edit__form__user__image--image'>
                <img src={imageSource} alt='current user'></img>
                {
                  authUser.role !== 'viewer' &&
                  <div className='edit__form__user__image--backdrop'>
                    <label htmlFor='photo'><FaEdit /></label>
                    <input 
                      onChange={(e) => {
                        setUserPhotoFile(e.target.files[0])
                      }}
                      type='file' 
                      accept='image/*' 
                      id='photo' 
                      name='photo'
                      className='input__base'
                    ></input>
                  </div>
                }
              </div>
              <h3>{`${authUser.firstName} ${authUser.lastName}`}</h3>
              <p>{`${authUser.email}`}</p>
              { userPhotoFile && <p className='edit__form__filename'>{userPhotoFile.name}</p>}
            </div>
            <div className='edit__form__grid'>
              <div className='edit__form__input edit__form__input__email'>
                <label htmlFor="email">Email:</label>
                <input 
                    onChange={e => onEmailUpdate(e)} 
                    type="email" id="email" 
                    required
                    defaultValue={email}
                    className='input__base'
                ></input>
              </div>
              <div className='edit__form__input edit__form__input__firstName'>
                  <label htmlFor="fNmame">First Name:</label>
                  <input 
                      onChange={e => onFirstNameUpdate(e)} 
                      type="text" id="fNmame" 
                      required
                      defaultValue={firstName}
                      className='input__base'
                  ></input>
              </div>
              <div className='edit__form__input edit__form__input__lastName'>
                  <label htmlFor="lName">Last Name:</label>
                  <input 
                      onChange={e => onLastNameUpdate(e)} 
                      type="text" id="lName" 
                      required
                      defaultValue={lastName}
                      className='input__base'
                  ></input>
              </div>
              <div className='edit__form__input edit__form__input__password'>
                  <label htmlFor="password">Password: (Minimum 8 Characters)</label>
                  <input 
                    onChange={e => onPasswordUpdate(e)} 
                    type="password"
                    minLength="8" 
                    maxLength="30"
                    defaultValue={password}
                    className='input__base'
                  ></input>
              </div>
              <div className='edit__form__input edit__form__input__confirmPassword'>
                  <label htmlFor="confirmPassword">Confirm Password: (Minimum 8 Characters)</label>
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
            { success ? <Message message={success} className='success' /> : null }
            <div>
                  <button
                      onClick={handleSave}
                      className='edit__form__input__btn'
                  >Save</button>
              </div>
          </div>
      </section>
  )
}

export default EditMe;