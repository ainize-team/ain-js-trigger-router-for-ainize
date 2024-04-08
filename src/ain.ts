import Ain from "@ainblockchain/ain-js";
import { Path, getBlockChainEndpoint } from "./constants";
import Service from "@ainize-team/ainize-js/dist/service";

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
    this.ain.wallet.setDefaultAccount(privateKey);
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
}
