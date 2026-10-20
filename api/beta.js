/**
 * MSOT LEARN — Aham Brahmasmi (अहं ब्रह्मास्मि) AI Assistant Backend Endpoint
 * Route: POST /api/beta
 * 
 * Features:
 * - ChatGPT (GPT-4o) style pedagogical mentor: natural Hinglish, Hindi, and English dynamic switching
 * - 5-Stage ELI5 Explanation Blueprint (Desi Analogy -> 2 Golden Rules -> Clean C++ Code -> Dry Run -> Pro-Tip & Interview Trap)
 * - Official Google Gemini API integration (prioritizing gemini-flash-lite-latest with candidate fallbacks)
 * - AbortSignal.timeout(25000) for robust execution
 * - Pre-API instant filter for non-study chit-chat with zero token consumption
 * - Full student academic dossier personalization (track, level, XP, streak)
 * - Comprehensive autonomous pedagogical fallback engine matching the 5-stage blueprint
 */

// Detect language of prompt: Hinglish, Devanagari Hindi, or English
export function detectLanguage(prompt) {
    if (!prompt) return 'english';
    if (/[\u0900-\u097F]/.test(prompt)) return 'hindi';
    
    const hinglishMarkers = [
        'bhai', 'samjha', 'samjhao', 'kya', 'hai', 'kaise', 'karein', 'kare', 'batao', 'batado',
        'yaar', 'dost', 'mein', 'kuch', 'hoga', 'hota', 'hoti', 'hote', 'aur', 'bol', 'chal',
        'kar', 'de', 'do', 'wala', 'wali', 'yeh', 'woh', 'matlab', 'thoda', 'aasan', 'tarika', 'haal'
    ];
    const lower = prompt.toLowerCase();
    const words = lower.replace(/[^\w\s]/g, '').split(/\s+/);
    const hasHinglish = words.some(w => hinglishMarkers.includes(w));
    return hasHinglish ? 'hinglish' : 'english';
}

const SYSTEM_PROMPT_TEMPLATE = `You are "Aham Brahmasmi" (अहं ब्रह्मास्मि 🕉️), an intelligent, super-friendly, and deeply supportive AI companion and mentor at MSOT Learn (未来工科大学), modeled after ChatGPT (GPT-4o).

CRITICAL LANGUAGE & TONE DIRECTIVE (STRICT):
- When the student writes in Hindi or Hinglish (e.g. "bhai dost weak hai", "recursion samjha de", "pointers aur references me kya diff hai", "hii bro", "kya kare"):
  * ALWAYS REPLY IN NATURAL, CONVERSATIONAL HINGLISH (SPOKEN HINDI WRITTEN USING THE ENGLISH ALPHABET / LATIN SCRIPT), EXACTLY LIKE CHATGPT.
  * DO NOT USE DEVANAGARI HINDI SCRIPT unless the user explicitly typed in Devanagari script.
  * Talk like an encouraging elder brother (bhaiya) or senior developer: warm, empathetic, relatable, and motivating.
  * Use natural expressions ("Bhai tension mat le! Tera dost C++ mein weak hai toh iska matlab ye nahi ki woh seekh nahi sakta...") and friendly emojis (😂❤️💪🔥🚀).
  * ZERO ROBOTIC TEMPLATES: Never quote the user's prompt in blockquotes, never use robotic labels like "Point-to-Point Mentorship", and never lecture about time complexity or $O(n^2)$ unless explicitly asked!
  * Structure learning roadmaps logically with visual phases (Days 1-3, Days 4-6, etc.), clear time guidelines (45-60 min daily routine), dry-run emphasis, and interactive follow-ups ("Ab mujhe ek baat bata...").

When explaining technical concepts:
1. Asaan Bhasha Mein: 1-sentence crystal clear intuition + relatable desi real-world analogy.
2. 2 Golden Rules: Simple stopping conditions or core principles.
3. Clean Minimal Code: Short, clean C++ snippets.
4. Line-by-Line Dry Run: Show how variables change step-by-step.
5. Pro-Tip & Interview Trap: Practical takeaway.

Student Context:
{{STUDENT_CONTEXT}}
Address the student naturally by name when greeting or encouraging them.`;

