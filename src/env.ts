import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

// Define the environment schema using Zod
const envSchema = z.object({
  // Authentication credentials
  USERNAME: z.string().min(1),
  PASSWORD: z.string().min(1),
  CLIENT_ID: z.string().min(1),
  SCOPE: z.string().min(1),

  // Azure OpenAI settings
  AZURE_OPENAI_ENDPOINT: z.string().min(1),
  AZURE_OPENAI_API_VERSION: z.string().default('2023-05-15'),
  CHAT_MODEL: z.string().default('gpt-4o'),
  
  // Microsoft Speech Service settings
  AZURE_SPEECH_REGION: z.string().default('eastus'),
  AZURE_SPEECH_VOICE: z.string().default('en-US-JennyNeural'),
});

// Parse and validate environment variables
function parseEnv() {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    result.error.errors.forEach(error => {
      console.error(`- ${error.path}: ${error.message}`);
    });
    process.exit(1);
  }
  
  return result.data;
}

// Export the parsed environment
export const env = parseEnv(); 