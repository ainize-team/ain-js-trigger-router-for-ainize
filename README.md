# Ainize Wrapper Server

It's an template backend of AI Model deployed by [ainize-js](https://github.com/ainize-team/ainize-js)

## Requirements

node >= 18

## usage

### Install

Clone this repogitory.

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
