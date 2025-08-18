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
    this.loadedScripts = new Set(); // 読み込み済みスクリプトの管理

    // URL設定
    this.isLocal = location.hostname === "localhost";
    this.baseURL = this.isLocal
      ? "http://localhost:8080/"
      : "https://togostanza.github.io/metastanza-devel/";
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

      // URL から初期データタイプを取得
      const hash = window.location.hash.replace("#", "");
      if (hash && this.appConfig.dataTypes[hash]) {
        this.currentDataType = hash;
      }

      // グローバルナビゲーションのイベントリスナーを設定
      this.setupGlobalNavigation();

      // エディタとタブを初期化（データ読み込み前に実行）
      this.editorManager.init();
      this.initColorSchemeButtons();
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
    const navLinks = document.querySelectorAll(".global-navigation a[data-page]");

    navLinks.forEach(link => {
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
    const navLinks = document.querySelectorAll(".global-navigation a[data-page]");
    navLinks.forEach(link => {
      link.classList.toggle("-active", link.getAttribute("data-page") === dataType);
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

    if (dataType !== this.currentDataType && this.appConfig.dataTypes[dataType]) {
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
      this.clearCurrentContent();

      // 新しいコンテンツを読み込み
      await this.loadDataTypeContent(dataType);

      this.currentDataType = dataType;

    } catch (error) {
      console.error(`データタイプ "${dataType}" の読み込みエラー:`, error);
    }
  }

  /**
   * 現在のコンテンツをクリア
   */
  clearCurrentContent() {
    const container = document.querySelector("togostanza--container");

    // Stanzas Container を削除
    const stanzasContainer = document.getElementById("StanzasContainer");
    if (stanzasContainer) {
      stanzasContainer.remove();
    }

    // データソース要素を削除
    const dataSources = container.querySelectorAll("togostanza--data-source");
    dataSources.forEach(ds => ds.remove());
  }

  /**
   * データタイプのコンテンツを読み込み
   */
  async loadDataTypeContent(dataType) {
    const config = this.appConfig.dataTypes[dataType];
    const container = document.querySelector("togostanza--container");

    // データソースを追加
    const dataSource = this.createDataSource(config.dataSource);
    container.appendChild(dataSource);

    // Stanzas Container を作成
    const stanzasContainer = document.createElement("div");
    stanzasContainer.id = "StanzasContainer";

    // 見出しを追加
    const stanzasHeading = document.createElement("h2");
    stanzasHeading.textContent = "Stanzas";
    stanzasContainer.appendChild(stanzasHeading);

    container.appendChild(stanzasContainer);

    // 各スタンザを追加
    config.stanzas.forEach((stanzaConfig, index) => {
      // スクリプト読み込み
      if (stanzaConfig.scriptSrc && !this.loadedScripts.has(stanzaConfig.scriptSrc)) {
        const script = this.createScript(stanzaConfig.scriptSrc);
        container.appendChild(script);
        this.loadedScripts.add(stanzaConfig.scriptSrc);
      }

      // スタンザ要素作成
      if (stanzaConfig.title) {
        const stanzaWrapper = document.createElement("div");
        stanzaWrapper.classList.add("stanza");

        const heading = document.createElement("h3");
        heading.textContent = stanzaConfig.title;
        stanzaWrapper.appendChild(heading);

        if (stanzaConfig.tag) {
          const stanza = this.createComponent(stanzaConfig);
          stanzaWrapper.appendChild(stanza);
        }

        stanzasContainer.appendChild(stanzaWrapper);
      } else if (stanzaConfig.tag) {
        const stanza = this.createComponent(stanzaConfig);
        stanzasContainer.appendChild(stanza);
      }
    });

    // データファイルを読み込んでエディタに設定
    try {
      const dataResponse = await fetch(config.dataSource.url);
      const dataText = await dataResponse.text();

      // エディタが初期化されるまで待機してからデータを設定
      const setEditorData = () => {
        if (this.editorManager.inputEditor) {
          this.editorManager.setDataValue(dataText);
          this.editorManager.updateStanzasData(dataText);
        } else {
          // エディタがまだ初期化されていない場合、少し待ってから再試行
          setTimeout(setEditorData, 100);
        }
      };
      setEditorData();
    } catch (error) {
      console.error(`データファイル読み込みエラー: ${config.dataSource.url}`, error);
    }
  }

  /**
   * データソース要素を作成
   */
  createDataSource(dataSourceConfig) {
    const elem = document.createElement("togostanza--data-source");
    elem.setAttribute("url", dataSourceConfig.url);
    elem.setAttribute("receiver", dataSourceConfig.receiver);
    elem.setAttribute("target-attribute", "data-url");
    return elem;
  }

  /**
   * スクリプト要素を生成
   */
  createScript(src) {
    console.log(`Creating script with src: ${this.baseURL + src}`);
    const script = document.createElement("script");
    script.type = "module";
    script.src = this.baseURL + src;
    script.async = true;
    return script;
  }

  /**
   * コンポーネント要素を生成
   */
  createComponent(item) {
    const elem = document.createElement(item.tag);

    if (item.attributes) {
      Object.keys(item.attributes).forEach((key) => {
        elem.setAttribute(key, item.attributes[key]);
      });
    }

    if (item.cssVariables) {
      // CSS変数を要素のstyle属性に直接設定
      Object.keys(item.cssVariables).forEach((varName) => {
        let value = item.cssVariables[varName];
        elem.style.setProperty(varName, value);
      });
    }

    return elem;
  }

  /**
   * color-schemes.json を読み込み、カラースキーマサンプルボタンを生成する
   */
  initColorSchemeButtons() {
    fetch("./color-schemes.json")
      .then((response) => response.json())
      .then((colorSchemes) => {
        const styleTab = document.getElementById("ColorSchemeEditorTab");
        if (!styleTab) return;

        const schemeContainer = document.createElement("div");
        schemeContainer.id = "ColorSchemes";

        // 見出しを追加
        const heading = document.createElement("h3");
        heading.textContent = "Sample color schemes";
        schemeContainer.appendChild(heading);

        colorSchemes.forEach((scheme) => {
          const btn = document.createElement("button");
          btn.className = "btn";

          // カラースキームの背景色とフォント色を適用
          btn.style.backgroundColor = scheme["--togostanza-theme-background_color"];
          btn.style.color = scheme["--togostanza-theme-text_color"];
          btn.style.borderColor = scheme["--togostanza-theme-border_color"];

          // 表示用のラベル
          const label = document.createElement("label");
          label.textContent = scheme.name;
          btn.appendChild(label);

          const sampleContainer = document.createElement("div");
          sampleContainer.className = "sample";
          sampleContainer.style.backgroundColor =
            scheme["--togostanza-theme-background_color"];
          for (let i = 0; i < 6; i++) {
            const colorKey = `--togostanza-theme-series_${i}_color`;
            const box = document.createElement("div");
            box.className = "box";
            box.style.backgroundColor = scheme[colorKey];
            sampleContainer.appendChild(box);
          }
          btn.appendChild(sampleContainer);

          btn.addEventListener("click", () => {
            const schemeCopy = { ...scheme };
            delete schemeCopy.name;
            const jsonText = JSON.stringify(schemeCopy, null, 2);
            this.editorManager.setStyleValue(jsonText);
            this.editorManager.applyStyleFromEditor(jsonText);
          });
          schemeContainer.appendChild(btn);
        });
        styleTab.insertBefore(schemeContainer, styleTab.firstChild);
      })
      .catch((err) => console.error("Failed to load color schemes:", err));
  }
}
