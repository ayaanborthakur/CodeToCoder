// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
    // NOTE: loadEnv is no longer strictly necessary if you only needed it for the 'define' block,
    // but we'll keep it here just in case you use 'env' elsewhere.
    const env = loadEnv(mode, '.', ''); 
    
    return {
      // Sets the base path to relative, which is often needed for static site deployments
      base: './', 
      server: {
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
      // The 'define' block has been removed, as the VITE_ prefix handles
      // environment variable exposure automatically.
    };
});