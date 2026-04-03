import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

type Step = "welcome" | "phone" | "code";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  let formatted = "+7";
  if (digits.length > 0) formatted += " (" + digits.slice(0, 3);
  if (digits.length >= 3) formatted += ") " + digits.slice(3, 6);
  if (digits.length >= 6) formatted += "-" + digits.slice(6, 8);
  if (digits.length >= 8) formatted += "-" + digits.slice(8, 10);
  return formatted;
}

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState("");
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneRef = useRef<HTMLInputElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("pulse_user");
    if (user) navigate("/", { replace: true });
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (step !== "code") return;
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Focus phone input on step change
  useEffect(() => {
    if (step === "phone") {
      setTimeout(() => phoneRef.current?.focus(), 300);
    }
    if (step === "code") {
      setTimeout(() => codeRefs.current[0]?.focus(), 300);
    }
  }, [step]);

  function goToStep(next: Step) {
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 200);
  }

  function handlePhoneInput(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value;
    // Extract only digits after +7
    const raw = input.replace(/\D/g, "");
    // If user typed starting from 7 or 8, strip it
    if (raw.startsWith("7")) {
      setPhoneRaw(raw.slice(1));
    } else if (raw.startsWith("8")) {
      setPhoneRaw(raw.slice(1));
    } else {
      setPhoneRaw(raw.slice(0, 10));
    }
    setError("");
  }

  function handlePhoneSubmit() {
    if (phoneRaw.length < 10) {
      setError("Введите полный номер телефона");
      return;
    }
    setCountdown(60);
    setCode(["", "", "", ""]);
    goToStep("code");
  }

  function handleCodeInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError("");

    if (digit && index < 3) {
      codeRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (digit && index === 3) {
      const fullCode = newCode.join("");
      if (fullCode.length === 4) {
        handleVerify(fullCode);
      }
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  }

  function handleVerify(fullCode?: string) {
    const codeStr = fullCode || code.join("");
    if (codeStr.length < 4) {
      setError("Введите 4-значный код");
      return;
    }
    // Simulate verification - any 4-digit code works
    const formattedPhone = formatPhone(phoneRaw);
    const userData = {
      phone: formattedPhone,
      name: "Пользователь",
      createdAt: Date.now(),
    };
    localStorage.setItem("pulse_user", JSON.stringify(userData));
    navigate("/", { replace: true });
  }

  function resendCode() {
    if (countdown > 0) return;
    setCountdown(60);
    setCode(["", "", "", ""]);
    codeRefs.current[0]?.focus();
  }

  const phoneDisplay = phoneRaw.length > 0 ? formatPhone(phoneRaw) : "+7";

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background font-golos overflow-hidden relative">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-pink-600/8 blur-[140px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      {/* Auth card */}
      <div
        className={`relative z-10 glass rounded-3xl p-8 w-full max-w-sm mx-4 transition-all duration-200 ${
          animating ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Step 1: Welcome */}
        {step === "welcome" && (
          <div className="flex flex-col items-center animate-fade-in-up">
            <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center mb-6 animate-pulse-glow shadow-2xl shadow-violet-500/30">
              <span className="text-white text-5xl font-black">P</span>
            </div>

            <h1 className="text-4xl font-black gradient-text mb-2">Pulse</h1>
            <p className="text-white/50 text-sm text-center mb-8">
              Мессенджер нового поколения
            </p>

            <div className="flex flex-col items-center gap-3 mb-8">
              {[
                { icon: "Zap", text: "Мгновенные сообщения" },
                { icon: "Shield", text: "Безопасные звонки" },
                { icon: "Sparkles", text: "Уникальные стикеры" },
              ].map((feature, i) => (
                <div
                  key={feature.text}
                  className={`flex items-center gap-3 text-white/60 text-sm animate-fade-in-up`}
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <Icon name={feature.icon} size={16} className="text-violet-400" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => goToStep("phone")}
              className="w-full gradient-bg text-white font-bold py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/30 text-base"
            >
              Начать
            </button>
          </div>
        )}

        {/* Step 2: Phone input */}
        {step === "phone" && (
          <div className="flex flex-col items-center animate-fade-in-up">
            <button
              onClick={() => goToStep("welcome")}
              className="self-start w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all mb-4"
            >
              <Icon name="ArrowLeft" size={18} />
            </button>

            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-5 shadow-lg shadow-violet-500/30">
              <Icon name="Smartphone" size={28} className="text-white" />
            </div>

            <h2 className="text-xl font-black text-white mb-1">Ваш номер</h2>
            <p className="text-white/40 text-sm text-center mb-6">
              Введите номер телефона для входа
            </p>

            <div className="w-full mb-2">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-lg">🇷🇺</span>
                </div>
                <input
                  ref={phoneRef}
                  type="tel"
                  value={phoneDisplay}
                  onChange={handlePhoneInput}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-lg text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-all font-semibold tracking-wide"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePhoneSubmit();
                  }}
                />
              </div>
              {error && step === "phone" && (
                <p className="text-red-400 text-xs mt-2 px-1">{error}</p>
              )}
            </div>

            <p className="text-white/25 text-xs text-center mb-6">
              Мы отправим SMS с кодом подтверждения
            </p>

            <button
              onClick={handlePhoneSubmit}
              disabled={phoneRaw.length < 10}
              className={`w-full font-bold py-3.5 rounded-2xl transition-all text-base ${
                phoneRaw.length >= 10
                  ? "gradient-bg text-white hover:scale-[1.02] shadow-lg shadow-violet-500/30"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              Далее
            </button>
          </div>
        )}

        {/* Step 3: Code verification */}
        {step === "code" && (
          <div className="flex flex-col items-center animate-fade-in-up">
            <button
              onClick={() => goToStep("phone")}
              className="self-start w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all mb-4"
            >
              <Icon name="ArrowLeft" size={18} />
            </button>

            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-5 shadow-lg shadow-violet-500/30">
              <Icon name="MessageSquare" size={28} className="text-white" />
            </div>

            <h2 className="text-xl font-black text-white mb-1">Код из SMS</h2>
            <p className="text-white/40 text-sm text-center mb-1">
              Отправлен на номер
            </p>
            <p className="text-white/70 text-sm font-semibold mb-6">
              {formatPhone(phoneRaw)}
            </p>

            <div className="flex gap-3 mb-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { codeRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className={`w-14 h-16 bg-white/5 border rounded-2xl text-center text-2xl font-black text-white outline-none transition-all ${
                    digit
                      ? "border-violet-500/50 shadow-lg shadow-violet-500/20"
                      : "border-white/10 focus:border-violet-500/50"
                  }`}
                />
              ))}
            </div>

            {error && step === "code" && (
              <p className="text-red-400 text-xs mt-1 mb-2">{error}</p>
            )}

            <div className="flex items-center gap-1 mb-6 mt-3">
              {countdown > 0 ? (
                <p className="text-white/30 text-sm">
                  Отправить повторно через{" "}
                  <span className="text-violet-400 font-semibold">{countdown}с</span>
                </p>
              ) : (
                <button
                  onClick={resendCode}
                  className="text-violet-400 text-sm font-semibold hover:text-violet-300 transition-colors"
                >
                  Отправить код повторно
                </button>
              )}
            </div>

            <button
              onClick={() => handleVerify()}
              disabled={code.join("").length < 4}
              className={`w-full font-bold py-3.5 rounded-2xl transition-all text-base ${
                code.join("").length === 4
                  ? "gradient-bg text-white hover:scale-[1.02] shadow-lg shadow-violet-500/30"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              Подтвердить
            </button>
          </div>
        )}
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-6 text-center z-10">
        <p className="text-white/15 text-xs">Pulse Messenger v1.0</p>
      </div>
    </div>
  );
}
