import StateManager from './modules/StateManager.js';
import ConsoleManager from './modules/ConsoleManager.js';
import TabManager from './modules/TabManager.js';
import EditorManager from './modules/EditorManager.js';
import AppManager from './modules/AppManager.js';

// マネージャーのインスタンスを作成
const stateManager = new StateManager();
const consoleManager = new ConsoleManager(stateManager);
const editorManager = new EditorManager();
const tabManager = new TabManager(stateManager, editorManager);
const appManager = new AppManager(stateManager, consoleManager, tabManager, editorManager);

document.addEventListener("DOMContentLoaded", () => {
  // AppManagerで全体初期化
  appManager.init();
});

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
