/**
 * MetadataManager - スタンザメタデータの管理を行うクラス
 * metadata.json の取得、フォーム生成、パラメータ管理を担当
 */
export default class MetadataManager {
  constructor() {
    this.baseMetadataUrl = "https://raw.githubusercontent.com/togostanza/metastanza-devel/main/stanzas";
  }

  /**
   * 見出しにメタデータクリックハンドラーを追加
   */
  addMetadataClickHandler(heading, stanzaId) {
    heading.addEventListener("click", async (e) => {
      if (!stanzaId) return;
      await this.loadAndDisplayMetadata(stanzaId);
    });
  }

  /**
   * メタデータを読み込んで表示
   */
  async loadAndDisplayMetadata(stanzaId) {
    const url = `${this.baseMetadataUrl}/${stanzaId}/metadata.json`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("取得失敗");
      const metadata = await res.json();

      this.clearExistingForms();
      this.generateParameterForm(metadata["stanza:parameter"], stanzaId);
      this.generateStyleForm(metadata["stanza:style"], stanzaId);

    } catch (err) {
      console.error("metadata.json取得エラー:", err);
    }
  }  /**
   * 既存フォームをクリア
   */
  clearExistingForms() {
    const paramsUl = document.querySelector("#StanzaParamsContainer ul");
    const stylesUl = document.querySelector("#StanzaStylesContainer ul");
    if (paramsUl) paramsUl.innerHTML = "";
    if (stylesUl) stylesUl.innerHTML = "";
  }

  /**
   * パラメータフォームを生成
   */
  generateParameterForm(parameters, stanzaId) {
    const paramsUl = document.querySelector("#StanzaParamsContainer ul");
    if (!paramsUl || !Array.isArray(parameters)) return;

    parameters.forEach((parameter) => {
      const key = parameter["stanza:key"];
      if (key === "data-url" || key === "data-type") return;

      const li = this.createParameterListItem(parameter, stanzaId);
      paramsUl.appendChild(li);
    });
  }

  /**
   * スタイルフォームを生成
   */
  generateStyleForm(styles, stanzaId) {
    const stylesUl = document.querySelector("#StanzaStylesContainer ul");
    if (!stylesUl || !Array.isArray(styles)) return;

    styles.forEach((style) => {
      const li = this.createStyleListItem(style, stanzaId);
      stylesUl.appendChild(li);
    });
  }

  /**
   * パラメータリストアイテムを作成
   */
  createParameterListItem(parameter, stanzaId) {
    const li = document.createElement("li");
    const label = document.createElement("label");
    label.innerHTML = `<span>${parameter["stanza:key"]}</span>`;

    const input = document.createElement("input");
    input.type = "text";
    input.name = parameter["stanza:key"];
    input.value = this.getCurrentParameterValue(parameter["stanza:key"], stanzaId);
    input.placeholder = parameter["stanza:default"] ?? parameter["stanza:example"] ?? "";

    // フォーカスが外れた時に値をスタンザに適用
    input.addEventListener("blur", () => {
      this.applyParameterToStanza(parameter["stanza:key"], input.value, stanzaId);
    });

    label.appendChild(input);
    li.appendChild(label);
    return li;
  }

  /**
   * スタイルリストアイテムを作成
   */
  createStyleListItem(style, stanzaId) {
    const li = document.createElement("li");
    const label = document.createElement("label");
    label.innerHTML = `<span>${style["stanza:key"]}</span>`;

    const input = document.createElement("input");
    input.type = this.getInputTypeForStyle(style["stanza:type"]);
    input.name = style["stanza:key"];
    input.value = this.getCurrentStyleValue(style["stanza:key"], stanzaId);
    input.placeholder = style["stanza:default"] ?? "";

    // フォーカスが外れた時に値をスタンザに適用
    input.addEventListener("blur", () => {
      this.applyStyleToStanza(style["stanza:key"], input.value, stanzaId);
    });

    label.appendChild(input);
    li.appendChild(label);
    return li;
  }

  /**
   * スタイルタイプに応じた入力タイプを取得
   */
  getInputTypeForStyle(stanzaType) {
    switch (stanzaType) {
      case "color":
        return "color";
      case "number":
        return "number";
      default:
        return "text";
    }
  }

  /**
   * 現在のパラメータ値を取得
   */
  getCurrentParameterValue(paramKey, stanzaId) {
    if (!stanzaId) return "";
    
    const stanzaElement = document.querySelector(`togostanza-${stanzaId}`);
    if (!stanzaElement) return "";
    
    return stanzaElement.getAttribute(paramKey) || "";
  }

  /**
   * 現在のスタイル値を取得
   */
  getCurrentStyleValue(styleKey, stanzaId) {
    if (!stanzaId) return "";
    
    const stanzaElement = document.querySelector(`togostanza-${stanzaId}`);
    if (!stanzaElement) return "";
    
    // CSS変数として設定されているスタイル値を取得
    const shadowRoot = stanzaElement.shadowRoot;
    if (shadowRoot) {
      const computedStyle = getComputedStyle(shadowRoot.host);
      const cssVarValue = computedStyle.getPropertyValue(`--${styleKey}`);
      if (cssVarValue) return cssVarValue.trim();
    }
    
    // CSS変数が見つからない場合、data属性から取得を試行
    return stanzaElement.getAttribute(`data-${styleKey}`) || "";
  }

  /**
   * パラメータ値をスタンザに適用
   */
  applyParameterToStanza(paramKey, value, stanzaId) {
    if (!stanzaId) return;
    
    const stanzaElement = document.querySelector(`togostanza-${stanzaId}`);
    if (!stanzaElement) return;
    
    if (value === "") {
      stanzaElement.removeAttribute(paramKey);
    } else {
      stanzaElement.setAttribute(paramKey, value);
    }
  }

  /**
   * スタイル値をスタンザに適用
   */
  applyStyleToStanza(styleKey, value, stanzaId) {
    if (!stanzaId) return;
    
    const stanzaElement = document.querySelector(`togostanza-${stanzaId}`);
    if (!stanzaElement) return;
    
    // CSS変数として設定
    if (value === "") {
      stanzaElement.style.removeProperty(`--${styleKey}`);
    } else {
      stanzaElement.style.setProperty(`--${styleKey}`, value);
    }
  }
}
