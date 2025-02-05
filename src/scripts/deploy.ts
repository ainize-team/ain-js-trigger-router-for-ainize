import Ainize from '@ainize-team/ainize-js';
import './config'; // Validate environment variables immediately
const ainPrivateKey = process.env.PRIVATE_KEY || '';
const modelName = process.env.MODEL_NAME || '';
const modelUrl = process.env.MODEL_URL || '';

const main = async () => {
  try {
    const ainize = new Ainize(0);
    await ainize.login(ainPrivateKey);
    console.log('balance: ',await ainize.getAinBalance());
    const deployConfig = {
      modelName: modelName,
      modelUrl: modelUrl
    }
    const model = await ainize.deploy(deployConfig); 
    console.log(model.modelName);
    console.log(await model.getCreditBalance());
    ainize.logout();
  }catch(e) {
    console.log(e);
  }
}
main();
