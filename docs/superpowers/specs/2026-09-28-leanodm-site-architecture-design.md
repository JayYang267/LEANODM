# LEANODM 全站定位与导航设计

日期：2026-09-28

状态：用户已批准全站架构，夜灯展示权重除外。本版记录该例外的修订方案，随产品概览页一并审核。仍处于全站设计阶段，不授权代码实现或具体文案撰写。

配套文件：[首页规格](2026-09-28-leanodm-home-design.md)、[产品概览页审核稿](2026-09-28-leanodm-products-overview-design.md)

## 1. 本轮目的与审核边界

用户已批准全站架构与首页规格，要求降低夜灯的展示权重，以免访客将照明误判为核心业务。已批准的综合塑胶电子定位、导航主体与首页模块顺序继续沿用。

当前仅设计 `/products/`。关联修订为“三个重点品类＋补充应用”：保留四个初始品类地址与夜灯案例规划，取消夜灯与三个重点品类同等的展示权重。每页仍按用户指定的 12 项逐页审核；批准某一页不触发实施计划或代码阶段。

## 2. 已确认的设计依据

- 公司有两家工厂，均位于东莞，没有美国工厂。
- 网站重点呈现鑫银海工厂主体，员工约 220 人。其他工厂的人数、设备与产能不能并入这个主体的数字。
- 用户确认模具、注塑、电子开发/SMT、印刷、装配和测试均由自有工厂完成。
- 用户确认有充分的车间实拍、检验文件与脱敏案例。本轮直接设计最佳内容结构，资料整理不构成设计阻塞。
- 玩具、文创及文具是未来重点获客方向；同时希望承接其他塑胶与电子产品 OEM/ODM 项目。
- 用户提供了一个 Amazon 畅销电子夜灯客户项目，历史一年生产输出约百万套。
- 夜灯事实仅支持该项目的历史生产规模；不扩展为全厂总产能、持续年度订单、Amazon 直接采购关系或本厂承担该项目原创开发的声明。案例按实际承担工作编写。
- LEANODM 为网站展示品牌，鑫银海为重点呈现的工厂名称；本规格不推断二者的法律关系或正式英文注册名称。

## 3. 推荐结论

采用“产品页面获取相关搜索访问，ODM/OEM 服务组织合作路径，精益管理与质量案例支持供应商选择”的整合架构。

首页承担综合定位与分流；具体品类页承接产品采购意图；工艺页解释厂内能力；精益页展示管理方法；案例页解释实际项目如何交付。访客可以从任意一个具体页面进入并完成判断，无需先回首页。

对外核心定位：

> ODM & OEM Manufacturing for Plastic and Electronic Products

玩具、文创礼品和文具是重点展示领域，夜灯属于已有跨品类应用经验。其他塑胶电子项目继续有明确入口。精益既有可直接访问的中心页，也在产品、工艺、质量和案例中以相关实践出现。

## 4. 桌面主导航

主导航固定为六项，外加一个项目 CTA：

**Products | ODM & OEM | Manufacturing | Quality | Lean Manufacturing | About | [Discuss Your Project]**

- Logo 链接首页；桌面不重复设置 Home。
- 上方轻量辅助导航为 **Case Studies | Resources | Contact**，并显示 Dongguan, China。
- Case Studies 在辅助导航、首页和相关品类页均有入口，不依赖页脚发现。
- 主 CTA 指向 `/contact/`，兼容从概念开发与成熟设计询价两种起点。
- 选择 Lean Manufacturing 顶级入口，是因为精益管理是本品牌的明确差异化，而不是因为该词预期能带来大量采购搜索。

