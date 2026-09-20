import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Columns2, Menu, RefreshCw, Sparkles, Square, X } from "lucide-react";
import { fetchCatalog, streamChat } from "@/lib/api";
import { formatContext } from "@/lib/catalog";
import { t, type Locale } from "@/lib/i18n";
import { isPoolId, POOL_ID, poolModel } from "@/lib/pick";
import { loadChats, loadLastModel, loadLocale, loadSystem, saveChats, saveLastModel, saveLocale, saveSystem, uid } from "@/lib/storage";
import type { CatalogResponse, ChatMessage, Conversation, PoolModel } from "@/lib/types";
import { Markdown } from "./components/Markdown";

export function App() {
  const [locale, setLocale] = useState<Locale>(loadLocale);
  const [view, setView] = useState<"landing" | "app">("landing");
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [query, setQuery] = useState("");
  const [system, setSystem] = useState(loadSystem);
  const [chats, setChats] = useState<Conversation[]>(loadChats);
  const [activeId, setActiveId] = useState<string | null>(chats[0]?.id ?? null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [compareOn, setCompareOn] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const pool = poolModel(locale);
  const models = catalog?.models ?? [];
  const featured = [pool, ...(catalog?.featured ?? [])];
  const active = chats.find((chat) => chat.id === activeId) ?? null;
  const selectedId = active?.modelId ?? loadLastModel() ?? POOL_ID;
  const selected = isPoolId(selectedId)
    ? pool
    : models.find((model) => model.id === selectedId) ?? pool;
  const compareModel =
    models.find((model) => model.id === active?.compareIds[0]) ??
    featured.find((model) => model.id !== selected?.id && model.live) ??
    models.find((model) => model.id !== selected?.id && model.live);

  useEffect(() => {
    fetchCatalog()
      .then(setCatalog)
      .catch(() => setError(t(locale, "error")));
  }, [locale]);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  const landingModels = useMemo(() => {
    const highlight = new Set([
      "claude-sonnet-5",
      "claude-opus-5",
      "claude-fable-5.1",
      "gpt-5.6-sol",
      "gpt-5.6-terra",
      "gemini-3.8-flash",
      "gemini-3.1-pro",
      "grok-4.6",
      "kimi-k3",
      "glm-5.2",
      "composer-2.5",
      "muse-spark-1.3",
    ]);
    const seenVendor = new Set<string>();
    const picks: PoolModel[] = [];
    for (const model of featured) {
      if (picks.length >= 18) break;
      if (!seenVendor.has(model.vendor) || highlight.has(model.key)) {
        seenVendor.add(model.vendor);
        picks.push(model);
      }
    }
    return picks;
  }, [featured]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = query ? models : featured;
    if (!q) return pool;
    return models.filter((model) =>
      `${model.name} ${model.vendorLabel} ${model.apiModel}`.toLowerCase().includes(q),
    );
  }, [featured, models, query]);

  function upsertChat(next: Conversation) {
    setChats((current) => [next, ...current.filter((chat) => chat.id !== next.id)]);
    setActiveId(next.id);
  }

  function ensureChat(model = selected): Conversation {
    if (active) return active;
    const created: Conversation = {
      id: uid("chat"),
      title: t(locale, "newChat"),
      modelId: model?.id ?? "",
      compareIds: compareModel ? [compareModel.id] : [],
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    upsertChat(created);
    return created;
  }

  function selectModel(model: PoolModel, asCompare = false) {
    saveLastModel(model.id);
    const chat = ensureChat(model);
    upsertChat({
      ...chat,
      modelId: asCompare ? chat.modelId : model.id,
      compareIds: asCompare ? [model.id] : chat.compareIds.filter((id) => id !== model.id),
      updatedAt: Date.now(),
    });
    setMenuOpen(false);
    setView("app");
  }

  async function send(text = draft, regenerate = false) {
    if (!selected || busy) return;
    const content = text.trim();
    if (!content) return;
    setDraft("");
    setError(null);
    const chat = ensureChat(selected);
    const userMessage: ChatMessage = {
      id: uid("m"),
      role: "user",
      content,
      createdAt: Date.now(),
    };
    const history = regenerate
      ? chat.messages.filter((message) => message.role === "user" || !message.pending)
      : [...chat.messages, userMessage];
    const targets = compareOn && compareModel ? [selected, compareModel] : [selected];
    const pending = targets.map((model) => ({
      id: uid("a"),
      role: "assistant" as const,
      content: "",
      modelId: model.id,
      createdAt: Date.now(),
      pending: true,
    }));
    const nextChat: Conversation = {
      ...chat,
      title: chat.messages.length === 0 ? content.slice(0, 42) : chat.title,
      messages: [...history, ...pending],
      updatedAt: Date.now(),
    };
    upsertChat(nextChat);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    await Promise.all(
      targets.map(async (model, index) => {
        const assistantId = pending[index].id;
        try {
          await streamChat({
            modelId: model.id,
            system,
            signal: controller.signal,
            messages: history.map((message) => ({ role: message.role, content: message.content })),
            onPicked: (picked) => {
              setChats((current) =>
                current.map((item) =>
                  item.id === nextChat.id
                    ? {
                        ...item,
                        messages: item.messages.map((message) =>
                          message.id === assistantId
                            ? {
                                ...message,
                                modelId: picked.id,
                                modelName: picked.name,
                                pickReason: picked.reason[locale],
                              }
                            : message,
                        ),
                      }
                    : item,
                ),
              );
            },
            onDelta: (delta) => {
              setChats((current) =>
                current.map((item) =>
                  item.id === nextChat.id
                    ? {
                        ...item,
                        messages: item.messages.map((message) =>
                          message.id === assistantId
                            ? { ...message, content: message.content + delta }
                            : message,
                        ),
                      }
                    : item,
                ),
              );
            },
            onImage: (image) => {
              setChats((current) =>
                current.map((item) =>
                  item.id === nextChat.id
                    ? {
                        ...item,
                        messages: item.messages.map((message) =>
                          message.id === assistantId
                            ? {
                                ...message,
                                images: [
                                  ...(message.images ?? []),
                                  { mimeType: image.mimeType, dataUrl: `data:${image.mimeType};base64,${image.data}` },
                                ],
                              }
                            : message,
                        ),
                      }
                    : item,
                ),
              );
            },
          });
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          setChats((current) =>
            current.map((item) =>
              item.id === nextChat.id
                ? {
                    ...item,
                    messages: item.messages.map((message) =>
                      message.id === assistantId
                        ? { ...message, error: err instanceof Error ? err.message : t(locale, "error") }
                        : message,
                    ),
                  }
                : item,
            ),
          );
        } finally {
          setChats((current) =>
            current.map((item) =>
              item.id === nextChat.id
                ? {
                    ...item,
                    messages: item.messages.map((message) =>
                      message.id === assistantId ? { ...message, pending: false } : message,
                    ),
                  }
                : item,
            ),
          );
        }
      }),
    );
    setBusy(false);
  }

  function stop() {
    abortRef.current?.abort();
    setBusy(false);
  }

  if (view === "landing") {
    return (
      <div className="app landing">
        <div className="landing-card">
          <div className="kicker">NEXUS POOL</div>
          <h1 className="serif">{t(locale, "tagline")}</h1>
          <p style={{ color: "var(--muted)", maxWidth: 640, fontSize: 18 }}>{t(locale, "subtitle")}</p>
          <div className="constellation">
            {landingModels.map((model) => (
              <button key={model.id} className="chip" onClick={() => selectModel(model)}>
                {model.name}
              </button>
            ))}
          </div>
          <div className="toolbar">
            <button
              className="btn primary"
              onClick={() => {
                saveLastModel(POOL_ID);
                setActiveId(null);
                setView("app");
              }}
            >
              {t(locale, "askPool")}
            </button>
            <button className="btn" onClick={() => setView("app")}>
              {t(locale, "browse")}
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                const next = locale === "tr" ? "en" : "tr";
                setLocale(next);
                saveLocale(next);
              }}
            >
              {locale === "tr" ? "EN" : "TR"}
            </button>
          </div>
          <p className="hint" style={{ padding: "22px 0 0" }}>
            {catalog
              ? `${catalog.liveCount} ${t(locale, "models")} · ${catalog.providers.length} ${t(locale, "providers")} · ${catalog.newCount} ${t(locale, "newest")}`
              : "…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="shell">
        <aside className={`panel left ${menuOpen ? "open" : ""}`}>
          <div className="brand">
            <div className="mark">
              <Sparkles size={16} color="#7dd3fc" />
            </div>
            <div>
              <h1>NEXUS</h1>
              <p>{t(locale, "tagline")}</p>
            </div>
            <button className="btn tiny ghost close-nav" style={{ marginLeft: "auto" }} onClick={() => setMenuOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="side-actions">
            <button
              className="btn primary"
              style={{ flex: 1 }}
              onClick={() => {
                saveLastModel(POOL_ID);
                setActiveId(null);
                setDraft("");
              }}
            >
              {t(locale, "newChat")}
            </button>
          </div>
          <input
            className="search"
            value={query}
            placeholder={t(locale, "searchModels")}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="list">
            <div className="section-label">{t(locale, "conversations")}</div>
            {chats.length === 0 && <div className="hint">{t(locale, "noChats")}</div>}
            {chats.map((chat) => (
              <button
                key={chat.id}
                className={`chat-item ${chat.id === activeId ? "active" : ""}`}
                onClick={() => {
                  setActiveId(chat.id);
                  setMenuOpen(false);
                }}
              >
                {chat.title}
              </button>
            ))}
            <div className="section-label">{query ? t(locale, "allModels") : t(locale, "featured")}</div>
            {filtered.map((model) => (
              <button
                key={model.id}
                className={`model-item ${selected?.id === model.id ? "active" : ""}`}
                onClick={() => selectModel(model)}
              >
                <div>
                  <div className="name">{model.name}</div>
                  <div className="sub">{model.vendorLabel}</div>
                </div>
                <div className="chips">
                  {model.isNew && <span className="chip new">{t(locale, "newest")}</span>}
                  <span className={`chip ${model.live ? "live" : "wait"}`}>
                    {model.live ? t(locale, "live") : t(locale, "waiting")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div>
              <div className="toolbar">
                <button className="btn tiny ghost open-nav" onClick={() => setMenuOpen(true)}>
                  <Menu size={16} />
                </button>
                <h2 className="hero-title serif" style={{ fontSize: 22, margin: 0 }}>
                  {selected?.name ?? t(locale, "pool")}
                </h2>
              </div>
              <div className="chips" style={{ marginTop: 8 }}>
                {selected && <span className="chip">{selected.vendorLabel}</span>}
                {selected?.standardContext && (
                  <span className="chip">
                    {t(locale, "context")} {formatContext(selected.standardContext)}
                  </span>
                )}
                {selected?.maxContext && <span className="chip">{formatContext(selected.maxContext)}</span>}
                {selected?.fast && <span className="chip">{t(locale, "fast")}</span>}
                {selected?.isCode && <span className="chip">{t(locale, "code")}</span>}
                {selected?.isImage && <span className="chip">{t(locale, "image")}</span>}
              </div>
            </div>
            <div className="toolbar">
              <button className={`btn tiny ${compareOn ? "primary" : ""}`} onClick={() => setCompareOn((value) => !value)}>
                <Columns2 size={14} /> {t(locale, "compare")}
              </button>
              <button
                className="btn tiny"
                onClick={() => fetchCatalog(true).then(setCatalog)}
                title={t(locale, "refresh")}
              >
                <RefreshCw size={14} />
              </button>
              <button
                className="btn tiny"
                onClick={() => {
                  const next = locale === "tr" ? "en" : "tr";
                  setLocale(next);
                  saveLocale(next);
                }}
              >
                {locale === "tr" ? "EN" : "TR"}
              </button>
            </div>
          </header>

          <section className="thread">
            {!active?.messages.length && (
              <div className="empty">
                <h2 className="serif">{t(locale, "emptyTitle")}</h2>
                <p>{t(locale, "emptyBody")}</p>
                {isPoolId(selected.id) && (
                  <button className="btn primary" onClick={() => void send(t(locale, "sampleQuestion"))}>
                    {t(locale, "sampleQuestion")}
                  </button>
                )}
              </div>
            )}
            {compareOn && active?.messages.length ? (
              <div className="compare-grid">
                {[selected, compareModel].filter(Boolean).map((model) => (
                  <div key={model!.id}>
                    <div className="who">{model!.name}</div>
                    {active.messages
                      .filter((message) => message.role === "user" || message.modelId === model!.id)
                      .map((message) => (
                        <MessageView key={message.id} message={message} locale={locale} />
                      ))}
                  </div>
                ))}
              </div>
            ) : (
              active?.messages.map((message) => <MessageView key={message.id} message={message} locale={locale} />)
            )}
            {error && <div className="hint">{error}</div>}
          </section>

          <footer className="composer">
            <div className="composer-box">
              <textarea
                value={draft}
                placeholder={t(locale, "placeholder")}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
              />
              <div className="composer-row">
                <span className="hint" style={{ padding: 0, flex: 1 }}>
                  {catalog?.gatewayReady ? t(locale, "gatewayOn") : t(locale, "gatewayOff")}
                </span>
                {busy ? (
                  <button className="btn" onClick={stop}>
                    <Square size={14} /> {t(locale, "stop")}
                  </button>
                ) : (
                  <button className="btn primary" onClick={() => void send()}>
                    <ArrowUp size={16} /> {t(locale, "send")}
                  </button>
                )}
              </div>
            </div>
          </footer>
        </main>

        <aside className="panel right">
          <div className="detail">
            <h3 className="serif">{selected?.name}</h3>
            <p>{selected?.description[locale]}</p>
            <div className="stats">
              <div className="stat">
                <b>{formatContext(selected?.standardContext ?? selected?.maxContext) ?? "—"}</b>
                <span>{t(locale, "context")}</span>
              </div>
              <div className="stat">
                <b>{catalog?.liveCount ?? "—"}</b>
                <span>{t(locale, "models")}</span>
              </div>
            </div>
            <label className="section-label" htmlFor="system">
              {t(locale, "systemPrompt")}
            </label>
            <textarea
              id="system"
              value={system}
              placeholder={t(locale, "systemPlaceholder")}
              onChange={(event) => {
                setSystem(event.target.value);
                saveSystem(event.target.value);
              }}
            />
            <p className="hint" style={{ padding: "12px 0 0" }}>
              {catalog?.gatewayReady ? t(locale, "gatewayOn") : t(locale, "gatewayHint")}
            </p>
            {compareOn && compareModel && (
              <button className="btn" style={{ width: "100%" }} onClick={() => setQuery(compareModel.vendorLabel)}>
                {t(locale, "compareHint")}: {compareModel.name}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function MessageView({ message, locale }: { message: ChatMessage; locale: Locale }) {
  return (
    <article className={`message ${message.role}`}>
      <div className="who">
        {message.role === "user"
          ? "You"
          : message.pending
            ? t(locale, "thinking")
            : message.modelName
              ? `${t(locale, "poolPicked")}: ${message.modelName}`
              : "Nexus"}
      </div>
      {message.pickReason && <p className="hint" style={{ padding: "0 0 8px" }}>{message.pickReason}</p>}
      <Markdown text={message.error ? `**${t(locale, "error")}:** ${message.error}` : message.content} />
      {message.images?.map((image) => (
        <img key={image.dataUrl.slice(0, 24)} className="gen" src={image.dataUrl} alt="" />
      ))}
    </article>
  );
}
