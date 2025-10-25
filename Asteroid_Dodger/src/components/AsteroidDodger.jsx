import React, { useEffect, useRef, useState } from "react";

// Asteroid Dodger — Canvas Edition
// Single-file React component (JSX). Drop into your React app.
// Styling hints: uses Tailwind classes in markup but core rendering is Canvas-based.

export default function AsteroidDodgerCanvas() {
  // --- CONFIG ---
  const BASE_SPAWN = 900; // ms
  const MIN_SPAWN = 220; // ms
  const ASTEROID_MIN = 20;
  const ASTEROID_MAX = 84;
  const ASTEROID_BASE_SPEED = 80; // px/sec at reference height
  const ASTEROID_LIFESPAN = 25000; // ms fallback
  const SHIP_BASE_WIDTH = 72; // visual

  // Refs for mutable game state (avoid frequent React renders)
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const spawnAccRef = useRef(0);
  const spawnIntervalRef = useRef(BASE_SPAWN);
  const asteroidsRef = useRef([]);
  const surviveRef = useRef(0);
  const difficultyRef = useRef(0);
  const runningRef = useRef(false);
  const shipXRef = useRef(0.5); // normalized 0..1
  const shipWidthRef = useRef(SHIP_BASE_WIDTH);
  const collisionsRef = useRef(0);

  // UI state (lightweight, updated at throttled intervals)
  const [running, setRunning] = useState(false);
  const [survivedSec, setSurvivedSec] = useState(0);
  const [bestSec, setBestSec] = useState(() =>
    Math.floor(Number(localStorage.getItem("ad_best_canvas") || 0) / 1000)
  );
  const [asteroidCount, setAsteroidCount] = useState(0);
  const [collisionCount, setCollisionCount] = useState(0);

  // Utility
  const rand = (min, max) => Math.random() * (max - min) + min;
  const uid = () => Math.random().toString(36).slice(2, 9);

  // Resize canvas for device pixel ratio
  const resizeCanvas = (canvas) => {
    if (!canvas) return;
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.max(320, Math.floor(rect.width));
    const h = Math.max(200, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // Start game
  const startGame = () => {
    asteroidsRef.current = [];
    surviveRef.current = 0;
    difficultyRef.current = 0;
    spawnIntervalRef.current = BASE_SPAWN;
    lastTsRef.current = performance.now();
    runningRef.current = true;
    collisionsRef.current = 0;
    setCollisionCount(0);
    setRunning(true);
    // ensure UI shows 0 immediately
    setSurvivedSec(0);
    setAsteroidCount(0);
    // start loop (if not already)
    if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
  };

  // Stop game (end)
  const endGame = (collided = false) => {
    runningRef.current = false;
    setRunning(false);
    if (collided) {
      collisionsRef.current += 1;
      setCollisionCount(collisionsRef.current);
    }
    // store best
    const bestMsPrev = Number(localStorage.getItem("ad_best_canvas") || 0);
    const curMs = Math.floor(surviveRef.current);
    if (curMs > bestMsPrev) {
      // write async-ish
      setTimeout(
        () => localStorage.setItem("ad_best_canvas", String(curMs)),
        0
      );
      setBestSec(Math.floor(curMs / 1000));
    }
    // clear asteroids
    asteroidsRef.current = [];
    setAsteroidCount(0);
  };

  // Spawn one asteroid using canvas size
  const spawnOne = (width, height) => {
    const size = Math.round(rand(ASTEROID_MIN, ASTEROID_MAX));
    const cx = rand(size / 2, width - size / 2);
    const vx = rand(-22, 22);
    const vy =
      rand(ASTEROID_BASE_SPEED * 0.9, ASTEROID_BASE_SPEED * 1.8) *
      (1 + difficultyRef.current * 0.02) *
      (height / 520);
    const ast = {
      id: uid(),
      cx,
      top: -size,
      size,
      vx,
      vy,
      hue: Math.floor(rand(10, 50)),
      created: Date.now(),
    };
    asteroidsRef.current.push(ast);
  };

  // Canvas click to destroy asteroid
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // find nearest asteroid within radius
    let removed = false;
    for (let i = asteroidsRef.current.length - 1; i >= 0; i--) {
      const a = asteroidsRef.current[i];
      const ax = a.cx;
      const ay = a.top + a.size / 2;
      const r = a.size / 2;
      const dx = ax - x;
      const dy = ay - y;
      if (dx * dx + dy * dy <= (r + 8) * (r + 8)) {
        // remove and small reward (shorten survival penalty by pushing asteroid away)
        asteroidsRef.current.splice(i, 1);
        removed = true;
        break;
      }
    }
    if (removed) setAsteroidCount(asteroidsRef.current.length);
  };

  // Input: pointer move to set ship position
  const handlePointerMove = (e) => {
    if (!runningRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    if (e.touches && e.touches[0]) clientX = e.touches[0].clientX;
    const norm = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    shipXRef.current = norm;
  };

  // Keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " ") {
        // toggle pause
        if (runningRef.current) {
          runningRef.current = false;
          setRunning(false);
        } else {
          // resume
          lastTsRef.current = performance.now();
          runningRef.current = true;
          setRunning(true);
          if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
        }
      }
      if (!runningRef.current) return;
      if (e.key === "ArrowLeft" || e.key === "a")
        shipXRef.current = Math.max(0, shipXRef.current - 0.06);
      if (e.key === "ArrowRight" || e.key === "d")
        shipXRef.current = Math.min(1, shipXRef.current + 0.06);
      if (e.key === "r") {
        endGame(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Main loop (declared with function hoisting so used in other handlers)
  const loop = (now) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rafRef.current = null;
      return;
    }
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (!lastTsRef.current) lastTsRef.current = now;
    const dt = Math.min(60, now - lastTsRef.current) / 1000; // seconds, clamp
    lastTsRef.current = now;

    // If not running, just draw idle scene and stop RAF
    if (!runningRef.current) {
      draw(ctx, w, h, true);
      rafRef.current = null;
      return;
    }

    // update survive and difficulty
    surviveRef.current += dt * 1000;
    difficultyRef.current += (dt * 1000) / 10000; // small growth

    // spawn management
    spawnAccRef.current += dt * 1000;
    spawnIntervalRef.current = Math.max(
      MIN_SPAWN,
      BASE_SPAWN - difficultyRef.current * 14
    );
    if (spawnAccRef.current >= spawnIntervalRef.current) {
      spawnAccRef.current = 0;
      const repeat =
        Math.random() < Math.min(0.6, difficultyRef.current / 30)
          ? 1 + Math.round(Math.random())
          : 1;
      for (let i = 0; i < repeat; i++) spawnOne(w, h);
    }

    // move asteroids
    const nowMs = Date.now();
    for (let i = asteroidsRef.current.length - 1; i >= 0; i--) {
      const a = asteroidsRef.current[i];
      a.cx += a.vx * dt;
      a.top += a.vy * dt;
      // remove if out of bounds or expired
      if (a.top - a.size > h + 120 || nowMs - a.created > ASTEROID_LIFESPAN) {
        asteroidsRef.current.splice(i, 1);
        continue;
      }
    }

    // ship position in pixels
    const shipPxX = shipXRef.current * w;
    const shipPxY = h - 70;
    const shipRadius = Math.max(12, shipWidthRef.current * 0.22);

    // collision detection (cheap) — check asteroids close to ship vertical zone
    for (let i = asteroidsRef.current.length - 1; i >= 0; i--) {
      const a = asteroidsRef.current[i];
      const asteroidCenterY = a.top + a.size / 2;
      if (asteroidCenterY > shipPxY - 120) {
        const ar = (a.size / 2) * 0.78;
        const dx = a.cx - shipPxX;
        const dy = asteroidCenterY - shipPxY;
        if (dx * dx + dy * dy <= (ar + shipRadius) * (ar + shipRadius)) {
          // collision
          endGame(true);
          draw(ctx, w, h, false, true);
          return; // stop loop
        }
      }
    }

    // periodic UI updates (throttle to 200ms)
    if (!loop._lastUI || now - loop._lastUI > 180) {
      loop._lastUI = now;
      setSurvivedSec(Math.floor(surviveRef.current / 1000));
      setAsteroidCount(asteroidsRef.current.length);
      setCollisionCount(collisionsRef.current);
    }

    // Draw frame
    draw(ctx, w, h, false);

    // schedule next frame
    rafRef.current = requestAnimationFrame(loop);
  };

  // Drawing helper
  const draw = (ctx, w, h, idle = false, showCrash = false) => {
    // clear
    ctx.clearRect(0, 0, w, h);

    // background starfield
    drawBackground(ctx, w, h, idle);

    // asteroids
    for (let i = 0; i < asteroidsRef.current.length; i++) {
      drawAsteroid(ctx, asteroidsRef.current[i]);
    }

    // ship
    drawShip(
      ctx,
      shipXRef.current * w,
      h - 70,
      shipWidthRef.current,
      showCrash
    );

    // HUD small overlay (only on canvas for polish; main UI is in DOM too)
    ctx.save();
    ctx.font = "14px system-ui, Arial";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(`Time: ${Math.floor(surviveRef.current / 1000)}s`, 12, 20);
    ctx.fillText(`Asteroids: ${asteroidsRef.current.length}`, 12, 40);
    ctx.restore();
  };

  const drawBackground = (ctx, w, h, idle) => {
    // radial gradient + subtle stars
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#000814");
    g.addColorStop(1, "#04040b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // stars (deterministic small pattern)
    ctx.save();
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 60; i++) {
      const x =
        ((i * 37) % w) + (idle ? 0 : Math.sin(i + Date.now() / 8000) * 8);
      const y =
        ((i * 97) % h) + (idle ? 0 : Math.cos(i + Date.now() / 8000) * 6);
      ctx.fillStyle =
        i % 9 === 0 ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.arc(x, y, i % 7 === 0 ? 1.6 : 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawAsteroid = (ctx, a) => {
    ctx.save();
    const x = a.cx;
    const y = a.top;
    const s = a.size;
    // rotation effect via time
    const rot = ((Date.now() - a.created) / 1000) * (0.2 + a.size / 80);
    ctx.translate(x, y + s / 2);
    ctx.rotate(rot);

    // radial gradient fill
    const grad = ctx.createRadialGradient(
      -s * 0.2,
      -s * 0.2,
      s * 0.05,
      0,
      0,
      s / 2
    );
    const hue = a.hue;
    grad.addColorStop(0, `hsl(${hue} 25% 80%)`);
    grad.addColorStop(1, `hsl(${(hue + 30) % 360} 30% 35%)`);
    ctx.fillStyle = grad;

    // main circle
    ctx.beginPath();
    ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
    ctx.fill();

    // craters (shadows)
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.beginPath();
    ctx.ellipse(-s * 0.14, -s * 0.08, s * 0.18, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.14, s * 0.08, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, s * 0.22, s * 0.08, s * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    // stroke
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = Math.max(1, s * 0.03);
    ctx.stroke();

    ctx.restore();
  };

  const drawShip = (ctx, cx, cy, width, crashed = false) => {
    ctx.save();
    ctx.translate(cx, cy);
    // slight tilt depending on position
    const tilt = (shipXRef.current - 0.5) * 0.6;
    ctx.rotate(tilt);

    // engine glow
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    const grad = ctx.createRadialGradient(0, 18, 2, 0, 18, 40);
    grad.addColorStop(
      0,
      crashed ? "rgba(255,80,60,0.9)" : "rgba(255, 182, 101, 0.55)"
    );
    grad.addColorStop(1, "rgba(255, 107, 107, 0.0)");
    ctx.fillStyle = grad;
    ctx.ellipse(0, 18, 20, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // body
    ctx.fillStyle = crashed ? "#ff6666" : "#bdefff";
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-width / 2 + 6, 10);
    ctx.lineTo(0, -28);
    ctx.lineTo(width / 2 - 6, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // cockpit
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.ellipse(0, -6, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Attach input listeners on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resizeCanvas(canvas);
    const onResize = () => resizeCanvas(canvas);
    window.addEventListener("resize", onResize);

    // pointer handlers
    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("touchmove", handlePointerMove, { passive: true });
    canvas.addEventListener("mousedown", handlePointerMove);
    canvas.addEventListener("touchstart", handlePointerMove, { passive: true });
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("touchend", handleCanvasClick);

    // initial draw
    const ctx = canvas.getContext("2d");
    draw(
      ctx,
      canvas.getBoundingClientRect().width,
      canvas.getBoundingClientRect().height,
      true
    );

    return () => {
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("touchmove", handlePointerMove);
      canvas.removeEventListener("mousedown", handlePointerMove);
      canvas.removeEventListener("touchstart", handlePointerMove);
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("touchend", handleCanvasClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // UI controls (DOM) — lightweight
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#020217] to-[#04040b] text-white p-6 flex items-start justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl p-4 bg-[rgba(10,14,20,0.6)] border border-white/6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-sm">
                    🚀
                  </span>
                  Asteroid Dodger — Canvas Edition
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Optimized canvas renderer · smoother 60FPS · mobile-ready
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Time</div>
                  <div className="text-lg font-bold">{survivedSec}s</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Best</div>
                  <div className="text-lg font-bold text-amber-300">
                    {bestSec}s
                  </div>
                </div>
                <div>
                  {!running ? (
                    <button
                      onClick={startGame}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-slate-600 to-slate-800 font-bold shadow"
                    >
                      Launch
                    </button>
                  ) : (
                    <button
                      onClick={() => endGame(false)}
                      className="px-4 py-2 rounded-full bg-red-600/90 font-bold shadow"
                    >
                      Abort
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="relative mt-4 h-[520px] rounded-lg overflow-hidden border border-white/6">
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Overlay when not running */}
              {!running && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                  <div className="pointer-events-auto bg-black/50 backdrop-blur-md border border-white/8 p-6 rounded-2xl text-center">
                    <h2 className="text-2xl font-extrabold">
                      {surviveRef.current > 0
                        ? "You Crashed!"
                        : "Ready for Launch"}
                    </h2>
                    <p className="text-slate-300 mt-2">
                      {surviveRef.current > 0
                        ? `Survived ${Math.floor(surviveRef.current / 1000)}s`
                        : "Move with arrow keys or drag; avoid asteroids."}
                    </p>
                    <div className="mt-4 flex justify-center gap-3">
                      <button
                        onClick={startGame}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-slate-600 to-slate-800 font-bold pointer-events-auto"
                      >
                        {surviveRef.current > 0 ? "Play Again" : "Start"}
                      </button>
                      {surviveRef.current > 0 && (
                        <button
                          onClick={() => {
                            localStorage.setItem("ad_best_canvas", "0");
                            setBestSec(0);
                          }}
                          className="px-3 py-2 rounded-full bg-white/6 text-sm pointer-events-auto"
                        >
                          Reset Best
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 text-slate-400 text-sm">
              Tip: click an asteroid to destroy it. Use arrows or drag. Press{" "}
              <span className="font-semibold">Space</span> to pause.
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl p-6 bg-[rgba(255,255,255,0.03)] border border-white/6 shadow-xl">
            <h3 className="text-lg font-extrabold flex items-center gap-3">
              Flight Stats <span className="text-amber-300">🏆</span>
            </h3>
            <p className="text-sm text-slate-300 mt-1">Live summary & best</p>

            <div className="mt-4 grid gap-3">
              <Stat title="Time Survived" value={`${survivedSec}s`} icon="⏱️" />
              <Stat title="Best Time" value={`${bestSec}s`} icon="🥇" />
              <Stat title="Collisions" value={`${collisionCount}`} icon="💥" />
              <Stat
                title="Asteroids On Screen"
                value={`${asteroidCount}`}
                icon="☄️"
              />
            </div>

            <div className="mt-5">
              {!running ? (
                <button
                  onClick={startGame}
                  className="w-full px-4 py-3 rounded-full bg-gradient-to-r from-slate-600 to-slate-800 font-bold"
                >
                  Launch Now
                </button>
              ) : (
                <div className="text-sm text-slate-300">
                  Flight active — dodge carefully.
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-slate-400">
              Controls: Arrow keys or drag/touch. Click asteroids to destroy for
              a tiny bonus.
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-slate-400">
            Built with ❤️ • React • Canvas
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, icon }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-white/5">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ background: "linear-gradient(135deg,#ffffff11,#00000011)" }}
        >
          {icon}
        </div>
        <div>
          <div className="text-xs text-slate-300">{title}</div>
          <div className="text-lg font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}
