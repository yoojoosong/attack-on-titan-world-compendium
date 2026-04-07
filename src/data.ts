/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ArchiveType = 'character' | 'location' | 'event' | 'secret' | 'perspective' | 'story';
export type AssetType = 'image' | 'video' | 'game' | 'audio' | 'file';
export type ItemKind = 'document' | 'asset';

export interface ArchiveItem {
  id: string;
  kind: ItemKind;
  type: ArchiveType | AssetType;
  title: string;
  content: string; // Markdown for documents, URL for assets
  cover?: string;  // Cover image / thumbnail
  image?: string;  // Legacy: card image (kept for canvas compatibility)
  metadata?: Record<string, string>;
  tags?: string[];
  position: { x: number; y: number };
  connections?: string[]; // IDs of related items
  createdAt: number;
  updatedAt: number;
  createdBy: 'user' | 'ai';
}

const now = Date.now();

export const ARCHIVE_DATA: ArchiveItem[] = [
  // ===== Row 1 Left: Characters (header at x:-580, y:-300) =====
  {
    id: 'eleven',
    kind: 'document',
    type: 'character',
    title: 'Eleven',
    content: `**The girl with powers.** Escaped from Hawkins Lab with a shaved head and a hospital gown.

She can move things with her mind, open gates between dimensions, and crush monsters — but all she ever wanted was to be **normal**.`,
    image: '/characters/eleven.webp',
    cover: '/characters/eleven.webp',
    metadata: { identity: 'Test Subject 011', fate: 'The Key' },
    position: { x: -560, y: -140 },
    connections: ['mike', 'hopper', 'will', 'dustin'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'mike',
    kind: 'document',
    type: 'character',
    title: 'Mike Wheeler',
    content: `The heart of the party. He found a lost girl in the rain and gave her a home.

His loyalty is fierce, sometimes reckless. He would burn the world down for the people he loves.`,
    image: '/characters/mike.jpeg',
    cover: '/characters/mike.jpeg',
    metadata: { identity: 'Dungeon Master', fate: 'The Leader' },
    position: { x: -350, y: -170 },
    connections: ['eleven', 'will', 'dustin'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'will',
    kind: 'document',
    type: 'character',
    title: 'Will Byers',
    content: `The boy who vanished. Taken to the **Upside Down**, he survived where no one else could.

But survival left its mark. The Mind Flayer chose him, and he was never quite the same again.`,
    image: '/characters/will.webp',
    cover: '/characters/will.webp',
    metadata: { identity: 'True Sight / The Spy', fate: 'The Vessel' },
    position: { x: -150, y: -150 },
    connections: ['mike', 'eleven', 'joyce'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'hopper',
    kind: 'document',
    type: 'character',
    title: 'Jim Hopper',
    content: `Hawkins' chief of police. A broken man who found purpose protecting a girl who wasn't his daughter — until she was.

He walked into the fire so others wouldn't have to. **"Keep the door open three inches."**`,
    image: '/characters/hopper.jpg',
    cover: '/characters/hopper.jpg',
    metadata: { identity: 'Chief of Police', fate: 'The Protector' },
    position: { x: -480, y: 30 },
    connections: ['eleven', 'joyce', 'brenner'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'dustin',
    kind: 'document',
    type: 'character',
    title: 'Dustin Henderson',
    content: `The brains of the operation. Armed with a compass, a radio, and unshakable optimism.

His bond with Steve Harrington proved that the most unlikely friendships are the strongest ones.`,
    image: '/characters/dustin.webp',
    cover: '/characters/dustin.webp',
    metadata: { identity: 'Party Member / Radio Operator', fate: 'The Compass' },
    position: { x: -260, y: 50 },
    connections: ['mike', 'steve', 'eleven'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'steve',
    kind: 'document',
    type: 'character',
    title: 'Steve Harrington',
    content: `From king of the school to **babysitter of the apocalypse**.

Armed with a nail bat and a surprising amount of heart, Steve became the hero nobody — including himself — expected.`,
    image: '/characters/steve.webp',
    cover: '/characters/steve.webp',
    metadata: { identity: 'Former King of Hawkins High', fate: 'The Unlikely Hero' },
    position: { x: -130, y: 70 },
    connections: ['dustin', 'nancy'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },

  // ===== Row 1 Right: Locations (header at x:380, y:-300) =====
  {
    id: 'hawkins',
    kind: 'document',
    type: 'location',
    title: 'Hawkins, Indiana',
    content: `A quiet town with a dark secret beneath its surface.

Nothing ever happens in Hawkins — until everything does. The lab cracked the world open, and now the darkness seeps through.`,
    image: 'https://picsum.photos/seed/hawkins/600/400',
    metadata: { status: 'Fractured', importance: 'Critical' },
    position: { x: 370, y: -130 },
    connections: ['eleven', 'hopper', 'will'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'upside_down',
    kind: 'document',
    type: 'location',
    title: 'The Upside Down',
    content: `A mirror dimension. Cold, dark, and decaying — a toxic copy of our world ruled by a hive mind.

It exists beneath everything, separated by the thinnest of membranes. *"It's like Hawkins, but it's so dark... so dark and empty."*`,
    image: 'https://picsum.photos/seed/upsidedown/600/400',
    metadata: { status: 'Active Threat', importance: 'Existential' },
    position: { x: 640, y: -110 },
    connections: ['will', 'eleven', 'vecna'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'lab',
    kind: 'document',
    type: 'location',
    title: 'Hawkins National Laboratory',
    content: `Where it all began. Under the direction of Dr. Martin Brenner, children were experimented on in the name of Cold War science.

Eleven opened the first gate here. The lab is the wound that Hawkins can never close.`,
    image: 'https://picsum.photos/seed/hawkinslab/600/400',
    metadata: { status: 'Destroyed', importance: 'Ground Zero' },
    position: { x: 480, y: 30 },
    connections: ['eleven', 'hopper', 'brenner'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },

  // ===== Row 2 Left: Events (header at x:-680, y:350) =====
  {
    id: 'disappearance',
    kind: 'document',
    type: 'event',
    title: "Will's Disappearance",
    content: `November 6, 1983. Will Byers rides his bike home from Mike's house and never arrives.

A boy vanishes. A gate opens. A girl appears. And Hawkins, Indiana is never the same again.`,
    metadata: { time: 'November 1983', impact: 'The Catalyst' },
    position: { x: -680, y: 510 },
    connections: ['will', 'hawkins'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'starcourt',
    kind: 'document',
    type: 'event',
    title: 'The Battle of Starcourt',
    content: `Beneath the Starcourt Mall, the Soviets built a machine to reopen the gate.

The Mind Flayer assembled a flesh monster. Billy Hargrove sacrificed himself. Hopper was lost in the explosion. The mall burned. Summer ended.`,
    metadata: { time: 'July 1985', impact: 'Loss of Innocence' },
    position: { x: -510, y: 540 },
    connections: ['eleven', 'hopper', 'dustin'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'vecna_curse',
    kind: 'document',
    type: 'event',
    title: "Vecna's Curse",
    content: `**Four kills to open four gates.** Vecna reached into the minds of Hawkins' most vulnerable, exploiting their trauma and guilt.

The clock chimed. The earth cracked. And the Upside Down began to consume Hawkins from within.`,
    metadata: { time: 'March 1986', scale: 'Apocalyptic' },
    position: { x: -600, y: 620 },
    connections: ['vecna', 'eleven'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },

  // ===== Row 2 Center: Secrets (header at x:-100, y:350) =====
  {
    id: 'vecna',
    kind: 'document',
    type: 'secret',
    title: 'Vecna / Henry Creel / 001',
    content: `The first test subject. A boy named Henry Creel who discovered he could reach into people's minds.

Brenner thought he could control him. Eleven banished him to the Upside Down. He became something else entirely — **the monster pulling all the strings**.`,
    metadata: { source: 'Recovered Memories', level: 'Top Secret' },
    position: { x: -110, y: 520 },
    connections: ['eleven', 'brenner'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'brenner',
    kind: 'document',
    type: 'secret',
    title: "Brenner's Experiments",
    content: `Project MKUltra. Children with psychokinetic abilities, numbered like specimens.

Dr. Martin Brenner — "Papa" — created the conditions for every disaster that followed. Science without conscience is the ruin of the soul.`,
    metadata: { source: 'Declassified Files', level: 'Classified' },
    position: { x: 80, y: 570 },
    connections: ['eleven', 'hopper', 'vecna'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },

  // ===== Row 2 Right: Perspectives (header at x:500, y:350) =====
  {
    id: 'hopper_letter',
    kind: 'document',
    type: 'perspective',
    title: "Hopper's Letter",
    content: `*"I want you to feel things. Sad things. And happy things. But mostly I want you to know that it's okay to feel."*

A letter from a father to his adopted daughter, read too late. The most human moment in a story about monsters.`,
    metadata: { author: 'Jim Hopper', theme: 'Love & Loss' },
    position: { x: 490, y: 520 },
    connections: ['hopper', 'eleven'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'growing_up',
    kind: 'document',
    type: 'perspective',
    title: 'The Cost of Growing Up',
    content: `The real horror of Stranger Things isn't the Demogorgon. It's growing up.

Friendships fracture. Innocence fades. The game of D&D can't protect you from the real monsters. **The Upside Down is just childhood ending.**`,
    metadata: { theme: 'Coming of Age', author: 'The Party' },
    position: { x: 650, y: 570 },
    connections: ['mike', 'will'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  }
];
