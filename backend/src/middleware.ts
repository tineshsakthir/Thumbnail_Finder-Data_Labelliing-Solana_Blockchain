import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config() ; 

const JWT_SECRET = process.env.JWT_SECRET ; 

const authMiddleware = (req:Request ,res:Response, next:NextFunction)=>{

    const authToken = req.headers.authorization ?? "" ;
    if(authToken == ""){
        res.status(401).json({
            message : "Unauthorized"
        })
    }
    try{
        // @ts-ignore
        const decode = jwt.verify(authToken, JWT_SECRET) ;
        // @ts-ignore 
        if(!decode.userId){
            throw new Error("Invalid Token")
        }
        // @ts-ignore
        req.userId = decode.userId ; 
        console.log(decode.userId) ;
        next() ; 
    }catch(err){
        res.status(401).json({
            message : "Cannot decode and verify the token"
        })
    }
    
}

export {authMiddleware}