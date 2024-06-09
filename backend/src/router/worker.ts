import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
const prismaClient = new PrismaClient();
const router = Router();

import dotenv from "dotenv";
import { workerAuthMiddleware } from "../middleware";

import { createSignInInput, createSumbmissionInput } from "../types/types";

dotenv.config();
const WORKER_JWT_SECRET = process.env.WORKER_JWT_SECRET ;

import { getNextTask, getWorkerBalance, signInWorker, submitTask } from "../controller/workerController";
import { TOTAL_DECIMAL } from "../config";

router.get('/payout', workerAuthMiddleware, async (req,res) => {

    const workerId = req.workerId ;

    /**
     * Todo : 
     * 1. Create a transaction signature using web3.js
     * 1. make changes in the db (worker balance(pending to locked), log in payouts )
     * 2. Send that transaction over the blockchain
     * 
     * 
     * #important
     * 
     * 1. need to lock the table while doing payouts, because the worker can bambard the table and can get more than one payouts for the single amount
     * 
     * So need to learn to lock the table, and need to lock the table at this place itself, i think prisma can't do this, need to do this with the raw sql queries.....
     */


    // 1
    const hardCodedTrancSign = "hardcoded Transaction Signature" ; 

    const worker = await prismaClient.worker.findFirst({
        where : {
            id : workerId 
        }
    })

    if(!worker){
        return res.status(400).json({
            message : "WOrker not exists" , 
            file : "worker.ts/payouts" 
        })
    }

    
    // 2
    const payout = await prismaClient.$transaction(async (tx)=>{

        const balance = await tx.balance.findFirst({
            where : {
                worker_id : worker.id
             }
        })

        if(!balance){
            return res.status(400).json({
                message : "balance not exists" , 
                file : "worker.ts/payouts" 
            })
        }

        if(balance.pending_amount == 0){
            return res.status(400).json({
                message : "you don't have any many to pull off" , 
                file : "worker.ts/payouts" 
            })
        }
        
        await tx.balance.update({
            where : {
                worker_id : worker.id
            },
            data : {
                pending_amount : 0*TOTAL_DECIMAL, 
                locked_amount : balance.pending_amount
            }
        })

        const payout = await tx.payouts.create({
            data : {
                worker_id : worker.id ,
                amount : balance.pending_amount , 
                status : "Processing" , 
                signature : hardCodedTrancSign
            }
        })
        return payout ; 
    })

    
    // Now send the transaction ove the blockchiain , evev if it fails then no problem 
    // , we will eventually check that and with the help pf the worker threads and we will retake the amount to the administrator account
    
    return res.status(200).json({
        payout 
    })


})



router.get('/balance' , workerAuthMiddleware , async (req,res) => {
    const workerId = req.workerId ; 

    // if(!workerId) {
    //     return res.json({
    //         file : "worker.ts",
    //         message : "Worker not comming here does not exist" 
    //     })
    // }

    const balance = await getWorkerBalance(Number(workerId)) ; 
    if(!balance){
        return res.json({
            file : "worker.ts",
            message : "Balance does not exist" 
        })
    }
    res.json(balance) ; 

})


router.post('/submission' , workerAuthMiddleware,  async (req,res) => {
    
    const workerId = req.workerId ; 

    const parsed = createSumbmissionInput.safeParse(req.body) ; 

    if (!parsed.success) {
        console.log("Invalid body format for options and signatures") ; 
        return res.status(411).json({
          message: "Invalid body format for options and signature"
        })
      }

    const currentTaskOfWorker = await getNextTask(Number(workerId)) ;

    if(currentTaskOfWorker.taskId != parsed.data.taskId){
        return res.status(200).json({
            submissionStatus : "failed" , 
            message : "This is not the Task which you are supposed to submit"
        })
    }

    const submission = await submitTask(currentTaskOfWorker, parsed, Number(workerId) ) ; 

    if(!submission){
        return res.status(200).json({
            submissionStatus : "failed" , 
            message : "Such task does not found in the db"
        })
    }
    return res.status(200).json({
        submissionStatus : "success" , 
        submission
    })

})

router.get('/nextTask', workerAuthMiddleware, async (req: Request, res: Response) => {
  // No error due to the types/espress.d.ts configuration
    const workerId = req.workerId;
    const task = await getNextTask(Number(workerId))  ;
    return res.json(task) ; 
})

router.post('/signin', async (req: Request, res: Response) => {
    // Task : add sing verification logic here with the actual wallet  : Done
    // const hardCodedWalletAddress = "0x1f136fD6e434dC12Eeb71A8c195cde45B5E448F9worker";



    const parsedData = createSignInInput.safeParse(req.body);
    if(!parsedData.success) {
        return res.status(400).json({
          status : "failure" , 
          message  : "Invalid request body format for sign In as a worker"
        })
      }

    const returnedWorker = await signInWorker(parsedData.data.walletAddress) ; 

    const token = jwt.sign({
        workerId: returnedWorker.id
        // @ts-ignore
    }, WORKER_JWT_SECRET);

    res.json({
        token
    });
})



export default router; 