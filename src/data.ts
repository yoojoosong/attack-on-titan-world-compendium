/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const asset = (path: string) => path.startsWith('/') ? `${BASE}${path}` : path;

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
  timeline?: { date: string; dateLabel: string; era?: string }; // For chronological ordering
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
    image: asset('/characters/eleven.webp'),
    cover: asset('/characters/eleven.webp'),
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
    image: asset('/characters/mike.jpeg'),
    cover: asset('/characters/mike.jpeg'),
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
    image: asset('/characters/will.webp'),
    cover: asset('/characters/will.webp'),
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
    image: asset('/characters/hopper.jpg'),
    cover: asset('/characters/hopper.jpg'),
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
    image: asset('/characters/dustin.webp'),
    cover: asset('/characters/dustin.webp'),
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
    image: asset('/characters/steve.webp'),
    cover: asset('/characters/steve.webp'),
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

  // ===== Events (timeline-enabled) — positioned near Chronicle section (x:120, y:350) =====
  {
    id: 'creel_massacre',
    kind: 'document',
    type: 'event',
    title: "The Creel House Massacre",
    content: `In 1959, the Creel family moved into their dream home in Hawkins. Within weeks, Victor Creel's wife and daughter were dead — killed by a force no one could explain.

Victor was blamed. Committed to Pennhurst Asylum. But the real killer was his own son, Henry — a boy who could reach into minds.`,
    metadata: { time: '1959', impact: 'The Origin' },
    timeline: { date: '1959-01', dateLabel: '1959', era: 'Origin' },
    position: { x: 20, y: 480 },
    connections: ['vecna'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },
  {
    id: 'project_mkultra',
    kind: 'document',
    type: 'event',
    title: "Project MKUltra Begins",
    content: `Dr. Martin Brenner takes Henry Creel — now designated 001 — into Hawkins National Laboratory. Under the guise of government research, Brenner begins experimenting on children with psychokinetic potential.

The numbered children. The sensory deprivation tanks. The beginning of everything.`,
    metadata: { time: '1959', impact: 'The Program' },
    timeline: { date: '1959-06', dateLabel: '1959', era: 'Origin' },
    position: { x: 190, y: 480 },
    connections: ['vecna', 'brenner'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },
  {
    id: 'eleven_001',
    kind: 'document',
    type: 'event',
    title: "Eleven Banishes 001",
    content: `In the rainbow room, Henry Creel revealed himself to Eleven. He massacred every other test subject. But Eleven — the youngest, the most powerful — fought back.

She tore open a gate to another dimension and cast him through. Henry Creel became Vecna. The Upside Down had its master.`,
    metadata: { time: '1979', impact: 'The Exile' },
    timeline: { date: '1979-09', dateLabel: 'September 1979', era: 'Origin' },
    position: { x: 360, y: 480 },
    connections: ['eleven', 'vecna', 'brenner'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },
  {
    id: 'disappearance',
    kind: 'document',
    type: 'event',
    title: "Will's Disappearance",
    content: `November 6, 1983. Will Byers rides his bike home from Mike's house and never arrives.

A boy vanishes. A gate opens. A girl appears. And Hawkins, Indiana is never the same again.`,
    metadata: { time: 'November 1983', impact: 'The Catalyst' },
    timeline: { date: '1983-11-06', dateLabel: 'November 1983', era: 'Season 1' },
    position: { x: 20, y: 540 },
    connections: ['will', 'hawkins'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },
  {
    id: 'eleven_escapes',
    kind: 'document',
    type: 'event',
    title: "Eleven Escapes the Lab",
    content: `On the same night Will vanished, a girl in a hospital gown fled Hawkins Lab into the rain. Shaved head. No name — just a number tattooed on her wrist: 011.

Benny Hammond gave her food. Brenner's men gave her a death sentence. But Mike Wheeler gave her a home.`,
    metadata: { time: 'November 1983', impact: 'The Escape' },
    timeline: { date: '1983-11-06', dateLabel: 'November 1983', era: 'Season 1' },
    position: { x: 190, y: 540 },
    connections: ['eleven', 'mike'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },
  {
    id: 'will_rescued',
    kind: 'document',
    type: 'event',
    title: "Will Rescued from the Upside Down",
    content: `Joyce Byers never stopped looking. With Hopper at her side, she crossed into the Upside Down through a makeshift gate and found her son — barely alive, wrapped in vines, a tendril down his throat.

Meanwhile, Eleven faced the Demogorgon in Hawkins Middle School and vanished in a burst of light.`,
    metadata: { time: 'December 1983', impact: 'The Rescue' },
    timeline: { date: '1983-12-12', dateLabel: 'December 1983', era: 'Season 1' },
    position: { x: 360, y: 540 },
    connections: ['will', 'eleven', 'hopper'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },
  {
    id: 'mind_flayer',
    kind: 'document',
    type: 'event',
    title: "The Mind Flayer Possesses Will",
    content: `The shadow monster — vast, spider-like, filling the sky of the Upside Down — found its way into Will Byers through the connection that was never fully severed.

Will became its spy. Its vessel. Now Memories. And the Mind Flayer could see through his eyes into our world.`,
    metadata: { time: 'October 1984', impact: 'The Possession' },
    timeline: { date: '1984-10-29', dateLabel: 'October 1984', era: 'Season 2' },
    position: { x: 20, y: 600 },
    connections: ['will', 'eleven'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },
  {
    id: 'gate_closed',
    kind: 'document',
    type: 'event',
    title: "Eleven Closes the Gate",
    content: `She returned. Stronger. Angrier. With a new look and a new name — Jane.

Standing at the edge of the rift beneath Hawkins Lab, Eleven raised her hands and screamed. The Gate sealed shut. The tunnel network collapsed. For a while, Hawkins was safe again.`,
    metadata: { time: 'November 1984', impact: 'The Seal' },
    timeline: { date: '1984-11-04', dateLabel: 'November 1984', era: 'Season 2' },
    position: { x: 190, y: 600 },
    connections: ['eleven', 'hopper'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },
  {
    id: 'starcourt',
    kind: 'document',
    type: 'event',
    title: 'The Battle of Starcourt',
    content: `Beneath the Starcourt Mall, the Soviets built a machine to reopen the gate.

The Mind Flayer assembled a flesh monster. Billy Hargrove sacrificed himself. Hopper was lost in the explosion. The mall burned. Summer ended.`,
    metadata: { time: 'July 1985', impact: 'Loss of Innocence' },
    timeline: { date: '1985-07-04', dateLabel: 'July 1985', era: 'Season 3' },
    position: { x: 360, y: 600 },
    connections: ['eleven', 'hopper', 'dustin'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },
  {
    id: 'vecna_curse',
    kind: 'document',
    type: 'event',
    title: "Vecna's Curse",
    content: `**Four kills to open four gates.** Vecna reached into the minds of Hawkins' most vulnerable, exploiting their trauma and guilt.

The clock chimed. The earth cracked. And the Upside Down began to consume Hawkins from within.`,
    metadata: { time: 'March 1986', scale: 'Apocalyptic' },
    timeline: { date: '1986-03-21', dateLabel: 'March 1986', era: 'Season 4' },
    position: { x: 20, y: 660 },
    connections: ['vecna', 'eleven'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },
  {
    id: 'four_gates',
    kind: 'document',
    type: 'event',
    title: "The Four Gates Open",
    content: `Vecna's fourth kill tore Hawkins apart — literally. Four massive rifts cracked open across the town, connected by a miles-long fissure.

The Upside Down began to bleed through. Ash fell like snow. The earthquake split Hawkins in half. There was no hiding the truth anymore.`,
    metadata: { time: 'March 1986', impact: 'The Rupture' },
    timeline: { date: '1986-03-22', dateLabel: 'March 1986', era: 'Season 4' },
    position: { x: 190, y: 660 },
    connections: ['vecna', 'eleven', 'hawkins'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },
  {
    id: 'final_battle',
    kind: 'document',
    type: 'event',
    title: "The Final Stand",
    content: `Separated across dimensions, the Party launched a three-pronged assault on Vecna. Dustin and Eddie in the Upside Down. Nancy, Steve, and Robin at the Creel House. Eleven in the void.

Max's heart stopped for a full minute. Vecna fell. But the damage was done — and Hawkins would never recover.`,
    metadata: { time: 'March 1986', impact: 'The End' },
    timeline: { date: '1986-03-23', dateLabel: 'March 1986', era: 'Season 4' },
    position: { x: 360, y: 660 },
    connections: ['eleven', 'vecna', 'dustin', 'steve'],
    createdAt: now, updatedAt: now, createdBy: 'ai',
  },

  // ===== Secrets — positioned near Classified section (x:-580, y:350) =====
  {
    id: 'vecna',
    kind: 'document',
    type: 'secret',
    title: 'Vecna / Henry Creel / 001',
    content: `The first test subject. A boy named Henry Creel who discovered he could reach into people's minds.

Brenner thought he could control him. Eleven banished him to the Upside Down. He became something else entirely — **the monster pulling all the strings**.`,
    metadata: { source: 'Recovered Memories', level: 'Top Secret' },
    position: { x: -600, y: 520 },
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
    position: { x: -480, y: 520 },
    connections: ['eleven', 'hopper', 'vecna'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },

  {
    id: 'upside_down_rules',
    kind: 'document',
    type: 'secret',
    title: 'The Upside Down: Dimensional Rules',
    content: `A parallel dimension that mirrors our world — frozen in time from the moment the first gate opened. No sun. No warmth. Just spores, vines, and decay.

**Key properties:** The atmosphere is toxic. Electromagnetic interference disrupts all technology. The hive mind connects every creature within it. And it grows — slowly consuming whatever it touches on our side.`,
    metadata: { source: 'Hawkins Lab Research', level: 'Top Secret' },
    position: { x: -700, y: 520 },
    connections: ['vecna', 'eleven'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'psychic_powers',
    kind: 'document',
    type: 'secret',
    title: 'Psychokinetic Abilities',
    content: `The numbered children of Hawkins Lab each developed unique psychic abilities through sensory deprivation and trauma-induced stress responses.

**Telekinesis, remote viewing, inter-dimensional contact.** Eleven's power is unique — she can open gates between dimensions. The cost: nosebleeds, exhaustion, and memories she can never unsee.`,
    metadata: { source: 'Project MKUltra Files', level: 'Classified' },
    position: { x: -700, y: 600 },
    connections: ['eleven', 'brenner'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'gate_mechanics',
    kind: 'document',
    type: 'secret',
    title: 'Gate Mechanics',
    content: `Gates between dimensions require immense psychic energy to open — and trauma to sustain. Eleven tore the first gate open in 1983 during a moment of extreme fear.

**Each gate weakens the barrier further.** Vecna discovered that killing victims in a specific psychic state tears permanent rifts. Four kills, four gates — enough to crack Hawkins apart.`,
    metadata: { source: 'Dimensional Research', level: 'Top Secret' },
    position: { x: -480, y: 600 },
    connections: ['eleven', 'vecna'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },
  {
    id: 'hive_mind',
    kind: 'document',
    type: 'secret',
    title: 'The Hive Mind',
    content: `Every creature in the Upside Down is connected through a single consciousness. The Demogorgons, the Demodogs, the vines — all extensions of one will.

**The Mind Flayer was the shadow.** But Vecna was the mind behind the shadow. He didn't just enter the Upside Down — he shaped it, bent it to his will, and built an army from its flesh.`,
    metadata: { source: 'Recovered Intelligence', level: 'Top Secret' },
    position: { x: -600, y: 600 },
    connections: ['vecna', 'will'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  },

  // ===== Row 2 Right: Perspectives (header at x:620, y:350) =====
  {
    id: 'hopper_letter',
    kind: 'document',
    type: 'perspective',
    title: "Hopper's Letter",
    content: `*"I want you to feel things. Sad things. And happy things. But mostly I want you to know that it's okay to feel."*

A letter from a father to his adopted daughter, read too late. The most human moment in a story about monsters.`,
    metadata: { author: 'Jim Hopper', theme: 'Love & Loss' },
    position: { x: 710, y: 520 },
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
    position: { x: 870, y: 570 },
    connections: ['mike', 'will'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
  }
];
