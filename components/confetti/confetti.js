Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    particles: [],
    animationId: null,
    canvas: null,
    ctx: null,
    canvasWidth: 0,
    canvasHeight: 0
  },

  observers: {
    'show': function(show) {
      if (show) {
        this.triggerConfetti();
      }
    }
  },

  lifetimes: {
    attached() {
      this.initCanvas();
    },
    
    detached() {
      this.stopAnimation();
    }
  },

  methods: {
    initCanvas() {
      const query = xhs.createSelectorQuery().in(this);
      query.select('#confettiCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0]) return;
          
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = xhs.getSystemInfoSync().pixelRatio;
          
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);
          
          this.setData({
            canvas: canvas,
            ctx: ctx,
            canvasWidth: res[0].width,
            canvasHeight: res[0].height
          });
        });
    },

    triggerConfetti() {
      if (!this.data.ctx) {
        setTimeout(() => this.triggerConfetti(), 100);
        return;
      }

      const particles = [];
      const particleCount = 200;
      const colors = ['#FF2442', '#FF6B9D', '#FFA07A', '#FFD700', '#87CEEB', '#98FB98'];
      
      // 从底部中心爆发
      const originX = this.data.canvasWidth / 2;
      const originY = this.data.canvasHeight * 0.7;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 10 + 5;
        const spread = Math.random() * 120 + 30;
        
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * velocity * (spread / 100),
          vy: Math.sin(angle) * velocity * (spread / 100) - Math.random() * 5,
          radius: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
          decay: Math.random() * 0.015 + 0.01,
          gravity: 0.3,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10
        });
      }
      
      this.setData({ particles });
      this.animate();
      
      // 2秒后通知父组件隐藏
      setTimeout(() => {
        this.triggerEvent('finished');
      }, 2000);
    },

    animate() {
      const ctx = this.data.ctx;
      const width = this.data.canvasWidth;
      const height = this.data.canvasHeight;
      let particles = this.data.particles;
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 更新和绘制粒子
      particles = particles.filter(particle => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity;
        particle.life -= particle.decay;
        particle.rotation += particle.rotationSpeed;
        
        // 粒子消失
        if (particle.life <= 0 || particle.y > height) {
          return false;
        }
        
        // 绘制粒子（矩形纸屑效果）
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation * Math.PI / 180);
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.radius, -particle.radius / 2, particle.radius * 2, particle.radius);
        ctx.restore();
        
        return true;
      });
      
      this.setData({ particles });
      
      // 继续动画
      if (particles.length > 0) {
        this.data.animationId = requestAnimationFrame(() => this.animate());
      } else {
        this.stopAnimation();
      }
    },

    stopAnimation() {
      if (this.data.animationId) {
        cancelAnimationFrame(this.data.animationId);
        this.setData({ animationId: null, particles: [] });
      }
      if (this.data.ctx) {
        this.data.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
      }
    }
  }
});
