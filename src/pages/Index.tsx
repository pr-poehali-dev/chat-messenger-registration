import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const CONTACTS = [
  {
    id: 1,
    name: "Алекс Громов",
    avatar: "АГ",
    color: "from-violet-500 to-purple-600",
    online: true,
    lastMsg: "Окей, жду твоих правок 🔥",
    time: "сейчас",
    unread: 3,
    typing: false,
  },
  {
    id: 2,
    name: "Команда дизайна",
    avatar: "КД",
    color: "from-pink-500 to-rose-600",
    online: true,
    lastMsg: "Миша: новый макет готов!",
    time: "2 мин",
    unread: 12,
    typing: true,
  },
  {
    id: 3,
    name: "Лена Смирнова",
    avatar: "ЛС",
    color: "from-orange-400 to-pink-500",
    online: false,
    lastMsg: "Спасибо за помощь, правда 💜",
    time: "14:30",
    unread: 0,
    typing: false,
  },
  {
    id: 4,
    name: "Dev Team",
    avatar: "DT",
    color: "from-cyan-500 to-blue-600",
    online: true,
    lastMsg: "Деплой прошёл успешно ✅",
    time: "13:15",
    unread: 1,
    typing: false,
  },
  {
    id: 5,
    name: "Макс Зайцев",
    avatar: "МЗ",
    color: "from-emerald-400 to-teal-600",
    online: false,
    lastMsg: "До встречи завтра!",
    time: "вчера",
    unread: 0,
    typing: false,
  },
  {
    id: 6,
    name: "Анна Петрова",
    avatar: "АП",
    color: "from-yellow-400 to-orange-500",
    online: true,
    lastMsg: "Отправляю презентацию",
    time: "вчера",
    unread: 0,
    typing: false,
  },
  {
    id: 7,
    name: "Вова Кириллов",
    avatar: "ВК",
    color: "from-indigo-400 to-violet-600",
    online: false,
    lastMsg: "Ок, принято 👍",
    time: "пн",
    unread: 0,
    typing: false,
  },
];

const MESSAGES: Record<number, { id: number; text: string; out: boolean; time: string; read: boolean }[]> = {
  1: [
    { id: 1, text: "Привет! Ты сделал дизайн?", out: false, time: "14:00", read: true },
    { id: 2, text: "Да, только что отправил на проверку", out: true, time: "14:02", read: true },
    { id: 3, text: "Отлично, посмотрю через 10 минут", out: false, time: "14:03", read: true },
    { id: 4, text: "Если что — напиши, внесу правки 🙌", out: true, time: "14:05", read: true },
    { id: 5, text: "Кстати, там новый экран онбординга — сделал с градиентом как ты просил", out: true, time: "14:06", read: true },
    { id: 6, text: "Звучит круто! Давай покажи превью", out: false, time: "14:08", read: true },
    { id: 7, text: "Окей, жду твоих правок 🔥", out: false, time: "14:10", read: false },
  ],
  2: [
    { id: 1, text: "Ребята, всем привет!", out: false, time: "13:00", read: true },
    { id: 2, text: "Когда синхрон?", out: true, time: "13:05", read: true },
    { id: 3, text: "Миша: новый макет готов!", out: false, time: "13:30", read: false },
  ],
  3: [
    { id: 1, text: "Лена, привет! Как дела?", out: true, time: "12:00", read: true },
    { id: 2, text: "Всё отлично! Ты мне очень помог с презентацией", out: false, time: "12:30", read: true },
    { id: 3, text: "Спасибо за помощь, правда 💜", out: false, time: "14:30", read: true },
  ],
};

const DEFAULT_MESSAGES = [
  { id: 1, text: "Привет! 👋", out: false, time: "12:00", read: true },
  { id: 2, text: "Привет!", out: true, time: "12:01", read: true },
];

type View = "chat" | "profile" | "settings" | "calls";

