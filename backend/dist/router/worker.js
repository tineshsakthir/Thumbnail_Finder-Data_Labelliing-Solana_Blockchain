"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const dotenv_1 = __importDefault(require("dotenv"));
const middleware_1 = require("../middleware");
dotenv_1.default.config();
const WORKER_JWT_SECRET = process.env.WORKER_JWT_SECRET;
router.get('/nextTask', middleware_1.workerAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // No error due to the types/espress.d.ts configuration
    const workerId = req.workerId;
    const task = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const tasksDoneByWorker = yield tx.submission.findMany({
            select: {
                task_id: true
            },
            where: {
                worker_id: workerId
            }
        });
        console.log("TasksDoneByWorker : ", tasksDoneByWorker);
        const taskIdsDoneByWorker = tasksDoneByWorker.map(task => task.task_id);
        const taskToWorker = yield tx.task.findFirst({
            where: {
                id: {
                    notIn: taskIdsDoneByWorker
                }
            }
        });
        console.log("TaskIdsDoneByWorker : ", taskIdsDoneByWorker);
        if (!taskToWorker) {
            return res.json({
                taskFetch: "failure",
                message: "No task available at the movement. Come back later bro!!!"
            });
        }
        // Todo : Not just check whether the task in not already done by the current user, but also check whether the task has been completed its working limit for the given money by the user
        // Because showing the thumbnail to the extra workers will casue loss to the company money
        const options = yield tx.options.findMany({
            where: {
                task_id: taskToWorker.id
            }
        });
        console.log("Options : ", options);
        return {
            taskFetch: "success",
            title: taskToWorker.title,
            options,
        };
    }));
    return res.json(task);
}));
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Task : add sing verification logic here with the actual wallet 
    const hardCodedWalletAddress = "0x1f136fD6e434dC12Eeb71A8c195cde45B5E448F9worker";
    const returnedWorker = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const worker = yield tx.worker.upsert({
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
        const balance = yield tx.balance.upsert({
            create: {
                worker_id: worker.id,
                locked_amount: 0,
                pending_amount: 0
            }, update: {}, where: {
                worker_id: worker.id
            }
        });
        return worker;
    }));
    const token = jsonwebtoken_1.default.sign({
        workerId: returnedWorker.id
        // @ts-ignore
    }, WORKER_JWT_SECRET);
    res.json({
        token
    });
}));
exports.default = router;
