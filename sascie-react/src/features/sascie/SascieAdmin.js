import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useSelector, useDispatch } from "react-redux";
import Papa from 'papaparse';
import moment from 'moment';

import SascieImport from './SascieImport';
import SascieManager from './SascieManager';
import Message from '../../components/Message';
import Loader from '../../components/Loader';

import { 
    getAuthUser, 
    addAuthUserServiceArea,
} from "../../features/auth/authSlice";

import {
    updateUser,
} from '../users/usersSlice';

import { 
    addItem,
    addExecution,
    addIndicator,
    updateServiceArea,
    addServiceArea,
    updateProgram,
} from '../sascie/sascieSlice';

const SascieAdmin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const authUser = useSelector(getAuthUser);

    const userPrograms = authUser.programs;

    const [showSascieImport, setShowSascieImport] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(undefined);
    const [error, setError] = useState('');
    const [currentStage, setCurrentStage] = useState('Import Decision');

    // File Uploader
    const handleUploadFile = (e) => {
        Papa.parse(file, {
            complete: async ({ data, error, meta }, file) => {
                setLoading(true);
                const programObjects = buildProgramObjects(data);
                programObjects.forEach(programObject => {
                    insertProgramObject(programObject)
                });
            },
            dynamicTyping: true,
        });
    }

    const buildProgramObjects = (data) => {
        // Make sure there are at least one rows of data to process.
        if(data.length < 2) {
            return setError('The file must have at least 1 row of data to process (excludes header).')
        }

        // Verify headers are correct.
        const headers = ['Program', 'Service Area', 'Item', 'Item Start Date', 'Item End Date', 'Execution', 'Indicator'];
        const headerHasError = data[0].find((header, index) => headers[index] !== header);
        if(headerHasError) return setError(`ERROR: Invalid header name, replace ${headerHasError} with ${headers[data[0].indexOf(headerHasError)]}`)

        // Filter out header -- first row.
        let filteredData = data.length > 2 ? data.slice(1) : data.slice(-1);

        // Get unique values for all areas in the file.
        const uniquePrograms = [...new Set(filteredData.map(row => row[0]))];
        const programObjects = uniquePrograms.map(uniqueProgram => {
            const programData = filteredData.filter(row => row[0] === uniqueProgram);
            const uniqueServiceAreas = [...new Set(programData.map(row => row[1]))];
            
            
            const serviceAreas = uniqueServiceAreas.map(uniqueServiceArea => {
                const serviceAreaData = programData.filter(row => row[1] === uniqueServiceArea);
                const uniqueItems = [...new Set(serviceAreaData.map(row => row[2]))];

                const items = uniqueItems.map(uniqueItem => {
                    const itemData = serviceAreaData.filter(row => row[2] === uniqueItem);
                    // Grab the first item start date and item end date.
                    const startDate = moment(itemData[0][3]);
                    const endDate = moment(itemData[0][4]);
                    const uniqueExecutions = [...new Set(itemData.map(row => row[5]))];

                    const executions = uniqueExecutions.map(uniqueExecution => {
                        const executionData = itemData.filter(row => row[5] === uniqueExecution);
                        const indicators = executionData.map(row => ({ description: row[6] }));

                        return {
                            metric: uniqueExecution,
                            indicators,
                        }
                    });

                    return {
                        name: uniqueItem,
                        startDate,
                        endDate,
                        executions
                    }
                });

                return {
                    name: uniqueServiceArea,
                    items,
                }
            });

            return {
                name: uniqueProgram,
                serviceAreas,
            }
        });

        // Return an object with all values.
        return programObjects;
    }

    const insertProgramObject = async (programObject) => {
        const currentUserProgramID = userPrograms.find(userProgram => userProgram.name === programObject.name)?._id
        if(!currentUserProgramID) {
            return setError(`You do not have access to change the ${programObject.name} program`)
        }

        const serviceAreaIds = await Promise.all(programObject.serviceAreas.map(async serviceArea => {
            const itemIds = await Promise.all(serviceArea.items.map(async item => {
                const executionIds = await Promise.all(item.executions.map(async execution => {
                    const indicatorIds = await Promise.all(execution.indicators.map(async indicator => {
                        if(indicator.description) {
                            // Insert all indicators for the current execution and return their id.
                            let response = await dispatch(addIndicator(indicator));
                            return response.payload.data.indicator._id;
                        }
                    }));
                    
                    // Insert all executions for this service area and return their ids.
                    let response = await dispatch(addExecution({
                        metric: execution.metric, 
                        indicatorIds: indicatorIds[0] !== undefined ? indicatorIds : []
                    }))
                    return response.payload.data.execution._id;
                }));

                // Insert all items for this service area and return their ids.
                let response = await dispatch(addItem({
                    ...item,
                    executions: executionIds
                }))
                return response.payload.data.item._id;
            }));

            // Insert any NEW service areas for this program and return their ids.
            // Get the current database service area if it exists.
            const currentUserServiceArea = userPrograms.find(userProgram => userProgram.name === programObject.name)
                                                        ?.serviceAreas.find(userServiceArea => userServiceArea.name === serviceArea.name);

            if(!currentUserServiceArea) {
                // Insert the new service area here.
                let response = await dispatch(addServiceArea({
                    name: serviceArea.name,
                    items: itemIds
                }));
                await dispatch(addAuthUserServiceArea({ 
                    programId: currentUserProgramID,
                    serviceArea: response.payload.data.serviceArea
                }));
                return response.payload.data.serviceArea._id;
            } else {
                // Update the existing service area here.
                dispatch(updateServiceArea({
                    serviceAreaId: currentUserServiceArea._id,
                    name: serviceArea.name,
                    items: itemIds
                }));
                return currentUserServiceArea._id;
            }
        }));

        // Update the program to reset it's service area ids.
        await dispatch(updateProgram({ 
            programId: currentUserProgramID,
            serviceAreas: serviceAreaIds
        }));

        // Update the user service areas.
        await dispatch(updateUser({
            userId: authUser._id,
            updatedUser: {
                ...authUser,
                serviceAreas: serviceAreaIds,
            },
        }))

        setLoading(false);
        navigate('/sascie/dashboard')
    }

    const stages = ['Manage Sascie', 'Import Decision'];

    const changeStage = (offSetIndex) => {
        // Reset State
        setFile(undefined);
        setShowSascieImport(false);

        const nextStageIndex = stages.indexOf(currentStage) + offSetIndex;
        setCurrentStage(stages[nextStageIndex]);
    }

    if(loading) {
        return (
            <div className='loader__container'>
                <Loader message='Creating your SASCIE, just a moment.'/>
            </div>
        )
    }

    return (
        <div className='sascie__admin'>
            {
                currentStage === 'Manage Sascie' &&
                <SascieManager 
                    changeStage={changeStage}
                />
            }
            { 
                currentStage === 'Import Decision' &&
                <div className='sascie__admin__import'>
                    <div className='sascie__admin__import__box sascie__admin__import__csv'>
                        <h2 className='sascie__admin__import__box--header'>SASCIE Importer</h2>
                        <p className='sascie__admin__import__box--sub-header'>Create a new SASCIE using a csv upload. Completely customizable.</p>
                        { 
                            showSascieImport && 
                            <div className='sascie__admin__import__box--details'>
                                <div className='sascie__admin__import__box--container'>
                                    <Link 
                                        to='/sascie/templates/SASCIE Template - Import Template.csv'
                                        target="_blank" 
                                        download
                                        className='sascie__admin__import__box--link'>Download Import Template
                                    </Link>
                                    <Link
                                        to='/sascie/templates/SASCIE Template - Import Template.csv'
                                        target="_blank" 
                                        download
                                    >
                                        <svg 
                                            width="22" 
                                            height="22" 
                                            viewBox="0 0 1024 1024" 
                                            fill="none" 
                                            xmlns="http://www.w3.org/2000/svg"
                                            className='sascie__admin__import__box--container--svg'>
                                            <path d="M505.7 661C506.448 661.956 507.404 662.729 508.496 663.261C509.588 663.793 510.786 664.069 512 664.069C513.214 664.069 514.412 663.793 515.504 663.261C516.595 662.729 517.552 661.956 518.3 661L630.3 519.3C634.4 514.1 630.7 506.4 624 506.4H549.9V168C549.9 163.6 546.3 160 541.9 160H481.9C477.5 160 473.9 163.6 473.9 168V506.3H400C393.3 506.3 389.6 514 393.7 519.2L505.7 661ZM878 626H818C813.6 626 810 629.6 810 634V788H214V634C214 629.6 210.4 626 206 626H146C141.6 626 138 629.6 138 634V832C138 849.7 152.3 864 170 864H854C871.7 864 886 849.7 886 832V634C886 629.6 882.4 626 878 626Z" fill="#AAAAAA"/>
                                        </svg>
                                    </Link>
                                </div>
                                <SascieImport 
                                    file={file}
                                    setFile={setFile}
                                />
                            </div>
                        }
                        <button 
                            className='sascie__admin__import__box__btn'
                            onClick={() => {
                                if(!file) {
                                    return setShowSascieImport(true)
                                }
                                return handleUploadFile(file);
                            }}
                        >{ showSascieImport && file ? "Import" : "Upload" }<span className='sascie__admin__import__box__btn--arrow'>&rarr;</span></button>
                    </div>

                    <div className='sascie__admin__import__box sascie__admin__import__manual'>
                        <h2 className='sascie__admin__import__box--header'>SASCIE Manager</h2>
                        <p className='sascie__admin__import__box--sub-header'>Manager your SASCIE data from the root of the program down to individual posts.</p>
                        <button 
                            className='sascie__admin__import__box__btn'
                            onClick={() => setCurrentStage(stages[0])}
                        >Manage <span className='sascie__admin__import__box__btn--arrow'>&rarr;</span></button>
                    </div>
                </div>
            }
            
            { error && <Message message={error} className='error' />}
        </div>
    )
}

