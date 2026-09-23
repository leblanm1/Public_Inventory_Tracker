import React, { useState } from "react";
import { Plus, Trash2, FlaskConical } from "lucide-react";

interface SetupWizardModalProps {
  onComplete: (users: string[]) => void;
  submitting: boolean;
}

/**
 * Shown once, on first launch of a fresh install (no users configured yet).
 * Collects the names of the lab members who will use the tracker before
 * unlocking the rest of the app.
 */
export default function SetupWizardModal({ onComplete, submitting }: SetupWizardModalProps) {
  const [names, setNames] = useState<string[]>(["", ""]);
  const [error, setError] = useState("");

  const updateName = (index: number, value: string) => {
    setNames(prev => prev.map((n, i) => (i === index ? value : n)));
  };

  const addRow = () => setNames(prev => [...prev, ""]);

  const removeRow = (index: number) => {
    setNames(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const uniqueUsers = Array.from(new Set(names.map(n => n.trim()).filter(Boolean))) as string[];
    if (!uniqueUsers.length) {
      setError("Please enter at least one name.");
      return;
    }
    setError("");
    onComplete(uniqueUsers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2 p-5 border-b border-slate-100 bg-slate-50">
          <FlaskConical className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900">Welcome — Set Up Your Lab</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-slate-600">
            This is a brand-new inventory tracker with no samples loaded yet. Enter the names of
            everyone who will be using it — each action they take will be attributed to their name
            in the audit trail. You can add or edit users later from the toolbar.
          </p>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Lab Members *
            </label>
            {names.map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => updateName(index, e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-hidden"
                  autoFocus={index === 0}
                />
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={names.length === 1}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  aria-label="Remove user"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-4 w-4" /> Add another user
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Setting up..." : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  );
}
