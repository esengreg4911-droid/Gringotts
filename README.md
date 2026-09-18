<div align="center">
  <img src="favicon.ico" width="72" alt="GRINGOTTS">
  <h1>GRINGOTTS</h1>
  <p>一个安静的双语影视收藏站</p>
  <p>
    <a href="https://www.gringotts04.cc/"><strong>访问 GRINGOTTS →</strong></a>
  </p>
</div>

![GRINGOTTS 影视收藏](assets/readme-cover-strip.jpg)

GRINGOTTS 是一个纯静态的双语影视收藏站，以本地海报为主的响应式作品墙，用来整理和浏览电影与剧集收藏。

## 功能

| | |
| --- | --- |
| **双语界面** | 在中文与 English 之间切换 |
| **实时搜索** | 按中英文片名查找作品 |
| **筛选与排序** | 按类型、电影 / 剧集筛选，并按年份、IMDb 或豆瓣评分排序 |
| **分页浏览** | 支持页码切换与直接跳转 |
| **作品详情** | 点击海报查看作品信息和评分，并跳转 IMDb 或豆瓣 |
| **本地海报** | 海报随站点加载，移动端筛选栏默认收起 |

## 文件说明

```text
├── index.html   # 页面结构
├── style.css    # 响应式样式
├── script.js    # 搜索、筛选、排序、分页与弹窗
├── data.js      # 作品数据
├── covers/      # 本地海报
├── assets/      # README 图片
└── favicon.ico  # 网站图标
```

## 更新作品

在 `data.js` 添加作品数据，并将对应海报放入 `covers/`。四位以下的作品 ID 需在文件名左侧补零至四位，例如 ID `36` 对应 `covers/0036.jpg`；更长的 ID 直接作为文件名。

---

<div align="center">
  联系：<a href="mailto:maox_115@163.com">maox_115@163.com</a>
</div>
