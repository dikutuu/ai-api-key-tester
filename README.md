# AI API Key Tester

Test your AI API keys and discover available models with a minimalist Apple-inspired design.

## Features

- 🔑 **Auto-detect Provider** - Automatically detects provider from API key format
- 🎯 **Model Discovery** - Lists all available models for your API key
- ⚡ **Latency Testing** - Tests each model and measures response time
- 🎨 **Minimalist Design** - Clean Apple-inspired interface
- 🔒 **Privacy First** - Keys are never stored, all processing happens client-side
- 📱 **Responsive** - Works on desktop and mobile

## Supported Providers

- OpenAI
- Anthropic (Claude)
- OpenRouter
- Groq
- DeepSeek
- Together AI
- Mistral AI
- Perplexity
- Cohere
- FreeModel
- MiMo (Xiaomi)

## Usage

1. Paste your API key in the text area
2. (Optional) Add a custom base URL for custom endpoints
3. Click "Test API Key"
4. View provider info, available models, and latency results

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-api-key-tester)

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### POST /api/test
Tests API key and fetches available models.

**Request:**
```json
{
  "api_key": "sk-...",
  "custom_url": "https://api.example.com/v1" // optional
}
```

**Response:**
```json
{
  "provider": "openai",
  "base_url": "https://api.openai.com/v1",
  "total_models": 50,
  "models": ["gpt-4", "gpt-3.5-turbo", ...],
  "tested_models": 50
}
```

### POST /api/test-model
Tests individual model availability and latency.

**Request:**
```json
{
  "api_key": "sk-...",
  "base_url": "https://api.openai.com/v1",
  "model_id": "gpt-4",
  "provider": "openai"
}
```

**Response:**
```json
{
  "status": "available",
  "model": "gpt-4"
}
```

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Vercel Serverless Functions (Node.js)
- **Deployment:** Vercel

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first.
