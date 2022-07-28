import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import usersReducer from '../features/users/usersSlice';
import authReducer from '../features/auth/authSlice';
import sascieReducer from '../features/sascie/sascieSlice';

const rootReducer = combineReducers({
    users: usersReducer,
    auth: authReducer,
    sascie: sascieReducer,
})

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
  

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }),
})

export const persistor = persistStore(store);



// export const store = configureStore({
//     reducer: {
//         users: usersReducer,
//         auth: authReducer,
//         sascie: sascieReducer,
//     }
// })