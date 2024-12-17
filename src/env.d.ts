declare namespace NodeJS {
  interface ProcessEnv {
    BLOCKCHAIN_NETWORK: '1' | '0';
    PRIVATE_KEY: string;
    MODEL_URL: string;
    INFERENCE_URL: string;
    MODEL_NAME: string;
    API_KEY: string;
    PORT?: string;
      // 다른 환경 변수를 여기에 정의
  }
}