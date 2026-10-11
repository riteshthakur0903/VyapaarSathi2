import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  User, 
  Bot, 
  RotateCcw, 
  ArrowRight, 
  Edit3, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Briefcase
} from 'lucide-react';
import { UserProfile, Language, ChatMessage, BusinessIdea } from '../types';
import { translations } from '../i18n/translations';
import { dataService } from '../services/dataService';
import { SAMPLE_BUSINESSES } from '../data/sampleBusinesses';

interface AIAdvisorChatProps {
  profile: UserProfile;
  language: Language;
  selectedBusiness?: BusinessIdea | null;
  onSelectBusiness?: (b: BusinessIdea | null) => void;
  onEditProfile: () => void;
  onViewRecommendations: () => void;
}

export const AIAdvisorChat: React.FC<AIAdvisorChatProps> = ({
  profile,
  language,
  selectedBusiness,
  onSelectBusiness,
  onEditProfile,
  onViewRecommendations,
}) => {
  const t = translations[language];

  // Helper to generate initial welcome greeting
  const getInitialGreeting = (lang: Language): ChatMessage => {
    if (lang === 'hi') {
      return {
        id: 'msg_init',
        role: 'assistant',
        text: `नमस्ते ${profile.name || 'मित्र'}! मैं व्यापार साथी (VyapaarSathi) का एआई सलाहकार हूँ।\n\nआपके गांव ${profile.location.village || 'के क्षेत्र'} में उपलब्ध पूंजी ₹${profile.availableCapital.toLocaleString('en-IN')} के साथ आप कौन सा व्यवसाय शुरू करना चाहते हैं? आप मुझसे मशीनरी की लागत, सरकारी सब्सिडी (PMEGP/Mudra), या किसी भी ग्रामीण व्यवसाय के बारे में सीधा सवाल पूछ सकते हैं।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini-flash',
      };
    } else if (lang === 'mr') {
      return {
        id: 'msg_init',
        role: 'assistant',
        text: `नमस्कार ${profile.name || 'मित्र'}! मी व्यापार साथी (VyapaarSathi) चा एआय सल्लागार आहे.\n\nआपल्या परिसरातील परिस्थिती आणि ₹${profile.availableCapital.toLocaleString('en-IN')} च्या भांडवलामध्ये तुम्हाला कोणता व्यवसाय सुरू करायचा आहे? तुम्ही मला मशिनरीचा खर्च, सरकारी सबसिडी (PMEGP/Mudra) किंवा व्यवसाय नियोजनाबद्दल काहीही विचारू शकता.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini-flash',
      };
    } else {
      return {
        id: 'msg_init',
        role: 'assistant',
        text: `Hello ${profile.name || 'Friend'}! I am VyapaarSathi AI Advisor.\n\nBased on your location in ${profile.location.village || 'your village'}, ${profile.location.district || ''} and available savings of ₹${profile.availableCapital.toLocaleString('en-IN')}, what kind of business would you like to explore? Ask me anything about machinery costs, raw materials, or government subsidy schemes (PMEGP, Mudra, PM-FME).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini-flash',
      };
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<{ message: string; rawPrompt?: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat history from storage/Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const stored = await dataService.getChatMessages();
        if (isMounted) {
          if (stored && stored.length > 0) {
            setMessages(stored);
          } else {
            const initial = [getInitialGreeting(language)];
            setMessages(initial);
            dataService.saveChatMessages(initial);
          }
        }
      } catch (err) {
        console.warn('Failed to load chat history:', err);
        if (isMounted) {
          const initial = [getInitialGreeting(language)];
          setMessages(initial);
        }
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update greeting if language changed and only initial message is present
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'msg_init') {
      const updated = [getInitialGreeting(language)];
      setMessages(updated);
      dataService.saveChatMessages(updated);
    }
  }, [language]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Toggle voice listening
  const handleToggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      setErrorBanner({
        message: 'Speech recognition is not supported in this browser. Please use text input.',
      });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang =
          language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start failed', err);
        setIsListening(false);
        setErrorBanner({
          message: 'Could not access microphone. Please check permissions or type your question.',
        });
      }
    }
  };

  // Text to speech audio output with markdown stripped for clean pronunciation
  const handleSpeakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanSpeech = text
      .replace(/[*#_~`]/g, '')
      .replace(/--+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setSpeakingId(null);
    };
    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Clear / Restart chat history
  const handleRestartChat = async () => {
    if (speakingId) {
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
    }
    setErrorBanner(null);
    const freshGreeting = [getInitialGreeting(language)];
    setMessages(freshGreeting);
    await dataService.clearChatMessages();
    await dataService.saveChatMessages(freshGreeting);
  };

  // Send message to Gemini server endpoint
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setErrorBanner(null);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // When sending a message (or retrying), clean up trailing unanswered messages or errors
    const cleanHistory = [...messages];
    while (
      cleanHistory.length > 0 &&
      (cleanHistory[cleanHistory.length - 1].isError ||
        cleanHistory[cleanHistory.length - 1].role === 'user')
    ) {
      cleanHistory.pop();
    }

    // Update state immediately with user message
    const updatedMessages = [...cleanHistory, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    // Save user message to persistent storage
    dataService.saveChatMessages(updatedMessages);

    try {
      // Send previous valid conversation history to server (excluding errors)
      const historyPayload = cleanHistory
        .filter((m) => !m.isError && m.text && m.text.trim())
        .slice(-8)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          text: m.text,
        }));

      const endpoint = '/api/advisor-chat';
      let response: Response;

      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            conversationHistory: historyPayload,
            profile,
            selectedBusiness,
            language,
          }),
        });
      } catch {
        // Fallback with absolute origin if relative path encountered an iframe fetch issue
        response = await fetch(window.location.origin + endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            conversationHistory: historyPayload,
            profile,
            selectedBusiness,
            language,
          }),
        });
      }

      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResp = await response.text();
        console.warn('Received non-JSON response from server:', response.status, textResp.slice(0, 150));
        data = {
          success: false,
          errorMessage: `Server returned HTTP ${response.status}. Please click Retry.`,
        };
      }

      if (response.ok && data?.success && data?.reply) {
        const aiMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source || 'gemini-3.1-flash-lite',
        };

        const finalMessages = [...updatedMessages, aiMsg];
        setMessages(finalMessages);
        dataService.saveChatMessages(finalMessages);
      } else if (data?.isDemoMode && data?.reply) {
        // Explicitly labeled Demo Mode
        const demoMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'demo_mode',
        };
        const finalMessages = [...updatedMessages, demoMsg];
        setMessages(finalMessages);
        dataService.saveChatMessages(finalMessages);
      } else {
        // Server returned an error (rate limit, service unavailable, or API error)
        const errorMessage = data?.errorMessage || 'Unable to generate response from Gemini AI. Please retry.';
        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: errorMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'error',
          isError: true,
          errorMessage,
          canRetry: true,
          rawFailedPrompt: text,
        };

        setErrorBanner({ message: errorMessage, rawPrompt: text });
        const finalMessages = [...updatedMessages, errorMsg];
        setMessages(finalMessages);
        dataService.saveChatMessages(finalMessages);
      }
    } catch (networkErr: any) {
      console.error('Network error during chat request:', networkErr);
      const networkErrMsg = 'Network connection error. Could not reach VyapaarSathi advisor server.';
      setErrorBanner({ message: networkErrMsg, rawPrompt: text });

      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: networkErrMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'error',
        isError: true,
        errorMessage: networkErrMsg,
        canRetry: true,
        rawFailedPrompt: text,
      };

      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      dataService.saveChatMessages(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    t.advisor.q1,
    t.advisor.q2,
    t.advisor.q3,
    t.advisor.q4,
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.advisor.title}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              {t.advisor.subtitle}
            </h2>
          </div>

          <button
            onClick={handleRestartChat}
            className="text-stone-600 hover:text-stone-900 text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Chat</span>
          </button>
        </div>

        {/* Business Context Selector & Badge */}
        <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
          <div className="flex items-center gap-2 flex-wrap">
            <Briefcase className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold text-emerald-900">
              {selectedBusiness ? 'Active Business Context:' : 'Discuss a Specific Business:'}
            </span>
            <select
              value={selectedBusiness?.id || ''}
              onChange={(e) => {
                const found = SAMPLE_BUSINESSES.find((b) => b.id === e.target.value) || null;
                onSelectBusiness?.(found);
              }}
              className="bg-white px-2.5 py-1.5 rounded-xl border border-emerald-300 text-stone-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="">General Rural Advisory (All Businesses)</option>
              {SAMPLE_BUSINESSES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} (₹{b.estimatedCost.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {selectedBusiness && onSelectBusiness && (
            <button
              onClick={() => onSelectBusiness(null)}
              className="text-[11px] text-emerald-800 hover:text-emerald-950 underline font-bold shrink-0 cursor-pointer"
            >
              Reset to General Advisory
            </button>
          )}
        </div>

        {/* Prototype Transparency Notice */}
        <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Powered by Google Gemini Flash • Generates real-time, context-aware answers tailored to your capital and rural location.
          </span>
        </div>
      </div>

      {/* Answer Summary Box (Verification step before generating recommendations) */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 sm:p-6 rounded-3xl border border-amber-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-700" />
            <span>{t.advisor.summaryTitle}</span>
          </h3>
          <button
            onClick={onEditProfile}
            className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t.advisor.editSummary}</span>
          </button>
        </div>

        <p className="text-xs text-amber-800">{t.advisor.summaryDesc}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
            <span className="text-[11px] text-stone-500 block">Entrepreneur</span>
            <span className="font-bold text-stone-900">{profile.name || 'Not set'}</span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
            <span className="text-[11px] text-stone-500 block">Village / District</span>
            <span className="font-bold text-stone-900">
              {profile.location.village || profile.location.district || 'Rural Center'}
            </span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
            <span className="text-[11px] text-stone-500 block">Available Savings</span>
            <span className="font-bold text-stone-900">
              ₹{profile.availableCapital.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
            <span className="text-[11px] text-stone-500 block">Open to Loan</span>
            <span className="font-bold text-emerald-800">
              {profile.openToLoan ? 'Yes (Subsidized)' : 'Self-funded'}
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onViewRecommendations}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer hover:scale-[1.01] transition-all"
          >
            <span>{t.advisor.generateIdeas}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Error Alert Banner if an error occurred */}
      {errorBanner && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold block">Advisor Generation Issue</span>
              <span>{errorBanner.message}</span>
            </div>
          </div>
          {errorBanner.rawPrompt && (
            <button
              onClick={() => handleSendMessage(errorBanner.rawPrompt)}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-col h-[520px]">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeaking = speakingId === msg.id;
            const isDemo = msg.source === 'demo_mode';
            const isErrMsg = msg.isError;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-amber-500 text-white'
                      : isErrMsg
                      ? 'bg-rose-700 text-white'
                      : 'bg-emerald-800 text-white'
                  }`}
                >
                  {isUser ? (
                    <User className="w-4 h-4" />
                  ) : isErrMsg ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-emerald-700 text-white rounded-tr-none shadow-xs'
                        : isErrMsg
                        ? 'bg-rose-50 text-rose-950 rounded-tl-none border border-rose-300'
                        : 'bg-stone-100 text-stone-900 rounded-tl-none border border-stone-200'
                    }`}
                  >
                    {msg.text}

                    {/* Retry button for error message */}
                    {isErrMsg && msg.rawFailedPrompt && (
                      <div className="pt-3 mt-2 border-t border-rose-200 flex items-center justify-between">
                        <span className="text-[11px] text-rose-700 font-medium">
                          Spike in demand or timeout. You can retry immediately.
                        </span>
                        <button
                          onClick={() => handleSendMessage(msg.rawFailedPrompt)}
                          disabled={loading}
                          className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                          <span>Retry Question</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-2 px-1 text-[10px] text-stone-400 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && !isErrMsg && (
                      <>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.text, msg.id)}
                          className="hover:text-emerald-700 flex items-center gap-1 cursor-pointer font-medium"
                          title="Listen to this reply / आवाज सुनें"
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                              <span className="text-rose-600">Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="text-emerald-700">Listen</span>
                            </>
                          )}
                        </button>

                        <span>•</span>
                        {isDemo ? (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Demo Mode (Sample Guidance)
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {msg.source ? `Gemini (${msg.source})` : 'Gemini AI'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-stone-100 text-stone-700 rounded-tl-none text-xs flex items-center gap-3 border border-stone-200 shadow-2xs">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-stone-600 font-semibold">
                  VyapaarSathi is consulting Gemini AI for your local area...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/60 overflow-x-auto flex items-center gap-2">
          <span className="text-[11px] font-bold text-stone-500 shrink-0">
            {t.advisor.quickQuestions}
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="text-[11px] bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 px-3 py-1 rounded-full border border-stone-200 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-stone-200 bg-white rounded-b-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Mic Button */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-50 border-rose-400 text-rose-600 ring-2 ring-rose-400 animate-pulse'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-emerald-700'
              }`}
              title={isListening ? 'Click to stop listening' : t.advisor.speakButton}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? t.advisor.listening : t.advisor.placeholder}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs sm:text-sm bg-stone-50/50"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.advisor.send}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
