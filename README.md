# NOTERDAY AR tasting animation

当前实现：原纸上 `/v3/` 入口 → 相机权限 → 自动图像定位及宽松有管判断 → 藤蔓生长动画。没有手动点选瓶身或确认播放。尚未完成真实手机、微信和移动视角验收。

当前实物基准：**用户已打印的卡片横放、试管平放其上，以用户照片中的自然斜俯视位置扫码和观看**。不重印、不改码、不新增托座或止挡。保留纸上二维码入口 `/v3/`；路径名称不代表恢复旧版本产品。

- 已打印卡片原始PNG/SVG已恢复到本地 `assets/printed-card/`。母版不随站点发布；原文件名保留，当前使用方式为横放。
- [资产与二维码核验记录](assets/printed-card/manifest.json)
- [物料摘要](PHYSICAL-DESIGN.md) / [执行契约](PROJECT.md)

`design/` 中此前的布局、托位和概念图不是当前实施依据；不要求用户审核或打印这些文件。当前实体约束以 `PHYSICAL-DESIGN.md` 为准。

`npm test` 检查状态、目标资源和消费者页面；`npm install --ignore-scripts && npm run build` 准备同源引擎；`npm run serve` 本地运行。GitHub Actions发布 `site/`。私有照片回放仅由本地开发服务器提供，不发布照片或调试页面。

验证范围及未验证项见 [验证记录](tests/verification.md)。原始品牌母版不覆盖、不上传；Git历史可追溯。
