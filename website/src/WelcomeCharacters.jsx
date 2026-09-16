import React from 'react';
import {Reveal} from './Reveal.jsx';
import './welcome-characters.css';

export function WelcomeCharacters() {
  return <div className="welcome-characters" aria-hidden="true">
    <Reveal className="welcome-portrait welcome-duran" delay={200}>
      <img src="/assets/characters/duran-welcome-transparent.png" width="1086" height="1448" alt="" draggable={false} decoding="async"/>
    </Reveal>
    <Reveal className="welcome-portrait welcome-maren" delay={320}>
      <img src="/assets/characters/maren-welcome-transparent-flipped.png" width="1086" height="1448" alt="" draggable={false} decoding="async"/>
    </Reveal>
  </div>;
}
