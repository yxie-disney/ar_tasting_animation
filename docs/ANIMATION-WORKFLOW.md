# 风味植物 garnish：制作路线与第一条动作工单

## 选择已经完成

用户选择先做风味植物，不做朏朏。舞台已锁定：[STAGE.md](STAGE.md)。**制作目标是能从不同角度看的真实三维植物和动作，不是把一段生成视频贴在卡片上。**

路线：**一件可用的植物模型 → Blender精确动作 → 带动画的GLB → 已锁定的AR舞台。** 不强制先花时间生成MP4；MJ/Linkfox仅在需要比较动作气质时作可选参考。当前静态卡保持在线，不以试制模型替换正式入口。

首个内容单元定为：**一簇草莓枝叶缓慢舒展，叶片先后展开，果实随枝条小幅回弹，最后安静微动。** 这是可作为最终garnish一部分复用的资产，不是临时方块或满屏食材公转。甜椒、丁香、林地气息后续按构图加入，不在第一次生成里揉成一团。

## 工具选择：按交付能力，不按“免费”宣传

2026-09-19核查官方资料：

| 工具 | 适合本项目哪一步 | 费用与边界 | 本次选择 |
| --- | --- | --- | --- |
| Blender | 组织模型、精确关键帧、材质、导出GLB | 真正免费，可商用；桌面软件，不是网站，也不会替你自动完成美术 | **最终制作与交付工具** |
| Meshy | AI生成可旋转的植物初模 | 可免费试生成；当前Meshy6/7模型免费档不能下载。不要生成很多以后才发现导出收费 | **可选的初模加速器，先预览，再决定是否购买导出权限** |
| MJ / Linkfox | 风格图、短动作参考视频 | 你已有订阅；视频不是可编辑三维模型 | 不作为必经步骤 |
| Mixamo | 已有双足人形角色的绑定/预设动作 | 免费，但不适合植物；官方还列出中国地区账号限制 | 当前不用 |
| Tripo免费档 | 预览AI模型 | 官方说明免费档未授予商用权，品牌项目不能直接采用 | 当前不用 |

“有免费网页”不等于“能免费交付商用三维资产”。本轮没有找到足以推荐为一站式、免费、可控植物动画交付的网页替代品。**只接受零新增软件费用时，用Blender和自有/许可允许的模型；建模与动画劳动仍存在。** 不要求现在购买任何新订阅。

