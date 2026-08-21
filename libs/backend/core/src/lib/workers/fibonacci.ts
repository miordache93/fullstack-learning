import { Worker } from 'node:worker_threads';

const workerSource = `
  const { parentPort, workerData } = require('node:worker_threads');
  function fibonacci(n) {
    return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
  }
  parentPort.postMessage(fibonacci(workerData));
`;

export function fibonacciInWorker(input: number, timeoutMs = 5_000) {
  return new Promise<number>((resolve, reject) => {
    const worker = new Worker(workerSource, { eval: true, workerData: input });
    const timeout = setTimeout(() => {
      void worker.terminate();
      reject(new Error('Worker timed out'));
    }, timeoutMs);

    worker.once('message', (result: number) => {
      clearTimeout(timeout);
      resolve(result);
    });
    worker.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}
