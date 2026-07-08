# gemini-autoresearch (Japanese - 日本語)

<div align="center">
<img src="../../images/banner.png" width="1200" alt="gemini-autoresearch banner">
</div>

> Gemini CLI を永続的な自律改善エンジンに変えます。
> 目標を設定。離れる。結果と共に目覚める。

これは 'Gemini CLI' と 'Antigravity IDE' のスキルであり、測定可能な結果を伴うあらゆるタスクで自律的に反復します。

---

## 仕組み (How it works)

1. **目標設定**: 改善したい内容を説明します。
2. **スコープ (Scope)**: 変更を許可するファイルを指定します。
3. **指標 (Metric)**: 最適化したい数値。
4. **検証 (Verify)**: 結果を測定するコマンド。
5. **ガード (Guard)**: 他の機能が壊れていないかを確認するコマンド。

---

## インストール (Install)

```bash
git clone https://github.com/supratikpm/gemini-autoresearch.git
cp -r gemini-autoresearch/skills/autoresearch .agents/skills/autoresearch
```

詳細はメインの [README.md](../../README.md) を参照してください。
