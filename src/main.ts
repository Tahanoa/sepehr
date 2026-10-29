import { installCommandShortcut } from './components/command-menu';
import { installControls } from './components/controls';
/**
 * POLARIS MAIN ENTRY POINT
 */

import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/utilities.css';
import './styles/redesign.css';
import './styles/product.css';
import { applyTheme, readTheme } from './theme/theme';

applyTheme(readTheme());

import { initializeApp } from './app/app';

document.addEventListener('DOMContentLoaded', () => {
  const appRoot = document.getElementById('app');
  if (appRoot) {
    const shell = initializeApp();
    appRoot.appendChild(shell.getRootElement());
    installControls();
    installCommandShortcut();
  }
});

