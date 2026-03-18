import { useState, useEffect } from "react";
import { Users, Shuffle, Settings, UtensilsCrossed } from "lucide-react";
import { MemberListPanel } from "./components/MemberListPanel";
import { ShufflePanel } from "./components/ShufflePanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { getMembers, saveMembers, getHistory, getSettings } from "./lib/storage";
import type { Member, PairHistory, AppSettings } from "./types";

type Tab = "members" | "shuffle" | "settings";

const NAV_ITEMS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: "members", icon: <Users size={20} />, label: "メンバー" },
  { id: "shuffle", icon: <Shuffle size={20} />, label: "シャッフル" },
  { id: "settings", icon: <Settings size={20} />, label: "設定" },
];

const PAGE_TITLES: Record<Tab, string> = {
  members: "メンバー管理",
  shuffle: "シャッフル",
  settings: "設定",
};

export default function App() {
  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [history, setHistory] = useState<PairHistory[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ targetGroupSize: 4 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMembers(), getHistory(), getSettings()])
      .then(([m, h, s]) => {
        setMembers(m);
        setHistory(h);
        setSettings(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleMembersChange(updated: Member[]) {
    setMembers(updated);
    await saveMembers(updated);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-16 bg-slate-900 flex flex-col items-center py-5 gap-2 flex-shrink-0">
        {/* Logo */}
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mb-4">
          <UtensilsCrossed size={18} className="text-slate-900" />
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            title={item.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              tab === item.id
                ? "bg-white text-slate-900"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            {item.icon}
          </button>
        ))}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">{PAGE_TITLES[tab]}</h1>
          <span className="text-sm text-slate-400">金曜ペアランチ</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          {tab === "members" && (
            <MemberListPanel members={members} onChange={handleMembersChange} />
          )}
          {tab === "shuffle" && (
            <ShufflePanel
              members={members}
              history={history}
              settings={settings}
              onHistoryAdd={(entry) => setHistory((prev) => [entry, ...prev].slice(0, 20))}
            />
          )}
          {tab === "settings" && (
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />
          )}
        </main>
      </div>
    </div>
  );
}
