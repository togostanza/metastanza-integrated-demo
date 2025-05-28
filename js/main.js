const isLocal = location.hostname === "localhost";
// ローカルなら http://localhost:8080/、それ以外なら https://togostanza.github.io/metastanza-devel/
const baseURL = isLocal ? "http://localhost:8080/" : "https://togostanza.github.io/metastanza-devel/";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("togostanza--container");
  if (!container) {
    console.error("togostanza--container が見つかりません。");
    return;
  }
  container.innerHTML = "";

  // CSS 変数用 style タグの生成
  const style = document.createElement("style");
  document.head.appendChild(style);

  // 共通の要素生成関数
  function createScript(src) {
    const script = document.createElement("script");
    script.type = "module";
    script.src = baseURL + src;
    script.async = true;
    return script;
  }
  function createComponent(item) {
    const elem = document.createElement(item.tag);
    if (item.attributes) {
      for (const key in item.attributes) {
        elem.setAttribute(key, item.attributes[key]);
      }
    }
    if (item.cssVariables) {
      let cssRule = `${item.tag} {`;
      for (const varName in item.cssVariables) {
        cssRule += `${varName}: ${item.cssVariables[varName]};`;
      }
      cssRule += `}`;
      style.appendChild(document.createTextNode(cssRule));
    }
    return elem;
  }

  // config.json を読み込み、スタンザなどを生成
  fetch('./config.json')
    .then(response => response.json())
    .then(config => {
      // dataSources: container に直接追加
      config.dataSources.forEach(item => {
        const el = createComponent(item);
        if (el) container.appendChild(el);
      });

      // stanzas: 各要素に script と component を追加
      const stanzas = document.createElement("div");
      stanzas.id = "stanzas";
      container.appendChild(stanzas);

      config.stanzas.forEach(item => {
        if (item.scriptSrc) {
          container.appendChild(createScript(item.scriptSrc));
        }
        // 対象のコンテナ（Pagination table の場合は container、それ以外は stanzas）
        let container2 = stanzas;
        if (item.tag === "togostanza-pagination-table") {
          container2 = container;
        }
        // title が定義されている場合は、タイトルとコンポーネントを wrapper でラップして追加
        if (item.title) {
          const wrapper = document.createElement("div");
          wrapper.classList.add("panel");

          const heading = document.createElement("h2");
          heading.textContent = item.title;
          wrapper.appendChild(heading);

          if (item.tag) {
            wrapper.appendChild(createComponent(item));
          }
          container2.appendChild(wrapper);
        } else if (item.tag) {
          // title がなければ直接追加
          container2.appendChild(createComponent(item));
        }
      });

      // multi-data.json の内容を取得して CodeMirror エディタに反映
      fetch('./multi-data.json')
        .then(response => response.text())
        .then(text => {
          // CodeMirror エディタが初期化済みなら setValue する
          if (window.editor) {
            window.editor.setValue(text);
            updateStanzasData(text);
          }
        })
        .catch(err => console.error("multi-data.json の読み込みに失敗しました:", err));
    })
    .catch(err => console.error("config.json の読み込みに失敗しました:", err));

  // CodeMirror を textarea#data に適用（JSON モード）
  const textarea = document.getElementById("data");
  window.editor = CodeMirror.fromTextArea(textarea, {
    mode: { name: "javascript", json: true },
    lineNumbers: true,
    theme: "default"
  });

  // textarea の computed style を参照し、高さを取得
  const computedHeight = window.getComputedStyle(textarea).getPropertyValue("height");
  window.editor.setSize(null, computedHeight);

  // エディタ内容に変更があればバリデートと各スタンザ更新を行う
  window.editor.on("change", (cm) => {
    const text = cm.getValue();
    updateStanzasData(text);
  });

  // テキストが有効な JSON だったら、各スタンザに URI データスキーマとして渡す関数
  function updateStanzasData(jsonString) {
    try {
      JSON.parse(jsonString);
      const dataUri = "data:application/json," + encodeURIComponent(jsonString);
      document.querySelectorAll('[data-url]').forEach(el => {
        el.setAttribute("data-url", dataUri);
      });
    } catch (e) {
      console.error("エディタの内容が有効な JSON ではありません。", e);
    }
  }

  // タブ切り替えの処理
  document.querySelectorAll('.tab-container .tabs .tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetTab = e.target.getAttribute('data-tab');

      // タブボタンの active クラス切り替え
      document.querySelectorAll('.tab-container .tabs .tab').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === targetTab);
      });

      // タブコンテンツの active クラス切り替え
      document.querySelectorAll('.tab-container .tab-content').forEach(content => {
        content.classList.toggle('active', content.id === targetTab);
      });
    });
  });

  // カラースキーマ編集機能

  const colorSchemes = [
    {
      name: "Default",
      "--togostanza-theme-series_0_color": "#ca65e6",
      "--togostanza-theme-series_1_color": "#8c564b",
      "--togostanza-theme-series_2_color": "#e377c2",
      "--togostanza-theme-series_3_color": "#7f7f7f",
      "--togostanza-theme-series_4_color": "#bcbd22",
      "--togostanza-theme-series_5_color": "#17becf",
      "--togostanza-theme-background_color": "#ecefef"
    },
    {
      name: "Warm",
      "--togostanza-theme-series_0_color": "#D72638",
      "--togostanza-theme-series_1_color": "#3F88C5",
      "--togostanza-theme-series_2_color": "#F49D37",
      "--togostanza-theme-series_3_color": "#140F2D",
      "--togostanza-theme-series_4_color": "#F23C50",
      "--togostanza-theme-series_5_color": "#F8C300",
      "--togostanza-theme-background_color": "#FFFBEA"
    },
    {
      name: "Cool",
      "--togostanza-theme-series_0_color": "#5DADE2",
      "--togostanza-theme-series_1_color": "#48C9B0",
      "--togostanza-theme-series_2_color": "#45B39D",
      "--togostanza-theme-series_3_color": "#A9DFBF",
      "--togostanza-theme-series_4_color": "#5499C7",
      "--togostanza-theme-series_5_color": "#2E86C1",
      "--togostanza-theme-background_color": "#F2F4F4"
    }
    // 必要に応じて追加してください
  ];

  function applyColorScheme(scheme) {
    for (const key in scheme) {
      if (key !== "name") { // name プロパティはスキップ
        document.documentElement.style.setProperty(key, scheme[key]);
      }
    }
  }

  // Style タブ内の領域（例: タブコンテンツ id="style"）を取得
  const styleTab = document.getElementById("style");

  // カラースキーマ選択用のコンテナ要素を作成（flex レイアウト）
  const schemeContainer = document.createElement("div");
  schemeContainer.id = "color-schemes";
  schemeContainer.style.display = "flex";
  schemeContainer.style.gap = "10px";
  schemeContainer.style.marginBottom = "10px";

  // 各スキーマに対してボタンを生成
  colorSchemes.forEach(scheme => {
    const btn = document.createElement("button");
    btn.textContent = scheme.name;
    btn.style.padding = "8px 12px";
    btn.style.cursor = "pointer";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    // ボタンの背景色に、主要な色を反映させる
    btn.style.backgroundColor = scheme["--togostanza-theme-series_0_color"];
    btn.addEventListener("click", () => {
      applyColorScheme(scheme);
    });
    schemeContainer.appendChild(btn);
  });

  // Style タブの先頭にカラースキーマ選択用コンテナを追加
  styleTab.insertBefore(schemeContainer, styleTab.firstChild);
});