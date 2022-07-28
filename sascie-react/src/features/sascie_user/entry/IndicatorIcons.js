import {     
    FaWindowClose,
    FaCheck,
    FaFlag
} from 'react-icons/fa';

const IndicatorIcons = ({
    statuses
}) => {
    const countOfIncomplete = statuses.filter(status => status === 'Incomplete').length;
    const countOfUnderReview = statuses.filter(status => status === 'Under Review').length;
    const countOfComplete = statuses.filter(status => status === 'Complete').length;

    return (
        <div className='indicator__icons'>
            <div className='indicator__icons__group'>
                <p className='indicator__icons__count indicator__icons__count--red'>{countOfIncomplete}</p>
                <FaWindowClose className='indicator__icons__incomplete' />
            </div>
            <div className='indicator__icons__group'>
                <p className='indicator__icons__count indicator__icons__count--yellow'>{countOfUnderReview}</p>
                <FaFlag className='indicator__icons__under-review' />
            </div>
            <div className='indicator__icons__group'>
                <p className='indicator__icons__count indicator__icons__count--green'>{countOfComplete}</p>
                <FaCheck className='indicator__icons__completed'/>
            </div>
        </div>
    )
}

export default IndicatorIcons;