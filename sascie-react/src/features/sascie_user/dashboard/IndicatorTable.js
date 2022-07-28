import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IndicatorTable = ({
    executions,
    setExecutions,
    currentExecution,
    setCurrentExecution,
    indicators,
    setIndicators
}) => {
    const navigate = useNavigate();
    const [indicatorId, setIndicatorId] = useState(false);

    const handleExecutionChanged = (e) => {
        const selectedExecution = executions.find(execution => execution._id === e.target.value);
        setCurrentExecution(selectedExecution)
        setIndicators(selectedExecution.indicators);
    }

    const handleIndicatorChanged = (e) => {
        const indicatorId = e.target.value || e.target.getAttribute('value');
        setIndicatorId(indicatorId);
        setIndicators(indicators.map(indicator => {
            if(indicator._id !== indicatorId) {
                return {
                    ...indicator,
                    checked: false
                }
            }

            return {
                ...indicator,
                checked: true,
            }
        }))
    }

    const tableContent = indicators.map(indicator => {
        const mostRecentPost = indicator.posts.length !== 0 ? indicator.posts.slice(-1)[0] : undefined;
        const mostRecentComment = mostRecentPost ? <div><p>{ `${mostRecentPost.comment}` }</p><p>{ `- ${mostRecentPost.createdBy}`}</p></div> : 'No Posts Yet.'
        return (
            <tr key={indicator._id}
            >
                <td
                    value={indicator._id}
                    onClick={handleIndicatorChanged}
                ><input
                    type='checkbox'
                    name='indicatorCheckbox'
                    value={indicator._id}
                    checked={indicator.checked || false}
                    onChange={handleIndicatorChanged}
                ></input></td>
                <td className='table__column__description'>{indicator.description}</td>
                <td>{indicator.status}</td>
                <td>{mostRecentComment}</td>
            </tr>
        )
    });

    return (
        <div className='table'>
            <div className='table__top'> 
                <div className='table__top__filter__group'>
                    <label
                        className='table__top__filter__label'
                    >Execution Phase</label>
                    <select
                        className='select__base table__top__filter__select'
                        value={currentExecution._id}
                        onChange={handleExecutionChanged}
                    >
                        {executions.map(execution => (
                            <option
                                key={execution._id}
                                value={execution._id}
                            >{execution.metric}</option>
                        ))}
                    </select>
                </div>
                {
                    indicatorId && 
                    <button 
                        className='table__top__btn'
                        onClick={() => navigate(`/sascie/entry/indicator/${indicatorId}`)}
                    >Go To Indicator</button>
                }
            </div>
        <table className='table'>
                <thead>
                    <tr>
                        <td>Select</td>
                        <td className='table__column__description'>Description</td>
                        <td>Status</td>
                        <td>Most Recent Post</td>
                    </tr>
                </thead>
                <tbody>
                    {tableContent}
                </tbody>
            </table>
        </div>
    )
}

export default IndicatorTable;