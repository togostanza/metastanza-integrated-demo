/**
 * TabManager - タブ切り替え管理
 */
class TabManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.isInitialized = false;
  }

  /**
   * タブ機能を初期化
   */
  init() {
    if (this.isInitialized) return;

    this.setupTabButtons();
    this.restoreState();
    this.isInitialized = true;
  }

  /**
   * タブボタンのイベントリスナーを設定
   */
  setupTabButtons() {
    document.querySelectorAll(".tab-container .tabs .tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const button = e.target.closest(".tab");
        if (!button) return;

        const targetTab = button.getAttribute("data-tab");

        // タブ状態を設定
        this.setActiveTab(targetTab);

        // 状態を保存
        this.stateManager.saveActiveTab(targetTab);
      });
    });
  }

  /**
   * アクティブタブを設定
   * @param {string} targetTab - アクティブにするタブID
   */
  setActiveTab(targetTab) {
    // タブボタンの状態更新
    document.querySelectorAll(".tab-container .tabs .tab").forEach((btn) => {
      btn.classList.toggle("-active", btn.getAttribute("data-tab") === targetTab);
    });

    // タブコンテンツの状態更新
    document.querySelectorAll(".tab-container .tab-content").forEach((content) => {
      content.classList.toggle("-active", content.id === targetTab);
    });

    // エディタのリフレッシュ（遅延実行で確実に実行）
    setTimeout(() => {
      this.refreshEditor(targetTab);
    }, 50);
  }

  /**
   * エディタをリフレッシュ
   * @param {string} targetTab - アクティブなタブID
   */
  refreshEditor(targetTab) {
    if (targetTab === "ColorSchemeEditorTab" && window.styleEditor) {
      window.styleEditor.refresh();
    } else if (targetTab === "DataEditorTab" && window.inputEditor) {
      window.inputEditor.refresh();
    }
  }

  /**
   * 保存された状態を復元
   */
  restoreState() {
    const activeTab = this.stateManager.loadActiveTab();
    this.setActiveTab(activeTab);
  }

  /**
   * 現在のアクティブタブを取得
   * @returns {string} アクティブなタブID
   */
  getActiveTab() {
    const activeButton = document.querySelector(".tab-container .tabs .tab.-active");
    return activeButton ? activeButton.getAttribute("data-tab") : "DataEditorTab";
  }
}

export default TabManager;
