export interface Option {
    id: number;
    option_number: number;
    image_url: string;
    task_id: number;
  }
  
  export interface Task {
    taskFetch: string;
    title: string;
    taskId: number;
    remainingWorker: number;
    options: Option[];
  }