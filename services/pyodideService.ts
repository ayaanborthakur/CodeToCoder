// services/pyodideService.ts

export interface PyodideCallbacks {
    onOutput: (text: string) => void;
    onError: (text: string) => void;
    onInput?: (prompt: string, callback: (value: string) => void) => void; // NOT used for sync input, but useful for UI state
}

let worker: Worker | null = null;
let sharedBuffer: SharedArrayBuffer | null = null;
let sharedDataBuffer: SharedArrayBuffer | null = null;
let int32View: Int32Array | null = null;
let uint8View: Uint8Array | null = null;

// Callbacks for the currently running execution
let currentCallbacks: PyodideCallbacks | null = null;

// Initialize the worker and buffers
export const initializePyodide = async () => {
    if (worker) return;

    worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url));

    // Create SharedBuffers
    // 16 bytes for control (status, length, etc.)
    sharedBuffer = new SharedArrayBuffer(16);
    int32View = new Int32Array(sharedBuffer);
    
    // 1MB buffer for input text data
    sharedDataBuffer = new SharedArrayBuffer(1024 * 1024);
    uint8View = new Uint8Array(sharedDataBuffer);

    worker.postMessage({
        type: 'init',
        buffer: sharedBuffer,
        dataBuffer: sharedDataBuffer
    });

    worker.onmessage = (event) => {
        const { type, text, stream, error, prompt } = event.data;

        if (type === 'ready') {
            console.log("Pyodide Worker Ready");
        } else if (type === 'output') {
             // Differentiate stdout/stderr if needed, but for now just pass text
             if (currentCallbacks?.onOutput) {
                 currentCallbacks.onOutput(text);
             }
        } else if (type === 'error') {
            if (currentCallbacks?.onError) {
                currentCallbacks.onError(error);
            }
        } else if (type === 'done') {
            // Execution finished
            console.log("Execution finished");
        } else if (type === 'input_request') {
             // The worker is WAITING. We need to get input from UI.
             // We can trigger a UI callback here.
             if (currentCallbacks?.onInput) {
                 currentCallbacks.onInput(prompt || "", (userInput: string) => {
                     sendInputToWorker(userInput);
                 });
             }
        }
    };
};

// Helper to write input to the shared buffer and notify worker
export const sendInputToWorker = (text: string) => {
    if (!int32View || !uint8View) return;

    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    
    // 1. Write data length to sharedBuffer[1]
    int32View[1] = bytes.length;
    
    // 2. Write data bytes to sharedDataBuffer
    // Ensure we don't overflow
    if (bytes.length > uint8View.length) {
        console.error("Input too long!");
        // Truncate?
    }
    uint8View.set(bytes.slice(0, uint8View.length));
    
    // 3. Set flag sharedBuffer[0] to 1 (RUNNING/READY)
    Atomics.store(int32View, 0, 1);
    
    // 4. Wake up the worker
    Atomics.notify(int32View, 0);
};


export const runPythonCode = async (
    code: string, 
    callbacks?: PyodideCallbacks
): Promise<{ success: boolean; output: string }> => {
    
    await initializePyodide();
    currentCallbacks = callbacks || null;
    
    // Collect output for the legacy Promise implementation
    // Ideally callers should switch to using callbacks fully
    let fullOutput = "";
    
    return new Promise((resolve) => {
        // Intercept callbacks to build full output for Promise result
        const originalOnOutput = currentCallbacks?.onOutput;
        const originalOnError = currentCallbacks?.onError;
        
        // We set up specific listeners for THIS execution run directly on the worker's onmessage? 
        // No, the global onmessage handler dispatches to 'currentCallbacks'.
        // So we update 'currentCallbacks' to include our accumulation logic.
        
        currentCallbacks = {
            ...callbacks,
            onOutput: (text) => {
                fullOutput += text;
                if (originalOnOutput) originalOnOutput(text);
            },
            onError: (err) => {
                 // For now, treat stderr as output but better
                 fullOutput += `\nError: ${err}`;
                 if (originalOnError) originalOnError(err);
            },
            onInput: callbacks?.onInput // Pass through
        };
        
        // We need a way to detect 'done'. 
        // The worker sends 'done'. We need to hook into that.
        // Let's modify the global onmessage to handle 'done' resolution.
        
        const previousOnMessage = worker!.onmessage;
        
        worker!.onmessage = (event) => {
            const { type, text, error, prompt } = event.data;
            
            if (type === 'done') {
                resolve({ success: true, output: fullOutput });
                // Restore? Maybe not needed if we always overwrite
            } else if (type === 'error') {
                 // Runtime error often comes as 'error' type, then maybe 'done'? 
                 // Or 'error' terminates? assumed implementation in worker calls postMessage('error') then 'done'?
                 // The worker code I wrote sends 'error' OR 'done'.
                 // If error, we should probably resolve too.
                 if (currentCallbacks?.onError) currentCallbacks.onError(error);
                 resolve({ success: false, output: fullOutput + `\n${error}` }); // worker sends error just once
            } else if (type === 'output') {
                if (currentCallbacks?.onOutput) currentCallbacks.onOutput(text);
            } else if (type === 'input_request') {
                if (currentCallbacks?.onInput) {
                    currentCallbacks.onInput(prompt || "", (input) => sendInputToWorker(input));
                }
            }
        };
        
        worker!.postMessage({ type: 'run', code });
    });
};
