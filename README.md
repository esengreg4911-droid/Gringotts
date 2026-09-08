# GRINGOTTS

一个纯静态的双语影视收藏站。以本地海报为主的响应式作品墙，可直接在浏览器中打开使用。

## 功能

- 中文 / English 界面切换
- 按中英文片名实时搜索
- 按类型、电影 / 剧集筛选，并按年份、IMDb 或豆瓣评分排序
- 分页浏览与页码跳转
- 点击海报查看作品信息、评分，并跳转 IMDb 或豆瓣
- 本地海报加载；移动端筛选栏默认收起

## 运行

无需安装依赖，直接打开 `index.html` 即可。

如需通过本地服务器预览：

```bash
python -m http.server 8000
```

随后访问 `http://localhost:8000`。

## 文件说明

```text
├── index.html   # 页面结构
├── style.css    # 响应式样式
├── script.js    # 搜索、筛选、排序、分页与弹窗
├── data.js      # 作品数据
├── covers/      # 本地海报
└── favicon.ico  # 网站图标
```

## 更新作品

在 `data.js` 添加作品数据，并将对应海报放入 `covers/`；随后在 `script.js` 的 `LOCAL` 映射中登记作品 ID 与海报路径。

联系：maox_115@163.com
