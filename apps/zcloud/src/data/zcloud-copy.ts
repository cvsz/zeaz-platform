export type LocaleKey = "en" | "th" | "jp" | "ch" | "std";

export type CopyBlock = {
  lang: string;
  badge: string;
  title: string;
  subtitle: string;
  hero: string;
  body: string;
  releaseNote: string;
  menuLabel: string;
  dockLabel: string;
  commandLabel: string;
  drawerLabel: string;
  paletteLabel: string;
  actionLabel: string;
  quickLabel: string;
  seo: string;
};

export const localeOrder: LocaleKey[] = ["en", "th", "jp", "ch", "std"];

export const localeLabels: Record<LocaleKey, string> = {
  en: "EN",
  th: "TH",
  jp: "JP",
  ch: "CH",
  std: "STD",
};

export const copies: Record<LocaleKey, CopyBlock> = {
  en: {
    lang: "EN",
    badge: "CloudPanel v2 release map",
    title: "Master Meta Full Advanced Professional UI/UX Final Release Complete",
    subtitle: "Docs-native control surface for the CloudPanel v2 tree.",
    hero:
      "zcloud turns the CloudPanel v2 docs into a release-grade cockpit. It keeps launch, admin, runtime, deployment, and hardening in one visual system with a GODMODE dock and command workflow.",
    body:
      "Every major CloudPanel docs zone is mirrored as a navigable surface. The dock, palette, and drawer are for operators who want direct control instead of a generic hosting dashboard.",
    releaseNote:
      "This build is intentionally opinionated: high contrast, power-oriented, and structured as a final-release control panel rather than a content page.",
    menuLabel: "GODMODE",
    dockLabel: "Persistent dock",
    commandLabel: "Command palette",
    drawerLabel: "Action drawer",
    paletteLabel: "Open palette",
    actionLabel: "Open actions",
    quickLabel: "Quick jump",
    seo: "zcloud master meta release with i18n and operator controls",
  },
  th: {
    lang: "TH",
    badge: "แผนที่การปล่อย CloudPanel v2",
    title: "Master Meta Full Advanced Professional UI/UX Final Release Complete",
    subtitle: "แผงควบคุมแบบอิงเอกสารสำหรับโครงสร้าง CloudPanel v2",
    hero:
      "zcloud แปลงเอกสาร CloudPanel v2 ให้เป็นคอนโซลระดับรีลีส โดยรวมเส้นทาง launch, admin, runtime, deployment และ hardening ไว้ในระบบภาพเดียว พร้อม GODMODE dock และ workflow คำสั่ง",
    body:
      "ทุกหมวดเอกสารหลักของ CloudPanel ถูกสะท้อนเป็นพื้นที่ที่กดเข้าไปได้ dock, palette และ drawer ถูกออกแบบมาสำหรับ operator ที่ต้องการควบคุมตรง ไม่ใช่ dashboard ทั่วไป",
    releaseNote:
      "บิลด์นี้ตั้งใจให้ชัดเจนและทรงพลัง: คอนทราสต์สูง เน้นการควบคุม และจัดวางเหมือน final-release control panel มากกว่าหน้าเนื้อหา",
    menuLabel: "GODMODE",
    dockLabel: "Dock ถาวร",
    commandLabel: "Command palette",
    drawerLabel: "Action drawer",
    paletteLabel: "เปิด palette",
    actionLabel: "เปิด actions",
    quickLabel: "ทางลัด",
    seo: "zcloud master meta release รองรับ i18n และการควบคุม operator",
  },
  jp: {
    lang: "JP",
    badge: "CloudPanel v2 リリースマップ",
    title: "Master Meta Full Advanced Professional UI/UX Final Release Complete",
    subtitle: "CloudPanel v2 ツリーのためのドキュメント駆動コントロール面",
    hero:
      "zcloud は CloudPanel v2 のドキュメントを、リリース品質のコックピットへ変換します。launch、admin、runtime、deployment、hardening を 1 つの視覚システムにまとめ、GODMODE dock とコマンド操作を備えています。",
    body:
      "CloudPanel の主要な docs ゾーンはすべてナビゲーション可能な面として再構成されています。dock、palette、drawer は、一般的なホスティング UI ではなく、直接制御を必要とする operator 向けです。",
    releaseNote:
      "このビルドは意図的に強い設計です。高コントラストで、操作中心、そしてコンテンツページではなく final-release の制御盤として配置しています。",
    menuLabel: "GODMODE",
    dockLabel: "固定 dock",
    commandLabel: "Command palette",
    drawerLabel: "Action drawer",
    paletteLabel: "Palette を開く",
    actionLabel: "Actions を開く",
    quickLabel: "クイック移動",
    seo: "zcloud master meta release i18n と operator controls",
  },
  ch: {
    lang: "CH",
    badge: "CloudPanel v2 发布地图",
    title: "Master Meta Full Advanced Professional UI/UX Final Release Complete",
    subtitle: "面向 CloudPanel v2 文档树的释放级控制界面",
    hero:
      "zcloud 将 CloudPanel v2 文档转化为发布级控制台，把 launch、admin、runtime、deployment 与 hardening 统一在同一套可操作的视觉系统中，并配备 GODMODE dock 与命令流程。",
    body:
      "CloudPanel 的各个核心文档区域都被映射成可导航的界面。dock、palette 与 drawer 面向需要直接控制的 operator，而不是普通的托管面板用户。",
    releaseNote:
      "这个版本刻意保持强烈风格：高对比、以控制为中心，并被组织成 final-release 控制面，而不是内容页面。",
    menuLabel: "GODMODE",
    dockLabel: "固定 dock",
    commandLabel: "命令面板",
    drawerLabel: "动作抽屉",
    paletteLabel: "打开面板",
    actionLabel: "打开动作",
    quickLabel: "快速跳转",
    seo: "zcloud master meta release 多语言与 operator 控制",
  },
  std: {
    lang: "STD",
    badge: "Standard release map",
    title: "Master Meta Full Advanced Professional UI/UX Final Release Complete",
    subtitle: "Standard language release cockpit for the CloudPanel v2 tree.",
    hero:
      "zcloud is the standard-language release shell for CloudPanel v2. It keeps the important paths visible, direct, and operator-friendly without hiding the docs behind a generic product page.",
    body:
      "Standard language is used as the neutral release baseline. It gives the same structure as the localized modes, but with minimal phrasing and maximum operational clarity.",
    releaseNote:
      "The release frame stays stable across languages: launch, frontend, admin, CLI, runtime, deployment, security, and evidence.",
    menuLabel: "GODMODE",
    dockLabel: "Dock",
    commandLabel: "Command palette",
    drawerLabel: "Action drawer",
    paletteLabel: "Open palette",
    actionLabel: "Open actions",
    quickLabel: "Quick jump",
    seo: "zcloud standard language master meta release",
  },
};