| 主项 | 总览 URL | 采购商任务 | 下拉菜单内容 |
| --- | --- | --- | --- |
| Products | `/products/` | 找到匹配的产品领域 | 主要组：Toys & Collectibles、Gifts & Branded Merchandise、Stationery；补充应用组：Night Lights；Explore All Products |
| ODM & OEM | `/customization/` | 选择项目合作方式 | Existing Product Customization；Product Adaptation；New Product Development；OEM Manufacturing；How We Work；Project Fit & Working Principles |
| Manufacturing | `/manufacturing/` | 判断厂内工艺与协同能力 | Tooling；Injection Molding；Electronics & SMT；Printing & Finishing；Assembly & Testing；Explore All Processes |
| Quality | `/quality/` | 理解验收、测试及异常管理 | Incoming Inspection；Appearance Inspection；In-process Inspection；Product Testing；Traceability & Materials；Explore Our Quality System |
| Lean Manufacturing | `/lean-manufacturing/` | 理解管理文化及其客户价值 | 直接进入中心页，首版不增加复杂下拉 |
| About | `/about/` | 核实主体、工厂、团队与价值观 | About LEANODM；Xinyinhai Factory；Ethical Manufacturing；Activities & Community |

Manufacturing 下拉按工艺族分组，具体的 SMT、UV 印刷、丝印等叶子页面通过工艺族和总览进入。展示标签不需要与内部目录名称完全相同；导航中的每个入口都有明确可访问的目标。

Products 下拉中的补充应用组与主要组在排版上分开，夜灯保留可直接访问的文字链接，不使用同等大图或促销徽章。手机菜单保持相同层级和顺序。分组说明在文案阶段定稿，本轮只规定信息层级。

Quality 中三个 Inspection 入口分别对应 `/quality/incoming-inspection/`、`/quality/appearance-inspection/`、`/quality/in-process-inspection/`；Product Testing 对应 `/quality/product-testing/`；Traceability & Materials 对应 `/quality/traceability/`，并由正文直接链接仓储管理；Explore Our Quality System 对应 `/quality/`。

## 5. 产品信息架构

保留四个初始品类页面，展示权重分为三个重点品类和一个补充应用：

| 英文展示名 | URL | 页面责任 |
| --- | --- | --- |
| Toys & Collectibles | `/products/toys/` | 玩具、收藏玩偶及相关塑胶/电子产品制造主题 |
| Gifts & Branded Merchandise | `/products/gifts/` | 面向品牌、文创与纪念品项目的产品开发制造主题 |
| Stationery | `/products/stationery/` | 文具产品定制、改款与开发制造主题 |
| Night Lights | `/products/night-lights/` | 保留独立搜索与项目入口，以补充应用展示，不归入核心产品卡片组 |

产品总览先显示三个重点品类卡片，再设置其他塑胶电子应用与项目评估模块。该模块用简短内容说明可评估其他产品的结构、电子功能和制造要求，保留指向夜灯品类的普通文字链接，并链接 `/customization/` 与 `/contact/`。本模块不是新增的 Other Products SEO 分类页，也不是灯具展区。具体文案留到全站设计完成后的文案阶段。

可扩展的层次是：产品总览 → 品类中心 → 有独立采购意图的子品类 → 产品/方案详情。例如 `/products/toys/collectible-figures/` 可以承接收藏玩偶的独立需求。毛绒相关产品的细分名称在该品类的页面设计中按实际产品功能确定，不预设为自有完整毛绒缝制业务。

产品详情采用唯一地址 `/products/[product-slug]/`，通过分类及标签建立归属。这个规则是信息模型要求，不是本轮动态路由实现。分类 slug 保留，产品 slug 不与分类重名。

同一产品可以出现在多个相关列表中，但只有一个正文与主要 URL。变更分类不必变更详情 URL。不同颜色或图案默认作为详情内选项；只有采购意图及内容确实独立时再设计独立页面。

产品分类页说明“可为新客户提供什么”；客户专属项目案例说明“过去具体完成过什么”。案例展示不自动意味着该客户设计属于可售标准款。

## 6. 页面与 URL 目录

