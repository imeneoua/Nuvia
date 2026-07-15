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
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput("");
    setIsLoading(true);

    // Call the routing service
    const botReply = await processChatMessage(userMessage);

    setMessages(prev => [...prev, { text: botReply, isBot: true }]);
    setIsLoading(false);
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
            <button className="chatbot-close" onClick={toggleChat}>×</button>
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
        </div>
      )}
    </div>
  );
};

export default Chatbot;
