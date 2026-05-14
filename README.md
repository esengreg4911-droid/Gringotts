# GRINGOTTS 影视库

> 一个私人影视收藏展示站 

---

## 项目简介 · Overview

**GRINGOTTS** 是一个纯静态网页影视收藏库，无需后端、无需数据库，所有数据内嵌于前端文件中。界面采用深蓝赛博朋克风格，支持中英双语切换、明暗主题切换，并配有星空动态背景与流星特效。



---

## 文件结构 · File Structure

```
/
├── index.html          # 主页面结构
├── style.css           # 全局样式（赛博朋克主题 + 明暗模式）
├── script.js           # 交互逻辑（筛选 / 排序 / 分页 / 弹窗 / 星空动画）
├── data.js             # 全部条目数据（window.DATA 数组）
└── covers/             # 本地海报图片目录
└── favicon.ico         # 网页图标
└── images/             # 网页背景图片目录
```

---

## 功能特性 · Features

### 数据与展示
- **双语条目**：每部作品含中文标题、英文标题、中英文简介
- **双评分徽章**：IMDb 评分（点击直达 IMDb）、豆瓣评分（点击直达豆瓣搜索）
- **海报图片**：读取本地 `covers/` 目录；若本地无对应图片且 TMDB Token 有效，系统会自动通过 TMDB API 查询海报。
- **统计动画**：首屏动态数字滚动显示电影数 / 剧集数

### 交互与筛选
- **实时搜索**：对标题（中英文）、导演、国家全文模糊匹配
- **多维筛选**：按类型（剧情 / 奇幻 / 纪录片 / 侦探 / 科幻）、形式（电影 / 剧集）、语言（9 种）筛选
- **三列排序**：年份、IMDb 评分、豆瓣评分，支持升/降切换
- **分页导航**：每页 21 条，含首/尾页、上/下页、数字页码、跳转输入框

### 视觉与主题
- **赛博朋克深蓝暗色主题**（默认）+ **浅色模式**（一键切换）
- **星空动态背景**：Canvas 绘制星体、闪烁效果、随机流星
- **卡片悬停动效**：放大、金色边框光晕
- **弹窗详情**：点击任意卡片展开详情弹窗，含海报、双语简介、完整元数据

### 访问控制
- **四字母密码锁屏**，输入正确后以分屏动画解锁进入

### 国际化
- **中英双语**界面，点击右上角 `EN` 按钮切换，所有 UI 文字同步变更

---

## 数据格式 · Data Schema

`data.js` 中每条条目为 JSON 对象，字段如下：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | number | 唯一标识，同时对应 `covers/{id}.jpg` |
| `title` | string | 英文标题（剧集季度格式如 `Breaking Bad S3`） |
| `zh` | string | 中文标题 |
| `year` | number | 上映年份 |
| `type` | `"film"` \| `"series"` | 类型 |
| `genre` | string | 类别：`Feature` / `Fantasy` / `Documentary` / `Suspense` / `Science Fiction` |
| `lang` | string | 语言代码：`en` / `zh` / `fr` / `jp` / `ko` / `de` / `it` / `hi` / `es` / `ru` |
| `imdb` | number | IMDb 评分（如 `8.5`） |
| `douban` | number | 豆瓣评分（如 `9.0`） |
| `dir` | string | 导演姓名 |
| `country` | string | 出品国家 |
| `desc_zh` | string | 中文简介 |
| `desc_en` | string | 英文简介 |

**剧集命名约定**：同一剧集的不同季以独立条目存储，标题后缀 ` S1`、` S2` 等。

---

## 本地海报 · Cover Images

脚本在 `script.js` 底部内嵌了一份 `LOCAL` 映射表，将条目 ID 对应到 `covers/` 目录下的图片路径。若本地无对应图片且 TMDB Token 有效，系统会自动通过 TMDB API 查询海报。

```
covers/
├── 0001.jpg    → id: 1  (The Shawshank Redemption)
├── 10101.jpg   → id: 10101 (剧集第 101 集/季)
└── ...
```

> **注意**：`FETCH_CONCURRENCY` 默认设为 `0`（禁用 TMDB 实时拉取）。如需启用，在 `script.js` 中将其改为 `3`~`5` 并确保 Token 有效。

---

## 修改与维护 · Editing

### 添加新条目

在 `data.js` 的 `window.DATA` 数组末尾追加对象：

```js
{
  "id": 99999,
  "title": "Dune: Part Two",
  "zh": "沙丘：第二部",
  "year": 2024,
  "type": "film",
  "genre": "Science Fiction",
  "lang": "en",
  "imdb": 8.5,
  "douban": 8.1,
  "dir": "Denis Villeneuve",
  "country": "USA",
  "desc_zh": "保罗·厄崔迪联合弗雷曼人，向哈克南家族展开复仇之战。",
  "desc_en": "Paul Atreides unites with the Fremen to seek revenge against those who destroyed his family."
}
```

然后将海报命名为 `99999.jpg` 放入 `covers/` 目录，并在 `script.js` 的 `LOCAL` 映射表中加入 `"99999": "covers/99999.jpg"`。

### 修改密码

在 `script.js` 顶部找到：

```js
var C = ["S", "E", "C", "C"];
```

将数组改为目标密码的各字母，如 `["G","O","L","D"]`。

### 修改联系邮箱

在 `index.html` 的 About 弹窗中找到 `<a href="mailto:...">` 标签，替换为实际邮箱地址。

---

## 技术栈 · Tech Stack

- **纯原生** HTML + CSS + JavaScript，零框架依赖
- **Canvas API**：星空 / 流星动画
- **TMDB API**（可选）：动态补全缺失海报
- **Google Fonts**：Rajdhani · Share Tech Mono · Cinzel Decorative
- 字体通过 `fonts.font.im` 镜像加载（适合国内访问）

---

## 部署 · Deployment

本项目目前部署于 阿里云 (Aliyun)。作为一个纯静态站点，它也可以灵活迁移至其他平台：
- **阿里云 (OSS + CDN)**：当前生产环境方案。通过 OSS 存储静态资源，结合 CDN 加速实现快速访问。
- **GitHub Pages**：推送至仓库后在 Settings → Pages 中启用即可
- **Vercel / Netlify**：直接拖入文件夹或连接仓库，一键部署
- **本地预览**：用任意 HTTP 服务器启动（直接双击 `index.html` 可能因跨域限制导致 `data.js` 加载失败）

```bash
# 本地快速预览（Python）
python3 -m http.server 8080
# 然后访问 http://localhost:8080
```

---

## 许可 · License

本项目为个人收藏展示用途，不包含任何版权内容。影视简介数据仅供个人参考。