这些地址是规划中的内容归属。每个独立页面必须解决独立的买家问题，并拥有实质正文及对应实例；若两个主题回答同一问题，则合并为父页中的模块并使用锚点，不为关键词变体复制页面。用户已确认资料充分，本规则用于控制页面职责与重复内容，不作为索要资料或暂停设计的理由。

### 定制与开发

| URL | 页面主题 |
| --- | --- |
| `/customization/` | ODM/OEM 合作总览与项目路径选择 |
| `/customization/existing-products/` | 基于可定制现款的外观、品牌与包装调整 |
| `/customization/product-adaptation/` | 基于已有产品或设计进行结构与功能改款 |
| `/customization/new-product-development/` | 从需求与概念推进产品开发及量产导入 |
| `/customization/oem-manufacturing/` | 按客户成熟设计进行工程评审、生产导入与制造 |
| `/customization/how-we-work/` | 双方责任、阶段输入输出、确认节点与沟通机制 |
| `/customization/project-fit/` | 合作适配、知识产权、质量要求与项目投入原则 |

首页仍保留已讨论的三张定制路径卡片，旁边设置显著的“Already have a production-ready design? Explore OEM Manufacturing”入口。这样保留三条定制路径的清晰度，同时让 OEM 买家能直接进入。

### 制造能力

| URL | 页面主题 |
| --- | --- |
| `/manufacturing/` | 厂内制造流程与能力总览 |
| `/manufacturing/tooling/` | 模具开发、试模、变更及维护 |
| `/manufacturing/injection-molding/` | 注塑能力、生产控制及相关产品 |
| `/manufacturing/electronics-integration/` | 电子开发与产品集成、PCBA 到整机的连接 |
| `/manufacturing/smt-assembly/` | SMT 工艺与过程控制 |
| `/manufacturing/printing-finishing/` | 表面印刷及后加工总览 |
| `/manufacturing/uv-printing/` | UV 印刷的适用范围与控制 |
| `/manufacturing/screen-printing/` | 丝印的适用范围与控制 |
| `/manufacturing/assembly-testing/` | 整机装配、工序检验及生产测试 |

Electronics & SMT 菜单入口首先进入电子集成页，并直接提供 SMT 子链接；Printing & Finishing 入口进入该工艺族总览。Bonding、焊接等工艺纳入相关流程说明，其独立页面名称在制造页面设计阶段按实际工法确定。本轮不凭中文简称指定具体英文技术含义。

电子集成页解释产品级的电子开发与整机集成，SMT 页解释 PCBA 贴装生产工艺；装配测试页解释生产现场如何装配和执行测试，质量栏目中的产品测试页解释测试计划、判定标准与验证记录。页面互相引用，不重复同一套正文。

### 质量

| URL | 页面主题 |
| --- | --- |
| `/quality/` | 质量管理体系、控制节点与异常闭环 |
| `/quality/incoming-inspection/` | 来料检验与供应物料控制 |
| `/quality/appearance-inspection/` | 外观标准、样板与验收条件 |
| `/quality/in-process-inspection/` | 过程检验与工序质量控制 |
| `/quality/product-testing/` | 产品测试计划、方法与记录 |
| `/quality/inspector-training/` | 检验员训练、判定一致性与能力维护 |
| `/quality/traceability/` | 物料、批次、过程与成品追溯 |
| `/quality/warehouse-management/` | 物料状态、储存、流转与仓储控制 |

内部 IQC、BIQC 等文件作为相应页面的内容来源；面对采购商的导航使用清晰的业务语言。正文先解释如何控制风险，再提供公开样例。标准文件的完整名称和版本保留在资料信息中。

外观检验页重点解释缺陷分类、样板及验收条件；过程检验页重点解释在何时、由谁、如何发现及处理工序问题。两者保留不同的采购审查任务。

### 精益、案例、公司与资源

