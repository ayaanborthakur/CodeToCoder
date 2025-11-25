// Replace missing vite/client types with manual definitions for process.env used in the app
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
