import { useRef, useState, useEffect } from 'react';
import { Send, Paperclip, X, Loader2, Image, Film, FileText } from 'lucide-react';
import { sendFile } from '../services/chatService';

function getFileIcon(file) {
  if (file.type.startsWith('image/')) return <Image size={18} strokeWidth={1.5} />;
  if (file.type.startsWith('video/')) return <Film size={18} strokeWidth={1.5} />;
  return <FileText size={18} strokeWidth={1.5} />;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatAttachmentInput({
  conversationId, onSendText, onMessageSent, sending,
}) {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Membersihkan URL Object agar tidak memory leak
  useEffect(() => {
    return () => {
      if (lightbox && lightbox.startsWith('blob:')) URL.revokeObjectURL(lightbox);
    };
  }, [lightbox]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto'; // Reset height
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; // Max height 120px
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
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleSend = async () => {
    if (uploading || sending) return;

    if (selectedFile) {
      await handleSendFile();
    } else {
      const text = inputText.trim();
      if (!text) return;
      setInputText('');
      
      // Reset ukuran textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

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
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
    <div className="flex flex-col bg-white w-full shadow-[0_-4px_20px_rgba(0,0,0,0.02)] relative z-20">
      
      {/* ── File Preview Bar ── */}
      {selectedFile && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/50 border-t border-blue-100/50 animate-in slide-in-from-bottom-2 duration-200">
          {isImage ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="preview"
              className="w-12 h-12 rounded-lg object-cover cursor-pointer border border-blue-200 shadow-sm hover:opacity-90 transition-opacity"
              onClick={() => setLightbox(URL.createObjectURL(selectedFile))}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shrink-0 shadow-sm">
              {getFileIcon(selectedFile)}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate mb-0.5">
              {selectedFile.name}
            </p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          
          <button
            onClick={() => setSelectedFile(null)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors active:scale-95"
            title="Batal lampirkan"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ── Upload Progress Bar ── */}
      {uploading && (
        <div className="flex flex-col px-4 py-2.5 bg-slate-50 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
            <Loader2 size={14} className="animate-spin" /> Mengunggah file...
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full w-full animate-pulse origin-left" style={{ animationDuration: '1s' }} />
          </div>
        </div>
      )}

      {/* ── Input Area ── */}
      <div className="flex items-end gap-2 p-3 sm:p-4 bg-white border-t border-slate-100">
        
        {/* Attach Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Kirim file, gambar, atau video"
          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Paperclip size={20} strokeWidth={2} />
        </button>
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Text Area */}
        <div className="flex-1 min-w-0 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={selectedFile ? 'Tambah keterangan (opsional)...' : 'Ketik pesan di sini...'}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none text-slate-800 placeholder:text-slate-400"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          title="Kirim Pesan"
          className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl shrink-0 transition-all active:scale-95 shadow-sm ${
            canSend 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {uploading || sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} strokeWidth={2} className={`${canSend ? 'translate-x-0.5' : ''}`} />
          )}
        </button>
      </div>

      {/* ── Lightbox Image Preview ── */}
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
            alt="Preview Modal" 
            className="max-w-[95%] max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-800" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}