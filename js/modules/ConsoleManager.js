/**
 * ConsoleManager - コンソールの開閉管理
 */
class ConsoleManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.isInitialized = false;
  }

  /**
   * コンソール開閉機能を初期化
   */
  init() {
    if (this.isInitialized) return;

    this.setupToggleButton();
    this.restoreState();
    this.isInitialized = true;
  }

  /**
   * トグルボタンのイベントリスナーを設定
   */
  setupToggleButton() {
    const toggleButton = document.querySelector(".consolecollapse > button");
    const tabContainer = document.querySelector(".console.tab-container");

    if (!toggleButton || !tabContainer) {
      console.warn("Console toggle elements not found");
      return;
    }

    toggleButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggle();
    });
  }

  /**
   * コンソール開閉の切り替え
   */
  toggle() {
    const body = document.body;
    const toggleButton = document.querySelector(".consolecollapse > button");
    const icon = toggleButton?.querySelector(".material-symbols-outlined");

    if (!toggleButton || !icon) return;

    const isCollapsed = body.classList.contains("-console-collapsed");

    if (isCollapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  /**
   * コンソールを展開
   */
  expand() {
    const body = document.body;
    const toggleButton = document.querySelector(".consolecollapse > button");
    const icon = toggleButton?.querySelector(".material-symbols-outlined");

    if (!toggleButton || !icon) return;

    body.classList.remove("-console-collapsed");
    toggleButton.setAttribute("aria-expanded", "true");
    toggleButton.setAttribute("title", "Close Console");
    icon.textContent = "keyboard_arrow_right";
    this.stateManager.saveConsoleState(false);
  }

  /**
   * コンソールを折りたたみ
   */
  collapse() {
    const body = document.body;
    const toggleButton = document.querySelector(".consolecollapse > button");
    const icon = toggleButton?.querySelector(".material-symbols-outlined");

    if (!toggleButton || !icon) return;

    body.classList.add("-console-collapsed");
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("title", "Open Console");
    icon.textContent = "keyboard_arrow_left";
    this.stateManager.saveConsoleState(true);
  }

  /**
   * 保存された状態を復元
   */
  restoreState() {
    const isConsoleCollapsed = this.stateManager.loadConsoleState();
    if (isConsoleCollapsed) {
      // 状態保存なしで直接DOM操作
      this.setCollapsedState(true);
    }
  }

  /**
   * 折りたたみ状態を設定（状態保存なし）
   * @param {boolean} isCollapsed - 折りたたむかどうか
   */
  setCollapsedState(isCollapsed) {
    const body = document.body;
    const toggleButton = document.querySelector(".consolecollapse > button");
    const icon = toggleButton?.querySelector(".material-symbols-outlined");

    if (!toggleButton || !icon) return;

    if (isCollapsed) {
      body.classList.add("-console-collapsed");
      toggleButton.setAttribute("aria-expanded", "false");
      toggleButton.setAttribute("title", "Open Console");
      icon.textContent = "keyboard_arrow_left";
    } else {
      body.classList.remove("-console-collapsed");
      toggleButton.setAttribute("aria-expanded", "true");
      toggleButton.setAttribute("title", "Close Console");
      icon.textContent = "keyboard_arrow_right";
    }
  }

  /**
   * 折りたたみ状態を設定
   * @param {boolean} isCollapsed - 折りたたむかどうか
   */
  setCollapsed(isCollapsed) {
    if (isCollapsed) {
      this.collapse();
    } else {
      this.expand();
    }
  }
}

export default ConsoleManager;
