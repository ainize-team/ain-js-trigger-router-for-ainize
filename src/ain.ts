import Ain from "@ainblockchain/ain-js";
import { Path, getBlockChainEndpoint, getBlockChainEventEndpoint } from "./constants";
import Model from "@ainize-team/ainize-js/dist/model";
import { TransactionBody } from "@ainblockchain/ain-js/lib/types";
import { txResult } from "@ainize-team/ainize-js/dist/types/type";

export default class AinModule {
  private ain!: Ain;
  private static instance: AinModule;

  static getInstance() {
    if (!AinModule.instance) {
      AinModule.instance = new AinModule();
    }
    return AinModule.instance;
  }

  initAin(chainId: 0 | 1, privateKey: string ) {
    const blockchainEndpoint = getBlockChainEndpoint(chainId);
    const blockchainEventEndpoint= getBlockChainEventEndpoint(chainId);
    this.ain = new Ain(blockchainEndpoint, blockchainEventEndpoint, chainId);
    this.ain.wallet.addAndSetDefaultAccount(privateKey);
    console.log("ain init finish")
  }

  async getValue(path: string) {
    return await this.ain.db.ref(path).getValue();
  }

  async getModel(modelName: string): Promise<Model> {
    const modelPath = Path.app(modelName).root();
    const modelData = await this.getValue(modelPath);
    if(!modelData) {
      throw new Error("Model not found");
    }
    return new Model(modelName);
  }

  getMyAddress(): string {
    const address =  this.ain.wallet.defaultAccount?.address 
    if(!address){
      throw new Error("Set default account first.");
    }
    return address;
  }
  
  async isModelExist(modelName: string): Promise<boolean> {
    const modelPath = Path.app(modelName).root();
    const modelData = await this.getValue(modelPath);
    if(!modelData) {
      return false
    }
    return true
  }

  private hasFailedOpResultList(result: txResult): boolean {
    if (result.result_list) {
      return Object.values(result.result_list).some(
        (result: { code: number }) => result.code !== 0
      );
    }
    return result.code !== 0;
  }

  private handleTxResultWrapper(operation: Function) {
    return async (args: any) => {
      const res = await operation(args);
      // ainWalletSigner return txHash or undefined.
      if (typeof res === 'string') {
        return res;
      } else if (res === undefined) {
        throw new Error(`Failed to build transaction.`);
      }
      // defaultSigner return a result object of transactions.
      const { tx_hash, result } = res;
      if (this.hasFailedOpResultList(result)) {
        throw new Error(
          `Failed to send transaction (${tx_hash}).\n Tx Result: ${JSON.stringify(result)}`
        );
      }
      return tx_hash;
    }
  }

  private async _sendTransaction(txBody: TransactionBody) {
    return await this.ain.sendTransaction(txBody);
  }
  
  sendTransaction = this.handleTxResultWrapper(this._sendTransaction.bind(this));

}
