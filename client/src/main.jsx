import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/variables.css';
import './styles/global.css';

const storedTheme = localStorage.getItem('tg-theme');
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
const shouldBeDark = storedTheme ? storedTheme === 'dark' : prefersDark;
document.documentElement.classList.toggle('dark', shouldBeDark);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
