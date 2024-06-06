import { Router } from "express";
const router = Router();

import jwt from "jsonwebtoken";
import { userAuthMiddleware } from "../middleware";

import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();



import dotenv from "dotenv";

dotenv.config();
const USER_JWT_SECRET = process.env.USER_JWT_SECRET ; 


const bucketName = process.env.BUCKET_NAME; // Getting bucket name from environment variables
const bucketRegion = process.env.BUCKET_REGION; // Getting bucket region from environment variables
const accessKey = process.env.ACCESS_KEY; // Getting AWS access key from environment variables
const secretAccessKey = process.env.SECRET_ACCESS_KEY; // Getting AWS secret access key from environment variables


import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { createSignInInput, createTaskInput } from "../types/types";
import { TOTAL_DECIMAL } from "../config";

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


router.get('/task', userAuthMiddleware, async (req, res) => {
  // No error due to the types/espress.d.ts configuration
  const userId = req.userId;
  const taskId = req.query.taskId?? "1";

  const task = await prismaClient.task.findUnique({
    where: {
      userId: Number(userId),
      id: Number(taskId)
    }
  })


  if (!task) {
    return res.json({
      "message": "You don't have access to this task"
    })
  }



const result : Record< number | string , { count: number, image_url: string }> = {}
 
  // Here , just initializing all the options with 0 as their chosen count
  const options = await prismaClient.options.findMany({
    where: {   
      task_id: Number(taskId),
    }
  })
  
   options.forEach(option => {
      result[option.id] = {
        count : 0 ,
        image_url : option.image_url
      }
   })


   // Updating the result with the actual chosen count

   const submissions = await prismaClient.submission.findMany({
    where : {
      task_id : Number(taskId) , 
    },
    select : {
      option_id : true 
    }
   })


   submissions.forEach( submission => {
    result[submission.option_id].count ++ ; 
   })

   res.json({result , taskId : taskId}) ; 

})





router.post('/task', userAuthMiddleware, async (req, res) => {


  // @ts-ignore

  const userId: string = req.userId;

  console.log("At request Body \n\n")
  console.log(req.body) ; 

  const parsed = createTaskInput.safeParse(req.body);

  if (!parsed.success) {
    console.log("Invalid body format for options and signatures") ; 
    return res.status(411).json({
      message: "Invalid body format for options and signature"
    })
  }

  const response = await prismaClient.$transaction(async tx => {
    const response = await tx.task.create({
      data: {
        title: parsed.data.title?? "",
        //Now hard coded, but in the future it should be taken from the signature
        amount: 1 * TOTAL_DECIMAL,
        signature: parsed.data.signature,
        userId: Number.parseInt(userId),
        // Todo : here i am hard coding the number of target workers, but this should be changed as below 
        //        1. The target worker count should not be got from the user, it should be got from the 
        target_worker_count : 4,
        remaining_workers : 4
      }
    })
    console.log(response);

    await tx.options.createMany({
      data: parsed.data.options.map(option => {
        return {
          option_number : option.option_number ,
          image_url: option.imageUrl,
          task_id: response.id
        }
      })
    })


    return response;
  })
  return res.json({
    id: response.id
  })
})

router.get('/presignedUrl', userAuthMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const { url, fields } = await createPresignedPost(s3Client, {
    // @ts-ignore
    Bucket: bucketName,
    // @ts-ignore

    Key: `thumnail_picker_data_labeller_solana_blockchain/${userId}/${Math.random()}/image.jpg`,
    Conditions: [
      ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
    ],
    Fields: {
      'Content-Type': 'image/png'
    },
    Expires: 3600
  })
  // These fields are headers while posting the image from the client to the aws s3 bucket,
  // All the headers are need to be in the correct order
  // The image should be referred by the name "file" only
  console.log({ url, fields })
  res.json({ url, fields })
})




router.post('/signin', async (req, res) => {
  // Task : add signIn verification logic here with the actual wallet 
  const hardCodedWalletAddress = "0x1f136fD6e434dC12Eeb71A8c195cde45B5E448F9";


  const parsedData = createSignInInput.safeParse(req.body);

  if(!parsedData.success) {
    return res.status(400).json({
      status : "failure" , 
      message  : "Invalid request body format for sign In as a user"
    })
  }


  const user = await prismaClient.user.upsert({
    create: {
      // ... data to create a User
      address: parsedData.data.walletAddress ,
    },
    update: {
      // ... in case it already exists, update
    },
    where: {
      // ... the filter for the User we want to update
      address: parsedData.data.walletAddress ,
    }
  });


  const token = jwt.sign({
    userId: user.id
    // @ts-ignore
  }, USER_JWT_SECRET);

  res.json({
    token
  });


})



export default router;