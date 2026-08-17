import React from 'react';
import { useCV } from '../context/CVContext';
import { FileCheck, ShieldCheck, Tag, Info, Sparkles } from 'lucide-react';

export const MetadataEditor: React.FC = () => {
  const { activePreset, updateMetadata } = useCV();
  const { metadata } = activePreset;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">PDF Document Metadata Injector</h2>
            <p className="text-xs text-slate-400">
              Customize Dublin Core (<span className="font-mono text-sky-400">dc:*</span>) and Content Properties (<span className="font-mono text-sky-400">cp:*</span>) metadata tags embedded in your exported PDF binary files.
            </p>
          </div>
        </div>

        <div className="bg-slate-850 p-4 rounded-xl border border-slate-750 text-xs text-slate-300 space-y-2 mb-6">
          <div className="flex items-center gap-2 font-semibold text-sky-400">
            <Info className="w-4 h-4" />
            <span>Why ATS & Recruiters Inspect PDF Metadata</span>
          </div>
          <p>
            Automated Tracking Systems (ATS) and professional PDF viewers read standard Dublin Core and Content Property tags to categorize document title, author, key tech keywords, and document description automatically.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>dc:title (Document Title)</span>
              <span className="font-mono text-[10px] text-sky-400">Dublin Core Title</span>
            </label>
            <input
              type="text"
              value={metadata.dc_title}
              onChange={(e) => updateMetadata({ dc_title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>dc:creator (Author / Creator Name)</span>
              <span className="font-mono text-[10px] text-sky-400">Dublin Core Creator</span>
            </label>
            <input
              type="text"
              value={metadata.dc_creator}
              onChange={(e) => updateMetadata({ dc_creator: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>cp:keywords (Key Skills & Search Terms)</span>
              <span className="font-mono text-[10px] text-sky-400">Content Properties Keywords</span>
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Node.js, Docker, AWS, DevOps"
              value={metadata.cp_keywords}
              onChange={(e) => updateMetadata({ cp_keywords: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>cp:description (Document Summary / Subject)</span>
              <span className="font-mono text-[10px] text-sky-400">Content Properties Description</span>
            </label>
            <textarea
              rows={2}
              value={metadata.cp_description}
              onChange={(e) => updateMetadata({ cp_description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-mono resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>cp:category (Document Category)</span>
              <span className="font-mono text-[10px] text-sky-400">Content Properties Category</span>
            </label>
            <input
              type="text"
              value={metadata.cp_category}
              onChange={(e) => updateMetadata({ cp_category: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Metadata will be automatically embedded into exported PDF binaries via pdf-lib</span>
          </span>
          <span className="font-mono text-[11px] text-slate-500">Preset: {activePreset.name}</span>
        </div>
      </div>
    </div>
  );
};
