import { useEffect, useState, useRef } from 'react';
import { 
    FaPaperclip,
    FaWindowClose,
    FaCheck,
    FaFlag,
} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from "react-router";
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

import Message from '../../../components/Message';
import Loader from '../../../components/Loader';
import { getAuthUser, updateAuthUserIndicator } from '../../auth/authSlice';
import { updateIndicator, addPost } from '../../sascie/sascieSlice';

const Indicator = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [indicator, setIndicator] = useState(undefined);
    const [postFiles, setPostFiles] = useState(undefined);
    const [error, setError] = useState('');
    const commentRef = useRef('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('Loading your indicator from the database.');
    
    
    // Load the indicator from the database.
    useEffect(() => {
        loadIndicator();
    }, []);

    const { indicatorId } = useParams();
    const authUser = useSelector(getAuthUser);

    // Loads the indicator from the database for the given indicatorId in the url.
    const loadIndicator = async() => {
        const url = process.env.NODE_ENV === 'production' ?  `/api/v1/indicators/${indicatorId}` :`http://localhost:5000/api/v1/indicators/${indicatorId}`;
        let response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
        response = await response.json();
        setIndicator(response.data.doc);
        setLoading(false);
    }
    
    // Determines which icon should be used based on the indicator status.
    const determineIcon = () => {
        if(indicator?.status === 'Under Review') {
            return <FaFlag className='indicator__icon indicator__icon--yellow'/>
        }
        else if(indicator?.status === 'Completed') {
            return <FaCheck className='indicator__icon indicator__icon--green'/>
        }
        else {
            return <FaWindowClose className='indicator__icon indicator__icon--red'/>
        }
    }

    // Returns the user to the items page when the back button is clicked.
    const handleReturnToItems = () => {
        navigate('/sascie/dashboard', { replace: true })
    }

    // Changes the status of the indication to "under review" if a post is present.
    const handleChangeIndicatorStatus = async (status) => {
        // Reset any error state.
        setError('');

        // Check to see if a post has been created if user is submitting for review or completion.
        if((status === 'Under Review' || status === 'Completed') && indicator.posts.length === 0) {
            return setError('You must create a post before you can submit for review.')
        }

        setLoading(true);
        setMessage(`Changing your indicator status to '${status}'.`)

        // Change the indicator status to under review.
        const response = await dispatch(updateIndicator({ status, indicatorId }));
        dispatch(updateAuthUserIndicator({ status, indicatorId }));

        if(response.status === 'error') return setError(response.error);

        // Reload the indicator.
        loadIndicator();
    }

    // Adds a post to the given indicator
    const handleAddPost = async () => {
        // reset error state
        setError('');

        // Check to see if the user added a comment.
        if(!commentRef.current.value) {
            return setError('You must provide a comment in order to create a post.')
        }

        setLoading(true);
        setMessage('Adding your post to the database.');

        const post = new FormData();
        post.append("comment", commentRef.current.value);
        postFiles.forEach(file => post.append("files", file));

        const response = await dispatch(addPost({ post, indicatorId }));
        if(response.status === 'error') return setError(response.error);

        setPostFiles([]);
        // Clear the comment state and reload the indicator.
        await loadIndicator();
    }

    const downloadFile = async (file) => {
        try {
            let response = await fetch('http://localhost:5000/api/v1/posts/file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    key: `posts/docs/${file}`,
                })
            });
            response = await response.json();

            // Create the file using the response data stream and content-type.
            let blob = new Blob([new Uint8Array(response.data.Body.data)], {
                type: response.data.ContentType
            });

            // Create a new link on the window object.
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = file.split('/').slice(-1)[0];
            link.click();       
        }
        catch (err) {
            console.log('ERROR: ', err);
        }
    }

    const handleFilesChanged = (e) => {
        // Reset State
        setError('');

        // Change the datatype from FileList to Array
        const files = Array.prototype.slice.call(e.target.files);

        // If the length of the files is greater than 3 then only keep the first three.
        if(files.length > 3) {
            setError('File Limit Exceeded - A post is limited to three files, keeping the first three selected.')
            return setPostFiles(files.slice(0, 3));
        }

        setPostFiles(files);
    }

    const icon = determineIcon();

    // return a div with a loader in it while the indicator is being loaded from the database.
    if(loading) {
        return (
            <div className='indicator'>
                <Loader message={message}/>
            </div>
        )
    }

    return (
        <div className='indicator'>
            <h1 className='indicator__description'><span className='indicator__highlighter'>Goal:</span> {indicator.description}</h1>
            <h1 className='indicator__status'>
                {indicator.status} {icon}
            </h1>

            <div className='indicator__posts'>
                {/* New Post Placeholder */}
                <div className='indicator__post'> 
                    <div>
                        <div className='indicator__post__user-bio'>
                            <img 
                                className='indicator__post__user-bio__picture'
                                src={`/img/users/${authUser.photo}`} 
                                alt='user profile image'>
                            </img>
                            <div className='indicator__post__user-bio__info'>
                                <p className='indicator__post__user-bio__username'>{ `${authUser.firstName} ${authUser.lastName}` }</p>
                                <p className='indicator__post__user-bio__time'>Now</p>
                            </div>
                        </div>
                        <div className='indicator__post__create'>
                            <textarea
                                ref={commentRef}
                                className='indicator__post__create__textarea'
                                placeholder='Create a new post...'
                            ></textarea>
                            <div className='indicator__post__create__menu'>
                                <label htmlFor='files'><FaPaperclip className='indicator__post__create__menu__icon'/></label>
                                <input 
                                    className='indicator__post__files__input'
                                    onChange={handleFilesChanged}
                                    type='file'
                                    accept='image/*, .csv, .xlsx, .xls, .pdf, .doc, .docx'
                                    id='files' 
                                    name='files'
                                    multiple
                                ></input>
                            
                                <button 
                                    className='indicator__post__create__menu__btn'
                                    onClick={handleAddPost}
                                >POST</button>
                            </div>
                        </div>
                        <div className='indicator__post__files'>
                            {
                                postFiles &&
                                postFiles.map(file => (
                                    <div key={uuidv4()} className='indicator__post__files--container'>
                                        <FaPaperclip className='indicator__post__files--file__icon'/>
                                        <p 
                                            className='indicator__post__files--file__name'
                                        >{file.name}
                                        </p>
                                    </div>
                                ))
                            }
                        </div>  
                    </div>
                </div> 

                {/* All Existing Posts */}
                {
                    indicator?.posts?.map(post => (
                        <div key={post._id} className='indicator__post'> 
                            <div className='indicator__post__user-bio'>
                                <img 
                                    className='indicator__post__user-bio__picture'
                                    src={`/img/users/${post.photo}`} 
                                    alt='user profile image'>
                                </img>
                                <div className='indicator__post__user-bio__info'>
                                    <p className='indicator__post__user-bio__username'>{post.createdBy}</p>
                                    <p className='indicator__post__user-bio__time'>{moment(post.lastUpdatedAt).fromNow()}</p>
                                </div>
                            </div>
                            <p className='indicator__post__comment'>{post.comment}</p>
                            <div className='indicator__post__files'>
                            {
                                post.files &&
                                post.files.map(file => (
                                    <div 
                                        className='indicator__post__files--container'
                                        key={uuidv4()}
                                        onClick={() => downloadFile(file)}
                                    >
                                        <FaPaperclip className='indicator__post__files--file__icon'/>
                                        <p 
                                            className='indicator__post__files--file__name'
                                        >{file.split('/').slice(-1)}
                                        </p>
                                    </div>
                                ))
                            }
                            </div>
                        </div> 
                    ))
                }
            </div>

            { error && <Message message={error} className='error' fontColorClass='color__red'/> }
            <div className='indicator__btns'>
                <button 
                    className='indicator__btns__btn indicator__btns__btn--yellow indicator__btns__btn--flex'
                    onClick={handleReturnToItems}
                >
                    <div>
                        Dashboard
                    </div>
                    <div>
                        &larr;
                    </div>
                </button>
                <div>
                    {
                        indicator.status === 'Incomplete' &&
                        <button
                            className='indicator__btns__btn indicator__btns__btn--green'
                            onClick={() => handleChangeIndicatorStatus('Under Review')}
                        >Submit For Review</button>
                    }
                    {
                        indicator.status === 'Under Review' && 
                        indicator.status !== 'Incomplete' && 
                        authUser.role === 'admin' &&
                        <button
                            className='indicator__btns__btn indicator__btns__btn--green'
                            onClick={() => handleChangeIndicatorStatus('Completed')}
                        >Mark as Complete</button>  
                    }
                    {
                        indicator.status === 'Under Review' && 
                        indicator.status !== 'Complete' &&
                        authUser.role === 'admin' &&
                        <button
                            className='indicator__btns__btn indicator__btns__btn--red'
                            onClick={() => handleChangeIndicatorStatus('Incomplete')}
                        >Mark as Incomplete</button>  
                    }
                    {
                        indicator.status === 'Completed' &&
                        authUser.role === 'admin' &&
                        <button
                            className='indicator__btns__btn indicator__btns__btn--red'
                            onClick={() => handleChangeIndicatorStatus('Incomplete')}
                        >Mark as Incomplete</button>  
                    }
                </div>
            </div>
        </div>
    )
}

export default Indicator;