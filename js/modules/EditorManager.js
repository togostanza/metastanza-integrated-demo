/**
 * EditorManager - CodeMirrorエディタの管理
 */
class EditorManager {
  constructor() {
    this.inputEditor = null;
    this.styleEditor = null;
    this.isInitialized = false;
  }

  /**
   * エディタを初期化
   */
  init() {
    if (this.isInitialized) return;

    this.initInputEditor();
    this.initStyleEditor();
    this.isInitialized = true;

    // エディタ準備完了イベントを発火
    this.dispatchEditorsReady();
  }

  /**
   * データエディタを初期化
   */
  initInputEditor() {
    const dataTextarea = document.getElementById("DataEditor");
    if (!dataTextarea) {
      console.warn("DataEditor textarea not found");
      return;
    }

    this.inputEditor = CodeMirror.fromTextArea(dataTextarea, {
      mode: { name: "javascript", json: true },
      lineNumbers: true,
      theme: "default",
    });

    const heightData = window.getComputedStyle(dataTextarea).getPropertyValue("height");
    this.inputEditor.setSize(null, heightData);

    // データ変更時の処理
    this.inputEditor.on("change", (cm) => {
      const text = cm.getValue();
      this.updateStanzasData(text);
    });

    // グローバル参照を保持（既存コードとの互換性のため）
    window.inputEditor = this.inputEditor;

    // エディタの初期化完了を即座にリフレッシュして確実にする
    setTimeout(() => {
      this.inputEditor.refresh();
    }, 0);
  }

  /**
   * スタイルエディタを初期化
   */
  initStyleEditor() {
    const styleTextarea = document.getElementById("ColorSchemeEditor");
    if (!styleTextarea) {
      console.warn("ColorSchemeEditor textarea not found");
      return;
    }

    this.styleEditor = CodeMirror.fromTextArea(styleTextarea, {
      mode: { name: "javascript", json: true },
      lineNumbers: true,
      theme: "default",
    });

    const heightStyle = window.getComputedStyle(styleTextarea).getPropertyValue("height");
    this.styleEditor.setSize(null, heightStyle);

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
    this.styleEditor.setValue(defaultCode);

    // グローバル参照を保持（既存コードとの互換性のため）
    window.styleEditor = this.styleEditor;

    // エディタを即時リフレッシュ
    this.styleEditor.refresh();

    // 初期値を反映
    setTimeout(() => {
      this.applyStyleFromEditor(this.styleEditor.getValue());
    }, 0);

    // エディタ変更時の処理
    this.styleEditor.on("change", () => {
      const val = this.styleEditor.getValue();
      console.log('Style editor changed:', val);
      try {
        JSON.parse(val); // バリデーション
        this.applyStyleFromEditor(val); // 内部でapplyColorSchemeToStanzasも呼ばれる
      } catch (e) {
        console.error("Style JSON is invalid:", e);
      }
    });
  }

  /**
   * JSONが有効なら各スタンザのdata-url属性を更新
   * @param {string} jsonString - JSON文字列
   */
  updateStanzasData(jsonString) {
    try {
      JSON.parse(jsonString);
      const dataUri = "data:application/json," + encodeURIComponent(jsonString);
      document.querySelectorAll("[data-url]").forEach((el) => {
        el.setAttribute("data-url", dataUri);
      });
    } catch (e) {
      console.error("Data JSON is invalid:", e);
    }
  }

  /**
   * スタイルをエディタから適用
   * @param {string} jsonString - CSS変数のJSON文字列
   */
  applyStyleFromEditor(jsonString) {
    try {
      const cssVars = JSON.parse(jsonString);

      console.log('Applying CSS variables:', cssVars);

      // document.documentElementにも適用（グローバル）
      const root = document.documentElement;
      Object.entries(cssVars).forEach(([key, value]) => {
        if (key.startsWith('--')) {
          root.style.setProperty(key, value);
        }
      });

      // スタンザ要素への適用は専用関数を使用
      if (typeof window.applyColorSchemeToStanzas === 'function') {
        window.applyColorSchemeToStanzas(cssVars);
      }

      console.log('Applied CSS variables successfully');
    } catch (e) {
      console.error("Failed to apply styles:", e);
    }
  }

  /**
   * データエディタの値を設定
   * @param {string} value - 設定する値
   */
  setDataValue(value) {
    if (this.inputEditor) {
      this.inputEditor.setValue(value);
    }
  }

  /**
   * スタイルエディタの値を設定
   * @param {string} value - 設定する値
   */
  setStyleValue(value) {
    if (this.styleEditor) {
      this.styleEditor.setValue(value);
    }
  }

  /**
   * エディタをリフレッシュ
   * @param {string} editorType - 'data' または 'style'
   */
  refreshEditor(editorType) {
    if (editorType === 'data' && this.inputEditor) {
      this.inputEditor.refresh();
    } else if (editorType === 'style' && this.styleEditor) {
      this.styleEditor.refresh();
    }
  }

  /**
   * エディタ準備完了イベントを発火
   */
  dispatchEditorsReady() {
    const event = new CustomEvent('editorsReady', {
      detail: {
        inputEditor: this.inputEditor,
        styleEditor: this.styleEditor
      }
    });
    document.dispatchEvent(event);
  }
}

export default EditorManager;
