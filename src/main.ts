/**
 * POLARIS MAIN ENTRY POINT
 */

import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/utilities.css';

import { initializeApp } from './app/app';

document.addEventListener('DOMContentLoaded', () => {
  const appRoot = document.getElementById('app');
  if (appRoot) {
    const shell = initializeApp();
    appRoot.appendChild(shell.getRootElement());
  }
});
