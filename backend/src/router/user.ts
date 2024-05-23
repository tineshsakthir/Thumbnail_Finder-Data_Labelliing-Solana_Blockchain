import { Router } from "express";
const router = Router() ; 

import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware";

import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient() ;
import dotenv from "dotenv";

dotenv.config() ; 
const JWT_SECRET = process.env.JWT_SECRET ;


import {S3Client} from '@aws-sdk/client-s3'

import {createPresignedPost} from '@aws-sdk/s3-presigned-post'

// const s3Client

router.post('/signin',async (req,res)=>{
    // Task : add sing verification logic here with the actual wallet 
    const hardCodedWalletAddress = "0x1f136fD6e434dC12Eeb71A8c195cde45B5E448F9" ;

    const user = await prismaClient.user.upsert({
      create: {
        // ... data to create a User
        address : hardCodedWalletAddress ,
      },
      update: {
        // ... in case it already exists, update
      },
      where: {
        // ... the filter for the User we want to update
        address : hardCodedWalletAddress ,
      }
    }) ;

    
    const token = jwt.sign({
        userId : user.id 
        // @ts-ignore
    }, JWT_SECRET) ; 

    res.json({
        token
    }) ;


})

router.get('/presignedUrl' ,authMiddleware , async (req,res)=>{

})


export default router ; 