import { useState, useEffect, useRef } from "react";
import { Search, Film, TrendingUp, Sparkles,  Send, Bot} from "lucide-react";
import MovieCard from "../Components/MovieCard";
import { searchMovies, getPopularMovies } from "../Services/api";

function Home() {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Chatbot States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "👋 مرحباً! أنا مساعدك الذكي للأفلام. كيف يمكنني مساعدتك اليوم؟" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const loadPopularMovies = async () => {
    try {
      setLoading(true);
      const popularMovies = await getPopularMovies();
      setMovies(popularMovies);
      setError(null);
    } catch (err) {
      setError("Failed to load popular movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopularMovies();
  }, []);

  useEffect(() => {
    if (search === "") {
      loadPopularMovies();
    }
  }, [search]);

  const handleSubmit = async () => {
    if (!search.trim() || loading) return;
    setLoading(true);
    try {
      const searchResults = await searchMovies(search);
      setMovies(searchResults);
      setError(null);
    } catch (err) {
      setError("Failed to search for movies");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleClear = () => {
    setSearch("");
  };

  // Chatbot Functions with AI
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: "أنت مساعد ذكي متخصص في الأفلام. اسمك 'مساعد الأفلام الذكي'. تساعد المستخدمين في اكتشاف الأفلام والحصول على توصيات وإجابات عن أسئلتهم حول الأفلام. كن ودوداً ومفيداً واستخدم الإيموجي بشكل مناسب. أجب باللغة العربية أو الإنجليزية حسب لغة السؤال."
            },
            { role: "user", content: userMessage }
          ],
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const aiResponse = data.choices[0].message.content;
        setChatMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error calling AI:", error);
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: "عذراً، حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى. 😔" 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <div className="home">
      {/* Animated Background Elements */}
      <div className="bg-gradient-1"></div>
      <div className="bg-gradient-2"></div>
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <Film size={48} />
          </div>
          <h1 className="hero-title">
            <span className="gradient-text">Discover</span> Amazing Movies
          </h1>
          <p className="hero-subtitle">
            <TrendingUp size={20} />
            Explore thousands of movies and find your next favorite
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="search-form">
        <div className="search-container">
          <Search className="search-icon" size={22} />
          <input
            type="text"
            placeholder="Search for movies, actors, genres..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          {search && (
            <button 
              type="button" 
              className="clear-button"
              onClick={handleClear}
            >
              ✕
            </button>
          )}
        </div>
        <button 
          type="button" 
          className="search-button" 
          disabled={loading || !search.trim()} 
          onClick={handleSubmit}
        >
          <Sparkles size={20} />
          <span>Search</span>
        </button>
        <button 
          type="button" 
          className="chat-toggle-button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          title="فتح المساعد الذكي"
        >
          <Bot size={22} />
          {!isChatOpen && <span className="chat-badge">AI</span>}
        </button>
      </div>

      {/* Chatbot */}
      <div className={`chatbot-container ${isChatOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <div className="chatbot-avatar">
              <Film size={24} />
              <span className="avatar-pulse"></span>
            </div>
            <div className="chatbot-title">
              <h3>مساعد الأفلام الذكي</h3>
              <span className="chatbot-status">
                <span className="status-dot"></span>
                متصل الآن
              </span>
            </div>
          </div>
          <button 
            className="chatbot-close"
            onClick={() => setIsChatOpen(false)}
          >
           ✕
          </button>
        </div>

        <div className="chatbot-messages">
          {chatMessages.map((message, index) => (
            <div 
              key={index} 
              className={`chat-message ${message.role}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {message.role === 'assistant' && (
                <div className="message-avatar">
                  <Film size={16} />
                </div>
              )}
              <div className="message-bubble">
                {message.content}
              </div>
             
            </div>
          ))}
          {isChatLoading && (
            <div className="chat-message assistant">
              <div className="message-avatar">
                <Film size={16} />
              </div>
              <div className="message-bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input-container">
          <input
            type="text"
            placeholder="اكتب رسالتك هنا..."
            className="chatbot-input"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleChatKeyPress}
          />
          <button 
            className="chatbot-send"
            onClick={handleChatSubmit}
            disabled={!chatInput.trim() || isChatLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {loading ? (
          <div className="spinner-container">
            <div className="spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <Film className="spinner-icon" size={32} />
            </div>
            <p className="loading-text">Loading amazing content...</p>
          </div>
        ) : error ? (
          <div className="status-message error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="status-message empty">
            <div className="empty-icon">🎬</div>
            <h3>No Movies Found</h3>
            <p>Try searching for something else</p>
          </div>
        ) : (
          <>
            <div className="results-header">
              <h2 className="results-title">
                {search ? `Search Results for "${search}"` : 'Popular Movies'}
                <span className="results-count">{movies.length} movies</span>
              </h2>
              
            </div>
            <div className="movie-grid">
              {movies.map((movie, index) => (
                <div 
                  key={movie.id} 
                  className="movie-card-wrapper"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ====== Custom Scrollbar Design ====== */
/* WebKit Browsers (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 12, 41, 0.6);
  border-radius: 12px;
  margin: 6px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #10b981 100%);
  border-radius: 12px;
  border: 3px solid rgba(15, 12, 41, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #34d399 100%);
  border-color: rgba(15, 12, 41, 0.4);
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.9);
  transform: scale(1.05);
}

::-webkit-scrollbar-thumb:active {
  background: linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #059669 100%);
  box-shadow: 0 0 30px rgba(139, 92, 246, 1);
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #8b5cf6 rgba(15, 12, 41, 0.5);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
  overflow: hidden;
  height: 100%;
}

body {
  overflow: hidden;
  margin: 0;
  padding: 0;
  height: 100%;
}

#root {
  height: 100%;
  overflow: hidden;
}

/* ====== Home Container ====== */
.home {
  min-height: 100vh;
  height: 100vh;
  background: 
    radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, #0a0118 0%, #1a0b2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%);
  background-size: 100% 100%, 100% 100%, 100% 100%;
  background-attachment: fixed;
  color: #ffffff;
  padding: 2rem;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  animation: fadeIn 1s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    transform: scale(0.98);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

/* ====== Animated Background ====== */
.bg-gradient-1,
.bg-gradient-2 {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.2;
  pointer-events: none;
  animation: float 25s ease-in-out infinite;
  z-index: 0;
}

.bg-gradient-1 {
  top: -15%;
  left: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(168, 85, 247, 0.4) 35%, transparent 70%);
  animation-delay: 0s;
  box-shadow: 0 0 100px rgba(139, 92, 246, 0.4);
}

.bg-gradient-2 {
  bottom: -15%;
  right: -10%;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(96, 165, 250, 0.3) 35%, transparent 70%);
  animation-delay: 7s;
  box-shadow: 0 0 100px rgba(59, 130, 246, 0.4);
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  25% {
    transform: translate(40px, -40px) scale(1.15) rotate(90deg);
  }
  50% {
    transform: translate(-30px, 30px) scale(0.95) rotate(180deg);
  }
  75% {
    transform: translate(50px, 20px) scale(1.1) rotate(270deg);
  }
}

/* ====== Floating Particles ====== */
.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 5px;
  height: 5px;
  background: rgba(139, 92, 246, 0.8);
  border-radius: 50%;
  animation: particleFloat linear infinite;
  box-shadow: 
    0 0 15px rgba(139, 92, 246, 1),
    0 0 30px rgba(139, 92, 246, 0.6),
    0 0 45px rgba(139, 92, 246, 0.3);
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) translateX(0) scale(0) rotate(0deg);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  50% {
    transform: translateY(50vh) translateX(50px) scale(1) rotate(180deg);
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(-50px) scale(1.2) rotate(360deg);
    opacity: 0;
  }
}

/* ====== Hero Section ====== */
.hero-section {
  max-width: 1200px;
  margin: 0 auto 3rem;
  text-align: center;
  position: relative;
  z-index: 1;
  animation: slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content {
  margin-top:7rem;
  backdrop-filter: blur(20px) saturate(180%);
  background: 
    linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%),
    rgba(255, 255, 255, 0.03);
  border-radius: 2.5rem;
  padding: 3rem 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 15px 50px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 80px rgba(139, 92, 246, 0.15);
  position: relative;
  overflow: hidden;
}

.hero-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: heroShine 3s ease-in-out infinite;
}

@keyframes heroShine {
  0%, 100% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
}

.hero-icon {
  display: inline-flex;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
  border-radius: 50%;
  margin-bottom: 1.5rem;
  animation: iconPulse 3s ease-in-out infinite;
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.4);
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 40px rgba(139, 92, 246, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 60px rgba(139, 92, 246, 0.6);
  }
}

.hero-icon svg {
  color: #8b5cf6;
  filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.8));
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
  animation: titleGlow 3s ease-in-out infinite;
}

