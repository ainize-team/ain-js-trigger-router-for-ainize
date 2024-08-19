import * as dotenv from 'dotenv';

dotenv.config();

function validateEnv() {
    const requiredEnvVars = [
        'PRIVATE_KEY',
        'BLOCKCHAIN_NETWORK',
        'SERVICE_NAME',
        'SERVICE_URL',
        'OLLAMA_URL',
        // 필수 환경변수 입력
    ];

    requiredEnvVars.forEach((key) => {
        if (!process.env[key]) {
            console.error(`Error: Missing required environment variable: ${key}`);
            process.exit(1);
        }
    });
    if (process.env.BLOCKCHAIN_NETWORK != '0' && process.env.BLOCKCHAIN_NETWORK != '1') {
      console.error(`Error: BLOCKCHAIN_NETWORK should be 1 or 0 : ${process.env.BLOCKCHAIN_NETWORK}`);
      process.exit(1);
    }
}

validateEnv();