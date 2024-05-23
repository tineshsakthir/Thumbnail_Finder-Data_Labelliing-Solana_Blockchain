import { Router } from "express";
const router = Router() ; 

import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware";

import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient() ;
import dotenv from "dotenv";

dotenv.config() ; 
const JWT_SECRET = process.env.JWT_SECRET ;

const bucketName = process.env.BUCKET_NAME; // Getting bucket name from environment variables
const bucketRegion = process.env.BUCKET_REGION; // Getting bucket region from environment variables
const accessKey = process.env.ACCESS_KEY; // Getting AWS access key from environment variables
const secretAccessKey = process.env.SECRET_ACCESS_KEY; // Getting AWS secret access key from environment variables


import {S3Client} from '@aws-sdk/client-s3'
import {createPresignedPost} from '@aws-sdk/s3-presigned-post'

// create s3Client here,

// @ts-ignore
const s3Client = new S3Client({
    credentials: {
      // Providing AWS credentials
      accessKeyId: accessKey,
      secretAccessKey: secretAccessKey,
    },
    region: bucketRegion, // Setting AWS region
  });

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
    // @ts-ignore
    const userId = req.userId ;
    const { url, fields } = await createPresignedPost(s3Client, {
        // @ts-ignore
        Bucket: bucketName,
        // @ts-ignore
         
        Key:`thumnail_picker_data_labeller_solana_blockchain/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
          ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Fields: {
          'Content-Type': 'image/png'
        },
        Expires: 3600
      })
      
      console.log({ url, fields })
      res.json({url,fields})
})





export default router ;