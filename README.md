# NOTERDAY AR — 当前唯一体验

**舞台已由用户实机确认并锁定。** 当前完整虚拟卡的正面范围、在试管后方的站位，以及距相机约30cm的观看空间，就是后续动画的基准。30cm是用户的现场估计，不是根据图片反推的标定值。

先看这里：

1. **实际体验：** [打开 AR](https://yxie-disney.github.io/ar_tasting_animation/ar/)。现有纸上二维码仍有效，无需重印。
2. **实体品鉴卡：** [印刷母版说明](assets/printed-card/README.md)。这是纸上的物料。
3. **动画制作：** [平台选择与第一条植物动画工单](docs/ANIMATION-WORKFLOW.md)。下一步先做风味植物 garnish，不做朏朏。

## 按用途看文件

```text
实体：横放试管 + 已打印插画底卡
└─ assets/printed-card/           【人看】完整印刷母版说明、原稿本地保留
    └─ 扫现有二维码 /v3/ → /ar/ 【兼容入口】自动跳转，无旧体验

site/ar/                         当前唯一应用
├─ index.html + style.css         【人看】扫码后的权限/启动提示
├─ assets/tasting-card/*.webp     【人看】完整原图，当前静态虚拟卡内容
├─ stage.js                      【工程】已锁定的共用舞台；动画也用它
├─ tasting-card.js               【工程】静态卡的3D摆位、双面和遮挡
├─ app.js                        【工程】相机、定位、内容的协调
├─ tracking.js + occupancy.js    【纯机器/工程】状态和有管判断，不必点
└─ targets.json + image-targets/  【纯机器】定位数据；绝不是印刷物

docs/STAGE.md                    【人看】锁定了什么、动画必须遵守什么
docs/ANIMATION-WORKFLOW.md       【人看】去哪个平台、怎么做、带回什么
PROJECT.md                      【交接】当前任务边界和责任
tests/                          【纯机器/工程】回归检查与本地回放，不发布
tools/                          【纯机器/工程】转换、依赖准备、本地服务
site/vendor/                    【纯机器】构建生成的引擎与许可，不手改
.github/workflows/pages.yml      【纯机器】测试、构建、发布
```

当前静态卡仍在线，动画制作期间不替换为占位演示。完成的动画应复用同一个舞台、识别和二维码；通过内容验收后才替换消费者入口。

没有并列的版本目录。历史仅在 Git 中；`site/v3/index.html` 是为现有纸上二维码保留的极小跳转文件，不能删除，也不承载旧逻辑。旧布局、概念图和未采用的程序化藤蔓已移除。

## 验证与运行

原稿、比例、方向、站位和现有追踪行为保持不变。用户确认的是当前尺寸与实际观看空间；不扩大为所有手机、所有角度或脱离标记后的稳定性已验收。具体证据见 [验证记录](tests/verification.md)。

工程复现：`npm install --ignore-scripts` → `npm test` → `npm run build` → `npm run serve`。

GitHub main 保存代码和部署；品牌原稿、完整印刷母版、现场照片留在本地。用户不用审核机器文件。
