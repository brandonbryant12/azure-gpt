# Azure GPT CLI

A command-line interface for interacting with Azure OpenAI and Speech services in an enterprise environment with bearer token authentication.

## Features

- Chat with Azure OpenAI models
- Text-to-speech synthesis using Microsoft Speech SDK
- Audio playback capability
- Enterprise-ready with custom authentication

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd azure-gpt

# Install dependencies
npm install

# Build the project
npm run build

# Create a symbolic link to use the CLI globally (optional)
npm link
```

## Configuration

Create a `.env` file in the project root with the following variables:

```
# Authentication credentials
USERNAME=your_username
PASSWORD=your_password
CLIENT_ID=your_client_id
SCOPE=your_scope

# Azure OpenAI settings
AZURE_OPENAI_ENDPOINT=your-endpoint.openai.azure.com
AZURE_OPENAI_API_VERSION=2023-05-15
CHAT_MODEL=gpt-4o

# Microsoft Speech Service settings
AZURE_SPEECH_REGION=eastus
AZURE_SPEECH_VOICE=en-US-JennyNeural
```

## Usage

### Chat Command

Interact with Azure OpenAI chat models:

```bash
azure-gpt chat "What is the capital of France?"
```

### Speech Command

Convert text to speech using Microsoft Speech SDK:

```bash
# Basic usage
azure-gpt speech "Hello, this is a text to speech test."

# Specify output file
azure-gpt speech "Custom output file example." --output my_speech.wav

# Specify a different voice
azure-gpt speech "This is using a different voice." --voice en-US-GuyNeural

# Generate and play the audio
azure-gpt speech "This will be played immediately after generation." --play

# Combine options
azure-gpt speech "Using all options together." --output custom.wav --voice en-US-GuyNeural --play
```

## Development

### Project Structure

- `src/index.ts`: Main CLI entry point and command definitions
- `src/env.ts`: Environment variable handling with Zod validation
- `src/token.ts`: Authentication token management
- `src/chat.ts`: Chat functionality with Azure OpenAI
- `src/voice.ts`: Text-to-speech functionality with Microsoft Speech SDK

### Adding New Commands

To add new commands, modify the `src/index.ts` file following the Commander.js pattern:

```typescript
program
  .command('new-command <required-arg>')
  .description('Description of the new command')
  .option('-o, --option <value>', 'Description of the option')
  .action(async (requiredArg, options) => {
    // Implementation
  });
```

## License

ISC License - see LICENSE for details.

## Contributing

Feel free to submit issues or pull requests at https://github.com/brandonbryant12/azure-gpt.