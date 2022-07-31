import { createAsyncThunk, createSlice, current } from "@reduxjs/toolkit";

const baseUrl = process.env.NODE_ENV === 'production' ? `/api/v1` : 'http://localhost:5000/api/v1/auth';

const initialState = {
    programs: [],
    serviceAreas: [],
    items: [],
    executions: [],
    indicators: [],
    posts: [],
}


// PROGRAM ASYNC ACTION CREATORS
export const updateProgram = createAsyncThunk('sascie/updateProgram', async({ programId, serviceAreas }) => {
    try {
        let response = await fetch(`${baseUrl}/programs/${programId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                serviceAreas
            })
        });
        response = await response.json();
        return response;
    }
    catch(error) {
        return error;
    }
})

// SERVICE AREA ASYNC ACTION CREATORS

// ADD NEW SERVICE AREA TO A PROGRAM
export const addServiceArea = createAsyncThunk('sascie/addServiceArea', async ({ programId, name, items }) => {
    try {
        const url = programId ? `${baseUrl}/programs/${programId}/service-areas` : `${baseUrl}/service-areas`
        let response = await fetch(`${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name,
                items
            })
        });
        response = await response.json();
        return { ...response, programId };
    } catch(err) {
        return err;
    }
});

// DELETE A SERVICE AREA FROM A PROGRAM
export const deleteServiceArea = createAsyncThunk('sascie/deleteServiceArea', async({ programId, serviceAreaId }) => {
    try {
        let response = await fetch(`${baseUrl}/programs/${programId}/service-areas/${serviceAreaId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
});


// UPDATE A SERVICE AREA IN A PROGRAM
export const updateServiceArea = createAsyncThunk('sascie/updateServiceArea', async({ serviceAreaId, name, items }) => {
    try {
        let response = await fetch(`${baseUrl}/service-areas/${serviceAreaId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json '},
            credentials: 'include',
            body: JSON.stringify({ name, items })
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
});


// ITEM AREA ASYNC ACTION CREATORS

// ADD AN ITEM TO A SERVICE AREA
export const addItem = createAsyncThunk('item/addItem', async({ serviceAreaId, name, startDate, endDate, executions }) => {
    try {
        const url = serviceAreaId ? `${baseUrl}/service-areas/${serviceAreaId}/items` : `${baseUrl}/items`;
        let response = await fetch(`${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                serviceAreaId,
                name,
                startDate,
                endDate,
                executions
            })
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
})

// DELETE AN ITEM FROM A SERVICE AREA
export const deleteItem = createAsyncThunk('items/deleteItem', async({ serviceAreaId, itemId }) => {
    try {
        let response = await fetch(`${baseUrl}/service-areas/${serviceAreaId}/items/${itemId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
});

// UPDATE AN ITEM IN A SERVICE AREA
export const updateItem = createAsyncThunk('items/updateItem', async({ itemId, updatedItem }) => {
    try {
        let response = await fetch(`${baseUrl}/items/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updatedItem)
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
});

// EXECUTION ASYNC ACTION CREATORS
export const addExecution = createAsyncThunk('executions/addExecution', async({ metric, indicatorIds }) => {
    let response = await fetch(`${baseUrl}/executions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            metric,
            indicators: indicatorIds
        })
    });
    response = await response.json();
    return response;
})

// DELETE EXECUTION
export const deleteExecution = createAsyncThunk('executions/deleteExecution', async({ itemId, executionId }) => {
    try {
        let response = await fetch(`${baseUrl}/items/${itemId}/executions/${executionId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
});

// INDICATOR ASYNC ACTION CREATORS
export const addIndicator = createAsyncThunk('indicators/addIndicator', async({ description }) => {
    let response = await fetch(`${baseUrl}/indicators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            description
        })
    });
    response = await response.json();
    return response;
});

export const updateIndicator = createAsyncThunk('indicators/updateIndicator', async({ status, indicatorId }) => {
    // Change the indicator status to under review.
    let response = await fetch(`/api/v1/indicators/${indicatorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            status
        })
    });
    response = response.json();
    return response;
})

// DELETE INDICIATOR
export const deleteIndicator = createAsyncThunk('indicators/deleteIndicator', async({ executionId, indicatorId }) => {
    try {
        let response = await fetch(`${baseUrl}/executions/${executionId}/indicators/${indicatorId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
});

export const addPost = createAsyncThunk('posts/addPost', async({ formData, indicatorId }) => {
    let response = await fetch(`${baseUrl}/indicators/${indicatorId}/posts`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });
    response = await response.json();
    return response;
});

// DELETE POST
export const deletePost = createAsyncThunk('posts/deletePost', async({ indicatorId, postId }) => {
    try {
        let response = await fetch(`${baseUrl}/indicators/${indicatorId}/posts/${postId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
});


const sascieSlice = createSlice({
    name: 'sascie',
    initialState,
    reducers: {
        setSascieData: (state, action) => {
            const { user } = action.payload;
            
            // Store id, name and service areas on the programs object.
            const programs = user?.programs.map(program => ({
                _id: program._id,
                name: program.name,
                serviceAreas: program.serviceAreas.map(serviceArea => ({
                    _id: serviceArea._id,
                    name: serviceArea.name
                })) || []
            })) || [];

            // Store id, name and items on the service areas object.
            const serviceAreas = user?.programs?.map(program => program.serviceAreas).flat(1)
            .map(serviceArea => ({
                _id: serviceArea._id,
                name: serviceArea.name,
                items: serviceArea.items,
            })) || [];

            // Store id, name, startsAt, endsAt and indicators on the items object.
            const items =  user?.programs?.map(program => program.serviceAreas).flat(1)
                                          .map(serviceArea => serviceArea.items).flat(1)
            .map(item => ({
                _id: item._id,
                name: item.name,
                startDate: item.startDate,
                endDate: item.endDate,
                executions: item.executions
            }));

            // Store executions on the executions object.
            const executions =  user?.programs?.map(program => program.serviceAreas).flat(1)
                                               .map(serviceArea => serviceArea.items).flat(1)
                                               .map(item => item.executions).flat(1)
            .map(execution => ({
                _id: execution._id,
                metric: execution.metric,
                status: execution.status,
                indicators: execution.indicators,
                lastUpdatedBy: execution.lastUpdatedBy,
                lastUpdatedAt: execution.lastUpdatedAt,
                required: execution.required,
            }));

            // Store indicators on the indicators object.
            const indicators = user?.programs?.map(program => program.serviceAreas).flat(1)
                                              .map(serviceArea => serviceArea.items).flat(1)
                                              .map(item => item.executions).flat(1)
                                              .map(execution => execution.indicators).flat(1)
            .map(indicator => ({
                _id: indicator._id,
                description: indicator.description,
                status: indicator.status,
                posts: indicator.posts
            }));
            
            // Store indicators on the indicators object.
            const posts = user?.programs?.map(program => program.serviceAreas).flat(1)
                                         .map(serviceArea => serviceArea.items).flat(1)
                                         .map(item => item.executions).flat(1)
                                         .map(execution => execution.indicators).flat(1)
                                         .map(indicator => indicator.posts).flat(1)
            .map(post => ({
                _id: post._id,
                comment: post.comment,
                lastUpdatedAt: post.lastUpdatedAt,
                createdBy: post.createdBy
            }));

            // Set state accordingly.
            state.programs = programs;
            state.serviceAreas = serviceAreas;
            state.items = items;
            state.executions = executions;
            state.indicators = indicators;
            state.posts = posts;
        }
    },
    extraReducers:  builder => {
        builder
            // PROGRAM REDUCERS
            // UPDATE PROGRAM
            .addCase(updateProgram.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    const { doc: updatedProgram, serviceAreaIds } = action.payload.data;

                    // Add the service area to the program if it exists.
                    if(serviceAreaIds.length !== 0) {
                        const program = state.programs.find(program => program._id === updatedProgram._id);
                        program.serviceAreas = state.serviceAreas.filter(serviceArea => serviceAreaIds.includes(serviceArea._id));
                        // Replace the current program with the updated program in the program state.
                        state.programs = [...state.programs.filter(program => program._id !== updatedProgram._id), program];
                    } else {
                        // Replace the current program with the updated program in the program state.
                        state.programs = [...state.programs.filter(program => program._id !== updatedProgram._id), updatedProgram];
                    }
                }
            })

            // SERVICE AREA REDUCERS

            // ADD SERVICE AREA
            .addCase(addServiceArea.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    let { serviceArea } = action.payload.data;
                    const { programId } = action.payload.data;

                    // Add the new service area to the "program" state if a program was provided.
                    if(programId) {
                        const program = state.programs.find(program => program._id === programId);
                        program.serviceAreas = program.serviceAreas.concat(serviceArea);
                    }

                    // If the service area has items attached to it, turn those item ids into item objects.
                    if(serviceArea.items.length !== 0) {
                        serviceArea.items = serviceArea.items.map(item => state.items.find(stateItem => stateItem._id === item));
                    }

                    // Add the new service are to the "serviceAreas" state.
                    state.serviceAreas = [...state.serviceAreas, serviceArea];
                }
            })

            // DELETE SERVICE AREA
            .addCase(deleteServiceArea.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    const { programId } = action.payload.data;
                    const { serviceAreaId } = action.payload.data;

                    // Remove the service area from the redux state store "programs"
                    const program = state.programs.find(program => program._id === programId);
                    program.serviceAreas = program.serviceAreas.filter(serviceArea => serviceArea._id !== serviceAreaId);
                    
                    // Remove the service area from the redux state store "serviceAreas"
                    state.serviceAreas = state.serviceAreas.filter(serviceArea => serviceArea._id !== serviceAreaId);
                }
            })

            // UPDATE SERVICE AREA
            .addCase(updateServiceArea.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    const { newServiceArea } = action.payload.data;

                    // Filter out the old service area from the "programs" state and add the new service area.
                    const program = state.programs.find(program => program.serviceAreas?.filter(serviceArea => serviceArea._id === newServiceArea._id));
                    program.serviceAreas = [...program.serviceAreas?.filter(serviceArea => serviceArea._id !== newServiceArea._id), newServiceArea];

                    // If the service area has items attached to it, turn those item ids into item objects.
                    if(newServiceArea.items.length !== 0) {
                        newServiceArea.items = newServiceArea.items.map(item => state.items.find(stateItem => stateItem._id === item));
                    }

                    // Filter out the old service area from the "serviceArea" state and add the new service area.
                    state.serviceAreas = [...state.serviceAreas.filter(serviceArea => serviceArea._id !== newServiceArea._id), newServiceArea];
                }
            })

            // ITEM REDUCERS

            // ADD ITEM
            .addCase(addItem.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    const { item } = action.payload.data;
                    const { serviceAreaId } = action.payload.data;
                    
                    // Add the new item to the "serviceAreas" state if a service area was provided.
                    if(serviceAreaId) {
                        const serviceArea = state.serviceAreas.find(serviceArea => serviceArea._id === serviceAreaId);
                        serviceArea.items = serviceArea.items.concat(item);
                    }

                    // Repeat add function if item has execution ids array.
                    if(item.executions.length !== 0) {
                        item.executions = item.executions.map(execution => state.executions.find(stateExecution => stateExecution._id === execution));
                    }

                    // Add the new item to the "items" state.
                    state.items = [...state.items, item];
                }
            })

            // DELETE ITEM
            .addCase(deleteItem.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    const { itemId, serviceAreaId } = action.payload.data;

                    // remove the item from the "serviceArea" state
                    if(serviceAreaId) {
                        const serviceArea = state.serviceAreas.find(serviceArea => serviceArea._id === serviceAreaId);
                        serviceArea.items = serviceArea.items.filter(item => item._id !== itemId);
                    }
                    
                    // remove the item from the "item" state
                    state.items = state.items.filter(item => item._id !== itemId);
                }
            })

            // UPDATE ITEM
            .addCase(updateItem.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    const { doc: updatedItem } = action.payload.data;

                    // Replace the item in the "serviceArea" state.
                    const serviceArea = state.serviceAreas.find(serviceArea => serviceArea.items.find(item => item._id === updatedItem._id));
                    serviceArea.items = [...serviceArea.items.filter(item => item._id !== updatedItem._id), updatedItem];

                    // Replace the item in the "item" state.
                    state.items = [...state.items.filter(item => item._id !== updatedItem._id), updatedItem];
                }
            })

            // EXECUTION REDUCERS
            .addCase(addExecution.fulfilled, (state, action) => {
                const { execution } = action.payload.data;

                // If the service area has items attached to it, turn those item ids into item objects.
                if(execution.indicators.length !== 0) {
                    execution.indicators = execution.indicators.map(indicator => state.indicators.find(stateIndicator => stateIndicator._id === indicator));
                }

                if(action.payload.status === 'success') {
                    state.executions = [...state.executions, execution]
                }
            })

            // DELETE EXECUTION
            .addCase(deleteExecution.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    const { itemId, executionId } = action.payload.data;

                    // remove the indicator from the "executions" state if an executionId was provided.
                    if(itemId) {
                        const item = state.items.find(item => item._id === itemId);
                        item.executions = item.executions.filter(execution => execution._id !== executionId);
                    }
                    
                    
                    // remove the item from the "indicators" state
                    state.executions = state.executions.filter(execution => execution._id !== executionId);
                }
            })


            // INDICATOR REDUCERS
            // ADD INDICATOR
            .addCase(addIndicator.fulfilled, (state, action) => {
                const { indicator } = action.payload.data;

                if(action.payload.status === 'success') {
                    state.indicators = [...state.indicators, action.payload.data.indicator]
                }
            })

            .addCase(updateIndicator.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    const { updatedIndicator } = action.payload.data;

                    // Replace the indicator in the execution state.
                    const execution = state.executions.find(execution => execution.indicators.find(stateIndicator => stateIndicator._id === updatedIndicator._id));
                    execution.indicators = [...execution.indicators.filter(indicator => indicator._id !== updatedIndicator._id), updatedIndicator];

                    // Replace the indicator in the indicator state.
                    state.indicators = [...state.indicators.filter(indicator => indicator._id !== updatedIndicator._id), updatedIndicator]
                }
            })
            
            // DELETE INDICATOR
            .addCase(deleteIndicator.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    const { executionId, indicatorId } = action.payload.data;

                    // remove the indicator from the "executions" state if an executionId was provided.
                    if(executionId) {
                        const execution = state.executions.find(execution => execution._id === executionId);
                        execution.indicators = execution.indicators.filter(indicator => indicator._id !== indicatorId);
                    }
                    
                    
                    // remove the item from the "indicators" state
                    state.indicators = state.indicators.filter(indicator => indicator._id !== indicatorId);
                }
            })


            // POST REDUCERS
            .addCase(addPost.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    const { updatedPost, indicatorId } = action.payload.data;

                    // If an indicatorID was returned, update the indicator in the redux state.
                    if(indicatorId) {
                        const indicator = state.indicators.find(indicator => indicator._id === indicatorId);
                        indicator.posts = [...indicator.posts, updatedPost];
                    }

                    // Add the post to the posts state object.
                    state.posts = [...state.posts, updatedPost];
                }
            })

            // DELETE POST
            .addCase(deletePost.fulfilled, (state, action) => {
                if(action.payload.status === 'success') {
                    const { indicatorId, postId } = action.payload.data;

                    // remove the indicator from the "executions" state if an executionId was provided.
                    if(indicatorId) {
                        const indicator = state.indicators.find(indicator => indicator._id === indicatorId);
                        indicator.posts = indicator.posts.filter(post => post._id !== postId);
                    }
                    
                    
                    // remove the item from the "indicators" state
                    state.posts = state.posts.filter(post => post._id !== postId);
                }
            })
    }
});

// Selectors
export const getAllPrograms = state => state.sascie.programs;
export const getAllServiceAreas = state => state.sascie.serviceAreas;
export const getAllItems = state => state.sascie.items;
export const getAllExecutions = state => state.sascie.executions;
export const getAllIndicators = state => state.sascie.indicators;
export const getAllPosts = state => state.sascie.posts;

// Actions
export const { setSascieData } = sascieSlice.actions;

// Reducer
export default sascieSlice.reducer;