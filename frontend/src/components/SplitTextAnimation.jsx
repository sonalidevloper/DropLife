import React, { useEffect, useState } from 'react';
import './SplitTextAnimation.css';

const SplitTextAnimation = ({ text, className = '' }) => {
  const [animatedText, setAnimatedText] = useState([]);

  useEffect(() => {
    const chars = text.split('');
    setAnimatedText(chars);
  }, [text]);

  return (
    <div className={`split-text-container ${className}`}>
      {animatedText.map((char, index) => (
        <span
          key={index}
          className="split-char"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

export default SplitTextAnimation;