import React, { useEffect, useRef } from 'react';

const GravityParticles = ({
  count = 300,
  magnetRadius = 10,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.1,
  color = '#FF9FFC',
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = 'capsule',
  fieldStrength = 10,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let animId;
    let mouse = { x: width / 2, y: height / 2 };
    let time = 0;

    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };
    const baseColor = hexToRgb(color);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.baseX = this.x;
        this.baseY = this.y;
        this.depth = Math.random() * depthFactor + 0.2;
        this.size = (particleSize + Math.random() * particleVariance * 2) * this.depth;
        this.phase = Math.random() * Math.PI * 2;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.ringPhase = Math.random() * Math.PI * 2;
      }

      update(dt) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Magnetic attraction / repulsion
        if (dist < magnetRadius * 50) {
          const force = (1 - dist / (magnetRadius * 50)) * fieldStrength;
          this.vx += (dx / dist) * force * 0.01;
          this.vy += (dy / dist) * force * 0.01;
        }

        // Wave motion
        const waveX = Math.sin(time * waveSpeed + this.phase) * waveAmplitude * 30 * this.depth;
        const waveY = Math.cos(time * waveSpeed * 0.7 + this.phase) * waveAmplitude * 20 * this.depth;

        // Pulse
        const pulse = 1 + Math.sin(time * pulseSpeed + this.pulseOffset) * 0.3;

        this.baseX += waveX * 0.01;
        this.baseY += waveY * 0.01;

        // Lerp towards target
        const targetX = this.baseX + waveX;
        const targetY = this.baseY + waveY;

        this.vx += (targetX - this.x) * lerpSpeed;
        this.vy += (targetY - this.y) * lerpSpeed;

        // Damping
        this.vx *= 0.92;
        this.vy *= 0.92;

        this.x += this.vx;
        this.y += this.vy;

        // Rotation drift
        this.ringPhase += rotationSpeed * 0.01;

        // Wrap edges
        if (this.x < -50) this.x = width + 50;
        if (this.x > width + 50) this.x = -50;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;

        this.currentSize = this.size * pulse;
      }

      draw(ctx) {
        const alpha = 0.4 * this.depth;
        const { r, g, b } = baseColor;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ringPhase);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

        if (particleShape === 'capsule') {
          ctx.beginPath();
          ctx.ellipse(0, 0, this.currentSize * 2, this.currentSize * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (particleShape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, this.currentSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (particleShape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -this.currentSize * 1.5);
          ctx.lineTo(this.currentSize, 0);
          ctx.lineTo(0, this.currentSize * 1.5);
          ctx.lineTo(-this.currentSize, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-this.currentSize, -this.currentSize, this.currentSize * 2, this.currentSize * 2);
        }

        ctx.restore();

        // Ring effect
        if (ringRadius > 0 && this.depth > 0.5) {
          const ringAlpha = 0.08 * this.depth;
          ctx.beginPath();
          ctx.arc(this.x, this.y, ringRadius * 20 * this.depth, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${ringAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    const particles = Array.from({ length: count }, () => new Particle());

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();

    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;
      time += dt * 0.01;

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update(dt);
        p.draw(ctx);
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    count, magnetRadius, ringRadius, waveSpeed, waveAmplitude,
    particleSize, lerpSpeed, color, particleVariance,
    rotationSpeed, depthFactor, pulseSpeed, particleShape, fieldStrength,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default GravityParticles;
