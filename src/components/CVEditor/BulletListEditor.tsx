import React from 'react';
import { WorkBullet, LanguageCode } from '../../types/cv';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export interface BulletListEditorProps {
  expId: string;
  bullets: WorkBullet[];
  activeLanguage: LanguageCode;
  onAddBullet: (expId: string) => void;
  onUpdateBullet: (expId: string, bulletId: string, updates: Partial<WorkBullet>) => void;
  onDeleteBullet: (expId: string, bulletId: string) => void;
}

export const BulletListEditor: React.FC<BulletListEditorProps> = ({
  expId,
  bullets,
  activeLanguage,
  onAddBullet,
  onUpdateBullet,
  onDeleteBullet
}) => {
  return (
    <div className="space-y-2 pt-2 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300">Key Achievements</span>
        <button
          type="button"
          onClick={() => onAddBullet(expId)}
          className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Add Bullet</span>
        </button>
      </div>

      <div className="space-y-2">
        {bullets.map((b) => {
          const currentText = b.text[activeLanguage] || b.text.en || '';
          return (
            <div key={b.id} className="bg-slate-900 border border-slate-800 p-2 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateBullet(expId, b.id, { enabled: !b.enabled })}
                  className={`mt-1 cursor-pointer ${b.enabled ? 'text-sky-400' : 'text-slate-600'}`}
                >
                  {b.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <textarea
                  rows={2}
                  placeholder="e.g. Architected and deployed microservices reducing API latency by 45%..."
                  value={currentText}
                  onChange={(e) => onUpdateBullet(expId, b.id, { text: { ...b.text, [activeLanguage]: e.target.value } })}
                  className={`flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none ${
                    !b.enabled ? 'line-through text-slate-500' : ''
                  }`}
                />

                <button
                  type="button"
                  onClick={() => onDeleteBullet(expId, b.id)}
                  className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
