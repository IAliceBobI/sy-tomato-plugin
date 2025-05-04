export function measureTime(func: Func, name = "Function"): number {
    const start = performance.now();
    func();
    const end = performance.now();
    const elapsedTime = end - start
    console.info(`${name} took ${elapsedTime} milliseconds to run.`);
    return elapsedTime;
}

// console.time('myFunction');
// myFunction();
// console.timeEnd('myFunction');

/**
    const timer = new Timer();
    myFunction();
    const elapsedTime = timer.stop();
 */
export class Timer {
    private startTime: number;
    private name: string;

    constructor(name = "Function") {
        this.startTime = performance.now();
        this.name = name;
    }

    public stop(): number {
        const endTime = performance.now();
        const elapsedTime = endTime - this.startTime
        console.info(`${this.name} took ${elapsedTime} milliseconds to run.`);
        return elapsedTime;
    }
}