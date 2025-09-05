import ContentManager from './ContentManager.js';
import ColorSchemeManager from './ColorSchemeManager.js';
import RouterManager from './RouterManager.js';

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

    // 各種マネージャー（設定読み込み後に初期化）
    this.contentManager = null;
    this.colorSchemeManager = new ColorSchemeManager(editorManager);
    this.routerManager = new RouterManager(this);
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

      // ルーター初期化と初期データタイプ取得
      this.currentDataType = this.routerManager.init();

      // グローバルナビゲーションのイベントリスナーを設定
      this.routerManager.setupGlobalNavigation();

      // コンソール開閉機能を初期化
      this.consoleManager.init();

      // エディタとタブを初期化（データ読み込み前に実行）
      this.editorManager.init();
      this.colorSchemeManager.initColorSchemeButtons();
      this.tabManager.init();

      // 初期ページを読み込み
      await this.loadDataType(this.currentDataType);

      // 保存された状態を復元（エディタ初期化後）
      this.restoreState();

    } catch (error) {
      console.error("アプリケーション初期化エラー:", error);
    }
  }

  /**
   * 保存された状態を復元
   */
  restoreState() {
    // タブとコンソールの状態復元はそれぞれのマネージャーで処理
    // 追加の復元処理があればここに記述
  }

  /**
   * 指定されたデータタイプを読み込み（RouterManagerから呼ばれる）
   */
  async loadDataType(dataType) {
    try {
      console.log(`Loading data type: ${dataType}`);

      // ナビゲーションの状態更新
      this.routerManager.updateGlobalNavigationState(dataType);

      // 既存のコンテンツをクリア
      this.contentManager.clearCurrentContent();

      // 新しいコンテンツを読み込み
      await this.contentManager.loadDataTypeContent(dataType, this.editorManager);

      this.currentDataType = dataType;
      this.routerManager.setCurrentDataType(dataType);
    } catch (error) {
      console.error(`データタイプ "${dataType}" の読み込みエラー:`, error);
    }
  }
}
