import StateManager from './modules/StateManager.js';
import ConsoleManager from './modules/ConsoleManager.js';
import TabManager from './modules/TabManager.js';
import EditorManager from './modules/EditorManager.js';

const isLocal = location.hostname === "localhost";
const baseURL = isLocal
  ? "http://localhost:8080/"
  : "https://togostanza.github.io/metastanza-devel/";

// SPA状態管理
let currentDataType = "matrix"; // デフォルトは matrix
let appConfig = null;
let loadedScripts = new Set(); // 読み込み済みスクリプトの管理

// マネージャーのインスタンスを作成
const stateManager = new StateManager();
const consoleManager = new ConsoleManager(stateManager);
const editorManager = new EditorManager();
const tabManager = new TabManager(stateManager, editorManager);

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("togostanza--container");
  if (!container) {
    console.error("togostanza--container が見つかりません。");
    return;
  }

  // 初期化
  initSPA();
});

/**
 * SPA初期化
 */
async function initSPA() {
  try {
    // app-config.json を読み込み
    const response = await fetch("./app-config.json");
    appConfig = await response.json();

    // URL から初期データタイプを取得
    const hash = window.location.hash.replace("#", "");
    if (hash && appConfig.dataTypes[hash]) {
      currentDataType = hash;
    }

    // グローバルナビゲーションのイベントリスナーを設定
    setupGlobalNavigation();

    // エディタとタブを初期化（データ読み込み前に実行）
    editorManager.init();
    initColorSchemeButtons();
    tabManager.init();

    // 初期ページを読み込み
    await loadDataType(currentDataType);

    // 保存された状態を復元（エディタ初期化後）
    restoreState();

    // ハッシュ変更イベントリスナーを設定
    window.addEventListener("hashchange", handleHashChange);

  } catch (error) {
    console.error("SPA初期化エラー:", error);
  }
}

/**
 * グローバルナビゲーション設定
 */
function setupGlobalNavigation() {
  const navLinks = document.querySelectorAll(".global-navigation a[data-page]");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const dataType = link.getAttribute("data-page");
      navigateToDataType(dataType);
    });
  });

  // コンソール開閉機能を初期化
  consoleManager.init();

  // 初期状態を設定
  updateGlobalNavigationState(currentDataType);
}

/**
 * グローバルナビゲーション状態の更新
 */
function updateGlobalNavigationState(dataType) {
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
function restoreState() {
  // タブとコンソールの状態復元はそれぞれのマネージャーで処理
  // 追加の復元処理があればここに記述
}

/**
 * 保存された状態を復元
 */

/**
 * データタイプへの遷移
 */
function navigateToDataType(dataType) {
  if (dataType === currentDataType) return;

  // URLハッシュを更新
  window.location.hash = dataType;
}

/**
 * ハッシュ変更時の処理
 */
async function handleHashChange() {
  const hash = window.location.hash.replace("#", "");
  const dataType = hash || "matrix";

  if (dataType !== currentDataType && appConfig.dataTypes[dataType]) {
    await loadDataType(dataType);
  }
}

/**
 * 指定されたデータタイプを読み込み
 */
async function loadDataType(dataType) {
  try {
    console.log(`Loading data type: ${dataType}`);

    // ナビゲーションの状態更新
    updateGlobalNavigationState(dataType);

    // 既存のコンテンツをクリア
    clearCurrentContent();

    // 新しいコンテンツを読み込み
    await loadDataTypeContent(dataType);

    currentDataType = dataType;

  } catch (error) {
    console.error(`データタイプ "${dataType}" の読み込みエラー:`, error);
  }
}

/**
 * 現在のコンテンツをクリア
 */
function clearCurrentContent() {
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
async function loadDataTypeContent(dataType) {
  const config = appConfig.dataTypes[dataType];
  const container = document.querySelector("togostanza--container");

  // データソースを追加
  const dataSource = createDataSource(config.dataSource);
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
    if (stanzaConfig.scriptSrc && !loadedScripts.has(stanzaConfig.scriptSrc)) {
      const script = createScript(stanzaConfig.scriptSrc);
      container.appendChild(script);
      loadedScripts.add(stanzaConfig.scriptSrc);
    }

    // スタンザ要素作成
    if (stanzaConfig.title) {
      const stanzaWrapper = document.createElement("div");
      stanzaWrapper.classList.add("stanza");

      const heading = document.createElement("h3");
      heading.textContent = stanzaConfig.title;
      stanzaWrapper.appendChild(heading);

      if (stanzaConfig.tag) {
        const stanza = createComponent(stanzaConfig);
        stanzaWrapper.appendChild(stanza);
      }

      stanzasContainer.appendChild(stanzaWrapper);
    } else if (stanzaConfig.tag) {
      const stanza = createComponent(stanzaConfig);
      stanzasContainer.appendChild(stanza);
    }
  });

  // データファイルを読み込んでエディタに設定
  try {
    const dataResponse = await fetch(config.dataSource.url);
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
    console.error(`データファイル読み込みエラー: ${config.dataSource.url}`, error);
  }
}

