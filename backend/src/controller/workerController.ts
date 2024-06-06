import { PrismaClient } from "@prisma/client";
import { TOTAL_DECIMAL } from "../config";

const prismaClient = new PrismaClient();

export const getWorkerBalance = async (workerId : number) => {
    const balance = await prismaClient.balance.findFirst({
        where : {
            worker_id : workerId 
        }
    })
    
    return balance
}

export const getNextTask = async (workerId: number) => {
    const task = await prismaClient.$transaction(async tx => {
        const tasksDoneByWorker = await tx.submission.findMany({
            select: {
                task_id: true
            },
            where: {
                worker_id: workerId
            }
        })

        console.log("TasksDoneByWorker : ", tasksDoneByWorker);

        const taskIdsDoneByWorker = tasksDoneByWorker.map(task => task.task_id)

        const taskToWorker = await tx.task.findFirst({
            where: {
                id: {
                    notIn: taskIdsDoneByWorker
                },
                remaining_workers : {
                    gt : 0
                }
            }
        })

        console.log("TaskIdsDoneByWorker : ", taskIdsDoneByWorker);


        if (!taskToWorker) {
            return ({
                taskFetch: "failure",
                message: "No task available at the movement. Come back later bro!!!"
            })
        }

        // Todo : Not just check whether the task in not already done by the current user, but also check whether the task has been completed its working limit for the given money by the user
        // Because showing the thumbnail to the extra workers will casue loss to the company money


        // The above is done, but need to work on things like,  sync when the worker gets the request, but not submitted it


        // need to work on things like, 

        // when the remaining_worker = 1 for a task, at that time,consider we have given the task to three people

        // All the three will submit the task, so this is loss to the company, 

        // SO we have to update the remaining_worker whilte giving the task to the worker itself

        // But what if the worker did not submit the task(This will cause the loss to the user)

        

        const options = await tx.options.findMany({
            where: {
                task_id: taskToWorker.id
            }
        })

        console.log("Options : ", options);

        return {
            taskFetch: "success",
            title: taskToWorker.title,
            taskId: taskToWorker.id,
            remainingWorker : taskToWorker.remaining_workers ,
            options,
        }
    })
    return task;
}



export const submitTask = async (currentTaskOfWorker: any, parsed: any, workerId : number) => {

    const submission = await prismaClient.$transaction(async (tx) => {

        const task = await tx.task.findFirst({
            where : {
                id : currentTaskOfWorker.taskId
            }
        })

        if(!task){
            return null ;
        }

        console.log(0.001 / TOTAL_DECIMAL) ; 

        const submission = await tx.submission.create({
            data : {
                amount : ((task.amount/TOTAL_DECIMAL) / task.target_worker_count ) * TOTAL_DECIMAL ,
                option_id : parsed.data.option_id , 
                task_id : parsed.data.taskId ,
                worker_id : workerId
            }
        })

        await tx.task.update({
            where : {
                id : task.id
            },
            data : {
                remaining_workers : {
                    decrement : 1
                }
            }
        })


        await tx.balance.update({
            where : {
                worker_id : workerId
            },
            data : {
                pending_amount : {
                    increment : submission.amount
                }
            }
        })

        return submission ; 

    })

    return submission ;
}



export const signInWorker = async (hardCodedWalletAddress : string) => {
    const worker = await prismaClient.$transaction(async tx => {
        const worker = await tx.worker.upsert({
            create: {
                // ... data to create a Worker
                address: hardCodedWalletAddress,
            },
            update: {
                // ... in case it already exists, update
            },
            where: {
                // ... the filter for the Worker we want to update
                address: hardCodedWalletAddress,
            }
        });

        await tx.balance.upsert({
            create: {
                worker_id: worker.id,
                locked_amount: 0 * TOTAL_DECIMAL ,
                pending_amount: 0 * TOTAL_DECIMAL
            }, update: {

            }, where: {
                worker_id: worker.id
            }
        })
        return worker;
    })

    return worker ; 
}


