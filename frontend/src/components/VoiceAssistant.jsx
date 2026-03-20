import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const COMMANDS = [
  { keywords: ['find donor', 'find donors', 'donors', 'donor map'], path: '/map' },
  { keywords: ['blood request', 'request blood', 'need blood'], path: '/blood-request' },
  { keywords: ['hospitals', 'hospital', 'find hospital'], path: '/hospitals' },
  { keywords: ['map', 'location', 'nearby'], path: '/map' },
  { keywords: ['dashboard', 'my dashboard'], path: '/donor/dashboard' },
  { keywords: ['analytics', 'statistics', 'stats'], path: '/analytics' },
  { keywords: ['notifications', 'notification', 'alerts'], path: '/notifications' },
  { keywords: ['home', 'go home'], path: '/home' },
  { keywords: ['blood availability', 'available blood'], path: '/blood-availability' },
  { keywords: ['camps', 'donation camps', 'blood camps'], path: '/camps' },
  { keywords: ['about', 'about us'], path: '/about' },
  { keywords: ['contact', 'contact us'], path: '/contact' },
];

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setTranscript(text);
      setStatus('processing');
      handleCommand(text);
    };
    rec.onerror = () => {
      setIsListening(false);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    };
    rec.onend = () => {
      setIsListening(false);
      if (status !== 'processing') setStatus('idle');
    };

    setRecognition(rec);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCommand = useCallback(
    (text) => {
      for (const cmd of COMMANDS) {
        if (cmd.keywords.some((kw) => text.includes(kw))) {
          navigate(cmd.path);
          setStatus('idle');
          setTranscript('');
          return;
        }
      }
      setStatus('unknown');
      setTimeout(() => {
        setStatus('idle');
        setTranscript('');
      }, 2500);
    },
    [navigate]
  );

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setStatus('idle');
    } else {
      setTranscript('');
      setStatus('listening');
      setIsListening(true);
      try {
        recognition.start();
      } catch {
        setIsListening(false);
        setStatus('idle');
      }
    }
  };

  if (!supported) return null;

  const pulse = isListening
    ? {
        animation: 'voicePulse 1s ease-in-out infinite',
        boxShadow: '0 0 0 0 rgba(220,53,69,0.7)',
      }
    : {};

  const statusText = {
    idle: '',
    listening: 'Listening...',
    processing: `"${transcript}"`,
    unknown: 'Command not recognized',
    error: 'Error occurred',
  };

  return (
    <>
      <style>{`
        @keyframes voicePulse {
          0% { box-shadow: 0 0 0 0 rgba(220,53,69,0.7); }
          70% { box-shadow: 0 0 0 12px rgba(220,53,69,0); }
          100% { box-shadow: 0 0 0 0 rgba(220,53,69,0); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
        }}
      >
        {statusText[status] && (
          <div
            style={{
              background: 'rgba(0,0,0,0.75)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              maxWidth: '200px',
              textAlign: 'center',
            }}
          >
            {statusText[status]}
          </div>
        )}
        <button
          onClick={toggleListening}
          title="Voice Assistant"
          aria-label={isListening ? 'Stop listening' : 'Start voice assistant'}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: isListening ? '#dc3545' : '#fff',
            color: isListening ? '#fff' : '#dc3545',
            border: '2px solid #dc3545',
            cursor: 'pointer',
            fontSize: '1.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, color 0.2s',
            ...pulse,
          }}
        >
          {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
      </div>
    </>
  );
};

export default VoiceAssistant;
