import MetadataManager from './MetadataManager.js';

/**
 * ContentManager - コンテンツとスタンザの管理を行うクラス
 * DOM要素の生成、スクリプト読み込み、スタンザ作成を担当
 */
export default class ContentManager {
  constructor(appConfig, baseURL, tabManager = null) {
    this.appConfig = appConfig;
    this.baseURL = baseURL;
    this.loadedScripts = new Set(); // 読み込み済みスクリプトの管理
    this.metadataManager = new MetadataManager(tabManager);
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
    dataSources.forEach((ds) => ds.remove());
  }

  /**
   * データタイプのコンテンツを読み込み
   */
  async loadDataTypeContent(dataType, editorManager) {
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
      this.createStanzaElement(stanzaConfig, stanzasContainer, container);
    });

    // データファイルを読み込んでエディタに設定
    await this.loadDataFile(config.dataSource.url, editorManager);
  }

  /**
   * スタンザ要素を作成
   */
  createStanzaElement(stanzaConfig, stanzasContainer, container) {
    // idからscriptSrcとtagを自動生成
    const stanzaId = stanzaConfig.id;
    const scriptSrc = stanzaId ? `${stanzaId}.js` : null;
    const tag = stanzaId ? `togostanza-${stanzaId}` : null;

    // スクリプト読み込み
    if (scriptSrc && !this.loadedScripts.has(scriptSrc)) {
      const script = this.createScript(scriptSrc);
      container.appendChild(script);
      this.loadedScripts.add(scriptSrc);
    }

    // スタンザ要素作成
    if (stanzaConfig.title) {
      const stanzaWrapper = document.createElement("div");
      stanzaWrapper.classList.add("stanza");

      const heading = document.createElement("h3");
      heading.textContent = stanzaConfig.title;
      stanzaWrapper.appendChild(heading);

      // メタデータ取得処理は MetadataManager に委譲
      this.metadataManager.addMetadataClickHandler(heading, stanzaId);

      // tagからスタンザ要素生成
      if (tag) {
        const stanza = this.createComponent({
          ...stanzaConfig,
          tag,
        });
        stanzaWrapper.appendChild(stanza);
      }

      stanzasContainer.appendChild(stanzaWrapper);
    } else if (tag) {
      const stanza = this.createComponent({
        ...stanzaConfig,
        tag,
      });
      stanzasContainer.appendChild(stanza);
    }
  }

  /**
   * データファイルを読み込んでエディタに設定
   */
  async loadDataFile(dataUrl, editorManager) {
    try {
      const dataResponse = await fetch(dataUrl);
      const dataText = await dataResponse.text();

      // エディタが初期化されるまで待機してからデータを設定
      const setEditorData = () => {
        if (editorManager.inputEditor) {
          editorManager.setDataValue(dataText);
          editorManager.updateStanzasData(dataText);
        } else {
          // エディタがまだ初期化されていない場合、少し待ってから再試行
          setTimeout(setEditorData, 100);
        }
      };
      setEditorData();
    } catch (error) {
      console.error(`データファイル読み込みエラー: ${dataUrl}`, error);
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
}
