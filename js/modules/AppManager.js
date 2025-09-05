import ContentManager from './ContentManager.js';
import ColorSchemeManager from './ColorSchemeManager.js';

/**
 * AppManager - アプリケーション全体の管理を行うクラス
 * SPA機能、データタイプの切り替え、設定の読み込みなどを担当
 */
export default class AppManager {
  constructor(stateManager, consoleManager, tabManager, editorManager) {
    this.stateManager = stateManager;
    this.consoleManager = consoleManager;
    this.tabManager = tabManager;
    this.editorManager = editorManager;

    // SPA状態管理
    this.currentDataType = "matrix"; // デフォルトは matrix
    this.appConfig = null;

    // URL設定
    this.isLocal = location.hostname === "localhost";
    this.baseURL = this.isLocal
      ? "http://localhost:8080/"
      : "https://togostanza.github.io/metastanza-devel/";

    // ContentManagerは設定読み込み後に初期化
    this.contentManager = null;
    this.colorSchemeManager = new ColorSchemeManager(editorManager);
  }
  /**
   * アプリケーション初期化
   */
  async init() {
    try {
      const container = document.querySelector("togostanza--container");
      if (!container) {
        console.error("togostanza--container が見つかりません。");
        return;
      }

      // app-config.json を読み込み
      const response = await fetch("./app-config.json");
      this.appConfig = await response.json();

      // ContentManagerを初期化
      this.contentManager = new ContentManager(this.appConfig, this.baseURL);

      // URL から初期データタイプを取得
      const hash = window.location.hash.replace("#", "");
      if (hash && this.appConfig.dataTypes[hash]) {
        this.currentDataType = hash;
      }

      // グローバルナビゲーションのイベントリスナーを設定
      this.setupGlobalNavigation();

      // エディタとタブを初期化（データ読み込み前に実行）
      this.editorManager.init();
      this.colorSchemeManager.initColorSchemeButtons();
      this.tabManager.init();

      // 初期ページを読み込み
      await this.loadDataType(this.currentDataType);

      // 保存された状態を復元（エディタ初期化後）
      this.restoreState();

      // ハッシュ変更イベントリスナーを設定
      window.addEventListener("hashchange", this.handleHashChange.bind(this));
    } catch (error) {
      console.error("アプリケーション初期化エラー:", error);
    }
  }

  /**
   * グローバルナビゲーション設定
   */
  setupGlobalNavigation() {
    const navLinks = document.querySelectorAll(
      ".global-navigation a[data-page]"
    );

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const dataType = link.getAttribute("data-page");
        this.navigateToDataType(dataType);
      });
    });

    // コンソール開閉機能を初期化
    this.consoleManager.init();

    // 初期状態を設定
    this.updateGlobalNavigationState(this.currentDataType);
  }

  /**
   * グローバルナビゲーション状態の更新
   */
  updateGlobalNavigationState(dataType) {
    const navLinks = document.querySelectorAll(
      ".global-navigation a[data-page]"
    );
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
   * 保存された状態を復元
   */
  restoreState() {
    // タブとコンソールの状態復元はそれぞれのマネージャーで処理
    // 追加の復元処理があればここに記述
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
      this.appConfig.dataTypes[dataType]
    ) {
      await this.loadDataType(dataType);
    }
  }

  /**
   * 指定されたデータタイプを読み込み
   */
  async loadDataType(dataType) {
    try {
      console.log(`Loading data type: ${dataType}`);

      // ナビゲーションの状態更新
      this.updateGlobalNavigationState(dataType);

      // 既存のコンテンツをクリア
      this.contentManager.clearCurrentContent();

      // 新しいコンテンツを読み込み
      await this.contentManager.loadDataTypeContent(dataType, this.editorManager);

      this.currentDataType = dataType;
    } catch (error) {
      console.error(`データタイプ "${dataType}" の読み込みエラー:`, error);
    }
  }
}
