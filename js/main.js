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

  // config.json を読み込む
  fetch('../config.json')
    .then(response => response.json())
    .then(config => {
      // dataSources: container に直接追加
      config.dataSources.forEach(item => {
        const el = createComponent(item);
        if (el) container.appendChild(el);
      });

      // stanzas: 各要素内に script と component を順次追加
      const stanzas = document.createElement("div");
      stanzas.id = "stanzas";
      container.appendChild(stanzas);
      console.log(stanzas);
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
    })
    .catch(err => console.error("config.json の読み込みに失敗しました:", err));
});