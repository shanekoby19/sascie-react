import { Routes, Route } from 'react-router-dom';

import Login from './features/auth/Login';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import UsersList from './features/users/UsersList';
import EditMe from './features/users/EditMe';
import EditUserFormAdmin from './features/users/EditUserFormAdmin';
import AddUserFormAdmin from './features/users/AddUserFormAdmin';
import ForgotPassword from './features/auth/ForgotPassword';
import AdminPage from './features/auth/AdminPage';
import SascieAdmin from './features/sascie/SascieAdmin';
import LibraryAdmin from './features/library/LibraryAdmin';

import SasciePage from './features/sascie_user/SasciePage';
import SascieEntry from './features/sascie_user/entry/SascieEntry';
import Indicator from './features/sascie_user/entry/Indicator';
import SascieReview from './features/sascie_user/review/SascieReview';
import Dashboard from './features/sascie_user/dashboard/Dashboard';

import './App.scss';
import './styles/main.scss';


function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Login />} />
        <Route path="profile" element={<Layout />}>
          <Route index element={ <RequireAuth><EditMe /></RequireAuth> } />
        </Route>
        <Route path="sascie" element={<Layout />}>
        
          <Route path="dashboard">
            <Route index element={
              <RequireAuth>
                <SasciePage Page={Dashboard} name='dashboard'/>
              </RequireAuth>
              } 
            />
          </Route>

          <Route path="entry/indicator">
            <Route path=":indicatorId" element={ <Indicator />} />
          </Route>

        </Route>
        <Route path="admin" element={<Layout />}>
          <Route path="users">
            <Route index element={
              <RequireAuth minimumAuthLevel="admin"> 
                <AdminPage Page={UsersList} name='users' />
              </RequireAuth>} 
            />
            <Route path='add' element={<RequireAuth minimumAuthLevel="admin"><AddUserFormAdmin /></RequireAuth>} />
            <Route path='edit/:userId' element={
              <RequireAuth minimumAuthLevel="admin"> 
                <EditUserFormAdmin />
              </RequireAuth>} 
            />
          </Route>
          <Route path="sascie" element={
            <RequireAuth minimumAuthLevel="admin"> 
              <AdminPage Page={SascieAdmin} name='sascie' />
            </RequireAuth>} 
          />
          <Route path="library" element={
            <RequireAuth minimumAuthLevel="admin"> 
              <AdminPage Page={LibraryAdmin} name='library' />
            </RequireAuth>} 
          />
        </Route>
        <Route path="auth/forgot-password" element={<ForgotPassword />} />
      </Route>
    </Routes>
  );
}

export default App;
