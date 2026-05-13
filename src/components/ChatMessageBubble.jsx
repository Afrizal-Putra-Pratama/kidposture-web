// src/components/ChatMessageBubble.jsx
// Render bubble pesan: text, gambar, video, file attachment

import { useState } from 'react';
import { FileText, Download, X, Film, Image } from 'lucide-react';

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
        className={`chat-msg ${isMe ? 'chat-msg--me' : 'chat-msg--other'}`}
        style={{ opacity: msg._optimistic ? 0.6 : 1 }}
      >
        {!isMe && (
          <div className="chat-msg__avatar">{getInitials(otherName || '?')}</div>
        )}

        <div>
          {/* ── Gambar ── */}
          {type === 'image' && fileUrl && (
            <div>
              <img
                src={fileUrl}
                alt={fileName}
                className="chat-msg__image"
                onClick={() => setLightbox(fileUrl)}
                loading="lazy"
              />
              {text && text !== fileName && (
                <div className="chat-msg__bubble" style={{ marginTop: 4, borderTopLeftRadius: isMe ? undefined : 4, borderTopRightRadius: isMe ? 4 : undefined }}>
                  {text}
                </div>
              )}
            </div>
          )}

          {/* ── Video ── */}
          {type === 'video' && fileUrl && (
            <div>
              <video
                src={fileUrl}
                controls
                className="chat-msg__video"
                preload="metadata"
              />
              {text && text !== fileName && (
                <div className="chat-msg__bubble" style={{ marginTop: 4 }}>{text}</div>
              )}
            </div>
          )}

          {/* ── File ── */}
          {type === 'file' && fileUrl && (
            <a
              href={fileUrl}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="chat-msg__file"
            >
              <div className="chat-msg__file-icon">
                <FileText size={18} />
              </div>
              <div className="chat-msg__file-info">
                <p className="chat-msg__file-name">{fileName}</p>
                <p className="chat-msg__file-label">Ketuk untuk unduh</p>
              </div>
              <Download size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
            </a>
          )}

          {/* ── Text biasa ── */}
          {type === 'text' && (
            <div className="chat-msg__bubble">{text}</div>
          )}

          <div className="chat-msg__meta">
            <span>{formatTime(msg.created_at)}</span>
            {msg.read_at && isMe && (
              <span style={{ color: '#60a5fa', fontSize: '0.6rem' }}>✓✓</span>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="chat-lightbox" onClick={() => setLightbox(null)}>
          <button className="chat-lightbox__close" onClick={() => setLightbox(null)}>
            <X size={20} />
          </button>
          <img src={lightbox} alt="preview" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}