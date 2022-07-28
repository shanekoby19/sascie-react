import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { FaAngleDoubleRight } from 'react-icons/fa';

import IndicatorIcons from './IndicatorIcons';

const ItemCard = ({
    item,
    currentExecutionMetricIndex
}) => {
    const selectRef = useRef('');
    const navigate = useNavigate();
    const currentExecution = item.executions[currentExecutionMetricIndex];
    const nextExecution = currentExecutionMetricIndex !== 6 ? item.executions[currentExecutionMetricIndex + 1] : undefined;
    let indicatorsNeeded = currentExecution?.indicators?.filter(indicator => indicator.status !== 'Completed').length;

    // If the next indicator is empty add one to the indicator needed total.
    // If an execution has no indicators then 1 indicator from the next execution phase will kick the user into the next execution phase.
    const betweenMetric = currentExecution?.indicators?.length === 0;
    if(betweenMetric) {
        indicatorsNeeded = 1;
    }

    // Create the indicator icons review section 
    const indicatorIcons = () => {
        let indicatorStatuses;

        // If the execution is a between metric then use the next item indicators.
        if(!betweenMetric) {
            indicatorStatuses = currentExecution?.indicators?.map(indicator => indicator.status);
        }
        else {
            indicatorStatuses = nextExecution?.indicators?.map(indicator => indicator.status);
        }
        
        return <IndicatorIcons statuses={indicatorStatuses} />
    }

    const handleReviewClicked = () => {
        navigate(`./indicator/${selectRef.current.value}`);
    }

    return (
        <div className='sascie__entry__item'>
            {indicatorIcons()}
            <div>
                <h2 className='sascie__entry__item--header'>{item.name}</h2>
            </div>
            <div className='sascie__entry__item--footer'>
                <div className='sascie__entry__item__info__group'>
                    <h3 className='sascie__entry__item--sub-header'>{currentExecution.metric} {nextExecution && <FaAngleDoubleRight className='sascie__entry__item--sub-header__icon'/> }{nextExecution?.metric}</h3>
                    <div className='sascie__entry__item__indicator__container'>
                        <h3 className='sascie__entry__item--indicator'>{indicatorsNeeded}</h3>
                    </div>
                </div>
                { 
                    !betweenMetric &&
                    <div>
                        <h3 className='sascie__entry__item--indicator__header'>Enter all of the following: </h3>
                        <select 
                            ref={selectRef}
                            className='sascie__entry__item--indicator__select select__base' 
                            name='Indicators'
                        >
                        {   
                            currentExecution?.indicators?.map(indicator => (
                                <option className='indicator__option' key={indicator._id} value={indicator._id}>
                                    {indicator.description}
                                </option>
                            ))
                        }
                        </select>
                    </div>
                }
                {
                    betweenMetric && 
                    <div>
                        <h3 className='sascie__entry__item--indicator__header'>At Least One From {item.executions[currentExecutionMetricIndex + 1].metric}:</h3>
                        <select 
                            ref={selectRef}
                            className='sascie__entry__item--indicator__select select__base' 
                            name='Indicators' 
                        >
                        {   
                            // Get two executions in the future. The "nextExecution" will be blank in this scenario.
                            item.executions[currentExecutionMetricIndex + 1].indicators.map(indicator => (
                                <option className='indicator__option' key={indicator._id} value={indicator._id}>
                                    {indicator.description}
                                </option>
                            ))
                        }
                        </select>
                    </div>
                }
                
                <button 
                    className='sascie__entry__item--btn'
                    onClick={handleReviewClicked}
                >REVIEW</button>
                
            </div>
        </div>
    )
}

export default ItemCard;