
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

### Connect your inference service.

To integrate your AI service, modify `src/inference.ts`. This file allows you to process the incoming data, format it appropriately, and send requests to your inference service.
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

## Example: Connecting Llama 3.1
For an example setup, refer to the code provided in the repository. It demonstrates how to configure a connection to Llama 3.1, an AI model offered by Ainize for free.
```JS
export const inference = async (req: Request): Promise<any> =>{
  const { 
    appName, 
    requesterAddress,
    requestData, 
    requestKey 
  } = extractDataFromModelRequest(req);

  ////// Insert your AI Service's Inference Code. //////
  const modelName = process.env.MODEL_NAME as string; // http://101.202.37.10:8000/v1/chat/completions
  const inferenceUrl = process.env.INFERENCE_URL as string; // meta-llama/Llama-3.2-11B-Vision-Instruct
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
