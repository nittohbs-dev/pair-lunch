import { useState } from "react";
import { Button } from "./ui/button";
import { saveSettings } from "../lib/storage";
import type { AppSettings } from "../types";

interface Props {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: Props) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await saveSettings(settings);
    setSaving(false);
    alert("設定を保存しました");
  }

  return (
    <div className="space-y-4 max-w-sm">
      <h2 className="text-lg font-semibold">設定</h2>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium block mb-1">グループ目標人数</label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={settings.targetGroupSize}
            min={2}
            max={8}
            onChange={(e) =>
              onSettingsChange({ ...settings, targetGroupSize: Number(e.target.value) })
            }
          />
          <p className="text-xs text-gray-400 mt-1">
            例: 4 → 13人なら 3:3:3:4 に自動配分
          </p>
        </div>
        <Button onClick={handleSave} className="w-full" disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  );
}