@keyframes titleGlow {
  0%, 100% {
    text-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }
  50% {
    text-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.4);
  }
}

.gradient-text {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6, #8b5cf6);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  animation: fadeInUp 1s ease 0.3s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ====== Search Form ====== */
.search-form {
  max-width: 900px;
  margin: 0 auto 3rem;
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 10;
  animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.search-form::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 1.5rem;
  padding: 2px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.5));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.search-form:hover,
.search-form:focus-within {
  box-shadow: 
    0 12px 48px rgba(139, 92, 246, 0.3),
    0 0 0 1px rgba(139, 92, 246, 0.2);
  transform: translateY(-2px);
}

.search-form:hover::before,
.search-form:focus-within::before {
  opacity: 1;
}

.search-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1.2rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.search-container:focus-within {
  background: rgba(255, 255, 255, 0.08);
}

.search-icon {
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.search-container:focus-within .search-icon {
  color: #8b5cf6;
  transform: scale(1.1);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 1.05rem;
  outline: none;
  font-weight: 500;
  min-width: 0;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.clear-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.6);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  padding: 0;
}

.clear-button:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #fff;
  transform: scale(1.1);
}

.search-button {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  color: #fff;
  border-radius: 1.2rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  flex-shrink: 0;
}

.search-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.search-button:hover::before {
  left: 100%;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5);
}

