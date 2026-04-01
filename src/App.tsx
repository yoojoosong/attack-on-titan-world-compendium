/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
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
  Navigation,
  Info,
  Users,
  History,
  MessageSquare,
  Navigation2,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';
import Markdown from 'react-markdown';
import {
  ARCHIVE_DATA,
  ArchiveItem,
  ArchiveType
} from './data';

// --- Easing constants (no bounce/elastic) ---
const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1];
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

// --- Narrative Data ---

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
  // --- Act 0: Title card ---
  {
    id: 'title',
    title: '进击的巨人',
    text: '世界卷宗',
    position: { x: -350, y: -780 },
    camera: { x: -100, y: -730, zoom: 1 },
    cardIds: [],
    titleClass: 'text-white !text-7xl !tracking-wide',
    textClass: 'text-base text-white/40 font-mono tracking-[0.3em]',
  },
  // --- Act 1: Prologue ---
  {
    id: 'prologue',
    title: '',
    text: '三重城墙围起了人类最后的领土。\n墙外是巨人——没有理智、没有目的，只会吃人。\n墙内的人类已经忘记了外面的世界。\n\n一百年的和平让大多数人相信，\n城墙就是世界的边界。',
    position: { x: -350, y: -600 },
    camera: { x: -100, y: -550, zoom: 1 },
    cardIds: [],
    textClass: 'text-lg text-white/70 font-serif leading-loose',
  },
  // ===== Row 1: 2 clusters =====
  // --- Act 2: Characters (left) ---
  {
    id: 'characters',
    title: '他们',
    text: '记住这些面孔。\n他们中的每一个人，都将做出不可挽回的选择。',
    position: { x: -580, y: -300 },
    camera: { x: -380, y: -80, zoom: 0.9 },
    cardIds: ['eren', 'mikasa', 'armin', 'levi', 'reiner', 'zeke'],
    quotes: {
      'eren': '"如果杀光那边的敌人，我们就能自由了吗？"',
      'mikasa': '"我只想待在你身边。"',
      'armin': '"我想看到外面的世界。"',
    },
  },
  // --- Act 3: Locations (right) ---
  {
    id: 'locations',
    title: '舞台',
    text: '这些是他们战斗过的地方。\n每一块石头都浸透了血。',
    position: { x: 380, y: -300 },
    camera: { x: 520, y: -80, zoom: 1 },
    cardIds: ['shiganshina', 'ocean', 'liberio'],
  },
  // ===== Row 2: 3 clusters =====
  // --- Act 4: Events (left) ---
  {
    id: 'events',
    title: '转折',
    text: '845年，城墙碎了。\n不只是石头碎了——\n是所有人以为的世界碎了。',
    position: { x: -680, y: 350 },
    camera: { x: -530, y: 520, zoom: 1 },
    cardIds: ['basement', 'trost', 'rumbling'],
  },
  // --- Act 5: Secrets (center) ---
  {
    id: 'secrets',
    title: '真相',
    text: '以下内容已被始祖之力封印。\n你正在阅读不应存在的记录。',
    position: { x: -100, y: 350 },
    camera: { x: 50, y: 520, zoom: 1.05 },
    cardIds: ['ymir_origin', 'ackerman'],
    textClass: 'text-sm text-red-400/60 leading-relaxed',
  },
  // --- Act 6: Perspectives (right) ---
  {
    id: 'perspectives',
    title: '回响',
    text: '当所有的事实摆在面前，你会发现——\n没有人是反派。\n这才是最恐怖的。',
    position: { x: 500, y: 350 },
    camera: { x: 620, y: 520, zoom: 1.05 },
    cardIds: ['erwin_speech', 'freedom_cost'],
  },
];

const QUOTES: Record<string, string> = {
  'eren': '"如果杀光那边的敌人，我们就能自由了吗？"',
  'mikasa': '"我只想待在你身边。"',
  'armin': '"我想看到外面的世界。"',
};

// --- Components ---

