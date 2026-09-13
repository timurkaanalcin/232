import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ModelPicker } from "./components/ModelPicker";
import { SettingsModal } from "./components/SettingsModal";
import { Sidebar } from "./components/Sidebar";
import { Toasts, type Toast } from "./components/Toasts";
import { fetchModels, streamChat } from "./lib/api";
import { CURATED_MODELS, formatContext, mergePool, PROVIDER_LABELS } from "./lib/catalog";
import { t, type Locale } from "./lib/i18n";
import { Markdown } from "./lib/Markdown";
import {
  DEFAULT_SETTINGS,
  loadActiveId,
  loadConversations,
  loadSettings,
  saveActiveId,
  saveConversations,
  saveSettings,
  titleFromPrompt,
  uid,
} from "./lib/storage";
import type { AppSettings, ChatMessage, Conversation, PoolModel } from "./lib/types";

const curatedFallback: PoolModel[] = mergePool([]);

export function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [models, setModels] = useState<PoolModel[]>(curatedFallback);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const persistReady = useRef(false);

  const locale: Locale = settings.locale;
  const active = conversations.find((c) => c.id === activeId) ?? null;
  const currentModel =
    models.find((m) => m.id === (active?.modelId ?? settings.defaultModelId)) ??
    models.find((m) => m.id === "claude-4.5-sonnet") ??
    models[0];

  const toast = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = uid();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  useEffect(() => {
    setSettings(loadSettings());
    const rows = loadConversations();
    setConversations(rows);
    setActiveId(loadActiveId() ?? rows[0]?.id ?? null);
  }, []);

  useEffect(() => {
    if (!persistReady.current) {
      persistReady.current = true;
      return;
    }
    saveConversations(conversations);
    saveSettings(settings);
    saveActiveId(activeId);
  }, [conversations, settings, activeId]);

  const loadPool = useCallback(
    async (refresh = false) => {
      setRefreshing(true);
      try {
        const res = await fetchModels(refresh);
        setModels(res.models.length ? res.models : curatedFallback);
        setModelsError(res.error ?? null);
        if (refresh) toast(locale === "tr" ? "Katalog yenilendi." : "Catalog refreshed.");
      } catch (error) {
        setModels(curatedFallback);
        setModelsError(error instanceof Error ? error.message : t(locale, "modelsError"));
        toast(t(locale, "modelsError"), "bad");
      } finally {
        setRefreshing(false);
      }
    },
    [locale, toast],
  );

  useEffect(() => {
    void loadPool(false);
  }, [loadPool]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages, busy]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        newChat();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPickerOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function newChat() {
    abortRef.current?.abort();
    setBusy(false);
    const conv: Conversation = {
      id: uid(),
      title: locale === "tr" ? "Yeni sohbet" : "New chat",
      modelId: settings.defaultModelId || currentModel?.id || CURATED_MODELS[0].id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setDraft("");
    setSidebarOpen(false);
  }

  function patchConv(id: string, updater: (c: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }

  async function send(text: string, retryFrom?: Conversation) {
    const content = text.trim();
    if (!content || busy) return;

    const now = Date.now();
    const userMsg: ChatMessage = { id: uid(), role: "user", content, createdAt: now };
    const source = retryFrom ?? active;
    const modelId = source?.modelId || settings.defaultModelId || currentModel?.id || CURATED_MODELS[0].id;
    const assistantMsg: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: "",
      createdAt: now,
      modelId,
    };
    const prior = source?.messages ?? [];
    const history = [...prior, userMsg];
    const nextMessages = [...history, assistantMsg];
    const convId = source?.id ?? uid();

    setConversations((prev) => {
      const exists = prev.some((c) => c.id === convId);
      if (!exists) {
        return [
          {
            id: convId,
            title: titleFromPrompt(content),
            modelId,
            createdAt: now,
            updatedAt: now,
            messages: nextMessages,
          },
          ...prev,
        ];
      }
      return prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              title: c.messages.length === 0 ? titleFromPrompt(content) : c.title,
              updatedAt: now,
              messages: nextMessages,
            }
          : c,
      );
    });
    setActiveId(convId);
    setDraft("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let acc = "";

    try {
      await streamChat(
        {
          modelId,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: settings.systemPrompt || undefined,
          temperature: settings.temperature,
        },
        {
          signal: controller.signal,
          onDelta: (chunk) => {
            acc += chunk;
            patchConv(convId, (c) => ({
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) => (m.id === assistantMsg.id ? { ...m, content: acc } : m)),
            }));
          },
          onError: (message, code) => {
            const label =
              code === "RATE_LIMIT"
                ? locale === "tr"
                  ? "Hız sınırı. Biraz bekleyin."
                  : "Rate limited. Wait a moment."
                : message;
            toast(label, "bad");
            patchConv(convId, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMsg.id ? { ...m, error: label, content: acc || label } : m,
              ),
            }));
          },
          onDone: () => undefined,
        },
      );
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        patchConv(convId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantMsg.id && !m.content
              ? { ...m, content: locale === "tr" ? "Durduruldu." : "Stopped.", error: "aborted" }
              : m,
          ),
        }));
      } else {
        toast(t(locale, "errorGeneric"), "bad");
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function retryLast() {
    if (!active) return;
    const lastUser = [...active.messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const trimmed: Conversation = {
      ...active,
      messages: active.messages.filter((m) => m.createdAt < lastUser.createdAt),
    };
    void send(lastUser.content, trimmed);
  }

  const suggestions = useMemo(
    () => [t(locale, "suggested1"), t(locale, "suggested2"), t(locale, "suggested3")],
    [locale],
  );

  return (
    <div className="app">
      <div
        className={`scrim ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar
        locale={locale}
        open={sidebarOpen}
        conversations={conversations}
        activeId={activeId}
        query={query}
        onQuery={setQuery}
        onNew={newChat}
        onSelect={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onDelete={(id) => {
          setConversations((prev) => prev.filter((c) => c.id !== id));
          if (activeId === id) setActiveId(null);
        }}
      />
      <main className="main">
        <header className="topbar">
          <button
            type="button"
            className="btn btn-icon menu-btn"
            aria-label={t(locale, "mobileMenu")}
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <button type="button" className="model-btn" onClick={() => setPickerOpen(true)}>
            <div className="mark" style={{ width: 28, height: 28 }} />
            <div style={{ minWidth: 0 }}>
              <strong>{currentModel?.displayName ?? t(locale, "pickModel")}</strong>
              <div className="chips" style={{ marginTop: 4 }}>
                {currentModel && (
                  <span className="chip">
                    {PROVIDER_LABELS[currentModel.provider][locale]}
                  </span>
                )}
                {currentModel && (
                  <span className="chip teal">
                    {formatContext(currentModel.defaultContext)}
                  </span>
                )}
                {currentModel && currentModel.maxContext && (
                  <span className="chip">{formatContext(currentModel.maxContext)}</span>
                )}
                {currentModel?.isNew && <span className="chip gold">{t(locale, "newBadge")}</span>}
                {currentModel && !currentModel.available && (
                  <span className="chip rose">{t(locale, "unavailable")}</span>
                )}
              </div>
            </div>
          </button>
          <div className="top-spacer" />
          <div className="locale-toggle" role="group" aria-label={t(locale, "language")}>
            <button
              type="button"
              className={locale === "tr" ? "on" : ""}
              onClick={() => setSettings((s) => ({ ...s, locale: "tr" }))}
            >
              TR
            </button>
            <button
              type="button"
              className={locale === "en" ? "on" : ""}
              onClick={() => setSettings((s) => ({ ...s, locale: "en" }))}
            >
              EN
            </button>
          </div>
          <button type="button" className="btn" onClick={() => setSettingsOpen(true)}>
            {t(locale, "settings")}
          </button>
        </header>

        {modelsError && <div className="banner">{t(locale, "modelsError")}</div>}

        <div className="thread" ref={threadRef}>
          {!active || active.messages.length === 0 ? (
            <div className="empty">
              <div className="rings" />
              <h2>{t(locale, "emptyTitle")}</h2>
              <p>{t(locale, "emptyBody")}</p>
              <div className="suggestions">
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => void send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            active.messages.map((msg) => (
              <article key={msg.id} className={`msg ${msg.role}`}>
                <div className="avatar">{msg.role === "user" ? "TK" : "Hv"}</div>
                <div className={`bubble ${msg.error ? "err" : ""}`}>
                  {msg.role === "assistant" && !msg.content && busy ? (
                    <div className="typing" aria-label={t(locale, "thinking")}>
                      <i /><i /><i />
                    </div>
                  ) : msg.role === "assistant" ? (
                    <div className="markdown">
                      <Markdown content={msg.content} />
                    </div>
                  ) : (
                    <div className="markdown">
                      <p>{msg.content}</p>
                    </div>
                  )}
                  {msg.role === "assistant" && msg.content && (
                    <div className="msg-actions">
                      <button
                        type="button"
                        className="linkish"
                        onClick={async () => {
                          await navigator.clipboard.writeText(msg.content);
                          setCopied(msg.id);
                          setTimeout(() => setCopied(null), 1200);
                        }}
                      >
                        {copied === msg.id ? t(locale, "copied") : t(locale, "copy")}
                      </button>
                      {msg.error && (
                        <button type="button" className="linkish" onClick={retryLast}>
                          {t(locale, "retry")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        <div className="dock">
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
          >
            <textarea
              value={draft}
              placeholder={t(locale, "composerPlaceholder")}
              rows={2}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(draft);
                }
              }}
            />
            {busy ? (
              <button
                type="button"
                className="send"
                onClick={() => abortRef.current?.abort()}
                aria-label={t(locale, "stop")}
              >
                ■
              </button>
            ) : (
              <button type="submit" className="send" aria-label={t(locale, "send")}>
                →
              </button>
            )}
          </form>
          <div className="hint">{t(locale, "gatewayHint")}</div>
        </div>
      </main>

      {pickerOpen && currentModel && (
        <ModelPicker
          locale={locale}
          models={models}
          selectedId={currentModel.id}
          refreshing={refreshing}
          onRefresh={() => void loadPool(true)}
          onClose={() => setPickerOpen(false)}
          onSelect={(id) => {
            if (active) patchConv(active.id, (c) => ({ ...c, modelId: id, updatedAt: Date.now() }));
            else setSettings((s) => ({ ...s, defaultModelId: id }));
            setPickerOpen(false);
          }}
        />
      )}
      {settingsOpen && (
        <SettingsModal
          locale={locale}
          settings={settings}
          models={models}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      <Toasts toasts={toasts} />
    </div>
  );
}
