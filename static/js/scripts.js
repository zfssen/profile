
const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'projects', 'awards']

/* ============================================
   PARTICLE SYSTEM
   ============================================ */
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(Math.floor((this.canvas.width * this.canvas.height) / 12000), 120);
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                radius: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.2,
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Mouse repulsion
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.x += dx * force * 0.02;
                    p.y += dy * force * 0.02;
                }
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(147, 155, 255, ${p.opacity})`;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 140)})`;
                    this.ctx.lineWidth = 0.6;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        });
        requestAnimationFrame(() => this.animate());
    }
}

/* ============================================
   TYPEWRITER EFFECT
   ============================================ */
class Typewriter {
    constructor(element, texts, speed = 100, pause = 2000) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.pause = pause;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.type();
    }

    type() {
        const currentText = this.texts[this.textIndex];
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let delay = this.isDeleting ? this.speed / 2 : this.speed;

        if (!this.isDeleting && this.charIndex === currentText.length) {
            delay = this.pause;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            delay = 500;
        }

        setTimeout(() => this.type(), delay);
    }
}

/* ============================================
   SCROLL REVEAL
   ============================================ */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}

/* ============================================
   NAVIGATION STATE
   ============================================ */
function initNavScroll() {
    const nav = document.getElementById('mainNav');
    const landing = document.getElementById('landing');
    if (!nav || !landing) return;

    const check = () => {
        if (window.scrollY > landing.offsetHeight - 100) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
}

/* ============================================
   BACK TO TOP
   ============================================ */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });
}

/* ============================================
   CUSTOM CURSOR
   ============================================ */
function initCustomCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    // Only on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
        dot.style.display = 'none';
        ring.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    // Smooth ring follow
    function followRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(followRing);
    }
    followRing();

    // Hover state on interactive elements
    const hoverTargets = 'a, button, .tag, .project-card, .award-item, .explore-btn, .nav-link, .footer-links a, .back-to-top, input, textarea, [role="button"]';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
            dot.classList.add('cursor-hover');
            ring.classList.add('cursor-hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
            dot.classList.remove('cursor-hover');
            ring.classList.remove('cursor-hover');
        }
    });

    // Click shrink
    document.addEventListener('mousedown', () => {
        ring.classList.add('cursor-click');
    });
    document.addEventListener('mouseup', () => {
        ring.classList.remove('cursor-click');
    });
}

/* ============================================
   CLICK PARTICLE BURST
   ============================================ */
function initClickEffect() {
    const canvas = document.getElementById('click-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#6366f1', '#06b6d4', '#818cf8', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];

    document.addEventListener('click', (e) => {
        const count = 12 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
            const speed = 2 + Math.random() * 4;
            particles.push({
                x: e.clientX,
                y: e.clientY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 2 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                gravity: 0.08,
            });
        }
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98;
            p.life -= p.decay;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
        requestAnimationFrame(animate);
    }
    animate();
}

/* ============================================
   SMOOTH SCROLL FOR EXPLORE BUTTON
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ============================================
   HOME POST-PROCESSING
   ============================================ */
function processHome(container) {
    const children = Array.from(container.children);
    const wrapper = document.createElement('div');
    wrapper.className = 'home-wrapper';

    // Split content by <hr> into sections
    let currentBlock = document.createElement('div');
    const blocks = [];

    children.forEach(child => {
        if (child.tagName === 'HR') {
            if (currentBlock.children.length > 0) blocks.push(currentBlock);
            currentBlock = document.createElement('div');
        } else {
            currentBlock.appendChild(child);
        }
    });
    if (currentBlock.children.length > 0) blocks.push(currentBlock);

    // Block 0: Intro (badges + text)
    if (blocks[0]) {
        const introCard = document.createElement('div');
        introCard.className = 'home-intro-card';
        introCard.innerHTML = blocks[0].innerHTML;
        wrapper.appendChild(introCard);
    }

    // Block 1: Education -> Timeline
    if (blocks[1]) {
        const eduSection = document.createElement('div');
        eduSection.className = 'home-block';
        const h4 = blocks[1].querySelector('h4');
        if (h4) {
            eduSection.innerHTML = '<div class="home-block-title"><i class="bi bi-mortarboard-fill"></i>' + h4.innerHTML + '</div>';
        }
        const ul = blocks[1].querySelector('ul');
        if (ul) {
            const timeline = document.createElement('div');
            timeline.className = 'edu-timeline';
            const lis = ul.querySelectorAll('li');
            lis.forEach((li, i) => {
                const item = document.createElement('div');
                item.className = 'edu-timeline-item';
                item.style.animationDelay = (i * 0.15) + 's';
                item.innerHTML = '<div class="edu-dot"></div><div class="edu-content">' + li.innerHTML + '</div>';
                timeline.appendChild(item);
            });
            eduSection.appendChild(timeline);
        }
        wrapper.appendChild(eduSection);
    }

    // Block 2: Skills -> Tag grid
    if (blocks[2]) {
        const skillSection = document.createElement('div');
        skillSection.className = 'home-block';
        const h4 = blocks[2].querySelector('h4');
        if (h4) {
            skillSection.innerHTML = '<div class="home-block-title"><i class="bi bi-lightning-fill"></i>' + h4.innerHTML + '</div>';
        }
        const ul = blocks[2].querySelector('ul');
        if (ul) {
            const grid = document.createElement('div');
            grid.className = 'skill-grid';
            const lis = ul.querySelectorAll('li');
            lis.forEach(li => {
                const card = document.createElement('div');
                card.className = 'skill-card';
                // Parse "**Label**: values" pattern
                const html = li.innerHTML;
                const match = html.match(/<strong>(.+?)<\/strong>:\s*(.+)/);
                if (match) {
                    const label = match[1];
                    const values = match[2].split(',').map(v => v.trim());
                    card.innerHTML = '<div class="skill-label">' + label + '</div><div class="skill-tags">' +
                        values.map(v => '<span class="skill-tag">' + v + '</span>').join('') + '</div>';
                } else {
                    card.innerHTML = '<div class="skill-label">' + html + '</div>';
                }
                grid.appendChild(card);
            });
            skillSection.appendChild(grid);
        }
        wrapper.appendChild(skillSection);
    }

    // Block 3: Experience -> Icon cards
    if (blocks[3]) {
        const expSection = document.createElement('div');
        expSection.className = 'home-block';
        const h4 = blocks[3].querySelector('h4');
        if (h4) {
            expSection.innerHTML = '<div class="home-block-title"><i class="bi bi-briefcase-fill"></i>' + h4.innerHTML + '</div>';
        }
        const ul = blocks[3].querySelector('ul');
        if (ul) {
            const grid = document.createElement('div');
            grid.className = 'exp-grid';
            const icons = ['bi-book', 'bi-people-fill', 'bi-star-fill'];
            const lis = ul.querySelectorAll('li');
            lis.forEach((li, i) => {
                const card = document.createElement('div');
                card.className = 'exp-card';
                card.style.animationDelay = (i * 0.1) + 's';
                card.innerHTML = '<div class="exp-icon"><i class="bi ' + (icons[i] || 'bi-gem') + '"></i></div><div class="exp-text">' + li.innerHTML + '</div>';
                grid.appendChild(card);
            });
            expSection.appendChild(grid);
        }
        wrapper.appendChild(expSection);
    }

    container.innerHTML = '';
    container.appendChild(wrapper);
}

