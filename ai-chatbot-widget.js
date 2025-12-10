/**
 * AI Chatbot Widget - WebLLM Powered
 * One-line integration: <script src="ai-chatbot-widget.js"></script>
 * 
 * no right to change the code!
 * Features:
 * - Runs 100% locally in browser (WebLLM + WebGPU)
 * - No API keys or server required
 * - Dark mode support
 * - Persistent chat history
 * - Multiple AI model options
 * - Mobile-friendly responsive design
 */

(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.AIWidgetInitialized) return;
    window.AIWidgetInitialized = true;
    
    // ============================================
    // CONFIGURATION
    // ============================================
    
    const AVAILABLE_MODELS = [
        {
            id: "SmolLM2-135M-Instruct-q0f16-MLC",
            name: "SmolLM 135M",
            size: "~80MB",
            params: "135M",
            speed: "⚡⚡⚡ Ultra Fast",
            description: "Tiniest model, lightning fast, good for simple tasks",
            recommended: "Quick responses, low bandwidth"
        },
        {
            id: "Qwen2-0.5B-Instruct-q4f16_1-MLC",
            name: "Qwen2 0.5B",
            size: "~300MB",
            params: "500M",
            speed: "⚡⚡⚡ Very Fast",
            description: "Small but capable, balanced performance",
            recommended: "General chat, quick tasks"
        },
        {
            id: "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
            name: "TinyLlama 1.1B",
            size: "~600MB",
            params: "1.1B",
            speed: "⚡⚡ Fast",
            description: "Good balance of speed and quality",
            recommended: "Conversations, basic coding"
        },
        {
            id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
            name: "Llama 3.2 1B",
            size: "~600MB",
            params: "1B",
            speed: "⚡⚡ Fast",
            description: "Meta's efficient small model, high quality",
            recommended: "Conversations, reasoning"
        },
        {
            id: "gemma-2b-it-q4f16_1-MLC",
            name: "Gemma 2B",
            size: "~1.3GB",
            params: "2B",
            speed: "⚡⚡ Fast",
            description: "Google's compact model, well-rounded",
            recommended: "General purpose, coding help"
        },
        {
            id: "Phi-2-q4f16_1-MLC",
            name: "Phi-2",
            size: "~1.5GB",
            params: "2.7B",
            speed: "⚡ Medium",
            description: "Microsoft's smart small model, great reasoning",
            recommended: "Math, coding, analysis"
        },
        {
            id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
            name: "Llama 3.2 3B",
            size: "~1.8GB",
            params: "3B",
            speed: "⚡ Medium",
            description: "Powerful small model from Meta",
            recommended: "Complex tasks, detailed responses"
        },
        {
            id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
            name: "Qwen2.5 3B",
            size: "~1.8GB",
            params: "3B",
            speed: "⚡ Medium",
            description: "Latest Qwen, excellent multilingual support",
            recommended: "Multi-language, detailed chat"
        },
        {
            id: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
            name: "Phi-3 Mini",
            size: "~2.2GB",
            params: "3.8B",
            speed: "⚡ Medium",
            description: "Advanced reasoning, strong performance",
            recommended: "Complex reasoning, coding"
        },
        {
            id: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
            name: "Mistral 7B",
            size: "~4GB",
            params: "7B",
            speed: "🐌 Slower (Powerful)",
            description: "Large powerful model, highest quality",
            recommended: "Best quality, complex tasks"
        },
        {
            id: "SmolLM2-360M-Instruct-q4f32_1-MLC",
            name: "SmolLM2-360M",
            size: "~300MB",
            params: "360M",
            speed: "⚡⚡⚡ Very Fast",
            description: "Small but capable, balanced performance",
            recommended: "General chat, quick tasks"
        },
    ];
    
    const SYSTEM_PROMPT = "You are a helpful, friendly AI assistant. You provide concise, accurate, and helpful responses. You are knowledgeable, polite, and aim to assist users with their questions.";
    
    // ============================================
    // STATE
    // ============================================
    
    let engine = null;
    let isModelLoaded = false;
    let chatHistory = [];
    let selectedModel = localStorage.getItem('aiWidget_selectedModel') || null;
    
    // ============================================
    // INJECT TAILWIND CSS
    // ============================================
    
    const tailwindScript = document.createElement('script');
    tailwindScript.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(tailwindScript);
    
    // ============================================
    // INJECT CUSTOM STYLES
    // ============================================
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes aiWidgetSlideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes aiWidgetBounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes aiWidgetPing {
            75%, 100% {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .ai-widget-bubble-enter {
            animation: aiWidgetSlideUp 0.3s ease-out;
        }
        
        .ai-widget-messages {
            scroll-behavior: smooth;
        }
        
        .ai-widget-messages::-webkit-scrollbar {
            width: 6px;
        }
        
        .ai-widget-messages::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .ai-widget-messages::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }
        
        .dark .ai-widget-messages::-webkit-scrollbar-thumb {
            background: #475569;
        }
        
        .ai-widget-typing-cursor::after {
            content: '▋';
            animation: aiWidgetBlink 1s step-end infinite;
        }
        
        @keyframes aiWidgetBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        
        .ai-widget-ping {
            animation: aiWidgetPing 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
    `;
    document.head.appendChild(styleSheet);
    
    // ============================================
    // CREATE WIDGET HTML
    // ============================================
    
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'ai-chatbot-widget-container';
    widgetContainer.innerHTML = `
        <!-- Chat Bubble Button -->
        <div id="aiWidgetBubble" class="fixed bottom-6 right-6 z-[9999] cursor-pointer group">
            <div class="relative">
                <div class="absolute inset-0 bg-blue-500 rounded-full opacity-75 group-hover:opacity-100 ai-widget-ping"></div>
                <div class="relative bg-gradient-to-r from-blue-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Chat Window -->
        <div id="aiWidgetWindow" class="fixed bottom-6 right-6 z-[9998] hidden">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transition-colors duration-300 
                        w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)]
                        sm:w-96 flex flex-col overflow-hidden">
                
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-white font-semibold">AI Assistant</h3>
                            <p class="text-white/80 text-xs" id="aiWidgetStatus">Initializing...</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <button id="aiWidgetDarkMode" class="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Toggle dark mode">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        </button>
                        
                        <button id="aiWidgetClear" class="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Clear chat">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        
                        <button id="aiWidgetClose" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <!-- Messages -->
                <div id="aiWidgetMessages" class="flex-1 overflow-y-auto p-4 space-y-4 ai-widget-messages bg-gray-50 dark:bg-gray-900 transition-colors duration-300"></div>
                
                <!-- Model Selector -->
                <div id="aiWidgetModelSelector" class="absolute inset-0 bg-white dark:bg-gray-800 z-10 flex flex-col hidden transition-colors duration-300">
                    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-1">Choose AI Model</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Select a model based on your needs and device capability</p>
                    </div>
                    
                    <div id="aiWidgetModelList" class="flex-1 overflow-y-auto p-4 space-y-3"></div>
                    
                    <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <p class="text-xs text-gray-600 dark:text-gray-400 text-center">
                            ⚠️ Model downloads once, then cached. Larger = better quality but slower.
                        </p>
                    </div>
                </div>
                
                <!-- Input -->
                <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
                    <div class="flex space-x-2">
                        <input 
                            type="text" 
                            id="aiWidgetInput" 
                            placeholder="Type your message..." 
                            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300"
                        />
                        <button 
                            id="aiWidgetSend" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <span>Send</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // ============================================
    // INITIALIZE WHEN DOM IS READY
    // ============================================
    
    function initWidget() {
        document.body.appendChild(widgetContainer);
        
        // Get DOM elements
        const bubble = document.getElementById('aiWidgetBubble');
        const window = document.getElementById('aiWidgetWindow');
        const closeBtn = document.getElementById('aiWidgetClose');
        const input = document.getElementById('aiWidgetInput');
        const sendBtn = document.getElementById('aiWidgetSend');
        const messages = document.getElementById('aiWidgetMessages');
        const clearBtn = document.getElementById('aiWidgetClear');
        const darkModeBtn = document.getElementById('aiWidgetDarkMode');
        const status = document.getElementById('aiWidgetStatus');
        const modelSelector = document.getElementById('aiWidgetModelSelector');
        const modelList = document.getElementById('aiWidgetModelList');
        
        // Dark mode
        if (localStorage.getItem('aiWidget_darkMode') === 'true') {
            widgetContainer.classList.add('dark');
        }
        
        darkModeBtn.addEventListener('click', () => {
            widgetContainer.classList.toggle('dark');
            const isDark = widgetContainer.classList.contains('dark');
            localStorage.setItem('aiWidget_darkMode', isDark);
        });
        
        // Toggle window
        bubble.addEventListener('click', () => {
            window.classList.toggle('hidden');
            bubble.classList.toggle('hidden');
            
            if (!window.classList.contains('hidden')) {
                if (!selectedModel && !isModelLoaded) {
                    showModelSelector();
                } else if (!isModelLoaded && !engine) {
                    initializeModel(selectedModel);
                } else {
                    input.focus();
                }
            }
        });
        
        closeBtn.addEventListener('click', () => {
            window.classList.add('hidden');
            bubble.classList.remove('hidden');
        });
        
        // Model selection
        function showModelSelector() {
            modelSelector.classList.remove('hidden');
            modelList.innerHTML = '';
            
            AVAILABLE_MODELS.forEach(model => {
                const card = document.createElement('div');
                card.className = 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-2 border-transparent hover:border-blue-500';
                card.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="font-semibold text-gray-800 dark:text-white">${model.name}</h4>
                            <p class="text-xs text-gray-600 dark:text-gray-400">${model.params} parameters • ${model.size}</p>
                        </div>
                        <span class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">${model.speed}</span>
                    </div>
                    <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">${model.description}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">✓ Best for: ${model.recommended}</p>
                `;
                
                card.addEventListener('click', () => {
                    selectedModel = model.id;
                    localStorage.setItem('aiWidget_selectedModel', model.id);
                    modelSelector.classList.add('hidden');
                    addMessage('system', `Selected: ${model.name} (${model.size}). Loading model...`);
                    initializeModel(model.id);
                });
                
                modelList.appendChild(card);
            });
        }
        
        // Initialize model
        async function initializeModel(modelId) {
            try {
                const modelInfo = AVAILABLE_MODELS.find(m => m.id === modelId);
                const modelName = modelInfo ? modelInfo.name : 'AI model';
                
                updateStatus(`Loading ${modelName}...`);
                
                // Import WebLLM dynamically
                const { CreateMLCEngine } = await import('https://esm.run/@mlc-ai/web-llm');
                
                engine = await CreateMLCEngine(modelId, {
                    initProgressCallback: (progress) => {
                        updateStatus(`Loading: ${Math.round(progress.progress * 100)}%`);
                    }
                });
                
                isModelLoaded = true;
                updateStatus('Ready to chat!');
                
                if (chatHistory.length === 0) {
                    addMessage('ai', `Hello! I'm your local AI assistant running ${modelName}. How can I help you?`);
                }
                
                input.focus();
                
            } catch (error) {
                console.error('Model load error:', error);
                updateStatus('Failed to load');
                addMessage('system', `⚠️ Error: ${error.message}. WebGPU required (Chrome 113+, Edge 113+, Safari 18+).`);
            }
        }
        
        // Messages
        function addMessage(role, content, isStreaming = false) {
            const div = document.createElement('div');
            div.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} ai-widget-bubble-enter`;
            
            const bubble = document.createElement('div');
            bubble.className = `max-w-[80%] rounded-2xl px-4 py-2 ${
                role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : role === 'ai'
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm'
            } transition-colors duration-300`;
            
            bubble.textContent = content;
            if (isStreaming) bubble.classList.add('ai-widget-typing-cursor');
            
            div.appendChild(bubble);
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
            
            return bubble;
        }
        
        function updateStatus(text) {
            status.textContent = text;
        }
        
        // Send message
        async function sendMessage() {
            const message = input.value.trim();
            if (!message || !isModelLoaded) return;
            
            addMessage('user', message);
            chatHistory.push({ role: 'user', content: message });
            
            input.value = '';
            sendBtn.disabled = true;
            updateStatus('Thinking...');
            
            try {
                const conversationMessages = [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...chatHistory
                ];
                
                let aiResponse = '';
                const aiBubble = addMessage('ai', '', true);
                
                const asyncChunkGenerator = await engine.chat.completions.create({
                    messages: conversationMessages,
                    temperature: 0.7,
                    max_tokens: 512,
                    stream: true,
                });
                
                for await (const chunk of asyncChunkGenerator) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    aiResponse += content;
                    aiBubble.textContent = aiResponse;
                    messages.scrollTop = messages.scrollHeight;
                }
                
                aiBubble.classList.remove('ai-widget-typing-cursor');
                chatHistory.push({ role: 'assistant', content: aiResponse });
                localStorage.setItem('aiWidget_chatHistory', JSON.stringify(chatHistory));
                updateStatus('Ready to chat!');
                
            } catch (error) {
                console.error('Chat error:', error);
                addMessage('system', `⚠️ Error: ${error.message}`);
                updateStatus('Error');
            } finally {
                sendBtn.disabled = false;
                input.focus();
            }
        }
        
        // Event listeners
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear all chat history?')) {
                chatHistory = [];
                messages.innerHTML = '';
                localStorage.removeItem('aiWidget_chatHistory');
                addMessage('system', 'Chat cleared.');
            }
        });
        
        // Load history
        const saved = localStorage.getItem('aiWidget_chatHistory');
        if (saved) {
            try {
                chatHistory = JSON.parse(saved);
                chatHistory.forEach(msg => {
                    if (msg.role === 'user') addMessage('user', msg.content);
                    else if (msg.role === 'assistant') addMessage('ai', msg.content);
                });
            } catch (e) {
                console.error('Failed to load history:', e);
            }
        }
        
        // Initial message
        if (chatHistory.length === 0) {
            addMessage('system', '👋 Click the bubble to select an AI model and start chatting!');
        }
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
    
})();
