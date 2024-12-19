# Ainize Wrapper Server

It's an template backend of AI Model deployed by [ainize-js](https://github.com/ainize-team/ainize-js)

## Requirements

node >= 18

## usage

### Install

Clone this repository.
```
git clone git@github.com:ainize-team/ainize-wrapper-server.git
```

### Set env
```JS
BLOCKCHAIN_NETWORK= // mainnet = '1', testnet = '0'. 
PRIVATE_KEY= // App owner's private key.
MODEL_URL= // LLM Service endpoint.
INFERENCE_URL= // LLM Inference endpoint.
MODEL_NAME= // Model name.
API_KEY= // API Key to use model. (optional) 
PORT= // Port number to run this server. (default: 3000)
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
