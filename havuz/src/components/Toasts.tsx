export interface Toast {
  id: string;
  text: string;
  tone?: "ok" | "bad";
}

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.tone === "bad" ? "bad" : ""}`}>
          {toast.text}
        </div>
      ))}
    </div>
  );
}
