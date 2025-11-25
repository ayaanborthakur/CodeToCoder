import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(),svgr({
            svgrOptions: {
                // This entire block runs the 'prefixIds' SVGO plugin
                svgoConfig: {
                    plugins: [
                        {
                            name: 'prefixIds',
                            params: {
                                // Setting this to 'svg-id' ensures every ID is unique
                                prefix: 'svg-id', 
                                // You can omit the 'prefix' if you just want a random unique hash
                            },
                        },
                    ],
                },
            },
        })],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      
    };
});