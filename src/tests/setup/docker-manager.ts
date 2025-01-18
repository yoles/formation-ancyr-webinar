import * as path from 'path';
import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
} from 'testcontainers';

let instance: StartedDockerComposeEnvironment | null = null;

export const startDockerCompose = async () => {
  const composeFilesPath = path.resolve(__dirname);
  const composeFile = 'docker-compose.yml';

  instance = await new DockerComposeEnvironment(
    composeFilesPath,
    composeFile,
  ).up();
};

export const stopDockerCompose = async () => {
  if (!instance) {
    return;
  }

  try {
    await instance.down();
    instance = null;
  } catch (error) {
    console.error('Failed to stop docker compose: ', error);
  }
};

export const getDockerEnvironment = (): StartedDockerComposeEnvironment => {
  if (!instance) {
    throw new Error('Docker compose is not running');
  }

  return instance;
};
