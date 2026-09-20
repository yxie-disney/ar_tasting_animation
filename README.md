# NOTERDAY · 朏朏 AR

## 当前体验

扫现有二维码 → /v3/ → [相机 AR](https://yxie-disney.github.io/ar_tasting_animation/ar/)。
竖立试管、现有二维码领带不变。浏览器授权后，五张原画连续浅浮雕在吊牌前方自动轮播。引擎为 **8th Wall / XR8 1.0.0 + Three.js 0.160.1**，不是 MindAR。

当前优先级是稳定观看已有动画，不重画、不重印、不加手动定位。实体纸模与精确印刷标定留到产品物料阶段。

### 当前丢失处理

- 支持世界定位的移动设备启用 XR8 世界跟踪。短暂丢失图像时，只在持续收到有效 NORMAL 世界位姿时接续，最多 **1500ms**。
- 无可靠世界定位：立即隐藏、暂停；1500ms 内重新识别保留当前帧。不把屏幕上的冻结图像冒充空间定位。
- 超过窗口、页面退到后台或关闭：清理计时器并重置。
- 五帧仍每1000ms硬切，无淡入淡出；容器位置、原图比例、曲面、透明度与全屏保持不变。

这替代了“任何丢失立即结束并从头重播”的旧规则，不代表任何角度都能识别。

## 哪里该看

```text
现有纸上二维码（不换码、不重印）
└─ site/v3/index.html → site/ar/index.html
   └─ site/ar/                        【实际扫码相机体验】
      ├─ app.js                       相机、锚点、动画装配
      ├─ xr8-session.js               设备能力与世界/图像跟踪模式
      ├─ xr8-anchor.js                识别、短暂接续、失效与恢复
      ├─ vertical-stage.js            五角色尺寸、比例、透明度
      ├─ vertical-playback.js         唯一轮播时钟；暂停与重置
      ├─ feifei-surface.js            已验证曲面、共享接缝、动态法线
      ├─ assets/relief/               【看图】实际五角色原PNG
      │  └─ 控制场/ownership/manifest 【纯机器】不必逐个点开
      └─ targets.json + image-targets/【纯机器】定位裁片，不是打印稿

assets/printed-card/                 【实体来源】原印刷母版说明；本轮不改
assets/feifei-layers/relief.html       【本地对比】五角色三状态检查
site/animation/                      【内部预览】同一动画；绝非扫码入口
docs/STAGE.md                        【空间规格】当前坐标与尺度
PROJECT.md                           【工程规范】冲突处理与验收边界
tests/tracking-continuity-verification.md【本轮证据】通过与未实测项
tests/ + tools/ + site/vendor/        【纯机器/工程】测试、构建、依赖
.github/workflows/pages.yml           【纯机器】测试、构建、发布
```

旧横放模块和回归资产不是当前入口依赖，不得拿其参数覆盖竖直舞台。历史决策查 Git，不在本文追加相互覆盖的规格。

## 运行与证据

`npm install --ignore-scripts` → `npm run prepare:local` → `npm test` → `npm run build` → `npm run serve`。

[既有吊牌回放](tests/tie-replay-verification.md)使用授权现场照片和真实 XR8 检测，不调用真实摄像头、不发布照片。它不能验证手机移动时的世界定位、反光和距离。当前尺度来自母版名义印刷尺寸，不冒充实测。

发布须检查 GitHub Pages 成功及线上资源一致；仅本地通过不算手机可验证的交付。
