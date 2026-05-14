import { useState } from 'react';
import { FileText, Download, X } from 'lucide-react';

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function ChatMessageBubble({ msg, isMe, otherName }) {
  const [lightbox, setLightbox] = useState(null);

  const text = msg.body || msg.content || msg.message || '';
  const type = msg.type || 'text';
  const fileUrl = msg.file_url;
  const fileName = msg.file_name || 'File';

  return (
    <>
      <div 
        className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'} ${msg._optimistic ? 'opacity-60' : 'opacity-100'} transition-opacity duration-200`}
      >
        <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          
          {/* Avatar (Khusus untuk lawan bicara) */}
          {!isMe && (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 border border-blue-200 shadow-sm">
              {getInitials(otherName || '?')}
            </div>
          )}

          {/* Konten Pesan */}
          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
            
            {/* ── Gambar ── */}
            {type === 'image' && fileUrl && (
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1`}>
                <img
                  src={fileUrl}
                  alt={fileName}
                  onClick={() => setLightbox(fileUrl)}
                  loading="lazy"
                  className="max-w-full sm:max-w-[280px] rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity active:scale-[0.98] object-cover"
                />
                {text && text !== fileName && (
                  <div className={`mt-1 px-4 py-2.5 text-sm shadow-sm border ${isMe ? 'bg-blue-600 text-white border-blue-700 rounded-2xl rounded-tr-sm' : 'bg-white text-slate-800 border-slate-100 rounded-2xl rounded-tl-sm'}`}>
                    {text}
                  </div>
                )}
              </div>
            )}

            {/* ── Video ── */}
            {type === 'video' && fileUrl && (
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1`}>
                <video
                  src={fileUrl}
                  controls
                  preload="metadata"
                  className="max-w-full sm:max-w-[300px] rounded-xl border border-slate-200 shadow-sm bg-slate-900"
                />
                {text && text !== fileName && (
                  <div className={`mt-1 px-4 py-2.5 text-sm shadow-sm border ${isMe ? 'bg-blue-600 text-white border-blue-700 rounded-2xl rounded-tr-sm' : 'bg-white text-slate-800 border-slate-100 rounded-2xl rounded-tl-sm'}`}>
                    {text}
                  </div>
                )}
              </div>
            )}

            {/* ── File (PDF/Doc) ── */}
            {type === 'file' && fileUrl && (
              <a
                href={fileUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-3 mb-1 rounded-xl border transition-all active:scale-[0.98] shadow-sm w-full sm:w-max ${
                  isMe 
                    ? 'bg-blue-700/50 hover:bg-blue-700/70 border-blue-500 text-white' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isMe ? 'bg-blue-800/50 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  <FileText size={20} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <p className="text-sm font-bold truncate max-w-[150px]">{fileName}</p>
                  <p className={`text-[10px] ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>Ketuk untuk unduh</p>
                </div>
                <Download size={16} className={isMe ? 'text-blue-200' : 'text-slate-400'} />
              </a>
            )}

            {/* ── Teks Biasa ── */}
            {type === 'text' && text && (
              <div 
                className={`px-4 py-2.5 text-sm shadow-sm border mb-1 leading-relaxed ${
                  isMe 
                    ? 'bg-blue-600 text-white border-blue-700 rounded-2xl rounded-br-sm' 
                    : 'bg-white text-slate-800 border-slate-100 rounded-2xl rounded-bl-sm'
                }`}
              >
                {text}
              </div>
            )}

            {/* Waktu & Tanda Dibaca (Read Receipt) */}
            <div className={`flex items-center gap-1 text-[10px] font-medium ${isMe ? 'text-slate-400 justify-end' : 'text-slate-400 justify-start'} px-1`}>
              <span>{formatTime(msg.created_at)}</span>
              {isMe && (
                <span className={`ml-0.5 ${msg.read_at ? 'text-blue-500 font-bold' : 'text-slate-300'}`}>
                  {msg.read_at ? '✓✓' : '✓'}
                </span>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* === MODAL LIGHTBOX IMAGE (POP-UP) === */}
      {lightbox && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setLightbox(null)}
        >
          <button 
            className="absolute top-6 right-6 lg:top-10 lg:right-10 text-white hover:text-slate-300 transition-colors p-2 bg-slate-800/50 rounded-full active:scale-95" 
            onClick={() => setLightbox(null)}
          >
            <X size={28} />
          </button>
          <img 
            src={lightbox} 
            alt="Preview" 
            className="max-w-[95%] max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-800" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
}