export default SascieAdmin;


// DEPRECATED
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
// import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa'; 
// import SascieInit from "./utils/SascieInit";
// import ServiceAreas from './serviceAreas/ServiceAreas';
// import Items from './items/Items';
// import Executions from './executions/Executions'
// import SascieComplete from './utils/SascieComplete';



// useEffect(() => {
//     const fetchTemplateProgram = async() => {
//         let response = await fetch('http://localhost:5000/api/v1/programs/629d049a3bdc150f2c5f75ec', {
//             method: 'GET',
//             credentials: 'include',
//         });
//         response = await response.json();
//         return response.data.doc;
//     }

//     fetchTemplateProgram()
//         .then(templateProgram => {
//             setTemplateProgram(templateProgram);
//             setServiceAreas(templateProgram.serviceAreas);
//             setItems(templateProgram.serviceAreas.map(serviceArea => ({
//                 items: [...serviceArea.items],
//                 serviceAreaId: serviceArea._id,
//                 serviceAreaName: serviceArea.name,
//                 itemsVisible: false,
//             })));
//             setExecutions(templateProgram.serviceAreas.map(serviceArea => {
//                 return serviceArea.items.map(item => ({
//                     executions: [...item.executions],
//                     itemId: item._id,
//                     itemName: item.name,
//                     executionsVisible: false,
//                 }))
//             }).flat(1));
//             let allIndicators = [];
//             templateProgram.serviceAreas.forEach(serviceArea => {
//                 serviceArea.items.forEach(item => {
//                     item.executions.forEach(execution => {
//                         allIndicators.push({
//                             indicators: [...execution.indicators],
//                             executionId: execution._id,
//                             executionMetric: execution.metric,
//                             indicatorsVisible: false,
//                         });
//                     })
//                 })
//             })
//             setIndicators(allIndicators);
            