来源：[Blender许可](https://www.blender.org/about/license/)；[Meshy下载限制](https://help.meshy.ai/en/articles/10421033-why-can-t-i-download-my-model)；[Mixamo范围](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html)；[Tripo商用规则](https://www.tripo3d.ai/help/privacy-policy/how-to-use-tripo-models-commercially)。MJ的官方视频交付是MP4，见[视频说明](https://docs.midjourney.com/hc/en-us/articles/37460773864589-Video)；Linkfox的[图转视频](https://wiki.linkfox.com/creative/image-to-video)用于短视频，不据此推断有带骨骼GLB输出。

## 第一步：只做一个植物模型，不做完整AR场景

如果希望先用AI降低建模工作量：

1. 打开 [Meshy](https://www.meshy.ai/)。第一次只试一件资产，不付费、不批量生成。
2. 有**已确认的单主体植物图**时，进 **3D Model → Image to 3D**；上传单件参考，关闭Image Enhancement以减少主动改图。不要上传整张品鉴卡、试管照片、二维码，或未选定的品牌IP文件夹。
3. 暂无单件参考时，用 **Text to 3D** 做下述结构初稿。它只负责提出模型，不代表美术已经批准。优先实时模型/Smart Topology选项；若账号没有这个选项，不付费解锁来凑流程。
4. 先在三维预览中拖动看正面、侧面、背面。检查有没有纸片背面、粘连叶片、错误果梗或融化形状。**只看正面截图不算通过。**
5. 把预览链接或正侧背截图带回；我先检查资产结构和舞台适配。通过且你接受导出费用后才购买下载权限，选择GLB或带贴图FBX。不要交STL。
6. 若两次生成仍是不可编辑的一团网格，停下生成，改由三维美术做分件/重拓扑；不让你反复换prompt抽奖。

初模提示词（单一资产，不含动画）：

> A single elegant strawberry sprig for a premium wine-aroma AR garnish. One slender gently curved stem, three distinct serrated strawberry leaves, one small white flower and one ripe red strawberry on its own pedicel. Painterly watercolor-inspired colors with clear three-dimensional volume, fresh leaf greens and restrained ruby red. Clean separated leaf silhouettes, readable from front, side and back. No pot, ground, vase, bottle, card, lettering, logo or background geometry. No extra fruits. Not a flat illustration and not a dense tangled bush.

这不是保证细节/拓扑的咒语。特别是“分件”和“水彩感”必须在生成物上检查。现有完整品鉴卡只作色彩/身份参考，不能让模型改写它。参考[Meshy图生3D操作](https://docs.meshy.ai/en/webapp/image-to-3d)。

## 第二步：Blender中的精细动作，不调用人形预设跳舞

从 [Blender官网](https://www.blender.org/download/) 下载官方稳定版即可，不需要插件或订阅。先保存一份源工程。**没有合格模型时不要从默认立方体开始凑动效。**

模型准备的技术门槛由我/三维制作人员负责：

- 主茎、各叶片、果实至少能被分别控制，叶片转轴在叶柄连接处；果实枢轴在果梗上。若是单一粘连网格，先分件/绑定，不让你盲调。
- 一个总根节点承载整件资产；不动画这个根节点的世界位置。
- 轻微弯曲用少量骨骼或形变，叶片/果实用局部旋转。不要把“长出来”实现成整个模型从零缩放成大团。
- 第一条动作为单一8秒时间线，30fps，关键姿态见下。幅度是制作起点，受整体构图约束；不是生图模型的逐帧保证。

| 帧 / 时间 | 精确动作意图 |
| --- | --- |
| 1 / 0s | 茎和果实已存在，叶片轻收拢，整体静止；不从瓶内冒出 |
| 31 / 1s | 第一片叶由收拢角向展开姿态开始旋转；枝根不动 |
| 43 / 1.4s | 第二片叶开始，较第一片延迟0.4s；避免全体同步 |
| 55 / 1.8s | 第三片叶开始，枝梢轻微舒展；果实不独立漂浮 |
| 91–115 / 3–3.8s | 三片叶依次完成展开；各自持续2秒，不同步结束 |
| 121 / 4s | 到达主要展示姿态，叶片可有约2°的小幅回弹 |
| 151 / 5s | 稳定到展示姿态，果梗与果实连接关系不变 |
| 181 / 6s | 开始轻微呼吸，叶尖约1–2°局部摆动 |
| 241 / 8s | 回到第151帧的展示姿态；最后3秒可循环，开场只播一次 |

实际操作只需要围绕这一个模型：

1. **File → Import → glTF 2.0**导入模型；有FBX则用FBX导入。检查贴图完整再动画。
2. 将时间线设为1–241帧、30fps。选需动的叶片枢轴或骨骼，在指定帧修改局部旋转；通过 **Object → Animation → Insert Keyframe** 或对应属性的关键帧按钮记录旋转。姿态模式使用骨骼关键帧。不要依赖版本间变化的单个快捷键。
3. 在Dope Sheet整理错开的动作时间；Graph Editor调整缓入缓出。所有叶片/果实保持植物连接关系。对“轻微”“自然”的审美评价，以实际播放为准。
4. 先交一条 `garnish_sequence`，0–8秒。运行时播放0–5秒一次，然后循环5–8秒；不依赖多个对象是否被导出器合成同名Action。最终可以拆成独立片段，但本轮不强加复杂动作管理。
5. Blender视窗里的摄影机仅供预览，不作为资产导出。不要把软件中的相机运镜当AR动画。

关键帧入口：[Blender手册](https://docs.blender.org/manual/en/4.5/animation/keyframes/editing.html)。支持的动画形式是对象变换、骨骼与形变；不要默认任意材质节点、程序生长或模拟均可移植，见[官方glTF导入导出项目](https://github.com/KhronosGroup/glTF-Blender-IO)。

## 第三步：交付和我的接手责任

交付 `.blend` 源工程、带贴图和动画的 `.glb`、同一资产播放预览、来源/许可记录。首件目标≤20k三角面、≤3材质、纹理≤2048、GLB≤5MB；这是项目起始预算，不是平台硬限制。完整场景预算再依据手机实测定。

Blender **File → Export → glTF 2.0**，选择Binary GLB，只导出植物与需要的骨骼、启用动画、覆盖1–241帧。要把多对象动作输出成一条时间线，使用导出器的Scene/场景动画方式（界面随版本变化）；约束/骨骼结果采样烘焙，简单对象动画优先。导出后关闭源场景，在新工程重新导入GLB，确认贴图和8秒动作仍在。

我来检查：模型结构、动画轨道、时长、首尾姿态、全时间线包围盒、法线/背面、纹理、原点、舞台映射、真实试管遮挡与运行性能。**预览必须播放最终GLB本身**，不能拿另一条生成视频替它通过验收。

你来判断：植物是否像品丽珠的风味表达、颜色与气质是否合适、动作是否克制自然。只有这类审美决策需要你，不让你承担追踪代码和三维坐标修补。

需要人工三维美术介入的明确节点：初模严重粘连、需真实叶片展开/枝干变形却缺可用拓扑、反复生成仍破坏既定外观、导出动画穿模。届时交出具体缺陷和工单，不声称换个平台即可自动完成。

**现在的下一步：只验证这一簇植物的三维模型。** 可以先打开Meshy免费预览；Blender是确定的后续制作工具。不要先去MJ/Linkfox生成一整场带酒管和背景的动画，也不要先买新会员。
