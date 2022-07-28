import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
    Legend,
    ResponsiveContainer,
    RadialBar,
    RadialBarChart
} from 'recharts';
import { useSelector } from 'react-redux';

import Card from './Card'
import IndicatorTable from './IndicatorTable';
import { 
        getAllExecutions, 
        getAllIndicators, 
        getAllItems,
} from '../../sascie/sascieSlice';

import { getAuthUser } from '../../auth/authSlice';

const Dashboard = () => {
    const executionOrder = ['Compliance', 'Needs Improvement', 'Beginning', 'Emerging', 'Implementing', 'Refining', 'Mastering'];
    const executionColors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658']
    // const executionColors = ['#590d22', '#a4133c', '#ff4d6d', '#b7e4c7', '#74c69d', '#40916c', '#1b4332']
    const authUser = useSelector(getAuthUser);

    // REDUX STATE
    const userPrograms = authUser.programs;
    const userServiceAreas = authUser.serviceAreas;
    const userItems = useSelector(getAllItems);
    const userExecutions = useSelector(getAllExecutions);
    const userIndicators = useSelector(getAllIndicators);
    const programRef = useRef('');

    // COMPONENT STATE
    const [statusToReview, setStatusToReview] = useState(authUser.role === 'admin' ? 'Under Review' : 'Incomplete');

    // Programs
    const [currentPrograms, setCurrentPrograms] = useState(userPrograms.filter(userProgram => userProgram?.serviceAreas.length !== 0));
    const [selectedProgram, setSelectedProgram] = useState(userPrograms.find(program => program?.serviceAreas.find(serviceArea => serviceArea?.items.find(item => item?.executions.find(execution => execution?.indicators.find(indicator => indicator.status === statusToReview))))));

    // Service Areas -- Use a filter to determine which service areas the auth user has access to.
    const [currentServiceAreas, setCurrentServiceAreas] = useState(selectedProgram?.serviceAreas.filter(serviceArea => authUser.serviceAreas.map(serviceArea => serviceArea._id).includes(serviceArea._id)));
    const [selectedServiceArea, setSelectedServiceArea] = useState(currentServiceAreas?.find(serviceArea => serviceArea?.items.find(item => item?.executions.find(execution => execution?.indicators.find(indicator => indicator.status === statusToReview)))));

    // Items
    const [currentItems, setCurrentItems] = useState(selectedServiceArea?.items);
    const [selectedItem, setSelectedItem] = useState(selectedServiceArea?.items.find(item => item?.executions.find(execution => execution?.indicators.find(indicator => indicator.status === statusToReview))));

    // Executions
    const [currentExecutions, setCurrentExecutions] = useState(selectedItem?.executions);
    const [selectedExecution, setSelectedExecution] = useState(selectedItem?.executions.find(execution => execution?.indicators.find(indicator => indicator.status === statusToReview)))
   
    
    const [currentIndicators, setCurrentIndicators] = useState(selectedExecution?.indicators);


    

    // FILTER CHANGE HANDLERS
    const handleIndicatorStatusChanged = (e) => {
        setStatusToReview(e.target.value);
        programRef.current.value = undefined;
        setSelectedProgram(undefined);
        setCurrentPrograms(userPrograms.filter(userProgram => userProgram.serviceAreas.length !== 0));
        setCurrentServiceAreas([]);
        setCurrentItems([]);
        setSelectedItem(undefined);
    }

    /**
     * Updates necessary component state when the program filter is changed.
     * @param {*} e - The event object.
     */
    const handleProgramChanged = (e) => {
        if(!e.target.value) {
            setCurrentServiceAreas([]);
            setCurrentItems([]);
            setSelectedItem(undefined);
            return;
        }

        setCurrentServiceAreas([]);
        setSelectedServiceArea(undefined);
        setCurrentItems([]);
        setSelectedItem(undefined);
        const selectedProgram = userPrograms.find(userProgram => userProgram._id === e.target.value);
        setSelectedProgram(selectedProgram);
        const serviceAreaIds = selectedProgram.serviceAreas.map(serviceArea => serviceArea._id);
        setCurrentServiceAreas(userServiceAreas.filter(userServiceArea => serviceAreaIds.includes(userServiceArea._id)));
    }

    /**
     * Updates necessary component state when the service area filter is changed.
     * @param {*} e - The event object.
     */
    const handleServiceAreaChanged = (e) => {
        if(!e.target.value) {
            setCurrentItems([])
            setSelectedItem(undefined);
            return;
        }

        setCurrentItems([]);
        setSelectedItem(undefined);
        const selectedServiceArea = userServiceAreas.find(userServiceArea => userServiceArea._id === e.target.value);
        setSelectedServiceArea(selectedServiceArea);
        const itemIds = selectedServiceArea.items.map(item => item._id);
        setCurrentItems(userItems.filter(item => itemIds.includes(item._id)));
    }


    /**
     * Updates necessary component state when the item filter is changed.
     * @param {*} e - The event object.
     */
    const handleItemChanged = (e) => {
        if(!e.target.value) {
            setCurrentExecutions([]);
            setSelectedItem(undefined);
            return;
        }

        // Set the selected item.
        const selectedItem = userItems.find(userItem => userItem._id === e.target.value);
        setSelectedItem(selectedItem);

        // Get all possible executions
        const executionIds = selectedItem.executions.map(execution => execution._id);
        const executions = userExecutions
            .filter((execution) => executionIds.includes(execution._id))
            // Re-arrange the array to match the correct execution order.
            .map((_, index, arr) => arr.find(otherExecution => otherExecution.metric === executionOrder[index]))
        setCurrentExecutions(executions);

        // Find an execution with the current status indicator.
        const currentExecution = executions.find(execution => execution.indicators.find(indicator => indicator.status === statusToReview))
        setSelectedExecution(currentExecution);

        if(currentExecution) {
            const indicatorIds = currentExecution.indicators.map(indicator => indicator._id);
            setCurrentIndicators(userIndicators.filter(indicator => indicatorIds.includes(indicator._id)));
        }   
    }

    const determineMissingIndicatorsByProgram = (program) => {
        const serviceAreaIds = program.serviceAreas.map(serviceArea => serviceArea._id);
        const serviceAreas = userServiceAreas.filter(userServiceArea => serviceAreaIds.includes(userServiceArea._id));
        const itemIds = serviceAreas.map(serviceArea => serviceArea.items.map(item => item._id)).flat(1);
        const items = userItems.filter(userItem => itemIds.includes(userItem._id));
        const executionIds = items.map(item => item.executions.map(execution => execution._id)).flat(1);
        const executions = userExecutions.filter(execution => executionIds.includes(execution._id));
        const indicatorIds = executions.map(execution => execution.indicators.map(indicator => indicator._id)).flat(1);
        const indicators = userIndicators.filter(indicator => indicatorIds.includes(indicator._id));
        return indicators.filter(indicator => indicator.status === statusToReview).length;
    }

    const determineMissingIndicatorsByServiceArea = (serviceArea) => {
        const itemIds = serviceArea.items.map(item => item._id);
        const items = userItems.filter(userItem => itemIds.includes(userItem._id));
        const executionIds = items.map(item => item.executions.map(execution => execution._id)).flat(1);
        const executions = userExecutions.filter(execution => executionIds.includes(execution._id));
        const indicatorIds = executions.map(execution => execution.indicators.map(indicator => indicator._id)).flat(1);
        const indicators = userIndicators.filter(indicator => indicatorIds.includes(indicator._id));
        return indicators.filter(indicator => indicator.status === statusToReview).length;
    }

    const determineMissingIndicatorsByItem = (item) => {
        const executionIds = item.executions.map(execution => execution._id);
        const executions = userExecutions.filter(execution => executionIds.includes(execution._id));
        const indicatorIds = executions.map(execution => execution.indicators.map(indicator => indicator._id)).flat(1);
        const indicators = userIndicators.filter(indicator => indicatorIds.includes(indicator._id));
        return indicators.filter(indicator => indicator.status === statusToReview).length;
    }
    

    const indicatorsNeedingCleanUp = (status) => {
        const allIndicators = currentExecutions.map(execution => execution.indicators).flat(1);
        return allIndicators.filter(indicator => indicator.status === status).length;
    }

    // Get the total number of indicators for the current execution
    const totalIndicators = selectedItem ? selectedItem?.executions.map(execution => execution.indicators).flat(1).length : 0;

    // Set the data for the re-charts spider graph.
    const data = currentExecutions?.map((execution, index) => {
        let completedPercentage;

        if(execution.indicators.length !== 0) {
            completedPercentage = execution.indicators.filter(indicator => indicator.status === 'Completed' || indicator.status === 'Under Review').length / execution.indicators.length;
        } else {
            completedPercentage = currentExecutions[index + 1].indicators.filter(indicator => indicator.status === 'Completed' || indicator.status === 'Under Review').length / 1 ? 1 : 0;
        }

        ('Execution: ', completedPercentage);

        return {
            name: execution.metric,
            completionPercentage: completedPercentage.toFixed(2),
            fill: executionColors[index]
        }
    });

    // Style the graph radial graph legend.
    const style = {
        top: '50%',
        right: 0,
        transform: 'translate(0, -50%)',
        lineHeight: '24px',
        fontSize: '1.3rem',
        fontWeight: '700',
    };

    // COMPONENT
    return (
        <div className='dashboard'>
            {
                currentPrograms.length !== 0 ?
                <div className='dashboard__filters'>
                    <div className='dashboard__filter__group'>
                        <label className='dashboard__label'>Indicator Status</label>
                        <select
                            className='select__base dashboard__radar__filter'
                            onChange={handleIndicatorStatusChanged}
                            value={statusToReview}
                        >
                            {['Incomplete', 'Under Review', 'Completed'].map(indicatorStatus => (
                                <option
                                    key={uuidv4()}
                                    value={indicatorStatus}
                                >{indicatorStatus}</option>
                            ))}
                        </select>
                    </div>
                    <div className='dashboard__filter__group'>
                        <label className='dashboard__label'>Program</label>
                        <select
                            className='select__base dashboard__radar__filter'
                            onChange={handleProgramChanged}
                            ref={programRef}
                            value={selectedProgram?._id}
                        >
                            <option></option>
                            {currentPrograms?.map(program => (
                                <option
                                    key={program._id}
                                    value={program._id}  
                                >{`${program.name} - ${determineMissingIndicatorsByProgram(program)}`}</option>
                            ))}
                        </select>
                    </div>
                    <div className='dashboard__filter__group'>
                        <label className='dashboard__label'>Service Area</label>
                        <select
                            className='select__base dashboard__radar__filter'
                            onChange={handleServiceAreaChanged}
                            value={selectedServiceArea?._id}
                        >
                            <option></option>
                            {currentServiceAreas?.map(serviceArea => (
                                <option
                                    key={serviceArea._id}
                                    value={serviceArea._id}
                                    
                                >{`${serviceArea.name} - ${determineMissingIndicatorsByServiceArea(serviceArea)}`}</option>
                            ))}
                        </select>
                    </div>
                    <div className='dashboard__filter__group'>
                        <label className='dashboard__label'>Item</label>
                        <select
                            className='select__base dashboard__radar__filter'
                            onChange={handleItemChanged}
                            value={selectedItem?._id}
                        >
                            <option></option>
                            {currentItems?.map(item => (
                                <option
                                    key={item._id}
                                    value={item._id}
                                >{`${item.name} - ${determineMissingIndicatorsByItem(item)}`}</option>
                            ))}
                        </select>
                    </div>
                 </div> :
                 <h2>Whoops, we couldn't find enough data to display your dashboard. This most likely means you haven't been assigned a program yet. Please contact your system administrator for more help.</h2>
            }
            {
                currentPrograms.length !== 0 ? 
                selectedServiceArea ?
                selectedItem ?
                selectedExecution ? 
                <div>
                    <div className='dashboard__top'>
                        
                        <div className='dashboard__radar'>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart cx="50%" cy="50%" innerRadius="5%" outerRadius="110%" barSize={20} data={data} startAngle={180} endAngle={-180}>
                                    <RadialBar
                                        minAngle={15}
                                        legendType='star'
                                        label={{ position: 'insideStart', fill: '#fff', formatter: (value) => `${(value * 100).toFixed(0)} %`, fontSize: '1.2rem', fontWeight: 700}}
                                        clockwise={true}
                                        background
                                        dataKey="completionPercentage"
                                    />
                                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={style} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className='dashboard__cards'>
                            <Card value={indicatorsNeedingCleanUp(statusToReview)} description="Indicators Needing Clean-up" />
                            <Card value={`${Number((totalIndicators - indicatorsNeedingCleanUp('Incomplete')) / totalIndicators * 100).toFixed(2)} %`} description="Item Mastery" />
                        </div>
                    </div>
                    <div>
                        <div className='dashboard__table'>
                            <IndicatorTable 
                                executions={currentExecutions}
                                setExecutions={setCurrentExecutions}
                                currentExecution={selectedExecution}
                                setCurrentExecution={setSelectedExecution}
                                indicators={currentIndicators}
                                setIndicators={setCurrentIndicators}
                            /> 
                        </div>
                    </div> 
                </div> :
                <h2>This item has no indicators with the status '{statusToReview}'. Please select a different filter set to continue.</h2> :
                <h2>Please select an item to display the dashboard.</h2> :
                <h2>Your workload is up to date. Nothing to see here...</h2> :
                undefined
            }
        </div>
    )
}

export default Dashboard;