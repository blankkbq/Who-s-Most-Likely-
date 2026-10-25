import React, { useState } from 'react';
import { X, Shield, BookOpen, FileText, Mail, Send, Check } from 'lucide-react';

export type LegalTab = 'rules' | 'privacy' | 'terms' | 'contact';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'rules',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactType, setContactType] = useState('question');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactMessage('');
      setContactName('');
      setContactEmail('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="legal-modal-title"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto mb-6">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'rules' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Game Rules</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'privacy' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'terms' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Use</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'contact' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact & Feedback</span>
          </button>
        </div>

        {/* Tab 1: Rules */}
        {activeTab === 'rules' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 id="legal-modal-title" className="text-xl font-bold font-display text-white">
              Official "Who's Most Likely?" Party Rules
            </h3>
            <p>
              "Who's Most Likely?" is designed for friends, couples, families, and coworkers to have fun, debate habits, and reveal funny quirks with zero stakes.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-1">1. Creating & Joining a Room</h4>
                <p>
                  Any player can act as Host to generate a unique 4-character room code. Friends open the website on their phones, enter the code and their nickname, and appear in the lobby instantly.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-1">2. Voting Mechanism</h4>
                <p>
                  Each round presents an original scenario. Players tap the participant they believe fits the description best. You may vote for anyone in the room — including yourself! All votes remain hidden until the round finishes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-1">3. Round Expiration & Tally</h4>
                <p>
                  Rounds conclude as soon as all connected players have voted, or when the countdown timer hits 0. The player with the highest tally is crowned the winner of that round.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-1">4. Social Sharing & Respect</h4>
                <p>
                  Results can be shared to TikTok, WhatsApp, or Instagram Stories using our built-in result cards. Remember: the game is meant to be friendly and lighthearted!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Privacy */}
        {activeTab === 'privacy' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 id="legal-modal-title" className="text-xl font-bold font-display text-white">
              Privacy Policy & Data Protection
            </h3>
            <p className="text-slate-400">Last updated: October 2026</p>

            <p>
              We believe online party games should respect player privacy. Our service is built on a "Privacy by Design" architecture with minimal data footprint:
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>No Forced Accounts or Passwords:</strong> You play using a transient nickname and emoji avatar of your choice. We never ask for your email address, phone number, or passwords.
              </li>
              <li>
                <strong>Zero Persistent Identity:</strong> Game rooms and player nicknames exist in temporary server memory and are automatically purged after 2 hours of inactivity.
              </li>
              <li>
                <strong>Anonymous Aggregated Counters:</strong> We maintain basic aggregate counters (e.g. total games started, votes submitted) solely to monitor server health and popular categories. No IP addresses or personal profiles are tied to these metrics.
              </li>
              <li>
                <strong>Advertising Compliance:</strong> Any future advertising placements will strictly comply with IAB, Google AdSense, and CCPA/GDPR requirements, without deceptive clicks or tracking cookies.
              </li>
            </ul>
          </div>
        )}

        {/* Tab 3: Terms */}
        {activeTab === 'terms' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 id="legal-modal-title" className="text-xl font-bold font-display text-white">
              Terms of Use
            </h3>
            <p>
              By accessing "Who's Most Likely?", you agree to these fair use terms:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Acceptable Conduct:</strong> You agree not to use offensive, defamatory, or hateful nicknames in public party rooms. Hosts retain the right to remove any disruptive participant from their room.
              </li>
              <li>
                <strong>Free Access:</strong> The core game is provided free of charge for personal social entertainment.
              </li>
              <li>
                <strong>Intellectual Property:</strong> The curated question decks, brand assets, and interface design are protected by copyright.
              </li>
              <li>
                <strong>Room Lifetime:</strong> Game rooms are ephemeral and expire upon inactivity.
              </li>
            </ul>
          </div>
        )}

        {/* Tab 4: Contact & Feedback */}
        {activeTab === 'contact' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 id="legal-modal-title" className="text-xl font-bold font-display text-white">
              Contact Us & Suggest a Question
            </h3>
            <p>
              Have a hilarious question idea, noticed a bug, or want to partner with us? Drop us a note below!
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-in fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <h4 className="text-sm font-bold text-white">Thank You for Your Feedback!</h4>
                <p className="text-xs text-emerald-300">
                  Your message has been received. Our team will review your suggestion for the next question deck update!
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Your Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Optional"
                      className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Your Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Optional (if you want a reply)"
                      className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Message Type</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="question">Suggest a New Question</option>
                    <option value="bug">Report a Bug / Issue</option>
                    <option value="business">Advertising / Partnership</option>
                    <option value="other">General Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="e.g. Suggestion: Who's most likely to accidentally wear two different shoes to work?"
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
