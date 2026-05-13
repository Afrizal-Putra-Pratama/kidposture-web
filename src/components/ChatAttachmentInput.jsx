// src/components/ChatAttachmentInput.jsx
// Input area chat dengan support upload file, gambar, video

import { useRef, useState } from 'react';
import { Send, Paperclip, X, Loader, Image, Film, FileText } from 'lucide-react';
import { sendFile } from '../services/chatService';

function getFileIcon(file) {
  if (file.type.startsWith('image/')) return <Image size={14} />;
  if (file.type.startsWith('video/')) return <Film size={14} />;
  return <FileText size={14} />;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Props:
 * - conversationId: number
 * - onSendText: fn(text) — untuk pesan teks biasa
 * - onMessageSent: fn(msg) — dipanggil setelah file berhasil dikirim
 * - sending: boolean
 */
export default function ChatAttachmentInput({
  conversationId, onSendText, onMessageSent, sending,
}) {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran max 50MB
    if (file.size > 50 * 1024 * 1024) {
      alert('Ukuran file maksimal 50MB');
      return;
    }
    setSelectedFile(file);
    e.target.value = '';
  };

  const handleSend = async () => {
    if (uploading || sending) return;

    if (selectedFile) {
      await handleSendFile();
    } else {
      const text = inputText.trim();
      if (!text) return;
      setInputText('');
      onSendText(text);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !conversationId) return;
    setUploading(true);
    try {
      const res = await sendFile(conversationId, selectedFile, inputText.trim() || undefined);
      const msg = res?.data ?? res;
      onMessageSent?.(msg);
      setSelectedFile(null);
      setInputText('');
    } catch (err) {
      console.error('sendFile error:', err);
      alert(err?.message || 'Gagal mengirim file. Coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const isImage = selectedFile?.type.startsWith('image/');
  const canSend = !uploading && !sending && (inputText.trim() || selectedFile);

  return (
    <>
      {/* File preview bar */}
      {selectedFile && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 16px', background: '#eff6ff',
          borderTop: '1px solid #dbeafe',
        }}>
          {isImage ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="preview"
              style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => setLightbox(URL.createObjectURL(selectedFile))}
            />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              background: '#dbeafe', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#2563eb',
            }}>
              {getFileIcon(selectedFile)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedFile.name}
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b' }}>
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="chat-upload-progress">
          <Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
          <span>Mengunggah file...</span>
          <div className="chat-upload-bar">
            <div className="chat-upload-bar__fill" />
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="chat-input-area">
        {/* Attach button */}
        <button
          className="chat-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Kirim file, gambar, atau video"
        >
          <Paperclip size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Text input */}
        <div className="chat-input-wrap">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={selectedFile ? 'Tambah caption (opsional)...' : 'Ketik pesan...'}
          />
        </div>

        {/* Send button */}
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!canSend}
        >
          {uploading || sending
            ? <Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
            : <Send size={16} />
          }
        </button>
      </div>

      {/* Lightbox preview */}
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