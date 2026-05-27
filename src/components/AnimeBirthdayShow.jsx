import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// One Piece / Luffy visual novel illustrations
import luffyCabin from "../assets/images/backgrounds/luffy_cabin.png";
import luffyBirthday from "../assets/images/backgrounds/luffy_birthday.png";
import luffyCelebration from "../assets/images/backgrounds/luffy_celebration.jpg";
import effects from "../assets/images/effects/effects.png";

// Custom High-Performance Canvas Confetti & Fireworks (React 19 Safe, dependency-free)
function CanvasConfetti({ active, triggerFireworks }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = ["#facc15", "#f59e0b", "#fbbf24", "#ef4444", "#3b82f6", "#a855f7", "#ec4899", "#10b981"];
    const particles = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      r: Math.random() * 5 + 3,
      d: Math.random() * height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.08 + 0.02,
      tiltAngle: 0,
    }));

    let fireworkParticles = [];
    let lastFireworkTime = 0;

    const createFireworkBurst = (x, y) => {
      const count = 55 + Math.floor(Math.random() * 25);
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1.5;
        fireworkParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          color,
          alpha: 1,
          size: Math.random() * 2.2 + 1.2,
          gravity: 0.05,
          drag: 0.98,
          decay: Math.random() * 0.015 + 0.008
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw confetti
      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 4;

        if (p.y > height) {
          p.x = Math.random() * width;
          p.y = -20;
          p.tilt = Math.random() * 10 - 5;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      // Draw fireworks if triggered
      if (triggerFireworks) {
        const now = Date.now();
        if (now - lastFireworkTime > 900 + Math.random() * 700) {
          createFireworkBurst(
            0.1 * width + Math.random() * 0.8 * width,
            0.15 * height + Math.random() * 0.4 * height
          );
          lastFireworkTime = now;
        }

        for (let i = fireworkParticles.length - 1; i >= 0; i--) {
          const p = fireworkParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= p.drag;
          p.vy *= p.drag;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            fireworkParticles.splice(i, 1);
          } else {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.restore();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    if (triggerFireworks) {
      setTimeout(() => createFireworkBurst(width * 0.25, height * 0.3), 100);
      setTimeout(() => createFireworkBurst(width * 0.75, height * 0.25), 450);
      setTimeout(() => createFireworkBurst(width * 0.5, height * 0.45), 800);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, triggerFireworks]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-30" />;
}

// Extracted particle sparks DOM creators to satisfy React Purity Rules
function createCandleSparks(x, y) {
  const container = document.body;
  const count = 12;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "fixed w-2 h-2 rounded-full pointer-events-none z-50 bg-amber-400";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.boxShadow = "0 0 8px #fbbf24";
    container.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 1.5 + Math.random() * 4;
    const dx = Math.cos(angle) * velocity * 12;
    const dy = Math.sin(angle) * velocity * 12 - 15;

    gsap.to(p, {
      x: dx,
      y: dy,
      scale: 0,
      opacity: 0,
      duration: 0.4 + Math.random() * 0.3,
      ease: "power2.out",
      onComplete: () => p.remove(),
    });
  }
}

// Flying gold coins explosion trigger (GPU-accelerated native CSS keyframes)
function createSuccessExplosion() {
  const container = document.body;
  for (let i = 0; i < 40; i++) {
    const gold = document.createElement("div");
    gold.className = "fixed w-3 h-3 rounded-full pointer-events-none z-50 bg-yellow-400 shadow-[0_0_15px_#facc15]";
    gold.style.left = "50vw";
    gold.style.top = "50vh";
    container.appendChild(gold);

    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 260;

    gsap.to(gold, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      scale: 0,
      opacity: 0,
      duration: 0.8 + Math.random() * 1.2,
      ease: "power3.out",
      onComplete: () => gold.remove(),
    });
  }
}

// Floating tap sparkles generator (Mature gold embers)
function createTapSparkle(x, y) {
  const container = document.body;
  const count = 4;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "fixed pointer-events-none z-50 w-2 h-2 bg-gradient-to-br from-yellow-300 to-amber-500 rotate-45 shadow-[0_0_8px_#facc15]";
    p.style.left = `${x - 4}px`;
    p.style.top = `${y - 4}px`;
    container.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const distance = 25 + Math.random() * 45;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 15;

    gsap.to(p, {
      x: dx,
      y: dy,
      scale: 0.1,
      opacity: 0,
      rotation: Math.random() * 270,
      duration: 0.5 + Math.random() * 0.4,
      ease: "power2.out",
      onComplete: () => p.remove()
    });
  }
}

