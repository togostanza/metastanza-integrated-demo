import StateManager from './modules/StateManager.js';
import ConsoleManager from './modules/ConsoleManager.js';
import TabManager from './modules/TabManager.js';
import EditorManager from './modules/EditorManager.js';
import AppManager from './modules/AppManager.js';

/**
 * アプリケーション初期化ヘルパー
 */
function createAppManager() {
  const stateManager = new StateManager();
  const consoleManager = new ConsoleManager(stateManager);
  const editorManager = new EditorManager();
  const tabManager = new TabManager(stateManager, editorManager);

  return new AppManager(stateManager, consoleManager, tabManager, editorManager);
}

// アプリケーション初期化
const appManager = createAppManager();

document.addEventListener("DOMContentLoaded", () => {
  // AppManagerで全体初期化
  appManager.init();
});
