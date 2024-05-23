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
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
const JWT_SECRET = "tinesh";
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
    }, JWT_SECRET);
    res.json({
        token
    });
}));
exports.default = router;
