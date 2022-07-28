import { useState } from 'react';
import { FaAngleUp, FaAngleDown, FaRegWindowClose } from 'react-icons/fa';

const Executions = ({
    executions,
    setExecutions,
    indicators,
    setIndicators,
}) => {
    const [activeItemId, setActiveItemId] = useState('');


    const handleChangeVisibilityExecutions = (e) => {
        const itemId = e.target.getAttribute('id') || e.target.parentElement.getAttribute('id');

        setExecutions(executions.map(execution => {
            if(execution.itemId !== itemId) {
                return {
                    ...execution,
                    executionsVisible: false,
                }
            };
            
            // Set the active service area in our state.
            setActiveItemId(execution.itemId);
            return {
                ...execution, 
                executionsVisible: !execution.executionsVisible
            }
        }))
    }

    const handleChangeVisibliltyIndicators = (e) => {
        const executionId = e.target.getAttribute('executionid') || e.target.parentElement.getAttribute('executionid');

        setIndicators(indicators.map(indicatorObj => {
            if(indicatorObj.executionId !== executionId) {
                return {
                    ...indicatorObj,
                    indicatorsVisible: false,
                }
            }
            
            return {
                ...indicatorObj, 
                indicatorsVisible: !indicatorObj.indicatorsVisible
            }
        }))
    }
    
    const handleUpdateIndicator = (e) => {
        const indicatorId = e.target.getAttribute('id');
        
        setIndicators(indicators.map(indicatorObj => {
            if(indicatorObj.indicators.find(indicator => indicator._id === indicatorId)) {
                return {
                    ...indicatorObj,
                    indicators: indicatorObj.indicators.map(indicator => {
                        if(indicator._id !== indicatorId) return indicator;
                        return {
                            ...indicator,
                            description: e.target.value
                        }
                    })
                }
            }
            return indicatorObj;
        }));
    }

    const handleRemoveIndicator = (e) => {
        const indicatorId = e.target.id || e.target.parentElement.id;
        
        setIndicators(indicators.map(indicatorObj => {
            if(indicatorObj.indicators.find(indicator => indicator._id === indicatorId)) {
                return {
                    ...indicatorObj,
                    indicators: indicatorObj.indicators.filter(indicator => indicator._id !== indicatorId)
                }
            }
            return indicatorObj;
        }));
    }

    return (
        <div className='executions'>
            <h1 className='executions__header'>Execution Selection</h1>
            <div className='executions__list'>
                {
                    executions.map(executionObj => (
                        <div  key={executionObj.itemId} className='executions__list__item'>
                            <div className='executions__list__item--header'>
                                <h2>
                                    {executionObj.itemName}
                                </h2>
                                { 
                                    executionObj.executionsVisible ? 
                                    <FaAngleUp 
                                        className='executions__list__item--header__icon'
                                        id={executionObj.itemId}
                                        onClick={handleChangeVisibilityExecutions}
                                    /> :
                                    <FaAngleDown 
                                        className='executions__list__item--header__icon'
                                        id={executionObj.itemId}
                                        onClick={handleChangeVisibilityExecutions}
                                    />
                                }
                            </div>
                            <div className='executions__list__executions'>
                            {
                                executionObj.executionsVisible &&
                                executionObj.executions.map(execution => {
                                    return (
                                        <div key={execution._id} className='executions__list__execution__group'>
                                            {
                                                indicators.find(indicatorObj => indicatorObj.executionId === execution._id && indicatorObj.indicatorsVisible) ?
                                                <FaAngleUp
                                                    className='executions__list__execution__group--icon'
                                                    id={executionObj.itemId}
                                                    executionid={execution._id}
                                                    onClick={handleChangeVisibliltyIndicators}
                                                /> :
                                                <FaAngleDown
                                                    className='executions__list__execution__group--icon'
                                                    id={executionObj.itemId}
                                                    executionid={execution._id}
                                                    onClick={handleChangeVisibliltyIndicators}
                                                />
                                            }
                                            <input
                                                className='executions__list__execution input__base'
                                                defaultValue={execution.metric}
                                            ></input>
                                            
                                            <div className='indicators'>
                                                {
                                                    indicators.find(indicatorObj => indicatorObj.executionId === execution._id && indicatorObj.indicatorsVisible)
                                                    ?.indicators.map(indicator => (
                                                        <div key={indicator._id} className='indicators__indicator'>
                                                            <FaRegWindowClose 
                                                                className='indicators__indicator--close'
                                                                onClick={handleRemoveIndicator}
                                                                id={indicator._id}
                                                            />
                                                            <textarea 
                                                                className='indicators__indicator--description'
                                                                value={indicator.description}
                                                                id={indicator._id}
                                                                onChange={handleUpdateIndicator}>
                                                            </textarea>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Executions;