console.log('🚀 Script loaded');

let currentPage = 1;
const itemsPerPage = 10;
let allModelResults = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded');
    
    const form = document.getElementById('testForm');
    const testBtn = document.getElementById('testBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');
    const providerInfo = document.getElementById('providerInfo');
    const modelsInfo = document.getElementById('modelsInfo');
    const modelsList = document.getElementById('modelsList');
    const errorMessage = document.getElementById('errorMessage');
    const pagination = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    if (!form) {
        console.error('❌ Form not found');
        return;
    }

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPaginatedResults();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allModelResults.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderPaginatedResults();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Form submitted');
        
        errorDiv.style.display = 'none';
        resultsDiv.style.display = 'none';
        testBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';

        const formData = new FormData(form);
        const apiKey = formData.get('apiKey').trim();
        const customUrl = formData.get('customUrl').trim();
        
        console.log('🔑 API Key length:', apiKey.length);
        console.log('🌐 Custom URL:', customUrl || '(auto-detect)');

        try {
            console.log('📡 Fetching models list...');
            
            const response = await fetch('/api/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    api_key: apiKey,
                    custom_url: customUrl
                })
            });

            console.log('📥 Response status:', response.status);

            const result = await response.json();
            console.log('📦 Response data:', result);

            if (!response.ok || result.error) {
                console.error('❌ API error:', result.error);
                throw new Error(result.error || 'Test failed');
            }

            console.log('🧪 Starting latency tests...');
            await testModelsLatency(result, apiKey);
            
        } catch (error) {
            console.error('❌ Error:', error);
            displayError(error.message);
        } finally {
            testBtn.disabled = false;
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
            console.log('🏁 Completed');
        }
    });

    async function testModelsLatency(result, apiKey) {
        const models = result.models;
        const provider = result.provider;
        const baseUrl = result.base_url;
        
        currentPage = 1;
        allModelResults = [];
        
        displayResultsInitial(result);
        
        for (let i = 0; i < models.length; i++) {
            const modelId = models[i];
            console.log(`🧪 Testing ${i + 1}/${models.length}: ${modelId}`);
            
            const startTime = performance.now();
            
            try {
                const testResponse = await fetch('/api/test-model', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        api_key: apiKey,
                        base_url: baseUrl,
                        model_id: modelId,
                        provider: provider
                    })
                });
                
                const endTime = performance.now();
                const latency = Math.round(endTime - startTime);
                
                const testResult = await testResponse.json();
                
                allModelResults.push({
                    model: modelId,
                    latency: latency,
                    status: testResult.status,
                    error: testResult.error
                });
                
                console.log(`✅ ${modelId}: ${latency}ms - ${testResult.status}`);
                
            } catch (error) {
                const endTime = performance.now();
                const latency = Math.round(endTime - startTime);
                
                allModelResults.push({
                    model: modelId,
                    latency: latency,
                    status: 'error',
                    error: error.message
                });
                
                console.error(`❌ ${modelId}: error`);
            }
            
            renderPaginatedResults();
            updateModelsInfo(result.total_models, models.length, i + 1);
        }
        
        console.log('✅ All models tested');
    }

    function updateModelsInfo(totalModels, testingCount, completedCount) {
        const availableCount = allModelResults.filter(m => m.status === 'available').length;
        const avgLatency = allModelResults.length > 0 
            ? Math.round(allModelResults.reduce((sum, m) => sum + (m.latency || 0), 0) / allModelResults.length)
            : 0;

        modelsInfo.innerHTML = `
            <div class="metric">
                <span class="metric-label">Testing Progress</span>
                <span class="metric-value">${completedCount} / ${testingCount}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Available Models</span>
                <span class="metric-value" style="color: var(--success);">${availableCount}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Average Latency</span>
                <span class="metric-value">${avgLatency}ms</span>
            </div>
        `;
    }

    function renderPaginatedResults() {
        if (allModelResults.length === 0) {
            modelsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Testing models...</p>';
            pagination.style.display = 'none';
            return;
        }

        const totalPages = Math.ceil(allModelResults.length / itemsPerPage);
        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx = Math.min(startIdx + itemsPerPage, allModelResults.length);
        const pageResults = allModelResults.slice(startIdx, endIdx);

        let tableHtml = `
            <table class="models-table">
                <thead>
                    <tr>
                        <th>Model</th>
                        <th>Latency</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        pageResults.forEach(model => {
            const latencyClass = getLatencyClass(model.latency);
            const statusClass = model.status === 'available' ? 'status-available' : 'status-error';
            
            tableHtml += `
                <tr>
                    <td class="model-name">${escapeHtml(model.model)}</td>
                    <td>
                        <span class="latency-badge ${latencyClass}">
                            ${model.latency ? model.latency + 'ms' : 'N/A'}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${model.status === 'available' ? '✓ Available' : '✗ Error'}
                        </span>
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        `;

        modelsList.innerHTML = tableHtml;

        if (totalPages > 1) {
            pagination.style.display = 'flex';
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            prevPageBtn.disabled = currentPage === 1;
            nextPageBtn.disabled = currentPage === totalPages;
        } else {
            pagination.style.display = 'none';
        }
    }

    function displayResultsInitial(result) {
        resultsDiv.style.display = 'block';
        errorDiv.style.display = 'none';

        providerInfo.innerHTML = `
            <div class="metric">
                <span class="metric-label">Provider</span>
                <span class="metric-value">${escapeHtml(result.provider.toUpperCase())}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Base URL</span>
                <span class="metric-value" style="font-family: 'SF Mono', monospace; font-size: 0.9rem;">${escapeHtml(result.base_url)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Total Models</span>
                <span class="metric-value">${result.total_models}</span>
            </div>
        `;

        modelsInfo.innerHTML = `
            <div class="metric">
                <span class="metric-label">Testing Progress</span>
                <span class="metric-value">0 / ${result.models.length}</span>
            </div>
        `;

        modelsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Testing models...</p>';
    }

    function displayError(message) {
        console.log('❌ Display error:', message);
        errorDiv.style.display = 'block';
        resultsDiv.style.display = 'none';
        errorMessage.textContent = message;
    }

    function getLatencyClass(latency) {
        if (!latency) return 'latency-bad';
        if (latency < 500) return 'latency-good';
        if (latency < 1000) return 'latency-medium';
        return 'latency-bad';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    console.log('✅ Event listeners attached');
});
