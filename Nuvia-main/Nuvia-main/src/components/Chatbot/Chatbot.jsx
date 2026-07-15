import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import { processChatMessage } from '../../services/chatbotService';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Bonjour ! Je suis Nuvia, votre assistant culinaire. Comment puis-je vous aider ?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState('text'); // 'text' or 'voice'
  const [voiceOrbState, setVoiceOrbState] = useState('idle'); // 'idle', 'listening', 'thinking', 'speaking'
  const [lang, setLang] = useState('fr'); // 'fr', 'en', 'ar'
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition once
  useEffect(() => {
    if (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        setVoiceOrbState('listening');
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (chatMode === 'voice') {
          setVoiceOrbState('thinking');
          sendMessage(transcript);
        } else {
          setInput(prev => prev ? prev + " " + transcript : transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (chatMode === 'voice') setVoiceOrbState('idle');
      };

      recognitionRef.current.onend = () => {
        // If we are in voice mode and still 'listening' or 'idle', we might want to restart, but 
        // to avoid infinite loops, let's just go idle if we aren't thinking or speaking.
        if (chatMode === 'voice' && voiceOrbState === 'listening') {
           setVoiceOrbState('idle');
        }
      };
    }
  }, [chatMode]); // Re-bind when mode changes to capture correct state

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Stop speaking if chat is closed
    if (isOpen) {
      window.speechSynthesis.cancel();
    }
  };

  const cycleLanguage = () => {
    if (lang === 'fr') setLang('en');
    else if (lang === 'en') setLang('ar');
    else setLang('fr');
  };

  const toggleChatMode = () => {
    const newMode = chatMode === 'text' ? 'voice' : 'text';
    setChatMode(newMode);
    
    if (newMode === 'voice') {
      // Start listening immediately when opening voice mode
      startListening();
    } else {
      // Exiting voice mode
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
      setVoiceOrbState('idle');
    }
  };

  const speakText = (text) => {
    // Ne parle qu'en mode vocal
    if (chatMode === 'text' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Stop any current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (lang === 'fr') utterance.lang = 'fr-FR';
    else if (lang === 'en') utterance.lang = 'en-US';
    else if (lang === 'ar') utterance.lang = 'ar-SA';
    
    const playVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      let targetVoice;
      
      if (lang === 'fr') {
        targetVoice = voices.find(v => v.lang === 'fr-FR' && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('fr'));
      } else if (lang === 'en') {
        targetVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
      } else if (lang === 'ar') {
        targetVoice = voices.find(v => v.lang.startsWith('ar') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('ar'));
      }
      
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      utterance.onstart = () => {
        if (chatMode === 'voice') setVoiceOrbState('speaking');
      };

      utterance.onend = () => {
        if (chatMode === 'voice') {
          // Restart listening automatically after speaking! (The ChatGPT Loop)
          setVoiceOrbState('idle');
          startListening();
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    // Les voix chargent parfois de manière asynchrone sur Chrome/Edge
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = playVoice;
      // Fallback de sécurité
      setTimeout(() => window.speechSynthesis.speak(utterance), 500);
    } else {
      playVoice();
    }
  };

  const sendMessage = async (textToProcess) => {
    if (!textToProcess.trim()) return;

    setMessages(prev => [...prev, { text: textToProcess, isBot: false }]);
    setInput("");
    setIsLoading(true);

    // Call the routing service with the selected language
    const botReply = await processChatMessage(textToProcess, lang);

    setMessages(prev => [...prev, { text: botReply, isBot: true }]);
    setIsLoading(false);
    
    // Speak the response (speakText will only speak if chatMode === 'voice')
    speakText(botReply);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }

    if (lang === 'fr') recognitionRef.current.lang = 'fr-FR';
    else if (lang === 'en') recognitionRef.current.lang = 'en-US';
    else if (lang === 'ar') recognitionRef.current.lang = 'ar-SA';
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Ignore if already started
    }
  };

  return (
    <div className="chatbot-container">
      {/* Floating Button */}
      {!isOpen && (
        <button 
          className="chatbot-fab" 
          onClick={toggleChat}
          title="Chat with Nuvia"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h4>Nuvia Assistant</h4>
            <div>
              <button 
                className="chatbot-lang-btn" 
                onClick={cycleLanguage}
                title="Changer de langue (FR/EN/AR)"
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', marginRight: '10px' }}
              >
                {lang === 'fr' ? '🇫🇷' : lang === 'en' ? '🇬🇧' : '🇸🇦'}
              </button>
              <button 
                className="chatbot-mode-btn" 
                onClick={toggleChatMode}
                title="Passer en mode vocal (Façon ChatGPT)"
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', marginRight: '10px' }}
              >
                🎧
              </button>
              <button className="chatbot-close" onClick={toggleChat}>×</button>
            </div>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
                <div className={`chat-bubble ${msg.isBot ? 'bot' : 'user'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-bubble-wrapper bot">
                <div className="chat-bubble bot loading">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Form is only visible in Text Mode */}
          <form className="chatbot-input-form" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Écrivez votre message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Envoyer
            </button>
          </form>
          
          {/* Voice Mode Overlay */}
          {chatMode === 'voice' && (
            <div className="chatbot-voice-overlay">
              <div className="voice-orb-container">
                <div 
                  className={`voice-orb ${voiceOrbState}`} 
                  onClick={() => {
                    if (voiceOrbState === 'idle') startListening();
                  }}
                ></div>
              </div>
              
              <div className="voice-status-text">
                {voiceOrbState === 'listening' && "Je vous écoute..."}
                {voiceOrbState === 'thinking' && "Je réfléchis..."}
                {voiceOrbState === 'speaking' && "Nuvia parle"}
                {voiceOrbState === 'idle' && "Touchez le centre pour parler"}
              </div>

              <div style={{ flex: 1 }}></div>

              <button className="voice-close-btn" onClick={toggleChatMode}>
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
