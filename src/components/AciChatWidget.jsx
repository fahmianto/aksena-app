import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, User, Send, X, MessageSquare, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './AciChatWidget.css'; // Import custom CSS

export default function AciChatWidget() {
  const { userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const roleName = userData?.role === 'superadmin' ? 'Bos' : 'Kak';
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: `Halo ${roleName}! Saya **Aksena Business Intelligence (ACI)**. Ada data analitik atau insight yang bisa saya bantu carikan hari ini?`
        }
      ]);
    }
  }, [isOpen, userData, messages.length]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    
    const newMessages = [...messages, { id: Date.now(), sender: 'user', text: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Fix CORS & Proxy: Use relative URL '/api/...'
      const response = await fetch('/api/aci/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          role: userData?.role || 'admin'
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Server error');

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: data.reply }
      ]);
    } catch (error) {
      console.error("ACI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: "*(Koneksi ke Aksena Brain terputus. Pastikan server lokal berjalan.)*" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="aci-widget-container">
      {isOpen && (
        <div className="aci-chat-window">
          {/* Header */}
          <div className="aci-header">
            <div className="aci-header-left">
              <div className="aci-header-icon">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="aci-header-title">Aksena Master Brain</h3>
                <p className="aci-header-subtitle">
                  {userData?.role === 'superadmin' ? 'CEO Consultant Mode' : 'Staff Assistant Mode'}
                </p>
              </div>
            </div>
            <button className="aci-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="aci-messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`aci-message-row ${msg.sender}`}>
                <div className={`aci-bubble ${msg.sender}`}>
                  {msg.sender === 'ai' ? (
                    <div className="aci-markdown-content">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="aci-message-row ai">
                <div className="aci-loading-bubble">
                  <Loader2 size={16} className="aci-spinner" />
                  <span>Menganalisa data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="aci-input-area">
            <form onSubmit={handleSendMessage} className="aci-input-form">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={userData?.role === 'superadmin' ? 'Tanya omzet, stok mati, leads...' : 'Tanya seputar stok & operasional...'}
                className="aci-input"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="aci-send-btn"
              >
                <Send size={16} style={{ marginLeft: '2px' }} />
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button className="aci-trigger-btn" onClick={() => setIsOpen(true)}>
          <MessageSquare size={24} />
          <span className="aci-notification-dot">
            <span className="aci-ping"></span>
            <span className="aci-dot"></span>
          </span>
        </button>
      )}
    </div>
  );
}
