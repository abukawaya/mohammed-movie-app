import { useState, useEffect, useRef } from "react";
import "../css/MovieCard.css";
import { useMovieContext } from "../contexts/MovieContext";
import { Heart, HeartOff, Bot, Loader2 } from "lucide-react";

function MovieCard({ movie }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const favorite = isFavorite(movie.id);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState("");
  const hovered = useRef(false);

  // ✅ تحميل الملخص من التخزين المحلي
  useEffect(() => {
    const cached = localStorage.getItem(`summary_${movie.id}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      setSummary(parsed.text);
      const timePassed = Date.now() - parsed.timestamp;
      // تحديث ذكي بعد 24 ساعة بدون تأخير العرض
      if (timePassed > 24 * 60 * 60 * 1000) {
        refreshSummaryInBackground();
      }
    }
  }, [movie.id]);

  // ⚙️ تحديث الملخص في الخلفية بدون تعطيل المستخدم
  async function refreshSummaryInBackground() {
    try {
      const newSummary = await generateAISummary();
      if (newSummary && newSummary !== summary) {
        setSummary(newSummary);
        localStorage.setItem(
          `summary_${movie.id}`,
          JSON.stringify({ text: newSummary, timestamp: Date.now() })
        );
      }
    } catch {
      /* تجاهل الأخطاء الخلفية */
    }
  }

  function handleFavorite(e) {
    e.preventDefault();
    if (favorite) removeFromFavorites(movie.id);
    else addToFavorites(movie);
  }

  async function generateAISummary() {
    const year = movie.release_date?.split("-")[0];
    const prompt = `
      اكتب نبذة جذابة وملهمة عن فيلم "${movie.title}"${year ? ` (${year})` : ''}.
      اجعلها قصيرة (3-4 جمل)، بأسلوب ناقد سينمائي محترف، بالعربية الفصحى الراقية.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    const data = await response.json();
    const aiSummary = data.choices?.[0]?.message?.content?.trim();
    if (!aiSummary || aiSummary.length < 15) throw new Error("ملخص غير صالح من النموذج.");
    return aiSummary;
  }

  async function handleAISummary(e) {
    e.preventDefault();
    setError("");

    // لو الملخص ظاهر حالياً، نخفيه
    if (showSummary) {
      setShowSummary(false);
      return;
    }

    // لو الملخص جاهز، نعرضه فوراً
    if (summary) {
      setShowSummary(true);
      return;
    }

    // غير موجود؟ نبدأ التحميل
    setIsLoading(true);
    setShowSummary(true);

    try {
      const aiSummary = await generateAISummary();
      setSummary(aiSummary);
      localStorage.setItem(
        `summary_${movie.id}`,
        JSON.stringify({ text: aiSummary, timestamp: Date.now() })
      );
    } catch (err) {
      console.error("❌ خطأ في التوليد:", err);
      setError("حدث خطأ أثناء الحصول على الملخص. حاول مرة أخرى بعد قليل.");
    } finally {
      setIsLoading(false);
    }
  }

  // 🚀 تحميل ذكي قبل الطلب (عند مرور الماوس)
  function handleHover() {
    if (hovered.current || summary) return;
    hovered.current = true;
    generateAISummary()
      .then((aiSummary) => {
        setSummary(aiSummary);
        localStorage.setItem(
          `summary_${movie.id}`,
          JSON.stringify({ text: aiSummary, timestamp: Date.now() })
        );
      })
      .catch(() => {});
  }

  return (
    <div className="movie-card" onMouseEnter={handleHover}>
      <div className="movie-poster">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />
        <div className="movie-overlay">
          <button
            className={`favorite-btn ${favorite ? "active" : ""}`}
            onClick={handleFavorite}
            title={favorite ? "إزالة من المفضلات" : "أضف للمفضلة"}
          >
            {favorite ? (
              <Heart className="icon" color="#e53935" fill="#e53935" size={28} />
            ) : (
              <HeartOff className="icon" color="#555" size={28} />
            )}
          </button>

          <button
            className={`ai-btn ${isLoading ? "loading" : ""} ${showSummary ? "active" : ""}`}
            onClick={handleAISummary}
            title="ملخص بالذكاء الاصطناعي"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="icon spin" size={26} />
            ) : (
              <Bot className="icon" style={{ fontSize: "1.8em" }} />
            )}
          </button>
        </div>

        {showSummary && (
          <div className="ai-summary-overlay">
            <div className="ai-summary-content">
              <div className="ai-summary-header">
                <Bot className="ai-icon" size={20} color="#facc15" />
                <h4>ملخص الفيلم</h4>
                <button
                  className="close-summary"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSummary(false);
                  }}
                >
                  ✕
                </button>
              </div>

              {error ? (
                <p className="ai-summary-text error">{error}</p>
              ) : (
                <p className="ai-summary-text">
                  {summary || "جارٍ توليد الملخص..."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>{movie.release_date?.split("-")[0]}</p>
      </div>
    </div>
  );
}


export default MovieCard;
