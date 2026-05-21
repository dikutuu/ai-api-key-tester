export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { api_key, custom_url } = req.body;

    if (!api_key) {
        return res.status(400).json({ error: 'API key is required' });
    }

    try {
        // Detect provider from API key format
        const provider = detectProvider(api_key);
        const baseUrl = custom_url || getDefaultBaseUrl(provider);

        console.log(`Detected provider: ${provider}, Base URL: ${baseUrl}`);

        // Fetch models list
        const modelsResponse = await fetch(`${baseUrl}/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            }
        });

        if (!modelsResponse.ok) {
            const errorText = await modelsResponse.text();
            console.error(`Models API error: ${modelsResponse.status} - ${errorText}`);
            throw new Error(`Failed to fetch models: ${modelsResponse.status} ${modelsResponse.statusText}`);
        }

        const modelsData = await modelsResponse.json();
        
        // Extract model IDs
        let modelIds = [];
        if (modelsData.data && Array.isArray(modelsData.data)) {
            modelIds = modelsData.data.map(m => m.id);
        } else if (Array.isArray(modelsData)) {
            modelIds = modelsData.map(m => m.id || m);
        }

        console.log(`Found ${modelIds.length} models`);

        // Limit to first 50 models for testing
        const modelsToTest = modelIds.slice(0, 50);

        return res.status(200).json({
            provider: provider,
            base_url: baseUrl,
            total_models: modelIds.length,
            models: modelsToTest,
            tested_models: modelsToTest.length
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to test API key'
        });
    }
}

function detectProvider(apiKey) {
    if (apiKey.startsWith('sk-ant-')) {
        return 'anthropic';
    } else if (apiKey.startsWith('sk-or-v1-')) {
        return 'openrouter';
    } else if (apiKey.startsWith('gsk_')) {
        return 'groq';
    } else if (apiKey.startsWith('fe_oa_')) {
        return 'freemodel';
    } else if (apiKey.startsWith('mimo_') || apiKey.startsWith('sk-mimo-')) {
        return 'mimo';
    } else if (apiKey.startsWith('sk-proj-')) {
        return 'openai';
    } else if (apiKey.startsWith('sk-')) {
        return 'openai';
    } else if (apiKey.length === 32 && /^[a-f0-9]+$/.test(apiKey)) {
        return 'together';
    } else if (apiKey.startsWith('pplx-')) {
        return 'perplexity';
    } else if (apiKey.startsWith('mistral-')) {
        return 'mistral';
    } else if (apiKey.startsWith('co-')) {
        return 'cohere';
    } else {
        return 'openai'; // Default fallback
    }
}

function getDefaultBaseUrl(provider) {
    const urls = {
        'openai': 'https://api.openai.com/v1',
        'anthropic': 'https://api.anthropic.com/v1',
        'openrouter': 'https://openrouter.ai/api/v1',
        'groq': 'https://api.groq.com/openai/v1',
        'together': 'https://api.together.xyz/v1',
        'deepseek': 'https://api.deepseek.com/v1',
        'mistral': 'https://api.mistral.ai/v1',
        'perplexity': 'https://api.perplexity.ai',
        'cohere': 'https://api.cohere.ai/v1',
        'freemodel': 'https://cc.freemodel.dev/v1',
        'mimo': 'https://api.mimo.ai/v1'
    };

    return urls[provider] || urls['openai'];
}
