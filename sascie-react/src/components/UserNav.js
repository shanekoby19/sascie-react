import { Link } from 'react-router-dom';
 
const UserNav = ({
    currentPage
}) => {

    // Uses the currentPage prop to determine which link should be active.
    const getPageStatus = (pageName) => currentPage === pageName ? 'active' : 'inactive'

    return (
        <nav className='user__nav'>
            <ul className='user__nav__list'>
                <Link
                    className={`user__nav__item user__nav__item--${getPageStatus('review')}`}
                    to={'/sascie/review'}
                >REVIEW</Link>
                <Link 
                    className={`user__nav__item user__nav__item--${getPageStatus('entry')}`}
                    to={'/sascie'}
                >ENTRY</Link>
            </ul>
        </nav>
    )
}

export default UserNav;