export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { api_key, base_url, model_id, provider } = req.body;

    if (!api_key || !base_url || !model_id) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // Test the model with a simple completion request
        const testPayload = {
            model: model_id,
            messages: [
                { role: 'user', content: 'Hi' }
            ],
            max_tokens: 5
        };

        const response = await fetch(`${base_url}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPayload)
        });

        if (response.ok) {
            return res.status(200).json({
                status: 'available',
                model: model_id
            });
        } else {
            const errorText = await response.text();
            console.error(`Model ${model_id} error: ${response.status} - ${errorText}`);
            return res.status(200).json({
                status: 'error',
                model: model_id,
                error: `${response.status} ${response.statusText}`
            });
        }

    } catch (error) {
        console.error(`Model ${model_id} exception:`, error);
        return res.status(200).json({
            status: 'error',
            model: model_id,
            error: error.message
        });
    }
}
