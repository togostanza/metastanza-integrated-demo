document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("togostanza--container");
  if (!container) {
    console.error("togostanza--container が見つかりません。");
    return;
  }
  // 既存の内容をクリア
  container.innerHTML = "";

  // ── データソース要素 ──
  const ds1 = document.createElement("togostanza--data-source");
  ds1.setAttribute("url", "./data.json");
  ds1.setAttribute("receiver", "togostanza-pagination-table, togostanza-barchart");
  ds1.setAttribute("target-attribute", "data-url");
  container.appendChild(ds1);

  const ds2 = document.createElement("togostanza--data-source");
  ds2.setAttribute("url", "./tree-data.json");
  ds2.setAttribute("receiver", "togostanza-treemap,togostanza-sunburst,togostanza-column-tree");
  ds2.setAttribute("target-attribute", "data-url");
  container.appendChild(ds2);

  // ── フレックスコンテナ (vis. treemap, sunburst, column-tree) ──
  const flexDiv = document.createElement("div");
  flexDiv.style.display = "flex";

  // 共通で使用する script 要素作成関数
  function createScript(src) {
    const script = document.createElement("script");
    script.type = "module";
    script.src = src;
    script.async = true;
    return script;
  }

  // Treemap
  flexDiv.appendChild(createScript("http://localhost:8080/treemap.js"));
  const treemap = document.createElement("togostanza-treemap");
  treemap.setAttribute("data-url", "./tree-data.json");
  treemap.setAttribute("data-type", "json");
  treemap.setAttribute("node-label_key", "label");
  treemap.setAttribute("node-value_key", "size");
  treemap.setAttribute("node-log_scale", "");
  treemap.setAttribute("togostanza-custom_css_url", "");
  treemap.setAttribute("event-incoming_change_selected_nodes", "");
  treemap.setAttribute("event-outgoing_change_selected_nodes", "");
  flexDiv.appendChild(treemap);

  // Sunburst
  flexDiv.appendChild(createScript("http://localhost:8080/sunburst.js"));
  const sunburst = document.createElement("togostanza-sunburst");
  sunburst.setAttribute("data-url", "./tree-data.json");
  sunburst.setAttribute("data-type", "json");
  sunburst.setAttribute("node-value_key", "size");
  sunburst.setAttribute("node-label_key", "label");
  sunburst.setAttribute("node-values_visible", "");
  sunburst.setAttribute("node-levels_gap_width", "2");
  sunburst.setAttribute("node-gap_width", "8");
  sunburst.setAttribute("node-corner_radius", "0");
  sunburst.setAttribute("scaling", "By value");
  sunburst.setAttribute("max_depth", "3");
  sunburst.setAttribute("togostanza-custom_css_url", "");
  sunburst.setAttribute("event-incoming_change_selected_nodes", "");
  sunburst.setAttribute("event-outgoing_change_selected_nodes", "");
  flexDiv.appendChild(sunburst);

  // Column Tree
  flexDiv.appendChild(createScript("http://localhost:8080/column-tree.js"));
  const columnTree = document.createElement("togostanza-column-tree");
  columnTree.setAttribute("data-url", "./tree-data.json");
  columnTree.setAttribute("data-type", "json");
  columnTree.setAttribute("node-label_key", "label");
  columnTree.setAttribute("node-value_key", "size");
  columnTree.setAttribute("node-value_alignment", "horizontal");
  columnTree.setAttribute("node-value_fallback", "no data");
  columnTree.setAttribute("search_key", "value");
  columnTree.setAttribute("togostanza-custom_css_url", "");
  columnTree.setAttribute("event-incoming_change_selected_nodes", "");
  columnTree.setAttribute("event-outgoing_change_selected_nodes", "");
  flexDiv.appendChild(columnTree);

  container.appendChild(flexDiv);

  // ── Barchart 要素 ──
  container.appendChild(createScript("http://localhost:8080/barchart.js"));
  const barchart = document.createElement("togostanza-barchart");
  barchart.setAttribute("data-url", "./data.json");
  barchart.setAttribute("data-type", "json");
  barchart.setAttribute("data-interpretation", "distribution");
  barchart.setAttribute("data-bin-count", "10");
  barchart.setAttribute("axis-x-key", "pop_2020");
  barchart.setAttribute("axis-x-placement", "bottom");
  barchart.setAttribute("axis-x-title", "都道府県");
  barchart.setAttribute("axis-x-title_padding", "25");
  barchart.setAttribute("axis-x-ticks_label_angle", "-45");
  barchart.setAttribute("axis-x-ticks_interval", "");
  barchart.setAttribute("axis-x-ticks_labels_format", ",.2r");
  barchart.setAttribute("axis-x-gridlines_interval", "");
  barchart.setAttribute("axis-y-key", "pop_2020");
  barchart.setAttribute("axis-y-placement", "left");
  barchart.setAttribute("axis-y-title", "人口");
  barchart.setAttribute("axis-y-title_padding", "40");
  barchart.setAttribute("axis-y-ticks_label_angle", "0");
  barchart.setAttribute("axis-y-ticks_interval", "");
  barchart.setAttribute("axis-y-ticks_labels_format", "");
  barchart.setAttribute("axis-y-gridlines_interval", "");
  barchart.setAttribute("grouping-key", "regional_block");
  barchart.setAttribute("grouping-arrangement", "stacked");
  barchart.setAttribute("color_by-key", "color");
  barchart.setAttribute("error_bars-key", "error");
  barchart.setAttribute("tooltips-key", "count");
  barchart.setAttribute("legend-visible", "");
  barchart.setAttribute("legend-title", "Category");
  barchart.setAttribute("togostanza-custom_css_url", "");
  barchart.setAttribute("event-outgoing_change_selected_nodes", "");
  barchart.setAttribute("event-incoming_change_selected_nodes", "");
  container.appendChild(barchart);

  // ── Pagination Table 要素 ──
  container.appendChild(createScript("http://localhost:8080/pagination-table.js"));
  const paginationTable = document.createElement("togostanza-pagination-table");
  paginationTable.setAttribute("data-url", "https://raw.githubusercontent.com/togostanza/togostanza-data/main/samples/json/pagination-table.disease-gwas.json");
  paginationTable.setAttribute("data-type", "json");
  paginationTable.setAttribute("width", "");
  paginationTable.setAttribute("fixed-columns", "1");
  paginationTable.setAttribute("padding", "0px");
  paginationTable.setAttribute("page-size-option", "10,20,50,100");
  paginationTable.setAttribute("page-slider", "true");
  paginationTable.setAttribute("no_data_message", "fugafuga");
  paginationTable.setAttribute("columns", '[{"id":"prefecture","label":"都道府県"},{"id":"regional_block","label":"地域"},{"id":"pop_2011","label":"人口（2011）","type":"number"},{"id":"pop_2012","label":"人口（2012）","type":"number"},{"id":"pop_2013","label":"人口（2013）","type":"number"},{"id":"pop_2014","label":"人口（2014）","type":"number"},{"id":"pop_2015","label":"人口（2015）","type":"number"},{"id":"pop_2016","label":"人口（2016）","type":"number"},{"id":"pop_2017","label":"人口（2017）","type":"number"},{"id":"pop_2018","label":"人口（2018）","type":"number"},{"id":"pop_2019","label":"人口（2019）","type":"number"},{"id":"pop_2020","label":"人口（2020）","type":"number"},{"id":"income_2011","label":"収入（2011）","type":"number"},{"id":"income_2012","label":"収入（2012）","type":"number"},{"id":"income_2013","label":"収入（2013）","type":"number"},{"id":"income_2014","label":"収入（2014）","type":"number"},{"id":"income_2015","label":"収入（2015）","type":"number"},{"id":"income_2016","label":"収入（2016）","type":"number"},{"id":"income_2017","label":"収入（2017）","type":"number"},{"id":"income_2018","label":"収入（2018）","type":"number"},{"id":"income_2019","label":"収入（2019）","type":"number"},{"id":"income_2020","label":"収入（2020）","type":"number"}]');
  paginationTable.setAttribute("togostanza-custom_css_url", "");
  paginationTable.setAttribute("event-outgoing_change_selected_nodes", "");
  paginationTable.setAttribute("event-incoming_change_selected_nodes", "");
  container.appendChild(paginationTable);
});