import { useState, useEffect, useRef } from "react";
import { Search, Film, TrendingUp, Sparkles, Send, Bot} from "lucide-react";
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
          model: "openai/gpt-4o-mini",
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
          width: 12px;
          height: 12px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(15, 12, 41, 0.5);
          border-radius: 10px;
          margin: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          border-radius: 10px;
          border: 2px solid rgba(15, 12, 41, 0.5);
          transition: all 0.3s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          border-color: rgba(15, 12, 41, 0.3);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }

        ::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, #7c3aed, #2563eb);
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
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          color: #ffffff;
          padding: 2rem;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          animation: fadeIn 0.8s ease;
        }

        @keyframes fadeIn {
          from { 
            opacity: 0;
          }
          to { 
            opacity: 1;
          }
        }

        /* ====== Animated Background ====== */
        .bg-gradient-1,
        .bg-gradient-2 {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          pointer-events: none;
          animation: float 20s ease-in-out infinite;
          z-index: 0;
        }

        .bg-gradient-1 {
          top: -10%;
          left: -5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent 70%);
          animation-delay: 0s;
        }

        .bg-gradient-2 {
          bottom: -10%;
          right: -5%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%);
          animation-delay: 5s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
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
          width: 4px;
          height: 4px;
          background: rgba(139, 92, 246, 0.6);
          border-radius: 50%;
          animation: particleFloat linear infinite;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
    </div>
  );
}


export default Home;


