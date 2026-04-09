/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import {
  Skull,
  Map as MapIcon,
  Clock,
  Zap,
  FileText,
  Eye,
  RotateCcw,
  X as CloseIcon,
  Search,
  Lock,
  Move,
  ZoomIn,
  ZoomOut,
  Navigation2,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronLeft,
  Plus,
  Send,
  Compass,
  MapPin,
  Flame,
  BookOpen,
  PenLine,
  Image as ImageIcon,
  Video,
  Gamepad2,
  Upload,
  User,
} from 'lucide-react';
import Markdown from 'react-markdown';
import {
  ARCHIVE_DATA,
  ArchiveItem,
  ArchiveType,
  AssetType,
} from './data';

// --- Easing constants ---
const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1];
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

// --- Type Colors ---
const TYPE_COLORS: Record<string, string> = {
  character: '#60a5fa',
  location: '#34d399',
  event: '#fbbf24',
  secret: '#f87171',
  perspective: '#a78bfa',
  story: '#fb923c',
  image: '#60a5fa',
  video: '#f472b6',
  game: '#34d399',
  audio: '#fbbf24',
  file: '#9ca3af',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  character: <User size={14} />,
  location: <MapPin size={14} />,
  event: <Flame size={14} />,
  secret: <Lock size={14} />,
  perspective: <PenLine size={14} />,
  story: <BookOpen size={14} />,
  image: <ImageIcon size={14} />,
  video: <Video size={14} />,
  game: <Gamepad2 size={14} />,
};

const COVER_GRADIENTS: Record<string, string> = {
  character: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  location: 'linear-gradient(135deg, #0f2027 0%, #203a43 100%)',
  event: 'linear-gradient(135deg, #1a1a0e 0%, #2d2a1e 100%)',
  secret: 'linear-gradient(135deg, #1a0a0a 0%, #2d1a1a 100%)',
  perspective: 'linear-gradient(135deg, #1a1025 0%, #261535 100%)',
  story: 'linear-gradient(135deg, #1a1510 0%, #2d2518 100%)',
};

// --- Section → Type mapping ---
const SECTION_TYPE_MAP: Record<string, string> = {
  characters: 'character',
  locations: 'location',
  secrets: 'secret',
  perspectives: 'perspective',
  timeline: 'event',
};

// --- View State ---
type ViewState =
  | { kind: 'overview' }
  | { kind: 'section'; sectionId: string }
  | { kind: 'detail'; itemId: string };

// --- Narrative Data (unchanged) ---

interface NarrativeSection {
  id: string;
  title: string;
  text: string;
  position: { x: number; y: number };
  camera: { x: number; y: number; zoom: number };
  cardIds: string[];
  quotes?: Record<string, string>;
  titleClass?: string;
  textClass?: string;
}

const NARRATIVE_SECTIONS: NarrativeSection[] = [
  {
    id: 'title',
    title: 'Stranger Things',
    text: 'World Compendium',
    position: { x: -350, y: -780 },
    camera: { x: -100, y: -730, zoom: 1 },
    cardIds: [],
    titleClass: 'text-white !text-7xl !tracking-wide',
    textClass: 'text-base text-white/40 font-mono tracking-[0.3em]',
  },
  {
    id: 'prologue',
    title: '',
    text: 'Hawkins, Indiana. A small town where nothing happens.\nUntil a boy disappears, a girl appears,\nand the fabric between worlds tears open.\n\nBeneath the surface, a shadow dimension mirrors our own.\nCold. Dark. Alive.',
    position: { x: -350, y: -600 },
    camera: { x: -100, y: -550, zoom: 1 },
    cardIds: [],
    textClass: 'text-lg text-white/70 font-serif leading-loose',
  },
  {
    id: 'characters',
    title: 'The Party',
    text: 'Remember these faces.\nEach of them will be marked by the Upside Down — and none will escape unchanged.',
    position: { x: -580, y: -300 },
    camera: { x: -380, y: -80, zoom: 0.9 },
    cardIds: ['eleven', 'mike', 'will', 'hopper', 'dustin', 'steve'],
    quotes: {
      'eleven': '"Friends don\'t lie."',
      'mike': '"She\'s our friend and she\'s crazy!"',
      'will': '"It\'s like home... but it\'s so dark."',
    },
  },
  {
    id: 'locations',
    title: 'The Map',
    text: 'These are the places where the membrane is thinnest.\nWhere the darkness bleeds through.',
    position: { x: 380, y: -300 },
    camera: { x: 520, y: -80, zoom: 1 },
    cardIds: ['hawkins', 'upside_down', 'lab'],
  },
  {
    id: 'secrets',
    title: 'Classified',
    text: 'The following files were sealed by the Department of Energy.\nYou are reading records that should not exist.',
    position: { x: -580, y: 350 },
    camera: { x: -430, y: 520, zoom: 1.05 },
    cardIds: ['vecna', 'brenner', 'upside_down_rules', 'psychic_powers', 'gate_mechanics', 'hive_mind'],
    textClass: 'text-sm text-red-400/60 leading-relaxed',
  },
  {
    id: 'timeline',
    title: 'The Chronicle',
    text: 'Every story has a beginning. And an end.\nThis is how the darkness unfolded —\nand how Hawkins was never the same.',
    position: { x: 120, y: 350 },
    camera: { x: 170, y: 350, zoom: 0.85 },
    cardIds: ['creel_massacre', 'project_mkultra', 'eleven_001', 'disappearance', 'eleven_escapes', 'will_rescued', 'mind_flayer', 'gate_closed', 'starcourt', 'vecna_curse', 'four_gates', 'final_battle'],
    textClass: 'text-sm text-white/50 font-serif leading-relaxed italic',
  },
  {
    id: 'perspectives',
    title: 'Echoes',
    text: 'When all the facts are laid bare, you realize —\nthe real monster was never in the Upside Down.\nIt was always about growing up.',
    position: { x: 620, y: 350 },
    camera: { x: 740, y: 520, zoom: 1.05 },
    cardIds: ['hopper_letter', 'growing_up'],
  },
];

const QUOTES: Record<string, string> = {
  'eleven': '"Friends don\'t lie."',
  'mike': '"She\'s our friend and she\'s crazy!"',
  'will': '"It\'s like home... but it\'s so dark."',
};

// ===========================================================================
// Canvas Components (UNCHANGED from original)
// ===========================================================================