export default function Index() {
  const [activeChat, setActiveChat] = useState(1);
  const [messages, setMessages] = useState(MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [view, setView] = useState<View>("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiHint, setShowEmojiHint] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const contact = CONTACTS.find((c) => c.id === activeChat)!;
  const chatMessages = messages[activeChat] || DEFAULT_MESSAGES;

  const filteredContacts = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, messages]);

  function sendMessage() {
    const text = inputValue.trim();
    if (!text) return;
    const newMsg = {
      id: Date.now(),
      text,
      out: true,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || DEFAULT_MESSAGES), newMsg],
    }));
    setInputValue("");
    inputRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function selectChat(id: number) {
    setActiveChat(id);
    setView("chat");
  }

  const emojis = ["❤️", "🔥", "😂", "👍", "🎉", "💜", "✅", "😎", "🚀", "💡"];

  return (
    <div className="h-screen w-screen flex bg-background overflow-hidden font-golos">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-pink-600/8 blur-[140px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      {/* Sidebar Nav */}
      <aside className="w-16 flex flex-col items-center py-5 gap-3 z-10 relative glass border-r border-white/5">
        <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center mb-3 animate-pulse-glow cursor-pointer">
          <span className="text-white font-black text-sm">P</span>
        </div>

        {[
          { icon: "MessageCircle", label: "Чаты", v: "chat" as View },
          { icon: "Phone", label: "Звонки", v: "calls" as View },
          { icon: "User", label: "Профиль", v: "profile" as View },
          { icon: "Settings", label: "Настройки", v: "settings" as View },
        ].map((item) => (
          <button
            key={item.v}
            onClick={() => setView(item.v)}
            title={item.label}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 group relative
              ${view === item.v
                ? "gradient-bg text-white shadow-lg shadow-violet-500/30"
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
              }`}
          >
            <Icon name={item.icon} size={18} />
            <span className="absolute left-14 bg-card text-foreground text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-white/10">
              {item.label}
            </span>
          </button>
        ))}

        <div className="flex-1" />

        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-105 transition-transform">
          ЯП
        </div>
      </aside>

      {/* Chat list */}
      {(view === "chat" || view === "calls") && (
        <div className="w-72 flex flex-col border-r border-white/5 z-10 relative">
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold text-white">
                {view === "calls" ? "Звонки" : "Сообщения"}
              </h1>
              <button className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-violet-500/30">
                <Icon name={view === "calls" ? "PhoneCall" : "SquarePen"} size={14} className="text-white" />
              </button>
            </div>

            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full bg-white/5 border border-white/8 rounded-xl py-2 pl-8 pr-3 text-sm text-white/80 placeholder-white/25 outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
            {view === "calls" ? (
              CONTACTS.filter((c) => c.online).map((c, i) => (
                <div key={c.id} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-all animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/90 truncate">{c.name}</p>
                    <p className="text-xs text-white/40">Онлайн</p>
                  </div>
                  <button className="w-8 h-8 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center transition-colors">
                    <Icon name="Phone" size={14} className="text-emerald-400" />
                  </button>
                </div>
              ))
            ) : (
              filteredContacts.map((c, i) => (
                <div
                  key={c.id}
                  onClick={() => selectChat(c.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 animate-fade-in-up stagger-${Math.min(i + 1, 5)}
                    ${activeChat === c.id ? "chat-item-active" : "hover:bg-white/5"}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {c.avatar}
                    </div>
                    {c.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background online-dot" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/90 truncate">{c.name}</p>
                      <span className="text-[10px] text-white/30 flex-shrink-0 ml-1">{c.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      {c.typing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-violet-400">печатает</span>
                          <div className="flex gap-0.5">
                            {[0, 1, 2].map((j) => (
                              <span key={j} className="typing-dot w-1 h-1 rounded-full bg-violet-400 inline-block" style={{ animationDelay: `${j * 0.2}s` }} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-white/40 truncate">{c.lastMsg}</p>
                      )}
                      {c.unread > 0 && (
                        <span className="ml-1 min-w-[18px] h-[18px] gradient-bg rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 px-1">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main area */}
      <main className="flex-1 flex flex-col z-10 relative min-w-0">
        {view === "profile" ? (
          <ProfileView />
        ) : view === "settings" ? (
          <SettingsView />
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 glass flex-shrink-0">
              <div className="relative">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${contact.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {contact.avatar}
                </div>
                {contact.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background online-dot" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-white">{contact.name}</h2>
                <p className="text-xs text-white/40">
                  {contact.typing ? (
                    <span className="text-violet-400">печатает сообщение...</span>
                  ) : contact.online ? (
                    "в сети"
                  ) : (
                    "был(а) недавно"
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[
                  { icon: "Phone", label: "Позвонить" },
                  { icon: "Video", label: "Видеозвонок" },
                  { icon: "Search", label: "Поиск" },
                  { icon: "MoreHorizontal", label: "Меню" },
                ].map((btn) => (
                  <button
                    key={btn.icon}
                    title={btn.label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all"
                  >
                    <Icon name={btn.icon} size={17} />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-white/6" />
                <span className="text-[11px] text-white/25 glass px-3 py-1 rounded-full">Сегодня</span>
                <div className="flex-1 h-px bg-white/6" />
              </div>

              {chatMessages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex msg-appear ${msg.out ? "justify-end" : "justify-start"}`}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  {!msg.out && (
                    <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${contact.color} flex items-center justify-center text-white text-[10px] font-bold mr-2 flex-shrink-0 self-end mb-1`}>
                      {contact.avatar[0]}
                    </div>
                  )}
                  <div className={`max-w-[65%] ${msg.out ? "msg-bubble-out" : "msg-bubble-in"} px-4 py-2.5`}>
                    <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${msg.out ? "justify-end" : "justify-start"}`}>
                      <span className="text-[10px] text-white/40">{msg.time}</span>
                      {msg.out && (
                        <Icon
                          name={msg.read ? "CheckCheck" : "Check"}
                          size={12}
                          className={msg.read ? "text-violet-300" : "text-white/30"}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {contact.typing && (
                <div className="flex justify-start">
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${contact.color} flex items-center justify-center text-white text-[10px] font-bold mr-2 flex-shrink-0 self-end mb-1`}>
                    {contact.avatar[0]}
                  </div>
                  <div className="msg-bubble-in px-4 py-3 flex items-center gap-1">
                    {[0, 1, 2].map((j) => (
                      <span key={j} className="typing-dot w-1.5 h-1.5 rounded-full bg-white/50 inline-block" style={{ animationDelay: `${j * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-4 py-3 border-t border-white/5 glass flex-shrink-0">
              {showEmojiHint && (
                <div className="flex gap-2 mb-3 px-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => { setInputValue((v) => v + emoji); setShowEmojiHint(false); inputRef.current?.focus(); }}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmojiHint((v) => !v)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showEmojiHint ? "gradient-bg text-white" : "text-white/40 hover:text-white hover:bg-white/8"}`}
                >
                  <Icon name="Smile" size={18} />
                </button>
                <button className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all">
                  <Icon name="Paperclip" size={18} />
                </button>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Написать сообщение..."
                    className="w-full bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>

                <button
                  onClick={sendMessage}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200
                    ${inputValue.trim()
                      ? "gradient-bg text-white shadow-lg shadow-violet-500/40 hover:scale-105"
                      : "bg-white/5 text-white/20"
                    }`}
                >
                  <Icon name="Send" size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in-up overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white text-3xl font-black mb-4 animate-float shadow-2xl shadow-violet-500/30">
            ЯП
          </div>
          <h2 className="text-2xl font-black gradient-text">Яков Петров</h2>
          <p className="text-white/40 text-sm mt-1">@petrov_ya</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full online-dot" />
            <span className="text-xs text-emerald-400">В сети</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Чатов", value: "24" },
            { label: "Звонков", value: "8" },
            { label: "Групп", value: "5" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
              <p className="text-2xl font-black gradient-text">{stat.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-4 space-y-4">
          {[
            { icon: "Phone", label: "Телефон", value: "+7 (999) 123-45-67" },
            { icon: "Mail", label: "Email", value: "petrov@pulse.app" },
            { icon: "MapPin", label: "Город", value: "Москва" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={15} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] text-white/30">{item.label}</p>
                <p className="text-sm text-white/80">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-4 w-full gradient-bg text-white font-semibold py-3 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/30">
          Редактировать профиль
        </button>
      </div>
    </div>
  );
}

function SettingsView() {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [twoFa, setTwoFa] = useState(false);

  const sections = [
    {
      title: "Уведомления",
      items: [
        { label: "Push-уведомления", sub: "Получать уведомления о новых сообщениях", icon: "Bell", toggle: notifications, set: setNotifications },
        { label: "Звуки", sub: "Звуковые сигналы для сообщений", icon: "Volume2", toggle: sounds, set: setSounds },
      ],
    },
    {
      title: "Безопасность",
      items: [
        { label: "Двухфакторная аутентификация", sub: "Дополнительная защита аккаунта", icon: "Shield", toggle: twoFa, set: setTwoFa },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in-up">
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-black gradient-text mb-6">Настройки</h2>

        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3 px-1">{section.title}</p>
            <div className="glass rounded-2xl overflow-hidden">
              {section.items.map((item, i) => (
                <div key={item.label} className={`flex items-center gap-4 p-4 ${i !== 0 ? "border-t border-white/5" : ""}`}>
                  <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/90">{item.label}</p>
                    <p className="text-xs text-white/35 mt-0.5 truncate">{item.sub}</p>
                  </div>
                  <button
                    onClick={() => item.set(!item.toggle)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${item.toggle ? "gradient-bg" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${item.toggle ? "left-7" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mb-5">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3 px-1">Внешний вид</p>
          <div className="glass rounded-2xl p-4">
            <p className="text-sm font-semibold text-white/90 mb-3">Акцентный цвет</p>
            <div className="flex gap-3">
              {[
                "from-violet-500 to-purple-600",
                "from-pink-500 to-rose-600",
                "from-blue-500 to-cyan-600",
                "from-emerald-500 to-teal-600",
                "from-orange-500 to-amber-600",
              ].map((grad, i) => (
                <button
                  key={i}
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} ${i === 0 ? "ring-2 ring-white/50 ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"} transition-all`}
                />
              ))}
            </div>
          </div>
        </div>

        <button className="w-full flex items-center gap-3 glass rounded-2xl p-4 hover:bg-red-500/10 transition-colors group">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/30 transition-colors">
            <Icon name="LogOut" size={16} className="text-red-400" />
          </div>
          <p className="text-sm font-semibold text-red-400">Выйти из аккаунта</p>
        </button>
      </div>
    </div>
  );
}
