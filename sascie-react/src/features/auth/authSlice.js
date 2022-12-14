import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const baseUrl = process.env.NODE_ENV === 'production' ? `/api/v1/auth` : 'http://localhost:5000/api/v1/auth';

const initialState = {
    authUser: null,
    token: null,
    status: 'idle',
    error: null,
}

export const login = createAsyncThunk('auth/login', async ({ email, password }) => {
    try {
        let response = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
});

export const logout = createAsyncThunk('auth/logout', async() => {
    try {
        let response = await fetch(`${baseUrl}/logout`, {
            credentials: 'include',
            method: 'POST',
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
});

export const sendResetToken = createAsyncThunk('auth/sendResetToken', async(email) => {
    try {
        let response = await fetch(`${baseUrl}/send-reset-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email})
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
});

export const getUserProfilePicture = createAsyncThunk('auth/getUserProfilePicture', async(key) => {
    const url = process.env.NODE_ENV === 'production' ? `/api/v1/users/file` : 'http://localhost:5000/api/v1/users/file';

    console.log('key: ', key);

    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                key
            })
        });
        response = await response.json();
        // Get the photo name to store on the authUser object. This will allow us to delete the photo from the AWS bucket.
        response.data.photo = key.split('/').slice(-1);
        return response;
    }
    catch (err) {
        console.log('ERROR: ', err);
    }
});

export const updateAuthUserPhoto = createAsyncThunk('auth/updateAuthUserPhoto', async(formData) => {
    try {
        let response = await fetch('http://localhost:5000/api/v1/users/updateProfilePicture', {
            method: "POST",
            body: formData,
            credentials: 'include',
        });
        response = await response.json();
        return response;
    } catch(err) {
        console.log("ERROR: ", err)
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        deleteAuthUserServiceAreas: (state, action) => {
            const { serviceAreaIds } = action.payload;
            return {
                ...state,
                authUser: {
                    ...state.authUser,
                    programs: state.authUser.programs.map(program => ({
                        ...program,
                        serviceAreas: program.serviceAreas.filter(serviceArea => !serviceAreaIds.includes(serviceArea._id))
                    })),
                    serviceAreas: [...state.authUser.serviceAreas.filter(serviceArea => !serviceAreaIds.includes(serviceArea._id))]
                }
            }
        }, 
        addAuthUserServiceArea: (state, action) => {
            const { programId, serviceArea } = action.payload;

            return {
                ...state,
                authUser: {
                    ...state.authUser,
                    programs: state.authUser.programs.map(program => {
                        if(program._id !== programId) {
                            return program;
                        }
                        return {
                            ...program,
                            serviceAreas: [...program.serviceAreas, serviceArea]
                        }
                    }),
                    serviceAreas: [...state.authUser.serviceAreas, serviceArea]
                }
            }
        },
        updateAuthUserIndicator: (state, action) => {
            const { status, indicatorId } = action.payload;
            const foundProgram = state.authUser.programs.find(program => program.serviceAreas.find(serviceArea => serviceArea.items.find(item => item.executions.find(execution => execution.indicators.find(indicator => indicator._id === indicatorId)))));
            const filteredPrograms = state.authUser.programs.filter(program => program._id !== foundProgram._id);
            
            return {
                ...state,
                authUser: {
                    ...state.authUser,
                    programs: [
                        ...filteredPrograms,
                        {
                            ...foundProgram,
                            serviceAreas: foundProgram.serviceAreas.map(serviceArea => ({
                                ...serviceArea,
                                items: serviceArea.items.map(item => ({
                                    ...item,
                                    executions: item.executions.map(execution => ({
                                        ...execution,
                                        indicators: execution.indicators.map(indicator => {
                                            if(indicator._id !== indicatorId) {
                                                return { ...indicator }
                                            }
                                            return {
                                                ...indicator,
                                                status,
                                            }
                                        })
                                    }))
                                }))
                            }))
                        }
                    ]
                }
            }
        },
        updateAuthUserPost: (state, action) => {
            const { post, indicatorId } = action.payload;
            const foundProgram = state.authUser.programs.find(program => program.serviceAreas.find(serviceArea => serviceArea.items.find(item => item.executions.find(execution => execution.indicators.find(indicator => indicator._id === indicatorId)))));
            const filteredPrograms = state.authUser.programs.filter(program => program._id !== foundProgram._id);
            
            return {
                ...state,
                authUser: {
                    ...state.authUser,
                    programs: [
                        ...filteredPrograms,
                        {
                            ...foundProgram,
                            serviceAreas: foundProgram.serviceAreas.map(serviceArea => ({
                                ...serviceArea,
                                items: serviceArea.items.map(item => ({
                                    ...item,
                                    executions: item.executions.map(execution => ({
                                        ...execution,
                                        indicators: execution.indicators.map(indicator => {
                                            if(indicator._id !== indicatorId) {
                                                return { ...indicator }
                                            }
                                            return {
                                                ...indicator,
                                                posts: indicator.posts.concat(post)
                                            }
                                        })
                                    }))
                                }))
                            }))
                        }
                    ]
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(login.pending, (state, action) => {
            state.status = 'pending';
        })
        .addCase(login.fulfilled, (state, action) => {
            state.status = 'fulfilled';
            if(action.payload.status === 'success') {
                state.token = action.payload.accessToken;
                state.authUser = action.payload.data.user;
                state.status = 'idle';
            } else {
                state.error = action.payload.error;
                state.status = 'error';
            }
        })
        .addCase(logout.pending, (state, action) => {
            state.status = 'pending';
        })
        .addCase(logout.fulfilled, (state, action) => {
            state.status = 'fulfilled';
            if(action.payload.status === 'success') {
                state.token = null;
                state.authUser = null
                state.status = 'idle';
            } else {
                state.error = action.payload.error;
            }
        })
        .addCase(getUserProfilePicture.pending, (state, action) => {
            state.status = 'pending'
        })
        .addCase(getUserProfilePicture.fulfilled, (state, action) => {
            if(action.payload.status === 'success') {
                state.authUser = {
                    ...state.authUser,
                    photo: action.payload.data.photo,
                    imageData: action.payload.data.Body.data,
                    imageContentType: action.payload.data.ContentType,
                }
            }
        })
        .addCase(updateAuthUserPhoto.pending, (state, action) => {
            state.status = 'pending'
        })
        .addCase(updateAuthUserPhoto.fulfilled, (state, action) => {
            if(action.payload.status === 'success') {
                state.authUser = {
                    ...state.authUser,
                    imageData: action.payload.data.Body.data,
                    imageContentType: action.payload.data.ContentType,
                }
            }
        })
    }
});

export const getAuthUser = state => state.auth.authUser;
export const getAuthToken = state => state.auth.token;
export const getAuthStatus = state => state.auth.status;
export const { 
                deleteAuthUserServiceAreas, 
                addAuthUserServiceArea,
                updateAuthUserIndicator,
                updateAuthUserPost,
             } = authSlice.actions;

export default authSlice.reducer;