const supports = {
  passiveEvents: false,
  intersectionObserver: 'IntersectionObserver' in window,
  requestAnimationFrame: 'requestAnimationFrame' in window
};

try {
  const opts = Object.defineProperty({}, 'passive', {
    get: () => {
      supports.passiveEvents = true;
      return true;
    }
  });
  window.addEventListener('test', null, opts);
  window.removeEventListener('test', null, opts);
} catch (e) {}

class ParallaxController {
  constructor() {
    this.ticking = false;
    this.scrollY = window.pageYOffset || document.documentElement.scrollTop;
    this.windowHeight = window.innerHeight;
    this.documentHeight = document.documentElement.scrollHeight;
    
    this.planets = Array.from(document.querySelectorAll('.parallax-planet'));
    this.sections = Array.from(document.querySelectorAll('.parallax-section'));
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    
    this.init();
  }

  init() {
    this.setupSmoothScroll();
    this.bindEvents();
    this.update();
    
    if (supports.requestAnimationFrame) {
      this.animate();
    }
    
    console.log('✓ Parallax Controller inicializado');
  }

  setupSmoothScroll() {
    if (CSS.supports && CSS.supports('scroll-behavior', 'smooth')) {
      document.documentElement.style.scrollBehavior = 'auto';
    }
  }

  bindEvents() {
    const eventOptions = supports.passiveEvents ? { passive: true } : false;
    
    window.addEventListener('scroll', () => {
      this.scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      if (!this.ticking && !supports.requestAnimationFrame) {
        this.update();
      }
      
      this.ticking = false;
    }, eventOptions);

    let mouseMoveTimeout;
    window.addEventListener('mousemove', (e) => {
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, 10);
    }, eventOptions);

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.windowHeight = window.innerHeight;
        this.documentHeight = document.documentElement.scrollHeight;
        this.update();
      }, 150);
    }, eventOptions);
  }

  animate() {
    this.update();
    requestAnimationFrame(() => this.animate());
  }

  update() {
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.1;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.1;
    
    this.updatePlanets();
    this.updateProgress();
  }

  updatePlanets() {
    this.planets.forEach((planet, index) => {
      const rect = planet.getBoundingClientRect();
      const planetCenterY = rect.top + rect.height / 2;
      const distanceFromCenter = (planetCenterY - this.windowHeight / 2) / this.windowHeight;
      
      const scrollRotation = this.scrollY * (0.05 + index * 0.02);
      const mouseOffsetX = this.mouseX * (10 + index * 5);
      const mouseOffsetY = this.mouseY * (10 + index * 5);
      const parallaxY = distanceFromCenter * 30;
      
      const transform = `translate(${mouseOffsetX}px, ${mouseOffsetY + parallaxY}px) rotate(${scrollRotation}deg)`;
      planet.style.transform = transform;
    });
  }

  updateProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;
    
    const maxScroll = this.documentHeight - this.windowHeight;
    const scrollPercentage = (this.scrollY / maxScroll) * 100;
    progressBar.style.width = `${Math.min(scrollPercentage, 100)}%`;
  }
}

class StarsEnhancer {
  constructor() {
    this.createDynamicStars();
  }

  createDynamicStars() {
    const starsContainers = document.querySelectorAll('.stars');
    
    starsContainers.forEach(container => {
      const starsCount = window.innerWidth < 768 ? 50 : 100;
      const fragment = document.createDocumentFragment();
      
      for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 2 + 1;
        
        star.className = 'star-point';
        star.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          background: white;
          border-radius: 50%;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          opacity: ${Math.random() * 0.7 + 0.3};
          animation: twinkle ${2 + Math.random() * 3}s infinite ease-in-out;
          animation-delay: ${Math.random() * 3}s;
        `;
        
        fragment.appendChild(star);
      }
      
      container.appendChild(fragment);
    });
  }
}

class ScrollProgressBar {
  constructor() {
    this.createProgressBar();
  }

  createProgressBar() {
    if (document.getElementById('scroll-progress')) return;
    
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);
  }
}

class SectionObserver {
  constructor() {
    this.sections = document.querySelectorAll('.parallax-section');
    this.init();
  }

  init() {
    if (!supports.intersectionObserver) {
      this.sections.forEach(section => {
        section.classList.add('section-visible');
      });
      return;
    }

    const options = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
        }
      });
    }, options);

    this.sections.forEach(section => {
      observer.observe(section);
    });
  }
}

class PerformanceOptimizer {
  constructor() {
    this.optimize();
  }

  optimize() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowPerformance = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    
    if (isMobile || isLowPerformance) {
      document.documentElement.classList.add('reduce-animations');
      
      const style = document.createElement('style');
      style.textContent = `
        .reduce-animations .parallax-planet {
          animation-duration: 8s !important;
        }
        .reduce-animations .star-point {
          animation: none !important;
          opacity: 0.5 !important;
        }
      `;
      document.head.appendChild(style);
    }

    const accelerate = document.createElement('style');
    accelerate.textContent = `
      .parallax-planet,
      .parallax-layer,
      .content-wrapper,
      .nebula-effect,
      .rock {
        transform: translateZ(0);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
    `;
    document.head.appendChild(accelerate);
  }
}

function initParallax() {
  try {
    if (!document.querySelector('.parallax-section')) {
      console.warn('⚠ No se encontraron secciones parallax');
      return;
    }

    new ScrollProgressBar();
    new StarsEnhancer();
    new SectionObserver();
    new ParallaxController();
    new PerformanceOptimizer();
    
    console.log('✓ Todos los efectos parallax inicializados correctamente');
  } catch (error) {
    console.error('✗ Error al inicializar parallax:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initParallax);
} else {
  initParallax();
}

window.addEventListener('error', (e) => {
  if (e.message.includes('parallax') || e.message.includes('transform')) {
    console.warn('⚠ Fallback mode activated');
  }
});