# cat_fortune_csv_exports

本文件夹由 `《猫猫占卜》PRD_0421.md` 与 `《猫猫占卜》PRD_0424.md` 生成，用于 `cat-fortune-v2` 的 CSV 内容源。

原则：
- 只抽取 `.md` 中明确出现的信息。
- 对 `.md` 没有明确提供的字段，不编造；留空并用 `not_provided_in_md` / `needs_manual_review` 标记。
- `Q01~Q40` 作为内部 ID 保留，前台不应显示编号。
- `cat_fortune_v1_seed_issues.csv` 提供 0421 V1 已实现的 5 个“心结”入口，可用于避免当前版本直接展示 40 个食物/问题。

推荐 Codex 编译顺序：
1. 读取 `cat_fortune_issue_master_full.csv` 作为 issue 主表。
2. 优先用 `cat_fortune_v1_seed_issues.csv` 渲染默认入口。
3. 用 `cat_fortune_recipes_and_half_success_hints.csv` 做判定和半成功反馈。
4. 用 `cat_fortune_success_wisdom.csv` 做成功反馈。
5. 用 `cat_fortune_nonsense_slips.csv` 做不成功废话签。
6. 用 `cat_fortune_issue_taxonomy_review.csv` 作为未来人工补分类的表，而不是让模型自动猜。
