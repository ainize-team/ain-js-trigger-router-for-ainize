import { Request } from 'express';
import { extractDataFromModelRequest } from './utils/extractor';

export const inference = async (req: Request): Promise<any> =>{
  const { appName, requestData, requestKey } = extractDataFromModelRequest(req);
  const prompt = requestData.prompt;

  ////// Insert your AI Service's Inference Code. //////
 
  // return the result
}