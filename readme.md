# phonetic-code-trainer

NATOフォネティックコード（アルファベット通信用コード）の暗記およびタイピングトレーニングをWebブラウザ上で行えるインタラクティブアプリケーション。

## 概要

アルファベット単体および英単語の連続フォネティックコードを効率的に学習するためのトレーナー。レーベンシュタイン距離を用いたタイポ許容アルゴリズムおよび適応型出題重み調整システムを備えています。

## 仕組み

- 言語: TypeScript
- フレームワーク: React 19
- 状態管理: Jotai
- UI / アニメーション: Framer Motion / Lucide React
- スタイリング: Tailwind CSS
- ビルドツール: Vite
- パッケージマネージャー: pnpm
- コード品質管理: Biome / Knip / Storybook
- フォント: Zen Maru Gothic

### 構造

```text
phonetic-code-trainer
├── index.html                  - WebアプリのエントリHTML (タイトル: phonetic-code-trainer)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── biome.json                  - LinterおよびFormatterの設定
├── knip.json                   - デッドコード・未利用依存関係検出の設定
├── .gitignore
├── readme.md
├── .storybook/                 - Storybookの設定
└── src/
    ├── main.tsx                - Reactアプリケーションエントリポイント
    ├── App.tsx                 - ルートコンポーネントおよび画面遷移管理
    ├── index.css               - Zen Maru Gothicフォント読み込みおよびTailwind CSS設定
    ├── types/
    │   └── index.ts            - データ構造・判定ステータス等のTypeScript型定義
    ├── constants/
    │   ├── natoAlphabet.ts     - NATOフォネティックコード対応表データ
    │   └── practiceWords.ts    - 実践練習用英単語リストおよび出題アルゴリズム用パラメータ
    ├── utils/
    │   ├── levenshtein.ts      - 文字列正規化およびレーベンシュタイン距離（編集距離）計算関数
    │   └── practiceCalculator.ts - 単語入力の動的計画法（DP）による最適分割および各文字判定関数
    ├── store/
    │   └── atoms.ts            - Jotaiを用いた出題重み・正誤統計・表示モードの状態管理
    ├── components/
    │   ├── Navbar.tsx          - アニメーション付きナビゲーションバー
    │   ├── QuizView.tsx        - 単文字クイズ画面
    │   ├── PracticeView.tsx    - 単語実践練習画面
    │   └── AlphabetListView.tsx - フォネティックコード一覧および正解率統計表示
    └── stories/                - Storybook用コンポーネントストーリーズ
```

## 実行方法

| コマンド | 実行内容 |
| -- | -- |
| `pnpm install` | パッケージのインストール |
| `pnpm dev` | 開発サーバーの起動 |
| `pnpm build` | プロジェクトのビルド |
| `pnpm preview` | ビルド成果物のプレビュー表示 |
| `pnpm check` | Biomeによるリント・フォーマットチェック |
| `pnpm format` | Biomeによるコード自動フォーマット |
| `pnpm knip` | 未使用ファイルおよびデッドコードの検出 |
| `pnpm storybook` | Storybook開発サーバーの起動 |
