import os from 'os';

export function getPodHostname(): string {
  return os.hostname();
}