//         })
//         .catch(error => {
//             console.log(error);
//         });
// }, []);


// const [templateProgram, setTemplateProgram] = useState(null);
// const user = useSelector(getAuthUser)
// const [programs, setPrograms] = useState(user.programs);
// const [serviceAreas, setServiceAreas] = useState([]);
// const [items, setItems] = useState([]);
// const [executions, setExecutions] = useState([]);
// const [indicators, setIndicators] = useState([]);
// const [startDate, setStartDate] = useState(moment());
// const [endDate, setEndDate] = useState(moment().add(6, 'months'));


// { 
//     currentStage === 'Sascie Init' && 
//     <LocalizationProvider dateAdapter={AdapterMoment}>
        
//         <SascieInit 
//             programs={programs}
//             setPrograms={setPrograms}
//             user={user}
//             startDate={startDate}
//             setStartDate={setStartDate}
//             endDate={endDate}
//             setEndDate={setEndDate}
//         /> 
//     </LocalizationProvider>
// }
// {
//     currentStage === 'Service Areas' &&
//     <ServiceAreas 
//         serviceAreas={serviceAreas}
//         setServiceAreas={setServiceAreas}
//         items={items}
//         setItems={setItems}
//     />
// }
// {
//     currentStage === 'Items' &&
//     <Items 
//         items={items}
//         setItems={setItems}
//         executions={executions}
//         setExecutions={setExecutions}
//     />
// }
// {
//     currentStage === 'Executions' &&
//     <Executions 
//         executions={executions}
//         setExecutions={setExecutions}
//         indicators={indicators}
//         setIndicators={setIndicators}
//     />
// }

// {
//     currentStage === 'Sascie Complete' &&
//     <SascieComplete 
//         programs={programs}
//         serviceAreas={serviceAreas}
//         items={items}
//         executions={executions}
//         indicators={indicators}
//         startDate={startDate}
//         endDate={endDate}
//     />
// }

// { 
//     currentStage !== 'Import Decision' && 
//     currentStage !== 'Manage Sascie' && 
//     <FaArrowAltCircleLeft 
//         className='sascie__admin__next sascie__admin__next--left'
//         onClick={() => changeStage(-1)}
//     />
// }

// {
//     currentStage !== 'Import Decision' &&
//     currentStage !== 'Manage Sascie' && 
//     <FaArrowAltCircleRight 
//         className='sascie__admin__next sascie__admin__next--right'
//         onClick={() => {
//             if(currentStage !== 'Sascie Init') return changeStage(1)
//             // Reset the error state.
//             setError('');

//             // Check to see if a program was selected before continuing to the Service Area Selection.
//             const programSelectEl = document.querySelector('.programs__select')
//             if(programSelectEl.value !== '') return changeStage(1);
//             setError('Please select at least one program to assign this SASCIE to.')
//         }}
//     />
// }