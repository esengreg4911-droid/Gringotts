<div align="center">
  <img src="favicon.ico" width="72" alt="GRINGOTTS">
  <h1>GRINGOTTS</h1>
  <p>一个安静的双语影视收藏站</p>
  <p>
    <a href="https://www.gringotts04.cc/"><strong>访问 GRINGOTTS →</strong></a>
  </p>
</div>

![GRINGOTTS 影视收藏](assets/readme-cover-strip.jpg)

GRINGOTTS 是一个纯静态的双语影视收藏站，以本地海报为主的响应式作品墙，用来整理和浏览电影与剧集收藏。页面主体居中显示，桌面端每行展示 6 部作品，每页 12 部。

## 功能

| | |
| --- | --- |
| **双语界面** | 在中文与 English 之间切换 |
| **实时搜索** | 按中英文片名查找作品 |
| **筛选与排序** | 按类型、电影 / 剧集筛选，并按年份、IMDb 或豆瓣评分排序 |
| **分页浏览** | 桌面端每页两行共 12 部作品，支持页码切换与直接跳转 |
| **作品详情** | 点击海报进入详情页，查看双语简介、资料来源及 IMDb、豆瓣评分 |
| **双语简介** | 英文简介取自 TMDB，中文译文保留人物等专名，并使用常见地名与机构的通行译名 |
| **本地海报** | 海报随站点加载，移动端筛选栏默认收起 |

## 文件说明

```text
├── index.html                # 页面结构
├── style.css                 # 响应式样式与居中页面布局
├── script.js                 # 搜索、筛选、排序、分页与详情页
├── data.js                   # 作品基础数据
├── descriptions.js          # 原有中英文简介与来源
├── tmdb-descriptions.js     # 页面使用的 TMDB 双语简介
├── tmdb-en-results.json     # TMDB 英文简介原始结果
├── tmdb-zh-results.json     # 中文翻译及专名保护结果
├── scripts/                  # TMDB 获取、翻译和生成脚本
├── covers/                   # 本地海报
├── assets/                   # README 图片
└── favicon.ico               # 网站图标
```

## 更新作品

在 `data.js` 添加作品数据，并将对应海报放入 `covers/`。四位以下的作品 ID 需在文件名左侧补零至四位，例如 ID `36` 对应 `covers/0036.jpg`；更长的 ID 直接作为文件名。

如需重新获取并生成 TMDB 简介，在 `.env.local` 中配置 `TMDB_READ_ACCESS_TOKEN`，然后依次运行：

```powershell
node scripts/fetch-tmdb-en.js
node scripts/translate-tmdb-zh.js
node scripts/build-tmdb-en.js
```

生成脚本会保留英文原文，并在中文译文中使用常见地名、历史事件和机构的中文通行译名。

---

<div align="center">
  联系：<a href="mailto:maox_115@163.com">maox_115@163.com</a>
</div>


## 作品地址

作品使用英文片名路径，例如 `/the-wire`、`/the-wire-season-2`。
原来的 `?work=作品编号` 不再作为作品入口使用。

`work-routes.js` 负责作品编号与路径的对应；`scripts/build-work-pages.js` 根据首页模板生成各作品目录中的 `index.html`。
这些入口页通过 `<base href="../">` 共用根目录资源，直接打开、刷新和浏览器前进后退均使用相同的作品路径。
静态服务器可能先将 `/the-wire` 重定向到 `/the-wire/`，页面加载后会统一为无尾斜杠形式。

新增作品或修改根目录 `index.html` 后运行：

```powershell
node scripts/build-work-pages.js
```

本地预览请通过 HTTP 服务访问，例如 `python -m http.server 8000`，然后打开 `http://localhost:8000/`。
