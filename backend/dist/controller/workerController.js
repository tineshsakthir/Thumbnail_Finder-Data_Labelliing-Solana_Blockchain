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
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInWorker = exports.submitTask = exports.getNextTask = exports.getWorkerBalance = void 0;
const client_1 = require("@prisma/client");
const config_1 = require("../config");
const prismaClient = new client_1.PrismaClient();
const getWorkerBalance = (workerId) => __awaiter(void 0, void 0, void 0, function* () {
    const balance = yield prismaClient.balance.findFirst({
        where: {
            worker_id: workerId
        }
    });
    return balance;
});
exports.getWorkerBalance = getWorkerBalance;
const getNextTask = (workerId) => __awaiter(void 0, void 0, void 0, function* () {
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
                },
                remaining_workers: {
                    gt: 0
                }
            }
        });
        console.log("TaskIdsDoneByWorker : ", taskIdsDoneByWorker);
        if (!taskToWorker) {
            return ({
                taskFetch: "failure",
                message: "No task available at the movement. Come back later bro!!!"
            });
        }
        // Todo : Not just check whether the task in not already done by the current user, but also check whether the task has been completed its working limit for the given money by the user
        // Because showing the thumbnail to the extra workers will casue loss to the company money
        // The above is done, but need to work on things like,  sync when the worker gets the request, but not submitted it
        // need to work on things like, 
        // when the remaining_worker = 1 for a task, at that time,consider we have given the task to three people
        // All the three will submit the task, so this is loss to the company, 
        // SO we have to update the remaining_worker whilte giving the task to the worker itself
        // But what if the worker did not submit the task(This will cause the loss to the user)
        const options = yield tx.options.findMany({
            where: {
                task_id: taskToWorker.id
            }
        });
        console.log("Options : ", options);
        return {
            taskFetch: "success",
            title: taskToWorker.title,
            taskId: taskToWorker.id,
            remainingWorker: taskToWorker.remaining_workers,
            options,
        };
    }));
    return task;
});
exports.getNextTask = getNextTask;
const submitTask = (currentTaskOfWorker, parsed, workerId) => __awaiter(void 0, void 0, void 0, function* () {
    const submission = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const task = yield tx.task.findFirst({
            where: {
                id: currentTaskOfWorker.taskId
            }
        });
        if (!task) {
            return null;
        }
        console.log(0.001 / config_1.TOTAL_DECIMAL);
        const submission = yield tx.submission.create({
            data: {
                amount: ((task.amount / config_1.TOTAL_DECIMAL) / task.target_worker_count) * config_1.TOTAL_DECIMAL,
                option_id: parsed.data.option_id,
                task_id: parsed.data.taskId,
                worker_id: workerId
            }
        });
        yield tx.task.update({
            where: {
                id: task.id
            },
            data: {
                remaining_workers: {
                    decrement: 1
                }
            }
        });
        yield tx.balance.update({
            where: {
                worker_id: workerId
            },
            data: {
                pending_amount: {
                    increment: submission.amount
                }
            }
        });
        return submission;
    }));
    return submission;
});
exports.submitTask = submitTask;
const signInWorker = (hardCodedWalletAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const worker = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield tx.balance.upsert({
            create: {
                worker_id: worker.id,
                locked_amount: 0 * config_1.TOTAL_DECIMAL,
                pending_amount: 0 * config_1.TOTAL_DECIMAL
            }, update: {}, where: {
                worker_id: worker.id
            }
        });
        return worker;
    }));
    return worker;
});
exports.signInWorker = signInWorker;