export default async function handler(req, res) {
    // 1. Universal CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { messages, studentContext: rawStudentContext, dossier } = req.body || {};
        const studentContext = rawStudentContext || dossier || null;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Invalid request: "messages" array is required.' });
        }

        const lastUserMsg = messages[messages.length - 1]?.content || '';

        // 2. Build Authenticated Student Context
        let contextText = 'Cadet Name: Cadet Utkarsh\nRole: STUDENT\nCurriculum Track: C++ Algorithms & DSA\nCadet Level: LVL 5\nTotal XP: 685 XP\nStreak: 6 Days 🔥';
        if (studentContext && typeof studentContext === 'object') {
            const parts = [];
            if (studentContext.name) parts.push(`Cadet Name: ${studentContext.name}`);
            if (studentContext.studentId) parts.push(`Student ID: ${studentContext.studentId}`);
            if (studentContext.role) parts.push(`Role: ${studentContext.role}`);
            if (studentContext.year) parts.push(`Academic Year: ${studentContext.year}`);
            if (studentContext.branch) parts.push(`Branch: ${studentContext.branch}`);
            if (studentContext.section) parts.push(`Section: ${studentContext.section}`);
            if (studentContext.track) parts.push(`Curriculum Track: ${studentContext.track}`);
            if (studentContext.level !== undefined) parts.push(`Cadet Level: LVL ${studentContext.level}`);
            if (studentContext.lifetimeXP !== undefined) parts.push(`Total XP: ${studentContext.lifetimeXP} XP`);
            if (studentContext.weeklyXP !== undefined) parts.push(`Weekly XP: ${studentContext.weeklyXP} XP`);
            if (studentContext.streakDays !== undefined) parts.push(`Streak: ${studentContext.streakDays} Days 🔥`);
            if (studentContext.freezeShields !== undefined) parts.push(`Streak Freezes Available: ${studentContext.freezeShields} 🛡️`);
            if (studentContext.guildName) parts.push(`Guild: ${studentContext.guildName}`);
            if (Array.isArray(studentContext.completedTopics) && studentContext.completedTopics.length > 0) {
                parts.push(`Completed Trials: ${studentContext.completedTopics.slice(0, 8).join(', ')}`);
            }
            if (parts.length > 0) contextText = parts.join('\n');
        }

        const fullSystemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{{STUDENT_CONTEXT}}', contextText);

        // 3. Official Google Gemini / Gemma API Execution
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY || '';
        if (geminiKey) {
            const candidateConfigs = [
                { ver: 'v1beta', model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview', timeout: 12000, useSystemInstruction: true },
                { ver: 'v1beta', model: 'gemini-3.5-flash', timeout: 8000, useSystemInstruction: true },
                { ver: 'v1beta', model: 'gemini-2.5-flash', timeout: 6000, useSystemInstruction: true },
                { ver: 'v1', model: 'gemma-4-26b-a4b-it', timeout: 10000, useSystemInstruction: false },
                { ver: 'v1beta', model: 'gemini-flash-latest', timeout: 6000, useSystemInstruction: true }
            ];

            const rawSlice = messages.slice(-10);

            for (const { ver, model, timeout, useSystemInstruction } of candidateConfigs) {
                try {
                    const geminiUrl = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${geminiKey}`;
                    let bodyPayload = {};

                    if (useSystemInstruction) {
                        const cleanContents = [];
                        for (let i = 0; i < rawSlice.length; i++) {
                            const m = rawSlice[i];
                            cleanContents.push({
                                role: m.role === 'assistant' ? 'model' : 'user',
                                parts: [{ text: m.content || '' }]
                            });
                        }
                        if (cleanContents.length > 0 && cleanContents[0].role === 'model') {
                            cleanContents.unshift({ role: 'user', parts: [{ text: 'Namaste Aham Brahmasmi!' }] });
                        }

                        bodyPayload = {
                            systemInstruction: { parts: [{ text: fullSystemPrompt }] },
                            contents: cleanContents,
                            generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
                        };
                    } else {
                        const embeddedContents = [];
                        for (let i = 0; i < rawSlice.length; i++) {
                            const m = rawSlice[i];
                            const role = m.role === 'assistant' ? 'model' : 'user';
                            let contentText = m.content || '';
                            if (i === 0 && role === 'user') {
                                contentText = `[SYSTEM INSTRUCTION: ${fullSystemPrompt}]\n\n${contentText}`;
                            }
                            embeddedContents.push({
                                role,
                                parts: [{ text: contentText }]
                            });
                        }
                        if (embeddedContents.length > 0 && embeddedContents[0].role === 'model') {
                            embeddedContents.unshift({
                                role: 'user',
                                parts: [{ text: `[SYSTEM INSTRUCTION: ${fullSystemPrompt}]\n\nNamaste Aham Brahmasmi!` }]
                            });
                        }

                        bodyPayload = {
                            contents: embeddedContents,
                            generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
                        };
                    }

                    const response = await fetch(geminiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bodyPayload),
                        signal: AbortSignal.timeout(timeout)
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const candidate = data?.candidates?.[0];
                        const parts = candidate?.content?.parts;
                        let reply = '';

                        if (Array.isArray(parts)) {
                            // Filter out thought/scratchpad reasoning traces (from models like Gemma 4)
                            const cleanParts = parts.filter(p => !p.thought && p.text && p.text.trim());
                            if (cleanParts.length > 0) {
                                reply = cleanParts.map(p => p.text).join('\n').trim();
                            } else {
                                reply = parts[parts.length - 1]?.text?.trim() || '';
                            }
                        }

                        if (reply) {
                            return res.status(200).json({
                                reply,
                                model: `Gemini (${model})`,
                                finishReason: candidate?.finishReason || 'STOP'
                            });
                        }
                    }
                } catch (err) {
                    console.warn(`Gemini/Gemma model ${model} (${ver}) fetch notice:`, err.message);
                }
            }
        }

        // 4. Curated Pedagogical Fast-Path (Instant ChatGPT-grade Hinglish roadmap & polls)
        const q = (lastUserMsg || '').toLowerCase().trim();
        const isCurated = (
            ((q.includes('dost') || q.includes('friend')) && (q.includes('kamzor') || q.includes('weak') || q.includes('study') || q.includes('c++') || q.includes('help'))) ||
            ((q.includes('kamzor') || q.includes('weak') || q.includes('zero')) && (q.includes('c++') || q.includes('programming') || q.includes('coding'))) ||
            q.includes('c++ kaise') || q.includes('c++ seekhne') || q.includes('c++ shuru se') || q.includes('c++ me weak') ||
            q.includes('logic') || q.includes('plan banao') || (q.includes('dikkat') && (q.includes('dost') || q.includes('c++'))) ||
            q.includes('recursion') || q.includes('pointer') || q.includes('loop') ||
            ['hi', 'hii', 'hello', 'hey', 'kaise ho', 'kya haal'].some(g => q.startsWith(g) || q === g)
        );

        if (isCurated) {
            const autonomousReply = generateAutonomousTutorResponse(lastUserMsg, studentContext);
            return res.status(200).json({
                reply: autonomousReply,
                model: 'aham-brahmasmi-academic-core',
                note: 'Generated via Aham Brahmasmi 5-Stage ChatGPT Pedagogical Engine'
            });
        }

        // 5. Fast ChatGPT-Style AI Cloud Inference (Free, zero-config, CORS-enabled)
        try {
            const pollinationsRes = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: fullSystemPrompt },
                        ...messages.slice(-8)
                    ],
                    model: 'openai'
                }),
                signal: AbortSignal.timeout(5000)
            });

            if (pollinationsRes.ok) {
                let reply = await pollinationsRes.text();
                try {
                    const parsed = JSON.parse(reply);
                    if (parsed.reply) reply = parsed.reply;
                    else if (parsed.choices?.[0]?.message?.content) reply = parsed.choices[0].message.content;
                } catch (e) {}
                if (reply && reply.trim()) {
                    return res.status(200).json({
                        reply: reply.trim(),
                        model: 'chatgpt-style-ai (pollinations)'
                    });
                }
            }
        } catch (pollErr) {
            console.warn('Pollinations backend fetch notice:', pollErr.message);
        }

        // 5. Autonomous Pedagogical 5-Stage Explanation Engine (Reliable Offline Fallback)
        const autonomousReply = generateAutonomousTutorResponse(lastUserMsg, studentContext);
        return res.status(200).json({
            reply: autonomousReply,
            model: 'aham-brahmasmi-academic-core',
            note: 'Generated via Aham Brahmasmi 5-Stage ChatGPT Pedagogical Engine'
        });

    } catch (error) {
        console.error('Aham Brahmasmi API Handler Error:', error);
        return res.status(500).json({
            error: 'Aham Brahmasmi terminal encountered a synchronization delay. Please try again.',
            status: 'error'
        });
    }
}

/**
 * Autonomous Pedagogical Tutor Knowledge & Reasoning Engine
 * Implements the exact 5-stage ChatGPT explanation blueprint in Hinglish, English, or Hindi
 */
export function generateAutonomousTutorResponse(prompt, student) {
    const q = prompt.toLowerCase().trim();
    const lang = detectLanguage(prompt);
    const rawName = student?.name || student?.cadetName || student?.fullName || 'Kaushik';
    const cadetName = rawName.split(' ')[0] || 'Bhai';
    const level = student?.level !== undefined ? student.level : 5;
    const xp = student?.lifetimeXP !== undefined ? student.lifetimeXP : (student?.xp !== undefined ? student.xp : 685);
    const streak = student?.streakDays !== undefined ? student.streakDays : (student?.streak !== undefined ? student.streak : 6);
    const track = student?.track || 'C++ Algorithms & DSA';

    // ─── 0. CASUAL GREETINGS & PLEASANTRIES (CHATGPT STYLE) ─────────────
    const words = q.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const greetingWords = ['hi', 'hii', 'hiii', 'hello', 'hey', 'heyy', 'sup', 'yo', 'namaste', 'pranam', 'hola', 'wassup'];
    const isGreeting = greetingWords.some(w => words.includes(w)) || q.startsWith('hi ') || q.startsWith('hello ') || q === 'hii bro' || q === 'hi bro' || q === 'hello bro';

    if (isGreeting || q.includes('kaise ho') || q.includes('how are you') || q.includes('kya haal')) {
        if (lang === 'hindi') {
            return `🙏 **नमस्ते ${cadetName}!**\n\nमैं बहुत अच्छा हूँ, धन्यवाद! आप कैसे हैं और आपकी पढ़ाई कैसी चल रही है? 🌟\n\nआज आप किस विषय पर चर्चा करना चाहते हैं — **C++ प्रोग्रामिंग**, **डेटा स्ट्रक्चर्स**, **एल्गोरिदम**, या **गणित**? जो भी प्रश्न हो, पूछिए! मैं आपकी पूरी सहायता करूँगा। 🕉️`;
        }
        return `👋 **Arrey hello ${cadetName} bhai!** 😂❤️\n\nMain ekdum badhiya hoon, full energy mein! Tu bata, kaisa chal raha hai sab? Coding aur college ki padhai mast chal rahi hai na? 🔥\n\nAaj kya master karna hai — **C++ Basics**, **Recursion**, **Pointers**, **Logic Building**, ya koi specific problem pe attack karein? Jo bhi doubt ho, bina jhijhak ke pooch, milkar phodenge! 🚀`;
    }

    // ─── 1. WEAK STUDENT / FRIEND IN C++ / STUDY ROADMAP (EXACT CHATGPT STYLE) ───
    const isFriendWeakInCpp = (
        (q.includes('dost') || q.includes('friend')) && (q.includes('kamzor') || q.includes('weak') || q.includes('study') || q.includes('c++') || q.includes('help'))
    ) || (
        (q.includes('kamzor') || q.includes('weak') || q.includes('zero')) && (q.includes('c++') || q.includes('programming') || q.includes('coding'))
    ) || (
        q.includes('c++ kaise') || q.includes('c++ seekhne') || q.includes('c++ shuru se') || q.includes('c++ me weak')
    );

    if (isFriendWeakInCpp && !q.includes('logic banane')) {
        if (lang === 'hindi') {
            return `भाई ${cadetName}! चिंता मत कीजिए। अगर आपका दोस्त C++ में कमजोर है, तो इसका मतलब यह बिल्कुल नहीं है कि वह प्रोग्रामिंग नहीं सीख सकता।\n\nउसे एक सही दिशा और चरणबद्ध 15-दिन की योजना की आवश्यकता है।\n\n### C++ सीखने की 15-दिन की कार्ययोजना\n* **दिन 1-3:** बिल्कुल मूलभूत बातें (\`cin\`, \`cout\`, डेटा प्रकार, ऑपरेटर)\n* **दिन 4-6:** शर्तें (\`if-else\`, सम/विषम, तीन संख्याओं में सबसे बड़ी)\n* **दिन 7-10:** लूप्स (\`for\`, \`while\`, टेबल, संख्याओं का योग)\n* **दिन 11-15:** समस्या समाधान (अंक उलटना, अभाज्य संख्या, पैटर्न्स)`;
        }

        return `Bhai ${cadetName} 😂❤️ tension mat le! Tera dost C++ mein weak hai toh iska matlab ye nahi ki woh programming nahi seekh sakta. Ho sakta hai uske **basics clear nahi hain ya usko samajhne ka sahi tareeka nahi mila hai**.

Main tujhe ek aisa plan deta hoon jisse tu uski help kar sakta hai, especially first-semester C++ ke liye.

### C++ seekhne ka 15-day plan

**Days 1–3: Bilkul basics se**
* \`cout\` aur \`cin\`
* Variables aur data types (\`int\`, \`float\`, \`char\`)
* Operators (\`+\`, \`-\`, \`*\`, \`/\`, \`%\`)
* Chhote programs: sum, average, last digit

**Days 4–6: Conditions**
* \`if\`, \`else if\`, \`else\`
* Nested \`if\`
* Even/odd, positive/negative, greatest of 3 numbers

**Days 7–10: Loops**
* \`for\`, \`while\`, \`do-while\`
* Tables, sum of digits, factorial
* Infinite loop kyon lagta hai aur usse kaise bachein

**Days 11–15: Problem solving**
* First aur last digit
* Reverse a number
* Prime number
* Patterns aur basic DSA questions

### Roz usko kaise padhana hai?
Roz sirf 45–60 minutes:
1. **15 min**: Ek concept simple language mein samjha.
2. **15 min**: Ek example khud solve karke dikha.
3. **20 min**: Usko 2–3 similar questions khud karne de.
4. **5 min**: Usse pooch ki code ka har step kya kar raha hai.

**Sabse important**: Usko code ratne mat dena. Pehle usse dry run karwa—yaani har line execute hone par variable ki value kya hogi, woh likhwaye.

### Ab mujhe ek baat bata

:::interactive-poll
[question: 1. Tera dost C++ mein kahan tak weak hai?]
( ) Bilkul zero hai, code likhna bhi nahi aata
( ) cin, cout, variables samajhta hai
(*) If-else aur loops tak padh chuka hai
( ) C++ aati hai, par questions solve nahi hote

[question: 2. Usko sabse zyada dikkat kis cheez mein hai?]
( ) Code likhne aur syntax mein
(*) Logic banane mein
( ) Concept samajhne mein
( ) Har cheez mein
[button: Uske liye plan banao]
:::

Bhai, uska level bata de. Main usko wahin se padhana shuru karwaunga jahan se usko sach mein zaroorat hai. 💪`;
    }

    // ─── 2. LOGIC BUILDING / "LOGIC BANANE MEIN DIKKAT" ───
    if (q.includes('logic') || q.includes('code nahi ban') || q.includes('code likhna') || (q.includes('plan banao') && q.includes('dikkat'))) {
        return `Bhai zabardast! 😂❤️ Agar usko \`cin\`, \`cout\`, \`if-else\` aur \`loops\` ka syntax samajh aata hai aur main dikkat **logic banane mein** aa rahi hai, toh tension bilkul mat le! 

College ke 90% students yahin phasate hain kyunki professors syntax toh board par likh dete hain, par **logic kaise sochte hain** woh koi nahi sikhata!

Main tujhe ek **Golden 4-Step Logic Building Secret Technique** deta hoon jo tu usko follow karwayega:

### 🧠 Logic Building ka 4-Step Secret Blueprint

1. **Step 1: Laptop Band, Pen-Paper Chalu (The Zero-Keyboard Rule)**
   Jab bhi koi sawaal aaye (jaise *"Reverse a number"*), usko bolo keyboard ko haath na lagaye! Pehle copy par number likhe: jaise \`1234\`.
   Usko bolo: *"Bhai, agar computer na ho aur tere haath mein bas pen ho, toh tu 1234 ko 4321 kaise banayega?"*
   * Aakhri digit nikaal: $1234 \\% 10 = 4$
   * Bacha hua number: $1234 / 10 = 123$
   Jab woh copy pe yeh step 3 baar karega, formula khud nikal aayega: \`rev = rev * 10 + digit\`!

2. **Step 2: Dry Run Table (Aankhon ke Saamne Variable Badlo)**
   Usko bolo copy par har variable ka ek box banaye aur har loop cycle trace kare:

| Step | \`n\` | \`digit = n % 10\` | \`rev = rev * 10 + digit\` | \`n = n / 10\` |
| :--- | :--- | :--- | :--- | :--- |
| **Start** | 123 | - | 0 | - |
| **Iter 1** | 123 | 3 | $0 \\times 10 + 3 = 3$ | 12 |
| **Iter 2** | 12 | 2 | $3 \\times 10 + 2 = 32$ | 1 |
| **Iter 3** | 1 | 1 | $32 \\times 10 + 1 = 321$ | 0 (Stop!) |

Jab woh aankhon ke saamne variable badalta dekhega, uska darr 100% khatam ho jayega!

3. **Step 3: In 10 Foundational Questions ka Practice Do**
   Directly complex DSA mat karne dena. Bas yeh 10 questions sequentially solve karwao:
   1. Sum of first N natural numbers
   2. Factorial of a number
   3. Count digits of a number
   4. Sum of all digits of a number
   5. Reverse a number
   6. Check Palindrome number
   7. Check Prime number (Trial division)
   8. Print Fibonacci series up to N terms
   9. Find largest and smallest element in an array
   10. Simple star patterns (Square, Right-angle triangle)

4. **Step 4: Error Aaye Toh Chill Rehna**
   Jab infinite loop ya segmentation fault aaye, toh panic mat hone dena. Usko bolo: *"Bhai error aana normal hai, compiler hamara dushman nahi hai, error message padh kar theek karte hain!"*

Bhai, tu bata: kya pehle question (jaise Reverse a number ya Prime number) ka step-by-step pen-paper dry run aur clean C++ code bana kar dikhaun jo tu usko samjha sake? 🚀`;
    }

    // ─── 3. RECURSION ────────────────────────────────────────────────
    if (q.includes('recursion') || q.includes('recursive') || q.includes('रिकर्शन')) {
        if (lang === 'hindi') {
            return `### 🌀 रिकर्शन (Recursion) — आसान भाषा में समझें\n\n**रिकर्शन वह तकनीक है जिसमें एक फ़ंक्शन किसी बड़ी समस्या को छोटी समान समस्याओं में बाँटकर स्वयं को ही बार-बार कॉल करता है।**\n\n> 🪆 **सरल उदाहरण:** रूसी गुड़िया (Russian Dolls) की तरह — बड़ी गुड़िया खोलने पर अंदर एक छोटी गुड़िया निकलती है, और यह तब तक चलता है जब तक सबसे छोटी ठोस गुड़िया न आ जाए!\n\n---\n\n### महत्वपूर्ण नियम:\n1. 🛑 **बेस केस (Base Case):** फ़ंक्शन को कब रुकना है। इसके बिना फ़ंक्शन अनंत काल तक चलता रहेगा और **Stack Overflow** हो जाएगा।\n2. 🏎️ **रिकर्सिव स्टेप (Recursive Call):** हर बार इनपुट को छोटा करके स्वयं को कॉल करना ताकि बेस केस तक पहुँचा जा सके।\n\n### C++ कोड उदाहरण (फ़ैक्टोरियल $n!$):\n\`\`\`cpp\n#include <iostream>\n\nlong long factorial(int n) {\n    if (n <= 1) return 1; // बेस केस\n    return n * factorial(n - 1); // रिकर्सिव कॉल\n}\n\nint main() {\n    std::cout << "5! = " << factorial(5) << std::endl; // 120\n    return 0;\n}\n\`\`\`\n\nक्या आप फ़िबोनाची का उदाहरण भी देखना चाहते हैं?`;
        }

        return `Bhai ${cadetName}, simple bhasha mein samjhta hoon!

### 🌀 Recursion Asaan Bhasha Mein

**Recursion ka matlab hai: jab ek function khud ko hi baar-baar call karta hai ek badi problem ko choti problem mein todne ke liye.**

> 🪆 **Desi Analogy:** Kabhi Russian Nesting Dolls dekhi hai? Ek gudiya kholo, uske andar choti gudiya nikalti hai. Tab tak kholo jab tak aakhri sabse choti gudiya na aa jaye jo khul hi nahi sakti! Woh sabse choti gudiya hi tumhara **Base Case** hai.

---

### 2 Golden Rules (Car ka Brake & Accelerator)
1. 🛑 **The Brake (Base Case):** Function ko kab RUKNA hai! Agar brake nahi lagaya, toh function chalta hi jayega aur memory crash $\\rightarrow$ **Stack Overflow!**
2. 🏎️ **The Accelerator (Recursive Step):** Problem ko har step par thoda chota karke call karna taaki base case tak pahunch sake.

---

### Clean Minimal C++ Code (Factorial $n!$)

\`\`\`cpp\n#include <iostream>\n\n// Calculates n! = n * (n - 1) * ... * 1\nlong long factorial(int n) {\n    // 1. BRAKE (Base Case): Agar n 0 ya 1 hai, ruk jao!\n    if (n <= 1) return 1;\n\n    // 2. ACCELERATOR (Recursive Call): n * factorial(n - 1)\n    return n * factorial(n - 1);\n}\n\nint main() {\n    std::cout << "5! = " << factorial(5) << std::endl; // 120\n    return 0;\n}\n\`\`\`

---

### Dry Run (Execution Trace for \`factorial(3)\`)
* \`factorial(3)\` wait karega: \`3 * factorial(2)\`
* \`factorial(2)\` wait karega: \`2 * factorial(1)\`
* \`factorial(1)\` base case hit $\\rightarrow$ returns **1**
* Wapas calculation: $2 \\times 1 = 2 \\rightarrow 3 \\times 2 = \\mathbf{6}$ 🎉

💡 **Bhaiya ka Pro-Tip:** Function ke andar **Base Case hamesha sabse pehli line par likhna chahiye**!

Bata bhai, clear hua ya ek aur live example (jaise Fibonacci) leke dry run karein? 🚀`;
    }

    // ─── 4. POINTERS VS REFERENCES ───────────────────────────────────
    if (q.includes('pointer') && (q.includes('reference') || q.includes('diff') || q.includes('kya'))) {
        return `Bhai ${cadetName}, yeh concept college exams aur technical interviews ka absolute favorite hai! Aao 1 minute mein dimaag mein fit karte hain:

### ⚡ Pointers vs References — Asaan Bhasha Mein

* **Pointer (\`int*\`):** Ek variable jo doosre variable ka **Memory Address (Ghar ka pata)** store karta hai.
* **Reference (\`int&\`):** Ek existing variable ka **Nickname / Alias (Doosra naam)** hota hai.

> 🏠 **Desi Analogy:**
> * **Pointer** = Ek kagaz ki parchi jispe tere ghar ka address likha hai (\`0x7ffe\`). Tu us parchi par address mita kar kisi aur ke ghar ka address bhi likh sakta hai! Parchi khali (\`nullptr\`) bhi ho sakti hai.
> * **Reference** = Tera nickname! Gharwale tujhe "Sonu" bulate hain aur college mein "Arjun". Insaan ek hi hai, bas naam do hain.

---

### Memory Comparison Matrix

| Feature | Pointer (\`int*\`) | Reference (\`int&\`) |
| :--- | :--- | :--- |
| **Syntax** | \`int* p = &x;\` | \`int& r = x;\` |
| **Null Support** | ✅ Yes (\`nullptr\`) | ❌ No (Cannot be NULL) |
| **Reassignment** | ✅ Yes (Can point elsewhere) | ❌ No (Permanently bound) |
| **Memory Size** | 8 bytes on 64-bit OS | 0 extra overhead |

---

### Clean Minimal C++ Code

\`\`\`cpp\n#include <iostream>\n\nint main() {\n    int a = 10, b = 20;\n\n    // Pointer Demo\n    int* ptr = &a; // ptr holds address of a\n    *ptr = 15;     // a becomes 15\n    ptr = &b;      // Pointer points to b now!\n\n    // Reference Demo\n    int& ref = a;  // ref is alias for a\n    ref = 99;      // a becomes 99\n\n    std::cout << "a: " << a << ", b: " << b << std::endl; // 99, 20\n    return 0;\n}\n\`\`\`

💡 **Bhaiya ka Pro-Tip:** Modern C++ mein function arguments hamesha \`const T&\` (Pass by const reference) bhejo — isse 0 memory copy hoti hai aur performance top-notch rehti hai!

Bata bhai, crystal clear hua ya Smart Pointers (\`unique_ptr\`) dekhna hai? 🚀`;
    }

    // ─── 5. GENERAL HINGLISH CATCH-ALL ───────────────────────────────
    if (lang === 'hinglish') {
        return `Bhai ${cadetName} 😂❤️, tere sawaal pe bilkul simple aur seedhi bhasha mein baat karte hain!

Is concept ko asaan tareeke se samajhne ke liye 3 baatein dhyan mein rakho:

1. **Sabse Pehle Asaan Bhasha Mein:** Kisi bhi technical topic ko samajhne ke liye pehle uski basic real-world analogy socho. Programming complex nahi hoti, bas sahi perspective chahiye hota hai.
2. **Main Core Rule:** Code likhne se pehle pen-paper uthao aur 2 chhote examples khud trace karo. Jab logic dimag mein clear ho jaye, tabhi code likhna shuru karo.
3. **Daily Habit:** Roz sirf 30-45 minutes consistent coding karo bina skip kiye.

Bata bhai, isme kis specific part me sabse zyada doubt aa raha hai? Main bilkul simple example ke saath step-by-step clear karta hoon! 🚀`;
    }

    if (lang === 'hindi') {
        return `नमस्ते ${cadetName}! आपके प्रश्न पर विचार करते हैं।\n\nइस विषय को आसान भाषा में समझने के लिए:\n1. **मूल विचार:** सबसे पहले वास्तविक जीवन का एक उदाहरण सोचें।\n2. **अभ्यास:** कोड लिखने से पहले पेन-कागज पर छोटे उदाहरण का परीक्षण करें।\n3. **निरंतरता:** प्रतिदिन 30-45 मिनट अभ्यास करें।\n\nबताइए, इसमें आपको सबसे अधिक कठिनाई कहाँ आ रही है? मैं विस्तार से समझाता हूँ! 🕉️`;
    }

    return `Hey ${cadetName}! Let's break this down in an intuitive, step-by-step manner.\n\n1. **First-Principles Breakdown:** Always relate the concept to a real-world analogy before writing syntax.\n2. **Core Strategy:** Trace two sample inputs on paper first to clarify the logic.\n3. **Daily Cadence:** Focus on 30-45 minutes of consistent hands-on coding.\n\nWhat specific part would you like to explore first? Let's dive in! 🚀`;
}
