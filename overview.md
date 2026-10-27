# 交付说明 · 句乐场（julebu.co 核心玩法复刻）

## 做了什么

用 REA 逆向 `https://julebu.co/`，把它的核心学习闭环复刻成一个零依赖、零构建的网页应用，并跑通了端到端验证。

## 逆向是怎么做的

REA 6.8.0 的 Web 工具链（WSL + headless Chrome + CDP）：

1. `list-browser-targets` 找到页面 target
2. `inspect-web-page` 被动抓 DOM / 资源 / 存储 / 响应形状 → 判定为 Nuxt 3 SPA
3. `analyze-web-bundle --view javascript-routes` 静态重建出 **154 条路由候选**，定位核心玩法路由 `/game/course/:coursePackId/:id`
4. `capture-web-screenshot` 取真实界面，并从落地页 `hero-game-preview.webp` / `combo-system.webp` 采样配色
5. 站内 `/docs/guide-*` 是完整功能文档，直接给出连击档位、Perfect/Great 判定、SSS 评级、SRS 规则的原文

**关键发现**：机制不用猜。`/docs/guide-combo` 明写了「3 次 +10%、5 次 +20%、7 次 +30%、10 次 +50%、15 次 +80%、20 次翻倍」，`/docs/guide-review` 明写了间隔与毕业机制。

## 交付内容

| 文件 | 说明 |
| --- | --- |
| `index.html` | 应用外壳 |
| `src/core/typing.js` | 逐词输入判定引擎（Perfect / Great / 普通 / 跳过） |
| `src/core/scoring.js` | 连击加成、得分、C→SSS 评级 |
| `src/core/srs.js` | 间隔重复调度（1→180 天、毕业、复活） |
| `src/core/speech.js` / `sfx.js` | Web Speech 发音 / WebAudio 合成音效 |
| `src/data/courses.js` | 课程包集合：8 个包 · 20 节课 · 97 句 |
| `src/data/packs-extra.js` | 拓展包：教材同步 / 旅行 / 职场 / 四六级（题材参考 /mall 商城分类） |
| `src/data/vocab.js` | 词汇拓展包：6 节课 / 30 句（源自 `/learn` 逆向资源） |
| `src/views/*` | 首页、练习、结算、复习本、学习档案 |
| `test/engine.test.mjs` | 17 个用例的核心逻辑 + 内容完整性测试 |
| `docs/learn-resources.json` | `/learn` 全量词汇资源存档（30 分类 · 1022 词） |
| `README.md` | 逆向过程、规则说明、运行方式、未实现清单 |

## 验证结果

- `node --test test/engine.test.mjs` → **17/17 通过**（含课程包结构校验，防止加包漏字段）
- CDP 端到端：模拟键盘打完《课堂用语》5 句 → 结算 `SSS / 2,810 分 / 5 完美 / 最大连击 5`，控制台 **0 报错**
- 逐屏截图核对了首页、输入中、连击弹窗、听写模式、结算面板、复习本、学习档案、8 个课程包布局

## 这一轮修的两个坑

- **结算闪退**：最后一句按 Enter，同一个事件先 `next()→showResult()` 开面板，又冒泡到全局 handler 命中「结算层里 Enter = 重开」，面板被立刻关掉、进度归零。修法：输入框分支 `stopPropagation()` + `showResult()` 幂等保护。
- **长句孤行**：11 词句最后一个词单独掉行。改成按实测总宽自动微缩字号（收敛到一行，下限 68%），一行放得下就绝不折行。

## 与原站商城的差异

原站 `/mall` 需要登录（未登录跳 `/login` + 微信扫码），课程数据抓不到，因此**没有直接搬运商城的课程内容**：题材分类按站内帮助文档的描述对齐（教材同步 / 四六级 / 商务 / 旅行 / 日常），句子与逐词标注由 AI 编写。商城里的免费试学、会员解锁、社区课程、求课程等机制未实现。

## 与原站的差异

未实现：账号与云同步、AI 英语老师、编辑端（导入课文自动拆句）、口语测评（ASR）、听力三阶段、视频/音乐课程、学伴组队与排行榜、会员支付。

数据全部存 localStorage，不需要任何后端。

## 下一步可做

1. 接 LLM 做「为什么这里用 in 不用 on」的即时答疑
2. 编辑端：粘贴一段英文 → 自动分词 + 音标 + 释义 + 语块切分
3. 口语测评：MediaRecorder + ASR 打分，接到同一套 SRS
4. 发布成在线链接（可直接部署为静态站点）
