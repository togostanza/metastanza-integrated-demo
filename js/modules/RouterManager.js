/**
 * RouterManager - SPA ルーティング管理を行うクラス
 * URL管理、ハッシュ変更、ナビゲーション機能を担当
 */
export default class RouterManager {
  constructor(appManager) {
    this.appManager = appManager;
    this.currentDataType = "matrix"; // デフォルトは matrix
  }

  /**
   * ルーター初期化
   */
  init() {
    // ハッシュ変更イベントリスナーを設定
    window.addEventListener("hashchange", this.handleHashChange.bind(this));

    // 初期URLから初期データタイプを取得
    const hash = window.location.hash.replace("#", "");
    if (hash && this.appManager.appConfig.dataTypes[hash]) {
      this.currentDataType = hash;
    }

    return this.currentDataType;
  }

  /**
   * グローバルナビゲーション設定
   */
  setupGlobalNavigation() {
    const navLinks = document.querySelectorAll(".global-navigation a[data-page]");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const dataType = link.getAttribute("data-page");
        this.navigateToDataType(dataType);
      });
    });

    // 初期状態を設定
    this.updateGlobalNavigationState(this.currentDataType);
  }

  /**
   * グローバルナビゲーション状態の更新
   */
  updateGlobalNavigationState(dataType) {
    const navLinks = document.querySelectorAll(".global-navigation a[data-page]");
    navLinks.forEach((link) => {
      link.classList.toggle(
        "-active",
        link.getAttribute("data-page") === dataType
      );
    });

    // body の data-page 属性も更新
    document.body.setAttribute("data-page", dataType);
  }

  /**
   * データタイプへの遷移
   */
  navigateToDataType(dataType) {
    if (dataType === this.currentDataType) return;

    // URLハッシュを更新
    window.location.hash = dataType;
  }

  /**
   * ハッシュ変更時の処理
   */
  async handleHashChange() {
    const hash = window.location.hash.replace("#", "");
    const dataType = hash || "matrix";

    if (
      dataType !== this.currentDataType &&
      this.appManager.appConfig.dataTypes[dataType]
    ) {
      await this.appManager.loadDataType(dataType);
      this.currentDataType = dataType;
    }
  }

  /**
   * 現在のデータタイプを取得
   */
  getCurrentDataType() {
    return this.currentDataType;
  }

  /**
   * 現在のデータタイプを設定
   */
  setCurrentDataType(dataType) {
    this.currentDataType = dataType;
  }
}
