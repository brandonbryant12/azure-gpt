import { program } from 'commander';
import { makeChatRequest } from './chat';
import { makeSpeechRequest } from './voice';

program
  .description('A command-line interface for interacting with Azure OpenAI')
  .version('1.0.0')
  .action(() => {
    program.outputHelp();
  });

program
  .command('chat <message>')
  .description('Chat with the Azure OpenAI bot')
  .action(async (message: string) => {
    try {
      const reply = await makeChatRequest(message);
      console.log(reply);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
  });

program
  .command('speech <text>')
  .description('Convert text to speech using Microsoft Speech SDK')
  .option('-o, --output <file>', 'Output file path', 'output.wav')
  .option('-v, --voice <voice>', 'Voice name (overrides env variable)')
  .option('-p, --play', 'Play the audio file after generating it', false)
  .action(async (text: string, options: { output: string, voice?: string, play: boolean }) => {
    try {
      await makeSpeechRequest(text, options.output, options.voice, options.play);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }
  });

program.parse(process.argv);