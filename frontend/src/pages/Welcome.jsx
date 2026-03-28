import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import SplitTextAnimation from '../components/SplitTextAnimation';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-page">
      <Container className="welcome-container">
        <div className="welcome-content">
          <SplitTextAnimation 
            text="Welcome to DR🩸PLIFE" 
            className="welcome-title"
          />
          <div className="welcome-subtitle fade-in">
            <p>Smart Blood Donation System</p>
            <p className="tagline">Connecting Lives, One Drop at a Time</p>
          </div>
          <div className="blood-drop-animation">
            <div className="blood-drop"></div>
            <div className="blood-drop delay-1"></div>
            <div className="blood-drop delay-2"></div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Welcome;