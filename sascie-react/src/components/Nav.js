import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; 

const Nav = ({
    currentPage,
    links
}) => {

    // Uses the currentPage prop to determine which link should be active.
    const getPageStatus = (pageName) => currentPage === pageName ? 'active' : 'inactive'
    
    return (
        <nav className='nav'>
            <ul className='nav__list'>
                {   
                    links.map(link => (
                        <Link key={uuidv4()}
                            className={`nav__item nav__item--${getPageStatus(link.pageName)}`}
                            to={link.relativeTo}
                        >{link.pageName.toUpperCase()}</Link>
                    ))
                }
            </ul>
        </nav>
    )
}

export default Nav;