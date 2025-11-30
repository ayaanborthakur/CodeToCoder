
declare global {
    interface Window {
        loadPyodide: any;
        pyodide: any;
    }
}

let pyodideReadyPromise: Promise<any> | null = null;

export const initializePyodide = async () => {
    if (pyodideReadyPromise) return pyodideReadyPromise;

    pyodideReadyPromise = new Promise(async (resolve, reject) => {
        try {
            // Load Pyodide script dynamically
            if (!window.loadPyodide) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                script.async = true;
                script.onload = async () => {
                    try {
                        window.pyodide = await window.loadPyodide();
                        resolve(window.pyodide);
                    } catch (err) {
                        reject(err);
                    }
                };
                script.onerror = (err) => reject(err);
                document.body.appendChild(script);
            } else if (!window.pyodide) {
                window.pyodide = await window.loadPyodide();
                resolve(window.pyodide);
            } else {
                resolve(window.pyodide);
            }
        } catch (error) {
            reject(error);
        }
    });

    return pyodideReadyPromise;
};

export interface PyodideResult {
    success: boolean;
    output: string;
    error?: string;
}

export const runPythonCode = async (code: string): Promise<PyodideResult> => {
    try {
        const pyodide = await initializePyodide();

        // Redirect stdout/stderr to capture output
        pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

        await pyodide.runPythonAsync(code);

        const stdout = pyodide.runPython("sys.stdout.getvalue()");
        const stderr = pyodide.runPython("sys.stderr.getvalue()");

        return {
            success: !stderr,
            output: stdout + (stderr ? `\nError:\n${stderr}` : ''),
            error: stderr || undefined
        };
    } catch (error: any) {
        return {
            success: false,
            output: `Runtime Error:\n${error.message}`,
            error: error.message
        };
    }
};
