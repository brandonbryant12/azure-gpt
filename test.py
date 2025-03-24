import logging
from openai import AzureOpenAI

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG to capture all details
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Enable HTTP request logging for the openai library
# This logs the full request, including the URL
logging.getLogger("openai").setLevel(logging.DEBUG)
logging.getLogger("httpx").setLevel(logging.DEBUG)  # httpx is used internally by openai

# Initialize the AzureOpenAI client
client = AzureOpenAI(
    api_key="your-azure-api-key",  # Replace with your Azure API key
    api_version="2023-05-15",      # Specify the API version
    azure_endpoint="https://my-custom-azure.com"  # Your custom Azure endpoint
)

# Make a chat completion request
try:
    response = client.chat.completions.create(
        model="gpt-35-turbo",  # Replace with your deployment name
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello, how can you assist me today?"}
        ],
        max_tokens=50
    )
    
    # Print the response (optional)
    print("Response:", response.choices[0].message.content)

except Exception as e:
    logging.error(f"An error occurred: {str(e)}")

