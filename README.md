# MetaStanza Showcase (SPA)

DBCLSが提供する情報可視化コンポーネント **MetaStanza** のシングルページアプリケーション（SPA）ショーケースです。

## 概要

このアプリケーションでは、様々なデータ構造に対応したMetaStanzaの可視化コンポーネントを単一ページで体験できます。ハッシュベースのルーティングにより、リアルタイムでデータタイプを切り替えながら各コンポーネントの機能を確認できます。

## 主な機能

- **シングルページアプリケーション**: 1つのページで全ての可視化タイプにアクセス
- **ハッシュルーティング**: `#matrix`, `#tree`, `#graph`, `#set` でデータタイプを切り替え
- **リアルタイムデータ編集**: CodeMirrorエディタでJSONデータをその場で編集
- **カラースキーム変更**: プリセットまたはカスタムのカラーテーマを適用

## 提供される可視化タイプ

### 📊 マトリックス型 (`#matrix`)
- **状態**: 利用可能
- **対応コンポーネント**: 
  - 円グラフ (Pie chart)
  - 散布図 (Scatter plot)
  - 棒グラフ (Bar chart)
  - 折れ線グラフ (Line chart)
  - ヒストグラム (Histogram)
  - ヒートマップ (Heatmap)
  - ページネーション付きテーブル (Pagination table)
- **データ形式**: 行列データ（CSV、JSON）

### 🌳 ツリー型 (`#tree`)
- **状態**: 利用可能
- **対応コンポーネント**:
  - ツリー図 (Tree Diagram)
  - サンバースト図 (Sunburst Chart)
  - トレマップ (Treemap)
- **データ形式**: 階層構造データ（親子関係を持つJSON）

### 🕸️ グラフ型 (`#graph`)
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
├── index.html              # SPA エントリーポイント
├── app-config.json         # 統一設定ファイル（全データタイプ）
├── color-schemes.json      # カラースキーム定義
├── css/                    # FLOCSS + CSS Layers アーキテクチャ
│   ├── main.css           # メインCSS（レイヤー統合）
│   ├── foundation/        # 基礎レイヤー（変数、ベース）
│   ├── layout/           # レイアウトレイヤー（コンテナ）
│   └── object/           # オブジェクトレイヤー（コンポーネント、プロジェクト）
├── data/                  # 統一データディレクトリ
│   ├── matrix-data.json   # マトリックス型データ
│   ├── tree-data.json     # ツリー型データ
│   ├── graph-data.json    # グラフ型データ
│   └── set-data.json      # 集合型データ
└── js/
    └── main.js            # SPA メインロジック
```

## 使い方

1. ブラウザで `index.html` を開くとSPAが起動します
2. 上部のナビゲーションアイコンをクリックしてデータタイプを切り替えます
3. URL ハッシュ（`#matrix`, `#tree`, `#graph`, `#set`）で直接アクセスも可能です
4. 各データタイプでは以下の操作が可能です：
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

1. `app-config.json`の該当するデータタイプに新しいコンポーネント定義を追加
2. 必要に応じてスクリプトファイルを追加
3. CSSカスタマイズが必要な場合は`css/`ディレクトリ内の該当レイヤーファイルを編集

### 新しいデータタイプの追加

1. `app-config.json`の`dataTypes`オブジェクトに新しいデータタイプを追加
2. `data/`ディレクトリに対応するデータファイルを配置
3. 必要に応じてナビゲーションアイコンとページ判定ロジックを更新

### カラースキームの追加

`color-schemes.json`に新しいカラースキーム定義を追加することで、プリセットカラーパレットを増やすことができます。

## 技術スタック

- **MetaStanza**: 可視化コンポーネントライブラリ
- **CodeMirror**: コードエディタ
- **FLOCSS + CSS Layers**: モダンCSS設計手法
- **Vanilla JavaScript**: SPAフレームワークレス実装
- **Hash-based Routing**: ブラウザルーティング

## 関連リンク

- [MetaStanza GitHub](https://github.com/togostanza/metastanza)
- [DBCLS](https://dbcls.rois.ac.jp/)

## ライセンス

このプロジェクトはMetaStanzaのライセンスに従います。
