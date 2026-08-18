'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { PROVINCES, searchProvinces } from '@/lib/provinceData';
import { useAuthStore } from '@/stores/authStore';
import { MapPin, Province } from '@/types';

export default function MapPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const [pins, setPins] = useState<MapPin[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Province[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!user) { router.replace('/phone'); return; }

    // Fetch map pins from Firestore
    const q = query(collection(firestore, 'mapPosts'), limit(500));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as MapPin));
      setPins(data);
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSearch = (q: string) => {
    setSearch(q);
    setSearchResults(q.trim() ? searchProvinces(q).slice(0, 5) : []);
  };

  const handleSelectProvince = (province: Province) => {
    setSelectedProvince(province);
    setSearch(province.name);
    setSearchResults([]);
    // Center map on province
    // Simple centering based on lat/lng
    const svgW = 400, svgH = 900;
    const latRange = [8.5, 23.5]; // Vietnam bounds
    const lngRange = [102, 110];
    const x = ((province.lng - lngRange[0]) / (lngRange[1] - lngRange[0])) * svgW;
    const y = ((latRange[1] - province.lat) / (latRange[1] - latRange[0])) * svgH;
    setPan({ x: 150 - x * zoom, y: 300 - y * zoom });
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.3, 4));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.3, 0.5));

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.5, Math.min(4, z + delta)));
  };

  const provinceStats = PROVINCES.reduce((acc, p) => {
    const count = pins.filter(pin => pin.provinceCode === p.code).length;
    if (count > 0) acc[p.code] = count;
    return acc;
  }, {} as Record<string, number>);

  const totalProvincesWithPosts = Object.keys(provinceStats).length;

  return (
    <main className="min-h-screen overflow-hidden relative bg-[#f5f0e8]">
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-5 h-16 bg-background border-b border-outline-variant"
        style={{ boxShadow: 'none' }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">flag</span>
          <h1 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
          }}>
            POLAROID CÁCH MẠNG
          </h1>
        </div>
      </header>

      {/* Map viewport */}
      <div
        className="fixed inset-0 mt-16 mb-20 overflow-hidden blueprint-grid cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ userSelect: 'none' }}
      >
        {/* Stats overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2">
          <div
            className="bg-surface border border-outline-variant py-2 px-4 hard-shadow mx-auto w-max"
            style={{ borderRadius: '2px' }}
          >
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.1em',
              fontWeight: 500,
            }}>
              🇻🇳 {pins.length} ẢNH TỪ {totalProvincesWithPosts} TỈNH
            </span>
          </div>

          {/* Search */}
          <div
            className="bg-surface/90 backdrop-blur-sm border-b border-primary py-2 px-3 flex items-center gap-2"
            style={{ borderRadius: '2px' }}
          >
            <span className="material-symbols-outlined text-outline text-[20px]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="TÌM TỈNH..."
              className="bg-transparent border-none outline-none flex-1"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            />
            {search && (
              <button onClick={() => { setSearch(''); setSearchResults([]); }}>
                <span className="material-symbols-outlined text-outline text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="bg-surface border border-outline-variant" style={{ borderRadius: '2px' }}>
              {searchResults.map(p => (
                <button
                  key={p.code}
                  onClick={() => handleSelectProvince(p)}
                  className="w-full text-left px-4 py-2 hover:bg-surface-container-low border-b border-outline-variant/30 last:border-0 flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>{p.name}</span>
                  {provinceStats[p.code] && (
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      color: '#747878',
                      marginLeft: 'auto',
                    }}>
                      {provinceStats[p.code]} ảnh
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SVG Map */}
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 0.15s ease' }}>
          <svg
            ref={svgRef}
            viewBox="0 0 400 900"
            width="400"
            height="900"
            style={{ display: 'block', margin: '0 auto' }}
          >
            {/* Vietnam provinces */}
            {PROVINCES.map(province => {
              const hasPost = provinceStats[province.code] > 0;
              const isSelected = selectedProvince?.code === province.code;
              return (
                <g key={province.code} id={`province-${province.code}`}>
                  {/* Province area represented as circle at lat/lng */}
                  <circle
                    cx={((province.lng - 102) / 8) * 400}
                    cy={((23.5 - province.lat) / 15) * 900}
                    r={hasPost ? 8 : 5}
                    fill={isSelected ? '#b71032' : hasPost ? '#d4c4b0' : '#e8ddd0'}
                    stroke={isSelected ? '#b71032' : '#c4b5a0'}
                    strokeWidth={1}
                    className="cursor-pointer"
                    onClick={() => setSelectedProvince(province)}
                    opacity={0.7}
                  />
                </g>
              );
            })}

            {/* Actual Vietnam outline (simplified) - using svg path embedded */}
            <path
              d="M180,20 L210,25 L230,40 L240,60 L235,90 L225,120 L230,160 L220,200 L210,240 L215,280 L205,310 L195,330 L200,360 L190,390 L185,420 L180,450 L175,480 L170,510 L165,540 L155,570 L150,600 L145,620 L140,640 L138,660 L140,680 L145,700 L148,720 L145,740 L135,760 L120,780 L110,800 L105,820 L108,840 L115,860 L120,875 L130,890 L150,895 L160,890 L168,875 L170,860 L165,840 L175,820 L185,800 L190,780 L195,760 L200,740 L205,720 L210,700 L215,680 L210,660 L205,640 L200,620 L205,600 L210,580 L215,560 L218,540 L215,520 L212,500 L215,480 L220,460 L225,440 L228,420 L225,400 L222,380 L225,360 L230,340 L232,320 L230,300 L228,280 L232,260 L235,240 L233,220 L230,200 L225,180 L228,160 L230,140 L228,120 L225,100 L222,80 L218,60 L215,40 L205,28 L192,22 Z"
              fill="none"
              stroke="#c4b5a0"
              strokeWidth="1.5"
              opacity="0.5"
            />

            {/* Pins from Firestore */}
            {pins.map(pin => {
              const svgX = ((pin.lng - 102) / 8) * 400;
              const svgY = ((23.5 - pin.lat) / 15) * 900;
              return (
                <g
                  key={pin.id}
                  transform={`translate(${svgX},${svgY})`}
                  className="cursor-pointer"
                  onClick={() => setSelectedPin(pin)}
                >
                  {/* Pulse ring */}
                  <circle r="14" fill="#b71032" opacity="0.15" className="pin-pulse" />
                  {/* Pin dot */}
                  <circle r="6" fill="#b71032" opacity="0.85" />
                  <circle r="3" fill="#ffffff" opacity="0.7" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Zoom controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          <button
            onClick={handleZoomIn}
            className="bg-surface border border-outline-variant w-10 h-10 flex items-center justify-center hard-shadow hover:bg-surface-container-low transition-colors"
            style={{ borderRadius: '2px' }}
            aria-label="Phóng to"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">add</span>
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-surface border border-outline-variant w-10 h-10 flex items-center justify-center hard-shadow hover:bg-surface-container-low transition-colors"
            style={{ borderRadius: '2px' }}
            aria-label="Thu nhỏ"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">remove</span>
          </button>
        </div>

        {/* FAB */}
        <button
          onClick={() => router.push('/camera')}
          className="absolute bottom-6 right-6 z-30 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: '#b71032', boxShadow: '4px 4px 0 rgba(0,0,0,0.2)' }}
          aria-label="Chụp ảnh"
        >
          <span className="material-symbols-outlined text-white text-[26px]">add_a_photo</span>
        </button>

        {/* Pin popup */}
        {selectedPin && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-white border border-outline-variant"
            style={{ padding: '12px 12px 32px 12px', borderRadius: '2px', boxShadow: '4px 4px 0 rgba(0,0,0,0.1)', width: '180px', transform: 'translate(-50%, -100%) rotate(2deg)' }}
          >
            {selectedPin.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedPin.imageUrl} alt="Ảnh" className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-outline text-4xl">image</span>
              </div>
            )}
            <div className="mt-2 flex justify-between items-center">
              <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: '13px', fontStyle: 'italic' }}>
                @{selectedPin.userId?.slice(0, 8) || 'unknown'}
              </span>
              <button
                onClick={() => { router.push(`/feed`); setSelectedPin(null); }}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.08em', color: '#b71032', textTransform: 'uppercase' }}
              >
                XEM →
              </button>
            </div>
            <button
              onClick={() => setSelectedPin(null)}
              className="absolute top-2 right-2"
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined text-[16px] text-outline">close</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
