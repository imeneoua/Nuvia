import { useState, useRef, useEffect } from "react";
import "./chatbot.css";
import botPic from "./assets/chatbotPic.png";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! 👋 How can I help you today?",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");
  const chatBodyRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatBodyRef.current?.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "I'm still learning 🤖", sender: "bot" },
      ]);
    }, 600);
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
          </div>

          {/* FOOTER */}
          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />

            <button onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}