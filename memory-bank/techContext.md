# 技術コンテキスト

## 使用技術

AIChat VS Code 拡張機能は、以下の主要技術を使用しています：

### コア技術

-   **TypeScript**: 拡張機能とウェブビュー UI の開発に使用
-   **VS Code API**: 拡張機能の機能を実装するための API
-   **React**: ウェブビュー UI の構築に使用
-   **Webview API**: VS Code 内でウェブベースの UI を表示するために使用

### 外部 API

-   **Anthropic API**: Claude AI モデルとの対話に使用
-   **その他の AI プロバイダー API**: OpenAI、Bedrock、Vertex AI など

### ライブラリとフレームワーク

-   **axios**: HTTP リクエストに使用
-   **VS Code Webview UI Toolkit**: VS Code スタイルの UI コンポーネント
-   **react-use**: React フックライブラリ

## 開発環境

### 必要条件

-   **Node.js**: JavaScript ランタイム
-   **npm**: パッケージマネージャー
-   **VS Code**: 開発と拡張機能のテスト

### プロジェクト構造

```
aichat/
├── .vscode/            # VS Code 設定
├── assets/             # アイコンなどの静的アセット
├── src/                # 拡張機能のソースコード
│   ├── core/           # コア機能
│   │   ├── controller/ # コントローラー
│   │   └── webview/    # ウェブビュー関連
│   ├── services/       # サービス
│   ├── shared/         # 共有データ型
│   └── test/           # テスト
├── webview-ui/         # React ウェブビュー UI
│   ├── public/         # 静的ファイル
│   └── src/            # UI ソースコード
│       ├── components/ # UI コンポーネント
│       ├── context/    # React コンテキスト
│       └── utils/      # ユーティリティ
└── memory-bank/        # プロジェクト文書
```

### ビルドプロセス

-   **拡張機能**: TypeScript コンパイラ（tsc）を使用
-   **ウェブビュー UI**: Vite を使用した React アプリケーションのビルド

## 技術的制約

### VS Code 拡張機能の制約

-   サンドボックス環境で実行される
-   限られたリソースとパフォーマンス
-   VS Code API の制限に従う必要がある
-   ウェブビューのセキュリティ制約（CSP など）

### AI API の制約

-   API キーの安全な管理
-   レート制限と使用量の考慮
-   応答時間とパフォーマンス
-   コンテキストウィンドウの制限

### ウェブビュー UI の制約

-   限られた画面スペース
-   VS Code テーマとの統合
-   アクセシビリティ要件

## 依存関係

### パッケージ依存関係

```json
{
	"dependencies": {
		"axios": "^1.8.2"
	},
	"devDependencies": {
		"@types/node": "^10.12.21",
		"@types/vscode": "^1.42.0",
		"typescript": "~5.7.2",
		"tslint": "^5.12.1"
	}
}
```

### ウェブビュー UI 依存関係

-   React
-   React DOM
-   VS Code Webview UI Toolkit
-   Vite（開発サーバーとビルドツール）

## 開発ツール

-   **VS Code**: 主要開発環境
-   **TypeScript**: 型安全な JavaScript 開発
-   **ESLint**: コード品質とスタイルの確保
-   **Prettier**: コードフォーマット

## デプロイメント

-   **VS Code Marketplace**: 拡張機能の公開
-   **VSIX パッケージ**: オフラインインストール用

## 技術的な決定事項

-   **TypeScript の使用**: 型安全性と開発効率のため
-   **React の採用**: コンポーネントベースの UI 開発のため
-   **Webview の使用**: カスタム UI を提供するため
-   **メッセージングパターン**: 拡張機能とウェブビュー間の通信のため
-   **コンテキストプロバイダー**: 状態管理のため
