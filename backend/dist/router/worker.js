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
const types_1 = require("../types/types");
dotenv_1.default.config();
const WORKER_JWT_SECRET = process.env.WORKER_JWT_SECRET;
const workerController_1 = require("../controller/workerController");
const config_1 = require("../config");
router.get('/payout', middleware_1.workerAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workerId = req.workerId;
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
    const hardCodedTrancSign = "hardcoded Transaction Signature";
    const worker = yield prismaClient.worker.findFirst({
        where: {
            id: workerId
        }
    });
    if (!worker) {
        return res.status(400).json({
            message: "WOrker not exists",
            file: "worker.ts/payouts"
        });
    }
    // 2
    const payout = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const balance = yield tx.balance.findFirst({
            where: {
                worker_id: worker.id
            }
        });
        if (!balance) {
            return res.status(400).json({
                message: "balance not exists",
                file: "worker.ts/payouts"
            });
        }
        if (balance.pending_amount == 0) {
            return res.status(400).json({
                message: "you don't have any many to pull off",
                file: "worker.ts/payouts"
            });
        }
        yield tx.balance.update({
            where: {
                worker_id: worker.id
            },
            data: {
                pending_amount: 0 * config_1.TOTAL_DECIMAL,
                locked_amount: balance.pending_amount
            }
        });
        const payout = yield tx.payouts.create({
            data: {
                worker_id: worker.id,
                amount: balance.pending_amount,
                status: "Processing",
                signature: hardCodedTrancSign
            }
        });
        return payout;
    }));
    // Now send the transaction ove the blockchiain , evev if it fails then no problem 
    // , we will eventually check that and with the help pf the worker threads and we will retake the amount to the administrator account
    return res.status(200).json({
        payout
    });
}));
router.get('/balance', middleware_1.workerAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workerId = req.workerId;
    // if(!workerId) {
    //     return res.json({
    //         file : "worker.ts",
    //         message : "Worker not comming here does not exist" 
    //     })
    // }
    const balance = yield (0, workerController_1.getWorkerBalance)(Number(workerId));
    if (!balance) {
        return res.json({
            file: "worker.ts",
            message: "Balance does not exist"
        });
    }
    res.json(balance);
}));
router.post('/submission', middleware_1.workerAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workerId = req.workerId;
    const parsed = types_1.createSumbmissionInput.safeParse(req.body);
    if (!parsed.success) {
        console.log("Invalid body format for options and signatures");
        return res.status(411).json({
            message: "Invalid body format for options and signature"
        });
    }
    const currentTaskOfWorker = yield (0, workerController_1.getNextTask)(Number(workerId));
    if (currentTaskOfWorker.taskId != parsed.data.taskId) {
        return res.status(200).json({
            submissionStatus: "failed",
            message: "This is not the Task which you are supposed to submit"
        });
    }
    const submission = yield (0, workerController_1.submitTask)(currentTaskOfWorker, parsed, Number(workerId));
    if (!submission) {
        return res.status(200).json({
            submissionStatus: "failed",
            message: "Such task does not found in the db"
        });
    }
    return res.status(200).json({
        submissionStatus: "success",
        submission
    });
}));
router.get('/nextTask', middleware_1.workerAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // No error due to the types/espress.d.ts configuration
    const workerId = req.workerId;
    const task = yield (0, workerController_1.getNextTask)(Number(workerId));
    return res.json(task);
}));
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Task : add sing verification logic here with the actual wallet  : Done
    // const hardCodedWalletAddress = "0x1f136fD6e434dC12Eeb71A8c195cde45B5E448F9worker";
    const parsedData = types_1.createSignInInput.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            status: "failure",
            message: "Invalid request body format for sign In as a worker"
        });
    }
    const returnedWorker = yield (0, workerController_1.signInWorker)(parsedData.data.walletAddress);
    const token = jsonwebtoken_1.default.sign({
        workerId: returnedWorker.id
        // @ts-ignore
    }, WORKER_JWT_SECRET);
    res.json({
        token
    });
}));
exports.default = router;
