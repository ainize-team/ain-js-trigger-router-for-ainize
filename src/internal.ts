import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Request } from "express";
import { getChangeBalanceOp, getResponseOp, getWriteHistoryOp } from "./utils/operator";
import { buildTxBody } from "./utils/builder";
import AinModule from "./ain";
import { extractDataFromDepositRequest, extractDataFromServiceRequest } from "./utils/extractor";
import { deployConfig, HISTORY_TYPE, RESPONSE_STATUS } from "@ainize-team/ainize-js/dist/types/type";
  
export const handleDeposit = async (req: Request) => {
  const ain = AinModule.getInstance();
  const { requesterAddress, appName, transferKey, transferValue } = extractDataFromDepositRequest(req);
  const ops: SetOperation[] = [];
  const changeBalanceOp = await getChangeBalanceOp(appName, requesterAddress, "INC_VALUE", transferValue);
  const writeHistoryOp = await getWriteHistoryOp(appName, requesterAddress, HISTORY_TYPE.DEPOSIT, transferValue, transferKey);
  ops.push(changeBalanceOp);
  ops.push(writeHistoryOp);
  const txBody = buildTxBody(ops);
  return await ain.sendTransaction(txBody);
}

export const handleRequest = async(req: Request, cost: number, status: RESPONSE_STATUS, responseData: string) => {
  const ain = AinModule.getInstance();
  const { requesterAddress, requestKey, appName } = extractDataFromServiceRequest(req);
  const ops:SetOperation[] = [];
  const responseOp = getResponseOp(appName, requesterAddress, requestKey, status, responseData, cost);
  ops.push(responseOp);
  if(cost > 0) {
    const changeBalanceOp = getChangeBalanceOp(appName, requesterAddress, 'DEC_VALUE', cost);
    const writeHistoryOp = getWriteHistoryOp(appName, requesterAddress, HISTORY_TYPE.USAGE, cost, requestKey);
    ops.push(changeBalanceOp);
    ops.push(writeHistoryOp);
  }
  const txBody = buildTxBody(ops);
  return await ain.sendTransaction(txBody);
}
