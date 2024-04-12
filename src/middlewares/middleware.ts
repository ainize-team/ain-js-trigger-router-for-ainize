import { Request, Response, NextFunction } from "express";
import NodeCache = require("node-cache");
import { extractTriggerDataFromRequest } from "../utils/extractor";
import _ from "lodash";
import AinModule from "../ain";

export default class Middleware {
  cache: NodeCache;
  private ain = AinModule.getInstance();
  constructor() {
    this.cache = new NodeCache();
  }


  blockchainTriggerFilter = async (req: Request, res: Response, next: NextFunction) => {
    //check if request is from blockchain trigger
    try {
      const { triggerPath, triggerValue, txHash } = extractTriggerDataFromRequest(req);
      if(!triggerPath || !triggerValue || !txHash) {
        throw new Error("Not from blockchain");
      }
      // NOTE(yoojin): Validation will changed. Temp comment out.
      // const result = await this.ain.getValue(triggerPath);
      
      // If request is first request, set cache 
      if (this.cache.get(txHash) && this.cache.get(txHash) !== "error") {
        res.send("Duplicated");
        return;
      }
      this.cache.set(txHash, "in_progress", 500);
      // NOTE(yoojin): Validation will changed. Temp comment out.
      // _.isEqual(result, triggerValue) ? next(): res.send("Not from blockchain");
      next();
    } catch (e) {
      console.log("Filtering Error ", e)
      res.send(e);
      return;
    }
  }
}