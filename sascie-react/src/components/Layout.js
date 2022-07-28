import React from 'react';
import { Outlet } from 'react-router-dom';

import Navigation from './Navigation';

const Layout = () => {
  return(
    <div>
      <div className='view'>
          <Navigation />
          <Outlet />
        </div>
    </div>
   )
 }

export default Layout