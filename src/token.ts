import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';
import { env } from './env';

interface Config {
  token?: string;
  expirationTime?: number;
}

const CONFIG_FILE = path.join(os.homedir(), '.azure-gpt-config.json');

export function readConfig(): Config {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

export function writeConfig(config: Config): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (error: any) {
    console.error(`Failed to write config file: ${error.message}`);
  }
}

export async function fetchNewToken(): Promise<string> {
  const url = 'https://token.com/accessToken'; // Replace with your actual token endpoint

  // Build payload with the new environment variables
  const payload = [
    `username=${encodeURIComponent(env.USERNAME)}`,
    `password=${encodeURIComponent(env.PASSWORD)}`,
    `client_id=${encodeURIComponent(env.CLIENT_ID)}`,
    `scope=${encodeURIComponent(env.SCOPE)}`
  ].join('&');

  const agent = new https.Agent({ rejectUnauthorized: false }); // Ignore SSL certificate validation

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload,
    agent
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function getAuthToken(): Promise<string> {
  const config = readConfig();
  const currentTime = Date.now();

  if (config.token && config.expirationTime && config.expirationTime > currentTime) {
    return config.token;
  }

  const newToken = await fetchNewToken();
  const expirationTime = currentTime + 55 * 60 * 1000; // 55 minutes from now
  writeConfig({ token: newToken, expirationTime });
  return newToken;
} 