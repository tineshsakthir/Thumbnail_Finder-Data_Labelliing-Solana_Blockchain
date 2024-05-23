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
const JWT_SECRET = process.env.JWT_SECRET;
const bucketName = process.env.BUCKET_NAME; // Getting bucket name from environment variables
const bucketRegion = process.env.BUCKET_REGION; // Getting bucket region from environment variables
const accessKey = process.env.ACCESS_KEY; // Getting AWS access key from environment variables
const secretAccessKey = process.env.SECRET_ACCESS_KEY; // Getting AWS secret access key from environment variables
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
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
    }, JWT_SECRET);
    res.json({
        token
    });
}));
router.get('/presignedUrl', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    console.log({ url, fields });
    res.json({ url, fields });
}));
exports.default = router;
