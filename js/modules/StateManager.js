/**
 * StateManager - アプリケーションの状態管理
 * localStorage を使用して状態を永続化
 */
class StateManager {
  constructor() {
    this.STATE_KEYS = {
      CONSOLE_COLLAPSED: 'metastanza-console-collapsed',
      ACTIVE_TAB: 'metastanza-active-tab'
    };
  }

  /**
   * 状態をlocalStorageに保存
   * @param {string} key - 保存キー
   * @param {*} value - 保存する値
   */
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }

  /**
   * 状態をlocalStorageから復元
   * @param {string} key - 取得キー
   * @param {*} defaultValue - デフォルト値
   * @returns {*} 復元された値またはデフォルト値
   */
  load(key, defaultValue = null) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * コンソールの折りたたみ状態を保存
   * @param {boolean} isCollapsed - 折りたたまれているかどうか
   */
  saveConsoleState(isCollapsed) {
    this.save(this.STATE_KEYS.CONSOLE_COLLAPSED, isCollapsed);
  }

  /**
   * コンソールの折りたたみ状態を復元
   * @returns {boolean} 折りたたみ状態（デフォルト: false）
   */
  loadConsoleState() {
    return this.load(this.STATE_KEYS.CONSOLE_COLLAPSED, false);
  }

  /**
   * アクティブタブの状態を保存
   * @param {string} tabId - タブID
   */
  saveActiveTab(tabId) {
    this.save(this.STATE_KEYS.ACTIVE_TAB, tabId);
  }

  /**
   * アクティブタブの状態を復元
   * @returns {string} タブID（デフォルト: 'DataEditorTab'）
   */
  loadActiveTab() {
    return this.load(this.STATE_KEYS.ACTIVE_TAB, 'DataEditorTab');
  }
}

export default StateManager;
