// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
    countdownDays: 3,
    animationDuration: 600,
    scrollThreshold: 0.1,
    parallaxSpeed: 0.5
};

// ===== UTILITÁRIOS =====
const utils = {
    // Debounce para otimizar performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle para scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    // Interpolação linear para animações suaves
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    // Formatação de números com zero à esquerda
    padZero(num) {
        return String(num).padStart(2, '0');
    }
};

// ===== GERENCIADOR DE ANIMAÇÕES =====
class AnimationManager {
    constructor() {
        this.observers = new Map();
        this.scrollElements = [];
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupParallaxEffect();
    }

    // Configurar Intersection Observer para animações de entrada
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: CONFIG.scrollThreshold,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Elementos para animar na entrada
        const animatedElements = document.querySelectorAll(
            '.stat-card, .chapter-card, .danger-card, .highlight-box, .guarantee-card'
        );

        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity ${CONFIG.animationDuration}ms ease-out, transform ${CONFIG.animationDuration}ms ease-out`;
            el.style.transitionDelay = `${index * 100}ms`;
            observer.observe(el);
        });

        this.observers.set('intersection', observer);
    }

    // Animar elemento quando entra na viewport
    animateElement(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }

    // Configurar animações de scroll
    setupScrollAnimations() {
        const navbar = document.querySelector('.navbar');
        const scrollIndicator = document.querySelector('.scroll-indicator');
        
        const handleScroll = utils.throttle(() => {
            const scrollY = window.scrollY;
            
            // Navbar background opacity
            if (navbar) {
                const opacity = Math.min(scrollY / 100, 0.95);
                navbar.style.background = `rgba(255, 255, 255, ${opacity})`;
                navbar.style.backdropFilter = scrollY > 50 ? 'blur(20px)' : 'blur(10px)';
            }

            // Hide scroll indicator
            if (scrollIndicator) {
                scrollIndicator.style.opacity = scrollY > 100 ? '0' : '0.7';
            }

            // Parallax effect for floating shapes
            this.updateParallax(scrollY);
        }, 16);

        window.addEventListener('scroll', handleScroll);
    }

    // Efeito parallax para elementos flutuantes
    setupParallaxEffect() {
        this.floatingShapes = document.querySelectorAll('.floating-shape');
    }

    updateParallax(scrollY) {
        this.floatingShapes.forEach((shape, index) => {
            const speed = (index + 1) * CONFIG.parallaxSpeed;
            const yPos = scrollY * speed;
            shape.style.transform = `translateY(${yPos}px) rotate(${yPos * 0.1}deg)`;
        });
    }
}

// ===== CONTADOR REGRESSIVO AVANÇADO =====
class CountdownTimer {
    constructor() {
        this.endDate = new Date().getTime() + (CONFIG.countdownDays * 24 * 60 * 60 * 1000);
        this.elements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
            container: document.getElementById('timer')
        };
        this.interval = null;
        this.init();
    }

    init() {
        if (!this.elements.container) return;
        
        this.startCountdown();
        this.addVisualEffects();
    }

    startCountdown() {
        this.updateDisplay();
        
        this.interval = setInterval(() => {
            this.updateDisplay();
        }, 1000);
    }

    updateDisplay() {
        const now = new Date().getTime();
        const distance = this.endDate - now;

        if (distance < 0) {
            this.handleExpiration();
            return;
        }

        const timeUnits = this.calculateTimeUnits(distance);
        this.updateElements(timeUnits);
        this.addPulseEffect(timeUnits);
    }

    calculateTimeUnits(distance) {
        return {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
        };
    }

    updateElements(timeUnits) {
        Object.keys(timeUnits).forEach(unit => {
            if (this.elements[unit]) {
                const newValue = utils.padZero(timeUnits[unit]);
                if (this.elements[unit].textContent !== newValue) {
                    this.animateNumberChange(this.elements[unit], newValue);
                }
            }
        });
    }

    animateNumberChange(element, newValue) {
        element.style.transform = 'scale(1.1)';
        element.style.color = '#f5576c';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 150);
    }

    addPulseEffect(timeUnits) {
        // Adicionar efeito de pulso quando restam menos de 24 horas
        if (timeUnits.days === 0 && timeUnits.hours < 24) {
            this.elements.container.classList.add('urgent');
        }
    }

    addVisualEffects() {
        // Adicionar classe CSS para efeitos urgentes
        const style = document.createElement('style');
        style.textContent = `
            .countdown-timer.urgent .time-unit {
                animation: urgentPulse 1s ease-in-out infinite alternate;
            }
            
            @keyframes urgentPulse {
                0% { 
                    box-shadow: 0 0 0 0 rgba(245, 87, 108, 0.7);
                    transform: scale(1);
                }
                100% { 
                    box-shadow: 0 0 0 10px rgba(245, 87, 108, 0);
                    transform: scale(1.05);
                }
            }
        `;
        document.head.appendChild(style);
    }

    handleExpiration() {
        clearInterval(this.interval);
        this.elements.container.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                color: white;
                padding: 2rem;
                border-radius: 1rem;
                text-align: center;
                font-weight: bold;
                font-size: 1.25rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                animation: expiredBounce 0.5s ease-out;
            ">
                ⏰ PROMOÇÃO ENCERRADA!<br>
                <small style="font-size: 0.9rem; opacity: 0.9;">Entre em contato para saber sobre novas ofertas</small>
            </div>
        `;

