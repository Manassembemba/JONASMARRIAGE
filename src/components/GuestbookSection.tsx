import React, { useState } from 'react';
import { GuestbookMessage } from '../types';
import { Heart, Send, MessageSquareHeart, CheckCircle2 } from 'lucide-react';

interface GuestbookSectionProps {
  messages: GuestbookMessage[];
  onAddMessage: (msg: GuestbookMessage) => void;
}

export const GuestbookSection: React.FC<GuestbookSectionProps> = ({ messages, onAddMessage }) => {
  const [author, setAuthor] = useState('');
  const [relation, setRelation] = useState('');
  const [content, setContent] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    const newMessage: GuestbookMessage = {
      id: 'gb-' + Date.now(),
      name: author.trim(),
      relation: relation.trim() || 'Invité(e) d\'honneur',
      message: content.trim(),
      approved: true, // Auto-visible with moderation capability in Admin
      created_at: new Date().toISOString(),
    };

    onAddMessage(newMessage);
    setAuthor('');
    setRelation('');
    setContent('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 5000);
  };

  const visibleMessages = messages.filter((m) => m.approved);

  return (
    <section id="livredor" className="w-full py-20 bg-[#f5f3ef] relative border-t border-[#c5a059]/15">
      <div className="max-w-[780px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-full bg-[#c5a059]/20 text-[#775a19] mx-auto flex items-center justify-center mb-4 border border-[#c5a059]/40">
            <MessageSquareHeart className="w-7 h-7 text-[#775a19]" />
          </div>
          <span className="text-[11px] font-semibold tracking-[0.22em] leading-normal text-[#775a19] uppercase block mb-2">
            Mots Doux & Bénédictions
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#1b1c1a] font-normal leading-[1.22] sm:leading-[1.18] tracking-[0.015em]">
            Livre d'or
          </h2>
          <p className="text-xs sm:text-sm text-[#4e4639] max-w-lg mx-auto mt-2 leading-relaxed">
            Laissez un témoignage affectueux qui restera gravé dans la mémoire de notre foyer.
          </p>
        </div>

        {/* Formulaire de publication */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-[#c5a059]/25 mb-12">
          {isSuccess && (
            <div className="mb-5 p-4 rounded-xl bg-[#c5a059]/15 border border-[#775a19]/30 text-[#4e3700] text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#775a19] shrink-0" />
              <span>Votre mot a été publié avec succès. Jonas & Flora vous remercient du fond du cœur !</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="gb-author-input"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-1.5"
                >
                  Votre Nom *
                </label>
                <input
                  type="text"
                  id="gb-author-input"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Votre nom complet"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-[#fbf9f5] border border-[#d1c5b4]/60 text-sm focus:outline-none focus:bg-white focus:border-[#775a19]"
                />
              </div>

              <div>
                <label
                  htmlFor="gb-relation-input"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-1.5"
                >
                  Lien avec les mariés
                </label>
                <input
                  type="text"
                  id="gb-relation-input"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder="Ami(e), Famille, Collègue..."
                  className="w-full px-4 py-2.5 rounded-lg bg-[#fbf9f5] border border-[#d1c5b4]/60 text-sm focus:outline-none focus:bg-white focus:border-[#775a19]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="gb-content-input"
                className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#4e4639] mb-1.5"
              >
                Votre Message *
              </label>
              <textarea
                id="gb-content-input"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Partagez vos félicitations et vos vœux les plus sincères pour Jonas & Flora..."
                required
                className="w-full px-4 py-2.5 rounded-lg bg-[#fbf9f5] border border-[#d1c5b4]/60 text-sm focus:outline-none focus:bg-white focus:border-[#775a19]"
              ></textarea>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="publish-gb-btn"
                className="px-6 py-3 bg-[#775a19] text-white hover:bg-[#1b1c1a] rounded-lg text-xs font-bold uppercase tracking-[0.18em] transition-all shadow-sm flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publier mon mot d'amour</span>
              </button>
            </div>
          </form>
        </div>

        {/* Liste des messages */}
        <div className="space-y-4">
          {visibleMessages.length === 0 ? (
            <div className="text-center py-10 bg-white/60 rounded-xl border border-dashed border-[#c5a059]/30 text-xs text-[#605e5c]">
              Soyez le premier à laisser un message de bénédiction pour les mariés.
            </div>
          ) : (
            visibleMessages.map((entry) => {
              const initial = entry.name.charAt(0).toUpperCase();
              return (
                <div
                  key={entry.id}
                  className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-[#c5a059]/20 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#c5a059]/20 text-[#775a19] flex items-center justify-center font-bold font-editorial text-sm border border-[#c5a059]/40">
                        {initial}
                      </div>
                      <div>
                        <h4 className="font-editorial text-base text-[#1b1c1a] font-semibold leading-tight">
                          {entry.name}
                        </h4>
                        <span className="text-xs text-[#605e5c]">{entry.relation}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold tracking-wider text-[#775a19] uppercase bg-[#c5a059]/10 px-2.5 py-1 rounded-full border border-[#c5a059]/20">
                      Validé
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#4e4639] leading-relaxed italic pl-12 border-l-2 border-[#ffdea5]">
                    « {entry.message} »
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
