import { createBrowserRouter } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import Harvester from '../pages/Harvester';
import Closer from '../pages/Closer';
import Brain from '../pages/Brain';
import Manager from '../pages/Manager';
import Collector from '../pages/Collector';
import Compass from '../pages/Compass';
import Settings from '../pages/Settings';
import RescueMyMoney from '../pages/RescueMyMoney';
import LeadPipeline from '../pages/LeadPipeline';
import BroadcastCampaigns from '../pages/BroadcastCampaigns';
import DripSettings from '../pages/DripSettings';

import RoleGuard from '../components/RoleGuard';

const router = createBrowserRouter([
  { path: '/',         element: <Landing /> },
  { path: '/login',    element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard',  element: <RoleGuard allowedRoles={['super_admin', 'owner', 'manager']}><Dashboard /></RoleGuard> },
      { path: '/harvester',  element: <RoleGuard allowedRoles={['super_admin', 'owner', 'manager', 'staff']}><Harvester /></RoleGuard> },
      { path: '/closer',     element: <RoleGuard allowedRoles={['super_admin', 'owner', 'manager', 'staff']}><Closer /></RoleGuard> },
      { path: '/brain',      element: <RoleGuard allowedRoles={['super_admin', 'owner']}><Brain /></RoleGuard> },
      { path: '/manager',    element: <RoleGuard allowedRoles={['super_admin', 'owner', 'manager']}><Manager /></RoleGuard> },
      { path: '/collector',  element: <RoleGuard allowedRoles={['super_admin', 'owner', 'manager']}><Collector /></RoleGuard> },
      { path: '/compass',    element: <RoleGuard allowedRoles={['super_admin', 'owner']}><Compass /></RoleGuard> },
      { path: '/settings',   element: <RoleGuard allowedRoles={['super_admin', 'owner']}><Settings /></RoleGuard> },
      { path: '/asl',        element: <RoleGuard allowedRoles={['super_admin', 'owner', 'manager']}><RescueMyMoney /></RoleGuard> },
      { path: '/leads',      element: <RoleGuard allowedRoles={['super_admin']}><LeadPipeline /></RoleGuard> },
      { path: '/drip-settings', element: <RoleGuard allowedRoles={['super_admin']}><DripSettings /></RoleGuard> },
      { path: '/campaigns',  element: <RoleGuard allowedRoles={['super_admin', 'owner', 'manager']}><BroadcastCampaigns /></RoleGuard> },
    ],
  },
]);

export default router;
