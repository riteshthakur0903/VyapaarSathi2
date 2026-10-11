import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Enable CORS for preview iframe and API access
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Helper to properly format multi-turn contents for Gemini API
function buildGeminiContents(
  conversationHistory: any[],
  latestMessage: string
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    // Gemini requires conversation to begin with a 'user' turn
    const firstUserIndex = conversationHistory.findIndex(
      (m) => m && (m.role === 'user' || m.role === 'human')
    );

    const relevantTurns = firstUserIndex !== -1 ? conversationHistory.slice(firstUserIndex) : [];

    for (const turn of relevantTurns) {
      if (!turn || !turn.text || typeof turn.text !== 'string' || !turn.text.trim()) continue;

      const role: 'user' | 'model' =
        turn.role === 'user' || turn.role === 'human' ? 'user' : 'model';

      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        // Merge consecutive turns with the same role
        contents[contents.length - 1].parts[0].text += `\n${turn.text.trim()}`;
      } else {
        contents.push({
          role,
          parts: [{ text: turn.text.trim() }],
        });
      }
    }
  }

  // Ensure latest message is placed as the final user turn
  const trimmedLatest = (latestMessage || '').trim();
  if (trimmedLatest) {
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      // If the last history message already had this exact text, don't duplicate it
      if (contents[contents.length - 1].parts[0].text !== trimmedLatest) {
        contents[contents.length - 1].parts[0].text += `\n${trimmedLatest}`;
      }
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: trimmedLatest }],
      });
    }
  }

  // Fallback if contents is empty
  if (contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: 'Hello, please guide me on starting a rural business in India.' }],
    });
  }

  return contents;
}

