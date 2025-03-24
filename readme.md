# azure-gpt

A command-line interface (CLI) for interacting with an Azure OpenAI deployment in an enterprise environment.

This tool allows you to chat with an Azure OpenAI bot from your terminal, leveraging a cached authentication token and configurable API settings.

## Installation

Follow these steps to install `azure-gpt` and make it available globally on your system.

### Prerequisites
- **Node.js**: Version 18.17.0 or higher (tested with v18.17.0).
- **npm**: Comes with Node.js, used for package management.
- **Git**: To clone the repository (optional if downloading manually).

### Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/brandonbryant12/azure-gpt.git
   cd azure-gpt
   ```

2. **Install Dependencies**
   Run the following command in the project directory to install required packages:
   ```bash
   npm install
   ```

3. **Build the Project**
   Compile the TypeScript code into JavaScript:
   ```bash
   npm run build
   ```

4. **Make it Globally Available**
   Link the CLI to your system so you can run azure-gpt from anywhere:
   ```bash
   npm link
   ```
   This creates a symbolic link in your global node_modules directory, making azure-gpt a globally accessible command.

## Configuration

Before using the chat feature, you need to set up environment variables for your Azure OpenAI deployment.

### Required Environment Variables
- **AZURE_OPENAI_ENDPOINT**: The endpoint URL for your Azure OpenAI resource (e.g., myresource.openai.azure.com).
- **USERNAME**: Username for token authentication.
- **PASSWORD**: Password for token authentication.

### Optional Environment Variable
- **AZURE_OPENAI_API_VERSION**: The API version to use (defaults to 2023-05-15 if not set).

### Setting Environment Variables

**On Unix-based Systems (Linux/macOS)**
```bash
export AZURE_OPENAI_ENDPOINT="your-endpoint"
export USERNAME="your-username"
export PASSWORD="your-password"
export AZURE_OPENAI_API_VERSION="2023-05-15"  # Optional
```

**On Windows (Command Prompt)**
```bash
set AZURE_OPENAI_ENDPOINT=your-endpoint
set USERNAME=your-username
set PASSWORD=your-password
set AZURE_OPENAI_API_VERSION=2023-05-15  # Optional
```

**Persistent Configuration**
To avoid setting these every session, add them to your shell profile (e.g., ~/.bashrc, ~/.zshrc, or equivalent).

## Usage

Once installed globally and configured, you can use azure-gpt from any terminal.

### Commands

**Get Help**
```bash
azure-gpt
```
Displays usage information and available commands.

**Chat with the Bot**
```bash
azure-gpt chat "Your message here"
```
Sends a message to the Azure OpenAI bot and prints the response.

### Examples

Chat with the bot:
```bash
azure-gpt chat "How's the weather today?"
```
Expected output: The bot's response (assuming authentication works).

View version and help:
```bash
azure-gpt --version
azure-gpt --help
```

## Authentication

The CLI uses a token-based authentication mechanism:
- Tokens are fetched from https://token.com/accessToken using your username and password credentials.
- Tokens are cached in ~/.azure-gpt-config.json with a 55-minute TTL.

In a real enterprise setup, replace the fetchNewToken function in src/index.ts with logic to authenticate via Microsoft Entra ID or your enterprise authentication system.

## Troubleshooting

- **"Missing required environment variables"**: Ensure AZURE_OPENAI_ENDPOINT, USERNAME, and PASSWORD are set.
- **"Failed to fetch token"**: Check your username and password or network connectivity to the token endpoint.
- **"API request failed"**: Check your Azure OpenAI endpoint and API version.
- **Command not found**: Verify npm link succeeded and your PATH includes global npm binaries (npm config get prefix).

## Development

To modify the code:
1. Edit files in src/.
2. Rebuild with npm run build.
3. Test locally with npm run start or re-link globally with npm link.

## License

ISC License - see LICENSE for details.

## Contributing

Feel free to submit issues or pull requests at https://github.com/brandonbryant12/azure-gpt.