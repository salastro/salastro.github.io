import React, { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph2D, { type GraphData, type LinkObject, type NodeObject } from 'react-force-graph-2d';
import { useTheme } from 'next-themes';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { MyNode, MyLink, graphData } from '../../data/graphData';

gsap.registerPlugin(InertiaPlugin);

interface GridDot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _inertiaApplied: boolean;
  fadeStart: number; // performance.now() timestamp when this dot appeared
}

const DOT_FADE_DURATION_MS = 300;

// Cheap ease-out, no allocation — avoids per-dot GSAP tweens, which get very
// expensive right at a LOD boundary crossing (hundreds of dots become "new"
// in the same frame, since their cache key changes with the LOD level).
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

interface GraphViewProps {
  onNodeClick: (node: MyNode) => void;
  activeNodeId: string | null;
  filter: string | null;
  dotGrid?: {
    dotSize?: number;
    gap?: number;
    baseColor?: string;
    activeColor?: string;
    proximity?: number;
    speedTrigger?: number;
    shockRadius?: number;
    shockStrength?: number;
    maxSpeed?: number;
    resistance?: number;
    returnDuration?: number;
  };
}

// Samples a loaded image's pixels to detect any transparency. Cross-origin images
// that taint the canvas are treated as opaque (they're always JPEGs here anyway).
function imageHasTransparency(img: HTMLImageElement): boolean {
  try {
    const canvas = document.createElement('canvas');
    const w = canvas.width = Math.min(img.naturalWidth || 32, 64);
    const h = canvas.height = Math.min(img.naturalHeight || 32, 64);
    const ctx = canvas.getContext('2d');
    if (!ctx || w === 0 || h === 0) return false;
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  };
}

