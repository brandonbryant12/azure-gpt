import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { getAuthToken } from './token';
import { env } from './env';
import playerFactory from 'play-sound';

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
  // Get the authentication token using the existing method
  const token = await getAuthToken();
  
  // Speech config with authentication
  const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, env.AZURE_SPEECH_REGION);
  
  // Set speech synthesis settings
  // Use provided voice parameter, or fallback to environment variable
  speechConfig.speechSynthesisVoiceName = voice || env.AZURE_SPEECH_VOICE;
  
  // Create an audio config for file output
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputFile);
  
  // Create the speech synthesizer
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
  
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      result => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log(`Speech synthesized successfully. Audio saved to ${outputFile}`);
          synthesizer.close();
          
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
        } else {
          const errorMessage = `Speech synthesis failed: ${result.errorDetails}`;
          console.error(errorMessage);
          synthesizer.close();
          reject(new Error(errorMessage));
        }
      },
      error => {
        console.error(`Error: ${error}`);
        synthesizer.close();
        reject(error);
      }
    );
  });
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