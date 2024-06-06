"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignInInput = exports.createSumbmissionInput = exports.createTaskInput = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createTaskInput = zod_1.default.object({
    options: zod_1.default.array(zod_1.default.object({
        option_number: zod_1.default.number(),
        imageUrl: zod_1.default.string()
    })),
    signature: zod_1.default.string(), // amount should be taken from the signature, so it is not send from the client while posting the task
    title: zod_1.default.string(),
});
exports.createSumbmissionInput = zod_1.default.object({
    taskId: zod_1.default.number(),
    option_number: zod_1.default.number(),
    option_id: zod_1.default.number()
});
exports.createSignInInput = zod_1.default.object({
    walletAddress: zod_1.default.string()
});
// Todo : send the type of task from the user, like if the task is thumbail , then user sends task type as thumbnail, or the task type as data labelling
