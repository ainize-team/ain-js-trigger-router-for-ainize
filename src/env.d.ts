declare namespace NodeJS {
  interface ProcessEnv {
    BLOCKCHAIN_NETWORK: '1' | '0';
    PRIVATE_KEY: string;
    SERVICE_NAME: string;
    SERVICE_URL: string;
    OLLAMA_URL: string;
    PORT?: string;
      // 다른 환경 변수를 여기에 정의
  }
}