
import { program } from 'commander';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';

interface Config {
  token?: string;
  expirationTime?: number;
}

const CONFIG_FILE = path.join(os.homedir(), '.azure-gpt-config.json');

function readConfig(): Config {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

function writeConfig(config: Config): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (error: any) {
    console.error(`Failed to write config file: ${error.message}`);
  }
}

async function fetchNewToken(): Promise<string> {
  const url = 'https://token.com/accessToken';
  const payload = 'clientId=234';

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

async function getAuthToken(): Promise<string> {
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

async function makeChatRequest(message: string): Promise<string> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2023-05-15';

  if (!endpoint || !deployment) {
    throw new Error('Missing required environment variables: AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT');
  }

  const url = `https://${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  const token = await getAuthToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

program
  .description('A command-line interface for interacting with Azure OpenAI')
  .version('1.0.0')
  .action(() => {
    program.outputHelp();
  })
  .command('chat <message>')
  .description('Chat with the Azure OpenAI bot')
  .action(async (message) => {
    try {
      const reply = await makeChatRequest(message);
      console.log(reply);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
  });

program.parse(process.argv);
      