let globalAudioCtx = null;

function getAudioContext() {
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

// Audio synthesizer player (Web Audio API)
function playProceduralSFX(type, isMuted) {
  if (isMuted && type !== "click") return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "slash") {
      // Shing sound: high frequency metal ring + white noise sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.28);
      
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "envelope") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.6);
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.6);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } else if (type === "extinguish") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.exponentialRampToValueAtTime(1975.53, now + 0.18);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "success") {
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(freq, now + idx * 0.07);
        g.gain.setValueAtTime(0.05, now + idx * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.5);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + idx * 0.07);
        o.stop(now + idx * 0.07 + 0.5);
      });
    } else if (type === "match") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.25);
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    console.warn("SFX synthesis failed");
  }
}

// Luffy's laugh sound synth ("Shi-shi-shi-shi!")
function playLuffyLaugh(isMuted) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    for (let i = 0; i < 5; i++) {
      const time = now + i * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(750, time);
      osc.frequency.exponentialRampToValueAtTime(1250, time + 0.065);
      
      gain.gain.setValueAtTime(0.06, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.085);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.09);
    }
  } catch {
    console.warn("Luffy laugh synthesis failed");
  }
}

// Gomu Gomu rubber friction stretch sweep
function playRubberStretchSound(isMuted) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.linearRampToValueAtTime(340, now + 0.22);
    osc.frequency.linearRampToValueAtTime(190, now + 0.38);
    
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.42);
  } catch {
    console.warn("Rubber stretch synthesis failed");
  }
}
// Stable static speed lines configuration to satisfy React 19 Purity rules
const STABLE_SPEED_LINES = [
  { id: 0, left: 12, top: -45, height: 250, delay: 0.02, duration: 0.15 },
  { id: 1, left: 28, top: -80, height: 380, delay: 0.05, duration: 0.18 },
  { id: 2, left: 45, top: -20, height: 210, delay: 0.01, duration: 0.12 },
  { id: 3, left: 63, top: -90, height: 440, delay: 0.08, duration: 0.22 },
  { id: 4, left: 81, top: -35, height: 290, delay: 0.03, duration: 0.14 },
  { id: 5, left: 95, top: -70, height: 320, delay: 0.11, duration: 0.20 },
  { id: 6, left: 5, top: -10, height: 220, delay: 0.07, duration: 0.13 },
  { id: 7, left: 22, top: -60, height: 410, delay: 0.04, duration: 0.17 },
  { id: 8, left: 37, top: -50, height: 350, delay: 0.09, duration: 0.19 },
  { id: 9, left: 53, top: -30, height: 270, delay: 0.02, duration: 0.15 },
  { id: 10, left: 70, top: -85, height: 430, delay: 0.06, duration: 0.21 },
  { id: 11, left: 88, top: -15, height: 240, delay: 0.10, duration: 0.16 },
  { id: 12, left: 18, top: -75, height: 360, delay: 0.03, duration: 0.18 },
  { id: 13, left: 33, top: -40, height: 310, delay: 0.08, duration: 0.14 },
  { id: 14, left: 58, top: -95, height: 450, delay: 0.01, duration: 0.24 },
  { id: 15, left: 76, top: -25, height: 280, delay: 0.05, duration: 0.15 },
  { id: 16, left: 90, top: -65, height: 330, delay: 0.07, duration: 0.20 },
  { id: 17, left: 50, top: -55, height: 400, delay: 0.12, duration: 0.18 }
];