/* ============================================
   PROJECTS POST-PROCESSING
   ============================================ */
function processProjects(container) {
    const children = Array.from(container.children);
    const wrapper = document.createElement('div');
    wrapper.className = 'projects-wrapper';
    let currentCard = null;
    let projectIndex = 0;

    children.forEach(child => {
        if (child.tagName === 'H3') {
            projectIndex++;
            currentCard = document.createElement('div');
            currentCard.className = 'project-card';
            currentCard.style.animationDelay = (projectIndex * 0.15) + 's';
            // Add project number badge
            const badge = document.createElement('div');
            badge.className = 'project-number';
            badge.textContent = '0' + projectIndex;
            currentCard.appendChild(badge);
            wrapper.appendChild(currentCard);
        }
        if (currentCard) {
            // Convert bold paragraphs to feature items
            if (child.tagName === 'P' && child.querySelector('strong') && child.textContent.includes(':')) {
                const featureItem = document.createElement('div');
                featureItem.className = 'project-feature';
                featureItem.innerHTML = '<div class="feature-dot"></div><div class="feature-content">' + child.innerHTML + '</div>';
                currentCard.appendChild(featureItem);
            } else {
                currentCard.appendChild(child);
            }
        } else {
            wrapper.appendChild(child);
        }
    });

    if (wrapper.children.length > 0) {
        container.innerHTML = '';
        container.appendChild(wrapper);
    }
}

/* ============================================
   AWARDS POST-PROCESSING
   ============================================ */
function processAwards(container) {
    const uls = container.querySelectorAll('ul');
    uls.forEach(ul => {
        ul.className = 'award-list';
        const lis = ul.querySelectorAll('li');
        lis.forEach((li, i) => {
            const text = li.textContent;
            let levelClass = 'level-other';
            let levelText = '';
            let content = text;

            // Parse 【level】 prefix
            const levelMatch = text.match(/【(.+?)】/);
            if (levelMatch) {
                levelText = levelMatch[1];
                content = text.replace(/【.+?】/, '').trim();
                if (levelText.includes('世界')) levelClass = 'level-world';
                else if (levelText.includes('国家')) levelClass = 'level-national';
                else if (levelText.includes('省')) levelClass = 'level-province';
            }

            li.className = 'award-item-wrapper';
            li.style.animationDelay = (i * 0.08) + 's';
            li.innerHTML = '<div class="award-item">' +
                (levelText ? '<span class="award-level ' + levelClass + '">' + levelText + '</span>' : '') +
                '<span class="award-text">' + content + '</span>' +
                '</div>';
        });
    });
}

/* ============================================
   MAIN INIT
   ============================================ */
window.addEventListener('DOMContentLoaded', event => {

    // Particle System
    const canvas = document.getElementById('particle-canvas');
    if (canvas) new ParticleSystem(canvas);

    // Typewriter
    const typedName = document.getElementById('typed-name');
    if (typedName) {
        new Typewriter(typedName, ['张福森', 'Fusen Zhang', 'AI Researcher', 'LLM Enthusiast'], 120, 2500);
    }

    // Init modules
    initScrollReveal();
    initNavScroll();
    initBackToTop();
    initSmoothScroll();
    initCustomCursor();
    initClickEffect();

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    const timestamp = new Date().getTime();
    fetch(content_dir + config_file + '?t=' + timestamp)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md?t=' + timestamp)
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                const container = document.getElementById(name + '-md');
                container.innerHTML = html;
                
                // Post-processing for beautification
                if (name === 'home') {
                    processHome(container);
                } else if (name === 'projects') {
                    processProjects(container);
                } else if (name === 'awards') {
                    processAwards(container);
                }

            }).then(() => {
                // MathJax
                if (window.MathJax) MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

}); 
