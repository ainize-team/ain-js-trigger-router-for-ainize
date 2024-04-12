import Ain from "@ainblockchain/ain-js";
import { Path, getBlockChainEndpoint } from "./constants";
import Service from "@ainize-team/ainize-js/dist/service";
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
    this.ain = new Ain(blockchainEndpoint, chainId);
    this.ain.wallet.addAndSetDefaultAccount(privateKey);
  }

  async getValue(path: string) {
    return await this.ain.db.ref(path).getValue();
  }


  async getService(serviceName: string): Promise<Service> {
    const servicePath = Path.app(serviceName).root();
    const serviceData = await this.getValue(servicePath);
    if(!serviceData) {
      throw new Error("Service not found");
    }
    return new Service(serviceName);
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
    return await this.ain.signer.sendTransaction(txBody);
  }
  
  sendTransaction = this.handleTxResultWrapper(this._sendTransaction.bind(this));
}
