import { useState, useRef, useEffect } from "react";
import "./chatbot.css";
import botPic from "./assets/chatbotPic.png";
import { XMarkIcon } from "@heroicons/react/24/solid";

const API_URL = import.meta.env.VITE_API_URL;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! 👋 How can I help you today?",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatBodyRef.current?.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || "Something went wrong");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, I couldn't reach the kitchen 🍳. Try again in a moment.", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* TOGGLE BUTTON */}
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {/* CHATBOX */}
      {isOpen && (
        <div className="chat-container">
          {/* HEADER */}
          <div className="chat-header">
            <div className="header-left">
              <img src={botPic} alt="Bot" className="bot-avatar" />
              <div className="bot-info">
                <h3>Nuvia Chef</h3>
              </div>
            </div>

            {/* CLOSE BUTTON */}
           <button className="close-btn" onClick={() => setIsOpen(false)}>
               <XMarkIcon style={{ width: "24px", color: "white" }} />
          </button>
          </div>

          {/* BODY */}
          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.sender === "user"
                    ? "user-message"
                    : "bot-message"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="message bot-message">Thinking...</div>
            )}
          </div>

          {/* FOOTER */}
          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
            />

            <button onClick={sendMessage} disabled={loading}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}