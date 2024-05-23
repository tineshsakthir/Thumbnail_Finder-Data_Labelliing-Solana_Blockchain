"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const authMiddleware = (req, res, next) => {
    var _a;
    const authToken = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
    if (authToken == "") {
        res.status(401).json({
            message: "Unauthorized"
        });
    }
    try {
        // @ts-ignore
        const decode = jsonwebtoken_1.default.verify(authToken, JWT_SECRET);
        // @ts-ignore 
        if (!decode.userId) {
            throw new Error("Invalid Token");
        }
        // @ts-ignore
        req.userId = decode.userId;
        console.log(decode.userId);
        next();
    }
    catch (err) {
        res.status(401).json({
            message: "Cannot decode and verify the token"
        });
    }
};
exports.authMiddleware = authMiddleware;
