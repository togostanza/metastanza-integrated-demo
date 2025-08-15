# MetaStanza Showcase

DBCLSが提供する情報可視化コンポーネント **MetaStanza** のショーケースアプリケーションです。

## 概要

このアプリケーションでは、様々なデータ構造に対応したMetaStanzaの可視化コンポーネントを体験できます。

## 提供される可視化タイプ

### 📊 マトリックス型 (`matrix.html`)
- **状態**: 利用可能
- **対応コンポーネント**: 
  - ヒートマップ
  - 散布図
  - 棒グラフ
  - 円グラフ
  - 折れ線グラフ
  - ページネーション付きテーブル
- **データ形式**: 行列データ（CSV、JSON）

### 🌳 ツリー型 (`tree.html`)
- **状態**: 利用可能
- **対応コンポーネント**:
  - ツリー図
  - サンバースト図
  - トレマップ
- **データ形式**: 階層構造データ（親子関係を持つJSON）

### 🕸️ グラフ型 (`graph.html`)
- **状態**: 準備中
- **予定コンポーネント**:
  - ネットワークグラフ
  - 分子構造図
  - フローチャート
  - 関係図
- **データ形式**: ノード・エッジデータ

### 🔵 集合型 (`set.html`)
- **状態**: 準備中
- **予定コンポーネント**:
  - ベン図
  - オイラー図
  - UpSet Plot
  - 階層集合図
- **データ形式**: 集合データ

## ファイル構成

```
/
├── index.html              # トップページ
├── matrix.html             # マトリックス型可視化
├── tree.html               # ツリー型可視化
├── graph.html              # グラフ型（準備中）
├── set.html                # 集合型（準備中）
├── config.json             # マトリックス型設定
├── tree-config.json        # ツリー型設定
├── multi-data.json         # マトリックス型サンプルデータ
├── tree-data.json          # ツリー型サンプルデータ
├── color-schemes.json      # カラースキーム定義
├── css/
│   └── style.css           # 共通スタイル
└── js/
    ├── main.js             # マトリックス型用JavaScript
    └── tree-main.js        # ツリー型用JavaScript
```

## 使い方

1. ブラウザで `index.html` を開くとトップページが表示されます
2. 各データタイプのカードをクリックして、対応する可視化ページに移動します
3. 各ページでは以下の操作が可能です：
   - **Dataタブ**: JSONデータをリアルタイムで編集
   - **Color schemeタブ**: カラースキームのカスタマイズ

## データ形式

### マトリックス型データ例
```json
[
  {
    "prefecture": "北海道",
    "area": 83424,
    "pop_2020": 5224614
  }
]
```

### ツリー型データ例
```json
[
  {
    "id": 1,
    "value": "root",
    "label": "Root Node",
    "parent": null,
    "size": 100
  },
  {
    "id": 2,
    "value": "child1",
    "label": "Child 1",
    "parent": 1,
    "size": 50
  }
]
```

## 開発・カスタマイズ

### 新しいコンポーネントの追加

1. 該当する設定ファイル（`config.json`, `tree-config.json`など）に新しいコンポーネント定義を追加
2. 必要に応じてスクリプトファイルを追加
3. CSSカスタマイズが必要な場合は`css/style.css`を編集

### カラースキームの追加

`color-schemes.json`に新しいカラースキーム定義を追加することで、プリセットカラーパレットを増やすことができます。

## 技術スタック

- **MetaStanza**: 可視化コンポーネントライブラリ
- **CodeMirror**: コードエディタ
- **Vanilla JavaScript**: フレームワークレス実装

## 関連リンク

- [MetaStanza GitHub](https://github.com/togostanza/metastanza)
- [DBCLS](https://dbcls.rois.ac.jp/)

## ライセンス

このプロジェクトはMetaStanzaのライセンスに従います。
