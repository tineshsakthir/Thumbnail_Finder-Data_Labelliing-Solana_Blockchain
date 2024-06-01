import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
const prismaClient = new PrismaClient();
const router = Router();

import dotenv from "dotenv";
import { workerAuthMiddleware } from "../middleware";

dotenv.config();
const WORKER_JWT_SECRET = process.env.WORKER_JWT_SECRET;

router.get('/nextTask', workerAuthMiddleware, async (req: Request, res: Response) => {
  // No error due to the types/espress.d.ts configuration
    const workerId = req.workerId;
    const task = await prismaClient.$transaction(async tx => {
        const tasksDoneByWorker =await tx.submission.findMany({
            select: {
                task_id: true
            },
            where: {
                worker_id: workerId
            }
        })

        console.log("TasksDoneByWorker : ", tasksDoneByWorker) ;

        const taskIdsDoneByWorker = tasksDoneByWorker.map(task => task.task_id)

        const taskToWorker = await tx.task.findFirst({
            where : {
                id : {
                   notIn : taskIdsDoneByWorker
                }
            }
        })

        console.log("TaskIdsDoneByWorker : ", taskIdsDoneByWorker) ;


        if(!taskToWorker){
            return res.json({
                taskFetch : "failure", 
                message : "No task available at the movement. Come back later bro!!!"
            })
        }

        // Todo : Not just check whether the task in not already done by the current user, but also check whether the task has been completed its working limit for the given money by the user
        // Because showing the thumbnail to the extra workers will casue loss to the company money

        const options = await tx.options.findMany({
            where : {
                task_id : taskToWorker.id 
            }
        })

        console.log("Options : ", options) ;

        return {
            taskFetch : "success", 
            title : taskToWorker.title , 
            options , 
        }
    })
    
    return res.json(task) ; 


})

router.post('/signin', async (req: Request, res: Response) => {
    // Task : add sing verification logic here with the actual wallet 
    const hardCodedWalletAddress = "0x1f136fD6e434dC12Eeb71A8c195cde45B5E448F9worker";

    const returnedWorker = await prismaClient.$transaction(async tx => {
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

        const balance = await tx.balance.upsert({
            create: {
                worker_id: worker.id,
                locked_amount: 0,
                pending_amount: 0
            }, update: {

            }, where: {
                worker_id: worker.id
            }
        })
        return worker;
    })


    const token = jwt.sign({
        workerId: returnedWorker.id
        // @ts-ignore
    }, WORKER_JWT_SECRET);

    res.json({
        token
    });
})



export default router; 