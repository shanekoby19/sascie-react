import { v4 as uuidv4 } from 'uuid';

const ItemFilters = ({
    items,
    setItems,
    currentExecutionMetricIndex,
    setCurrentExecutionMetricIndex    
}) => {
    const executionPhases = ['Compliance', 'Needs Improvement', 'Beginning', 'Emerging', 'Implementing', 'Refining', 'Mastering'];

    const handleExecutionPhaseChanged = (e) => {
        let currentExecutionMetricIndex = executionPhases.findIndex(executionPhase => executionPhase === e.target.value);
        setCurrentExecutionMetricIndex(currentExecutionMetricIndex);
    }

    return (
        <div className='item__filters'>
            <select
                value={executionPhases[currentExecutionMetricIndex]}
                onChange={handleExecutionPhaseChanged}
            >
                {
                    executionPhases.map(executionPhase => (
                        <option key={uuidv4()} 
                            value={executionPhase}
                        >{executionPhase}</option>
                    ))
            }
            </select>
        </div>
    )
}

export default ItemFilters;