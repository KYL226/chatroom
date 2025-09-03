"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import type { Socket } from 'socket.io-client';

interface Attachment {
  _id: string;
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  type: string;
}

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  roomId?: string;
  conversationId?: string;
  socket?: Socket | null;
  isConnected?: boolean;
}

export default function MessageInput({
  onSendMessage,
  roomId,
  conversationId,
  socket,
  isConnected,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Gérer les clics en dehors du picker d'emojis
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autosize du textarea
  const adjustTextAreaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxPx = 120;
    el.style.height = Math.min(el.scrollHeight, maxPx) + 'px';
  };

  useEffect(() => {
    adjustTextAreaHeight();
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;

    try {
      if (isConnected && socket) {
        socket.emit('send_message', {
          content: message,
          roomId,
          conversationId,
          attachments,
        });
      } else {
        onSendMessage(message, attachments);
      }

      setMessage('');
      setAttachments([]);
      setShowEmojiPicker(false);

      if (socket && (roomId || conversationId)) {
        socket.emit('typing_stop', { roomId, conversationId });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (socket && (roomId || conversationId)) {
      socket.emit('typing_start', { roomId, conversationId });

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      const timeout = setTimeout(() => {
        socket.emit('typing_stop', { roomId, conversationId });
      }, 2000);

      setTypingTimeout(timeout);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadFile(file);
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const uploadFile = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'upload du fichier");
    }

    const result = await response.json();
    setAttachments((prev) => [...prev, result.file]);
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((att) => att._id !== attachmentId));
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="sticky bottom-0 z-10 p-4 bg-white border-t border-gray-200 max-h-[40vh] overflow-y-auto">
      {/* Affichage des pièces jointes */}
      {attachments.length > 0 && (
        <div className="pr-1 mb-3 space-y-2 overflow-y-auto max-h-32">
          {attachments.map((attachment) => (
            <div
              key={attachment._id}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="max-w-xs text-sm text-gray-700 truncate">
                  {attachment.originalName}
                </span>
                <span className="text-xs text-gray-500">
                  ({formatFileSize(attachment.size)})
                </span>
              </div>
              <button
                onClick={() => removeAttachment(attachment._id)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end space-x-2">
        {/* Bouton pièce jointe */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-gray-500 hover:text-blue-500 disabled:opacity-50"
          title="Joindre un fichier"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Bouton emoji */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-blue-500"
            title="Ajouter un emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute right-0 z-50 mb-2 bottom-full"
            >
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>

        {/* Zone de texte */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            className="w-full px-3 py-2 overflow-y-auto text-black border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Bouton d'envoi */}
        <button
          onClick={handleSendMessage}
          disabled={(!message.trim() && attachments.length === 0) || isUploading}
          className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Envoyer le message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Indicateur d'upload */}
      {isUploading && (
        <div className="mt-2 text-sm text-gray-500">Upload en cours...</div>
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
      />
    </div>
  );
}
