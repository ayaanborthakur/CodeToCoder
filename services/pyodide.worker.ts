/// <reference lib="webworker" />

// Load Pyodide locally or from CDN if needed (but we prefer CDN for cache)
importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

declare function loadPyodide(config: any): Promise<any>;

let pyodide: any = null;

async function load() {
  try {
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
    });
    
    // Redirect stdout/stderr
    await pyodide.runPythonAsync(`
      import sys
      import io
      import js

      class JSStream:
          def __init__(self, type):
              self.type = type
          
          def write(self, text):
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

    // Implement Blocking Input via Sync XHR
    await pyodide.runPythonAsync(`
      import builtins
      import js
      from pyodide.http import open_url

      def input(prompt=""):
          # We use XMLHttpRequest synchronously via JS to block this thread
          # until the Service Worker returns the user input.
          try:
              xhr = js.XMLHttpRequest.new()
              # We append a random param to avoid caching, though SW handles it
              url = "/pyodide-input?prompt=" + js.encodeURIComponent(str(prompt))
              
              xhr.open("GET", url, False) # False = Synchronous
              xhr.send(None)
              
              if xhr.status == 200:
                  return xhr.responseText
              return ""
          except Exception as e:
              return ""

      builtins.input = input
    `);

    self.postMessage({ type: 'ready' });
  } catch (err: any) {
    self.postMessage({ type: 'error', error: err.message });
  }
}

self.onmessage = async (event) => {
  const { type, code } = event.data;

  if (type === 'init') {
    await load();
  } else if (type === 'run') {
    if (!pyodide) {
      self.postMessage({ type: 'error', error: "Pyodide not ready" });
      return;
    }
    try {
      await pyodide.runPythonAsync(code);
      self.postMessage({ type: 'done' });
    } catch (err: any) {
      self.postMessage({ type: 'error', error: err.message });
    }
  }
};
