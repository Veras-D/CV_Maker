import React from 'react';
import { Lock, Sparkles, CheckCircle2, X } from 'lucide-react';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export const ProModal: React.FC<ProModalProps> = ({ isOpen, onClose, featureName = "Multi-Language Generation" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Unlock PRO Features</h3>
            <p className="text-xs text-amber-400 font-medium">{featureName} is a PRO feature</p>
          </div>
        </div>

        <div className="bg-slate-850 border border-slate-750 p-4 rounded-xl space-y-2 mb-5 text-xs text-slate-300">
          <p className="font-semibold text-white">PRO License includes:</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Unlimited Multi-Language Resumes (Czech, German, French, Spanish, etc.)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Advanced Local AI Model Fine-tuning</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Unlimited Kanban Job Application Tracking</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={() => {
              alert("Thank you for your interest! PRO Upgrade options will be available in the next release.");
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade to PRO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
