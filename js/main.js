const isLocal = location.hostname === "localhost";
const baseURL = isLocal ? "http://localhost:8080/" : "https://togostanza.github.io/metastanza-devel/";

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
      Object.keys(item.attributes).forEach(key => {
        elem.setAttribute(key, item.attributes[key]);
      });
    }
    if (item.cssVariables) {
      let cssRule = `${item.tag} {`;
      Object.keys(item.cssVariables).forEach(varName => {
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
    fetch('./config.json')
      .then(response => response.json())
      .then(config => {
        // dataSources 追加
        config.dataSources.forEach(item => {
          const el = createComponent(item);
          if (el) container.appendChild(el);
        });

        // stanzas の配置
        const stanzas = document.createElement("div");
        stanzas.id = "stanzas";
        container.appendChild(stanzas);
        config.stanzas.forEach(item => {
          if (item.scriptSrc) {
            container.appendChild(createScript(item.scriptSrc));
          }
          let target = (item.tag === "togostanza-pagination-table") ? container : stanzas;
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
        fetch('./multi-data.json')
          .then(response => response.text())
          .then(text => {
            if (window.inputEditor) {
              window.inputEditor.setValue(text);
              updateStanzasData(text);
            }
          })
          .catch(err => console.error("multi-data.json の読み込みに失敗しました:", err));
      })
      .catch(err => console.error("config.json の読み込みに失敗しました:", err));
  }

  /**
   * Input Data 用の CodeMirror エディタを初期化する
   */
  function initInputEditor() {
    const dataTextarea = document.getElementById("data");
    window.inputEditor = CodeMirror.fromTextArea(dataTextarea, {
      mode: { name: "javascript", json: true },
      lineNumbers: true,
      theme: "default"
    });
    const heightData = window.getComputedStyle(dataTextarea).getPropertyValue("height");
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
      document.querySelectorAll("[data-url]").forEach(el => {
        el.setAttribute("data-url", dataUri);
      });
    } catch (e) {
      console.error("Input Data JSON が有効ではありません。", e);
    }
  }

  /**
   * Style Data 用の CodeMirror エディタを初期化する
   */
  function initStyleEditor() {
    const styleTextarea = document.getElementById("styleData");
    if (!styleTextarea) {
      console.error("styleData textarea が見つかりません。");
      return;
    }
    window.styleEditor = CodeMirror.fromTextArea(styleTextarea, {
      mode: { name: "javascript", json: true },
      lineNumbers: true,
      theme: "default"
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
      "--togostanza-theme-border_color": "#000000"
    };
    const defaultCode = JSON.stringify(defaultStyle, null, 2);
    window.styleEditor.setValue(defaultCode);

    // エディタを即時リフレッシュ
    window.styleEditor.refresh();


    // CodeMirror の内容が変更されたら、JSON の正当性をチェックし
    // 有効なら CSS 変数を更新する
    window.styleEditor.on("change", () => {
      const val = window.styleEditor.getValue();
      console.log(val)
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
      Object.keys(styleObj).forEach(key => {
        document.documentElement.style.setProperty(key, styleObj[key]);
      });
    } catch (e) {
      console.error("Invalid style JSON", e);
    }
  }

  /**
   * color-schemes.json を読み込み、カラースキーマサンプルボタンを生成する
   */
  function initColorSchemeButtons() {
    fetch('./color-schemes.json')
      .then(response => response.json())
      .then(colorSchemes => {
        const styleTab = document.getElementById("style");
        if (!styleTab) return;
        const schemeContainer = document.createElement("div");
        schemeContainer.id = "color-schemes";
        schemeContainer.style.display = "flex";
        schemeContainer.style.gap = "10px";
        schemeContainer.style.marginBottom = "10px";

        colorSchemes.forEach(scheme => {
          const btn = document.createElement("button");
          btn.classList.add("color-scheme-sample-btn");
          // 表示用のラベル
          const label = document.createElement("span");
          label.textContent = scheme.name;
          btn.appendChild(label);

          const sampleContainer = document.createElement("div");
          sampleContainer.classList.add("color-scheme-sample");
          sampleContainer.style.backgroundColor = scheme["--togostanza-theme-background_color"];
          for (let i = 0; i < 6; i++) {
            const colorKey = `--togostanza-theme-series_${i}_color`;
            const box = document.createElement("div");
            box.classList.add("color-scheme-box");
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
          });
          schemeContainer.appendChild(btn);
        });
        styleTab.insertBefore(schemeContainer, styleTab.firstChild);
      })
      .catch(err => console.error("Failed to load color schemes:", err));
  }

  /**
   * タブ切り替え処理を初期化する
   */
  function initTabs() {
    document.querySelectorAll('.tab-container .tabs .tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.getAttribute('data-tab');
        document.querySelectorAll('.tab-container .tabs .tab').forEach(btn => {
          btn.classList.toggle('-active', btn.getAttribute('data-tab') === targetTab);
        });
        document.querySelectorAll('.tab-container .tab-content').forEach(content => {
          content.classList.toggle('-active', content.id === targetTab);
        });

        // style タブが表示されたなら、CodeMirror をリフレッシュ
        if (targetTab === 'style' && window.styleEditor) {
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