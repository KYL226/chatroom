import React from 'react';

interface EmojiDisplayProps {
  text: string;
  className?: string;
}

export default function EmojiDisplay({ text, className = '' }: EmojiDisplayProps) {
  // Fonction pour détecter et formater les emojis
  const formatTextWithEmojis = (text: string) => {
    // Regex pour détecter les emojis Unicode
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    
    if (!emojiRegex.test(text)) {
      return text;
    }

    return text.split('').map((char, index) => {
      if (emojiRegex.test(char)) {
        return (
          <span 
            key={index} 
            className="inline-block transition-transform transform hover:scale-110"
            style={{ fontSize: '1.2em' }}
          >
            {char}
          </span>
        );
      }
      return char;
    });
  };

  return (
    <span className={className}>
      {formatTextWithEmojis(text)}
    </span>
  );
}
