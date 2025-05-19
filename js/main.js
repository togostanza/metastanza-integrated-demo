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

  // JSON 定義に従って生成する設定
  // ※ script タグの src はファイル名のみとし、createElement 内でパスを組み立てる
  const config = {
    "dataSources": [
      {
        "tag": "togostanza--data-source",
        "attributes": {
          "url": "./multi-data.json",
          "receiver": "togostanza-pagination-table, togostanza-barchart",
          "target-attribute": "data-url"
        }
      }
    ],
    // "flexContainer": [
    //   {
    //     "type": "script",
    //     "src": "treemap.js"
    //   },
    //   {
    //     "tag": "togostanza-treemap",
    //     "attributes": {
    //       "data-url": "./tree-data.json",
    //       "data-type": "json",
    //       "node-label_key": "label",
    //       "node-value_key": "size",
    //       "node-log_scale": "",
    //       "togostanza-custom_css_url": "",
    //       "event-incoming_change_selected_nodes": "",
    //       "event-outgoing_change_selected_nodes": ""
    //     }
    //   },
    //   {
    //     "type": "script",
    //     "src": "sunburst.js"
    //   },
    //   {
    //     "tag": "togostanza-sunburst",
    //     "attributes": {
    //       "data-url": "./tree-data.json",
    //       "data-type": "json",
    //       "node-value_key": "size",
    //       "node-label_key": "label",
    //       "node-values_visible": "",
    //       "node-levels_gap_width": "2",
    //       "node-gap_width": "8",
    //       "node-corner_radius": "0",
    //       "scaling": "By value",
    //       "max_depth": "3",
    //       "togostanza-custom_css_url": "",
    //       "event-incoming_change_selected_nodes": "",
    //       "event-outgoing_change_selected_nodes": ""
    //     }
    //   },
    //   {
    //     "type": "script",
    //     "src": "column-tree.js"
    //   },
    //   {
    //     "tag": "togostanza-column-tree",
    //     "attributes": {
    //       "data-url": "./tree-data.json",
    //       "data-type": "json",
    //       "node-label_key": "label",
    //       "node-value_key": "size",
    //       "node-value_alignment": "horizontal",
    //       "node-value_fallback": "no data",
    //       "search_key": "value",
    //       "togostanza-custom_css_url": "",
    //       "event-incoming_change_selected_nodes": "",
    //       "event-outgoing_change_selected_nodes": ""
    //     }
    //   }
    // ],
    "others": [
      {
        "type": "script",
        "src": "barchart.js"
      },
      {
        "tag": "togostanza-barchart",
        "attributes": {
          "data-url": "./data.json",
          "data-type": "json",
          "data-interpretation": "distribution",
          "data-bin-count": "10",
          "axis-x-key": "pop_2020",
          "axis-x-placement": "bottom",
          "axis-x-title": "人口",
          "axis-x-title_padding": "25",
          "axis-x-ticks_label_angle": "-45",
          "axis-x-ticks_interval": "",
          "axis-x-ticks_labels_format": ",.2r",
          "axis-x-gridlines_interval": "",
          "axis-y-key": "pop_2020",
          "axis-y-placement": "left",
          "axis-y-title": "自治体数",
          "axis-y-title_padding": "40",
          "axis-y-ticks_label_angle": "0",
          "axis-y-ticks_interval": "",
          "axis-y-ticks_labels_format": "",
          "axis-y-gridlines_interval": "",
          "grouping-key": "regional_block",
          "grouping-arrangement": "stacked",
          "color_by-key": "color",
          "error_bars-key": "error",
          "tooltips-key": "count",
          "legend-visible": "",
          "legend-title": "Category",
          "togostanza-custom_css_url": "",
          "event-outgoing_change_selected_nodes": "",
          "event-incoming_change_selected_nodes": ""
        },
        "cssVariables": {
          "--togostanza-canvas-width": 300,
          "--togostanza-canvas-height": 200
        }
      },
      {
        "type": "script",
        "src": "pagination-table.js"
      },
      {
        "tag": "togostanza-pagination-table",
        "attributes": {
          "data-url": "https://raw.githubusercontent.com/togostanza/togostanza-data/main/samples/json/pagination-table.disease-gwas.json",
          "data-type": "json",
          "width": "",
          "fixed-columns": "1",
          "padding": "0px",
          "page-size-option": "10,20,50,100",
          "page-slider": "true",
          "no_data_message": "fugafuga",
          "columns": '[{"id":"prefecture","label":"都道府県"},{"id":"regional_block","label":"地域"},{"id":"pop_2011","label":"人口（2011）","type":"number"},{"id":"pop_2012","label":"人口（2012）","type":"number"},{"id":"pop_2013","label":"人口（2013）","type":"number"},{"id":"pop_2014","label":"人口（2014）","type":"number"},{"id":"pop_2015","label":"人口（2015）","type":"number"},{"id":"pop_2016","label":"人口（2016）","type":"number"},{"id":"pop_2017","label":"人口（2017）","type":"number"},{"id":"pop_2018","label":"人口（2018）","type":"number"},{"id":"pop_2019","label":"人口（2019）","type":"number"},{"id":"pop_2020","label":"人口（2020）","type":"number"},{"id":"income_2011","label":"収入（2011）","type":"number"},{"id":"income_2012","label":"収入（2012）","type":"number"},{"id":"income_2013","label":"収入（2013）","type":"number"},{"id":"income_2014","label":"収入（2014）","type":"number"},{"id":"income_2015","label":"収入（2015）","type":"number"},{"id":"income_2016","label":"収入（2016）","type":"number"},{"id":"income_2017","label":"収入（2017）","type":"number"},{"id":"income_2018","label":"収入（2018）","type":"number"},{"id":"income_2019","label":"収入（2019）","type":"number"},{"id":"income_2020","label":"収入（2020）","type":"number"}]',
          "togostanza-custom_css_url": "",
          "event-outgoing_change_selected_nodes": "",
          "event-incoming_change_selected_nodes": ""
        }
      }
    ]
  };

  // JSON の各項目から要素を生成する共通関数
  const style = document.createElement("style");
  function createElement(item) {
    if (item.type === "script") {
      const script = document.createElement("script");
      script.type = "module";
      // script の src は baseURL とファイル名を結合
      script.src = baseURL + item.src;
      script.async = true;
      return script;
    } else if (item.tag) {
      const elem = document.createElement(item.tag);
      for (const attr in item.attributes) {
        elem.setAttribute(attr, item.attributes[attr]);
      }
      // CSS 変数を設定
      if (item.cssVariables) {
        console.log(item)
        // 当該要素のCSSルールを生成し、スタイル定義を追加
        let cssRule = `${item.tag} {`;
        for (const varName in item.cssVariables) {
          cssRule += `${varName}: ${item.cssVariables[varName]};`;
        }
        cssRule += `}`;
        console.log(cssRule)
        style.appendChild(document.createTextNode(cssRule));
      }
      return elem;
    }
    return null;
  }
  document.head.appendChild(style);

  // dataSources: container に直接追加
  config.dataSources.forEach(item => {
    const el = createElement(item);
    if (el) container.appendChild(el);
  });

  // others: container に直接追加
  config.others.forEach(item => {
    console.log(item);
    const el = createElement(item);
    if (el) container.appendChild(el);
  });
});