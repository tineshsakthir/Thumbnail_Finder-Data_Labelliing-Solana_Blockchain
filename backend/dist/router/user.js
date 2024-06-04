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
const express_1 = require("express");
const router = (0, express_1.Router)();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = require("../middleware");
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const USER_JWT_SECRET = process.env.USER_JWT_SECRET;
const bucketName = process.env.BUCKET_NAME; // Getting bucket name from environment variables
const bucketRegion = process.env.BUCKET_REGION; // Getting bucket region from environment variables
const accessKey = process.env.ACCESS_KEY; // Getting AWS access key from environment variables
const secretAccessKey = process.env.SECRET_ACCESS_KEY; // Getting AWS secret access key from environment variables
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const types_1 = require("../types/types");
// create s3Client here,
// @ts-ignore
const s3Client = new client_s3_1.S3Client({
    credentials: {
        // Providing AWS credentials
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion, // Setting AWS region
});
router.get('/task', middleware_1.userAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // No error due to the types/espress.d.ts configuration
    const userId = req.userId;
    const taskId = (_a = req.query.taskId) !== null && _a !== void 0 ? _a : "1";
    const task = yield prismaClient.task.findUnique({
        where: {
            userId: Number(userId),
            id: Number(taskId)
        }
    });
    if (!task) {
        return res.json({
            "message": "You don't have access to this task"
        });
    }
    const result = {};
    // Here , just initializing all the options with 0 as their chosen count
    const options = yield prismaClient.options.findMany({
        where: {
            task_id: Number(taskId),
        }
    });
    options.forEach(option => {
        result[option.id] = {
            count: 0,
            image_url: option.image_url
        };
    });
    // Updating the result with the actual chosen count
    const submissions = yield prismaClient.submission.findMany({
        where: {
            task_id: Number(taskId),
        },
        select: {
            option_id: true
        }
    });
    submissions.forEach(submission => {
        result[submission.option_id].count++;
    });
    res.json({ result, taskId: taskId });
}));
router.post('/task', middleware_1.userAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    console.log("At request Body \n\n");
    console.log(req.body);
    const parsed = types_1.createTaskInput.safeParse(req.body);
    if (!parsed.success) {
        console.log("Invalid body format for options and signature");
        return res.status(411).json({
            message: "Invalid body format for options and signature"
        });
    }
    const response = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        const response = yield tx.task.create({
            data: {
                title: (_b = parsed.data.title) !== null && _b !== void 0 ? _b : "",
                //Now hard coded, but in the future it should be taken from the signature
                amount: "1",
                signature: parsed.data.signature,
                userId: Number.parseInt(userId),
                // Todo : here i am hard coding the number of target workers, but this should be changed as below 
                //        1. The target worker count should not be got from the user, it should be got from the 
                target_worker_count: 4,
                remaining_workers: 4
            }
        });
        console.log(response);
        yield tx.options.createMany({
            data: parsed.data.options.map(option => {
                return {
                    option_number: option.option_number,
                    image_url: option.imageUrl,
                    task_id: response.id
                };
            })
        });
        return response;
    }));
    return res.json({
        id: response.id
    });
}));
router.get('/presignedUrl', middleware_1.userAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const { url, fields } = yield (0, s3_presigned_post_1.createPresignedPost)(s3Client, {
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
    });
    // These fields are headers while posting the image from the client to the aws s3 bucket,
    // All the headers are need to be in the correct order
    // The image should be referred by the name "file" only
    console.log({ url, fields });
    res.json({ url, fields });
}));
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Task : add sing verification logic here with the actual wallet 
    const hardCodedWalletAddress = "0x1f136fD6e434dC12Eeb71A8c195cde45B5E448F9";
    const user = yield prismaClient.user.upsert({
        create: {
            // ... data to create a User
            address: hardCodedWalletAddress,
        },
        update: {
        // ... in case it already exists, update
        },
        where: {
            // ... the filter for the User we want to update
            address: hardCodedWalletAddress,
        }
    });
    const token = jsonwebtoken_1.default.sign({
        userId: user.id
        // @ts-ignore
    }, USER_JWT_SECRET);
    res.json({
        token
    });
}));
exports.default = router;
