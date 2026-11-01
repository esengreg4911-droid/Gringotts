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

所有作品的网址自动根据英文片名生成，例如 `/the-wire`、`/the-wire-season-2`，不需要为每部作品创建文件夹。
原来的 `?work=作品编号` 不再作为作品入口使用。

`work-routes.js` 自动建立作品编号与片名路径的对应关系；`vercel.json` 将单层作品路径交给根目录的 `index.html`。
首页通过 `<base href="/">` 加载根目录资源；作品地址可直接打开和刷新，浏览器前进后退保持正常。
图片、JS、CSS 及嵌套路径不匹配作品路径规则。

当前自定义域名由 Vercel 托管，需要将 `vercel.json` 一同提交。GitHub Pages 不执行该重写配置。
新增作品只需更新 `data.js`；不再运行入口页生成脚本。

验证路由：

```powershell
node scripts/test-work-routes.cjs
```


## 《火线》人物地图

《火线》五季作品详情页显示“人物地图”按钮，进入站内 `/the-wire/atlas/`。
地图完整文件、图片和来源说明存放在 `the-wire/atlas/`；独立加载自己的样式和数据，通过固定基础路径兼容无尾斜杠网址。
观看进度由当前域名的浏览器本地存储保存。


### 人物地图语言

地图左侧的 EN / 中文按钮切换界面语言，并在浏览器中记住选择。
导航、筛选、人物身份与介绍、关系标签与依据、图片及资料来源说明均支持中英文。
中文原始数据保留在 `the-wire/atlas/data.js`，英文译文随站点存放在 `the-wire/atlas/i18n-en.js`；运行时无需在线翻译服务。
切换语言保留观看进度、筛选、搜索和当前人物。
新增或修改中文资料时，应同步更新英文词典。
双语交互检查见 `scripts/test-atlas-i18n.cjs`，开发测试需要 linkedom（不属于网站运行依赖）。
