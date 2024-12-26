// import React from 'react';
import type { PathRouteProps } from 'react-router-dom';

// const Studio = React.lazy(() => import('@/routes/_main/studio'));
// const Dashboard = React.lazy(() => import('@/routes/_main/dashboard'));
// const Record = React.lazy(() => import('@/routes/_main/record'));
// const Login = React.lazy(() => import('@/app/pages/(auth)/login'));
// const Profile = React.lazy(() => import('@/routes/_main/profile'));
// const Admin = React.lazy(() => import('@/routes/_main/admin'));



export const RouteData = {
  Studio: {
    path: '/transcription',
    title: 'Studio',
  },
  Dashboard: {
    path: '/',
    title: 'Dashboard',
  },
  Record: {
    path: '/draft',
    title: 'Record',
  },
  Login: {
    path: '/login',
    title: 'Login',
  },
  Profile: {
    path: '/profile',
    title: 'Profile',
  },
  Admin: {
    path: '/admin',
    title: 'Admin',
  },
};

export const routes: PathRouteProps[] = [
  {
    path: '/admin',
    element: <></>,
  },
];

export const privateRoutes: PathRouteProps[] = [
  {
    path: '/transcription/:id',
    element:  <></>,
  },
  {
    path: '/draft/:id',
    element:  <></>,
  },
  {
    path: '/draft',
    element:  <></>,
  },
  {
    path: '/profile',
    element:  <></>,
  },

  {
    path: '/login',
    element:  <></>,
  },


  {
    path: '/',
    element: <></>,
  },
];