export default function AnimeBirthdayShow() {
  const [gameState, setGameState] = useState("intro"); // intro, playing, reveal
  const [cardOpened, setCardOpened] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Customization states
  const [candlesBlown, setCandlesBlown] = useState([false, false, false]);
  const [wishMade, setWishMade] = useState(false);
  const [candlesLit, setCandlesLit] = useState(true); // Candles start lit by default
  const [lanterns, setLanterns] = useState([]);
  
  // Transition effects states
  const [showSlashBeam, setShowSlashBeam] = useState(false);
  const [showSpeedLines, setShowSpeedLines] = useState(false);

  // Gomu Gomu bubble states
  const [bubbleText, setBubbleText] = useState(null);
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 });

  // Refs
  const containerRef = useRef();
  const envelopeRef = useRef();
  const whiteFlashRef = useRef();
  const slashRef = useRef();
  const cardRef = useRef();
  const textTypedRef = useRef();

  const [isMuted, setIsMuted] = useState(false);

  const handleContainerClick = (e) => {
    if (e.target.closest("button") || e.target.closest("svg") || e.target.closest("a")) return;
    createTapSparkle(e.clientX, e.clientY);
  };

  // Preload background images
  useEffect(() => {
    const images = [luffyCabin, luffyBirthday, luffyCelebration, effects];
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Initialize firefly background on reveal
  useEffect(() => {
    if (gameState !== "reveal") return;
    const initialLanterns = Array.from({ length: 15 }).map((_, idx) => ({
      id: idx,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      size: Math.random() * 8 + 4,
      drift: Math.random() * 120 - 60,
      duration: 10 + Math.random() * 8
    }));
    
    const timer = setTimeout(() => {
      setLanterns(initialLanterns);
    }, 0);
    return () => clearTimeout(timer);
  }, [gameState]);

  // Entrance animation for scroll panel after envelope break
  useEffect(() => {
    if (gameState === "reveal" && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.82, y: 80, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
      );
    }
  }, [gameState]);

  useEffect(() => {
    if (cardOpened && textTypedRef.current) {
      const fullText = `OI! Happy Birthday, Nakama! We've dropped anchor at a mysterious island on the Grand Line to throw you the ultimate pirate banquet. Sanji cooked up a legendary feast (and kept Luffy from eating it all before the party started!). Zoro raised a giant sake mug in your honor, Nami mapped out a path to the birthday treasure, and Usopp is telling tall tales of your heroic exploits to Chopper, who is listening with wide-eyed excitement. Robin found an ancient text wishing you a thousand years of adventure, Franky built a super fireworks display, Brook is playing Binks' Sake on his violin, and Jinbe says your pirate spirit is as strong as the sea itself. No matter how wild the seas get, you are a crucial part of our crew. Let's set sail for the ultimate treasure and make this year your greatest voyage yet. YOUR DREAMS ARE WITHIN REACH.`;
      let currentIdx = 0;
      textTypedRef.current.innerHTML = "";

      const interval = setInterval(() => {
        if (textTypedRef.current) {
          if (currentIdx < fullText.length) {
            textTypedRef.current.innerHTML += fullText.charAt(currentIdx);
            currentIdx++;
          } else {
            clearInterval(interval);
          }
        } else {
          clearInterval(interval);
        }
      }, 18);

      return () => clearInterval(interval);
    }
  }, [cardOpened]);

  const handleEnvelopeClick = () => {
    playProceduralSFX("slash", isMuted);
    playLuffyLaugh(isMuted);
    
    setShowSlashBeam(true);
    setShowSpeedLines(true);
    
    if (envelopeRef.current) {
      gsap.fromTo(envelopeRef.current,
        { x: -6 },
        { 
          x: 6, 
          duration: 0.05, 
          repeat: 6, 
          yoyo: true, 
          ease: "power1.inOut",
          onComplete: () => {
            gsap.to(envelopeRef.current, {
              scale: 2.3,
              opacity: 0,
              duration: 0.22,
              ease: "power2.in"
            });
          }
        }
      );
    }

    setTimeout(() => {
      if (whiteFlashRef.current) {
        gsap.fromTo(whiteFlashRef.current,
          { opacity: 0 },
          { 
            opacity: 1, 
            duration: 0.16,
            onComplete: () => {
              setGameState("reveal");
              setShowConfetti(true);
              setShowSlashBeam(false);
              setShowSpeedLines(false);
              
              gsap.to(whiteFlashRef.current, {
                opacity: 0,
                duration: 0.45
              });
            }
          }
        );
      }
    }, 280);
  };

  const handleLightCandles = () => {
    playProceduralSFX("match", isMuted);
    setCandlesLit(true);
    setCandlesBlown([false, false, false]);
    
    setTimeout(() => {
      const candleElements = document.querySelectorAll(".birthday-candle");
      if (candleElements && candleElements.length > 0) {
        candleElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          createCandleSparks(x, y);
        });
      }
    }, 100);
  };

  const handleBlowOutAllCandles = () => {
    playProceduralSFX("extinguish", isMuted);
    
    const candleElements = document.querySelectorAll(".birthday-candle");
    if (candleElements && candleElements.length > 0) {
      candleElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        createCandleSparks(x, y);
      });
    }
    
    setCandlesBlown([true, true, true]);
    setWishMade(true);
    playProceduralSFX("success", isMuted);
    createSuccessExplosion();

    // Trigger powerful screen shake for premium game-feel
    const container = containerRef.current;
    if (container) {
      gsap.fromTo(container, 
        { x: -8, y: -5 },
        { 
          x: 8, 
          y: 5, 
          duration: 0.04, 
          repeat: 12, 
          yoyo: true, 
          ease: "power1.inOut", 
          onComplete: () => {
            gsap.set(container, { x: 0, y: 0 });
          }
        }
      );
    }
  };

  const handleNavigateToWanted = () => {
    playProceduralSFX("envelope", isMuted);
    if (whiteFlashRef.current) {
      gsap.fromTo(whiteFlashRef.current,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 0.18, 
          yoyo: true, 
          repeat: 1,
          onStart: () => {
            setGameState("wanted");
          }
        }
      );
    } else {
      setGameState("wanted");
    }
  };

  const startShow = () => {
    playProceduralSFX("slash", isMuted);
    setShowSpeedLines(true);

    const card = document.querySelector(".intro-card-panel");
    if (card) {
      gsap.to(card, {
        scale: 0.7,
        opacity: 0,
        y: 65,
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => {
          setGameState("playing");
          setShowSpeedLines(false);
        }
      });
    } else {
      setGameState("playing");
      setShowSpeedLines(false);
    }

  };

  const handleGomuClick = (e) => {
    playRubberStretchSound(isMuted);
    
    // Position bubble at cursor
    setBubbleText("GOMU GOMU NO...");
    setBubblePos({ x: e.clientX, y: e.clientY });

    // Stretch Scroll Card
    const card = document.querySelector(".pirate-scroll");
    if (card) {
      const tl = gsap.timeline();
      tl.to(card, { scaleX: 1.26, scaleY: 0.72, duration: 0.15, ease: "power2.out" });
      tl.to(card, { scaleX: 0.82, scaleY: 1.25, duration: 0.18, ease: "power1.inOut" });
      tl.to(card, { scaleX: 1.08, scaleY: 0.94, duration: 0.14, ease: "power1.inOut" });
      tl.to(card, { scaleX: 1, scaleY: 1, duration: 0.12, ease: "power2.out" });
    }

    setTimeout(() => {
      setBubbleText(null);
    }, 950);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full h-screen bg-[#020202] overflow-hidden select-none font-sans"
    >
      {/* Background image illustrations crossfade */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Intro/playing background */}
        <img
          src={luffyCabin}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          alt="Cabin Background"
          style={{
            opacity: (gameState === "intro" || gameState === "playing") ? 1 : 0,
            filter: gameState === "intro" ? "blur(12px) brightness(0.25)" : "none",
            zIndex: (gameState === "intro" || gameState === "playing") ? 2 : 1
          }}
        />
        {/* Reveal background without Luffy (candles lit/unlit) */}
        <img
          src={luffyBirthday}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          alt="Festive Birthday Cake Background"
          style={{
            opacity: (gameState === "reveal" && !wishMade) ? 1 : 0,
            zIndex: (gameState === "reveal" && !wishMade) ? 3 : 1
          }}
        />
        {/* Final background with Luffy (after wish is made) */}
        <img
          src={luffyCelebration}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          alt="Luffy celebrating Background"
          style={{
            opacity: (gameState === "reveal" && wishMade) ? 1 : 0,
            zIndex: (gameState === "reveal" && wishMade) ? 4 : 1
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/75 pointer-events-none z-10" />
        <div 
          className="absolute inset-0 pointer-events-none animate-pulse z-10" 
          style={{
            background: "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.85) 100%)"
          }}
        />
      </div>

      {/* Audio Controller */}
      {gameState !== "intro" && (
        <button
          onClick={toggleMute}
          className="absolute top-6 right-6 z-50 p-3 rounded-full glass-panel-light text-white/80 hover:text-yellow-400 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl cursor-pointer"
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="2 2 20 20" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="2 2 20 20" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          )}
        </button>
      )}

      {/* --- PRELOADER INTRO SCREEN (STATE: INTRO) --- */}
      {gameState === "intro" && (
        <div className="absolute inset-0 flex flex-col justify-center items-center z-40 px-4">
          <div className="intro-card-panel glass-panel p-8 md:p-12 rounded-3xl max-w-md w-full text-center border-yellow-500/25 shadow-2xl relative overflow-hidden animate-float">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative glow-box-yellow">
              <svg className="w-10 h-10 text-gray-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 1-9-9h2a7 7 0 0 0 14 0h2a9 9 0 0 1-9 9Zm0-9V3m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
              </svg>
              <div className="absolute inset-0 border-4 border-yellow-400/35 rounded-full animate-ping" />
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-wide uppercase">
              A Nakama's Call
            </h2>
            <p className="text-gray-400 text-sm md:text-base mb-8 leading-relaxed">
              Step onto the deck of the Thousand Sunny for a legendary feast.
            </p>

            <button
              onClick={startShow}
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-950 text-base md:text-lg hover:from-yellow-300 hover:to-amber-400 hover:scale-[1.03] active:scale-[0.97] cursor-pointer transition-all duration-300 shadow-lg uppercase tracking-widest neon-glow-btn"
            >
              Start Adventure
            </button>
          </div>
        </div>
      )}

      {/* --- ENVELOPE SELECTION (STATE: PLAYING) --- */}
      {gameState === "playing" && (
        <div className="absolute inset-0 flex flex-col justify-between p-6 z-20">
          <div className="flex-grow flex justify-center items-center">
            <div
              ref={envelopeRef}
              onClick={handleEnvelopeClick}
              className="w-48 h-32 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 border-4 border-double border-yellow-200 rounded-xl flex flex-col items-center justify-center cursor-pointer shadow-[0_0_50px_rgba(234,179,8,0.7)] group hover:scale-105 active:scale-95 transition-transform"
              style={{
                animation: "float 4s ease-in-out infinite"
              }}
            >
              <div className="w-12 h-12 bg-red-600 border-2 border-red-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                <span className="text-white text-lg font-black">☠</span>
              </div>
              <span className="text-[10px] text-gray-950 font-black tracking-widest uppercase mt-3">Break seal</span>
            </div>
          </div>

          <div
            className="w-full max-w-2xl mx-auto vn-textbox rounded-2xl p-5 relative border-l-4 border-yellow-400 text-center"
          >
            <p className="text-sm md:text-base text-yellow-100 font-medium tracking-wide leading-relaxed">
              Luffy left a mysterious wax-sealed letter on your desk. Click the seal to open it!
            </p>
          </div>
        </div>
      )}

      {/* Slash sweep mask */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-30 overflow-hidden">
        <img
          ref={slashRef}
          src={effects}
          className="w-full h-full object-contain mix-blend-screen opacity-0"
          alt="Slash Sweep"
        />
      </div>

      {/* Screen flash layer */}
      <div
        ref={whiteFlashRef}
        className="absolute inset-0 bg-white pointer-events-none opacity-0 z-40"
      />

      {/* Speed lines Visual Effect */}
      {showSpeedLines && (
        <div className="absolute inset-0 pointer-events-none z-45 overflow-hidden">
          {STABLE_SPEED_LINES.map((line) => (
            <div
              key={line.id}
              className="speed-line"
              style={{
                left: `${line.left}%`,
                top: `${line.top}px`,
                height: `${line.height}px`,
                animationDelay: `${line.delay}s`,
                animationDuration: `${line.duration}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Red Slash Cut Visual Beam */}
      {showSlashBeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-[160%] h-3 bg-red-500 shadow-[0_0_20px_#ef4444,0_0_40px_#ef4444] rotate-[-25deg] scale-x-0 animate-slash-beam" />
        </div>
      )}

      {/* Manga Stretch Text Bubble */}
      {bubbleText && (
        <div
          className="gomu-bubble"
          style={{ left: `${bubblePos.x}px`, top: `${bubblePos.y}px` }}
        >
          {bubbleText}
        </div>
      )}

      {/* --- BIRTHDAY REVEAL SCREEN (STATE: REVEAL) --- */}
      {gameState === "reveal" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20 overflow-y-auto custom-scrollbar">
          
          {/* Confetti Rain Canvas */}
          <CanvasConfetti active={showConfetti} triggerFireworks={wishMade} />

          {/* Dynamic Firefly Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {lanterns.map((l) => (
              <div
                key={l.id}
                className="lantern-particle"
                style={{
                  left: `${l.left}%`,
                  width: `${l.size}px`,
                  height: `${l.size}px`,
                  animationDelay: `${l.delay}s`,
                  animationDuration: `${l.duration}s`,
                  "--drift": `${l.drift}px`,
                }}
              />
            ))}
          </div>

          {/* Gacha-Style light rays backdrop */}
          <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30 flex items-center justify-center z-0">
            <div className="light-rays" />
          </div>

          {/* Header Title: HAPPY BIRTHDAY NAKAMA! */}
          <div className="text-center mb-6 z-20 select-none animate-float" style={{ animationDuration: "5s" }}>
            <h1 className="splash-birthday-text text-4xl md:text-5xl font-black uppercase tracking-widest leading-none mb-2">
              HAPPY BIRTHDAY
            </h1>
            <h2 className="splash-nakama-text text-2xl md:text-3xl font-extrabold uppercase tracking-widest text-[#fff8e1]">
              NAKAMA!
            </h2>
          </div>

          {/* Centered Scroll Container */}
          <div
            ref={cardRef}
            className="z-20 w-full max-w-lg flex flex-col gap-6"
          >
            <div className="pirate-scroll flex flex-col gap-4">
              <div className="scroll-handle-top" />
              
              <div className="border-b border-brown-900/10 pb-3 flex items-center justify-between mt-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-brown-800">
                  GRAND LINE LOG: CREWMATE
                </span>
                {wishMade && (
                  <span className="nakama-badge text-[9px] font-black px-2.5 py-0.5 rounded-full text-amber-950 uppercase tracking-widest animate-pulse">
                    Nakama Joined!
                  </span>
                )}
              </div>

              {!cardOpened ? (
                <div
                  className="flex flex-col items-center justify-center py-8 cursor-pointer group"
                  onClick={() => setCardOpened(true)}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all duration-300 glow-box-yellow animate-float">
                    <svg className="w-8 h-8 text-amber-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-18v18m-9-9h18M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-black mt-4 text-brown-950 group-hover:text-amber-800 transition-colors uppercase tracking-wider text-center">
                    Read Birthday Message
                  </h3>
                  <p className="text-xs text-brown-800 mt-1 text-center font-medium">
                    Tap to unroll the pirate scroll card.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: "170px" }}>
                    <p
                      ref={textTypedRef}
                      className="handwritten text-brown-900 leading-relaxed tracking-wide min-h-[90px]"
                    >
                      {/* Javascript types the message here */}
                    </p>
                  </div>

                  {/* Candle Blowing Interaction */}
                  <div className="border-t border-brown-900/10 pt-3 flex flex-col items-center font-sans">
                    {!wishMade ? (
                      <>
                        <p className="text-[10px] text-brown-800 mb-2.5 tracking-wider uppercase text-center font-bold">
                          {candlesLit 
                            ? "Click the button below to blow out all candles!" 
                            : "Strike the match to light up the pirate candles!"}
                        </p>
                        
                        <div className="relative flex justify-center items-end h-14 w-40 mb-1">
                          <div className="absolute bottom-0 w-28 h-6 bg-gradient-to-t from-red-700 to-red-500 rounded-t-lg border-t-2 border-yellow-100/50 shadow-inner flex items-center justify-center">
                            <span className="text-[9px] text-white/90 font-black tracking-widest uppercase">Make a Wish</span>
                          </div>

                          <div className="absolute bottom-4 w-20 flex justify-between px-2">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="birthday-candle relative w-3 h-7 flex flex-col items-center select-none"
                              >
                                {candlesLit && !candlesBlown[i] && (
                                  <div
                                    className="w-2.5 h-3.5 bg-gradient-to-t from-red-500 via-yellow-400 to-amber-300 rounded-full animate-pulse filter drop-shadow-[0_0_5px_rgba(251,191,36,0.95)] hover:scale-110 transition-transform"
                                    style={{
                                      animationDuration: `${0.35 + i * 0.12}s`,
                                      transformOrigin: "bottom center"
                                    }}
                                  />
                                )}
                                <div className="w-[1px] h-1 bg-gray-600" />
                                <div className={`w-1.5 h-3.5 rounded-sm ${i === 0 ? "bg-cyan-500" : i === 1 ? "bg-purple-500" : "bg-emerald-500"} shadow`} />
                              </div>
                            ))}
                          </div>
                        </div>

                        {!candlesLit ? (
                          <button
                            onClick={handleLightCandles}
                            className="mt-2.5 px-5 py-1.5 bg-gradient-to-r from-red-700 via-amber-600 to-red-700 hover:from-red-600 hover:to-red-600 text-white text-[10px] font-black tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(185,28,28,0.4)] uppercase cursor-pointer"
                          >
                            LIGHT THE CANDLES
                          </button>
                        ) : (
                          <button
                            onClick={handleBlowOutAllCandles}
            className="mt-2.5 px-5 py-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-gray-950 text-[10px] font-black tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)] uppercase cursor-pointer animate-pulse"
                          >
                            BLOW OUT CANDLES
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-1 w-full animate-float flex flex-col items-center">
                        <h4 className="text-base font-black text-red-800 tracking-widest uppercase">
                          YOUR WISH HAS BEEN SENT
                        </h4>
                        <p className="text-[13px] md:text-sm text-brown-900 mt-1.5 font-bold mb-3 tracking-wide px-2">
                          May all your hopes and dreams become reality this year.
                        </p>
                        
                        {/* Luffy celebrating photo revealed here at the end! */}
                        <div className="w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden border-4 border-amber-950/80 shadow-[0_12px_28px_rgba(0,0,0,0.5)] transform hover:scale-[1.03] transition-transform duration-300">
                          <img src={luffyCelebration} className="w-full h-full object-cover" alt="Luffy celebrating with you!" />
                        </div>
 
                        {/* Interactive Navigate Button */}
                        <div className="mt-5 w-full flex flex-col items-center gap-1.5 z-20">
                          <button
                            onClick={handleNavigateToWanted}
                            className="w-full max-w-[300px] py-3.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-gray-950 font-black tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,158,11,0.65)] uppercase cursor-pointer text-xs md:text-sm animate-pulse flex items-center justify-center gap-2 border-2 border-yellow-200"
                          >
                            REVEAL WANTED POSTER
                          </button>
                          <p className="text-[10px] text-brown-900 font-extrabold uppercase tracking-wider mt-1">
                            Click above to claim your pirate bounty.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setCandlesBlown([false, false, false]);
                            setCandlesLit(true);
                            setWishMade(false);
                          }}
                          className="mt-3 px-2.5 py-0.5 rounded bg-brown-900/10 text-brown-800 hover:bg-brown-900/20 hover:text-brown-950 active:scale-95 transition-all text-[9px] font-bold cursor-pointer"
                        >
                          Reset Candles
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end border-t border-brown-900/5 pt-2">
                    <button
                      onClick={() => setCardOpened(false)}
                      className="px-3 py-1 text-[10px] font-bold text-brown-800 hover:text-brown-950 transition-colors cursor-pointer"
                    >
                      ← Close Letter
                    </button>
                  </div>
                </div>
              )}

              <div className="scroll-handle-bottom" />
            </div>

            {/* Bottom Row Interactivity: Gomu Gomu fruit and Luffy Laugh button */}
            <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border-purple-500/20 shadow-lg">
              <div className="flex items-center gap-3">
                {/* Floating Gomu Gomu no Mi Fruit (SVG Vector) */}
                <svg
                  onClick={handleGomuClick}
                  className="gomu-fruit w-12 h-12"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="32" cy="36" r="22" fill="#8b5cf6" />
                  {/* Swirl patterns */}
                  <path d="M22 26 C26 22, 28 32, 32 30 C36 28, 30 42, 36 44 C42 46, 44 32, 48 38" stroke="#4c1d95" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <path d="M16 36 C20 42, 28 38, 32 44" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M40 24 C44 28, 48 24, 50 30" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round" fill="none" />
                  {/* Stalk */}
                  <path d="M32 14 C32 14, 30 6, 26 8 C22 10, 24 16, 28 14" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-widest text-purple-300">Gomu Gomu Fruit</span>
                  <span className="text-[9px] text-gray-400">Click to stretch scroll like rubber!</span>
                </div>
              </div>

              {/* Luffy's Straw Hat Voice Button */}
              <button
                onClick={() => playLuffyLaugh(isMuted)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow gap-1"
                title="Crew's Laugh"
              >
                <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-18v18m-9-9h18M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                </svg>
                <span className="text-[8px] font-black uppercase tracking-wider text-yellow-300 mt-1">Crew's Laugh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NAKAMA WANTED POSTER SCREEN (STATE: WANTED) --- */}
      {gameState === "wanted" && (
        <div className="absolute inset-0 flex flex-col justify-center items-center p-6 z-20 overflow-y-auto custom-scrollbar">
          {/* Confetti Rain & Fireworks Canvas */}
          <CanvasConfetti active={showConfetti} triggerFireworks={true} />

          {/* Dynamic Firefly Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {lanterns.map((l) => (
              <div
                key={l.id}
                className="lantern-particle"
                style={{
                  left: `${l.left}%`,
                  width: `${l.size}px`,
                  height: `${l.size}px`,
                  animationDelay: `${l.delay}s`,
                  animationDuration: `${l.duration}s`,
                  "--drift": `${l.drift}px`,
                }}
              />
            ))}
          </div>

          {/* Gacha-Style light rays backdrop */}
          <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30 flex items-center justify-center z-0">
            <div className="light-rays" />
          </div>

          {/* Wanted Poster Card */}
          <div className="wanted-poster-card animate-float select-none relative z-20 w-full max-w-[310px] sm:max-w-[400px] border-8 sm:border-[12px]">
            <div className="wanted-poster-title text-4xl sm:text-5xl">WANTED</div>
            <div className="wanted-poster-subtitle text-[10px] sm:text-xs">DEAD OR ALIVE</div>

            {/* Photo frame inside wanted poster */}
            <div 
              onClick={() => {
                playProceduralSFX("success", isMuted);
                createSuccessExplosion();
              }}
              className="wanted-photo-frame"
            >
              <img 
                src={luffyCelebration} 
                className="w-full h-full object-cover" 
                alt="Crew Celebration" 
              />
            </div>

            {/* Poster details */}
            <div className="wanted-poster-name text-2xl sm:text-3xl mt-2 sm:mt-4">JAHNAVI</div>
            <div className="wanted-poster-bounty-label text-[10px] sm:text-xs">REWARD</div>
            <div className="wanted-poster-bounty text-lg sm:text-2xl">
              <span className="text-sm sm:text-xl">฿</span> 5,260,000,000-
            </div>
            <div className="wanted-rank-badge wanted-rank-gold mt-1.5 sm:mt-3 text-[10px] sm:text-xs">
              PIRATE QUEEN
            </div>
          </div>

          {/* Navigation back */}
          <button
            onClick={() => {
              playProceduralSFX("click", isMuted);
              setGameState("reveal");
            }}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-gray-950 font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg uppercase tracking-wider z-20 cursor-pointer text-xs sm:text-sm"
          >
            ← Back to Letter
          </button>
        </div>
      )}

      {/* Footer Credits */}
      <div className="absolute bottom-4 left-0 w-full text-white/20 text-[9px] tracking-[0.25em] text-center uppercase z-10 pointer-events-none">
        Crafted for an amazing nakama • Happy Birthday
      </div>
    </div>
  );
}