/**
 * データソース要素を作成
 */
function createDataSource(dataSourceConfig) {
  const elem = document.createElement("togostanza--data-source");
  elem.setAttribute("url", dataSourceConfig.url);
  elem.setAttribute("receiver", dataSourceConfig.receiver);
  elem.setAttribute("target-attribute", "data-url");
  return elem;
}

/**
 * スクリプト要素を生成
 */
function createScript(src) {
  const script = document.createElement("script");
  script.type = "module";
  script.src = baseURL + src;
  script.async = true;
  return script;
}

/**
 * コンポーネント要素を生成
 */
function createComponent(item) {
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
 * 指定されたカラースキーム（CSSカスタムプロパティ）を
 * ページ内のすべての Stanza 要素に適用します。
 */

/**
 * JSON が有効なら各スタンザの data-url 属性を更新する
 */
function updateStanzasData(jsonString) {
  try {
    JSON.parse(jsonString);
    const dataUri = "data:application/json," + encodeURIComponent(jsonString);
    document.querySelectorAll("[data-url]").forEach((el) => {
      el.setAttribute("data-url", dataUri);
    });
  } catch (e) {
    console.error("Input Data JSON が有効ではありません。", e);
  }
}

/**
 * Color Scheme 用の CodeMirror エディタを初期化する
 */
function initStyleEditor() {
  const styleTextarea = document.getElementById("ColorSchemeEditor");
  if (!styleTextarea) return;

  window.styleEditor = CodeMirror.fromTextArea(styleTextarea, {
    mode: { name: "javascript", json: true },
    lineNumbers: true,
    theme: "default",
  });

  const heightStyle = window.getComputedStyle(styleTextarea).getPropertyValue("height");
  window.styleEditor.setSize(null, heightStyle);

  // 初期状態で入力する CSS 変数定義
  const defaultStyle = {
    "--togostanza-theme-series_0_color": "#6590e6",
    "--togostanza-theme-series_1_color": "#3ac9b6",
    "--togostanza-theme-series_2_color": "#9ede2f",
    "--togostanza-theme-series_3_color": "#f5da64",
    "--togostanza-theme-series_4_color": "#f57f5b",
    "--togostanza-theme-series_5_color": "#f75976",
    "--togostanza-theme-background_color": "#ecefef",
    "--togostanza-theme-text_color": "#000000",
    "--togostanza-theme-border_color": "#000000",
  };
  const defaultCode = JSON.stringify(defaultStyle, null, 2);
  window.styleEditor.setValue(defaultCode);

  // エディタを即時リフレッシュ
  window.styleEditor.refresh();

  // 初期値を反映
  setTimeout(() => {
    applyStyleFromEditor(window.styleEditor.getValue());
  }, 0);

  // エディタ変更時の処理
  window.styleEditor.on("change", () => {
    const val = window.styleEditor.getValue();
    try {
      JSON.parse(val);
      applyStyleFromEditor(val);
    } catch (e) {
      console.error("Style JSON is invalid:", e);
    }
  });
}

/**
 * JSON をパースして、document.documentElement の CSS 変数を更新する
 */
function applyStyleFromEditor(jsonString) {
  try {
    const styleObj = JSON.parse(jsonString);
    Object.keys(styleObj).forEach((key) => {
      document.documentElement.style.setProperty(key, styleObj[key]);
    });
  } catch (e) {
    console.error("Invalid style JSON", e);
  }
}

/**
 * 指定されたカラースキーム（CSSカスタムプロパティ）を
 * ページ内のすべての Stanza 要素に適用します。
 */
function applyColorSchemeToStanzas(colorScheme) {
  const stanzaElements = document.querySelectorAll("[data-url]");

  stanzaElements.forEach((el) => {
    Object.entries(colorScheme).forEach(([key, value]) => {
      if (key.startsWith("--")) {
        el.style.setProperty(key, value);
      }
    });
  });
}

// グローバルに利用可能にする
window.applyColorSchemeToStanzas = applyColorSchemeToStanzas;

/**
 * color-schemes.json を読み込み、カラースキーマサンプルボタンを生成する
 */
function initColorSchemeButtons() {
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
          editorManager.setStyleValue(jsonText);
          // applyStyleFromEditorで自動的にapplyColorSchemeToStanzasも呼ばれるので重複削除
          editorManager.applyStyleFromEditor(jsonText);
        });
        schemeContainer.appendChild(btn);
      });
      styleTab.insertBefore(schemeContainer, styleTab.firstChild);
    })
    .catch((err) => console.error("Failed to load color schemes:", err));
}
