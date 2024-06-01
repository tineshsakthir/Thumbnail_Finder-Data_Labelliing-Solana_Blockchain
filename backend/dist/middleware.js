"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerAuthMiddleware = exports.userAuthMiddleware = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const USER_JWT_SECRET = process.env.USER_JWT_SECRET;
const WORKER_JWT_SECRET = process.env.WORKER_JWT_SECRET;
const userAuthMiddleware = (req, res, next) => {
    const authToken = req.headers.authorization;
    if (!authToken) {
        res.status(401).json({
            message: "Unauthorized",
            file: "middleware.ts"
        });
    }
    try {
        // @ts-ignore
        const decode = jsonwebtoken_1.default.verify(authToken, USER_JWT_SECRET);
        // @ts-ignore 
        if (!decode.userId) {
            throw new Error("Invalid Token or You are not a user");
        }
        // @ts-ignore
        req.userId = decode.userId;
        console.log(decode.userId);
        next();
    }
    catch (err) {
        res.status(401).json({
            message: `${err} : Cannot decode and verify the token`,
            file: "middleware.ts"
        });
    }
};
exports.userAuthMiddleware = userAuthMiddleware;
const workerAuthMiddleware = (req, res, next) => {
    const workerAuthToken = req.headers.authorization;
    if (!workerAuthToken) {
        res.status(401).json({
            messaage: "Unauthorized",
            file: "middleware.ts"
        });
    }
    try {
        // @ts-ignoreeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3b3JrZXJJZCI6MSwiaWF0IjoxNzE3MjIzODIyfQ.LMdXHSM4ZLMHPID0r21eUCAZr_0Nzq6HamLuLKx2QaI
        const decode = jsonwebtoken_1.default.verify(workerAuthToken, WORKER_JWT_SECRET);
        // @ts-ignore 
        if (!decode.workerId) {
            throw new Error("Invalid Token or You are not a worker");
        }
        // @ts-ignore
        req.workerId = decode.workerId;
        console.log(decode.workerId);
        next();
    }
    catch (err) {
        res.status(401).json({
            message: `${err} : Cannot decode and verify the token`,
            file: "middleware.ts"
        });
    }
};
exports.workerAuthMiddleware = workerAuthMiddleware;
