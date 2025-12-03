import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig(() => {
    // NOTE: loadEnv is no longer strictly necessary if you only needed it for the 'define' block,
    // but we'll keep it here just in case you use 'env' elsewhere.

    return {
        // Sets the base path to relative, which is often needed for static site deployments
        base: '/',
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        preview: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [
            react(),
            svgr({
                svgrOptions: {
                    svgoConfig: {
                        plugins: [
                            {
                                name: 'prefixIds',
                                params: {
                                    prefix: 'svg-id',
                                },
                            },
                        ],
                    },
                },
            })
        ],
        build: {
            rollupOptions: {
                input: {
                    // Main entry point (the only HTML file that exists)
                    main: resolve(__dirname, 'index.html'),
                    // NOTE: You only have one HTML file (index.html) because this is an SPA.
                    // React Router handles all navigation client-side.
                    // To add more entries, you would need to create separate HTML files
                    // and convert this to a true MPA, which would break React Router.
                    // For example (if you had multiple HTML files):
                    // dashboard: resolve(__dirname, 'dashboard.html'),
                    // classroom: resolve(__dirname, 'classroom.html'),
                },
            },
        },
        // The 'define' block has been removed, as the VITE_ prefix handles
        // environment variable exposure automatically.
    };
});