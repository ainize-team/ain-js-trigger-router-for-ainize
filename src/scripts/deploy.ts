import Ainize from '@ainize-team/ainize-js';
import './config'; // 환경 변수 검증을 바로 수행
const ainPrivateKey = process.env.PRIVATE_KEY;
const serviceName = process.env.SERVICE_NAME;
const serviceUrl = process.env.SERVICE_URL;

const main = async () => {
  try {
    const ainize = new Ainize(0);
    await ainize.login(ainPrivateKey);
    console.log('balance: ',await ainize.getAinBalance());
    const deployConfig = {
      serviceName: serviceName,
      serviceUrl: serviceUrl
    }
    const service = await ainize.deploy(deployConfig); 
    console.log(service.serviceName);
    console.log(await service.getCreditBalance());
    ainize.logout();
  }catch(e) {
    console.log(e);
  }
}
main();
