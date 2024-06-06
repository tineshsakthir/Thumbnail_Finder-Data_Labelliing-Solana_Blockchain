import z from 'zod' ; 

export const createTaskInput = z.object({
    options : z.array(z.object({
        option_number : z.number() ,
        imageUrl : z.string()  
    })),
    signature : z.string() , // amount should be taken from the signature, so it is not send from the client while posting the task
    title : z.string(),
})

export const createSumbmissionInput = z.object({
    taskId : z.number() , 
    option_number : z.number(),
    option_id : z.number()
})

export const createSignInInput = z.object({
    walletAddress : z.string()
})


// Todo : send the type of task from the user, like if the task is thumbail , then user sends task type as thumbnail, or the task type as data labelling

