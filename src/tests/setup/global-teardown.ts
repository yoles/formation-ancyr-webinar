import { stopDockerCompose } from './docker-manager';

const teardown = async () => {
  await stopDockerCompose();
};

export default teardown;
