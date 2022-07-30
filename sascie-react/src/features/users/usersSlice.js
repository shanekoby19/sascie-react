import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

console.log("Process Environment: ", process.env);
const baseUrl = process.env.NODE_ENV === 'production' ? `http://oneacelerosascie${process.env.REACT_APP_PROD_PORT}/api/v1/users` : `http://localhost:${process.env.REACT_APP_DEV_PORT}/api/v1/users`;
console.log('Base URL: ', baseUrl);

const initialState = {
    users: [],
    status: 'idle',
    error: null,
}

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
    try {
        let response = await fetch(`${baseUrl}`, {
            credentials: 'include'
        });
        response = await response.json();

        // Sort the array of users by their first name.
        response.data.docs.sort((user1, user2) => user1.firstName.localeCompare(user2.firstName));
        return response;
    } catch(err) {
        return err.message;
    }
});

export const addUser = createAsyncThunk('users/addUser', async(body) => {
    try {
        let response = await fetch(`${baseUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include'
        })
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
})

export const updateUser = createAsyncThunk('users/updateUser', async({userId, updatedUser}) => {
    try {
        let response = await fetch(`${baseUrl}/${userId}`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'PATCH',
            credentials: 'include',
            body: JSON.stringify(updatedUser),
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
})

export const deleteUser = createAsyncThunk('users/deleteUser', async(userId) => {
    try {
        let response = await fetch(`${baseUrl}/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
})

export const updateMe = createAsyncThunk('users/updateMe', async(formData) => {
    try {
        let response = await fetch(`${baseUrl}/me`, {
            method: 'PATCH',
            body: formData,
            credentials: 'include',
        });
        response = await response.json();
        return response;
    } catch(err) {
        return err;
    }
})

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUsersError(state, action) {
            state.error = action.payload;
        }
    },
    extraReducers(builder) {
        builder
        .addCase(fetchUsers.pending, (state, action) => {
            state.status = 'pending';
        })
        .addCase(fetchUsers.fulfilled, (state, action) => {
            state.status = 'fulfilled';
            if(action.payload.status === 'success') {
                state.users = action.payload.data.docs.map(user => ({...user, checked: false}));
            } else {
                state.error = action.payload.error;
            }
            state.status = 'idle';
        })
        .addCase(addUser.pending, (state, action) => {
            state.status = 'pending';
        })
        .addCase(addUser.fulfilled, (state, action) => {
            state.status = 'fulfilled';
            if(action.payload.status === 'success') {
                state.users.push(action.payload.data.doc)
            } else {
                state.error = action.payload.error;
            }
            state.status = 'idle';
        })
        .addCase(updateUser.pending, (state, action) => {
            state.status = 'pending';
        })
        .addCase(updateUser.fulfilled, (state, action) => {
            state.status = 'fulfilled';
            if(action.payload.status === 'success') {
                // es6 object destructing with renaming.
                const updatedUser = action.payload.data.doc;
                state.users = state.users.filter(user => user._id !== updatedUser._id);
                state.users.push(updatedUser);
            } else {
                state.error = action.payload.error;
            }
            state.status = 'idle';
        })
        .addCase(deleteUser.pending, (state, action) => {
            state.status = 'pending';
        })
        .addCase(deleteUser.fulfilled, (state, action) => {
            state.status = 'fulfilled';
            if(action.payload.status === 'success') {
                const { updatedUser } = action.payload.data;
                state.users = state.users.filter(user => user._id !== updatedUser._id);
                state.users.push(updatedUser);
            } else {
                state.error = action.payload.error;
            }
            state.status = 'idle';
        })
        .addCase(updateMe.pending, (state, action) => {
            state.status = 'pending';
        })
        .addCase(updateMe.fulfilled, (state, action) => {
            state.status = 'fulfilled';
            if(action.payload.status === 'success') {
                const { updatedUser } = action.payload.data;
                state.users = state.users.filter(user => user._id !== updatedUser._id);
                state.users.push(updatedUser);
                state.currentUser = action.payload.data.updatedUser;
            } else {
                state.error = action.payload.error;
            }
            state.status = 'idle';
        })
    },
});

export const getAllUsers = state => state.users.users;
export const getUsersStatus = state => state.users.status;
export const getUsersError = state => state.users.error;
export const getUserById = (state, userId) => state.users.users.find(user => user._id === userId)

export const { setUsersError } = usersSlice.actions;

export default usersSlice.reducer;