.search-button:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.search-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(139, 92, 246, 0.3);
}

/* ====== Content Section ====== */
.content-section {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ====== Results Header ====== */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: slideInLeft 0.6s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.results-title {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.results-count {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: 62rem;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

/* ====== Spinner ====== */
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 2rem;
}

.spinner {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spinRing 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #8b5cf6;
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  width: 85%;
  height: 85%;
  border-top-color: #3b82f6;
  animation-delay: 0.3s;
}

.spinner-ring:nth-child(3) {
  width: 70%;
  height: 70%;
  border-top-color: #6366f1;
  animation-delay: 0.6s;
}

@keyframes spinRing {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner-icon {
  color: #8b5cf6;
  animation: iconBounce 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.8));
}

@keyframes iconBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.loading-text {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  animation: textPulse 1.5s ease-in-out infinite;
}

@keyframes textPulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* ====== Status Messages ====== */
.status-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1.5rem;
  animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.status-message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 1.5rem;
  padding: 3rem;
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.2);
}

.error-icon {
  font-size: 4rem;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.status-message.empty {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  animation: floatIcon 3s ease-in-out infinite;
}

@keyframes floatIcon {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.status-message h3 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.status-message p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
}

/* ====== Movie Grid ====== */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 3rem;
  padding: 1rem;
}

.movie-card-wrapper {
  animation: cardFadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ====== Chat Toggle Button ====== */
.chat-toggle-button {
  padding: 1rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  color: #fff;
  border-radius: 1.2rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
  min-width: 56px;
}

.chat-toggle-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.chat-toggle-button:hover::before {
  left: 100%;
}

.chat-toggle-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5);
}

.chat-toggle-button:active {
  transform: translateY(0) scale(0.98);
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.5);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.9);
  }
}

/* ====== Chatbot Container ====== */
.chatbot-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 420px;
  height: 600px;
  background: linear-gradient(135deg, rgba(15, 12, 41, 0.98), rgba(30, 27, 75, 0.98));
  backdrop-filter: blur(20px);
  border-radius: 1.5rem;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transform: translateY(calc(100% + 3rem)) scale(0.8);
  opacity: 0;
  pointer-events: none;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chatbot-container.open {
  transform: translateY(0) scale(1);
  opacity: 1;
  pointer-events: all;
}

.chatbot-container::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 1.5rem;
  padding: 2px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.6), rgba(16, 185, 129, 0.6));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: borderGlow 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes borderGlow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* ====== Chatbot Header ====== */
.chatbot-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(16, 185, 129, 0.25));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem 1.5rem 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.chatbot-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  animation: headerShine 3s ease-in-out infinite;
}

@keyframes headerShine {
  0%, 100% {
    transform: translateX(-100%) translateY(-100%);
  }
  50% {
    transform: translateX(100%) translateY(100%);
  }
}

.chatbot-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.chatbot-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.6);
}

.chatbot-avatar svg {
  color: #fff;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
}

.avatar-pulse {
  position: absolute;
  inset: -4px;
  border: 2px solid rgba(139, 92, 246, 0.6);
  border-radius: 50%;
  animation: avatarPulse 2s ease-in-out infinite;
}

@keyframes avatarPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.chatbot-title h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.chatbot-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: statusBlink 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(16, 185, 129, 1);
}

