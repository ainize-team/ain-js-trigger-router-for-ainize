
# Ainize Wrapper Server
Ainize wrapper server is an template backend of AI Model deployed by [ainize-js](https://github.com/ainize-team/ainize-js)

## Requirements

node >= 18


## Install

Clone this repository.
```
git clone git@github.com:ainize-team/ainize-wrapper-server.git
```

## Set envs
```JS
BLOCKCHAIN_NETWORK= // mainnet = '1', testnet = '0'. 
PRIVATE_KEY= // App owner's AI Network private key.
INFERENCE_URL= // LLM Inference endpoint.
MODEL_NAME= // Model name.
API_KEY= // API Key to using your model. (optional) 
PORT= // Port number to run this server. (optional, default: 3000)
```
## usage

## Ready to get POST request from AI Network trigger function

A trigger function in AI Network automatically sends POST requests to a specified URL whenever a specific value in the blockchain database changes. For more details, see the [AI Network Docs](https://docs.ainetwork.ai/ain-blockchain/developer-guide/tools/ainize-trigger)

Requests from trigger functions include complex data structures. 
```js
{
  fid: 'function-id',
  function: {
    function_type: 'REST',
    function_url: 'https://function_url.ainetwork.ai/',
    function_id: 'function-id'
  },
  valuePath: [
    'apps',
    'app_name',
    'sub_path',
    '0xaddress...', // Path variable matched with functionPath.
    ...
    ],
  functionPath: [
    'apps',
    'app_name',
    'sub_path',
    '$address', // Path variable name. Start with '$'
    ...
  ],
  value: <ANY_DATA_TO_WRITE_ON_BLOCKCHAIN>,
  ...
  params: {
    address: '0xaddress...' // Path variable.
  },
  ...
  transaction: {
    tx_body: { ... },
    signature: '0xsignature...',
    ...
  },
  ...
}
```

The ainize-wrapper-server simplifies handling these requests with built-in utilities.

### Middle ware to check It is from trigger function.
Use the provided middleware `blockchainTriggerFilter` to verify that a request originates from a trigger function.
```JS
import Middleware from './middlewares/middleware';
const middleware = new Middleware();

app.post(
  ...
  middleware.blockchainTriggerFilter,
  ...
)
```
### Extracting the required datas from the request
Easily extract key data points using helper functions.
```JS
import { extractDataFromModelRequest } from './utils/extractor';

const { 
  appName, 
  requesterAddress,
  requestData, 
  requestKey 
} = extractDataFromModelRequest(req);
```

### Set inference endpoint

위 기능들을 이용하여 trigger function을 통해 들어온 요청을 처리하는 라우터가 `src/index.ts`에 정의되어 있다. Ainize-js 를 통해 배포된 trigger function은 고정적으로 `/model` 에 POST 요청을 보낸다.
```JS
app.post(
  '/model',
  middleware.blockchainTriggerFilter, // Check request is from AI Network.
  async (req: Request, res: Response) => {
    ...
});
```

### Connect your inference service.

받아온 데이터를 당신의 AI Service에 맞춰 가공하고 요청을 보낼 수 있도록 당신은 `src/inference.ts` 를 수정해야한다.
```JS
import { Request } from 'express'

export const inference = async (req: Request): Promise<any> =>{
  const { 
    appName, 
    requesterAddress,
    requestData, 
    requestKey 
  } = extractDataFromModelRequest(req);

  ////// Insert your AI Service's Inference Code. //////

  // return the result
}
```

아래는 ainize에서 무료로 제공하는 llama 3.1을 연결하는 예시코드이다.
```JS
export const inference = async (req: Request): Promise<any> =>{
  const { 
    appName, 
    requesterAddress,
    requestData, 
    requestKey 
  } = extractDataFromModelRequest(req);

  ////// Insert your AI Service's Inference Code. //////
  const modelName = process.env.MODEL_NAME as string;
  const inferenceUrl = process.env.INFERENCE_URL as string;
  const apiKey = process.env.API_KEY as string;

  const prompt = requestData.prompt;

  const response = await fetch(
    inferenceUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    }
  )
  if (!response.ok) {
    throw new Error(`Fail to inference: ${JSON.stringify(await response.json())}`);
  }
  const data = await response.json();

  // return the result
  return data.choices[0].message.content;
}

```
