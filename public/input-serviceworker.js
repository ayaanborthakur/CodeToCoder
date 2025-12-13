// public/input-serviceworker.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

const resolvers = new Map();

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Intercept the special input URL
  if (url.pathname === '/pyodide-input') {
    event.respondWith(
      new Promise(async (resolve) => {
        // Generate a unique ID for this request
        const id = crypto.randomUUID();
        const prompt = url.searchParams.get('prompt') || '';
        
        // Store the resolver to be called when the client replies
        resolvers.set(id, resolve);
        
        // Notify all window clients that we need input
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        windows.forEach(client => {
          client.postMessage({
            type: 'PYODIDE_INPUT_REQUEST',
            id,
            prompt
          });
        });
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PYODIDE_INPUT_RESPONSE') {
    const { id, value } = event.data;
    const resolve = resolvers.get(id);
    
    if (resolve) {
      resolve(new Response(value, { status: 200 }));
      resolvers.delete(id);
    }
  }
});
