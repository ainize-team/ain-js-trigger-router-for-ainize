import express, { Express, Request, Response } from 'express';
import Ain from "@ainblockchain/ain-js";
import dotenv from 'dotenv';
import { RESPONSE_STATUS } from '@ainize-team/ainize-js/dist/types/type';
import { getBlockChainEndpoint } from './constants';
dotenv.config();
const privateKey = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : '';
const chainId = parseInt(process.env.BLOCKCHAIN_NETWORK ? process.env.BLOCKCHAIN_NETWORK : '1');
const port = process.env.PORT ? process.env.PORT : '8000';
const app: Express = express();
app.use(express.json());

const blockchainEndpoint = getBlockChainEndpoint(chainId);
const ain = new Ain(blockchainEndpoint, chainId);
ain.wallet.setDefaultAccount(privateKey);

app.post('/service',
  blockchainTriggerFilter,
  async (req: Request, res: Response) => {
  const { appName, requestData, requestKey } = ainize.internal.getDataFromServiceRequest(req);
  console.log("service requestKey: ", requestKey);
  try{
    const service = await ainize.getService(appName);
    const amount = 0.1;
    console.log(appName, requestData, amount);
    await ainize.internal.handleRequest(req, amount, RESPONSE_STATUS.SUCCESS, responseData);
  }catch(e) {
    await ainize.internal.handleRequest(req, 0, RESPONSE_STATUS.FAIL,'error');
    console.log('error: ',e);
    res.send('error');
  }
});

app.post('/deposit',
  ainize.middleware.triggerDuplicateFilter,
  async (req: Request, res:Response) => {
  console.log("deposit");
  try{ 
    const result = await ainize.internal.handleDeposit(req);
    console.log(result);
  }catch(e) {
    console.log('error: ',e);
    res.send('error');
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});