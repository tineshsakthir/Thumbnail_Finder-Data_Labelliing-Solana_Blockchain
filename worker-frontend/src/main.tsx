import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'


import { createBrowserRouter, Route, RouterProvider, createRoutesFromElements, Navigate } from 'react-router-dom'
import Home from './pages/Home.tsx'
import Layout from './Layout.tsx'
import NextTask from './pages/NextTask.tsx'
import WorkerBalance from './pages/WorkerBalance.tsx'




const router = createBrowserRouter(createRoutesFromElements(
  <Route path='/' element = {<Layout/>}>
    <Route index element={<Navigate to="/worker/home" replace />} />
    <Route path='/worker/home' element= {<Home/>}/>
    <Route path='/worker/next-task' element={<NextTask/>} />
    <Route path='/worker/balance' element={<WorkerBalance/>}/>
  </Route>
))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