| URL | 页面主题 |
| --- | --- |
| `/lean-manufacturing/` | 精益管理中心：管理系统、标准作业、日常管理、持续改善、人员培养与实际案例 |
| `/case-studies/` | 按产品与问题类型查找的项目案例总览 |
| `/case-studies/electronic-night-light-production/` | 夜灯客户项目的历史量产案例 |
| `/about/` | LEANODM 展示品牌、业务定位、团队与工厂背景 |
| `/about/xinyinhai-factory/` | 东莞鑫银海工厂，约 220 名员工，实际现场与厂内流程 |
| `/about/ethical-manufacturing/` | 制造责任、员工与商业行为实践 |
| `/about/activities/` | 公益、精益协会及公司活动的真实记录 |
| `/resources/` | 买家指南、资料下载及制造知识的总入口 |
| `/resources/odm-project-brief/` | 如何准备可供评估的产品需求，配套需求书模板 |
| `/resources/downloads/` | 可公开的资料目录与文件信息 |
| `/blog/` | 制造观察、质量异常与改善文章列表 |
| `/blog/[article-slug]/` | 单篇文章，具有作者/审核者、日期与关联页面 |
| `/contact/` | 项目提交、联系信息与响应流程 |
| `/privacy/` | 隐私政策 |
| `/terms/` | 网站使用条款 |

精益文章、工厂活动和项目案例各有一个主要地址；可从多个栏目推荐，但不复制全文。首页不需要强调第二家工厂，About 如有必要可说明背景关系，不把两厂规模合并为鑫银海数据。

## 7. 搜索意图与内容归属

下表为主题分配，不是搜索量或排名结论。具体词组在对应页面规格阶段按目标市场验证。

| 页面类型 | 主要意图 | 候选主题 | 主要下一步 |
| --- | --- | --- | --- |
| 首页 | 核实综合制造商与适配范围 | LEANODM；plastic and electronic products OEM/ODM manufacturer | 产品、合作路径、项目提交 |
| 产品品类 | 寻找某种产品的制造合作方 | toy manufacturer；custom stationery manufacturer；night light OEM manufacturer | 产品范围、案例、品类项目询盘 |
| 定制服务 | 按当前项目阶段寻找开发或制造服务 | product adaptation；new product development；OEM manufacturing | 提交该阶段的需求 |
| 制造工艺 | 判断某项工艺是否可支持项目 | injection molding；SMT assembly 等实际工艺 | 相关产品、控制方法、工程沟通 |
| 质量 | 完成供应商质量审查 | inspection standards；product testing；traceability | 查看样例、提出审核需求 |
| 精益管理 | 判断管理方法与长期合作能力 | lean manufacturing practices；standard work；continuous improvement | 实际改善与项目案例 |
| 案例 | 评估相似项目的交付经验 | 具体产品＋生产问题或项目成果 | 对应产品页与项目咨询 |
| 资源文章 | 解决采购或开发问题 | how to prepare an ODM product brief 等 | 模板、服务页、需求提交 |

主要示例买家路径：玩具产品搜索 → 玩具品类页 → 新产品开发 → 开发流程与项目需求书 → 项目提交。补充路径：夜灯制造商搜索 → 夜灯品类页 → 历史夜灯项目案例 → 相关质量/精益实践 → 夜灯项目询盘。后者保留独立价值，不决定全站视觉重心。

产品页本身必须包含足够的合作范围、定制选项、适用工艺及相关证据，不能只是一组图片和回首页按钮。

## 8. 内容与组件边界

- 共享导航是同一份内容模型，供桌面、手机和页脚使用；不再手工维护互相矛盾的标签与链接。
- 工厂资料作为独立实体维护，人数、地点和过程归属具有明确主体；案例数据单独维护，不进入全厂统计卡片。
- 产品、服务、工艺、案例、文件和文章通过关联 ID 建立链接，正文保留唯一来源。
- 改造现有 Header、MobileMenu、Footer、BaseLayout、Button、Card、Section、ImageGrid、ProcessWorkflow；保留 Astro 图片处理。
- 主要新增设计组件为分组导航、产品领域卡片、合作路径卡片、工厂事实条、精益实践摘要、案例摘要及资料样例卡片。
- 页面主题、标题、描述、主要 URL、面包屑与结构化信息随页面资料统一管理；公开声明与结构化信息一致。

