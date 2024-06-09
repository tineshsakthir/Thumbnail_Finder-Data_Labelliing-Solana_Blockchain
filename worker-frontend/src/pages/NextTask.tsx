import React, { useState } from 'react'
import { useEffect } from 'react';

import { useCookies } from 'react-cookie';
import { BACKEND_URL, CLOUDFRONT_URL } from '../configuration/config';
import axios from 'axios';

const NextTask = () => {

  const [cookies] = useCookies(['worker_access_token']);

  interface Task {
    taskFetch: string;
    title: string;
    taskId: number;
    remainingWorker: number;
    options: {
      id: number;
      option_number: number;
      image_url: string;
      task_id: number;
    }[];
  }


  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setLoading] = useState(true);



  const fetchTask = async () => {
    const res = await fetch(`${BACKEND_URL}/worker/nextTask`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${cookies.worker_access_token}`
      }
    }
    );
    const data = await res.json();
    setTask(data);  
    setLoading(false) ;
  }

  useEffect(() => {
    fetchTask()
  }, [])


  const submitTask = async (option_id: number, option_number : number) => {
    const response = await axios.post(`${BACKEND_URL}/worker/submission`, {
      taskId: task?.taskId,
      option_id: option_id,
      option_number : option_number

    }, {
      headers: {
        'Authorization': `${cookies.worker_access_token}`
      }
    });

    if(response.data.submissionStatus == "success"){
      fetchTask();
    }else{
      alert("Something Fishy. Task not submitted!!!!")
    }

    console.log(response.data) ; 
  }
    

  if(isLoading){
    return <div>
      Loading....
    </div>
  }

    else {
    return (
    <div 
    className='bg-pink-500 min-h-screen flex flex-col items-center justify-center gap-4 p-4 border-2 border-gray-300 rounded-lg '
    >
      {task && task.taskFetch === "success" ? (
        <div
        className='bg-slate-500 p-16 '>
          <h1 className='bg-pink-500 text-center'>{task.title}</h1>
          <div 
          className='bg-green-500'
      
          >
            {task.options.map((option) => (
              <div key={option.id} 
              className='flex flex-col items-center justify-center gap-4 p-4 border-2 border-gray-300 rounded-lg cursor-pointer'
              onClick={()=>{submitTask(option.id, option.option_number)}}
              >
                <h1>Option Number : {option.option_number}</h1>
                <img src={CLOUDFRONT_URL+"/"+option.image_url} alt="Option" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <h1>No Task Found.Come Back Later.................</h1>
      )}
    </div>
  )
  }

  
}

export default NextTask