@keyframes statusBlink {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 10px rgba(16, 185, 129, 1);
  }
  50% {
    opacity: 0.5;
    box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
  }
}

.chatbot-close {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.chatbot-close svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

.chatbot-close:hover {
  background: rgba(239, 68, 68, 0.4);
  border-color: rgba(239, 68, 68, 0.6);
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
}

.chatbot-close:active {
  transform: rotate(90deg) scale(0.95);
}

/* ====== Chat Messages ====== */
.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.25);
}

.chatbot-messages::-webkit-scrollbar {
  width: 8px;
}

.chatbot-messages::-webkit-scrollbar-track {
  background: rgba(15, 12, 41, 0.5);
  border-radius: 10px;
  margin: 8px 0;
}

.chatbot-messages::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #8b5cf6, #10b981);
  border-radius: 10px;
  border: 2px solid rgba(15, 12, 41, 0.5);
}

.chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #a78bfa, #34d399);
}

.chat-message {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  animation: messageSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(139, 92, 246, 0.5);
}

.message-avatar svg {
  color: #fff;
}

.message-avatar.user {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff;
}

.message-bubble {
  max-width: 75%;
  padding: 0.875rem 1.125rem;
  border-radius: 1.25rem;
  font-size: 0.95rem;
  line-height: 1.6;
  position: relative;
  word-wrap: break-word;
  color: #fff;
}

.chat-message.assistant .message-bubble {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(16, 185, 129, 0.25));
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 1.25rem 1.25rem 1.25rem 0.25rem;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.chat-message.user .message-bubble {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(37, 99, 235, 0.35));
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 1.25rem 1.25rem 0.25rem 1.25rem;
  text-align: right;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.message-bubble.typing {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
}

.message-bubble.typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.9);
  animation: typingDot 1.4s ease-in-out infinite;
}

.message-bubble.typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.message-bubble.typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDot {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* ====== Chat Input ====== */
.chatbot-input-container {
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.35);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 0.75rem;
  border-radius: 0 0 1.5rem 1.5rem;
}

.chatbot-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  padding: 0.875rem 1.125rem;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
  font-family: inherit;
  resize: none;
  min-height: 48px;
  max-height: 120px;
}

.chatbot-input:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.chatbot-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.chatbot-send {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6, #10b981);
  border: none;
  border-radius: 1rem;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.5);
  flex-shrink: 0;
}

.chatbot-send svg {
  width: 20px;
  height: 20px;
}

.chatbot-send:hover:not(:disabled) {
  transform: scale(1.08) rotate(-5deg);
  box-shadow: 0 6px 25px rgba(139, 92, 246, 0.7);
  background: linear-gradient(135deg, #a78bfa, #34d399);
}

.chatbot-send:active:not(:disabled) {
  transform: scale(0.95);
}

.chatbot-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3));
}

/* ====== Responsive Design ====== */
@media (max-width: 768px) {
  .home {
    padding: 1.5rem 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .search-form {
    flex-direction: column;
    padding: 1rem;
  }

  .search-button {
    width: 100%;
    justify-content: center;
    padding: 0.9rem;
  }

  .results-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 1rem;
  }

  .results-title {
    font-size: 1.4rem;
  }

  .results-count {
    margin-left: 0;
  }

  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    border: 1px solid rgba(15, 12, 41, 0.5);
  }

  .chat-toggle-button {
    width: 100%;
    justify-content: center;
    padding: 0.9rem;
  }

  .chatbot-container {
    width: calc(100% - 2rem);
    height: calc(100vh - 4rem);
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-height: 600px;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 2rem 1rem;
  }

  .hero-icon {
    padding: 1rem;
  }

  .hero-icon svg {
    width: 32px;
    height: 32px;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .hero-subtitle {
    font-size: 0.9rem;
  }

  .search-container {
    padding: 0.7rem 1rem;
  }

  .search-input {
    font-size: 0.95rem;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .chatbot-container {
    width: calc(100% - 1rem);
    height: calc(100vh - 2rem);
    bottom: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }

  .chatbot-header {
    padding: 1rem;
  }

  .chatbot-avatar {
    width: 42px;
    height: 42px;
  }

  .chatbot-title h3 {
    font-size: 1rem;
  }

  .chatbot-messages {
    padding: 1rem;
  }

  .message-bubble {
    font-size: 0.9rem;
    max-width: 80%;
  }
}



      `}</style>
    </div>
  );
}

export default Home;






