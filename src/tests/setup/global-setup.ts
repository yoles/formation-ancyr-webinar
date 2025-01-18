import { startDockerCompose } from './docker-manager';

const setup = async () => {
  await startDockerCompose();
};

export default setup;
