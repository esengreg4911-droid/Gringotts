<div align="center">

# 🏛️ GRINGOTTS

**双语影视收藏馆**
*A bilingual film & series collection*

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](#)
[![No Build](https://img.shields.io/badge/build-none-success)](#)

<samp>100 部电影 · 295 部剧集 · 5 大类别 · 中英双语</samp>

</div>

---

## ✨ 项目简介

GRINGOTTS 是一个纯静态的影视收藏展示站点，界面精致且完全响应式。它以卡片网格的形式陈列精选的电影与剧集，支持中英双语切换、多维筛选、实时搜索、评分展示与详情弹窗。

无需任何构建工具，无需后端服务，直接打开 `index.html` 即可运行。

## 🎬 功能特性

| 功能 | 说明 |
| --- | --- |
| 🌏 **双语切换** | 一键在中文 / English 之间切换，标题、简介、标签全部同步 |
| 🔍 **实时搜索** | 支持按中文名或英文名即时检索 |
| 🎚️ **多维筛选** | 按类型（剧情 / 奇幻 / 纪录片 / 侦探 / 科幻）、形式（电影 / 剧集）、语言过滤 |
| ↕️ **智能排序** | 按年份、IMDb、豆瓣评分升降序排列 |
| 📄 **分页浏览** | 页码导航、首尾跳转、页码直达，每页 21 部 |
| 🖼️ **本地封面** | 全部海报存放于 `covers/`，按条目 ID 直接读取，无外部请求 |
| 💳 **详情弹窗** | 展示导演、年份、语言、国家、双语简介与外链评分 |
| 🔗 **评分外链** | 一键跳转 IMDb 与豆瓣对应页面 |

## 📂 项目结构

```
Gringotts/
├── index.html      # 页面骨架与布局
├── style.css       # 简约风格
├── script.js       # 渲染、筛选、排序、分页、封面加载逻辑
├── data.js         # 影视数据（window.DATA 数组）
├── covers/         # 本地封面图 
├── images/         # 站点图片资源
└── favicon.ico     # 站点图标
```

## 🚀 快速开始

由于是纯静态站点，任选一种方式即可：

**方式一：直接打开**

```
双击 index.html
```

**方式二：本地服务器**（推荐，避免跨域限制）

```bash
# Python 3
python -m http.server 8000

# 或 Node.js
npx serve
```

然后访问 `http://localhost:8000`。

## 🗂️ 数据格式

所有影视条目存放在 `data.js` 的 `window.DATA` 数组中，每一项结构如下：

```js
{
  "id": 1,                       // 唯一 ID，同时对应本地封面文件名
  "title": "The Shawshank Redemption",  // 英文名
  "zh": "肖申克的救赎",           // 中文名
  "year": 1994,                  // 年份
  "type": "film",                // film | series
  "genre": "Feature",            // Feature | Fantasy | Documentary | Suspense | Science Fiction
  "lang": "en",                  // 语言代码：en/fr/it/hi/jp/de/ko/es/ru
  "imdb": 9.3,                   // IMDb 评分
  "douban": 9.7,                 // 豆瓣评分
  "dir": "Frank Darabont",       // 导演
  "country": "USA",              // 国家/地区
  "desc_zh": "……",              // 中文简介
  "desc_en": "……"               // 英文简介
}
```

### 新增一部作品

1. 在 `data.js` 中追加一条记录（`id` 需唯一）并在最后填入IMDB的ID；
2. 将封面图放入 `covers/`，并在 `script.js` 的 `LOCAL` 映射中登记 `id → 文件路径`（如 `"36": "covers/0036.jpg"`）；
3. 刷新页面即可。

## 🎨 主题定制

配色通过 `style.css` 顶部的 CSS 变量集中管理。修改 `:root` 与对应主题块中的变量即可整体换肤：

```css
:root{
  --acc:#38d4f5;    /* 主强调色（青） */
  --gold:#f4a261;   /* 次强调色（金） */
  --bg:#020c1b;     /* 背景 */
}
```

## 🛠️ 技术栈

- **纯原生三件套**：HTML + CSS + Vanilla JavaScript，零依赖、零构建
- **本地封面**：全部海报随仓库分发，运行时无任何外部网络请求
- **字体**：Rajdhani / Share Tech Mono / Cinzel Decorative

## 📬 联系方式

如有任何问题或意见，欢迎通过邮箱联系：**13661764524@163.com**

---

<div align="center">
<sub>Built with a passion for cinema · 用对电影的热爱构建</sub>
</div>
