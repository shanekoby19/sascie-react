import { useState, useRef } from 'react';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { 
    getAllExecutions,
    getAllIndicators,
    getAllItems,
    getAllPosts,
    deleteServiceArea,
    deleteItem,
    deleteExecution,
    deleteIndicator,
    deletePost
} from '../sascie/sascieSlice';

import { 
    getAuthUser,
    deleteAuthUserServiceAreas,
} from '../auth/authSlice';

import Loader from '../../components/Loader';

const SascieManager = ({
    changeStage
}) => {   
    // DISPATCH
    const dispatch = useDispatch();
    const authUser = useSelector(getAuthUser);

    // React Element References
    const serviceAreaIdRef = useRef('');
    const startDateRef = useRef('');
    const endDateRef = useRef('');
    
    // Redux State Selectors
    const userPrograms = authUser.programs;
    const userServiceAreas = authUser.serviceAreas;
    const userItems = useSelector(getAllItems);
    const userExecutions = useSelector(getAllExecutions);
    const userIndicators = useSelector(getAllIndicators);
    const userPosts = useSelector(getAllPosts);

    // React State Arrays
    const [currentServiceAreas, setCurrentServiceAreas] = useState([]);
    const [currentItemStartDates, setCurrentItemStartDates] = useState([]);
    const [currentItemEndDates, setCurrentItemEndDates] = useState([]);
    const [currentItems, setCurrentItems] = useState([]);
    const [currentExecutions, setCurrentExecutions] = useState([]);
    const [currentIndicators, setCurrentIndicators] = useState([]);
    const [currentPosts, setCurrentPosts] = useState([]);

    // Table Data.
    const [tableData, setTableData] = useState([]);

    // Selected Content State
    const [selectedIds, setSelelectedIds] = useState([]);
    const [rootId, setRootId] = useState('');
    const [rootName, setRootName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(undefined);
    const [deletionText, setDeletionText] = useState('');
    const [loading, setLoading] = useState(false);


    // ---------------------- FILTER HANDLERS ------------------------
    /**
     * Sets the table table to null if the project filter is reset,
     * else it will set the table data to the selected programs service areas.
     * @param {The event object, passed automatically by react events} e 
     */
    const handleProgramSelected = (e) => {
        // If the filter is reset the filter state, clear all existing state at and below this filter.
        if(!e.target.value) {
            setCurrentServiceAreas([]);
            setCurrentItemStartDates([]);
            setCurrentItemEndDates([]);
            setCurrentItems([]);
            setCurrentExecutions([]);
            setCurrentIndicators([]);
            setCurrentPosts([]);
            setTableData([]);
            setSelelectedIds([]);
            setRootName('');
            setRootId('');
            return;
        }
        const selectedProgram = userPrograms.find(userProgram => userProgram._id === e.target.value);
        const serviceAreas = userServiceAreas.filter(userServiceArea => selectedProgram.serviceAreas.find(serviceArea => serviceArea._id === userServiceArea._id));
        setCurrentServiceAreas(serviceAreas);
        setRootName('Program');
        setRootId(e.target.value);

        // Reset any existing state below this filter
        setCurrentItemStartDates([]);
        setCurrentItemEndDates([]);
        setCurrentItems([]);
        setCurrentExecutions([]);
        setCurrentIndicators([]);
        setCurrentPosts([]);
        setSelelectedIds([]);


        setTableData(serviceAreas);
    }

    /**
     * Sets the table table to null if the service area filter is reset,
     * else it will set the table data to the selected service area items. 
     * @param {The event object, passed automatically by react events} e 
     */
    const handleServiceAreaSelected = (e) => {
        // If the filter is reset the filter state, clear all existing state at and below this filter.
        if(!e.target.value) {
            setCurrentItemStartDates([]);
            setCurrentItemEndDates([]);
            setCurrentItems([]);
            setCurrentExecutions([]);
            setCurrentIndicators([]);
            setCurrentPosts([]);
            setTableData([]);
            setSelelectedIds([]);
            setRootName('');
            setRootId('');
            return;
        }

        const selectedServiceArea = userServiceAreas.find(userServiceArea => userServiceArea._id === e.target.value);
        const items = userItems.filter(userItem => selectedServiceArea.items.find(item => item._id === userItem._id));
        setCurrentItemStartDates([...new Set(items.map(item => item.startDate))]);

        // Reset any existing state below this filter
        setCurrentItemEndDates([]);
        setCurrentItems([]);
        setCurrentExecutions([]);
        setCurrentIndicators([]);
        setCurrentPosts([]);
        setSelelectedIds([]);
        setRootName('Service Area');
        setRootId(e.target.value);
        

        setTableData(items);
    }

    /**
     * Sets the table table to null if the item start date filter is reset,
     * else it will set the table data to the items that have the selected start date. 
     * @param {The event object, passed automatically by react events} e 
     */
    const handleItemStartDateSelected = (e) => {
        // If the filter is reset the filter state, clear all existing state at and below this filter.
        if(!e.target.value) {
            setCurrentItemEndDates([]);
            setCurrentItems([]);
            setCurrentExecutions([]);
            setCurrentIndicators([]);
            setCurrentPosts([]);
            setTableData([]);
            setSelelectedIds([]);
            return;
        }
        const selectedServiceArea = userServiceAreas.find(userServiceArea => userServiceArea._id === serviceAreaIdRef.current.value);
        const items = userItems.filter(userItem => selectedServiceArea.items.find(item => item._id === userItem._id))
                               .filter(userItem => userItem.startDate === e.target.value);

        setCurrentItemEndDates([...new Set(items.map(item => item.endDate))]);

        // Reset any existing state below this filter
        setCurrentItems([]);
        setCurrentExecutions([]);
        setCurrentIndicators([]);
        setCurrentPosts([]);
        setSelelectedIds([]);

        setTableData(items);
    }

    /**
     * Sets the table table to null if the item end date filter is reset,
     * else it will set the table data to the items that have the selected start date and end date. 
     * @param {The event object, passed automatically by react events} e 
     */
    const handleItemEndDateSelected = (e) => {
        // If the filter is reset the filter state, clear all existing state at and below this filter.
        if(!e.target.value) {
            setCurrentItems([]);
            setCurrentExecutions([]);
            setCurrentIndicators([]);
            setCurrentPosts([]);
            setTableData([]);
            setSelelectedIds([]);
            return;
        }
        const selectedServiceArea = userServiceAreas.find(userServiceArea => userServiceArea._id === serviceAreaIdRef.current.value);
        const items = userItems.filter(userItem => selectedServiceArea.items.find(item => item._id === userItem._id))
                               .filter(userItem => userItem.startDate === startDateRef.current.value)
                               .filter(userItem => userItem.endDate === e.target.value);
        setCurrentItems(items);

        // Reset any existing state below this filter
        setCurrentExecutions([]);
        setCurrentIndicators([]);
        setCurrentPosts([]);
        setSelelectedIds([]);

        setTableData(items);
    }

    /**
     * Sets the table table to null if the item filter is reset,
     * else it will set the table data to the executions of the selected item.
     * @param {The event object, passed automatically by react events} e 
     */
    const handleItemSelected = (e) => {
        // If the filter is reset the filter state, clear all existing state at and below this filter.
        if(!e.target.value) {
            setCurrentExecutions([]);
            setCurrentIndicators([]);
            setCurrentPosts([]);
            setTableData([]);
            setSelelectedIds([]);
            setRootName('');
            setRootId('');
            return;
        }
        const selectedItem = userItems.find(userItem => userItem._id === e.target.value);
        const executions = userExecutions.filter(userExecution => selectedItem.executions.find(execution => execution._id === userExecution._id));
        setCurrentExecutions(executions);

        // Reset any existing state below this filter
        setCurrentIndicators([]);
        setCurrentPosts([]);
        setSelelectedIds([]);
        setRootName('Item');
        setRootId(e.target.value);

        setTableData(executions);
    }

     /**
     * Sets the table table to null if the execution filter is reset,
     * else it will set the table data to the indicators of the selected execution.
     * @param {The event object, passed automatically by react events} e 
     */
    const handleExecutionSelected = (e) => {
         // If the filter is reset the filter state, clear all existing state at and below this filter.
         if(!e.target.value) {
            setCurrentIndicators([]);
            setCurrentPosts([]);
            setTableData([]);
            setSelelectedIds([]);
            setRootName('');
            setRootId('');
            return;
        }

        const selectedExecution = userExecutions.find(userExecution => userExecution._id === e.target.value);
        const indicators = userIndicators.filter(userIndicator => selectedExecution.indicators.find(indicator => indicator._id === userIndicator._id));
        setCurrentIndicators(indicators);
        setCurrentPosts([]);
        setSelelectedIds([]);
        setRootName('Execution');
        setRootId(e.target.value);


        setTableData(indicators);
    }

    /**
     * Sets the table data to null if the indicator filter is reset,
     * else it will set the table data to the posts of the selected execution.
     * @param {The event object, passed automatically by react events} e 
     */
     const handleIndicatorSelected = (e) => {
        // If the filter is reset, clear all existing state at and below this filter.
        if(!e.target.value) {
            setCurrentPosts([]);
            setTableData([]);
            setSelelectedIds([]);
            setRootName('');
            setRootId('');
            return;
       }

       const selectedIndicator = userIndicators.find(userIndicator => userIndicator._id === e.target.value);
       const posts = userPosts.filter(userPost => selectedIndicator.posts.find(post => post._id === userPost._id));
       setCurrentPosts(posts);
       setSelelectedIds([]);
       setRootName('Indicator');
       setRootId(e.target.value);

       setTableData(posts);
   }


    /**
     * Updates the selected Ids state to include or exclude the selected object.
     * @param {*} e - The event object.
     */
    const handleUpdateIds = (e) => {
        // Switch the checkbox state if the table cell is selected.
        if(e.target.tagName.toLowerCase() === 'td') {
            e.target.children[0].checked = !e.target.children[0].checked;
        }

        const targetId = e.target.getAttribute('value') || e.target.value;
        const stateContainsId = selectedIds.includes(targetId);

        if(stateContainsId) {
            return setSelelectedIds(selectedIds.filter(id => id !== targetId));
        }

        setSelelectedIds([...selectedIds, targetId]);
    }

    // ---------------------- DATABASE DELETE HANDLERS ------------------------
    const confirmDeleteValues = () => {
        setShowModal(true);

        if(rootName === 'Program') {
            const serviceAreas = userServiceAreas.filter(serviceArea => selectedIds.includes(serviceArea._id));
            const itemIds = serviceAreas.map(serviceArea => serviceArea.items.map(item => item._id)).flat(1);
            const items = userItems.filter(item => itemIds.includes(item._id));
            const executionIds = items.map(item => item.executions.map(execution => execution._id)).flat(1);
            const executions = userExecutions.filter(execution => executionIds.includes(execution._id));
            const indicatorIds = executions.map(execution => execution.indicators.map(indicator => indicator._id)).flat(1);
            const indicators = userIndicators.filter(indicator => indicatorIds.includes(indicator._id));
            const postIds = indicators.map(indicator => indicator.posts.map(post => post._id)).flat(1);
            const posts = userPosts.filter(userPost => postIds.includes(userPost._id));
            setModalContent(
                <div>
                    {
                        serviceAreas.length === 1 ? 
                        <h3 
                            className='manager__modal__container__content--sub-header'
                        >Deleting the service area '{`${serviceAreas[0].name}`}' will cause all of it's child elements to be permanently removed from the database. This action can not be undone.</h3> :
                        <h3 
                            className='manager__modal__container__content--sub-header'
                        >Deleting the service areas: {serviceAreas.map((serviceArea, index, arr) => index !== arr.length - 1 ? `'${serviceArea.name}', ` : `and '${serviceArea.name}'`)} will cause all of their child elements to be permanently removed from the database. This action can not be undone.</h3> 
                        
                    }
                    <p
                        className='manager__modal__container__content--item'
                    >{serviceAreas.length} service areas will be deleted.</p>
                    <p 
                        className='manager__modal__container__content--item'
                    >{items.length} items will be deleted.</p>
                    <p 
                        className='manager__modal__container__content--item'
                    >{executions.length} executions will be deleted.</p>
                    <p 
                        className='manager__modal__container__content--item'
                    >{indicators.length} indicators will be deleted.</p>
                    <p 
                        className='manager__modal__container__content--item'
                    >{posts.length} posts will be deleted.</p>
                </div>
            )
        }
        else if(rootName === 'Service Area') {
            const items = userItems.filter(item => selectedIds.includes(item._id));
            const executionIds = items.map(item => item.executions.map(execution => execution._id)).flat(1);
            const executions = userExecutions.filter(execution => executionIds.includes(execution._id));
            const indicatorIds = executions.map(execution => execution.indicators.map(indicator => indicator._id)).flat(1);
            const indicators = userIndicators.filter(indicator => indicatorIds.includes(indicator._id));
            const postIds = indicators.map(indicator => indicator.posts.map(post => post._id)).flat(1);
            const posts = userPosts.filter(userPost => postIds.includes(userPost._id));
            setModalContent(
                <div>
                    {
                        items.length === 1 ? 
                        <h3 
                            className='manager__modal__container__content--sub-header'
                        >Deleting the item '{`${items[0].name}`}' will cause all of it's child elements to be permanently removed from the database. This action can not be undone.</h3> :
                        <h3 
                            className='manager__modal__container__content--sub-header'
                        >Deleting the items: {items.map((item, index, arr) => index !== arr.length - 1 ? `'${item.name}', ` : `and '${item.name}'`)} will cause all of their child elements to be permanently removed from the database. This action can not be undone.</h3> 
                        
                    }
                    <p 
                        className='manager__modal__container__content--item'
                    >{items.length} items will be deleted.</p>
                    <p 
                        className='manager__modal__container__content--item'
                    >{executions.length} executions will be deleted.</p>
                    <p 
                        className='manager__modal__container__content--item'
                    >{indicators.length} indicators will be deleted.</p>
                    <p 
                        className='manager__modal__container__content--item'
                    >{posts.length} posts(s) will be deleted.</p>
                </div>
            )
        }
        else if(rootName === 'Item') {
            const executions = userExecutions.filter(execution => selectedIds.includes(execution._id));
            const indicatorIds = executions.map(execution => execution.indicators.map(indicator => indicator._id)).flat(1);
            const indicators = userIndicators.filter(indicator => indicatorIds.includes(indicator._id));
            const postIds = indicators.map(indicator => indicator.posts.map(post => post._id)).flat(1);
            const posts = userPosts.filter(userPost => postIds.includes(userPost._id));
            setModalContent(
                <div>
                    {
                        executions.length === 1 ? 
                        <h3
                            className='manager__modal__container__content--sub-header'
                        >Deleting the execution '{`${executions[0].metric}`}' will cause all of it's child elements to be permanently removed from the database. This action can not be undone.</h3> :
                        <h3 className='manager__modal__container__content--sub-header'
                        >Deleting the executions: {executions.map((execution, index, arr) => index !== arr.length - 1 ? `'${execution.metric}', ` : `and '${execution.metric}'`)} will cause all of their child elements to be permanently removed from the database. This action can not be undone.</h3> 
                        
                    }
                    <p 
                        className='manager__modal__container__content--item'
                    >{executions.length} execution(s) will be deleted.</p>
                    <p 
                        className='manager__modal__container__content--item'
                    >{indicators.length} indicator(s) will be deleted.</p>
                    <p 
                        className='manager__modal__container__content--item'
                    >{posts.length} posts(s) will be deleted.</p>
                </div>
            )
        }
        else if(rootName === 'Execution') {
            const indicators = userIndicators.filter(indicator => selectedIds.includes(indicator._id));
            const postIds = indicators.map(indicator => indicator.posts.map(post => post._id)).flat(1);
            const posts = userPosts.filter(userPost => postIds.includes(userPost._id));
            setModalContent(
                <div>
                    {
                        indicators.length === 1 ? 
                        <h3
                            className='manager__modal__container__content--sub-header'
                        >Deleting the indicator '{`${indicators[0].description}`}' will cause all of it's child elements to be permanently removed from the database. This action can not be undone.</h3> :
                        <h3 
                            className='manager__modal__container__content--sub-header'
                        >Deleting the indicators: {indicators.map((indicator, index, arr) => index !== arr.length - 1 ? `'${indicator.description}', ` : `and '${indicator.description}'`)} will cause all of their child elements to be permanently removed from the database. This action can not be undone.</h3> 
                        
                    }
                    <p 
                        className='manager__modal__container__content--item'
                    >{indicators.length} indicator(s) will be deleted.</p>
                    <p 
                        className='manager__modal__container__content--item'
                    >{posts.length} posts(s) will be deleted.</p>
                </div>
            )
        }
        else if(rootName === 'Indicator') {
            const posts = userPosts.filter(userPost => selectedIds.includes(userPost._id));
            setModalContent(
                <div>
                    {
                        posts.length === 1 ? 
                        <h3
                            className='manager__modal__container__content--sub-header'
                        >Deleting the post '{`${posts[0].comment}`}' will cause all of it's child elements to be permanently removed from the database. This action can not be undone.</h3> :
                        <h3 
                            className='manager__modal__container__content--sub-header'
                        >Deleting the posts: {posts.map((post, index, arr) => index !== arr.length - 1 ? `'${post.comment}', ` : `and '${post.comment}'`)} will cause all of their child elements to be permanently removed from the database. This action can not be undone.</h3> 
                        
                    }
                    <p 
                        className='manager__modal__container__content--item'
                    >{posts.length} posts(s) will be deleted.</p>
                </div>
            )
        }
    }

    /**
     * Cascade delete all objects and children of the selected values.
     */
    const handleDeleteValues = async () => {
        // Reset state
        setShowModal(false);
        setLoading(true);
        setCurrentServiceAreas([]);
        setCurrentItemStartDates([]);
        setCurrentItemEndDates([]);
        setCurrentItems([]);
        setCurrentExecutions([]);
        setCurrentIndicators([]);
        setCurrentPosts([]);
        setTableData([]);
        setSelelectedIds([]);
        setRootName('');
        setRootId('');

        if(rootName === 'Program') {
            await deleteServiceAreas(rootId, selectedIds);
        }
        else if(rootName === 'Service Area') {
            await deleteItems(rootId, selectedIds);
        }
        else if(rootName === 'Item') {
            await deleteExecutions(rootId, selectedIds);
        }
        else if(rootName === 'Execution') {
            await deleteIndicators(rootId, selectedIds);
        }
        else if(rootName === 'Indicator') {
            await deletePosts(rootId, selectedIds);
        }

        setLoading(false);
    }

    const deleteServiceAreas = async (programId, serviceAreaIds) => {
        const serviceAreas = userServiceAreas.filter(serviceArea => serviceAreaIds.includes(serviceArea._id));
        
        await Promise.all(serviceAreas.map(async serviceArea => {
            if(serviceArea.items) {
                await deleteItems(serviceArea._id, serviceArea.items.map(item => item._id));
            }

            // Delete Service Area
            dispatch(deleteServiceArea({ programId, serviceAreaId: serviceArea._id }));
        }));

        // remove the service areas from the authUser state.
        dispatch(deleteAuthUserServiceAreas({ serviceAreaIds }))
    }

    const deleteItems = async (serviceAreaId, itemIds) => {
        const items = userItems.filter(item => itemIds.includes(item._id));

        await Promise.all(items.map(async item => {
            if(item.executions) {
                await deleteExecutions(item._id, item.executions.map(execution => execution._id))
            }

            // Delete Item
            dispatch(deleteItem({ serviceAreaId, itemId: item._id}));
        }));

    }


    const deleteExecutions = async (itemId, executionIds) => {
        const executions = userExecutions.filter(execution => executionIds.includes(execution._id));

        await Promise.all(executions.map(async execution => {
            if(execution.indicators) {
                await deleteIndicators(execution._id, execution.indicators.map(indicator => indicator._id))
            }

            // Delete Execution
            return dispatch(deleteExecution({ itemId, executionId: execution._id }))
        }));

    }

    const deleteIndicators = async (executionId, indicatorIds) => {
        const indicators = userIndicators.filter(indicator => indicatorIds.includes(indicator._id));

        await Promise.all(indicators.map(async indicator => {
            if(indicator.posts) {
                await deletePosts(indicator._id, indicator.posts.map(post => post._id))
            }

            // Delete Indicator
            return dispatch(deleteIndicator({ executionId, indicatorId: indicator._id }));
        }));

    }

    const deletePosts = async (indicatorId, postIds) => {
        const posts = userPosts.filter(post => postIds.includes(post._id));

        await Promise.all(posts.map(async post => {
            // Delete Indicator
            return dispatch(deletePost({ indicatorId, postId: post._id }));
        }));

    }



    // ---------------------- GET TABLE DATA ------------------------
    /**
     * Takes an array of database objects and creates table headers from them.
     * @param {A array of database objects.} tableData 
     * @returns Table headers based on the object it receives.
     */
    const getTableHeader = (tableData) => {
        const headers = Object.keys(tableData[0]);
        return (
            <tr>
                <td>Select</td>
                {
                    headers.map(header => <td key={uuidv4()}>{header}</td>)
                }
            </tr>
        )
    }

     /**
     * Takes an array of database objects and creates table values from them.
     * @param {A array of database objects.} tableData 
     * @returns Table cell values based on the object it receives.
     */
    const getTableBody = (tableData) => {
        return tableData.map(dataObject => {
            const values = Object.values(dataObject);
            return (
                <tr key={uuidv4()}>
                    <td 
                        onClick={handleUpdateIds}
                        value={dataObject._id}
                    > 
                        <input
                            onChange={handleUpdateIds}
                            type='checkbox'
                            name='userCheckbox'
                            value={dataObject._id}
                            checked={selectedIds.includes(dataObject._id)}
                        ></input>
                    </td>
                    {
                        values.map(value => {
                            // Check to see if the value is a database date object.
                            if(value.slice && value.slice(-1) === 'Z') {
                                return (
                                    <td
                                        key={uuidv4()}>{moment(value).format("MMM Do, YYYY")}
                                    </td>
                                )
                            }
                            return (
                                <td 
                                    key={uuidv4()}>{Array.isArray(value) ? '' : value}
                                </td>
                            )
                        })
                    }
                </tr>
            )
        })
    }

    // LOADER
    if(loading) {
        return (
            <div className='loader__container'>
                <Loader message="Deleting your SASCIE data, just a moment."/>
            </div>
        )
    }


    // ---------------------- DOM CREATION ------------------------
    return (
        <div className='manager'>
            <div className='manager__filters'>
                <div className='manager__filter__group'>
                    <label>Program</label>
                    <select
                        className='select__base'
                        onChange={handleProgramSelected}
                    >
                        <option></option>
                        {userPrograms.map(userProgram => (
                            <option 
                                key={userProgram._id}
                                value={userProgram._id}
                            >{userProgram.name}</option>
                        ))}
                    </select>
                </div>
                {
                    currentServiceAreas.length !== 0 &&
                    <div className='manager__filter__group'>
                        <label>Service Area</label>
                        <select
                            className='select__base'
                            ref={serviceAreaIdRef}
                            onChange={handleServiceAreaSelected}
                        >
                            <option></option>
                            {currentServiceAreas.map(serviceArea => (
                                <option 
                                    key={serviceArea._id}
                                    value={serviceArea._id}
                                >{serviceArea.name}</option>
                            ))}
                        </select>
                    </div>
                }
                {
                    currentItemStartDates.length !== 0 &&
                    <div className='manager__filter__group'>
                        <label>Item Start Date</label>
                        <select
                            className='select__base'
                            onChange={handleItemStartDateSelected}
                            ref={startDateRef}
                            value={startDateRef.current?.value}
                        >
                            <option></option>
                            {currentItemStartDates.map(itemStartDate => (
                                <option 
                                    key={uuidv4()}
                                    value={itemStartDate}
                                >{moment(itemStartDate).format("MMM Do, YYYY")}</option>
                            ))}
                        </select>
                    </div>
                }
                {
                    currentItemEndDates.length !== 0 &&
                    <div className='manager__filter__group'>
                        <label>Item End Date</label>
                        <select
                            className='select__base'
                            onChange={handleItemEndDateSelected}
                            ref={endDateRef}
                            value={endDateRef.current?.value}
                        >
                            <option></option>
                            {currentItemEndDates.map(itemEndDate => (
                                <option 
                                    key={uuidv4()}
                                    value={itemEndDate}
                                >{moment(itemEndDate).format("MMM Do, YYYY")}</option>
                            ))}
                        </select>
                    </div>
                }
                {
                    currentItems.length !== 0 &&
                    <div className='manager__filter__group'>
                        <label>Item</label>
                        <select
                            className='select__base'
                            onChange={handleItemSelected}
                        >
                            <option></option>
                            {currentItems.map(item => (
                                <option 
                                    key={item._id}
                                    value={item._id}
                                >{item.name}</option>
                            ))}
                        </select>
                    </div>
                }
                {
                    currentExecutions.length !== 0 &&
                    <div className='manager__filter__group'>
                        <label>Execution</label>
                        <select
                            className='select__base'
                            onChange={handleExecutionSelected}
                        >
                            <option></option>
                            {currentExecutions.map(execution => (
                                <option 
                                    key={execution._id}
                                    value={execution._id}
                                >{execution.metric}</option>
                            ))}
                        </select>
                    </div>
                }
                {
                    currentIndicators.length !== 0 &&
                    <div className='manager__filter__group'>
                        <label>Indicator</label>
                        <select
                            className='select__base'
                            onChange={handleIndicatorSelected}
                        >
                            <option></option>
                            {currentIndicators.map(indicator => (
                                <option 
                                    key={indicator._id}
                                    value={indicator._id}
                                >{indicator.description}</option>
                            ))}
                        </select>
                    </div>
                }
                {
                    currentPosts.length !== 0 &&
                    <div className='manager__filter__group'>
                        <label>Post</label>
                        <select
                            className='select__base'
                        >
                            <option></option>
                            {currentPosts.map(post => (
                                <option 
                                    key={post._id}
                                    value={post._id}
                                >{post.comment}</option>
                            ))}
                        </select>
                    </div>
                }
            </div>

            <div className='manager__btns'>
                {
                    selectedIds.length !== 0 &&
                    <button 
                        className='manager__btns__btn manager__btns__btn--delete'
                        onClick={confirmDeleteValues}
                    >DELETE</button>
                }
            </div>

            {
                tableData.length !== 0 ?
                <table className='manager__table'>
                    <thead>
                        {getTableHeader(tableData)}
                    </thead>
                    <tbody>
                        {getTableBody(tableData)}
                    </tbody>
                </table> :
                <h2 className='manager__table__empty'>Whoops, looks like there is no data available for the given filters.</h2>
            }
            <button 
                className='manager__back__btn'
                onClick={() => changeStage(1)}
            >
                <div>
                    SASCIE
                </div>
                <div>
                    &larr;
                </div>
            </button>

            { 
                showModal &&
                <div className='manager__modal'>
                    <div className='manager__modal__container'>
                        <div className='manager__modal__container__content'>
                            <h2 className='manager__modal__container__content--header'>Warning: Cascade Delete</h2>
                            { modalContent }
                            <div className='manager__modal__container__content--input__group'>
                                <label
                                    htmlFor='deleteInput'
                                >If you would like to continue please type the word <span  className='manager__modal__container__content--input__group--span'>'approved'</span> in the text box and click confirm.</label>
                                <input
                                    className='input__base'
                                    type='text'
                                    id='deleteInput'
                                    onChange={(e) => setDeletionText(e.target.value)}
                                ></input>
                            </div>
                            <div className='manager__modal__container__content--btns'>
                                <button 
                                    className='manager__modal__container__content--btns--btn manager__modal__container__content--btns--btn--red' 
                                    onClick={() => setShowModal(false)}
                                >CANCEL</button>
                                {
                                    deletionText === 'approved' &&
                                    <button 
                                        className='manager__modal__container__content--btns--btn manager__modal__container__content--btns--btn--green'
                                        onClick={handleDeleteValues}
                                    >CONFIRM</button>
                                }
                            </div>
                        </div>

                    </div>
                </div>
            }
        </div>
    )
}

export default SascieManager;