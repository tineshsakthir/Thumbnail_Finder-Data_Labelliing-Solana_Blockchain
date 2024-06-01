import express from "express";

declare global {
    namespace Express {
        interface Request {
            workerId? : number,
            userId? : string
        }
    }
}



// After this do a change 