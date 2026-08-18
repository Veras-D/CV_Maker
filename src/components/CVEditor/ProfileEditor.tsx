import React from 'react';
import { useCV } from '../../context/CVContext';
import { User } from 'lucide-react';
import { ProfileContactInputs } from './ProfileContactInputs';

export const ProfileEditor: React.FC = () => {
  const { cvData, updateProfile, activeLanguage } = useCV();
  const { profile } = cvData;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg mb-6">
      <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
        <User className="w-4 h-4 text-sky-400" />
        <span>Personal Details & Contact</span>
      </h3>

      <ProfileContactInputs profile={profile} onUpdate={updateProfile} />

      <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-400">Professional Headline</label>
            <span className="text-[10px] text-sky-400 font-mono">Editing: {activeLanguage.toUpperCase()}</span>
          </div>
          <input
            type="text"
            placeholder="e.g. Senior Full-Stack Engineer | React, TypeScript & Cloud Architecture"
            value={profile.headline[activeLanguage] || profile.headline.en || ''}
            onChange={(e) => updateProfile({
              headline: { ...profile.headline, [activeLanguage]: e.target.value }
            })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-400">Executive Summary</label>
            <span className="text-[10px] text-sky-400 font-mono">Editing: {activeLanguage.toUpperCase()}</span>
          </div>
          <textarea
            rows={3}
            placeholder="e.g. Versatile software engineer with 6+ years of experience designing, building, and scaling resilient web applications and distributed cloud systems..."
            value={profile.summary[activeLanguage] || profile.summary.en || ''}
            onChange={(e) => updateProfile({
              summary: { ...profile.summary, [activeLanguage]: e.target.value }
            })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none text-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