        // Adicionar animação de expiração
        const expiredStyle = document.createElement('style');
        expiredStyle.textContent = `
            @keyframes expiredBounce {
                0% { transform: scale(0.8); opacity: 0; }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(expiredStyle);
    }
}

// ===== EFEITOS INTERATIVOS =====
class InteractiveEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupButtonEffects();
        this.setupCardHoverEffects();
        this.setupSmoothScrolling();
        this.setupMouseFollower();
    }

    // Efeitos avançados nos botões
    setupButtonEffects() {
        const buttons = document.querySelectorAll('.cta-primary, .cta-purchase, .nav-cta');
        
        buttons.forEach(button => {
            // Efeito ripple
            button.addEventListener('click', (e) => {
                this.createRippleEffect(e, button);
            });

            // Efeito de hover com partículas
            button.addEventListener('mouseenter', () => {
                this.addButtonGlow(button);
            });

            button.addEventListener('mouseleave', () => {
                this.removeButtonGlow(button);
            });
        });
    }

    createRippleEffect(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        // Adicionar animação CSS se não existir
        if (!document.querySelector('#ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addButtonGlow(button) {
        button.style.boxShadow = '0 0 30px rgba(245, 87, 108, 0.5), 0 0 60px rgba(245, 87, 108, 0.3)';
        button.style.transform = 'translateY(-3px) scale(1.02)';
    }

    removeButtonGlow(button) {
        button.style.boxShadow = '';
        button.style.transform = '';
    }

    // Efeitos de hover nos cards
    setupCardHoverEffects() {
        const cards = document.querySelectorAll('.stat-card, .chapter-card, .danger-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addCardTilt(card);
            });

            card.addEventListener('mouseleave', () => {
                this.removeCardTilt(card);
            });

            card.addEventListener('mousemove', (e) => {
                this.updateCardTilt(e, card);
            });
        });
    }

    addCardTilt(card) {
        card.style.transition = 'transform 0.1s ease-out';
    }

    removeCardTilt(card) {
        card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
        card.style.transition = 'transform 0.3s ease-out';
    }

    updateCardTilt(event, card) {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const rotateX = (mouseY - centerY) / 10;
        const rotateY = (centerX - mouseX) / 10;

        card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    // Scroll suave para âncoras
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Compensar navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Cursor personalizado (opcional)
    setupMouseFollower() {
        if (window.innerWidth > 768) { // Apenas em desktop
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            cursor.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.1s ease-out;
                opacity: 0;
            `;
            document.body.appendChild(cursor);

            document.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX - 10 + 'px';
                cursor.style.top = e.clientY - 10 + 'px';
                cursor.style.opacity = '0.7';
            });

            document.addEventListener('mouseenter', () => {
                cursor.style.opacity = '0.7';
            });

            document.addEventListener('mouseleave', () => {
                cursor.style.opacity = '0';
            });

            // Efeito especial em elementos interativos
            const interactiveElements = document.querySelectorAll('a, button, .cta-primary, .cta-purchase');
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursor.style.transform = 'scale(1.5)';
                    cursor.style.background = 'linear-gradient(135deg, #f5576c, #fa709a)';
                });

                el.addEventListener('mouseleave', () => {
                    cursor.style.transform = 'scale(1)';
                    cursor.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                });
            });
        }
    }
}

// ===== OTIMIZAÇÕES DE PERFORMANCE =====
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalAssets();
        this.optimizeAnimations();
    }

    // Lazy loading para imagens
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // Preload de assets críticos
    preloadCriticalAssets() {
        const criticalImages = [
            'capa-sem-fundo.png',
            'capa.png'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Otimizar animações para dispositivos com baixa performance
    optimizeAnimations() {
        // Detectar preferência por animações reduzidas
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
            
            // Adicionar CSS para animações reduzidas
            const style = document.createElement('style');
            style.textContent = `
                .reduced-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// ===== INICIALIZAÇÃO =====
class App {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        try {
            // Inicializar componentes
            this.components.animationManager = new AnimationManager();
            this.components.countdownTimer = new CountdownTimer();
            this.components.interactiveEffects = new InteractiveEffects();
            this.components.performanceOptimizer = new PerformanceOptimizer();

            // Log de inicialização
            console.log('🌱 Plantando Verdades - Landing Page carregada com sucesso!');
            
            // Adicionar classe de carregamento completo
            document.body.classList.add('loaded');
            
        } catch (error) {
            console.error('Erro ao inicializar a aplicação:', error);
        }
    }

    // Método para cleanup (se necessário)
    destroy() {
        Object.values(this.components).forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
    }
}

// ===== INICIALIZAR APLICAÇÃO =====
const app = new App();

// ===== EXPORTAR PARA DEBUG (opcional) =====
if (typeof window !== 'undefined') {
    window.PlantandoVerdadesApp = app;
}

