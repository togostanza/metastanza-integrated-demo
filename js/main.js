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
        if (item.tag) {
          let container2 = stanzas;
          if (item.tag === "togostanza-pagination-table") {
            container2 = container;
          }
          container2.appendChild(createComponent(item));
        }
      });

      // multi-data.json の内容を textarea#data に格納し、バリデート・更新を行う
      fetch('./multi-data.json')
        .then(response => response.text())
        .then(text => {
          const textarea = document.getElementById('data');
          textarea.value = text;
          updateStanzasData(text);
          // textarea の内容が変化したら再更新
          textarea.addEventListener('input', (e) => {
            updateStanzasData(e.target.value);
          });
        })
        .catch(err => console.error("multi-data.json の読み込みに失敗しました:", err));
    })
    .catch(err => console.error("config.json の読み込みに失敗しました:", err));

  // テキストエリアの内容を JSON としてバリデートし、URIデータスキーマとして各スタンザに渡す
  function updateStanzasData(jsonString) {
    try {
      JSON.parse(jsonString); // JSON として正しいかをチェック
      // data: スキーマ形式に変換（※改行や空白は encodeURIComponent により変換される）
      const dataUri = "data:application/json," + encodeURIComponent(jsonString);
      // data-url 属性を持つ全ての要素に dataUri をセット
      document.querySelectorAll('[data-url]').forEach(el => {
        el.setAttribute("data-url", dataUri);
      });
    } catch (e) {
      console.error("textarea の内容が有効な JSON ではありません。", e);
    }
  }
});