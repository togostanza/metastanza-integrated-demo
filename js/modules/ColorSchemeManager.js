/**
 * ColorSchemeManager - カラースキーム管理を行うクラス
 * color-schemes.json の読み込み、サンプルボタンの生成を担当
 */
export default class ColorSchemeManager {
  constructor(editorManager) {
    this.editorManager = editorManager;
  }

  /**
   * color-schemes.json を読み込み、カラースキーマサンプルボタンを生成する
   */
  initColorSchemeButtons() {
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
          const btn = this.createSchemeButton(scheme);
          schemeContainer.appendChild(btn);
        });
        styleTab.insertBefore(schemeContainer, styleTab.firstChild);
      })
      .catch((err) => console.error("Failed to load color schemes:", err));
  }

  /**
   * カラースキームボタンを作成
   */
  createSchemeButton(scheme) {
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

    // サンプル表示
    const sampleContainer = this.createSampleContainer(scheme);
    btn.appendChild(sampleContainer);

    // クリックイベント
    btn.addEventListener("click", () => {
      this.applyColorScheme(scheme);
    });

    return btn;
  }

  /**
   * サンプル表示コンテナを作成
   */
  createSampleContainer(scheme) {
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

    return sampleContainer;
  }

  /**
   * カラースキームを適用
   */
  applyColorScheme(scheme) {
    const schemeCopy = { ...scheme };
    delete schemeCopy.name;
    const jsonText = JSON.stringify(schemeCopy, null, 2);
    this.editorManager.setStyleValue(jsonText);
  }
}
