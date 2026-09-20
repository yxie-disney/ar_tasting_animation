# 妙音鸟：连续浅浮雕控制逻辑

先看 http://localhost:8121/relief.html 。启动：`node tools/serve-feifei-layers.mjs`。
这是本地核心逻辑验证，不是手机线上部署。原五秒轮播、线上材质、原卡、打印二维码均未变更。

## 入口与实际变更

- 核心模块：`site/ar/miaoyinniao-relief.js`，`createMiaoRelief(THREE, { source, ownership, field, renderer })`。
- 控制场：`buildSharedField` 从既有五张切片的像素归属计算，不用粗椭圆重新猜切口。
- 实际载入与三个对比场景：`assets/feifei-layers/relief-preview.js`。
- 原五组件：台座、翅膀、身体、酒管、双手。仍可独立隐藏、替换材质；不独立前后移动。
- PNG 导出缺失时，`python tools/restore-miao-cuts.py` 从现存 `.ora` 无损恢复五张导出；不覆盖不同内容、不重画。

## 位移与动态法线

共同表面：`P(u,v,t) = ((u−.5)W, (v−.5)H, h(u,v,t))`。

`h = 静态场 + 呼吸权重 × sin(2πt / 3.6)`。

五张相同拓扑的网格共享同一控制纹理、时间、顶点函数；所有片的平移 Z=0。控制场距切缝 0 处深度和呼吸归零，6mm 内 smoothstep 过渡到内部隆起。它不是五个独立凸壳互相压住，也不借用没有画出来的隐藏面。

| 组件 | 静态峰值预算 mm | 呼吸峰值预算 mm |
|---|---:|---:|
| 台座 | 0.25 | 0 |
| 翅膀 | 1.30 | ±0.10 |
| 身体 | 2.50 | ±0.28 |
| 酒管 | 1.70 | 0 |
| 双手 | 1.70 | 0 |

这是控制上限，狭窄区域会因距切缝不足而达不到峰值。量化后实际总上限 2.788235mm，保留余量，不把呼吸加到 3mm 之外。脚底、手/管切缝固定；整体没有深度呼吸、缩放或 billboard。

顶点着色器对同一高度函数做中心差分，得到 `dh/dx, dh/dy`，更新 `objectNormal = normalize(-dh/dx, -dh/dy, 1)`，然后交给 Three.js 原有 `normalMatrix` 转为视图空间。改变法线矩阵本身不能代替这个步骤。

材质：`MeshStandardMaterial`，roughness=1、metalness=0。固定于舞台的白色 DirectionalLight 强度0.65，加白色 AmbientLight 2.4；不跟随相机、不改变原图纹理文件、不增加金光、烟雾或折射。颜色会有真实光照调制，不声称渲染后 RGB 与原稿完全相同。

## 接缝采样

五片分别用全分辨率互斥像素归属进行 fragment discard；颜色和原始 alpha 共享原图纹理。透明域也只归属一个组件，保留原图的滤波边缘。避免两片透明边缘反复 alpha 混合造成裂缝。

这不是完整原图在背后垫底：任何一个原稿像素只由一个组件绘制。用于检查的“整幅连续参考面”只在离屏对照时临时存在，不与切片同时可见。

## 空间合同与未完成范围

- 角色高度80mm；纸面 +X 为远侧、+Z 为上方；角色局部 +Z 朝观看者。
- 纸面 X=34.75mm，脚底 Z=35mm；最前端 X≥31.961765mm，仍在管半径14.5mm的远侧。
- 卡片目标宽=216×4/5=172.8mm、等比高=381.9465mm、纸面X=55mm。此模块记录合同，不擅自替换当前线上 STAGE。
- 原工程 `tasting-card.js` 已有 colorWrite=false、depthWrite=true 的已知位置圆柱遮挡体；本轮保留，未新造一套。接入曲面后仍须手机检查遮挡对齐；它不是实时识别任意移动的真实试管。
- 当前验证范围是前方至左右46°。背部未建模，不能宣称真实体积；五秒轮播中一秒只看到呼吸的一段，也不能冒称完整角色表演。

## 证据而非保证

检查页包含：−46/−30/0/30/46° × −1/0/+1 呼吸相位，比较五组件输出与相同形变的连续参考面，256×320 离屏像素对照。并比较呼吸两端真实帧差，防止仅更新变量而无画面变化。

它验证组件没有额外渲染接缝，不验证完整侧身重建、真实手机追踪、30cm观看下的主观动效强度。那些仍属于下一次真机场景验收。

单元测试：`node --test tests/miaoyinniao-relief.test.mjs`。全量：`node --test tests/*.test.mjs`。

技术依据：[Three.js MeshStandardMaterial](https://threejs.org/docs/pages/MeshStandardMaterial.html) 提醒位移本身不会重算法线；这里在顶点着色器中显式处理，且已用仓库 r160 shader chunks 验证。
