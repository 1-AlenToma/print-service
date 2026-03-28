// printQueue.js
const queue = [];
let isProcessing = false;

export const addJob = (jobFn) => {
    return new Promise((resolve, reject) => {
        queue.push({ jobFn, resolve, reject });
        processQueue();
    });
};

const processQueue = async () => {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;

    const { jobFn, resolve, reject } = queue.shift();
    try {
        const result = await jobFn();
        resolve(result);
    } catch (err) {
        reject(err);
    } finally {
        isProcessing = false;
        processQueue();
    }
};