function SectionHeader({
  section,
  state,
  isInstant,
  isDimmed,
  onTypewriterDone
}: {
  section: NarrativeSection;
  state: 'hidden' | 'title' | 'text' | 'complete';
  isInstant: boolean;
  isDimmed: boolean;
  onTypewriterDone?: () => void;
}) {
  if (state === 'hidden') return null;

  const showTitle = !!section.title;
  const showText = state === 'text' || state === 'complete';

  return (
    <div
      className="absolute pointer-events-none z-10 w-[500px] transition-opacity duration-700"
      style={{
        transform: `translate(${section.position.x}px, ${section.position.y}px)`,
        opacity: isDimmed ? 0.2 : 1,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT_QUART }}
      >
        {showTitle && (
          <h2 className={`font-serif text-5xl font-bold mb-5 tracking-tight ${section.titleClass || 'text-white/80'}`}>
            {isInstant
              ? section.title
              : <Typewriter text={section.title} speed={100} onComplete={state === 'title' ? onTypewriterDone : undefined} />
            }
          </h2>
        )}
        {showText && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
            className={`whitespace-pre-line max-w-md ${section.textClass || 'text-sm text-white/40 leading-relaxed'}`}
          >
            {isInstant
              ? section.text
              : <Typewriter text={section.text} speed={38} onComplete={state === 'text' ? onTypewriterDone : undefined} />
            }
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

function CharacterQuote({
  cardId,
  text,
  position,
  isInstant,
  isDimmed
}: {
  cardId: string;
  text: string;
  position: { x: number; y: number };
  isInstant: boolean;
  isDimmed: boolean;
}) {
  return (
    <div
      className="absolute pointer-events-none z-10 w-[176px] transition-opacity duration-700"
      style={{
        transform: `translate(${position.x}px, ${position.y + 210}px)`,
        opacity: isDimmed ? 0.15 : 1,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
      >
        <p className="text-[11px] italic text-white/30 font-serif leading-relaxed">
          {isInstant ? text : <Typewriter text={text} speed={45} />}
        </p>
      </motion.div>
    </div>
  );
}

const ArchiveCard = ({
  item,
  isPaths,
  onClick,
  onPositionChange,
  isDraggable,
  isDimmed,
}: {
  item: ArchiveItem,
  isPaths: boolean,
  onClick: () => void,
  onPositionChange: (id: string, x: number, y: number) => void,
  isDraggable: boolean,
  isDimmed: boolean,
}) => {
  const rotation = useMemo(() => (Math.random() * 10 - 5), []);
  const x = useMotionValue(item.position.x);
  const y = useMotionValue(item.position.y);

  useEffect(() => {
    x.set(item.position.x);
    y.set(item.position.y);
  }, [item.position.x, item.position.y]);

  const cardClass = useMemo(() => {
    switch (item.type) {
      case 'character': return 'polaroid w-44';
      case 'location': return 'blueprint w-64';
      case 'event': return 'newspaper-clip w-56';
      case 'secret': return 'top-secret-folder w-60';
      case 'perspective': return 'handwritten-note w-52';
      default: return '';
    }
  }, [item.type]);

  return (
    <motion.div
      drag={isDraggable}
      dragMomentum={false}
      onDrag={() => onPositionChange(item.id, x.get(), y.get())}
      style={{ x, y, rotate: rotation }}
      className="absolute transition-opacity duration-700"
      animate={{ opacity: isDimmed ? 0.15 : 1 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: -30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
        whileHover={isDraggable ? { scale: 1.04, transition: { duration: 0.2, ease: EASE_OUT_QUART } } : undefined}
        onClick={onClick}
        className={`${cardClass} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} transition-colors duration-500 ${isPaths && item.type === 'character' ? 'border-blue-400/50 bg-blue-50/10' : ''}`}
      >
        {item.type === 'character' && (
          <>
            <div className="aspect-[3/4] bg-gray-200 overflow-hidden mb-2 relative">
              <img
                src={item.image}
                className={`w-full h-full object-cover transition-[filter] duration-700 ${isPaths ? 'grayscale-0 brightness-110 sepia-[.2] blue-filter' : 'grayscale'}`}
                referrerPolicy="no-referrer"
              />
            </div>
            <p className={`font-serif text-center text-xs font-bold transition-colors duration-500 ${isPaths ? 'text-blue-200' : 'text-black'}`}>
              {item.title}
            </p>
          </>
        )}

        {item.type === 'location' && (
          <>
            <div className="flex items-center gap-2 mb-2 border-b border-blue-300/20 pb-1">
              <MapIcon size={12} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">地理标本: {item.title}</span>
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
            <div className="flex items-center justify-between mb-2">
              <Lock size={14} className="text-titan-red" />
              <span className="bg-titan-red text-white text-[8px] px-1 font-bold">CONFIDENTIAL</span>
            </div>
            <h4 className="font-serif font-bold text-xs mb-1">{item.title}</h4>
            <div className="h-1 w-full bg-black/10 mb-2" />
            <p className="text-[10px] leading-tight opacity-60">点击解密核心数据...</p>
          </>
        )}

        {item.type === 'perspective' && (
          <>
            <div className="text-[11px] leading-relaxed italic text-black/70 prose prose-invert max-w-none">
              <Markdown>{`"${item.content.substring(0, 100)}..."`}</Markdown>
            </div>
            <div className="mt-3 text-[9px] font-bold text-titan-red/50">— {item.metadata?.author || '穿过者'}</div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const Minimap = ({
  items,
  deskX,
  deskY,
  zoom,
  viewportSize
}: {
  items: ArchiveItem[];
  deskX: any;
  deskY: any;
  zoom: any;
  viewportSize: { width: number; height: number };
}) => {
  const mapSize = 160;
  const deskSize = 2600;
  const scale = mapSize / deskSize;

  const viewX = useTransform(deskX, (v: number) => (deskSize/2 - v / zoom.get() - viewportSize.width / (2 * zoom.get())) * scale);
  const viewY = useTransform(deskY, (v: number) => (deskSize/2 - v / zoom.get() - viewportSize.height / (2 * zoom.get())) * scale);
  const viewW = useTransform(zoom, (v: number) => (viewportSize.width / v) * scale);
  const viewH = useTransform(zoom, (v: number) => (viewportSize.height / v) * scale);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT_QUART, delay: 0.6 }}
      className="fixed bottom-20 right-6 w-40 h-40 bg-black/60 border border-white/20 backdrop-blur-md rounded-lg overflow-hidden z-50 pointer-events-none shadow-2xl"
    >
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '10px 10px'
      }} />

      {items.map(item => (
        <div
          key={item.id}
          className={`absolute w-1 h-1 rounded-full ${
            item.type === 'character' ? 'bg-blue-400' :
            item.type === 'location' ? 'bg-green-400' :
            item.type === 'event' ? 'bg-yellow-400' :
            item.type === 'secret' ? 'bg-red-400' : 'bg-white'
          }`}
          style={{
            left: (item.position.x + deskSize/2) * scale,
            top: (item.position.y + deskSize/2) * scale
          }}
        />
      ))}

      <motion.div
        className="absolute border border-white/50 bg-white/5"
        style={{ x: viewX, y: viewY, width: viewW, height: viewH }}
      />

      <div className="absolute top-1 left-1 text-[8px] uppercase tracking-tighter opacity-50 font-mono">Archive Map</div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  // Narrative state
  const [hasEntered, setHasEntered] = useState(false);
  const [narrativePhase, setNarrativePhase] = useState<'narrating' | 'free'>('narrating');
  const [sectionStates, setSectionStates] = useState<Record<number, 'hidden' | 'title' | 'text' | 'complete'>>({});
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [visibleQuotes, setVisibleQuotes] = useState<Set<string>>(new Set());
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const cancelRef = useRef(false);
  // Refs for typewriter completion signals
  const typewriterResolveRef = useRef<(() => void) | null>(null);

  // Background music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio('/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  const handleEnter = useCallback(() => {
    setHasEntered(true);
    audioRef.current?.play();
  }, []);

  // Fade out BGM when narrative completes
  useEffect(() => {
    if (narrativePhase !== 'free') return;
    const audio = audioRef.current;
    if (!audio) return;

    const fadeDuration = 4000; // 4 seconds
    const steps = 40;
    const interval = fadeDuration / steps;
    const startVolume = audio.volume;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVolume * (1 - step / steps));
      if (step >= steps) {
        clearInterval(timer);
        audio.pause();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [narrativePhase]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    setIsMuted(m => {
      audioRef.current!.muted = !m;
      return !m;
    });
  }, []);

  // Existing state
  const [isPathsMode, setIsPathsMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(ARCHIVE_DATA);

  const deskX = useMotionValue(0);
  const deskY = useMotionValue(0);
  const zoom = useMotionValue(1);

  // Snappier spring for cinematic camera movement
  const cameraSpring = { damping: 32, stiffness: 160 };
  const springX = useSpring(deskX, cameraSpring);
  const springY = useSpring(deskY, cameraSpring);
  const springZoom = useSpring(zoom, { damping: 28, stiffness: 180 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (viewportRef.current) {
        setViewportSize({
          width: viewportRef.current.clientWidth,
          height: viewportRef.current.clientHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const isFree = narrativePhase === 'free';

  // Map card IDs to their section index for dimming
  const cardSectionMap = useMemo(() => {
    const map: Record<string, number> = {};
    NARRATIVE_SECTIONS.forEach((section, i) => {
      section.cardIds.forEach(id => { map[id] = i; });
    });
    return map;
  }, []);

  const filteredItems = useMemo(() => {
    const visible = items.filter(item => isFree || revealedCards.has(item.id));
    if (!searchQuery) return visible;
    const q = searchQuery.toLowerCase();
    return visible.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  }, [items, searchQuery, revealedCards, isFree]);

  const handlePositionChange = (id: string, x: number, y: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, position: { x, y } } : item));
  };

  const panTo = useCallback((x: number, y: number, z: number) => {
    deskX.set(-x * z);
    deskY.set(-y * z);
    zoom.set(z);
  }, [deskX, deskY, zoom]);

  const jumpTo = (x: number, y: number, z: number = 1) => {
    deskX.set(-x * z);
    deskY.set(-y * z);
    zoom.set(z);
  };

  const resetView = () => {
    deskX.set(0);
    deskY.set(0);
    zoom.set(0.6);
  };

  // Wait for a typewriter to signal completion
  const waitForTypewriter = useCallback(() => {
    return new Promise<void>((resolve) => {
      typewriterResolveRef.current = resolve;
    });
  }, []);

  const onTypewriterComplete = useCallback(() => {
    if (typewriterResolveRef.current) {
      typewriterResolveRef.current();
      typewriterResolveRef.current = null;
    }
  }, []);

  // --- Narrative Sequencer ---

  useEffect(() => {
    if (!hasEntered || narrativePhase !== 'narrating') return;
    cancelRef.current = false;

    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
    const done = () => cancelRef.current;

    (async () => {
      // Initial pause — fade in from black
      await wait(1500);
      if (done()) return;

      for (let i = 0; i < NARRATIVE_SECTIONS.length; i++) {
        const section = NARRATIVE_SECTIONS[i];

        // Pan camera to section
        setActiveSectionIndex(i);
        panTo(section.camera.x, section.camera.y, section.camera.zoom);
        await wait(1200);
        if (done()) return;

        // Show title (wait for typewriter to finish)
        if (section.title) {
          setSectionStates(prev => ({ ...prev, [i]: 'title' }));
          await waitForTypewriter();
          await wait(400);
          if (done()) return;
        }

        // Show text (wait for typewriter to finish)
        setSectionStates(prev => ({ ...prev, [i]: 'text' }));
        await waitForTypewriter();
        await wait(800);
        if (done()) return;

        // Reveal cards one by one
        for (let j = 0; j < section.cardIds.length; j++) {
          const cardId = section.cardIds[j];
          setRevealedCards(prev => new Set([...prev, cardId]));

          // Show quote after card lands
          if (section.quotes?.[cardId]) {
            await wait(500);
            if (done()) return;
            setVisibleQuotes(prev => new Set([...prev, cardId]));
          }

          await wait(j < 3 ? 700 : 450);
          if (done()) return;
        }

        // Mark section complete
        setSectionStates(prev => ({ ...prev, [i]: 'complete' }));

        // Breathing pause between sections
        await wait(1600);
        if (done()) return;
      }

      // Finale: immediately go free and zoom out to show everything including title
      setNarrativePhase('free');
      panTo(-50, -200, 0.45);
    })();

    return () => { cancelRef.current = true; };
  }, [hasEntered, narrativePhase, panTo, waitForTypewriter]);

  // Skip narrative
  const skipNarrative = useCallback(() => {
    cancelRef.current = true;
    // Resolve any pending typewriter wait
    if (typewriterResolveRef.current) {
      typewriterResolveRef.current();
      typewriterResolveRef.current = null;
    }

    const allSections: Record<number, 'complete'> = {};
    NARRATIVE_SECTIONS.forEach((_, i) => { allSections[i] = 'complete'; });
    setSectionStates(allSections);

    const allCards = new Set(ARCHIVE_DATA.map(item => item.id));
    setRevealedCards(allCards);

    const allQuotes = new Set(Object.keys(QUOTES));
    setVisibleQuotes(allQuotes);

    setNarrativePhase('free');
    panTo(-50, -200, 0.45);
  }, [panTo]);

  // Connection lines for Paths Mode
  const connectionLines = useMemo(() => {
    const lines: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    items.forEach(item => {
      if (item.connections) {
        item.connections.forEach(targetId => {
          const target = items.find(i => i.id === targetId);
          if (target) {
            const lineId = [item.id, target.id].sort().join('-');
            if (!lines.find(l => l.id === lineId)) {
              lines.push({
                id: lineId,
                x1: item.position.x + 80,
                y1: item.position.y + 100,
                x2: target.position.x + 80,
                y2: target.position.y + 100
              });
            }
          }
        });
      }
    });
    return lines;
  }, [items]);

  // Mouse light effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${(e.clientX / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty('--mouse-y', `${(e.clientY / window.innerHeight) * 100}%`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={viewportRef} className={`relative w-full h-screen desk-surface overflow-hidden ${isPathsMode ? 'paths-bg' : ''}`}>

      {/* Entry screen — click to begin */}
      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer select-none"
            onClick={handleEnter}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE_OUT_QUART, delay: 0.3 }}
              className="text-center"
            >
              <h1 className="font-serif text-5xl text-white/80 tracking-wide mb-4">进击的巨人</h1>
              <p className="text-white/20 font-mono text-xs tracking-[0.3em] mb-12">世 界 卷 宗</p>
              <p className="text-white/15 text-[11px] font-mono tracking-widest animate-pulse">点 击 进 入</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Black overlay — fades out at start (CSS animation avoids framer-motion init issue) */}
      {hasEntered && <div className="fixed inset-0 bg-black z-[90] pointer-events-none opening-overlay" />}


      {/* --- Top Bar: Search & Controls (only in free mode) --- */}
      <AnimatePresence>
        {isFree && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT_QUART, delay: 0.2 }}
            className="fixed top-6 left-6 right-6 flex items-center justify-between pointer-events-none z-[70]"
          >
            <div className="flex items-center gap-4 pointer-events-auto">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-red-500 transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search Archive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white w-64 focus:outline-none focus:border-red-600/50 backdrop-blur-md transition-colors duration-200"
                />
              </div>
              <button
                onClick={resetView}
                className="p-2 bg-black/60 border border-white/10 rounded-full text-white/60 hover:text-white hover:border-white/30 backdrop-blur-md transition-colors duration-200"
                title="Reset View"
              >
                <Navigation2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-6 pointer-events-auto">
              <div className="flex flex-col items-end font-mono text-[10px] text-white/40 uppercase tracking-widest">
                <span>Items: {filteredItems.length}</span>
              </div>
              <button
                onClick={() => setIsPathsMode(!isPathsMode)}
                className={`px-4 py-2 rounded-full border flex items-center gap-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-colors duration-300
                  ${isPathsMode
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400 paths-glow'
                    : 'bg-black/60 border-white/10 text-white/60 hover:border-white/30'
                  }`}
              >
                <Zap className={`w-3 h-3 ${isPathsMode ? 'animate-pulse' : ''}`} />
                Paths Mode
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Table of Contents (only in free mode) --- */}
      <AnimatePresence>
        {isFree && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT_QUART, delay: 0.4 }}
            className="fixed left-6 top-1/2 -translate-y-1/2 z-[70]"
          >
            <TableOfContents
              sections={NARRATIVE_SECTIONS.filter(s => s.cardIds.length > 0)}
              items={items}
              onSectionClick={(section) => jumpTo(section.camera.x, section.camera.y, section.camera.zoom)}
              onCardClick={(item) => jumpTo(item.position.x, item.position.y, 0.9)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Zoom Controls (only in free mode) --- */}
      <AnimatePresence>
        {isFree && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT_QUART, delay: 0.3 }}
            className="fixed bottom-6 right-6 flex items-center gap-4 z-[70]"
          >
            <ControlButton onClick={() => zoom.set(Math.min(zoom.get() + 0.1, 1.5))} icon={<ZoomIn size={18} />} label="放大" />
            <ControlButton onClick={() => zoom.set(Math.max(zoom.get() - 0.1, 0.5))} icon={<ZoomOut size={18} />} label="缩小" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Skip Button (only during narration) --- */}
      <AnimatePresence>
        {!isFree && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, delay: 2 }}
            onClick={skipNarrative}
            className="fixed bottom-8 right-8 z-[100] flex items-center gap-2 text-white/20 hover:text-white/50 text-xs font-mono uppercase tracking-widest transition-colors duration-200"
          >
            <span>Skip</span>
            <SkipForward size={14} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* --- BGM Mute Toggle (always visible) --- */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 2.5 }}
        onClick={toggleMute}
        className="fixed bottom-8 left-8 z-[100] p-2 text-white/20 hover:text-white/50 transition-colors duration-200"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </motion.button>

      {/* --- Infinite Desk Surface --- */}
      <motion.div
        drag={isFree}
        dragMomentum={false}
        style={{ x: springX, y: springY, scale: springZoom }}
        className={`absolute inset-0 flex items-center justify-center ${isFree ? 'cursor-move active:cursor-grabbing' : ''}`}
      >
        <div className="relative w-[2600px] h-[2200px] flex items-center justify-center">

          {/* Grid Guide */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '100px 100px'
            }}
          />

          {/* --- Section Headers (permanent on canvas) --- */}
          {NARRATIVE_SECTIONS.map((section, i) => (
            <SectionHeader
              key={section.id}
              section={section}
              state={sectionStates[i] || 'hidden'}
              isInstant={isFree}
              isDimmed={!isFree && i < activeSectionIndex}
              onTypewriterDone={onTypewriterComplete}
            />
          ))}

          {/* --- Character Quotes (permanent on canvas) --- */}
          {Object.entries(QUOTES).map(([cardId, text]) => {
            if (!visibleQuotes.has(cardId)) return null;
            const card = items.find(i => i.id === cardId);
            if (!card) return null;
            return (
              <CharacterQuote
                key={`quote-${cardId}`}
                cardId={cardId}
                text={text}
                position={card.position}
                isInstant={isFree}
                isDimmed={!isFree && (cardSectionMap[cardId] ?? -1) < activeSectionIndex}
              />
            );
          })}

          {/* --- Paths Connections (only in Paths Mode) --- */}
          <AnimatePresence>
            {isPathsMode && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {connectionLines.map(line => (
                  <motion.line
                    key={line.id}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
                    x1={line.x1 + 1000}
                    y1={line.y1 + 1000}
                    x2={line.x2 + 1000}
                    y2={line.y2 + 1000}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                ))}
              </svg>
            )}
          </AnimatePresence>

          {/* --- Archive Cards --- */}
          <AnimatePresence>
            {filteredItems.map((item) => (
              <ArchiveCard
                key={item.id}
                item={item}
                isPaths={isPathsMode}
                onClick={() => setSelectedItem(item)}
                onPositionChange={handlePositionChange}
                isDraggable={isFree}
                isDimmed={!isFree && (cardSectionMap[item.id] ?? -1) < activeSectionIndex}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* --- Status Bar (only in free mode) --- */}
      <AnimatePresence>
        {isFree && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="absolute bottom-6 left-8 z-[60] flex items-center gap-4 text-[10px] font-mono text-white/30"
          >
            <div className="flex items-center gap-2">
              <Move size={12} />
              <span>拖拽桌面以移动</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <span>ITEMS: {filteredItems.length}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Minimap (only in free mode) --- */}
      {isFree && (
        <Minimap
          items={items}
          deskX={springX}
          deskY={springY}
          zoom={springZoom}
          viewportSize={viewportSize}
        />
      )}

      {/* --- Detail Modal --- */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT_QUART }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8, transition: { duration: 0.18 } }}
              transition={{ duration: 0.35, ease: EASE_OUT_QUART }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl paper-sheet p-0 overflow-hidden rounded-sm shadow-2xl flex flex-col md:flex-row"
            >
              <div className="w-full md:w-5/12 h-80 md:h-auto relative bg-black">
                {selectedItem.image ? (
                  <img src={selectedItem.image} className="w-full h-full object-cover grayscale opacity-80" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10">
                    <Skull size={100} />
                  </div>
                )}
                <div className="absolute inset-0 bg-titan-red/10 mix-blend-multiply" />
              </div>
              <div className="flex-1 p-12 relative bg-[#e4e3e0]">
                <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 p-2 text-black/30 hover:text-black transition-colors duration-200">
                  <CloseIcon size={24} />
                </button>

                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono bg-titan-red text-white px-2 py-0.5 uppercase tracking-widest">
                      {selectedItem.type}
                    </span>
                    <span className="text-[10px] font-mono opacity-40">ID: {selectedItem.id}</span>
                  </div>
                  <h2 className="text-5xl font-serif font-bold tracking-tighter">{selectedItem.title}</h2>
                </div>

                <div className="space-y-8">
                  <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-red-400">
                    <Markdown>{selectedItem.content}</Markdown>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {selectedItem.metadata && Object.entries(selectedItem.metadata).map(([key, value]) => (
                      <div key={key} className="border-l border-black/10 pl-4">
                        <h4 className="text-[9px] font-mono uppercase tracking-widest opacity-40 mb-1">{key}</h4>
                        <p className="text-xs font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 opacity-30">
                    <Skull size={14} />
                    <span className="text-[10px] font-mono uppercase">Verified by Archive System</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Helper Components ---

function ControlButton({ active, onClick, icon, label, color = 'red' }: { active?: boolean, onClick: () => void, icon: React.ReactNode, label: string, color?: 'red' | 'blue' }) {
  const activeClass = color === 'blue'
    ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]'
    : 'bg-titan-red text-white shadow-[0_0_20px_rgba(136,8,8,0.5)]';

  return (
    <div className="group flex items-center gap-3">
      <button
        onClick={onClick}
        className={`p-3 rounded-full transition-colors duration-200 ${active ? activeClass : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'}`}
      >
        {icon}
      </button>
      <span className={`text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap ${active ? 'text-white' : 'text-white/40'}`}>
        {label}
      </span>
    </div>
  );
}

function Typewriter({ text, speed = 30, onComplete }: { text: string, speed?: number, onComplete?: () => void }) {
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
    } else if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={isDone ? '' : 'cursor-blink'}>
      {displayedText}
    </span>
  );
}

/** Narrative-aware Typewriter that signals the sequencer */
function NarrativeTypewriter({ text, speed = 30, onNarrativeComplete }: { text: string, speed?: number, onNarrativeComplete?: () => void }) {
  return <Typewriter text={text} speed={speed} onComplete={onNarrativeComplete} />;
}

function TableOfContents({
  sections,
  items,
  onSectionClick,
  onCardClick,
}: {
  sections: NarrativeSection[];
  items: ArchiveItem[];
  onSectionClick: (section: NarrativeSection) => void;
  onCardClick: (item: ArchiveItem) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSectionClick = (section: NarrativeSection) => {
    if (expandedId === section.id) {
      setExpandedId(null);
    } else {
      setExpandedId(section.id);
      onSectionClick(section);
    }
  };

  return (
    <nav className="pointer-events-auto select-none bg-black/40 backdrop-blur-md border border-white/5 rounded-lg px-3 py-2">
      <ul className="flex flex-col gap-0.5">
        {sections.map((section) => {
          const isOpen = expandedId === section.id;
          const sectionItems = section.cardIds
            .map(id => items.find(i => i.id === id))
            .filter(Boolean) as ArchiveItem[];

          return (
            <li key={section.id}>
              <button
                onClick={() => handleSectionClick(section)}
                className={`flex items-center gap-2 py-1.5 px-1 text-left transition-colors duration-200 group ${
                  isOpen ? 'text-white/80' : 'text-white/30 hover:text-white/60'
                }`}
              >
                <span className={`w-3 text-[8px] font-mono transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                  ›
                </span>
                <span className="font-serif text-sm tracking-wide">{section.title}</span>
              </button>

              <AnimatePresence>
                {isOpen && sectionItems.length > 0 && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE_OUT_QUART }}
                    className="overflow-hidden"
                  >
                    {sectionItems.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => onCardClick(item)}
                          className="w-full text-left pl-6 pr-2 py-1 text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 truncate font-mono"
                        >
                          {item.title}
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
    </nav>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-titan-red" />
      <h4 className="text-[10px] font-mono uppercase tracking-widest text-titan-red/60 mb-2">{label}</h4>
      <p className="text-base leading-relaxed text-black/80 font-medium italic">"{value}"</p>
    </div>
  );
}
