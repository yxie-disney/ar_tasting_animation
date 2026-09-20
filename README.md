# NOTERDAY AR — 当前唯一体验

## 扫码观看

现有二维码 `/v3/`、旧 `/ar/` 和站点首页均直接进入 [五帧动画自动播放页](https://yxie-disney.github.io/ar_tasting_animation/animation/)。不申请相机、不等待吊牌定位；这是动画验收阶段，不是空间追踪已完成的声明。原二维码无需更换。

本次提交包含五角色连续曲面数据、23组件切片及验证、共用动画模块和独立观看页。ZIP打包副本与ORA编辑工程仅保留本地，不重复推入Git。下文“本地未部署”是此前阶段记录；实际部署结果以 GitHub Pages 工作流为准。

## 当前 SOT：竖直吊牌（2026-09-19 最新重对齐）

**最新优先级：先完成动画，实体吊牌暂不设计、不索取。** 动画尺寸、曲面、加载和构建均不依赖吊牌。直接看 [五帧动画](http://localhost:8122/animation/)；这不是模拟识别成功，而是同一正式动画模块的独立观看入口。

`site/animation/` 只提供观看相机与播放检查；实际资产/曲面仍由 `site/ar/vertical-stage.js` 创建，时钟仍由 `vertical-playback.js` 管理。角色保留原验证高80mm、原宽高比、总曲面深度≤3mm；不存在“按吊牌90%缩放”。后续 `app.js` 仅在锚点外侧做单位换算与定位，不再决定原画尺寸。制作顺序是动画 → 观看验收 → 设计实体承载物 → 接识别。

**以下旧横放说明已失效。** 实物管竖立；吊牌垂直附于上部；以吊牌中心为原点，+Z 朝向手机。当前本地入口已切到 MindAR，线上尚未更新。

- **运行核心：** `site/ar/app.js` → `vertical-stage.js`（原比例、中心前方、0.75 Alpha）＋ `vertical-playback.js`（识别后每1000ms硬切；丢失立即清除并隐藏）。仅五张朏朏；无背景品鉴卡、横向站位、遮挡圆柱或丢失宽限。
- **保留资产：** 五张原PNG与 `assets/feifei-layers/*/surface/` 的已验证连续曲面控制场。曲面和法线算法不重画、不另造。
- **实体物料：** 暂不作为工作前置。`site/ar/image-targets/vertical-label.json` 保留未配置状态，仅影响未来真机识别适配器，不影响动画入口。
- **本地检查：** `node tools/vendor.mjs` → `node tools/prepare-vertical-assets.mjs` → `node --test tests/*.test.mjs`。测试页 `/_test/vertical.html` 只作工程检查，不发布。
- **构建：** `npm run build` 不检查吊牌即可生成动画。独立的 `npm run check:ar-target` 留给日后真机识别接入，不是本轮动画交付门槛。线上尚未更新。

以下保留为旧阶段记录，不能作为新竖直布局的参数来源。

<details><summary>已弃用：横放品鉴卡阶段记录</summary>

**舞台已由用户实机确认并锁定。** 当前完整虚拟卡的正面范围、在试管后方的站位，以及距相机约30cm的观看空间，就是后续动画的基准。30cm是用户的现场估计，不是根据图片反推的标定值。

先看这里：

1. **实际体验：** [打开 AR](https://yxie-disney.github.io/ar_tasting_animation/ar/)。现有纸上二维码仍有效，无需重印。
2. **实体品鉴卡：** [印刷母版说明](assets/printed-card/README.md)。这是纸上的物料。
3. **当前内容：** 五张现有朏朏＋五张完整品鉴卡，每秒同时换图、朏朏向右跳一格，五秒循环。没有转场或新插画。对应关系见 [五帧清单](site/ar/assets/slides/manifest.json)。
4. **新完成、本地未部署：** [五角色连续浅浮雕对比](http://localhost:8121/relief.html)，顶部切换角色；[全量交付说明](assets/feifei-layers/surface-delivery.md)。23组件已经生成并逐张验证。它与下文“线上现用原图浅浮雕”不是同一个交付状态。

## 按用途看文件

```text
实体：横放试管 + 已打印插画底卡
└─ assets/printed-card/           【人看】完整印刷母版说明、原稿本地保留
    └─ 扫现有二维码 /v3/ → /ar/ 【兼容入口】自动跳转，无旧体验

site/ar/                         当前唯一应用
├─ index.html + style.css         【人看】扫码后的权限/启动提示
├─ assets/slides/                【人看】feifei-1…5.png 是朏朏；card-1…5.png 是背景卡
│  └─ manifest.json              【内容编辑】五帧配对；以后换画只改这里和图片
├─ slideshow.js                 【工程】同一时钟驱动五帧硬切与五个站位
├─ feifei-relief.js              【工程】原画浅浮雕深度分区、局部呼吸、已有金饰微光
├─ feifei-surface.js             【工程/待接入】五角色共用的真实切片连续曲面、动态法线
├─ miaoyinniao-relief.js         【纯机器】旧检查入口兼容导出，无第二套算法
├─ pose-filter.js                【纯机器/工程】共用定位滤波，不另加陀螺仪倾斜
├─ assets/tasting-card/*.webp     【机器/回归】此前已验收静态卡的原图基线
├─ stage.js                      【工程】已锁定的共用舞台；动画也用它
├─ tasting-card.js               【工程】静态卡的3D摆位、双面和遮挡
├─ app.js                        【工程】相机、定位、内容的协调
├─ tracking.js + occupancy.js    【纯机器/工程】状态和有管判断，不必点
└─ targets.json + image-targets/  【纯机器】定位数据；绝不是印刷物

docs/STAGE.md                    【人看】锁定了什么、动画必须遵守什么
assets/feifei-layers/relief.html  【人看/本地】五角色三态对比；不是扫码启动页
assets/feifei-layers/*/surface/  【机器】各角色网格、控制场、组件状态与渲染证据
docs/ANIMATION-WORKFLOW.md       【交接】当前五帧范围；没有外部平台前置要求
PROJECT.md                      【交接】当前任务边界和责任
tests/                          【纯机器/工程】回归检查与本地回放，不发布
tools/                          【纯机器/工程】转换、依赖准备、本地服务
site/vendor/                    【纯机器】构建生成的引擎与许可，不手改
.github/workflows/pages.yml      【纯机器】测试、构建、发布
```

当前实现采用用户指定的五帧硬切 prototype：背景卡的坐标、朝向和尺寸不变；朏朏在试管后、卡片前。内容全部预加载后开始，不加播放按钮。此阶段验证循环和空间关系，不把任意角色/酒款配对当作正式品牌关系，也不以一秒停留满足全文阅读。

朏朏现用**原图浅浮雕**：身体与道具具有最多3个场景毫米的相对厚度，身体局部微动，脚底和整体站位不做前后摇摆。它不是独立切片或完整3D模型；原图没有的遮挡后内容不补画。只有妙音鸟原画的金色饰件启用微光。五张PNG、原有五秒节奏及空间大小未改变。手机上的稳定程度和微动观感仍需实测。

没有并列的版本目录。历史仅在 Git 中；`site/v3/index.html` 是为现有纸上二维码保留的极小跳转文件，不能删除，也不承载旧逻辑。旧布局、概念图和未采用的程序化藤蔓已移除。

## 验证与运行

原稿、比例、方向、站位和现有追踪行为保持不变。用户确认的是当前尺寸与实际观看空间；不扩大为所有手机、所有角度或脱离标记后的稳定性已验收。具体证据见 [验证记录](tests/verification.md)。

工程复现：`npm install --ignore-scripts` → `npm test` → `npm run build` → `npm run serve`。

GitHub main 保存代码和部署；品牌原稿、完整印刷母版、现场照片留在本地。用户不用审核机器文件。

</details>
