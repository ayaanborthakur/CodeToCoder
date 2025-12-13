// services/pyodideService.ts

export interface PyodideCallbacks {
    onOutput: (text: string) => void;
    onError: (text: string) => void;
    onInput?: (prompt: string, callback: (value: string) => void) => void;
}

let worker: Worker | null = null;
let currentCallbacks: PyodideCallbacks | null = null;
let isInitialized = false;

// Initialize the worker
export const initializePyodide = async () => {
    if (worker) return;

    worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url));

    worker.postMessage({ type: 'init' });

    worker.onmessage = (event) => {
        const { type, text, error } = event.data;

        if (type === 'ready') {
            console.log("Pyodide Worker Ready");
            isInitialized = true;
        } else if (type === 'output') {
             if (currentCallbacks?.onOutput) {
                 currentCallbacks.onOutput(text);
             }
        } else if (type === 'error') {
            if (currentCallbacks?.onError) {
                currentCallbacks.onError(error);
            }
        } else if (type === 'done') {
            console.log("Execution finished");
        }
    };

    // Listen for Service Worker Input Requests (bridged via window event in index.html)
    window.addEventListener('pyodide-input-request', (e: any) => {
        const { id, prompt } = e.detail;
        
        if (currentCallbacks?.onInput) {
            currentCallbacks.onInput(prompt, (value) => {
                // Send response back to Service Worker
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'PYODIDE_INPUT_RESPONSE',
                        id,
                        value
                    });
                }
            });
        }
    });
};

export const runPythonCode = async (
    code: string, 
    callbacks?: PyodideCallbacks
): Promise<{ success: boolean; output: string }> => {
    
    await initializePyodide();
    currentCallbacks = callbacks || null;
    
    // Legacy Promise support
    let fullOutput = "";
    
    return new Promise((resolve) => {
        const originalOnOutput = currentCallbacks?.onOutput;
        const originalOnError = currentCallbacks?.onError;
        
        currentCallbacks = {
            ...callbacks,
            onOutput: (text) => {
                fullOutput += text;
                if (originalOnOutput) originalOnOutput(text);
            },
            onError: (err) => {
                 fullOutput += `\nError: ${err}`;
                 if (originalOnError) originalOnError(err);
            },
            onInput: callbacks?.onInput
        };
        
        // We need to hook into the existing worker's onmessage to resolve the promise
        // This is a bit tricky with a global worker.
        // We can add a temporary listener.
        const msgHandler = (event: MessageEvent) => {
            const { type, error } = event.data;
            if (type === 'done') {
                worker?.removeEventListener('message', msgHandler);
                resolve({ success: true, output: fullOutput });
            } else if (type === 'error') {
                worker?.removeEventListener('message', msgHandler);
                resolve({ success: false, output: fullOutput + `\n${error}` });
            }
        };
        
        worker?.addEventListener('message', msgHandler);
        
        worker?.postMessage({ type: 'run', code });
    });
};

export const sendInputToWorker = (text: string) => {
    // This is handled by the callback in runPythonCode -> SW postMessage
    // But if called externally:
    console.warn("sendInputToWorker is deprecated. Input flow is handled via callbacks.");
};

