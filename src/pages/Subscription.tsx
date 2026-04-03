import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const FEATURES = [
  { text: "Эксклюзивные эмодзи-бейджи на профиль", icon: "Award" },
  { text: "Уникальные стикеры в чатах", icon: "Sticker" },
  { text: "Анимированный аватар", icon: "Sparkles" },
  { text: "Без рекламы навсегда", icon: "ShieldCheck" },
];

const PREMIUM_BADGES = ["👑", "💎", "🦄", "⚡", "🌈", "🔮"];

export default function Subscription() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const isPremium = localStorage.getItem("pulse_premium") === "true";

  function handleSubscribe() {
    if (isPremium) return;
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      localStorage.setItem("pulse_premium", "true");
      setProcessing(false);
      setSuccess(true);
    }, 1500);
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background font-golos overflow-hidden relative">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-pink-600/8 blur-[140px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 overflow-y-auto max-h-[90vh]">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all mb-4"
        >
          <Icon name="ArrowLeft" size={18} />
        </button>

        {success || isPremium ? (
          /* Success state */
          <div className="glass rounded-3xl p-8 animate-fade-in-up text-center">
            <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mx-auto mb-5 animate-pulse-glow shadow-2xl shadow-violet-500/30">
              <span className="text-4xl">👑</span>
            </div>
            <h1 className="text-3xl font-black gradient-text mb-2">
              Вы Premium!
            </h1>
            <p className="text-white/50 text-sm mb-6">
              Все премиум-функции активированы
            </p>

            <div className="flex justify-center gap-3 mb-6">
              {PREMIUM_BADGES.map((badge, i) => (
                <span
                  key={i}
                  className="text-2xl animate-float"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {badge}
                </span>
              ))}
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full gradient-bg text-white font-bold py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/30"
            >
              Вернуться в чаты
            </button>
          </div>
        ) : (
          /* Subscription offer */
          <div className="animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mx-auto mb-4 animate-pulse-glow shadow-2xl shadow-violet-500/30">
                <Icon name="Crown" size={36} className="text-white" />
              </div>
              <h1 className="text-3xl font-black gradient-text mb-1">
                Pulse Premium
              </h1>
              <p className="text-white/40 text-sm">
                Разблокируйте все возможности
              </p>
            </div>

            {/* Price card */}
            <div className="glass rounded-3xl p-6 mb-4">
              <div className="text-center mb-5">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black gradient-text">20</span>
                  <span className="text-xl font-bold text-white/60">₽</span>
                </div>
                <p className="text-white/40 text-sm mt-1">в месяц</p>
              </div>

              <div className="space-y-3">
                {FEATURES.map((feature, i) => (
                  <div
                    key={feature.text}
                    className={`flex items-center gap-3 animate-fade-in-up`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                      <Icon name="Check" size={14} className="text-white" />
                    </div>
                    <p className="text-sm text-white/80">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges preview */}
            <div className="glass rounded-3xl p-5 mb-4">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3 text-center">
                Премиум-бейджи
              </p>
              <div className="flex justify-center gap-4">
                {PREMIUM_BADGES.map((badge, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-2xl hover:scale-110 transition-transform animate-float cursor-default"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    {badge}
                  </div>
                ))}
              </div>
            </div>

            {/* Subscribe button */}
            <button
              onClick={handleSubscribe}
              disabled={processing}
              className={`w-full font-bold py-4 rounded-2xl transition-all text-base relative overflow-hidden ${
                processing
                  ? "bg-white/10 text-white/40 cursor-wait"
                  : "gradient-bg text-white hover:scale-[1.02] shadow-lg shadow-violet-500/30"
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  Обработка...
                </span>
              ) : (
                "Оформить подписку — 20₽/мес"
              )}
            </button>

            <p className="text-white/20 text-xs text-center mt-3">
              Отмена в любой момент
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
