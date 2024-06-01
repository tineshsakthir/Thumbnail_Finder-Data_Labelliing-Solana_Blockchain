import z from 'zod' ; 

const createTaskInput = z.object({
    options : z.array(z.object({
        imageUrl : z.string()  
    })),
    signature : z.string() , // amount should be taken from the signature, so it is not send from the client while posting the task
    title : z.string(),
})

// Todo : send the type of task from the user, like if the task is thumbail , then user sends task type as thumbnail, or the task type as data labelling

export {createTaskInput} 