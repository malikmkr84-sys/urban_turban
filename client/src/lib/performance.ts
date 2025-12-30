/**
 * Utility to log performance metrics.
 * Enabled via ENABLE_PERFORMANCE_LOGGING environment variable/flag.
 * Since we can't easily read server env vars in client, we might rely on 
 * a window object flag or build time constant. For now, we'll check localStorage 
 * or a default safe-guard.
 */
export const measurePerformance = (name: string, fn: () => void) => {
    const isEnabled = typeof window !== 'undefined' && localStorage.getItem('ENABLE_PERFORMANCE_LOGGING') === 'true';

    if (!isEnabled) {
        fn();
        return;
    }

    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`[PERF] ${name} executed in ${(end - start).toFixed(2)}ms`);
};

export const wrapPerformance = <T extends (...args: any[]) => any>(name: string, fn: T): T => {
    return ((...args: any[]) => {
        const isEnabled = typeof window !== 'undefined' && localStorage.getItem('ENABLE_PERFORMANCE_LOGGING') === 'true';
        if (!isEnabled) return fn(...args);

        const start = performance.now();
        const result = fn(...args);
        const end = performance.now();

        // Handle promises
        if (result instanceof Promise) {
            return result.then((res) => {
                const asyncEnd = performance.now();
                console.log(`[PERF] ${name} (Async) executed in ${(asyncEnd - start).toFixed(2)}ms`);
                return res;
            });
        }

        console.log(`[PERF] ${name} executed in ${(end - start).toFixed(2)}ms`);
        return result;
    }) as T;
};
