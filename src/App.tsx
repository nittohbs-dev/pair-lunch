import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { MemberListPanel } from "./components/MemberListPanel";
import { ShufflePanel } from "./components/ShufflePanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { getMembers, saveMembers, getHistory, getSettings } from "./lib/storage";
import type { Member, PairHistory, AppSettings } from "./types";

type Tab = "members" | "shuffle" | "settings";

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "members", label: "メンバー" },
    { id: "shuffle", label: "シャッフル" },
    { id: "settings", label: "設定" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">金曜ペアランチ</h1>
          <nav className="flex gap-2">
            {tabs.map((t) => (
              <Button
                key={t.id}
                variant={tab === t.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
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
  );
}
