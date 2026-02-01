import React, { useEffect, useRef } from 'react';

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: {
        x: number, 
        y: number, 
        vx: number, 
        vy: number, 
        baseSize: number, 
        rotation: number, 
        rotationSpeed: number
    }[] = [];

    let animationFrameId: number;
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 25000); // Sparser for leaves
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4, // Gentle float
          vy: (Math.random() - 0.5) * 0.4,
          baseSize: Math.random() * 8 + 4, // Larger than dots
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse interaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        const maxDistance = 150;
        
        let size = p.baseSize;
        let alpha = 0.25; // Base opacity

        if (distance < maxDistance) {
            const scale = (1 - distance / maxDistance);
            size = p.baseSize + (scale * 4); 
            alpha = 0.4 + (scale * 0.4); 
        }

        // Draw Leaf
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        ctx.beginPath();
        // Organic Leaf Shape using Curves
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(size, 0, 0, size);
        ctx.quadraticCurveTo(-size, 0, 0, -size);
        
        // Leaf vein (optional detail for larger leaves)
        if (size > 10) {
            ctx.moveTo(0, -size * 0.6);
            ctx.lineTo(0, size * 0.6);
        }

        ctx.fillStyle = `rgba(76, 154, 42, ${alpha})`; 
        ctx.fill();
        ctx.restore();
        
        // Connect to mouse if very close (Mycelium/Network effect)
        if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(76, 154, 42, ${0.2 * (1 - distance/120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-[1] mix-blend-multiply" 
        style={{ opacity: 0.4 }}
    />
  );
};

export default ParticleBackground;