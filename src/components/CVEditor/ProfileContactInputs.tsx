import React from 'react';
import { UserProfile } from '../../types/cv';
import { Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react';

export interface ProfileContactInputsProps {
  profile: UserProfile;
  onUpdate: (updated: Partial<UserProfile>) => void;
}

export const ProfileContactInputs: React.FC<ProfileContactInputsProps> = ({ profile, onUpdate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
        <input
          type="text"
          placeholder="e.g. Jane Doe"
          value={profile.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="email"
            placeholder="e.g. jane.doe@example.com"
            value={profile.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
        <div className="relative">
          <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="e.g. +1 (555) 019-2834"
            value={profile.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="e.g. San Francisco, CA (or Remote)"
            value={profile.location}
            onChange={(e) => onUpdate({ location: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">GitHub Profile URL</label>
        <div className="relative">
          <Github className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="e.g. https://github.com/janedoe"
            value={profile.githubUrl}
            onChange={(e) => onUpdate({ githubUrl: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">LinkedIn Profile URL</label>
        <div className="relative">
          <Linkedin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="e.g. https://linkedin.com/in/janedoe"
            value={profile.linkedinUrl}
            onChange={(e) => onUpdate({ linkedinUrl: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>
    </div>
  );
};
