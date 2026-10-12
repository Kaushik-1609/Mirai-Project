/**
 * MSOT LEARN — Beta AI Learning Companion Client Controller
 * ChatGPT-like All-in-One Educational Assistant for B.Tech Cadets
 */

(function () {
    const STORAGE_KEY_PREFIX = 'MSOT_BETA_CONVERSATIONS_';

    class BetaAssistantController {
        constructor() {
            this.conversations = [];
            this.activeConversationId = null;
            this.activeMessages = [];
            this.isLoading = false;
            this.supabase = null;
            this.sidebarOpen = false;
        }

        init() {
            this.cacheDom();
            this.initSupabase();
            this.loadConversations();
            this.bindEvents();
            this.updateStudentDossierBadge();
            console.log('🤖 Beta AI Assistant Controller initialized.');
        }

        cacheDom() {
            this.container = document.getElementById('betaSection');
            this.conversationsListEl = document.getElementById('betaConversationsList');
            this.messagesContainerEl = document.getElementById('betaMessagesScroll');
            this.textareaEl = document.getElementById('betaInputTextarea');
            this.sendBtnEl = document.getElementById('betaSendBtn');
            this.sidebarEl = document.getElementById('betaSidebar');
            this.activeTitleEl = document.getElementById('betaActiveChatTitle');
            this.dossierBadgeEl = document.getElementById('betaStudentDossierBadge');
        }

        initSupabase() {
            if (window.supabaseClient) {
                this.supabase = window.supabaseClient;
            } else if (window.msotAuth?.supabaseClient) {
                this.supabase = window.msotAuth.supabaseClient;
            }
        }

        getCurrentUserId() {
            const session = window.msotAuth?.session;
            return session?.id || session?.email || 'guest_cadet';
        }

        getStorageKey() {
            return `${STORAGE_KEY_PREFIX}${this.getCurrentUserId()}`;
        }

        getStudentContext() {
            const session = window.msotAuth?.session || {};
            const state = window.msotState?.student || {};

            let completedGames = [];
            if (Array.isArray(state.completedGames)) {
                completedGames = state.completedGames.map(g => typeof g === 'string' ? g : g.title || g.id);
            }

            return {
                name: session.name || state.name || 'Utkarsh Raj',
                studentId: session.studentId || state.id || 'MSOT-2026-001',
                role: session.role || 'STUDENT',
                year: session.year || '2nd Year',
                semester: session.semester || 'Semester 4',
                section: session.section || 'Section Alpha',
                track: session.track || state.track || 'C++ Algorithms & DSA',
                level: state.level || 5,
                lifetimeXP: state.lifetimeXP || 685,
                weeklyXP: state.weeklyXP || 140,
                streakDays: state.streakDays || 6,
                freezeShields: state.freezeShields || 2,
                guildName: window.msotGuild?.activeGuild?.name || 'Ronin Vanguard',
                completedTopics: completedGames
            };
        }

        updateStudentDossierBadge() {
            if (!this.dossierBadgeEl) return;
            const ctx = this.getStudentContext();
            this.dossierBadgeEl.innerHTML = `
                <div class="beta-dossier-avatar">${window.msotAuth?.session?.avatar || '⚔️'}</div>
                <div class="beta-dossier-info">
                    <span class="beta-dossier-name">${ctx.name}</span>
                    <span class="beta-dossier-stats">LVL ${ctx.level} • ${ctx.lifetimeXP} XP • 🔥 ${ctx.streakDays}d</span>
                </div>
            `;
        }

        async loadConversations() {
            const userId = this.getCurrentUserId();

            // 1. Try fetching from Supabase if connected
            if (this.supabase && userId !== 'guest_cadet') {
                try {
                    const { data, error } = await this.supabase
                        .from('beta_conversations')
                        .select('*')
                        .eq('user_id', userId)
                        .order('updated_at', { ascending: false });

                    if (!error && Array.isArray(data) && data.length > 0) {
                        this.conversations = data;
                        this.saveConversationsToLocal();
                        this.renderConversationsList();
                        if (!this.activeConversationId && this.conversations.length > 0) {
                            this.selectConversation(this.conversations[0].id);
                        }
                        return;
                    }
                } catch (e) {
                    console.warn('Supabase beta conversations query fallback to local:', e.message);
                }
            }

            // 2. LocalStorage Fallback (fast & always available)
            try {
                const localData = localStorage.getItem(this.getStorageKey());
                if (localData) {
                    this.conversations = JSON.parse(localData);
                } else {
                    this.conversations = [];
                }
            } catch (e) {
                this.conversations = [];
            }

            this.renderConversationsList();

            if (this.conversations.length > 0 && !this.activeConversationId) {
                this.selectConversation(this.conversations[0].id);
            } else if (this.conversations.length === 0) {
                this.renderEmptyState();
            }
        }

        saveConversationsToLocal() {
            try {
                localStorage.setItem(this.getStorageKey(), JSON.stringify(this.conversations));
            } catch (e) {}
        }

        renderConversationsList() {
            if (!this.conversationsListEl) return;

            if (this.conversations.length === 0) {
                this.conversationsListEl.innerHTML = `
                    <div style="padding: 20px 10px; text-align: center; color: var(--text-muted); font-size: 11px;">
                        No previous chats yet.<br>Click "＋ New Chat" to start.
                    </div>
                `;
                return;
            }

            this.conversationsListEl.innerHTML = this.conversations.map(conv => {
                const isActive = conv.id === this.activeConversationId ? 'active' : '';
                return `
                    <div class="beta-conv-item ${isActive}" onclick="window.msotBeta && window.msotBeta.selectConversation('${conv.id}')">
                        <div class="beta-conv-title-box">
                            <span>💬</span>
                            <span title="${this.escapeHtml(conv.title)}">${this.escapeHtml(conv.title)}</span>
                        </div>
                        <button type="button" class="beta-conv-delete-btn" onclick="event.stopPropagation(); window.msotBeta && window.msotBeta.deleteConversation('${conv.id}')" title="Delete conversation">✕</button>
                    </div>
                `;
            }).join('');
        }

        async selectConversation(id) {
            this.activeConversationId = id;
            this.renderConversationsList();

            const conv = this.conversations.find(c => c.id === id);
            if (this.activeTitleEl && conv) {
                this.activeTitleEl.innerHTML = `<span>💬</span><span>${this.escapeHtml(conv.title)}</span>`;
            }

            // Close mobile sidebar if open
            if (this.sidebarEl) {
                this.sidebarEl.classList.remove('open');
                this.sidebarOpen = false;
            }

            // Load messages for this conversation
            await this.loadMessagesForConversation(id);
        }

        async loadMessagesForConversation(convId) {
            this.activeMessages = [];
            const userId = this.getCurrentUserId();

            // 1. Try Supabase
            if (this.supabase && userId !== 'guest_cadet') {
                try {
                    const { data, error } = await this.supabase
                        .from('beta_messages')
                        .select('*')
                        .eq('conversation_id', convId)
                        .order('created_at', { ascending: true });

                    if (!error && Array.isArray(data)) {
                        this.activeMessages = data;
                        this.renderMessages();
                        return;
                    }
                } catch (e) {}
            }

            // 2. LocalStorage Fallback
            try {
                const msgKey = `MSOT_BETA_MSGS_${convId}`;
                const localMsgs = localStorage.getItem(msgKey);
                if (localMsgs) {
                    this.activeMessages = JSON.parse(localMsgs);
                } else {
                    this.activeMessages = [];
                }
            } catch (e) {
                this.activeMessages = [];
            }

            this.renderMessages();
        }

        saveMessagesToLocal(convId) {
            try {
                const msgKey = `MSOT_BETA_MSGS_${convId}`;
                localStorage.setItem(msgKey, JSON.stringify(this.activeMessages));
            } catch (e) {}
        }

        async createNewChat() {
            const newId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            const newConv = {
                id: newId,
                user_id: this.getCurrentUserId(),
                title: 'New Learning Session',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            this.conversations.unshift(newConv);
            this.saveConversationsToLocal();

            // Sync to Supabase
            if (this.supabase && this.getCurrentUserId() !== 'guest_cadet') {
                try {
                    await this.supabase.from('beta_conversations').insert({
                        id: newId,
                        user_id: this.getCurrentUserId(),
                        title: newConv.title
                    });
                } catch (e) {}
            }

            this.activeConversationId = newId;
            this.activeMessages = [];
            this.saveMessagesToLocal(newId);

            this.renderConversationsList();
            if (this.activeTitleEl) {
                this.activeTitleEl.innerHTML = `<span>💬</span><span>New Learning Session</span>`;
            }
            this.renderEmptyState();

            if (this.textareaEl) {
                this.textareaEl.focus();
            }
        }

        async deleteConversation(id) {
            this.conversations = this.conversations.filter(c => c.id !== id);
            this.saveConversationsToLocal();

            try {
                localStorage.removeItem(`MSOT_BETA_MSGS_${id}`);
            } catch (e) {}

            // Sync delete to Supabase
            if (this.supabase && this.getCurrentUserId() !== 'guest_cadet') {
                try {
                    await this.supabase.from('beta_conversations').delete().eq('id', id);
                    await this.supabase.from('beta_messages').delete().eq('conversation_id', id);
                } catch (e) {}
            }

            if (this.activeConversationId === id) {
                if (this.conversations.length > 0) {
                    this.selectConversation(this.conversations[0].id);
                } else {
                    this.activeConversationId = null;
                    this.activeMessages = [];
                    this.renderConversationsList();
                    this.renderEmptyState();
                }
            } else {
                this.renderConversationsList();
            }
        }

        clearAllConversations() {
            if (!confirm('Are you sure you want to clear all Beta chat history?')) return;
            this.conversations = [];
            this.saveConversationsToLocal();
            this.activeConversationId = null;
            this.activeMessages = [];
            this.renderConversationsList();
            this.renderEmptyState();
        }

        renderEmptyState() {
            if (!this.messagesContainerEl) return;
            const ctx = this.getStudentContext();

            this.messagesContainerEl.innerHTML = `
                <div class="beta-empty-state">
                    <div class="beta-empty-crest">🤖</div>
                    <h2 class="beta-empty-title">Greetings, Cadet ${this.escapeHtml(ctx.name)}!</h2>
                    <p class="beta-empty-subtitle">
                        I am <strong>Beta</strong>, your dedicated B.Tech engineering tutor and MSOT learning companion. Ask me anything about programming, algorithms, math, exam prep, or your academy progress.
                    </p>

                    <div class="beta-prompt-suggestions-grid">
                        <div class="beta-suggestion-card" onclick="window.msotBeta && window.msotBeta.sendQuickPrompt('Explain recursion in simple language with a C++ example')">
                            <span class="beta-suggestion-tag">💡 ALGORITHMIC CONCEPTS</span>
                            <span class="beta-suggestion-text">"Explain recursion in simple language with a C++ example"</span>
                        </div>
                        <div class="beta-suggestion-card" onclick="window.msotBeta && window.msotBeta.sendQuickPrompt('What should I study today based on my level and track?')">
                            <span class="beta-suggestion-tag">🎯 PERSONALIZED STUDY</span>
                            <span class="beta-suggestion-text">"What should I study today based on my level and track?"</span>
                        </div>
                        <div class="beta-suggestion-card" onclick="window.msotBeta && window.msotBeta.sendQuickPrompt('Help me understand eigenvalues and eigenvectors intuitively')">
                            <span class="beta-suggestion-tag">📐 ENGINEERING MATHEMATICS</span>
                            <span class="beta-suggestion-text">"Help me understand eigenvalues and eigenvectors intuitively"</span>
                        </div>
                        <div class="beta-suggestion-card" onclick="window.msotBeta && window.msotBeta.sendQuickPrompt('Explain C++ pointers vs references with practical code')">
                            <span class="beta-suggestion-tag">⚡ C++ CORE MEMORY</span>
                            <span class="beta-suggestion-text">"Explain C++ pointers vs references with practical code"</span>
                        </div>
                        <div class="beta-suggestion-card" onclick="window.msotBeta && window.msotBeta.sendQuickPrompt('Make me a 7-day B.Tech accelerated study plan for exams')">
                            <span class="beta-suggestion-tag">📅 STUDY PLANNING</span>
                            <span class="beta-suggestion-text">"Make me a 7-day B.Tech accelerated study plan for exams"</span>
                        </div>
                        <div class="beta-suggestion-card" onclick="window.msotBeta && window.msotBeta.sendQuickPrompt('How can I level up and earn more XP in MSOT Learn?')">
                            <span class="beta-suggestion-tag">⚔️ ACADEMY PROGRESS</span>
                            <span class="beta-suggestion-text">"How can I level up and earn more XP in MSOT Learn?"</span>
                        </div>
                    </div>
                </div>
            `;
        }

        renderMessages() {
            if (!this.messagesContainerEl) return;

            if (this.activeMessages.length === 0) {
                this.renderEmptyState();
                return;
            }

            const html = this.activeMessages.map(msg => {
                const isUser = msg.role === 'user';
                const avatar = isUser ? (window.msotAuth?.session?.avatar || '⚔️') : '🤖';
                const formattedContent = isUser ? this.escapeHtml(msg.content) : this.formatMarkdown(msg.content);

                return `
                    <div class="beta-message-row ${msg.role}">
                        <div class="beta-msg-avatar">${avatar}</div>
                        <div class="beta-msg-bubble">
                            ${formattedContent}
                            ${!isUser ? this.renderFollowUpChips(msg.content) : ''}
                        </div>
                    </div>
                `;
            }).join('');

            this.messagesContainerEl.innerHTML = html;
            this.scrollToBottom();
        }

        renderFollowUpChips(content) {
            const c = (content || '').toLowerCase();
            const chips = [];

            if (c.includes('recursion')) {
                chips.push('Give me 3 practice recursion problems');
                chips.push('Explain the call stack mechanics');
                chips.push('Recursion vs Iteration trade-offs');
            } else if (c.includes('eigen')) {
                chips.push('Show me a 2x2 matrix calculation step-by-step');
                chips.push('How does PCA use Eigenvectors?');
            } else if (c.includes('pointer')) {
                chips.push('Explain smart pointers (unique_ptr, shared_ptr)');
                chips.push('What causes a segmentation fault?');
            } else if (c.includes('study plan') || c.includes('level')) {
                chips.push('How do I clear the 17 Sacred Trials?');
                chips.push('What are streak shield freeze tokens?');
            } else {
                chips.push('Can you give a practical code example?');
                chips.push('Explain this for an absolute beginner');
                chips.push('How does this appear in semester exams?');
            }

            return `
                <div class="beta-followup-chips-row">
                    ${chips.slice(0, 3).map(chip => `
                        <button type="button" class="beta-followup-chip" onclick="window.msotBeta && window.msotBeta.sendQuickPrompt('${this.escapeHtml(chip)}')">
                            ✦ ${this.escapeHtml(chip)}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        scrollToBottom() {
            if (this.messagesContainerEl) {
                setTimeout(() => {
                    this.messagesContainerEl.scrollTo({
                        top: this.messagesContainerEl.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 50);
            }
        }

        sendQuickPrompt(text) {
            if (this.textareaEl) {
                this.textareaEl.value = text;
                this.handleSendMessage();
            }
        }

        async handleSendMessage() {
            if (this.isLoading) return;
            const text = (this.textareaEl?.value || '').trim();
            if (!text) return;

            // Ensure we have an active conversation
            if (!this.activeConversationId) {
                await this.createNewChat();
            }

            // 1. Add user message
            const userMsg = {
                id: 'msg_' + Date.now(),
                conversation_id: this.activeConversationId,
                user_id: this.getCurrentUserId(),
                role: 'user',
                content: text,
                created_at: new Date().toISOString()
            };

            this.activeMessages.push(userMsg);
            this.textareaEl.value = '';
            this.adjustTextareaHeight();
            this.renderMessages();

            // Update conversation title if first message
            const currentConv = this.conversations.find(c => c.id === this.activeConversationId);
            if (currentConv && (currentConv.title === 'New Learning Session' || this.activeMessages.length <= 2)) {
                currentConv.title = text.length > 32 ? text.substring(0, 30) + '...' : text;
                this.saveConversationsToLocal();
                this.renderConversationsList();
                if (this.activeTitleEl) {
                    this.activeTitleEl.innerHTML = `<span>💬</span><span>${this.escapeHtml(currentConv.title)}</span>`;
                }
            }

            // Save user msg locally & Supabase
            this.saveMessagesToLocal(this.activeConversationId);
            if (this.supabase && this.getCurrentUserId() !== 'guest_cadet') {
                this.supabase.from('beta_messages').insert({
                    conversation_id: this.activeConversationId,
                    user_id: this.getCurrentUserId(),
                    role: 'user',
                    content: text
                }).catch(() => {});
            }

            // 2. Render Typing indicator
            this.isLoading = true;
            this.updateSendButtonState();
            this.appendTypingIndicator();

            // 3. Request AI Response from serverless endpoint /api/beta
            const studentContext = this.getStudentContext();
            const messagePayload = this.activeMessages.map(m => ({ role: m.role, content: m.content }));

            let assistantReply = '';
            try {
                const response = await fetch('/api/beta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: messagePayload,
                        studentContext: studentContext
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    assistantReply = data?.reply || '';
                } else {
                    throw new Error('Endpoint returned ' + response.status);
                }
            } catch (err) {
                console.warn('Backend API note, using built-in tutor reasoning:', err.message);
                assistantReply = this.generateLocalFallbackTutorReply(text, studentContext);
            }

            this.removeTypingIndicator();
            this.isLoading = false;
            this.updateSendButtonState();

            if (!assistantReply) {
                assistantReply = "I am reviewing your engineering inquiry. Let's break this down step-by-step together.";
            }

            // 4. Append Assistant Message
            const assistantMsg = {
                id: 'msg_ai_' + Date.now(),
                conversation_id: this.activeConversationId,
                user_id: this.getCurrentUserId(),
                role: 'assistant',
                content: assistantReply,
                created_at: new Date().toISOString()
            };

            this.activeMessages.push(assistantMsg);
            this.saveMessagesToLocal(this.activeConversationId);
            this.renderMessages();

            // Sync assistant msg to Supabase
            if (this.supabase && this.getCurrentUserId() !== 'guest_cadet') {
                this.supabase.from('beta_messages').insert({
                    conversation_id: this.activeConversationId,
                    user_id: this.getCurrentUserId(),
                    role: 'assistant',
                    content: assistantReply
                }).catch(() => {});
            }

            // Gentle audio chime
            try {
                if (window.miraiAudio && typeof window.miraiAudio.playTempleBell === 'function') {
                    // Soft chime
                }
            } catch (e) {}
        }

        appendTypingIndicator() {
            if (!this.messagesContainerEl) return;
            const div = document.createElement('div');
            div.className = 'beta-message-row assistant typing-temp';
            div.id = 'betaTypingRow';
            div.innerHTML = `
                <div class="beta-msg-avatar">🤖</div>
                <div class="beta-msg-bubble" style="padding: 10px 16px;">
                    <div class="beta-typing-indicator">
                        <div class="beta-typing-dot"></div>
                        <div class="beta-typing-dot"></div>
                        <div class="beta-typing-dot"></div>
                    </div>
                </div>
            `;
            this.messagesContainerEl.appendChild(div);
            this.scrollToBottom();
        }

        removeTypingIndicator() {
            const el = document.getElementById('betaTypingRow');
            if (el) el.remove();
        }

        updateSendButtonState() {
            if (this.sendBtnEl) {
                this.sendBtnEl.disabled = this.isLoading;
                this.sendBtnEl.innerHTML = this.isLoading ? '⏳' : '➤';
            }
        }

        adjustTextareaHeight() {
            if (!this.textareaEl) return;
            this.textareaEl.style.height = 'auto';
            this.textareaEl.style.height = Math.min(this.textareaEl.scrollHeight, 130) + 'px';
        }

        bindEvents() {
            if (this.textareaEl) {
                this.textareaEl.addEventListener('input', () => this.adjustTextareaHeight());
                this.textareaEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.handleSendMessage();
                    }
                });
            }

            if (this.sendBtnEl) {
                this.sendBtnEl.addEventListener('click', () => this.handleSendMessage());
            }

            // Listen for session changes to update badge
            window.addEventListener('storage', () => {
                this.updateStudentDossierBadge();
            });
        }

        toggleSidebar() {
            if (!this.sidebarEl) return;
            this.sidebarOpen = !this.sidebarOpen;
            if (this.sidebarOpen) {
                this.sidebarEl.classList.add('open');
            } else {
                this.sidebarEl.classList.remove('open');
            }
        }

        initView() {
            this.updateStudentDossierBadge();
            this.loadConversations();
            if (this.textareaEl) {
                setTimeout(() => this.textareaEl.focus(), 150);
            }
        }

        copyCodeToClipboard(btn, codeText) {
            try {
                navigator.clipboard.writeText(codeText);
                const original = btn.innerText;
                btn.innerText = '✓ Copied!';
                setTimeout(() => { btn.innerText = original; }, 2000);
            } catch (e) {
                btn.innerText = '✓ Copied';
            }
        }

        formatMarkdown(text) {
            if (!text) return '';

            // Handle code blocks first
            const codeBlocks = [];
            let processed = text.replace(/```([a-zA-Z0-9_\-\+\#]*)\n([\s\S]*?)```/g, (match, lang, code) => {
                const idx = codeBlocks.length;
                const safeLang = lang || 'code';
                const safeCode = this.escapeHtml(code.trim());
                const rawAttr = encodeURIComponent(code.trim());
                codeBlocks.push(`
                    <div class="beta-code-wrapper">
                        <div class="beta-code-header">
                            <span>${safeLang.toUpperCase()}</span>
                            <button type="button" class="beta-copy-btn" onclick="window.msotBeta && window.msotBeta.copyCodeToClipboard(this, decodeURIComponent('${rawAttr}'))">📋 Copy Code</button>
                        </div>
                        <pre class="beta-code-block"><code>${safeCode}</code></pre>
                    </div>
                `);
                return `___CODE_BLOCK_${idx}___`;
            });

            // Inline code
            processed = processed.replace(/`([^`]+)`/g, (m, c) => `<code class="beta-inline-code">${this.escapeHtml(c)}</code>`);

            // Headers
            processed = processed.replace(/^### (.*$)/gim, '<h3>$1</h3>');
            processed = processed.replace(/^## (.*$)/gim, '<h2>$1</h2>');
            processed = processed.replace(/^# (.*$)/gim, '<h1>$1</h1>');

            // Blockquotes
            processed = processed.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

            // Bold & Italic
            processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

            // Unordered list items
            processed = processed.replace(/^\* (.*$)/gim, '<li>$1</li>');
            processed = processed.replace(/^- (.*$)/gim, '<li>$1</li>');

            // Tables simple formatting
            processed = processed.replace(/\n\|(.*)\|\n/g, (match) => {
                return match; // Simple preserve
            });

            // Line breaks
            processed = processed.replace(/\n\n/g, '<br><br>');

            // Restore code blocks
            codeBlocks.forEach((block, idx) => {
                processed = processed.replace(`___CODE_BLOCK_${idx}___`, block);
            });

            return processed;
        }

        escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        generateLocalFallbackTutorReply(prompt, student) {
            const q = prompt.toLowerCase();
            const name = student?.name || 'Cadet';
            const level = student?.level || 5;
            const xp = student?.lifetimeXP || 685;
            const streak = student?.streakDays || 6;
            const track = student?.track || 'C++ Algorithms & DSA';

            if (q.includes('level') || q.includes('my xp') || q.includes('my streak')) {
                return `### ⚔️ Verified Cadet Dossier for ${name}\n\n* **Academic Level:** Level ${level}\n* **Experience:** ${xp} XP\n* **Daily Streak:** ${streak} Days 🔥\n* **Track:** ${track}\n\n> 💡 **Next Milestone:** Level up to Level ${level + 1} by solving today's **Daily Speed Trial** (+15 XP) and submitting a **Weekend Lab** assignment!`;
            }

            if (q.includes('recursion')) {
                return `### 🌀 Understanding Recursion in Simple Language\n\nRecursion is when a function calls itself to solve a smaller version of the problem until it hits a stopping condition called the **Base Case**.\n\n\`\`\`cpp\n#include <iostream>\n\nint factorial(int n) {\n    // 1. BASE CASE\n    if (n <= 1) return 1;\n    // 2. RECURSIVE CALL\n    return n * factorial(n - 1);\n}\n\nint main() {\n    std::cout << "5! = " << factorial(5) << std::endl; // 120\n    return 0;\n}\n\`\`\`\n\n*Key rule:* Always specify your base case first to avoid **Stack Overflow**!`;
            }

            if (q.includes('eigen')) {
                return `### 📐 Eigenvalues & Eigenvectors\n\nWhen a matrix $A$ transforms a vector $v$, it usually changes both its direction and magnitude. An **Eigenvector** is a special vector whose direction **does not change**—it only gets scaled by a factor $\\lambda$ (the **Eigenvalue**):\n\n$$A v = \\lambda v$$\n\nUsed everywhere in **Google PageRank**, **Principal Component Analysis (PCA)**, and **Structural Engineering**!`;
            }

            if (q.includes('pointer')) {
                return `### ⚡ C++ Pointers vs References\n\n* **Pointer (\`int*\`):** Holds a memory address. Can be \`nullptr\`, can be reassigned, supports pointer arithmetic.\n* **Reference (\`int&\`):** An alias/nickname for an existing variable. Cannot be null, cannot be rebound.\n\n\`\`\`cpp\nint a = 10;\nint* p = &a; // pointer to a's address\nint& r = a;  // reference alias for a\n\`\`\``;
            }

            return `### 🎓 Beta Academic Guidance\n\nHello **${name}**! Regarding your inquiry about:\n> *"${prompt}"*\n\nHere is how we analyze this systematically:\n1. **Core Fundamentals:** We break the problem down into base components, memory footprint, and time complexity $O(n)$.\n2. **Engineering Best Practices:** Always write clean code with edge-case handling.\n\nWould you like a full C++ implementation or an exam revision summary?`;
        }
    }

    window.msotBeta = new BetaAssistantController();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.msotBeta.init());
    } else {
        window.msotBeta.init();
    }
})();
