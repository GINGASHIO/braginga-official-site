# BRAGINGA 公開手順

既存のCloudflare Worker `braginga-official-site` と正式URL `https://braginga.net/` を使用する。`wrangler.jsonc` は配信用ファイルとHTTPS転送だけを定義する。既存ドメイン・ルート・アクセス設定はCloudflare側の設定を保持する。

1. `python3 scripts/render_catalog.py` で一覧を生成し、`python3 scripts/prepare_public.py` で許可したファイルだけを `.build/public` にコピーする。元写真・価格表・ローカルの検証資料は配信に含めない。
2. 一覧・見積もり・表示幅・メール宛先・ビルドを確認し、検証済みのソースを既存GitHubの `main` へ保存する。公開リポジトリにローカルパスや写真の出典台帳を含めない。
3. `wrangler deployments status --name braginga-official-site --json` で現行バージョンを記録。保存したコミットから同じ成果物を生成し、`wrangler versions upload --config wrangler.jsonc --tag <commit> --message <message>` でバージョンを準備する。
4. `wrangler versions deploy <version-id>@100% --name braginga-official-site --yes` で確認済みバージョンへ切り替える。ドメインやルートを編集する操作は行わない。
5. 正式URLで配信内容・HTTPS転送・保護ヘッダー・404と、商品絞り込み・簡易見積もりを確認する。重大な問題が出た場合は、同じ切替コマンドで記録した旧版へ戻す。

`cloudflare/worker.mjs` は `braginga.net` のHTTPだけをHTTPSへ転送し、パスとクエリを保持する。他のリクエストは静的アセットへ渡す。CSPなどは `_headers` で配信する。
