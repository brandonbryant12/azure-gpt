import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { getAuthToken } from './token';
import { env } from './env';
import playerFactory from 'play-sound';
import * as fs from 'fs';

/**
 * Converts text to speech using Microsoft Speech SDK with custom authentication
 * @param text The text to convert to speech
 * @param outputFile Optional output file path, defaults to 'output.wav'
 * @param voice Optional voice name to override the environment variable
 * @param playAudio Whether to play the audio file after generating it
 * @returns Promise that resolves when the audio file is saved and played (if specified)
 */
export async function makeSpeechRequest(
  text: string, 
  outputFile: string = 'output.wav',
  voice?: string,
  playAudio: boolean = false
): Promise<void> {
  try {
    // Log the start of the speech request
    console.log(`Starting speech synthesis for text: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
    
    // Get the authentication token using the existing method
    console.log('Getting authentication token...');
    const token = await getAuthToken();
    
    if (!token || token.trim() === '') {
      throw new Error('Authentication token is empty or invalid');
    }
    
    console.log(`Token received (length: ${token.length})`);
    
    // Basic validation for token format
    // Azure Cognitive Services tokens are usually JWT tokens, which have 3 parts separated by dots
    if (!token.includes('.') || token.split('.').length !== 3) {
      console.warn('Warning: The token format may not be compatible with Azure Cognitive Services');
      console.warn('Expected a JWT token format (xxx.yyy.zzz), but received a different format');
    }
    
    console.log(`Using speech region: ${env.AZURE_SPEECH_REGION}`);
    
    // Speech config with authentication token
    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, env.AZURE_SPEECH_REGION);
    
    // Set speech synthesis settings
    // Use provided voice parameter, or fallback to environment variable
    const voiceName = voice || env.AZURE_SPEECH_VOICE;
    console.log(`Using voice: ${voiceName}`);
    speechConfig.speechSynthesisVoiceName = voiceName;
    
    // Set the output format to ensure proper WAV file generation
    // Using PCM 16kHz 16-bit mono as a reliable format
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm;
    
    // Create an audio config for file output
    console.log(`Creating audio output to file: ${outputFile}`);
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputFile);
    
    // Create the speech synthesizer
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    
    // Add event handlers for better debugging
    synthesizer.synthesizing = function (s, e) {
      console.log(`Synthesizing in progress... (${e.result.audioData?.byteLength || 0} bytes)`);
    };
    
    synthesizer.synthesisStarted = function (s, e) {
      console.log('Synthesis started');
    };
    
    synthesizer.synthesisCompleted = function (s, e) {
      const audioDataLength = e.result.audioData?.byteLength || 0;
      console.log(`Synthesis completed. Audio data size: ${audioDataLength} bytes`);
      if (audioDataLength === 0) {
        console.error('Warning: Audio data is empty!');
      }
    };
    
    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        result => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            // Make sure the synthesizer is closed before checking the file
            synthesizer.close();
            
            // Wait a short time to ensure file is properly written
            setTimeout(() => {
              const fileStats = fs.existsSync(outputFile) ? fs.statSync(outputFile) : null;
              const fileSize = fileStats ? fileStats.size : 0;
              
              console.log(`Speech synthesized. Audio saved to ${outputFile} (size: ${fileSize} bytes)`);
              
              // Check if the file is empty
              if (fileSize === 0) {
                console.error('Error: Generated audio file is empty (0 bytes)');
                console.error('This usually indicates an authentication issue or voice configuration problem');
                
                // Delete the empty file
                try {
                  fs.unlinkSync(outputFile);
                  console.log(`Deleted empty output file: ${outputFile}`);
                } catch (e) {
                  console.error('Failed to delete empty file:', e);
                }
                
                reject(new Error('Speech synthesis failed: Generated audio file is empty. Please check your authentication token.'));
                return;
              }
              
              // Play the audio file if requested
              if (playAudio) {
                const audioPlayer = playerFactory();
                console.log(`Playing audio file: ${outputFile}`);
                
                audioPlayer.play(outputFile, (error) => {
                  if (error) {
                    console.error(`Error playing audio: ${error.message}`);
                  }
                  resolve();
                });
              } else {
                resolve();
              }
            }, 500); // 500ms delay to ensure file is written
          } else {
            const errorMessage = `Speech synthesis failed: ${result.errorDetails || 'Unknown error'}`;
            console.error(errorMessage);
            
            // Log the result reason code for better diagnostics
            console.error(`Result reason code: ${result.reason}`);
            
            synthesizer.close();
            
            // Delete empty output file if it exists
            if (fs.existsSync(outputFile) && fs.statSync(outputFile).size === 0) {
              try {
                fs.unlinkSync(outputFile);
                console.log(`Deleted empty output file: ${outputFile}`);
              } catch (e) {
                console.error('Failed to delete empty file:', e);
              }
            }
            
            reject(new Error(errorMessage));
          }
        },
        error => {
          console.error(`Speech synthesis error:`);
          console.error(error);
          
          // Check if it's an authentication error
          const errorWithMessage = error as { message?: string };
          if (errorWithMessage.message && (
              errorWithMessage.message.includes('auth') || 
              errorWithMessage.message.includes('token') || 
              errorWithMessage.message.includes('credentials') ||
              errorWithMessage.message.includes('permission') ||
              errorWithMessage.message.includes('unauthorized'))) {
            console.error('Authentication error detected. Please check your credentials and token.');
          }
          
          synthesizer.close();
          
          // Delete empty output file if it exists
          if (fs.existsSync(outputFile) && fs.statSync(outputFile).size === 0) {
            try {
              fs.unlinkSync(outputFile);
              console.log(`Deleted empty output file: ${outputFile}`);
            } catch (e) {
              console.error('Failed to delete empty file:', e);
            }
          }
          
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Error in makeSpeechRequest:');
    console.error(error);
    
    // Delete empty output file if it exists
    if (fs.existsSync(outputFile) && fs.statSync(outputFile).size === 0) {
      try {
        fs.unlinkSync(outputFile);
        console.log(`Deleted empty output file: ${outputFile}`);
      } catch (e) {
        console.error('Failed to delete empty file:', e);
      }
    }
    
    throw error;
  }
}

/**
 * @deprecated Use makeSpeechRequest instead.
 * Legacy function maintained for backwards compatibility.
 */
export async function synthesizeSpeechWithMicrosoft(
  text: string, 
  outputFile: string = 'ms_output.wav',
  voice?: string,
  playAudio: boolean = false
): Promise<void> {
  // Call the new implementation
  return makeSpeechRequest(text, outputFile, voice, playAudio);
} 