function SectionHeader({
  section, state, isInstant, isDimmed, displayTitle, onTypewriterDone, onSectionClick
}: {
  section: NarrativeSection;
  state: 'hidden' | 'title' | 'text' | 'complete';
  isInstant: boolean; isDimmed: boolean; displayTitle?: string;
  onTypewriterDone?: () => void;
  onSectionClick?: () => void;
}) {
  if (state === 'hidden') return null;
  const titleText = displayTitle || section.title;
  const showTitle = !!titleText;
  const showText = state === 'text' || state === 'complete';
  const isClickable = isInstant && !!onSectionClick && section.cardIds.length > 0;
  return (
    <div className={`absolute z-10 w-[500px] transition-opacity duration-700 ${isClickable ? 'pointer-events-auto' : 'pointer-events-none'}`}
      style={{ transform: `translate(${section.position.x}px, ${section.position.y}px)`, opacity: isDimmed ? 0 : 1 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT_QUART }}>
        {showTitle && (
          <h2 onClick={isClickable ? onSectionClick : undefined}
            className={`font-serif text-5xl font-bold mb-5 tracking-tight ${section.titleClass || 'text-white/80'} ${isClickable ? 'cursor-pointer hover:text-white transition-colors duration-200' : ''}`}>
            {isInstant ? titleText : <Typewriter text={titleText} speed={100} onComplete={state === 'title' ? onTypewriterDone : undefined} />}
          </h2>
        )}
        {showText && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
            className={`whitespace-pre-line max-w-md ${section.textClass || 'text-sm text-white/40 leading-relaxed'}`}>
            {isInstant ? section.text : <Typewriter text={section.text} speed={38} onComplete={state === 'text' ? onTypewriterDone : undefined} />}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

function CharacterQuote({ cardId, text, position, isInstant, isDimmed }: {
  cardId: string; text: string; position: { x: number; y: number }; isInstant: boolean; isDimmed: boolean;
}) {
  return (
    <div className="absolute pointer-events-none z-10 w-[176px] transition-opacity duration-700"
      style={{ transform: `translate(${position.x}px, ${position.y + 210}px)`, opacity: isDimmed ? 0.15 : 1 }}>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_QUART }}>
        <p className="text-[11px] italic text-white/30 font-serif leading-relaxed">
          {isInstant ? text : <Typewriter text={text} speed={45} />}
        </p>
      </motion.div>
    </div>
  );
}

const ArchiveCard = ({ item, isPaths, onClick, onPositionChange, isDraggable, isDimmed, overridePosition, isGridMode }: {
  item: ArchiveItem; isPaths: boolean; onClick: () => void;
  onPositionChange: (id: string, x: number, y: number) => void; isDraggable: boolean; isDimmed: boolean;
  overridePosition?: { x: number; y: number }; isGridMode?: boolean;
}) => {
  const rotation = useMemo(() => (Math.random() * 10 - 5), []);
  const displayX = overridePosition ? overridePosition.x : item.position.x;
  const displayY = overridePosition ? overridePosition.y : item.position.y;
  const x = useMotionValue(displayX);
  const y = useMotionValue(displayY);
  useEffect(() => { x.set(displayX); y.set(displayY); }, [displayX, displayY]);
  const cardClass = useMemo(() => {
    switch (item.type) {
      case 'character': return 'polaroid w-44';
      case 'location': return 'blueprint w-64';
      case 'event': return 'newspaper-clip w-56';
      case 'secret': return 'newspaper-clip w-56';
      case 'perspective': return 'handwritten-note w-52';
      default: return '';
    }
  }, [item.type]);
  return (
    <motion.div drag={isDraggable} dragMomentum={false}
      onDrag={() => onPositionChange(item.id, x.get(), y.get())}
      style={{ x, y, rotate: isGridMode ? 0 : rotation }} className="absolute transition-opacity duration-700"
      animate={{ opacity: isDimmed ? 0 : 1 }} transition={{ duration: 0.7 }}>
      <motion.div initial={{ opacity: 0, scale: 0.88, y: -30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
        whileHover={isDraggable ? { scale: 1.04, transition: { duration: 0.2, ease: EASE_OUT_QUART } } : undefined}
        onClick={onClick}
        className={`${cardClass} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} transition-colors duration-500 ${isPaths && item.type === 'character' ? 'border-blue-400/50 bg-blue-50/10' : ''}`}>
        {item.type === 'character' && (
          <>
            <div className="aspect-[3/4] bg-gray-200 overflow-hidden mb-2 relative">
              <img src={item.image} className={`w-full h-full object-cover transition-[filter] duration-700 ${isPaths ? 'grayscale-0 brightness-110 sepia-[.2] blue-filter' : 'grayscale'}`} referrerPolicy="no-referrer" />
            </div>
            <p className={`font-serif text-center text-xs font-bold transition-colors duration-500 ${isPaths ? 'text-blue-200' : 'text-black'}`}>{item.title}</p>
          </>
        )}
        {item.type === 'location' && (
          <>
            <div className="flex items-center gap-2 mb-2 border-b border-blue-300/20 pb-1">
              <MapIcon size={12} /><span className="text-[10px] font-bold uppercase tracking-tighter">Geo Specimen: {item.title}</span>
            </div>
            {item.image && <img src={item.image} className="w-full h-24 object-cover opacity-60 mb-2 grayscale" referrerPolicy="no-referrer" />}
            <div className="text-[10px] leading-tight opacity-80 prose prose-invert max-w-none">
              <Markdown>{item.content.substring(0, 60) + '...'}</Markdown>
            </div>
          </>
        )}
        {item.type === 'event' && (
          <>
            <h4 className="font-serif font-bold text-sm mb-2 border-b border-black/20 pb-1 text-black/90">{item.title}</h4>
            <div className="text-[10px] leading-relaxed font-mono text-black/70 prose max-w-none">
              <Markdown>{item.content.substring(0, 80) + '...'}</Markdown>
            </div>
            <div className="mt-2 text-[8px] font-mono text-black/40 text-right">REF: {item.metadata?.time || 'UNKNOWN'}</div>
          </>
        )}
        {item.type === 'secret' && (
          <>
            <div className="flex items-center justify-between mb-2 border-b border-black/15 pb-1">
              <span className="text-[8px] font-mono font-bold text-red-700/80 tracking-wider uppercase">⬤ Classified</span>
              <span className="text-[7px] font-mono text-black/30">{item.metadata?.level || 'TOP SECRET'}</span>
            </div>
            <h4 className="font-serif font-bold text-sm mb-2 text-black/90">{item.title}</h4>
            <div className="text-[10px] leading-relaxed font-mono text-black/60">
              {item.content.replace(/[*#_`\[\]]/g, '').substring(0, 70)}...
            </div>
            <div className="mt-2 text-[8px] font-mono text-black/30 text-right">SRC: {item.metadata?.source || 'REDACTED'}</div>
          </>
        )}
        {item.type === 'perspective' && (
          <>
            <div className="text-[11px] leading-relaxed italic text-black/70 prose prose-invert max-w-none">
              <Markdown>{`"${item.content.substring(0, 100)}..."`}</Markdown>
            </div>
            <div className="mt-3 text-[9px] font-bold text-titan-red/50">— {item.metadata?.author || 'Unknown'}</div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

// (Sidebar removed — all navigation is now via floating canvas controls)

// ===========================================================================
// Section Grid View (cards in grid, same visual styles as canvas)
// ===========================================================================

function SectionCardContent({ item }: { item: ArchiveItem }) {
  switch (item.type) {
    case 'character':
      return (
        <div className="polaroid !w-full">
          <div className="aspect-[3/4] bg-gray-200 overflow-hidden mb-2 relative">
            {(item.image || item.cover) ? (
              <img src={item.image || item.cover} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="font-serif text-3xl text-gray-500">{item.title.charAt(0)}</span>
              </div>
            )}
          </div>
          <p className="font-serif text-center text-xs font-bold text-black">{item.title}</p>
        </div>
      );
    case 'location':
      return (
        <div className="blueprint !w-full">
          <div className="flex items-center gap-2 mb-2 border-b border-blue-300/20 pb-1">
            <MapIcon size={12} /><span className="text-[10px] font-bold uppercase tracking-tighter">Geo Specimen: {item.title}</span>
          </div>
          {item.image && <img src={item.image} className="w-full h-24 object-cover opacity-60 mb-2 grayscale" referrerPolicy="no-referrer" />}
          <div className="text-[10px] leading-tight opacity-80 prose prose-invert max-w-none">
            <Markdown>{item.content.substring(0, 80) + '...'}</Markdown>
          </div>
        </div>
      );
    case 'event':
      return (
        <div className="newspaper-clip !w-full">
          <h4 className="font-serif font-bold text-sm mb-2 border-b border-black/20 pb-1 text-black/90">{item.title}</h4>
          <div className="text-[10px] leading-relaxed font-mono text-black/70 prose max-w-none">
            <Markdown>{item.content.substring(0, 100) + '...'}</Markdown>
          </div>
          <div className="mt-2 text-[8px] font-mono text-black/40 text-right">REF: {item.metadata?.time || 'UNKNOWN'}</div>
        </div>
      );
    case 'secret':
      return (
        <div className="newspaper-clip !w-full">
          <div className="flex items-center justify-between mb-2 border-b border-black/15 pb-1">
            <span className="text-[8px] font-mono font-bold text-red-700/80 tracking-wider uppercase">⬤ Classified</span>
            <span className="text-[7px] font-mono text-black/30">{item.metadata?.level || 'TOP SECRET'}</span>
          </div>
          <h4 className="font-serif font-bold text-sm mb-2 text-black/90">{item.title}</h4>
          <div className="text-[10px] leading-relaxed font-mono text-black/60">
            {item.content.replace(/[*#_`\[\]]/g, '').substring(0, 100)}...
          </div>
          <div className="mt-2 text-[8px] font-mono text-black/30 text-right">SRC: {item.metadata?.source || 'REDACTED'}</div>
        </div>
      );
    case 'perspective':
      return (
        <div className="handwritten-note !w-full !rotate-0">
          <div className="text-[11px] leading-relaxed italic text-black/70 prose prose-invert max-w-none">
            <Markdown>{`"${item.content.substring(0, 120)}..."`}</Markdown>
          </div>
          <div className="mt-3 text-[9px] font-bold text-titan-red/50">— {item.metadata?.author || 'Unknown'}</div>
        </div>
      );
    default:
      return (
        <div className="bg-white/[0.06] border border-white/10 rounded-lg p-4">
          <h4 className="font-serif font-bold text-sm text-white/80">{item.title}</h4>
          <p className="text-[11px] text-white/40 mt-1">{item.content.substring(0, 60)}...</p>
        </div>
      );
  }
}

function SectionGridView({ sectionId, items, onOpen, onBack, onCreate }: {
  sectionId: string;
  items: ArchiveItem[];
  onOpen: (id: string) => void;
  onBack: () => void;
  onCreate: () => void;
}) {
  const section = NARRATIVE_SECTIONS.find(s => s.id === sectionId);
  if (!section) return null;

  const sectionType = SECTION_TYPE_MAP[sectionId];
  const sectionItems = useMemo(
    () => items.filter(i => i.type === sectionType),
    [items, sectionType]
  );

  // Grid columns adjusted for floating panel layout
  const gridColsAdj = sectionType === 'character' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.35, ease: EASE_OUT_QUART }}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm">

      {/* Floating section panel — leaves space for left nav & right agent */}
      <div className="absolute top-4 bottom-4 left-[200px] right-[440px] min-w-[480px] overflow-y-auto workspace-scroll agent-panel">

      <div className="px-10 pt-8 pb-20">
        {/* Section Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_QUART, delay: 0.05 }}>
          <h2 className={`font-serif text-5xl font-bold tracking-tight mb-4 ${section.titleClass || 'text-white/80'}`}>
            {section.title}
          </h2>
          <p className={`whitespace-pre-line max-w-lg mb-6 ${section.textClass || 'text-sm text-white/35 leading-relaxed'}`}>
            {section.text}
          </p>
          <div className="flex items-center gap-4 mb-10">
            <span className="font-mono text-[11px] text-white/20">{sectionItems.length} items</span>
            <button onClick={onCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-white/10 text-white/30 text-[11px] font-mono hover:border-white/20 hover:text-white/50 hover:bg-white/[0.03] transition-all duration-200">
              <Plus size={12} /><span>New</span>
            </button>
          </div>
        </motion.div>

        {/* Card Grid */}
        {sectionItems.length === 0 ? (
          <div className="text-center py-20 text-white/15 font-mono text-[12px]">No items yet — create one to get started</div>
        ) : (
          <div className={`grid ${gridColsAdj} gap-6`}>
            {sectionItems.map((item, idx) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE_OUT_QUART, delay: 0.1 + idx * 0.04 }}
                onClick={() => onOpen(item.id)}
                className="cursor-pointer group">
                <div className="transition-transform duration-200 group-hover:scale-[1.03] group-hover:-translate-y-1">
                  <SectionCardContent item={item} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );
}

// ===========================================================================
// Canvas Timeline (vertical spine at bottom of canvas)
// ===========================================================================

function CanvasTimeline({ items, isVisible, isInstant, onEventClick, mode = 'carousel' }: {
  items: ArchiveItem[];
  isVisible: boolean;
  isInstant: boolean;
  onEventClick: (id: string) => void;
  mode?: 'carousel' | 'expanded';
}) {
  const timelineEvents = useMemo(() =>
    items
      .filter(i => i.type === 'event' && i.timeline)
      .sort((a, b) => (a.timeline!.date > b.timeline!.date ? 1 : -1)),
    [items]
  );

  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (mode !== 'carousel' || timelineEvents.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % timelineEvents.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [mode, timelineEvents.length]);

  if (!isVisible || timelineEvents.length === 0) return null;

  // --- CAROUSEL MODE (overview) ---
  // Shows 3 strip cards, continuous vertical scroll — whole strip list shifts up smoothly
  if (mode === 'carousel') {
    const carouselX = 20;
    const carouselY = 530;
    const stripW = 300;
    const stripH = 42;
    const gap = 7;
    const step = stripH + gap;
    const visibleCount = 3;
    const totalH = stripH * visibleCount + gap * (visibleCount - 1);

    // Build a window of 5 items (1 above + 3 visible + 1 below) for smooth entry/exit
    const windowIndices = [];
    for (let offset = -1; offset <= visibleCount; offset++) {
      windowIndices.push((carouselIndex + offset + timelineEvents.length) % timelineEvents.length);
    }

    return (
      <div className="absolute pointer-events-auto z-[8]"
        style={{ transform: `translate(${carouselX}px, ${carouselY}px)` }}>

        {/* Mini spine line */}
        <div className="absolute" style={{
          width: 1, height: totalH + 20,
          left: -10, top: -6,
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12) 8%, rgba(255,255,255,0.12) 92%, transparent)',
        }} />

        {/* Strips container — clip only vertically */}
        <div className="relative" style={{ height: totalH, width: stripW + 20, overflowY: 'hidden', overflowX: 'visible' }}>
          <AnimatePresence initial={false}>
            {windowIndices.map((eventIdx, i) => {
              const event = timelineEvents[eventIdx];
              // Position: offset -1 is above viewport, 0-2 are visible, 3 is below
              const slotY = (i - 1) * step;
              return (
                <motion.div
                  key={`${carouselIndex}-${eventIdx}`}
                  initial={{ y: slotY + step }}
                  animate={{ y: slotY }}
                  exit={{ y: slotY - step }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute left-0 right-0"
                >
                  <div className="relative">
                    {/* Spine dot */}
                    <div className="absolute" style={{ left: -12.5, top: stripH / 2 - 3 }}>
                      <div className={`rounded-full ${i === 1 ? 'w-[7px] h-[7px] bg-white/30 border border-white/40' : 'w-[5px] h-[5px] bg-white/15'}`} />
                    </div>
                    {/* Strip */}
                    <div
                      onClick={() => onEventClick(event.id)}
                      className="rounded-sm border border-white/[0.08] hover:border-white/20 cursor-pointer transition-colors duration-200 flex items-center"
                      style={{
                        width: stripW, height: stripH,
                        background: 'linear-gradient(135deg, rgba(245,240,230,0.85) 0%, rgba(235,228,215,0.78) 100%)',
                      }}
                    >
                      <div className="flex h-full px-3 gap-2.5 items-center w-full">
                        <span className="font-mono text-[8px] font-bold text-stone-500/65 uppercase tracking-wider whitespace-nowrap shrink-0">
                          {event.timeline!.dateLabel}
                        </span>
                        <div className="w-px h-3.5 bg-stone-400/15 shrink-0" />
                        <h4 className="font-serif text-[12px] font-bold text-stone-800/90 truncate">
                          {event.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Counter */}
        <div className="mt-2">
          <span className="font-mono text-[8px] text-white/20">
            {carouselIndex + 1} / {timelineEvents.length}
          </span>
        </div>
      </div>
    );
  }

  // --- EXPANDED MODE (section zoom-in) ---
  // Single vertical timeline with compact strip cards.
  // Spine tight against left edge of strips, date labels on left, content on right.
  const stripW = 400;
  const stripH = 72;
  const stripGap = 12;
  const rowStep = stripH + stripGap;
  const spineX = -300;
  const originY = -180;
  const stripX = spineX + 14; // strip starts just right of spine
  const totalHeight = (timelineEvents.length - 1) * rowStep + stripH;

  return (
    <div className="absolute pointer-events-auto z-[8]">
      {/* Vertical spine line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.2 }}
        className="absolute origin-top"
        style={{
          width: 1,
          height: totalHeight + 50,
          top: originY - 10,
          left: spineX,
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.18) 3%, rgba(255,255,255,0.18) 97%, transparent)',
        }}
      />

      {/* Timeline strips */}
      {timelineEvents.map((event, i) => {
        const y = originY + i * rowStep;
        const centerY = y + stripH / 2;
        const year = event.timeline!.date.substring(0, 4);
        const prevYear = i > 0 ? timelineEvents[i - 1].timeline!.date.substring(0, 4) : '';
        const isNewEra = year !== prevYear;
        const contentPreview = event.content.replace(/[*#`]/g, '').substring(0, 60) + '...';

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_QUART, delay: 0.3 + i * 0.05 }}
            className="absolute"
            style={{ top: y, left: spineX - 80 }}
          >
            {/* Node dot on spine */}
            <div className="absolute" style={{ top: stripH / 2 - 4, left: 80 - 4 }}>
              <div className={`rounded-full z-10 ${isNewEra ? 'w-[9px] h-[9px] bg-white/35 border border-white/50' : 'w-[7px] h-[7px] bg-white/20 border border-white/30'}`} />
            </div>

            {/* Date label left of spine */}
            <div className="absolute text-right" style={{ top: stripH / 2 - 7, right: stripW + 80 - spineX + spineX + 92, width: 70, left: 0 }}>
              {isNewEra && (
                <span className="font-mono text-[10px] text-white/45 font-semibold whitespace-nowrap">
                  {event.timeline!.dateLabel}
                </span>
              )}
            </div>

            {/* Strip card */}
            <div
              onClick={() => onEventClick(event.id)}
              className="absolute cursor-pointer group rounded-sm border border-white/[0.08] hover:border-white/20 transition-all duration-200"
              style={{
                left: 94,
                top: 0,
                width: stripW,
                height: stripH,
                background: 'linear-gradient(135deg, rgba(245,240,230,0.95) 0%, rgba(235,228,215,0.92) 100%)',
              }}
            >
              <div className="flex h-full px-4 py-2.5 gap-4">
                {/* Date badge */}
                <div className="flex items-center shrink-0">
                  <span className="font-mono text-[9px] text-stone-500/70 font-bold uppercase tracking-wider whitespace-nowrap">
                    {event.timeline!.dateLabel}
                  </span>
                </div>
                {/* Divider */}
                <div className="w-px bg-stone-400/20 shrink-0" />
                {/* Content */}
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <h4 className="font-serif text-[13px] font-bold text-stone-800 truncate group-hover:text-stone-950 transition-colors">
                    {event.title}
                  </h4>
                  <p className="font-mono text-[9px] text-stone-500/60 truncate mt-0.5">
                    {contentPreview}
                  </p>
                </div>
                {/* Impact tag */}
                {event.metadata?.impact && (
                  <div className="flex items-center shrink-0">
                    <span className="font-mono text-[8px] text-stone-400/50 uppercase tracking-wider whitespace-nowrap">
                      {event.metadata.impact}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* End cap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 + timelineEvents.length * 0.05 + 0.2 }}
        className="absolute flex flex-col items-center gap-1.5"
        style={{ top: originY + totalHeight + 30, left: spineX, transform: 'translateX(-50%)' }}
      >
        <div className="w-px h-5 bg-gradient-to-b from-white/[0.1] to-transparent" />
        <span className="font-mono text-[8px] text-white/15 tracking-[0.2em]">TO BE CONTINUED</span>
      </motion.div>
    </div>
  );
}

// ===========================================================================
// Document Detail
// ===========================================================================

function DocumentDetail({ item, items, onClose, onUpdate, onNavigateItem }: {
  item: ArchiveItem;
  items: ArchiveItem[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ArchiveItem>) => void;
  onNavigateItem: (id: string) => void;
}) {
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const [editTitle, setEditTitle] = useState(item.title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setEditContent(item.content); setEditTitle(item.title); }, [item.id]);

  useEffect(() => {
    if (isEditingContent && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [isEditingContent, editContent]);

  const saveContent = () => {
    onUpdate(item.id, { content: editContent, updatedAt: Date.now() });
    setIsEditingContent(false);
  };

  const saveTitle = () => {
    onUpdate(item.id, { title: editTitle, updatedAt: Date.now() });
    setIsEditingTitle(false);
  };

  const coverSrc = item.cover || item.image;
  const connectedItems = useMemo(() => {
    if (!item.connections) return [];
    return item.connections.map(id => items.find(i => i.id === id)).filter(Boolean) as ArchiveItem[];
  }, [item.connections, items]);

  const proseClass = item.type === 'story' ? 'workspace-prose workspace-prose-story'
    : item.type === 'perspective' ? 'workspace-prose workspace-prose-perspective'
    : 'workspace-prose';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE_OUT_QUART } }}
      className="absolute inset-0">

      {/* Content area — left space for nav sidebar, right space for agent panel */}
      <div className="absolute top-0 bottom-0 left-[180px] right-[420px] overflow-y-auto workspace-scroll">

        {/* Top bar */}
        <div className="sticky top-0 z-10 h-12 flex items-center px-8 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/[0.03]">
          <button onClick={onClose}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 text-[12px] font-mono transition-colors duration-200">
            <ChevronLeft size={16} /><span>Back</span>
          </button>
        </div>

        {/* Content */}
        <div className="max-w-[640px] mx-auto px-8 pb-24">
          {/* Cover */}
          <div className="w-full h-[260px] mt-2 relative overflow-hidden rounded-lg">
            {coverSrc ? (
              <>
                <img src={coverSrc} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 40%, #0a0a0a 100%)' }} />
              </>
            ) : (
              <div className="w-full h-full rounded-lg" style={{ background: COVER_GRADIENTS[item.type] || COVER_GRADIENTS.character }} />
            )}
          </div>

          {/* Type badge */}
          <div className="mt-6 mb-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLORS[item.type] }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25">{item.type}</span>
          </div>

          {/* Title */}
          {isEditingTitle ? (
            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
              onBlur={saveTitle} onKeyDown={e => { if (e.key === 'Enter') saveTitle(); }}
              autoFocus
              className="font-serif text-[40px] font-bold leading-[1.15] tracking-tight text-white/90 bg-transparent outline-none w-full border-b border-white/10 pb-1" />
          ) : (
            <h1 onClick={() => setIsEditingTitle(true)}
              className="font-serif text-[40px] font-bold leading-[1.15] tracking-tight text-white/90 cursor-text hover:text-white transition-colors duration-200">
              {item.title}
            </h1>
          )}

          {/* Secret watermark */}
          {item.type === 'secret' && (
            <div className="relative overflow-hidden pointer-events-none select-none h-0">
              <span className="absolute -top-20 -right-10 font-mono text-[80px] text-red-500/[0.04] rotate-[-15deg] font-bold">
                CLASSIFIED
              </span>
            </div>
          )}

          {/* Content */}
          <div className="mt-8">
            {isEditingContent ? (
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 mb-4">
                  Editing · Markdown supported · Click outside to save
                </div>
                <textarea ref={textareaRef} value={editContent}
                  onChange={e => { setEditContent(e.target.value); }}
                  onBlur={saveContent}
                  className="w-full min-h-[400px] bg-transparent font-mono text-[14px] leading-[1.75] text-white/70 outline-none resize-none placeholder:text-white/15"
                  placeholder="Start writing..." />
              </div>
            ) : (
              <div onClick={() => setIsEditingContent(true)} className={`${proseClass} cursor-text`}>
                <Markdown>{item.content}</Markdown>
              </div>
            )}
          </div>

          {/* Connections */}
          {connectedItems.length > 0 && (
            <div className="mt-16 pt-8 border-t border-white/[0.06]">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/20 mb-4">Connected</p>
              <div className="flex flex-wrap gap-2">
                {connectedItems.map(ci => (
                  <button key={ci.id} onClick={() => onNavigateItem(ci.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200">
                    {(ci.cover || ci.image) ? (
                      <img src={ci.cover || ci.image} className="w-5 h-5 rounded-full object-cover grayscale" />
                    ) : (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: TYPE_COLORS[ci.type] + '20' }}>
                        <span className="text-[8px]" style={{ color: TYPE_COLORS[ci.type] }}>{ci.title.charAt(0)}</span>
                      </div>
                    )}
                    <span className="text-[12px] text-white/50">{ci.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ===========================================================================
// Asset Detail
// ===========================================================================

function AssetDetail({ item, onClose, onUpdate }: {
  item: ArchiveItem; onClose: () => void; onUpdate: (id: string, updates: Partial<ArchiveItem>) => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);

  useEffect(() => { setEditTitle(item.title); }, [item.id]);

  const saveTitle = () => {
    onUpdate(item.id, { title: editTitle, updatedAt: Date.now() });
    setIsEditingTitle(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE_OUT_QUART } }}
      className="absolute inset-0">

      {/* Content area — left space for nav sidebar, right space for agent panel */}
      <div className="absolute top-0 bottom-0 left-[180px] right-[420px] overflow-y-auto workspace-scroll">
        <div className="sticky top-0 z-10 h-12 flex items-center px-8 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/[0.03]">
          <button onClick={onClose}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 text-[12px] font-mono transition-colors duration-200">
            <ChevronLeft size={16} /><span>Back</span>
          </button>
        </div>

        <div className="max-w-[700px] mx-auto px-8 pb-20">
          <div className="w-full mt-6 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
            {item.type === 'image' && <img src={item.content} className="w-full max-h-[60vh] object-contain mx-auto bg-[#080808]" />}
            {item.type === 'video' && <video src={item.content} controls className="w-full max-h-[60vh] rounded-xl" />}
            {item.type === 'game' && <iframe src={item.content} className="w-full aspect-video border-none" />}
          </div>

          <div className="mt-6">
            {isEditingTitle ? (
              <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                onBlur={saveTitle} onKeyDown={e => { if (e.key === 'Enter') saveTitle(); }}
                autoFocus
                className="font-serif text-[28px] font-bold text-white/85 bg-transparent outline-none w-full border-b border-white/10 pb-1" />
            ) : (
              <h1 onClick={() => setIsEditingTitle(true)}
                className="font-serif text-[28px] font-bold text-white/85 cursor-text hover:text-white transition-colors duration-200">
                {item.title}
              </h1>
            )}
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLORS[item.type] }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25">{item.type}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===========================================================================
// Unified AI Agent Panel (narrative build log → interactive chat)
// ===========================================================================

interface AIMessage { role: 'user' | 'assistant' | 'system'; content: string; }

// Creative suggestion prompts shown when agent panel expands after world build
const CREATIVE_SUGGESTIONS = [
  { icon: <User size={13} />, label: 'Create a new character', prompt: 'Create a new character for this world' },
  { icon: <MapPin size={13} />, label: 'Discover a hidden location', prompt: 'Invent a hidden location in this world' },
  { icon: <Flame size={13} />, label: 'Write the next event', prompt: 'What event happens next in this world?' },
  { icon: <Lock size={13} />, label: 'Uncover a secret', prompt: 'Reveal a hidden secret about this world' },
  { icon: <PenLine size={13} />, label: 'Write a perspective', prompt: 'Write a first-person perspective from someone in this world' },
];

function WorldAgentPanel({
  worldName, phase, activeSectionIndex, isExpanded, onToggleExpand
}: {
  worldName: string;
  phase: 'narrating' | 'free';
  activeSectionIndex: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const isNarrating = phase === 'narrating';
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);
  const [showBuildLog, setShowBuildLog] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasTransitioned, setHasTransitioned] = useState(false);

  // When transitioning from narrating → free, add welcome message and auto-expand
  useEffect(() => {
    if (!isNarrating && !hasTransitioned) {
      setHasTransitioned(true);
      setTimeout(() => {
        setShowBuildLog(false);
        setMessages([
          { role: 'system', content: `World built · ${worldName}` },
          { role: 'assistant', content: `**${worldName}** is ready to explore.\n\nI'm your creative partner — I can help you generate characters, events, locations, secrets, and more. Pick a suggestion below or ask me anything about this world.` },
        ]);
        onToggleExpand(); // auto-expand
      }, 600);
      setTimeout(() => { inputRef.current?.focus(); }, 1200);
    }
  }, [isNarrating, hasTransitioned, worldName, onToggleExpand]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  // Thinking timer
  useEffect(() => {
    if (!isTyping) { setThinkingTime(0); return; }
    const interval = setInterval(() => setThinkingTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isTyping]);

  const handleSubmit = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isNarrating) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I understand you want to explore "${msg}". This is a prototype — in the full version, I'll use AI to generate rich world content, create new entities, and help you build your story.`
      }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const visibleSteps = AGENT_STEPS.filter(step => step.sectionIndex <= activeSectionIndex);
  const showSuggestions = isExpanded && !isNarrating && !showBuildLog && messages.length <= 2 && !isTyping;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.3 } }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className={`fixed z-[88] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        isNarrating
          ? 'bottom-20 right-6 w-[300px]'
          : isExpanded
            ? 'top-4 right-4 bottom-4 w-[400px]'
            : 'bottom-6 right-6 w-[340px]'
      }`}
    >
      <motion.div
        layout
        className={`agent-panel flex flex-col overflow-hidden ${
          isNarrating ? 'max-h-[320px]' : isExpanded ? 'h-full' : 'max-h-[420px]'
        }`}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors duration-200"
          onClick={!isNarrating ? onToggleExpand : undefined}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04]">
              <div className={`w-2 h-2 rounded-full ${isNarrating ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <div className={`absolute w-2 h-2 rounded-full ${isNarrating ? 'bg-amber-400/40 animate-ping' : 'bg-emerald-400/20 animate-pulse'}`} />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70 font-medium">
                World Agent
              </span>
              {isNarrating && (
                <span className="font-mono text-[9px] text-amber-400/60 tracking-wide">building world...</span>
              )}
            </div>
          </div>
          {!isNarrating && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
              className="p-1.5 rounded-md text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition-all duration-150"
            >
              {isExpanded ? <ChevronLeft size={14} className="rotate-[-90deg]" /> : <ChevronLeft size={14} className="rotate-90" />}
            </button>
          )}
        </div>

        {/* Build Log (during narrative + briefly after) */}
        <AnimatePresence>
          {(isNarrating || showBuildLog) && (
            <motion.div
              initial={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3 mx-3 mb-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">Build Progress</span>
                  <span className="font-mono text-[10px] text-white/20">{visibleSteps.filter(s => s.sectionIndex < activeSectionIndex).length}/{AGENT_STEPS.length}</span>
                </div>
                {visibleSteps.map((step, i) => {
                  const isCurrent = step.sectionIndex === activeSectionIndex;
                  const isDone = step.sectionIndex < activeSectionIndex;
                  return (
                    <motion.div
                      key={step.sectionIndex}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT_QUART, delay: i === visibleSteps.length - 1 ? 0.2 : 0 }}
                      className={`flex items-center gap-2.5 py-1 px-2 rounded-lg transition-colors duration-300 ${isCurrent ? 'bg-white/[0.03]' : ''}`}
                    >
                      {isDone ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                          <span className="text-[9px] text-emerald-400">✓</span>
                        </div>
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                          <motion.div className="w-1.5 h-1.5 rounded-full bg-amber-400"
                            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-white/[0.04] shrink-0" />
                      )}
                      <span className={`font-mono leading-tight ${
                        isCurrent ? 'text-[11px] text-white/65' : isDone ? 'text-[11px] text-white/30' : 'text-[11px] text-white/15'
                      }`}>{step.message}</span>
                      {isDone && <span className="ml-auto text-[9px] font-mono text-white/15">Done</span>}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Messages (free mode) */}
        {!isNarrating && !showBuildLog && (
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT_QUART, delay: i * 0.05 }}>
                {msg.role === 'system' ? (
                  <div className="flex items-center gap-3 py-3">
                    <div className="h-px flex-1 bg-white/[0.06]" />
                    <p className="text-[10px] font-mono text-white/25 shrink-0">{msg.content}</p>
                    <div className="h-px flex-1 bg-white/[0.06]" />
                  </div>
                ) : msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-white/[0.08] rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] text-white/80 leading-relaxed max-w-[85%]">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                      <Compass size={12} className="text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-white/60 leading-[1.75]">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Creative Suggestions */}
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_QUART, delay: 0.3 }}
                className="pt-3 pb-1"
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 mb-3 px-1">Try creating</p>
                <div className="flex flex-col gap-1.5">
                  {CREATIVE_SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT_QUART, delay: 0.4 + i * 0.06 }}
                      onClick={() => handleSubmit(s.prompt)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-[12px] text-white/45 hover:text-white/80 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.12] transition-all duration-200 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.08] flex items-center justify-center transition-colors duration-200 shrink-0">
                        <span className="text-white/25 group-hover:text-white/60 transition-colors duration-200">{s.icon}</span>
                      </div>
                      <span className="font-medium">{s.label}</span>
                      <ChevronLeft size={12} className="ml-auto rotate-180 text-white/10 group-hover:text-white/30 transition-colors duration-200" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Thinking indicator */}
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                  <Compass size={12} className="text-white/40" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-violet-400/60"
                      animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                    <span className="text-[11px] font-mono text-white/35">Thinking</span>
                    {thinkingTime > 0 && (
                      <span className="text-[10px] font-mono text-white/20">{thinkingTime}s</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input area */}
        <div className="flex-shrink-0 px-3 pb-3 pt-2">
          <div className={`flex items-center gap-2 rounded-xl border transition-all duration-200 ${
            isNarrating
              ? 'bg-white/[0.02] border-white/[0.04]'
              : 'bg-white/[0.03] border-white/[0.06] focus-within:border-white/[0.15] focus-within:bg-white/[0.05]'
          }`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && input.trim()) handleSubmit(); }}
              placeholder={isNarrating ? 'Building world...' : 'Ask anything, or describe what to create...'}
              disabled={isNarrating}
              className="flex-1 bg-transparent px-4 py-2.5 text-[12px] outline-none text-white/80 placeholder:text-white/20 disabled:text-white/15 disabled:placeholder:text-white/10 disabled:cursor-not-allowed"
            />
            <div className="flex items-center gap-0.5 pr-1.5">
              {!isNarrating && (
                <button className="p-2 rounded-lg text-white/15 hover:text-white/40 hover:bg-white/[0.04] transition-all duration-150">
                  <Plus size={14} />
                </button>
              )}
              <button
                onClick={() => { if (input.trim()) handleSubmit(); }}
                disabled={isNarrating}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isNarrating
                    ? 'text-white/10 cursor-not-allowed'
                    : input.trim()
                      ? 'text-white bg-white/[0.12] hover:bg-white/[0.18]'
                      : 'text-white/15 hover:text-white/30 hover:bg-white/[0.04]'
                }`}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
          {/* Model indicator */}
          {!isNarrating && (
            <div className="flex items-center gap-1.5 mt-1.5 px-2">
              <Compass size={10} className="text-white/15" />
              <span className="text-[10px] font-mono text-white/15">Gemini 2.5</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===========================================================================
// Helper Components
// ===========================================================================

function ControlButton({ active, onClick, icon, label, color = 'red' }: {
  active?: boolean; onClick: () => void; icon: React.ReactNode; label: string; color?: 'red' | 'blue';
}) {
  const activeClass = color === 'blue'
    ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]'
    : 'bg-titan-red text-white shadow-[0_0_20px_rgba(136,8,8,0.5)]';
  return (
    <div className="group flex items-center gap-3">
      <button onClick={onClick}
        className={`p-3 rounded-full transition-colors duration-200 ${active ? activeClass : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'}`}>
        {icon}
      </button>
      <span className={`text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap ${active ? 'text-white' : 'text-white/40'}`}>
        {label}
      </span>
    </div>
  );
}

function Typewriter({ text, speed = 30, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const isDone = currentIndex >= text.length;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onCompleteRef.current) { onCompleteRef.current(); }
  }, [currentIndex, text, speed]);
  return <span className={isDone ? '' : 'cursor-blink'}>{displayedText}</span>;
}

function TableOfContents({ sections, items, activeView, onSectionClick, onCardClick, onOverview, onCreateNew, variant = 'floating' }: {
  sections: NarrativeSection[]; items: ArchiveItem[];
  activeView: ViewState;
  onSectionClick: (section: NarrativeSection) => void; onCardClick: (item: ArchiveItem) => void;
  onOverview: () => void;
  onCreateNew: () => void;
  variant?: 'floating' | 'flat';
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Determine which section is "active" (section grid or detail of an item in that section)
  const activeSectionId = activeView.kind === 'section'
    ? (activeView as { sectionId: string }).sectionId
    : activeView.kind === 'detail'
      ? (() => {
          const item = items.find(i => i.id === (activeView as { itemId: string }).itemId);
          if (!item) return null;
          const entry = Object.entries(SECTION_TYPE_MAP).find(([, type]) => type === item.type);
          return entry ? entry[0] : null;
        })()
      : null;

  // Auto-expand when active section changes
  useEffect(() => {
    if (activeSectionId) setExpandedId(activeSectionId);
  }, [activeSectionId]);

  const handleSectionClick = (section: NarrativeSection) => {
    if (expandedId === section.id && activeView.kind === 'overview') {
      setExpandedId(null);
    } else {
      setExpandedId(section.id);
    }
    onSectionClick(section);
  };

  const isNotOverview = activeView.kind !== 'overview';

  return (
    <nav className={`pointer-events-auto select-none px-3.5 py-3 ${variant === 'flat' ? 'bg-transparent border-r border-white/[0.04]' : 'nav-panel'}`}>
      {/* Overview button (when not in overview) */}
      {isNotOverview && (
        <button onClick={onOverview}
          className="flex items-center gap-2 py-1.5 px-1 mb-1 text-left text-white/30 hover:text-white/60 transition-colors duration-200 w-full">
          <ChevronLeft size={12} />
          <span className="font-mono text-[10px] uppercase tracking-widest">Overview</span>
        </button>
      )}
      <ul className="flex flex-col gap-0.5">
        {sections.map((section) => {
          const isActive = activeSectionId === section.id;
          const isOpen = expandedId === section.id;
          const sectionType = SECTION_TYPE_MAP[section.id];
          // Timeline: all events chronologically. Others: filter by type or cardIds.
          const sectionItems = section.id === 'timeline'
            ? items.filter(i => i.type === 'event' && i.timeline).sort((a, b) => (a.timeline!.date > b.timeline!.date ? 1 : -1))
            : sectionType
              ? items.filter(i => i.type === sectionType)
              : section.cardIds.map(id => items.find(i => i.id === id)).filter(Boolean) as ArchiveItem[];
          const count = sectionItems.length;

          // Highlight current detail item
          const activeItemId = activeView.kind === 'detail' ? (activeView as { itemId: string }).itemId : null;

          return (
            <li key={section.id}>
              <button onClick={() => handleSectionClick(section)}
                className={`flex items-center gap-2 py-1.5 px-1 text-left transition-colors duration-200 group w-full ${isActive ? 'text-white/90' : isOpen ? 'text-white/80' : 'text-white/30 hover:text-white/60'}`}>
                <span className={`w-3 text-[8px] font-mono transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                  {isActive ? '●' : '›'}
                </span>
                <span className="font-serif text-sm tracking-wide flex-1">{section.title}</span>
                <span className="font-mono text-[10px] text-white/15">{count}</span>
              </button>
              <AnimatePresence>
                {isOpen && sectionItems.length > 0 && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: EASE_OUT_QUART }}
                    className="overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar">
                    {sectionItems.map((si) => (
                      <li key={si.id}>
                        <button onClick={() => onCardClick(si)}
                          className={`w-full text-left pl-6 pr-2 py-1 text-[11px] transition-colors duration-200 truncate font-mono ${
                            activeItemId === si.id ? 'text-white/70' : 'text-white/25 hover:text-white/50'
                          }`}>
                          {si.title}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      {/* Create button */}
      <div className="mt-2 pt-2 border-t border-white/5">
        <button onClick={onCreateNew}
          className="flex items-center gap-2 py-1 px-1 text-white/20 hover:text-white/50 transition-colors duration-200 w-full">
          <Plus size={12} />
          <span className="font-mono text-[10px] uppercase tracking-widest">New</span>
        </button>
      </div>
    </nav>
  );
}

// --- Agent build steps (used by WorldAgentPanel) ---
const AGENT_STEPS: { sectionIndex: number; message: string }[] = [
  { sectionIndex: 0, message: 'Initializing world engine...' },
  { sectionIndex: 1, message: 'Parsing world lore...' },
  { sectionIndex: 2, message: 'Generating characters...' },
  { sectionIndex: 3, message: 'Mapping locations...' },
  { sectionIndex: 4, message: 'Classifying intel...' },
  { sectionIndex: 5, message: 'Building timeline...' },
  { sectionIndex: 6, message: 'Collecting perspectives...' },
];

// ===========================================================================
// Main App
// ===========================================================================

export default function App() {
  // Narrative state
  const [hasEntered, setHasEntered] = useState(false);
  const [worldInput, setWorldInput] = useState('');
  const [worldName, setWorldName] = useState('Stranger Things');
  const [narrativePhase, setNarrativePhase] = useState<'narrating' | 'free'>('narrating');
  const [sectionStates, setSectionStates] = useState<Record<number, 'hidden' | 'title' | 'text' | 'complete'>>({});
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [visibleQuotes, setVisibleQuotes] = useState<Set<string>>(new Set());
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const cancelRef = useRef(false);
  const typewriterResolveRef = useRef<(() => void) | null>(null);

  // View state
  const [view, setView] = useState<ViewState>({ kind: 'overview' });
  const [isAgentExpanded, setIsAgentExpanded] = useState(false);

  // Background music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}bgm.mp3`);
    audio.loop = true; audio.volume = 0.3; audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  const handleEnter = useCallback(() => {
    if (worldInput.trim()) setWorldName(worldInput.trim());
    setHasEntered(true);
    audioRef.current?.play();
  }, [worldInput]);

  useEffect(() => {
    if (narrativePhase !== 'free') return;
    const audio = audioRef.current;
    if (!audio) return;
    const fadeDuration = 4000, steps = 40, interval = fadeDuration / steps;
    const startVolume = audio.volume; let step = 0;
    const timer = setInterval(() => {
      step++; audio.volume = Math.max(0, startVolume * (1 - step / steps));
      if (step >= steps) { clearInterval(timer); audio.pause(); }
    }, interval);
    return () => clearInterval(timer);
  }, [narrativePhase]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    setIsMuted(m => { audioRef.current!.muted = !m; return !m; });
  }, []);

  // Data state
  const [isPathsMode, setIsPathsMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(ARCHIVE_DATA);

  const deskX = useMotionValue(0);
  const deskY = useMotionValue(0);
  const zoom = useMotionValue(1);

  const cameraSpring = { damping: 32, stiffness: 160 };
  const springX = useSpring(deskX, cameraSpring);
  const springY = useSpring(deskY, cameraSpring);
  const springZoom = useSpring(zoom, { damping: 28, stiffness: 180 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (viewportRef.current) setViewportSize({ width: viewportRef.current.clientWidth, height: viewportRef.current.clientHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const isFree = narrativePhase === 'free';

  const cardSectionMap = useMemo(() => {
    const map: Record<string, number> = {};
    NARRATIVE_SECTIONS.forEach((section, i) => { section.cardIds.forEach(id => { map[id] = i; }); });
    return map;
  }, []);

  const filteredItems = useMemo(() => {
    const visible = items.filter(item => isFree || revealedCards.has(item.id));
    if (!searchQuery) return visible;
    const q = searchQuery.toLowerCase();
    return visible.filter(item => item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q) || item.type.toLowerCase().includes(q));
  }, [items, searchQuery, revealedCards, isFree]);

  const handlePositionChange = (id: string, x: number, y: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, position: { x, y } } : item));
  };

  const panTo = useCallback((x: number, y: number, z: number) => {
    deskX.set(-x * z); deskY.set(-y * z); zoom.set(z);
  }, [deskX, deskY, zoom]);

  const jumpTo = (x: number, y: number, z: number = 1) => {
    deskX.set(-x * z); deskY.set(-y * z); zoom.set(z);
  };

  const resetView = () => { deskX.set(0); deskY.set(0); zoom.set(0.6); };

  const waitForTypewriter = useCallback(() => new Promise<void>((resolve) => { typewriterResolveRef.current = resolve; }), []);

  const onTypewriterComplete = useCallback(() => {
    if (typewriterResolveRef.current) { typewriterResolveRef.current(); typewriterResolveRef.current = null; }
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<ArchiveItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const createNewItem = useCallback((kind: 'document' | 'asset', type: string) => {
    const newItem: ArchiveItem = {
      id: `item-${Date.now()}`,
      kind,
      type: type as ArchiveType | AssetType,
      title: 'Untitled',
      content: '',
      position: { x: Math.random() * 400 - 200, y: Math.random() * 400 - 200 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'user',
    };
    setItems(prev => [...prev, newItem]);
    setView({ kind: 'detail', itemId: newItem.id });
  }, []);

  // --- Narrative Sequencer (UNCHANGED) ---
  useEffect(() => {
    if (!hasEntered || narrativePhase !== 'narrating') return;
    cancelRef.current = false;
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
    const done = () => cancelRef.current;
    (async () => {
      await wait(1500); if (done()) return;
      for (let i = 0; i < NARRATIVE_SECTIONS.length; i++) {
        const section = NARRATIVE_SECTIONS[i];
        setActiveSectionIndex(i);
        panTo(section.camera.x, section.camera.y, section.camera.zoom);
        await wait(1200); if (done()) return;
        if (section.title) { setSectionStates(prev => ({ ...prev, [i]: 'title' })); await waitForTypewriter(); await wait(400); if (done()) return; }
        setSectionStates(prev => ({ ...prev, [i]: 'text' })); await waitForTypewriter(); await wait(800); if (done()) return;
        for (let j = 0; j < section.cardIds.length; j++) {
          const cardId = section.cardIds[j];
          setRevealedCards(prev => new Set([...prev, cardId]));
          if (section.quotes?.[cardId]) { await wait(500); if (done()) return; setVisibleQuotes(prev => new Set([...prev, cardId])); }
          await wait(j < 3 ? 700 : 450); if (done()) return;
        }
        setSectionStates(prev => ({ ...prev, [i]: 'complete' }));
        await wait(1600); if (done()) return;
      }
      setNarrativePhase('free');
      panTo(50, 50, 0.31);
    })();
    return () => { cancelRef.current = true; };
  }, [hasEntered, narrativePhase, panTo, waitForTypewriter]);

  const skipNarrative = useCallback(() => {
    cancelRef.current = true;
    if (typewriterResolveRef.current) { typewriterResolveRef.current(); typewriterResolveRef.current = null; }
    const allSections: Record<number, 'complete'> = {};
    NARRATIVE_SECTIONS.forEach((_, i) => { allSections[i] = 'complete'; });
    setSectionStates(allSections);
    setRevealedCards(new Set(ARCHIVE_DATA.map(item => item.id)));
    setVisibleQuotes(new Set(Object.keys(QUOTES)));
    setNarrativePhase('free');
    panTo(50, 50, 0.31);
  }, [panTo]);

  // Connection lines
  const connectionLines = useMemo(() => {
    const lines: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    items.forEach(item => {
      if (item.connections) {
        item.connections.forEach(targetId => {
          const target = items.find(i => i.id === targetId);
          if (target) {
            const lineId = [item.id, target.id].sort().join('-');
            if (!lines.find(l => l.id === lineId))
              lines.push({ id: lineId, x1: item.position.x + 80, y1: item.position.y + 100, x2: target.position.x + 80, y2: target.position.y + 100 });
          }
        });
      }
    });
    return lines;
  }, [items]);

  // Mouse light
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${(e.clientX / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty('--mouse-y', `${(e.clientY / window.innerHeight) * 100}%`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Detail item
  const detailItem = view.kind === 'detail' ? items.find(i => i.id === view.itemId) : null;

  // Section grid: compute neat grid positions for section items on the canvas
  const CARD_WIDTHS: Record<string, number> = { character: 176, location: 256, event: 224, secret: 240, perspective: 208 };
  const CARD_HEIGHTS: Record<string, number> = { character: 280, location: 200, event: 180, secret: 180, perspective: 180 };

  const sectionGridPositions = useMemo(() => {
    if (view.kind !== 'section') return {};
    const sectionId = view.sectionId;
    const sectionType = SECTION_TYPE_MAP[sectionId];
    if (!sectionType) return {};

    // Timeline: CanvasTimeline renders custom strip cards, no ArchiveCard grid needed
    if (sectionId === 'timeline') return {};

    const sectionItems = items.filter(i => i.type === sectionType);
    const cardW = CARD_WIDTHS[sectionType] || 200;
    const cardH = CARD_HEIGHTS[sectionType] || 220;
    const gap = 28;
    const cols = Math.min(sectionItems.length, sectionType === 'character' ? 4 : 3);
    const gap2 = gap;
    const gridOriginX = -380;
    const gridOriginY = -150;

    const positions: Record<string, { x: number; y: number }> = {};
    sectionItems.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions[item.id] = {
        x: gridOriginX + col * (cardW + gap2),
        y: gridOriginY + row * (cardH + gap2),
      };
    });
    return positions;
  }, [view, items]);

  // Track previous view for back navigation
  const previousViewRef = useRef<ViewState>({ kind: 'overview' });

  // Navigate to section — rearrange cards into grid on canvas
  const openSection = useCallback((sectionId: string) => {
    setView({ kind: 'section', sectionId });
    if (sectionId === 'timeline') {
      // Pan to strip timeline (spineX=-300, strips at -206, originY=-180)
      panTo(170, 350, 0.85);
    } else {
      // Pan camera to frame the grid
      panTo(-50, 50, 0.85);
    }
  }, [panTo]);

  // Open item detail (from canvas or section grid)
  const openDetail = useCallback((id: string) => {
    previousViewRef.current = view;
    setView({ kind: 'detail', itemId: id });
  }, [view]);

  // Go back from detail
  const closeDetail = useCallback(() => {
    const prev = previousViewRef.current;
    // Return to section (camera stays) or overview
    if (prev.kind === 'section') setView(prev);
    else setView({ kind: 'overview' });
  }, []);

  // Create menu state
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* ===== Entry Screen (full viewport, above everything) ===== */}
      <AnimatePresence>
        {!hasEntered && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center select-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE_OUT_QUART, delay: 0.3 }} className="flex flex-col items-center">
              <p className="text-white/40 font-mono text-[11px] tracking-[0.3em] mb-8">D E S C R I B E &nbsp; Y O U R &nbsp; W O R L D</p>
              <input type="text" value={worldInput} onChange={e => setWorldInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleEnter(); }} autoFocus
                className="bg-transparent border-b border-white/15 focus:border-white/40 text-white/80 font-serif text-4xl md:text-5xl tracking-wide text-center pb-3 w-[400px] md:w-[500px] outline-none transition-colors duration-300 placeholder:text-white/10"
                placeholder="Stranger Things" />
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.2 }}
                className="mt-3 text-white/10 font-mono text-[10px] tracking-[0.2em]">W O R L D &nbsp; C O M P E N D I U M</motion.p>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.5 }}
                onClick={handleEnter}
                className="mt-12 px-8 py-2.5 border border-white/10 hover:border-white/30 text-white/25 hover:text-white/60 text-[11px] font-mono tracking-[0.3em] rounded-full transition-all duration-300 hover:bg-white/5">
                E N T E R
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Canvas (always rendered, full screen) ===== */}
      <div ref={viewportRef} className={`relative w-full h-full desk-surface overflow-hidden ${isPathsMode ? 'paths-bg' : ''}`}>

        {/* Black overlay (narrative opening) */}
        {hasEntered && <div className="absolute inset-0 bg-black z-[90] pointer-events-none opening-overlay" />}

        {/* Top Bar (free mode, overview only) */}
        <AnimatePresence>
          {isFree && view.kind !== 'detail' && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_QUART, delay: 0.2 }}
              className="fixed top-6 left-6 right-6 flex items-center justify-between pointer-events-none z-[70]">
              <div className="flex items-center gap-4 pointer-events-auto">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-red-500 transition-colors duration-200" />
                  <input type="text" placeholder="Search Archive..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white w-64 focus:outline-none focus:border-red-600/50 backdrop-blur-md transition-colors duration-200" />
                </div>
                <button onClick={resetView} className="p-2 bg-black/60 border border-white/10 rounded-full text-white/60 hover:text-white hover:border-white/30 backdrop-blur-md transition-colors duration-200" title="Reset View">
                  <Navigation2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-6 pointer-events-auto">
                <div className="flex flex-col items-end font-mono text-[10px] text-white/40 uppercase tracking-widest">
                  <span>Items: {filteredItems.length}</span>
                </div>
                <button onClick={() => setIsPathsMode(!isPathsMode)}
                  className={`px-4 py-2 rounded-full border flex items-center gap-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-colors duration-300 ${
                    isPathsMode ? 'bg-blue-600/20 border-blue-500 text-blue-400 paths-glow' : 'bg-black/60 border-white/10 text-white/60 hover:border-white/30'
                  }`}>
                  <Zap className={`w-3 h-3 ${isPathsMode ? 'animate-pulse' : ''}`} />Paths Mode
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Navigation (free mode — always visible) */}
        <AnimatePresence>
          {isFree && (
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.5, ease: EASE_OUT_QUART, delay: 0.4 }}
              className={`fixed z-[88] ${
                view.kind === 'detail'
                  ? 'left-0 top-0 bottom-0 w-[180px] flex flex-col justify-center pl-4 pr-2'
                  : 'left-6 top-1/2 -translate-y-1/2'
              }`}>
              <TableOfContents sections={NARRATIVE_SECTIONS.filter(s => s.cardIds.length > 0)} items={items}
                activeView={view}
                variant={view.kind === 'detail' ? 'flat' : 'floating'}
                onSectionClick={section => openSection(section.id)}
                onCardClick={item => openDetail(item.id)}
                onOverview={() => { setView({ kind: 'overview' }); panTo(50, 50, 0.31); }}
                onCreateNew={() => setShowCreateMenu(!showCreateMenu)} />

              {/* Create Menu Popup */}
              <AnimatePresence>
                {showCreateMenu && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }} transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
                    className="mt-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 pointer-events-auto">
                    <p className="px-2 py-1 text-[10px] font-mono text-white/20 uppercase tracking-[0.15em]">Document</p>
                    {(['character', 'location', 'event', 'story', 'perspective'] as const).map(t => (
                      <button key={t} onClick={() => { createNewItem('document', t); setShowCreateMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[12px] text-white/45 hover:text-white/70 hover:bg-white/[0.04] transition-colors duration-150">
                        <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[t] || '#888' }} />
                        <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom (free mode, overview only) */}
        <AnimatePresence>
          {isFree && view.kind !== 'detail' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_QUART, delay: 0.3 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[70]">
              <ControlButton onClick={() => zoom.set(Math.min(zoom.get() + 0.1, 1.5))} icon={<ZoomIn size={18} />} label="Zoom In" />
              <ControlButton onClick={() => zoom.set(Math.max(zoom.get() - 0.1, 0.5))} icon={<ZoomOut size={18} />} label="Zoom Out" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* BGM Mute */}
        {hasEntered && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 2.5 }}
            onClick={toggleMute}
            className="fixed bottom-8 left-8 z-[95] p-2 text-white/20 hover:text-white/50 transition-colors duration-200"
            title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </motion.button>
        )}

        {/* Infinite Desk Surface */}
        <motion.div drag={isFree && view.kind !== 'detail'} dragMomentum={false}
          style={{ x: springX, y: springY, scale: springZoom }}
          className={`absolute inset-0 flex items-center justify-center ${isFree && view.kind !== 'detail' ? 'cursor-move active:cursor-grabbing' : ''}`}>
          <div className="relative w-[2000px] h-[2400px] flex items-center justify-center">
            <div className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

            {/* Section headers — hide in section grid mode */}
            {NARRATIVE_SECTIONS.map((section, i) => {
              const inSectionMode = view.kind === 'section';
              return (
                <SectionHeader key={section.id} section={section} state={sectionStates[i] || 'hidden'}
                  isInstant={isFree} isDimmed={inSectionMode || (!isFree && i < activeSectionIndex)}
                  displayTitle={section.id === 'title' ? worldName : undefined} onTypewriterDone={onTypewriterComplete}
                  onSectionClick={section.cardIds.length > 0 ? () => openSection(section.id) : undefined} />
              );
            })}

            {/* (Section title is rendered as a fixed overlay below) */}

            {/* Quotes — hide in section mode */}
            {Object.entries(QUOTES).map(([cardId, text]) => {
              if (!visibleQuotes.has(cardId)) return null;
              if (view.kind === 'section') return null;
              const card = items.find(i => i.id === cardId);
              if (!card) return null;
              return <CharacterQuote key={`quote-${cardId}`} cardId={cardId} text={text} position={card.position}
                isInstant={isFree} isDimmed={!isFree && (cardSectionMap[cardId] ?? -1) < activeSectionIndex} />;
            })}

            <AnimatePresence>
              {isPathsMode && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {connectionLines.map(line => (
                    <motion.line key={line.id} initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.3 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
                      x1={line.x1 + 1000} y1={line.y1 + 1000} x2={line.x2 + 1000} y2={line.y2 + 1000}
                      stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                  ))}
                </svg>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {filteredItems.map((item) => {
                const inSection = view.kind === 'section';
                const currentSectionId = inSection ? (view as { sectionId: string }).sectionId : null;
                const sectionType = inSection ? SECTION_TYPE_MAP[currentSectionId!] : null;
                const isInActiveSection = inSection && item.type === sectionType;
                const gridPos = sectionGridPositions[item.id];
                // Event timeline items are always rendered by CanvasTimeline (carousel or strips), never as ArchiveCards
                if (item.type === 'event' && item.timeline) return null;
                // In section mode: dim items not in this section
                const dimmed = !isFree
                  ? (cardSectionMap[item.id] ?? -1) < activeSectionIndex
                  : inSection && !isInActiveSection;
                return (
                  <ArchiveCard key={item.id} item={item} isPaths={isPathsMode}
                    onClick={() => openDetail(item.id)}
                    onPositionChange={handlePositionChange}
                    isDraggable={isFree && view.kind !== 'detail'}
                    isDimmed={dimmed}
                    overridePosition={gridPos}
                    isGridMode={!!gridPos} />
                );
              })}
            </AnimatePresence>

            {/* Timeline spine on canvas */}
            <CanvasTimeline
              items={items}
              isVisible={isFree || (!isFree && activeSectionIndex >= 5)}
              isInstant={isFree}
              onEventClick={(id) => openDetail(id)}
              mode={view.kind === 'section' && (view as any).sectionId === 'timeline' ? 'expanded' : (!isFree && activeSectionIndex === 5 ? 'expanded' : 'carousel')}
            />
          </div>
        </motion.div>

        {/* Section Title (fixed overlay, top-left — shown in section mode) */}
        <AnimatePresence>
          {isFree && view.kind === 'section' && (() => {
            const sec = NARRATIVE_SECTIONS.find(s => s.id === (view as { sectionId: string }).sectionId);
            if (!sec) return null;
            const sType = SECTION_TYPE_MAP[(view as { sectionId: string }).sectionId];
            const count = sType ? items.filter(i => i.type === sType).length : 0;
            return (
              <motion.div
                key="section-title"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE_OUT_QUART }}
                className="fixed top-16 left-[200px] z-[70] pointer-events-none"
              >
                <h2 className={`font-serif text-3xl font-bold tracking-tight ${sec.titleClass || 'text-white/80'}`}>
                  {sec.title}
                </h2>
                <p className="text-[11px] text-white/25 font-mono mt-1">{count} items</p>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Status Bar (free mode) */}
        <AnimatePresence>
          {isFree && view.kind !== 'detail' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}
              className="fixed bottom-6 left-8 z-[60] flex items-center gap-4 text-[10px] font-mono text-white/30">
              <div className="flex items-center gap-2"><Move size={12} /><span>Drag to navigate</span></div>
              <div className="w-px h-3 bg-white/10" />
              <span>ITEMS: {filteredItems.length}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== Detail — persistent backdrop + swappable content ===== */}
      <AnimatePresence>
        {detailItem && (
          <motion.div
            key="detail-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-[85] bg-[#0a0a0a]"
          >
            {detailItem.kind === 'document' ? (
              <DocumentDetail key={detailItem.id} item={detailItem} items={items}
                onClose={closeDetail}
                onUpdate={updateItem}
                onNavigateItem={(id) => setView({ kind: 'detail', itemId: id })} />
            ) : (
              <AssetDetail key={detailItem.id} item={detailItem}
                onClose={closeDetail}
                onUpdate={updateItem} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Skip Button (bottom-left, next to mute) ===== */}
      <AnimatePresence>
        {!isFree && hasEntered && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={{ duration: 0.4, delay: 2 }}
            onClick={skipNarrative}
            className="fixed bottom-8 left-16 z-[95] flex items-center gap-2 text-white/25 hover:text-white/60 text-xs font-mono uppercase tracking-widest transition-colors duration-200">
            <span>Skip</span><SkipForward size={14} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ===== Unified World Agent Panel (always present after entering) ===== */}
      <AnimatePresence>
        {hasEntered && (
          <WorldAgentPanel
            worldName={worldName}
            phase={narrativePhase}
            activeSectionIndex={activeSectionIndex}
            isExpanded={isAgentExpanded}
            onToggleExpand={() => setIsAgentExpanded(prev => !prev)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
