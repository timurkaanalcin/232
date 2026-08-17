import { useEffect, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import {
  listNotifications,
  markAllRead,
  markRead,
  unreadCount,
  type AppNotification,
} from "@/lib/notifications";

interface Props {
  customerId: string;
  tone?: "light" | "dark";
}

export default function NotificationBell({ customerId, tone = "light" }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [count, setCount] = useState(0);

  const refresh = () => {
    setItems(listNotifications(customerId));
    setCount(unreadCount(customerId));
  };

  useEffect(() => {
    refresh();
    const onNotify = () => refresh();
    window.addEventListener("ubs-notify", onNotify);
    return () => window.removeEventListener("ubs-notify", onNotify);
  }, [customerId]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          refresh();
        }}
        className={`relative rounded-full p-2 ${
          tone === "dark" ? "text-[#ffb2c7]/80 hover:bg-white/10" : "text-black/55 hover:bg-black/5"
        }`}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E60000] px-1 text-[9px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-[calc(100%+6px)] z-[80] w-[300px] overflow-hidden rounded-2xl border border-black/10 bg-white text-black shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/8 px-3 py-2.5">
            <span className="text-[13px] font-bold">Bildirimler</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Mark all read"
                onClick={() => {
                  markAllRead(customerId);
                  refresh();
                }}
                className="rounded-full p-1.5 hover:bg-black/5"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-black/5">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-8 text-center text-[12px] text-black/45">Bildirim yok</li>
            )}
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    markRead(n.id);
                    refresh();
                  }}
                  className={`w-full border-b border-black/5 px-3 py-3 text-left ${n.read ? "opacity-60" : "bg-[#E60000]/4"}`}
                >
                  <div className="text-[13px] font-semibold">{n.title}</div>
                  <div className="mt-0.5 text-[11px] text-black/55">{n.body}</div>
                  <div className="mt-1 text-[10px] text-black/35">{new Date(n.createdAt).toLocaleString()}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