// Server-side AI Advisor endpoint
app.post('/api/advisor-chat', async (req: Request, res: Response) => {
  const { message, conversationHistory, profile, language, selectedBusiness } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.warn('GEMINI_API_KEY is not configured on server.');
      return res.json({
        success: false,
        isDemoMode: true,
        errorType: 'missing_api_key',
        errorMessage: 'Gemini API key is not configured on the server. Running in Demo Mode.',
        reply: generateFallbackReply(message, profile, language),
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Build context about the selected business if provided
    let businessContext = '';
    if (selectedBusiness) {
      businessContext = `
Currently Discussed / Selected Business:
- Name: ${selectedBusiness.title} (${selectedBusiness.title_hi || ''} / ${selectedBusiness.title_mr || ''})
- Category: ${selectedBusiness.category || 'General'}
- Estimated Startup Cost: ₹${selectedBusiness.estimatedCost?.toLocaleString?.('en-IN') || selectedBusiness.estimatedCost}
- Expected Net Monthly Profit: ₹${selectedBusiness.expectedMonthlyProfit?.toLocaleString?.('en-IN') || selectedBusiness.expectedMonthlyProfit}
- Payback Period: ${selectedBusiness.paybackPeriodMonths || 'N/A'} Months
- Key Machinery: ${(selectedBusiness.equipmentNeeded || []).join(', ') || 'N/A'}
- Suitable Schemes: ${(selectedBusiness.suitableSchemes || []).join(', ') || 'PMEGP, Mudra'}
`;
    }

    // Language-specific instructions
    let languageInstruction = '';
    if (language === 'hi') {
      languageInstruction =
        'STRICT LANGUAGE DIRECTIVE: You MUST respond in conversational Hindi written in standard Devanagari script (हिंदी भाषा, देवनागरी लिपि). Do NOT answer in English or Marathi. Use natural Indian rural terminology (जैसे पूंजी, मुनाफा, मशीनरी, लोन, सबसिडी).';
    } else if (language === 'mr') {
      languageInstruction =
        'STRICT LANGUAGE DIRECTIVE: You MUST respond in conversational Marathi written in standard Devanagari script (मराठी भाषा, देवनागरी लिपी). Do NOT answer in English or Hindi. Use natural Marathi business terms (उदा. भांडवल, नफा, यंत्रसामग्री, कर्ज, सबसिडी).';
    } else {
      languageInstruction =
        'STRICT LANGUAGE DIRECTIVE: Respond in simple, clear, accessible Indian English suitable for first-time rural entrepreneurs.';
    }

    const systemInstruction = `You are VyapaarSathi (व्यापार साथी), a trusted, encouraging, and highly practical business and loan advisor for first-time rural and semi-urban entrepreneurs in India.

${languageInstruction}

User Profile Context (use only when relevant to the question):
- Name: ${profile?.name || 'Friend'}
- Location: ${[profile?.location?.village, profile?.location?.block, profile?.location?.district, profile?.location?.state].filter(Boolean).join(', ') || 'Rural / Semi-urban India'}
- Occupation & Skills: ${profile?.occupation || 'Not specified'}, ${profile?.skills || ''}
- Monthly Income: ₹${profile?.monthlyIncome || 'Not specified'}
- Available Savings for Investment: ₹${profile?.availableCapital || 'Not specified'}
- Social Category for Subsidies: ${profile?.category || 'General'}
- Open to Loan: ${profile?.openToLoan ? 'Yes, interested in bank credit and subsidies' : 'Prefers self-funded or minimal debt'}
${businessContext}

Advisory Principles:
1. Always generate a fresh, tailored response that directly answers the user's latest question.
2. In multi-turn conversations, if the user asks contextual follow-up questions such as "Is business mein kitna investment lagega?", "Machinery kahan se milegi?", "Loan ke liye kya documents lagenge?", refer specifically to the business discussed in the prior messages or the currently selected business.
3. Provide realistic Indian cost estimates (₹), local equipment sourcing hubs (e.g. Coimbatore, Rajkot, Pune, local district towns), raw material purchasing advice, and relevant government schemes like PMEGP (25-35% rural subsidy), PM-FME (35% food processing subsidy), or Mudra loans.
4. Keep answers focused on the actual question. If essential information is missing to give exact numbers (e.g., land size, 3-phase power availability, or scale of production), provide a solid core answer and ask ONE useful follow-up question.
5. Format with short paragraphs and bullet points so it is easy to read or listen to on a mobile screen.`;

    const contents = buildGeminiContents(conversationHistory, message);

    // Prioritize high-performance, active quota flash models
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-3-flash-preview',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ];
    let lastError: any = null;
    let responseText: string | null = null;
    let successfulModel = 'gemini-3.1-flash-lite';

    for (const model of candidateModels) {
      try {
        const generatePromise = ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        // 25 second timeout for rich multilingual generation
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`AI generation timed out on ${model}`)), 25000)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        responseText = response.text;
        if (responseText) {
          successfulModel = model;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed:`, err?.status || err?.message || err);
      }
    }

    if (responseText) {
      return res.json({
        success: true,
        source: successfulModel,
        reply: responseText,
      });
    }

    // If Gemini failed:
    const status = lastError?.status || 500;
    const isRateLimit =
      status === 429 ||
      lastError?.message?.includes('429') ||
      lastError?.message?.includes('RESOURCE_EXHAUSTED');
    const isUnavailable =
      status === 503 ||
      lastError?.message?.includes('503') ||
      lastError?.message?.includes('high demand');

    const errorType = isRateLimit ? 'rate_limit' : isUnavailable ? 'high_demand' : 'api_error';
    const errorMessage = isRateLimit
      ? 'Gemini API rate limit reached. Please wait a moment and try again.'
      : isUnavailable
      ? 'The Gemini AI model is currently experiencing high demand. Please click Retry in a few seconds.'
      : `Gemini service error: ${lastError?.message || 'Unable to generate response'}`;

    return res.status(status >= 400 && status < 600 ? status : 500).json({
      success: false,
      errorType,
      errorMessage,
      reply: null,
    });
  } catch (error: any) {
    console.error('Advisor chat internal server error:', error);
    return res.status(500).json({
      success: false,
      errorType: 'server_error',
      errorMessage: error?.message || 'Internal server error while calling Gemini AI',
      reply: null,
    });
  }
});

// Helper for offline fallback
function generateFallbackReply(message: string, profile: any, lang: string): string {
  const name = profile?.name || 'मित्र (Friend)';
  const lower = (message || '').toLowerCase();

  if (lang === 'hi') {
    if (lower.includes('लोन') || lower.includes('loan') || lower.includes('कर्ज')) {
      return `नमस्ते ${name}! ग्रामीण क्षेत्रों में नए व्यवसाय के लिए सरकार की कई योजनाएं हैं:\n1. **PMEGP (प्रधानमंत्री रोजगार सृजन कार्यक्रम)**: 15% से 35% तक सब्सिडी और ₹50 लाख तक परियोजना लागत।\n2. **मुद्रा योजना (Mudra Loan)**: शिशु (₹50,000 तक), किशोर (₹50,000 से ₹5 लाख)। बिना किसी गारंटी के ऋण।\n3. **नाबार्ड (NABARD) सहायता**: कृषि और पशुपालन (डेयरी, बकरी पालन) के लिए विशेष अनुदान।\n\nआप हमारी 'लोन कैलकुलेटर' और 'सरकारी योजनाएं' टैब में जाकर अपनी मासिक EMI और पात्रता की जांच कर सकते हैं।`;
    }
    return `नमस्ते ${name}! आपके पास उपलब्ध पूंजी (लगभग ₹${profile?.availableCapital || '50,000'}) और आपके स्थान के आधार पर, यहाँ कुछ बेहतरीन सुझाव हैं:\n\n1. **मिनी दाल/मसाला पिसाई और पैकेजिंग**: कम लागत में शुरू, स्थानीय किसानों से कच्चा माल लेकर अच्छी बचत।\n2. **डेयरी फार्मिंग एवं संकलन केंद्र**: गांवों में रोज नकद आमदनी और NABARD/KCC से सहायता।\n3. **कृषि उपकरण किराया (Custom Hiring Center)**: ट्रैक्टर या स्प्रेयर किराए पर देना।\n\nक्या आप इनमें से किसी एक के बारे में विस्तृत लागत और अनुमानित मुनाफा जानना चाहते हैं?`;
  } else if (lang === 'mr') {
    if (lower.includes('कर्ज') || lower.includes('loan')) {
      return `नमस्कार ${name}! ग्रामीण भागात नवीन व्यवसाय सुरू करण्यासाठी खालील सरकारी योजना खूप फायदेशीर आहेत:\n1. **PMEGP योजना**: ग्रामीण भागात 25% ते 35% पर्यंत सबसिडी मिळते.\n2. **मुद्रा योजना (Mudra)**: कोणत्याही हमीशिवाय (Collateral free) ₹50,000 ते ₹5 लाखांपर्यंत कर्ज.\n3. **नाबार्ड (NABARD) योजना**: शेतीपूरक व्यवसाय, शेळीपालन आणि दुग्ध व्यवसायासाठी सबसिडी.\n\nतुम्ही आमच्या 'कर्ज कॅल्क्युलेटर' विभागात जाऊन हप्ता (EMI) तपासू शकता!`;
    }
    return `नमस्कार ${name}! तुमच्या भागासाठी आणि उपलब्ध भांडवलासाठी (₹${profile?.availableCapital || '50,000'}) हे व्यवसाय उत्तम ठरू शकतात:\n\n1. **मसाला व पीठ गिरणी (मिनी प्रोसेसिंग युनिट)**: स्थानिक मागणी भरपूर असते.\n2. **दुग्ध व्यवसाय व संकलन केंद्र**: नियमित उत्पन्न आणि नाबार्डचे सहकार्य.\n3. **शेती अवजारे भाडेतत्त्वावर देणे**: गावात ट्रॅक्टर किंवा पेरणी यंत्रांची सतत गरज असते.\n\nतुम्हाला यापैकी कोणत्या व्यवसायाची सविस्तर माहिती व खर्च समजून घ्यायचा आहे?`;
  } else {
    if (lower.includes('loan') || lower.includes('fund') || lower.includes('scheme')) {
      return `Hello ${name}! For rural entrepreneurs, the key government loan schemes are:\n1. **PMEGP**: 25% to 35% subsidy for rural manufacturing & service projects up to ₹50 Lakh.\n2. **Pradhan Mantri Mudra Yojana**: Shishu (up to ₹50k) and Kishor (₹50k - ₹5 Lakh) without collateral.\n3. **NABARD Schemes**: Tailored capital subsidies for dairy, goat farming, and agri-processing units.\n\nYou can simulate your monthly repayment in our Loan Calculator tab!`;
    }
    return `Hello ${name}! Based on your region and available capital (approx. ₹${profile?.availableCapital || '50,000'}), here are viable rural business options:\n\n1. **Mini Spice & Grain Milling Unit**: Steady daily cash flow, low perishable waste, serves nearby households.\n2. **Dairy Collection & Chilling Unit**: Strong local milk supply with steady cooperative purchase contracts.\n3. **Agri-Tool Rental & Solar Repair**: High seasonal demand with NABARD subsidy options.\n\nWould you like me to break down the equipment costs or generate a full feasibility report?`;
  }
}

// Development or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`VyapaarSathi server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
