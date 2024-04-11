import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv'; 
import AinModule from './ain';
import Middleware from './middlewares/middleware';
import { extractDataFromServiceRequest } from './utils/extractor';
import { handleDeposit, handleRequest } from './internal';
import { RESPONSE_STATUS } from '@ainize-team/ainize-js/dist/types/type';
dotenv.config();
const privateKey = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : '';
const chainId = parseInt(process.env.BLOCKCHAIN_NETWORK ? process.env.BLOCKCHAIN_NETWORK : '1');
const port = process.env.PORT ? process.env.PORT : '8000';
const ainModule = new AinModule();
if (chainId != 0 && chainId != 1) {
  throw new Error('Invalid chain Id.');
}
ainModule.initAin(chainId, privateKey);
const middleware = new Middleware();
const app: Express = express();
app.use(express.json());

app.post('/service',
  middleware.blockchainTriggerFilter,
  async (req: Request, res: Response) => {
  const { appName, requestData, requestKey } = extractDataFromServiceRequest(req);
  console.log("service requestKey: ", requestKey);
  try{
    const service = await ainModule.getService(appName);
    const amount = 0.1;
    console.log(appName, requestData, amount);
    // TODO: connect with TGI
    const responseData = await "TODO";
    await handleRequest(req, amount, RESPONSE_STATUS.SUCCESS, responseData);
  }catch(e) {
    // TODO: replace handleRequest
    // await ainize.internal.handleRequest(req, 0, RESPONSE_STATUS.FAIL,'error');
    console.log('error: ',e);
    res.send('error');
  }
});

app.post('/deposit',
  middleware.blockchainTriggerFilter,
  async (req: Request, res:Response) => {
  console.log("deposit");
  try{ 
    const result = await handleDeposit(req);
    console.log(result);
  }catch(e) {
    console.log('error: ',e);
    res.send('error');
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});