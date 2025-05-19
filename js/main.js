document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("togostanza--container");
  if (!container) {
    console.error("togostanza--container が見つかりません。");
    return;
  }
  container.innerHTML = "";

  // JSON 定義に従って生成する設定
  const config = {
    "dataSources": [
      {
        "tag": "togostanza--data-source",
        "attributes": {
          "url": "./data.json",
          "receiver": "togostanza-pagination-table, togostanza-barchart",
          "target-attribute": "data-url"
        }
      },
      {
        "tag": "togostanza--data-source",
        "attributes": {
          "url": "./tree-data.json",
          "receiver": "togostanza-treemap,togostanza-sunburst,togostanza-column-tree",
          "target-attribute": "data-url"
        }
      }
    ],
    "flexContainer": [
      {
        "type": "script",
        "src": "http://localhost:8080/treemap.js"
      },
      {
        "tag": "togostanza-treemap",
        "attributes": {
          "data-url": "./tree-data.json",
          "data-type": "json",
          "node-label_key": "label",
          "node-value_key": "size",
          "node-log_scale": "",
          "togostanza-custom_css_url": "",
          "event-incoming_change_selected_nodes": "",
          "event-outgoing_change_selected_nodes": ""
        }
      },
      {
        "type": "script",
        "src": "http://localhost:8080/sunburst.js"
      },
      {
        "tag": "togostanza-sunburst",
        "attributes": {
          "data-url": "./tree-data.json",
          "data-type": "json",
          "node-value_key": "size",
          "node-label_key": "label",
          "node-values_visible": "",
          "node-levels_gap_width": "2",
          "node-gap_width": "8",
          "node-corner_radius": "0",
          "scaling": "By value",
          "max_depth": "3",
          "togostanza-custom_css_url": "",
          "event-incoming_change_selected_nodes": "",
          "event-outgoing_change_selected_nodes": ""
        }
      },
      {
        "type": "script",
        "src": "http://localhost:8080/column-tree.js"
      },
      {
        "tag": "togostanza-column-tree",
        "attributes": {
          "data-url": "./tree-data.json",
          "data-type": "json",
          "node-label_key": "label",
          "node-value_key": "size",
          "node-value_alignment": "horizontal",
          "node-value_fallback": "no data",
          "search_key": "value",
          "togostanza-custom_css_url": "",
          "event-incoming_change_selected_nodes": "",
          "event-outgoing_change_selected_nodes": ""
        }
      }
    ],
    "others": [
      {
        "type": "script",
        "src": "http://localhost:8080/barchart.js"
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
          "axis-x-title": "都道府県",
          "axis-x-title_padding": "25",
          "axis-x-ticks_label_angle": "-45",
          "axis-x-ticks_interval": "",
          "axis-x-ticks_labels_format": ",.2r",
          "axis-x-gridlines_interval": "",
          "axis-y-key": "pop_2020",
          "axis-y-placement": "left",
          "axis-y-title": "人口",
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
        }
      },
      {
        "type": "script",
        "src": "http://localhost:8080/pagination-table.js"
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
  function createElement(item) {
    if (item.type === "script") {
      const script = document.createElement("script");
      script.type = "module";
      script.src = item.src;
      script.async = true;
      return script;
    } else if (item.tag) {
      const elem = document.createElement(item.tag);
      for (const attr in item.attributes) {
        elem.setAttribute(attr, item.attributes[attr]);
      }
      return elem;
    }
    return null;
  }

  // dataSources: container に直接追加
  config.dataSources.forEach(item => {
    const el = createElement(item);
    if (el) container.appendChild(el);
  });

  // flexContainer の要素をフレックスコンテナに追加
  const flexDiv = document.createElement("div");
  flexDiv.style.display = "flex";
  config.flexContainer.forEach(item => {
    const el = createElement(item);
    if (el) flexDiv.appendChild(el);
  });
  container.appendChild(flexDiv);

  // others: container に直接追加
  config.others.forEach(item => {
    const el = createElement(item);
    if (el) container.appendChild(el);
  });
});