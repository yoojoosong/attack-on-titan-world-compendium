/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ArchiveType = 'character' | 'location' | 'event' | 'secret' | 'perspective';

export interface ArchiveItem {
  id: string;
  type: ArchiveType;
  title: string;
  content: string; // Supports Markdown
  image?: string;
  metadata?: Record<string, string>;
  position: { x: number; y: number };
  connections?: string[]; // IDs of related items
}

export const ARCHIVE_DATA: ArchiveItem[] = [
  // ===== Row 1 Left: Characters (header at x:-580, y:-300) =====
  // Cards scattered organically below header
  {
    id: 'eren',
    type: 'character',
    title: '艾伦·耶格尔',
    content: `**追求自由的少年**，最终成为了自由的奴隶。

他看到了未来，并决定亲手开启**地鸣**。为了保护同伴，他不惜背负全世界的仇恨。`,
    image: 'https://picsum.photos/seed/eren/400/600',
    metadata: { identity: '进击的巨人 / 始祖巨人', fate: '终结者' },
    position: { x: -560, y: -140 },
    connections: ['mikasa', 'armin', 'reiner', 'zeke']
  },
  {
    id: 'mikasa',
    type: 'character',
    title: '三笠·阿克曼',
    content: `最强的守护者。她的爱是纯粹的，也是沉重的。

最终，她亲手斩断了这份宿命，在围巾的温暖中送别了最爱的人。`,
    image: 'https://picsum.photos/seed/mikasa/400/600',
    metadata: { identity: '阿克曼末裔', fate: '守望者' },
    position: { x: -350, y: -170 },
    connections: ['eren', 'armin', 'levi']
  },
  {
    id: 'armin',
    type: 'character',
    title: '阿尔敏·阿诺德',
    content: `梦想看海的少年。他是调查兵团的**头脑**，也是最后与世界对话的使者。

他相信理解的力量，即使在最黑暗的时刻。`,
    image: 'https://picsum.photos/seed/armin/400/600',
    metadata: { identity: '超大型巨人', fate: '调停者' },
    position: { x: -150, y: -150 },
    connections: ['eren', 'mikasa', 'annie']
  },
  {
    id: 'levi',
    type: 'character',
    title: '利威尔·阿克曼',
    content: `人类最强士兵。背负着无数战友的嘱托，在残酷的战场上寻找意义。

"**献出心脏**"对他而言，是沉重的诺言。`,
    image: 'https://picsum.photos/seed/levi/400/600',
    metadata: { identity: '调查兵团兵长', fate: '承诺者' },
    position: { x: -480, y: 30 },
    connections: ['erwin', 'mikasa', 'zeke']
  },
  {
    id: 'reiner',
    type: 'character',
    title: '莱纳·布朗',
    content: `撕裂的战士。在"英雄"与"罪人"的身份间挣扎，渴望救赎。

他是艾伦的**镜像**，也是战争最深刻的受害者。`,
    image: 'https://picsum.photos/seed/reiner/400/600',
    metadata: { identity: '铠之巨人', fate: '赎罪者' },
    position: { x: -260, y: 50 },
    connections: ['eren', 'annie', 'bertholdt']
  },
  {
    id: 'zeke',
    type: 'character',
    title: '吉克·耶格尔',
    content: `**安乐死计划**的制定者。他认为不被生下来才是最大的救赎。

与艾伦的血缘连接，开启了最终的悲剧。`,
    image: 'https://picsum.photos/seed/zeke/400/600',
    metadata: { identity: '兽之巨人', fate: '虚无主义者' },
    position: { x: -130, y: 70 },
    connections: ['eren', 'levi']
  },

  // ===== Row 1 Right: Locations (header at x:380, y:-300) =====
  // Cards scattered organically below header
  {
    id: 'shiganshina',
    type: 'location',
    title: '希干希纳区',
    content: `一切开始的地方。

那一天，人类回想起了受巨人支配的恐惧，以及被囚禁在鸟笼中的屈辱。`,
    image: 'https://picsum.photos/seed/shiganshina/600/400',
    metadata: { status: '已收复', importance: '极高' },
    position: { x: 370, y: -130 },
    connections: ['eren', 'mikasa', 'armin']
  },
  {
    id: 'ocean',
    type: 'location',
    title: '大海',
    content: `墙外世界的象征。

艾伦曾以为海的那边是自由，但那里只有敌人。*"如果杀光海那边的敌人，我们就能获得自由吗？"*`,
    image: 'https://picsum.photos/seed/ocean/600/400',
    metadata: { status: '真实存在', importance: '象征意义' },
    position: { x: 640, y: -110 },
    connections: ['armin', 'eren']
  },
  {
    id: 'liberio',
    type: 'location',
    title: '雷贝利欧收容区',
    content: `马莱帝国的艾尔迪亚人聚居地。

高墙之内的另一种牢笼。这里的艾尔迪亚人背负着祖先的罪孽，渴望成为"荣誉马莱人"。`,
    image: 'https://picsum.photos/seed/liberio/600/400',
    metadata: { status: '遭袭', importance: '政治中心' },
    position: { x: 480, y: 30 },
    connections: ['reiner', 'zeke', 'eren']
  },

  // ===== Row 2 Left: Events (header at x:-680, y:350) =====
  // Cards scattered organically below header
  {
    id: 'basement',
    type: 'event',
    title: '地下室的真相',
    content: `格里沙留下的三本书，揭示了人类并未灭绝。

墙外存在着名为**马莱**的国家，而墙内的人类只是被遗弃在岛上的牺牲品。`,
    metadata: { time: '850年', impact: '世界观翻转' },
    position: { x: -680, y: 510 },
    connections: ['eren', 'shiganshina']
  },
  {
    id: 'trost',
    type: 'event',
    title: '托罗斯特区攻防战',
    content: `人类第一次战胜巨人的战役。

艾伦变身为巨人并堵住了城门，证明了人类拥有反击的力量。`,
    metadata: { time: '850年', impact: '希望的曙光' },
    position: { x: -510, y: 540 },
    connections: ['eren', 'armin', 'mikasa']
  },
  {
    id: 'rumbling',
    type: 'event',
    title: '地鸣',
    content: `**数千万超大型巨人踏平世界**。

这是艾伦为保护帕拉迪岛选择的极端毁灭。文明在巨人的足迹下化为尘埃。`,
    metadata: { time: '854年', scale: '全球性毁灭' },
    position: { x: -600, y: 620 },
    connections: ['eren', 'ymir_origin']
  },

  // ===== Row 2 Center: Secrets (header at x:-100, y:350) =====
  // Cards scattered organically below header
  {
    id: 'ymir_origin',
    type: 'secret',
    title: '始祖尤弥尔',
    content: `两千年前与"**有机生物之源**"接触的少女。

她在"坐标"处等待了两千年，直到艾伦给予她选择的自由。`,
    metadata: { source: '路径记忆', level: '最高机密' },
    position: { x: -110, y: 520 },
    connections: ['eren', 'zeke']
  },
  {
    id: 'ackerman',
    type: 'secret',
    title: '阿克曼的真相',
    content: `巨人科学的副产物。

拥有人类姿态的巨人，觉醒后拥有极强的战斗力，且不受始祖巨人的记忆操控。`,
    metadata: { source: '马莱研究', level: '绝密' },
    position: { x: 80, y: 570 },
    connections: ['levi', 'mikasa']
  },

  // ===== Row 2 Right: Perspectives (header at x:500, y:350) =====
  // Cards scattered organically below header
  {
    id: 'erwin_speech',
    type: 'perspective',
    title: '埃尔文的演讲',
    content: `*"为死者赋予意义，是生者的责任。"*

他在冲锋前彻底放弃了梦想，将希望寄托在后继者身上。`,
    metadata: { author: '埃尔文·史密斯', theme: '牺牲' },
    position: { x: 490, y: 520 },
    connections: ['levi']
  },
  {
    id: 'freedom_cost',
    type: 'perspective',
    title: '自由的代价',
    content: `艾伦追求的自由是剥夺他人的自由。

这是一种极致的自私，也是极致的爱。**自由从来不是免费的。**`,
    metadata: { theme: '哲学探讨', author: '穿过者' },
    position: { x: 650, y: 570 },
    connections: ['eren']
  }
];
