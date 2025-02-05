import express, { Express, Request, Response } from 'express';
import AinModule from './ain';
import Middleware from './middlewares/middleware';
import { handleRequest } from './internal';
import { RESPONSE_STATUS } from '@ainize-team/ainize-js/dist/types/type';
import './config'; // Validate environment variables immediately
import { parseChainId } from './constants';
import { inference } from './inference';

const ainModule = AinModule.getInstance();
ainModule.initAin(parseChainId(process.env.BLOCKCHAIN_NETWORK), process.env.PRIVATE_KEY);
const middleware = new Middleware();
const app: Express = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.post('/model',
  middleware.blockchainTriggerFilter,
  async (req: Request, res: Response) => {
  try {
    const amount = 0;
    const responseData = await inference(req);
    await handleRequest(req, amount, RESPONSE_STATUS.SUCCESS, responseData);
  } catch(e) {
    // TODO: replace handleRequest
    console.log('error: ',e);
    await handleRequest(req, 0, RESPONSE_STATUS.FAIL,'error');
  }
});

//Deprecated
// app.post('/deposit',
//   middleware.blockchainTriggerFilter,
//   async (req: Request, res:Response) => {
//   console.log("deposit");
//   try{ 
//     const result = await handleDeposit(req);
//     console.log(result);
//   }catch(e) {
//     console.log('error: ',e);
//     res.send('error');
//   }
// });

app.post('/test',
  async (req:Request, res:Response) => {
    console.log("test");
    try {
      const result = await inference(req.body.prompt);
      res.send(result)
    } catch(e) {
      console.log('error: ',e);
      res.send('error');
    }
  }
);

app.get('/',
  (req: Request, res: Response) => {
    res.send('health check')
  }
);

app.listen(PORT,() => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