## 9. 手机、键盘与异常情况

- 主导航在实际内容无法完整容纳时切换为移动布局，不能压缩菜单文字、裁切或出现横向滚动。实现验收包含 1024px 与 1280px 临界宽度。
- 手机首层保持同样六项，另列 Home、Case Studies、Resources、Contact 与项目 CTA。
- 父级页面链接与子菜单展开按钮分开；用户可以进入总览，也可以展开子类。
- 桌面下拉支持点击与键盘，不能只依赖悬停。Escape 关闭，焦点回到触发项，当前页面与展开状态明确。
- 菜单内容在短屏可滚动，触控目标至少按 44×44 CSS px 设计；减少动态效果，支持减少动画偏好。
- 产品总览与页脚提供普通链接，重要信息不依赖筛选、动画或站内搜索才能发现。
- 不生成空分类与空下载。相关资料暂时不可公开时，其位置使用可公开的过程解释或案例摘要，不能出现失效按钮。
- 联系表单只在确认接收后显示成功；失败保留输入并显示实际联系方式。详细交付、附件与错误规格在 Contact 页面设计中完成。

## 10. 迁移与验证要求

旧站的物流内容、北美设施、模板联系人及演示成功提示不进入新站。

未来实施前建立实际线上 URL 清单。现有 `/capabilities`、`/use-cases`、`/facilities`、`/rfq`、`/documentation` 按各自内容与线上情况决定保留、重写或迁移，不能把所有旧 URL 无差别跳转到首页。页面有明确等价继承者时才建立对应永久重定向。

设计验收检查：

1. 玩具、文创礼品和文具为三个重点入口；夜灯可从补充应用进入，其他塑胶电子项目也可提交。
2. 夜灯品类与案例可被普通链接发现，但不占首页主案例位，不用百万套或 Amazon 信息形成全站主视觉。
3. 精益管理在主导航与首页可见，并能连接具体客户收益。
4. 首页、About、工厂页及案例的人数/地点/产量归属没有混用。
5. 每个导航项均指向规划中的明确页面或栏目；移动端结构与桌面一致。
6. 任意品类进入者可直接理解服务并发起项目，不被要求先回首页。

实施后另验收：所有实际链接、状态码、元数据、键盘菜单、手机排版、资料下载、表单成功/失败与真实接收。这些检查不在本轮执行，因为本轮不编写或部署页面。

## 11. 后续页面设计顺序

1. 产品概览 `/products/`（当前唯一正在设计的页面）。
2. 四个初始产品类别页面及可复用的产品详情模板；前三类为重点，夜灯作为补充应用。
3. ODM/OEM 概览与服务路径。
4. 制造能力。
5. 质量管控。
6. 精益生产。
7. 电子小夜灯案例研究。
8. 关于我们 / Xinyinhai 工厂。
9. 资源中心。
10. 联系我们。

每页分别提供搜索意图、目标买家、主主题、目标、建议 H1、模块顺序、内容要求、证据、CTA、内链、组件和手机要求。在用户审核当前页面后才进入下一页面。建议 H1 是设计项；其余正文、SEO 元描述、按钮文案与销售段落不在本阶段撰写。全站设计阶段仍未结束，不启动写实施计划或代码流程。设计顺序不等于上线顺序；网站发布时实际询盘链路必须可用。

## 12. 参考依据

- [Google：网站导航与页面链接关系](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure)：参考其中可抓取导航和页面关系原则；本项目是 B2B 询盘网站，不照搬零售结账流程。
- [Google：可抓取链接与锚文本](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)。
- [Google：生成式 AI 搜索指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)：可靠的实际经验内容和清楚的技术结构支持发现与理解；不承诺排名、流量或 AI 引用。
