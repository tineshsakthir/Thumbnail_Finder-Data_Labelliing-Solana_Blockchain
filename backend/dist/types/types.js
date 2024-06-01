"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskInput = void 0;
const zod_1 = __importDefault(require("zod"));
const createTaskInput = zod_1.default.object({
    options: zod_1.default.array(zod_1.default.object({
        imageUrl: zod_1.default.string()
    })),
    signature: zod_1.default.string(), // amount should be taken from the signature, so it is not send from the client while posting the task
    title: zod_1.default.string(),
});
exports.createTaskInput = createTaskInput;
