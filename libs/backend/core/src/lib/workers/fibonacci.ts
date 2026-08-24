// WHAT: Worker threads execute CPU-bound JavaScript away from the HTTP event loop.
import { Worker } from 'node:worker_threads';

// SECURITY: This constant source contains no interpolated caller input.
const workerSource = `
  const { parentPort, workerData } = require('node:worker_threads');
  function fibonacci(n) {
    return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
  }
  parentPort.postMessage(fibonacci(workerData));
`;

// WHAT: Expose one bounded promise-based CPU capability to HTTP composition.
export function fibonacciInWorker(input: number, timeoutMs = 5_000) {
  return new Promise<number>((resolve, reject) => {
    // BOUNDARY: Copy the validated number into a new worker's isolated context.
    const worker = new Worker(workerSource, { eval: true, workerData: input });
    // WHY: Bound abandoned or pathological CPU work.
    const timeout = setTimeout(() => {
      void worker.terminate();
      reject(new Error('Worker timed out'));
    }, timeoutMs);

    worker.once('message', (result: number) => {
      // WHAT: Prevent the timeout from racing a successful result.
      clearTimeout(timeout);
      resolve(result);
    });
    worker.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}