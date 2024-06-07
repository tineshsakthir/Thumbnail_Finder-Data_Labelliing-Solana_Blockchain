import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'


import { createBrowserRouter, Route, RouterProvider, createRoutesFromElements, Navigate } from 'react-router-dom'
import Home from './pages/Home.tsx'
import Layout from './Layout.tsx'
import CreateTask from './pages/CreateTask.tsx'
import TaskInfo from './pages/TaskInfo.tsx'


const router = createBrowserRouter(createRoutesFromElements(
  <Route path='/' element = {<Layout/>}>
    <Route index element={<Navigate to="/user/home" replace />} />
    <Route path='/user/home' element= {<Home/>}/>
    <Route path='/user/create-task' element={<CreateTask/>} />
    <Route path='/user/task-info/:taskId' element={<TaskInfo/>}/>
  </Route>
))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