const GraphView: React.FC<GraphViewProps> = ({
  onNodeClick,
  activeNodeId,
  filter,
  dotGrid = {
    dotSize: 4,
    gap: 24,
    baseColor: '#333333',
    activeColor: '#64d2ff',
    proximity: 120,
    speedTrigger: 100,
    shockRadius: 250,
    shockStrength: 5,
    maxSpeed: 5000,
    resistance: 750,
    returnDuration: 1.5
  }
}) => {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [data, setData] = useState<{ nodes: MyNode[]; links: MyLink[] }>({ nodes: [], links: [] });
  const { theme } = useTheme();

  // Dot grid settings
  const {
    dotSize = 4,
    gap = 24,
    baseColor = '#333333',
    activeColor = '#64d2ff',
    proximity = 120,
    speedTrigger = 100,
    shockRadius = 250,
    shockStrength = 5,
    maxSpeed = 5000,
    resistance = 750,
    returnDuration = 1.5
  } = dotGrid;

  // Pre-compute RGB values for color interpolation
  const baseRgb = hexToRgb(baseColor);
  const activeRgb = hexToRgb(activeColor);

  // Mouse position in graph coordinates
  const mouseGraphPos = useRef<{ x: number; y: number } | null>(null);

  // Pointer tracking for velocity
  const pointerRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0
  });

  // Persistent dot objects with offsets for GSAP animations
  const dotsRef = useRef<Map<string, GridDot>>(new Map());

  // Track last known visible area to manage dots
  const lastVisibleArea = useRef<{ startX: number; startY: number; endX: number; endY: number } | null>(null);

  // Image Cache
  const imgs = useRef<Record<string, HTMLImageElement>>({});
  // Tracks which cached images have transparent pixels, so we know which ones need a white backing
  const imgsHasAlpha = useRef<Record<string, boolean>>({});

  // Resize handler
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Track mouse position in graph coordinates with velocity for inertia effects
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const graph = graphRef.current;
      if (!graph || !container) return;

      const rect = container.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Check if mouse is within container bounds
      if (screenX < 0 || screenX > rect.width || screenY < 0 || screenY > rect.height) {
        return;
      }

      // Convert screen coordinates to graph coordinates
      const graphCoords = graph.screen2GraphCoords(screenX, screenY);
      mouseGraphPos.current = graphCoords;

      // Track velocity in graph coordinates
      const now = performance.now();
      const pr = pointerRef.current;
      const dt = pr.lastTime ? now - pr.lastTime : 16;

      const dx = graphCoords.x - pr.lastX;
      const dy = graphCoords.y - pr.lastY;
      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);

      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }

      pr.lastTime = now;
      pr.lastX = graphCoords.x;
      pr.lastY = graphCoords.y;
      pr.x = graphCoords.x;
      pr.y = graphCoords.y;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;

      // Apply speed-triggered inertia push to nearby dots
      if (speed > speedTrigger) {
        dotsRef.current.forEach((dot) => {
          const dist = Math.hypot(dot.cx - graphCoords.x, dot.cy - graphCoords.y);
          if (dist < proximity && !dot._inertiaApplied) {
            dot._inertiaApplied = true;
            gsap.killTweensOf(dot);
            const pushX = dot.cx - graphCoords.x + vx * 0.005;
            const pushY = dot.cy - graphCoords.y + vy * 0.005;
            gsap.to(dot, {
              inertia: { xOffset: pushX, yOffset: pushY, resistance },
              onComplete: () => {
                gsap.to(dot, {
                  xOffset: 0,
                  yOffset: 0,
                  duration: returnDuration,
                  ease: 'elastic.out(1,0.75)'
                });
                dot._inertiaApplied = false;
              }
            });
          }
        });
      }
    };

    const handleMouseLeave = () => {
      mouseGraphPos.current = null;
      pointerRef.current.speed = 0;
    };

    const handleClick = (e: MouseEvent) => {
      const graph = graphRef.current;
      if (!graph) return;

      const rect = container.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const graphCoords = graph.screen2GraphCoords(screenX, screenY);

      // Apply shock wave to nearby dots
      dotsRef.current.forEach((dot) => {
        const dist = Math.hypot(dot.cx - graphCoords.x, dot.cy - graphCoords.y);
        if (dist < shockRadius && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const falloff = Math.max(0, 1 - dist / shockRadius);
          const pushX = (dot.cx - graphCoords.x) * shockStrength * falloff;
          const pushY = (dot.cy - graphCoords.y) * shockStrength * falloff;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: 'elastic.out(1,0.75)'
              });
              dot._inertiaApplied = false;
            }
          });
        }
      });
    };

    // Use window-level listener to track mouse even during node drags
    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('click', handleClick);
    };
  }, [maxSpeed, speedTrigger, proximity, resistance, returnDuration, shockRadius, shockStrength]);

  // Preload Images
  useEffect(() => {
    graphData.nodes.forEach(node => {
      if (node.img && !imgs.current[node.id]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = node.img;
        img.onload = () => {
          imgs.current[node.id] = img;
          imgsHasAlpha.current[node.id] = imageHasTransparency(img);
          // Force re-render to show loaded image
          // Using a functional update to ensure reference change
          setDimensions(prev => ({ ...prev }));
        };
      }
    });
  }, []);

  // Layered Reveal & Filter
  useEffect(() => {
    // Basic filtering logic
    const allNodes = graphData.nodes;
    const allLinks = graphData.links;

    let filteredNodes = allNodes;
    if (filter) {
      if (filter === 'Theory') {
        filteredNodes = allNodes.filter(n => ['root', 'focus', 'concept'].includes(n.group));
      } else if (filter === 'Applied Engineering') {
        filteredNodes = allNodes.filter(n => ['root', 'focus', 'project'].includes(n.group));
      } else if (filter === 'Mathematics') {
        filteredNodes = allNodes.filter(n => ['root', 'focus', 'concept'].includes(n.group) && (n.tags?.includes('Math') || n.group === 'focus'));
      }
    }

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const links = allLinks.filter(l =>
      nodeIds.has((l.source as any).id || l.source) &&
      nodeIds.has((l.target as any).id || l.target)
    );

    setData({ nodes: filteredNodes, links });
  }, [filter]);

  // Configure force simulation for more spacing
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge')?.strength(-100);
      graphRef.current.d3Force('link')?.distance(50);
    }
  }, [data]);

  // Custom Node Rendering
  const paintNode = useCallback((node: MyNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isActive = node.id === activeNodeId;
    const isRoot = node.group === 'root';
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const size = node.val || 4;

    // Glow effect
    if (isActive || isRoot) {
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, size * 2.5, 0, 2 * Math.PI, false);
      ctx.fillStyle = isActive
        ? (isDark ? 'rgba(100, 200, 255, 0.2)' : 'rgba(59, 130, 246, 0.2)')
        : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)');
      ctx.fill();
    }

    // Node body
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI, false);

    const img = imgs.current[node.id];
    if (img) {
      ctx.save();
      ctx.clip();
      if (imgsHasAlpha.current[node.id]) {
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      ctx.drawImage(img, node.x! - size, node.y! - size, size * 2, size * 2);
      ctx.restore();

      // Border for image nodes
      ctx.strokeStyle = isActive
        ? (isDark ? '#64d2ff' : '#3b82f6')
        : (isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)');
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();
    } else {
      // Color
      if (isRoot) ctx.fillStyle = isDark ? '#ffffff' : '#030213';
      else if (node.group === 'focus') ctx.fillStyle = isDark ? '#e0e0e0' : '#4b5563';
      else if (node.group === 'essay') ctx.fillStyle = isDark ? '#d896ff' : '#ab63fa';
      else if (isActive) ctx.fillStyle = isDark ? '#64d2ff' : '#3b82f6'; // Accent
      else ctx.fillStyle = isDark ? '#888888' : '#9ca3af';

      ctx.fill();
    }

    // Text Label
    const label = node.title;
    if (label && (globalScale >= 1.5 || isRoot || node.group === 'focus' || isActive)) {
      const fontSize = isRoot ? 16 / globalScale : 12 / globalScale;
      ctx.font = `${isRoot ? '600' : '400'} ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isActive
        ? (isDark ? '#64d2ff' : '#3b82f6')
        : (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)');
      ctx.fillText(label, node.x!, node.y! + size + fontSize + 2);
    }
  }, [activeNodeId, theme]);

  // Draw dot grid background - renders in graph coordinate space
  const paintDotGrid = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    // Get the current transform to determine visible area
    const graph = graphRef.current;
    if (!graph) return;

    const { width, height } = dimensions;
    const center = graph.centerAt();
    const zoom = graph.zoom();

    // Calculate the visible area in graph coordinates
    const visibleWidth = width / zoom;
    const visibleHeight = height / zoom;
    const left = (center?.x ?? 0) - visibleWidth / 2;
    const top = (center?.y ?? 0) - visibleHeight / 2;
    const right = left + visibleWidth;
    const bottom = top + visibleHeight;

    // Level-of-detail: as zoom shrinks, the visible area (and naively, the dot
    // count) grows with 1/zoom^2. Step up the graph-space spacing by powers of
    // two so on-screen spacing never drops below MIN_SCREEN_SPACING, keeping
    // the number of dots drawn roughly constant at any zoom level.
    const baseSpacing = gap + dotSize;
    const MIN_SCREEN_SPACING = 12;
    let lod = 1;
    while (baseSpacing * zoom * lod < MIN_SCREEN_SPACING && lod < 1 << 20) {
      lod *= 2;
    }
    const spacing = baseSpacing * lod;

    // Determine which dots are visible (with some padding)
    const padding = spacing * 2;
    const startX = Math.floor((left - padding) / spacing) * spacing;
    const startY = Math.floor((top - padding) / spacing) * spacing;
    const endX = Math.ceil((right + padding) / spacing) * spacing;
    const endY = Math.ceil((bottom + padding) / spacing) * spacing;

    // Get mouse position for proximity detection
    const mouse = mouseGraphPos.current;
    const proxSq = proximity * proximity;

    // Ensure dots exist for visible area and update them
    const currentDots = dotsRef.current;
    const visibleDotKeys = new Set<string>();
    const now = performance.now();

    // Draw dots
    for (let x = startX; x <= endX; x += spacing) {
      for (let y = startY; y <= endY; y += spacing) {
        const key = `${lod}:${x},${y}`;
        visibleDotKeys.add(key);

        // Get or create dot object
        let dot = currentDots.get(key);
        if (!dot) {
          dot = { cx: x, cy: y, xOffset: 0, yOffset: 0, _inertiaApplied: false, fadeStart: now };
          currentDots.set(key, dot);
        }

        // Fade in over DOT_FADE_DURATION_MS since creation — plain arithmetic,
        // no per-dot tween object, since a LOD boundary crossing can make
        // hundreds of dots "new" in the same frame.
        const fadeAge = now - dot.fadeStart;
        const opacity = fadeAge >= DOT_FADE_DURATION_MS ? 1 : easeOutQuad(fadeAge / DOT_FADE_DURATION_MS);

        // Calculate actual position with offset
        const drawX = dot.cx + dot.xOffset;
        const drawY = dot.cy + dot.yOffset;

        // Calculate color based on mouse proximity (use base position for color calc)
        let fillColor = baseColor;

        if (mouse) {
          const dx = dot.cx - mouse.x;
          const dy = dot.cy - mouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq <= proxSq) {
            const dist = Math.sqrt(distSq);
            const t = 1 - dist / proximity;
            const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
            const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
            const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
            fillColor = `rgb(${r},${g},${b})`;
          }
        }

        ctx.globalAlpha = opacity;
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(drawX, drawY, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1; // don't leak into the nodes/links drawn right after this

    // Drop dots that are no longer visible. They're never drawn once outside
    // visibleDotKeys, so there's nothing to fade out on removal — just evict
    // immediately (unless mid inertia-push animation) to keep the cache bounded.
    currentDots.forEach((dot, key) => {
      if (!visibleDotKeys.has(key) && !dot._inertiaApplied) {
        currentDots.delete(key);
      }
    });
  }, [dimensions, dotSize, gap, baseColor, proximity, baseRgb, activeRgb]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data as any}
        nodeLabel={() => ''} // Disable default tooltip
        nodeCanvasObject={paintNode as any}
        onRenderFramePre={(ctx, globalScale) => paintDotGrid(ctx, globalScale)}
        linkColor={(link: any) => {
          // Tag-based links in a distinct color (more transparent, dashed appearance via width)
          if (link.type === 'tag') {
            return theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches)
              ? 'rgba(59, 130, 246, 0.1)' // Blue for tag links (light mode)
              : 'rgba(96, 165, 250, 0.15)'; // Blue for tag links (dark mode)
          }
          // Explicit links in default color
          return theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? 'rgba(0,0,0,0.15)'
            : 'rgba(255,255,255,0.15)';
        }}
        linkWidth={(link: any) => {
          // Tag-based links thinner to distinguish from explicit links
          return link.type === 'tag' ? 0.5 : 1;
        }}
        linkDistance={150}
        d3VelocityDecay={0.5}
        enableNodeDrag={true}
        onNodeDrag={(node) => {
          // Update mouse position to follow the dragged node
          if (node.x !== undefined && node.y !== undefined) {
            mouseGraphPos.current = { x: node.x, y: node.y };

            // Track velocity during drag
            const now = performance.now();
            const pr = pointerRef.current;
            const dt = pr.lastTime ? now - pr.lastTime : 16;

            const dx = node.x - pr.lastX;
            const dy = node.y - pr.lastY;
            let vx = (dx / dt) * 1000;
            let vy = (dy / dt) * 1000;
            let speed = Math.hypot(vx, vy);

            if (speed > maxSpeed) {
              const scale = maxSpeed / speed;
              vx *= scale;
              vy *= scale;
              speed = maxSpeed;
            }

            pr.lastTime = now;
            pr.lastX = node.x;
            pr.lastY = node.y;
            pr.x = node.x;
            pr.y = node.y;
            pr.vx = vx;
            pr.vy = vy;
            pr.speed = speed;

            // Apply speed-triggered inertia push to nearby dots
            if (speed > speedTrigger) {
              dotsRef.current.forEach((dot) => {
                const dist = Math.hypot(dot.cx - node.x!, dot.cy - node.y!);
                if (dist < proximity && !dot._inertiaApplied) {
                  dot._inertiaApplied = true;
                  gsap.killTweensOf(dot);
                  const pushX = dot.cx - node.x! + vx * 0.005;
                  const pushY = dot.cy - node.y! + vy * 0.005;
                  gsap.to(dot, {
                    inertia: { xOffset: pushX, yOffset: pushY, resistance },
                    onComplete: () => {
                      gsap.to(dot, {
                        xOffset: 0,
                        yOffset: 0,
                        duration: returnDuration,
                        ease: 'elastic.out(1,0.75)'
                      });
                      dot._inertiaApplied = false;
                    }
                  });
                }
              });
            }
          }
        }}
        onNodeDragEnd={node => {
          // Release the fixed position so the node rejoins the simulation instead of staying frozen
          node.fx = undefined;
          node.fy = undefined;
        }}
        onNodeClick={(node) => {
          // Zoom to node?
          if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(2.5, 2000);
          }
          onNodeClick(node as MyNode);
        }}
        backgroundColor="transparent"
        cooldownTicks={Infinity}
        cooldownTime={Infinity}
      />
    </div>
  );
};

export default GraphView;
