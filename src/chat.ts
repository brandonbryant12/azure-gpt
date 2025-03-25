import fetch from 'node-fetch';
import { getAuthToken } from './token';
import { env } from './env';

/**
 * Makes a chat request to Azure OpenAI API
 * @param message The user message to send to the chat API
 * @returns The assistant's response
 */
export async function makeChatRequest(message: string): Promise<string> {
  const endpoint = env.AZURE_OPENAI_ENDPOINT;
  const apiVersion = env.AZURE_OPENAI_API_VERSION;
  const modelName = env.CHAT_MODEL; // Using the model from environment variables

  const url = `https://${endpoint}/openai/deployments/${modelName}/chat/completions?api-version=${apiVersion}`;
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