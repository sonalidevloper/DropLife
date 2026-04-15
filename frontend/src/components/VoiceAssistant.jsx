import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, ListGroup, Badge } from 'react-bootstrap';
import { FaMicrophone, FaMicrophoneSlash, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VOICE_COMMANDS = [
  { phrases: ['go home', 'home page', 'homepage'],          path: '/home',               label: 'Home' },
  { phrases: ['blood request', 'request blood'],             path: '/blood-request',      label: 'Blood Request' },
  { phrases: ['availability', 'blood availability'],         path: '/blood-availability', label: 'Blood Availability' },
  { phrases: ['donation camps', 'camps'],                    path: '/camps',              label: 'Donation Camps' },
  { phrases: ['hospitals', 'find hospital'],                 path: '/hospitals',          label: 'Hospitals' },
  { phrases: ['map', 'open map', 'show map'],                path: '/map',                label: 'Live Map' },
  { phrases: ['login', 'sign in'],                           path: '/login',              label: 'Login' },
  { phrases: ['register', 'sign up', 'signup'],              path: '/signup',             label: 'Signup' },
  { phrases: ['about', 'about us'],                          path: '/about',              label: 'About' },
  { phrases: ['contact', 'contact us'],                      path: '/contact',            label: 'Contact' },
  { phrases: ['helpline', 'emergency'],                      path: '/helpline',           label: 'Helpline' },
  { phrases: ['dashboard', 'my dashboard'],                  path: '/donor/dashboard',    label: 'Dashboard' },
  { phrases: ['admin', 'admin dashboard'],                   path: '/admin/dashboard',    label: 'Admin Dashboard' },
  { phrases: ['hospital dashboard', 'hospital panel'],       path: '/hospital/dashboard', label: 'Hospital Dashboard' },
];

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = localStorage.getItem('droplife_lang') || 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        const heard = event.results[0][0].transcript.toLowerCase().trim();
        handleCommand(heard);
      };

      
  recognition.onerror = (event) => {
  setIsListening(false);

  console.log("Voice Error:", event.error);

  if (event.error === "not-allowed") {
    toast.error("Microphone permission denied");
  } else if (event.error === "no-speech") {
    toast.error("No speech detected. Try again.");
  } else if (event.error === "audio-capture") {
    toast.error("Microphone not working");
  } else if (event.error === "network") {
  toast.error("Voice service blocked or mic not allowed (use Chrome)");
  } else {
    toast.error("Voice error: " + event.error);
  }
};

      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []); // eslint-disable-line

  const handleCommand = (heard) => {
    for (const cmd of VOICE_COMMANDS) {
      if (cmd.phrases.some((p) => heard.includes(p))) {
        toast.success(`Navigating to ${cmd.label}...`);
        setTimeout(() => navigate(cmd.path), 800);
        return;
      }
    }
    toast.info(`Command "${heard}" not recognised. Say "help" to see commands.`);
    if (heard.includes('help')) setShowModal(true);
  };

  const toggleListen = async () => {
  if (!recognitionRef.current) {
    toast.error("Voice system not initialized");
    return;
  }

  if (isListening) {
    recognitionRef.current.stop();
    setIsListening(false);
  } else {
    try {
      // ✅ FORCE MICROPHONE PERMISSION
      await navigator.mediaDevices.getUserMedia({ audio: true });

      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      toast.error("Microphone permission required");
    }
  }
};
  if (!supported) return null;

  return (
    <>
      {/* Floating mic button */}
      <Button
        onClick={toggleListen}
        variant={isListening ? 'danger' : 'outline-danger'}
        size="sm"
        className="rounded-circle"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          zIndex: 1050,
          width: '52px',
          height: '52px',
          boxShadow: isListening
            ? '0 0 0 4px rgba(220,53,69,0.3)'
            : '0 4px 12px rgba(0,0,0,0.15)',
          animation: isListening ? 'voicePulse 1s infinite' : 'none'
        }}
        title={isListening ? 'Stop listening' : 'Voice command'}
      >
        {isListening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
      </Button>

      {/* Listening overlay */}
      {isListening && (
        <div
          style={{
            position: 'fixed',
            bottom: '144px',
            right: '16px',
            background: '#dc3545',
            color: '#fff',
            borderRadius: '12px',
            padding: '8px 14px',
            fontSize: '13px',
            zIndex: 1050,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          🎙 Listening…
        </div>
      )}

      {/* Commands modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaMicrophone className="me-2 text-danger" />
            Voice Commands
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">Say any of these commands:</p>
          <ListGroup variant="flush">
            {VOICE_COMMANDS.map((cmd, i) => (
              <ListGroup.Item key={i} className="py-2 px-0">
                <Badge bg="danger" className="me-2">{cmd.label}</Badge>
                <span className="text-muted small">"{cmd.phrases[0]}"</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>
            <FaTimes className="me-1" />Close
          </Button>
          <Button variant="danger" size="sm" onClick={() => { setShowModal(false); toggleListen(); }}>
            <FaMicrophone className="me-1" />Start Listening
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        @keyframes voicePulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(220,53,69,0.3); }
          50%       { box-shadow: 0 0 0 10px rgba(220,53,69,0.1); }
        }
      `}</style>
    </>
  );
};

export default VoiceAssistant;