import { useState } from "react";
import { Save } from "lucide-react";
import { saveSettings } from "../lib/storage";
import type { AppSettings } from "../types";

interface Props {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await saveSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">グループ設定</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 block">グループ目標人数</label>
          <input
            type="number"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-400 transition-colors"
            value={settings.targetGroupSize}
            min={2}
            max={8}
            onChange={(e) =>
              onSettingsChange({ ...settings, targetGroupSize: Number(e.target.value) })
            }
          />
          <p className="text-xs text-slate-400">
            例: 4 → 13人なら 3:3:3:4 に自動配分
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-700 disabled:opacity-60 transition-colors"
        >
          <Save size={16} />
          {saving ? "保存中..." : saved ? "保存しました！" : "保存"}
        </button>
      </div>
    </div>
  );
}
