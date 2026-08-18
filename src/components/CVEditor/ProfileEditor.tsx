import React from 'react';
import { useCV } from '../../context/CVContext';
import { User, Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react';

export const ProfileEditor: React.FC = () => {
  const { cvData, updateProfile, activeLanguage } = useCV();
  const { profile } = cvData;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg mb-6">
      <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
        <User className="w-4 h-4 text-sky-400" />
        <span>Personal Details & Contact</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile({ email: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => updateProfile({ phone: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={profile.location}
              onChange={(e) => updateProfile({ location: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">GitHub Profile URL</label>
          <div className="relative">
            <Github className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={profile.githubUrl}
              onChange={(e) => updateProfile({ githubUrl: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">LinkedIn Profile URL</label>
          <div className="relative">
            <Linkedin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={profile.linkedinUrl}
              onChange={(e) => updateProfile({ linkedinUrl: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Dual Language Headline & Summary */}
      <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-400">Professional Headline</label>
            <span className="text-[10px] text-sky-400 font-mono">Editing: {activeLanguage.toUpperCase()}</span>
          </div>
          <input
            type="text"
            value={profile.headline[activeLanguage]}
            onChange={(e) => updateProfile({
              headline: { ...profile.headline, [activeLanguage]: e.target.value }
            })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-400">Executive Summary</label>
            <span className="text-[10px] text-sky-400 font-mono">Editing: {activeLanguage.toUpperCase()}</span>
          </div>
          <textarea
            rows={3}
            value={profile.summary[activeLanguage]}
            onChange={(e) => updateProfile({
              summary: { ...profile.summary, [activeLanguage]: e.target.value }
            })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 resize-none text-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
