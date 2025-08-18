const isLocal = location.hostname === "localhost";
const baseURL = isLocal
  ? "http://localhost:8080/"
  : "https://togostanza.github.io/metastanza-devel/";
// const baseURL =  "http://localhost:8080/"

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("togostanza--container");
  if (!container) {
    console.error("togostanza--container が見つかりません。");
    return;
  }
  container.innerHTML = "";

  // style タグ生成（CSS variables 用）
  const styleTag = document.createElement("style");
  document.head.appendChild(styleTag);

  /**
   * 指定された src を持つ script 要素を生成する
   * @param {string} src - 読み込むスクリプトの相対パス
   * @returns {HTMLScriptElement} 生成された script 要素
   */
  function createScript(src) {
    const script = document.createElement("script");
    script.type = "module";
    script.src = baseURL + src;
    script.async = true;
    return script;
  }

  /**
   * config.json の item に基づいてコンポーネントを生成する
   * @param {Object} item - コンポーネント設定オブジェクト
   * @returns {HTMLElement} 生成された要素
   */
  function createComponent(item) {
    const elem = document.createElement(item.tag);
    if (item.attributes) {
      Object.keys(item.attributes).forEach((key) => {
        elem.setAttribute(key, item.attributes[key]);
      });
    }
    if (item.cssVariables) {
      let cssRule = `${item.tag} {`;
      Object.keys(item.cssVariables).forEach((varName) => {
        cssRule += `${varName}: ${item.cssVariables[varName]};`;
      });
      cssRule += `}`;
      styleTag.appendChild(document.createTextNode(cssRule));
    }
    return elem;
  }

  /**
   * config.json および multi-data.json を読み込み、各コンポーネントをレンダリングする
   */
  function initConfigs() {
    fetch("./config.json")
      .then((response) => response.json())
      .then((config) => {
        // dataSources 追加
        config.dataSources.forEach((item) => {
          const el = createComponent(item);
          if (el) container.appendChild(el);
        });

        // stanzas の配置
        const stanzas = document.createElement("div");
        stanzas.id = "stanzas";
        container.appendChild(stanzas);
        config.stanzas.forEach((item) => {
          if (item.scriptSrc) {
            container.appendChild(createScript(item.scriptSrc));
          }
          let target =
            item.tag === "togostanza-pagination-table" ? container : stanzas;
          if (item.title) {
            const panel = document.createElement("div");
            panel.classList.add("panel");

            const heading = document.createElement("h2");
            heading.textContent = item.title;
            panel.appendChild(heading);

            if (item.tag) {
              panel.appendChild(createComponent(item));
            }
            target.appendChild(panel);
          } else if (item.tag) {
            target.appendChild(createComponent(item));
          }
        });
        // multi-data.json 読み込み
        fetch("./multi-data.json")
          .then((response) => response.text())
          .then((text) => {
            if (window.inputEditor) {
              window.inputEditor.setValue(text);
              updateStanzasData(text);
            }
          })
          .catch((err) =>
            console.error("multi-data.json の読み込みに失敗しました:", err)
          );
      })
      .catch((err) =>
        console.error("config.json の読み込みに失敗しました:", err)
      );
  }

  /**
   * Input Data 用の CodeMirror エディタを初期化する
   */
  function initInputEditor() {
    // 変更後は "DataEditor" という ID を持つ textarea を参照する
    const dataTextarea = document.getElementById("DataEditor");
    window.inputEditor = CodeMirror.fromTextArea(dataTextarea, {
      mode: { name: "javascript", json: true },
      lineNumbers: true,
      theme: "default",
    });
    const heightData = window
      .getComputedStyle(dataTextarea)
      .getPropertyValue("height");
    window.inputEditor.setSize(null, heightData);
    window.inputEditor.on("change", (cm) => {
      const text = cm.getValue();
      updateStanzasData(text);
    });
  }

  /**
   * JSON が有効なら各スタンザの data-url 属性を更新する
   * @param {string} jsonString - JSON 文字列
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
    // 変更後は "ColorSchemeEditor" という ID を持つ textarea を参照する
    const styleTextarea = document.getElementById("ColorSchemeEditor");
    window.styleEditor = CodeMirror.fromTextArea(styleTextarea, {
      mode: { name: "javascript", json: true },
      lineNumbers: true,
      theme: "default",
    });
    const heightStyle = window
      .getComputedStyle(styleTextarea)
      .getPropertyValue("height");
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
   * @param {string} jsonString - JSON 文字列
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
   *
   * @param {Object.<string, string>} colorScheme - CSS変数とその値のオブジェクト。
   *        例: { "--togostanza-theme-series_0_color": "#6590e6", ... }
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
            window.styleEditor.setValue(jsonText);
            applyStyleFromEditor(jsonText);
            applyColorSchemeToStanzas(schemeCopy);
          });
          schemeContainer.appendChild(btn);
        });
        styleTab.insertBefore(schemeContainer, styleTab.firstChild);
      })
      .catch((err) => console.error("Failed to load color schemes:", err));
  }

  /**
   * タブ切り替え処理を初期化する
   */
  function initTabs() {
    // 変更後は、data-tab 属性が "DataEditorTab" または "ColorSchemeEditorTab" となる
    document.querySelectorAll(".tab-container .tabs .tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        // クリックされた要素がボタン自体でない場合は、親のボタン要素を取得
        const button = e.target.closest(".tab");
        if (!button) return;

        const targetTab = button.getAttribute("data-tab");

        document
          .querySelectorAll(".tab-container .tabs .tab")
          .forEach((btn) => {
            btn.classList.toggle(
              "-active",
              btn.getAttribute("data-tab") === targetTab
            );
          });
        document
          .querySelectorAll(".tab-container .tab-content")
          .forEach((content) => {
            content.classList.toggle("-active", content.id === targetTab);
          });

        // 必要なら各エディタの refresh() を呼ぶ
        if (targetTab === "ColorSchemeEditorTab" && window.styleEditor) {
          window.styleEditor.refresh();
        }
      });
    });
  }

  // 初期化処理呼び出し
  initConfigs();
  initInputEditor();
  initStyleEditor();
  initColorSchemeButtons();
  initTabs();
});
