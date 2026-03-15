import { useState } from "react";
import { Button } from "./ui/button";
import { getSettings, saveSettings } from "../lib/storage";
import type { AppSettings } from "../types";

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings>(getSettings);

  function handleSave() {
    saveSettings(settings);
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
              setSettings({ ...settings, targetGroupSize: Number(e.target.value) })
            }
          />
          <p className="text-xs text-gray-400 mt-1">
            例: 4 → 13人なら 3:3:3:4 に自動配分
          </p>
        </div>
        <Button onClick={handleSave} className="w-full">
          保存
        </Button>
      </div>
    </div>
  );
}
