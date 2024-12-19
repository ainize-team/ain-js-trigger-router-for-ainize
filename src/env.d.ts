declare namespace NodeJS {
  interface ProcessEnv {
    BLOCKCHAIN_NETWORK: '1' | '0';
    PRIVATE_KEY: string;
    MODEL_URL: string;
    INFERENCE_URL: string;
    MODEL_NAME: string;
    API_KEY: string;
    PORT?: string;
    // Add more environment variables here
  }
}