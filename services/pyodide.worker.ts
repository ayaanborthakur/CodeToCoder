/// <reference lib="webworker" />

import { loadPyodide } from 'pyodide';

declare global {
  interface Window {
    pyodide: any;
  }
}

let pyodide: any = null;

// Initialize Pyodide
async function load() {
  try {
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
    });
    
    // redirect stdout/stderr
    await pyodide.runPythonAsync(`
      import sys
      import io
      
      class JSStream:
          def __init__(self, type):
              self.type = type
              
          def write(self, text):
              import json
              # Use pyodide's js module to call the worker's postMessage
              import js
              js.postMessage(js.Object.fromEntries([
                  ("type", "output"), 
                  ("stream", self.type), 
                  ("text", text)
              ]))
              return len(text)
              
          def flush(self):
              pass

      sys.stdout = JSStream("stdout")
      sys.stderr = JSStream("stderr")
    `);

    // Define custom input function using SharedArrayBuffer and Atomics
    // We bind this to the global scope so executed code can use it
    const inputHandler = (promptText: string = '') => {
      // 1. Send request to main thread
      self.postMessage({ type: 'input_request', prompt: promptText });

      // 2. Create a buffer for synchronization
      // We expect the main thread to send back a SharedArrayBuffer via a separate message path
      // OR we can't really receive it *inside* this synchronous function call easily without
      // complex setup.
      
      // ALTERNATIVE: Protocol Design
      // The worker needs `sharedBuffer` and `sharedBufferParams` BEFORE calling input.
      // But we can just use the global scope to store a buffer shared at init time?
      
      // Let's rely on a shared buffer established at initialization or updated occasionally.
      // But for simplicity, let's assume the main thread has ALREADY set up a buffer 
      // and passed it to the worker.
    };

    // Actually, passing the buffer *into* the python call is hard.
    // Better approach: 
    // The main thread creates a SharedArrayBuffer.
    // Sends it to the worker during initialization.
    // The worker stores it globally.
    // The Python `input` function uses `Atomics.wait` on this buffer.
    
    self.postMessage({ type: 'ready' });
  } catch (err: any) {
    self.postMessage({ type: 'error', error: err.message });
  }
}

// State for input handling
let sharedBuffer: Int32Array | null = null;
let sharedDataBuffer: Uint8Array | null = null;

self.onmessage = async (event) => {
  const { type, code, buffer, dataBuffer } = event.data;

  if (type === 'init') {
    sharedBuffer = new Int32Array(buffer);
    sharedDataBuffer = new Uint8Array(dataBuffer);
    await load();
  } else if (type === 'run') {
    if (!pyodide) {
        self.postMessage({ type: 'error', error: "Pyodide not loaded yet" });
        return;
    }
    
    try {
      // Register the input function dynamically to ensure access to closure variables
      pyodide.registerJsModule("js_input_handler", {
        getInput: (promptText: string) => {
            if (!sharedBuffer || !sharedDataBuffer) {
                return ""; // Should not happen if init was called
            }
            
            // 1. Notify main thread we are waiting
            self.postMessage({ type: 'input_request', prompt: promptText });
            
            // 2. Wait
            // Index 0: Status (0=idle, 1=input_ready)
            // We wait until index 0 becomes 1
            Atomics.wait(sharedBuffer, 0, 0);
            
            // 3. Read data
            // First 4 bytes (int32) of dataBuffer could be length, followed by utf-8 bytes
            // BUT Atomics.wait is on Int32Array. 
            // sharedBuffer[0] is our flag.
            // sharedBuffer[1] can be the length of the string.
            
            const length = sharedBuffer[1];
            const textBytes = sharedDataBuffer.slice(0, length);
            const decoder = new TextDecoder();
            const text = decoder.decode(textBytes);
            
            // 4. Reset flag
            Atomics.store(sharedBuffer, 0, 0);
            
            return text;
        }
      });
      
      await pyodide.runPythonAsync(`
        import js_input_handler
        
        def input(prompt=""):
            return js_input_handler.getInput(str(prompt))
            
        __builtins__.input = input
      `);

      await pyodide.runPythonAsync(code);
      self.postMessage({ type: 'done' });
    } catch (err: any) {
      self.postMessage({ type: 'error', error: err.message });
    }
  }
};
