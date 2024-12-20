
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
MODEL_URL= // LLM Service endpoint.
INFERENCE_URL= // LLM Inference endpoint.
MODEL_NAME= // Model name.
API_KEY= // API Key to use model. (optional) 
PORT= // Port number to run this server. (default: 3000)
```
## usage

## Ready to get POST request from AI Network trigger function
Trigger function 은 AI Network의 기능 중 하나로, 블록체인 DB의 특정 패스의 값이 변화하면 자동으로 지정된 url에 POST 요청을 실행한다. ([AI Network Docs](https://docs.ainetwork.ai/ain-blockchain/developer-guide/tools/ainize-trigger))

Trigger function 으로 실행된 요청에는 아래와 같은 매우 복잡한 request data가 포함된다.
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

이 데이터를 쉽게 처리할 수 있도록 ainize-wrapper-server 코드에서 다양한 기능을 제공한다.

### Middle ware to check It is from trigger function.
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
```JS
import { extractDataFromModelRequest } from './utils/extractor';

  const { appName, requestData, requestKey } = extractDataFromModelRequest(req);
```

### Inference endpoint

The AI model deployed via Ainize automatically sends a POST request to `https://YOUR.ENDPOINT.ai/model` when an inference request is made, utilizing the trigger function feature of the AI Network blockchain.

You can implement the inference function by modifying `app.post('/model', ...)` in src/index.ts.
```JS
app.post(
  '/model',
  middleware.blockchainTriggerFilter, // Check request is from AI Network.
  async (req: Request, res: Response) => {
  const { appName, requestData, requestKey } = extractDataFromModelRequest(req); // Parse triggered data
  try {
    const model = await ainModule.getModel(appName);
    const amount = 0; // Cost of inference. 
    const responseData = await inference(requestData.prompt); // You need to change this "inference" function to set your model.
    await handleRequest(req, amount, RESPONSE_STATUS.SUCCESS, responseData); // Discount user's credit and write the response data to blockchain.
  } catch(e) {
    console.log('error: ', e);
    await ainize.internal.handleRequest(req, 0, RESPONSE_STATUS.FAIL,'error'); // Write error to response path.
  }
});
```

### Connect Model

If the usage of your AI service is as described below, you can connect your service by simply modifying the `.env` file. However, if further adjustments are needed, edit `src/inference.ts`.
```JS
export const inference = async (prompt: string): Promise<string> =>{
  const response = await fetch(
    String(process.env.INFERENCE_URL),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${String(process.env.API_KEY)}`
      },
      body: JSON.stringify({
        model: String(process.env.MODEL_NAME),
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
    throw new Error(
      `Fail to inference: ${JSON.stringify(await response.json())}`
    );
  }
  const data = await response.json();
  return data.choices[0].message.content;
}
```
