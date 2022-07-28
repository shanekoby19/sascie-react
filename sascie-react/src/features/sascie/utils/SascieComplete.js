import { useEffect } from 'react';
import moment from 'moment';

const SascieComplete = ({
    programs,
    serviceAreas,
    items,
    executions,
    indicators,
    startDate,
    endDate
}) => {
    useEffect(() => {
        const addServiceAreas = async () => {

            // Get the program in the database that corresponds to the selected program by the user.
            const dbPrograms = await Promise.all(programs.map(async program => {
                let response = await fetch(`/api/v1/programs/${program._id}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                response = await response.json();
                return response.data.doc;
            }));

            dbPrograms.forEach(async program => {

                // Get the current service areas for each selected program
                const currentServiceAreaNames = await Promise.all(program.serviceAreas.map(async serviceArea => {
                    let response = await fetch(`/api/v1/service-areas/${serviceArea._id}`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                    response = await response.json();
                    return response.data.doc.name;
                }));

                // Add any service area that doesn't already exist.
                serviceAreas.forEach(async serviceArea => {
                    if(!currentServiceAreaNames.includes(serviceArea.name)) {
                        let response = await fetch(`/api/v1/programs/${program._id}/service-areas`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                name: serviceArea.name
                            })
                        });
                        response = await response.json();
                    }
                    return;
                })
            })
        }

        const addItems = async () => {

            // Loop through the user assigned programs and get the program object in the database.
            const dbPrograms = await Promise.all(programs.map(async program => {
                let response = await fetch(`/api/v1/programs/${program._id}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                response = await response.json();
                return response.data.doc;
            }));

            // Add each item to the service area that it corresponds to.
            dbPrograms.forEach(program => {
                program.serviceAreas.forEach(serviceArea => {
                    // Check to see if their is an item to insert into this service area. (uses the name for comparison)
                    const itemObj = items.find(itemObj => itemObj.serviceAreaName === serviceArea.name);

                    // If items exist for the given service area insert them into the database.
                    if(itemObj.items.length > 0) {
                        // Check to see if the item already exists in the given service area.
                        // Get the current item names
                        const oldItemNames = serviceArea.items.map(item => item.name);
                        const oldItemStartDates = serviceArea.items.map(item => moment(item.startDate));
                        const oldItemEndDates = serviceArea.items.map(item => moment(item.endDate));

                        // Filter the selected items to only add items that don't already exist in the database.
                        const newItems = itemObj.items.filter(item => {
                            // Return item name not found OR start date not found OR end date not found.
                            return !oldItemNames.includes(item.name) ||
                                   !Boolean(oldItemStartDates.find(momentStartDate => momentStartDate.isSame(startDate, 'day'))) ||
                                   !Boolean(oldItemEndDates.find(momentEndDate => momentEndDate.isSame(endDate, 'day')))
                        });

                        newItems.map(async item => {
                            const executionIds =  await Promise.all(item.executions.map(async (execution) => {
                                const indicatorIds = await Promise.all(execution.indicators.map(async (indicator) => {
                                    // Insert Indicator and return it's new id.
                                    let response = await fetch(`/api/v1/indicators`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        credentials: 'include',
                                        body: JSON.stringify({
                                            description: indicator.description
                                        })
                                    });
                                    response = await response.json();
                                    return response.data.indicator._id;
                                }));

                                // Insert Executions with their indicators and return the executionId
                                let response = await fetch(`/api/v1/executions`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                        metric: execution.metric,
                                        status: execution.status,
                                        indicators: indicatorIds
                                    })
                                });
                                response = await response.json();
                                return response.data.execution._id;
                            }));

                            // Insert an item with it's executions created above.
                            let response = await fetch(`/api/v1/service-areas/${serviceArea._id}/items`, {
                                method: "POST",
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({
                                    name: item.name,
                                    startDate: startDate.toDate(),
                                    endDate: endDate.toDate(),
                                    executions: executionIds
                                })
                            });
                            response = await response.json();
                        })
                    }
                    
                })
            })
        }





        const createNewSascie = async () => {
            await addServiceAreas();
            await addItems();
        }

        createNewSascie();


        const deleteUnusedServiceAreas = async () => {
            let response = await fetch('/api/v1/programs/629d049a3bdc150f2c5f75ec', {
                method: 'GET',
                credentials: 'include',
            });
            response = await response.json();
            const templateProgramServiceAreaIds = response.data.doc.serviceAreas.map(serviceArea => serviceArea._id);

            response = await fetch('/api/v1/service-areas', {
                method: 'GET',
                credentials: 'include'
            });
            response = await response.json();
            const allServiceAreas = response.data.docs;

            const serviceAreasToDelete = allServiceAreas.filter(serviceArea => !templateProgramServiceAreaIds.includes(serviceArea._id));
            
            serviceAreasToDelete.forEach(async (serviceArea) => {
                await fetch(`/api/v1/service-areas/${serviceArea._id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                })
            });
        }

        const deleteUnusedExecutions = async () => {
            let response = await fetch('/api/v1/programs/629d049a3bdc150f2c5f75ec', {
                method: 'GET',
                credentials: 'include',
            });
            response = await response.json();

            // Loop through every the template program and store all it's indicator ids.
            const templateProgramExecutionIds = response.data.doc.serviceAreas.map(serviceArea => {
                return serviceArea.items.map(item => {
                    return item.executions.map(execution => {
                        return execution._id
                    }).flat(1);
                }).flat(1);
            }).flat(1)
            // Filter out any empty arrays. Only here because the template program hasn't been completed in the database.
            .filter(array => array.length > 0);

            response = await fetch('/api/v1/executions', {
                method: 'GET',
                credentials: 'include'
            });
            response = await response.json();
            const allExecutions = response.data.docs;

            const executionsToDelete = allExecutions.filter(execution => !templateProgramExecutionIds.includes(execution._id));

            executionsToDelete.forEach(async (execution) => {
                await fetch(`/api/v1/executions/${execution._id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                })
            });
        }

        const deleteUnusedIndicators = async () => {
            let response = await fetch('/api/v1/programs/629d049a3bdc150f2c5f75ec', {
                method: 'GET',
                credentials: 'include',
            });
            response = await response.json();

            // Loop through every the template program and store all it's indicator ids.
            const templateProgramIndicatorIds = response.data.doc.serviceAreas.map(serviceArea => {
                return serviceArea.items.map(item => {
                    return item.executions.map(execution => {
                        return execution.indicators.map(indicator => {
                            return indicator._id;
                        }).flat(1);
                    }).flat(1);
                }).flat(1);
            }).flat(1)
            // Filter out any empty arrays. Only here because the template program hasn't been completed in the database.
            .filter(array => array.length > 0);

            response = await fetch('/api/v1/indicators', {
                method: 'GET',
                credentials: 'include'
            });
            response = await response.json();
            const allIndicators = response.data.docs;
            const indicatorsToDelete = allIndicators.filter(indicator => !templateProgramIndicatorIds.includes(indicator._id));

            indicatorsToDelete.forEach(async (indicator) => {
                await fetch(`/api/v1/indicators/${indicator._id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                })
            });
        }

    }, []);

    return (
        <div className='container'>
            <h2 className='container--header'>Just a moment, we are finalizing your SASCIE now...</h2>
        </div>
    )
}

export default SascieComplete;