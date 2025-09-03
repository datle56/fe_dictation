import React from "react"

interface DictationLessonSettingsProps {
    settings: any
    setSettings: (fn: (s: any) => any) => void
    showSettings: boolean
    setShowSettings: (fn: (v: boolean) => boolean) => void
    settingsRef: React.RefObject<HTMLDivElement>
}

const DictationLessonSettings: React.FC<DictationLessonSettingsProps> = ({
    settings,
    setSettings,
    showSettings,
    setShowSettings,
    settingsRef,
}) => {
    if (!showSettings) return null
    return (
        <div
            ref={settingsRef}
            className="absolute right-0 z-50 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-left space-y-3"
        >
            <div>
                <label className="block text-xs font-medium mb-1">
                    Replay Key
                </label>
                <select
                    className="w-full border rounded p-1"
                    value={settings.replayKey}
                    onChange={e =>
                        setSettings((s: any) => ({
                            ...s,
                            replayKey: e.target.value,
                        }))
                    }
                >
                    <option value="Ctrl">Ctrl</option>
                    <option value="Shift">Shift</option>
                    <option value="Alt">Alt</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium mb-1">
                    Play/Pause Key
                </label>
                <select
                    className="w-full border rounded p-1"
                    value={settings.playPauseKey}
                    onChange={e =>
                        setSettings((s: any) => ({
                            ...s,
                            playPauseKey: e.target.value,
                        }))
                    }
                >
                    <option value="`">` (backtick)</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium mb-1">
                    Auto Replay
                </label>
                <select
                    className="w-full border rounded p-1"
                    value={settings.autoReplay ? "Yes" : "No"}
                    onChange={e =>
                        setSettings((s: any) => ({
                            ...s,
                            autoReplay: e.target.value === "Yes",
                        }))
                    }
                >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium mb-1">
                    Seconds between replays
                </label>
                <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className="w-full border rounded p-1"
                    value={settings.secondsBetweenReplays}
                    onChange={e =>
                        setSettings((s: any) => ({
                            ...s,
                            secondsBetweenReplays: parseFloat(e.target.value),
                        }))
                    }
                />
            </div>
            <div>
                <label className="block text-xs font-medium mb-1">
                    Word suggestions (for smartphones)
                </label>
                <select
                    className="w-full border rounded p-1"
                    value={settings.wordSuggestions}
                    onChange={e =>
                        setSettings((s: any) => ({
                            ...s,
                            wordSuggestions: e.target.value,
                        }))
                    }
                >
                    <option value="Disabled">Disabled</option>
                    <option value="Enabled">Enabled</option>
                </select>
            </div>
            <div className="text-xs text-slate-500 mt-2">
                <b>Shortcut Key Tips:</b>
                <br />
                <ul className="list-disc ml-4">
                    <li>Replay: Hold {settings.replayKey}</li>
                    <li>Play/Pause: {settings.playPauseKey}</li>
                    <li>Auto Replay: {settings.autoReplay ? "On" : "Off"}</li>
                    <li>Enter: Submit answer</li>
                    <li>Space: Play/Pause audio/video</li>
                </ul>
            </div>
        </div>
    )
}

export default DictationLessonSettings
