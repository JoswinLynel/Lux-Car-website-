/**
 * GS Executive Transfers - Executive Car Service
 * Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollEffects();
    initBookingForm();
    initAnimations();
    initWaves();
});

/**
 * Navigation - Sticky header and mobile menu
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    // Sticky navigation on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/**
 * Scroll-based effects
 */
function initScrollEffects() {
    // Parallax effect for hero background
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const heroBg = hero.querySelector('.hero-bg');
            if (heroBg && scrolled < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Booking form handling
 */
function initBookingForm() {
    const bookingForm = document.getElementById('quickBooking');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const pickup = document.getElementById('pickup').value;
            const dropoff = document.getElementById('dropoff').value;
            const date = document.getElementById('date').value;
            const vehicle = document.getElementById('vehicle').value;
            
            // Build URL with query params
            const params = new URLSearchParams({
                pickup: pickup,
                dropoff: dropoff,
                date: date,
                vehicle: vehicle
            });
            
            // Redirect to contact page with pre-filled data
            window.location.href = `contact.html?${params.toString()}`;
        });
    }
    
    // Set minimum date to current datetime
    const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
    dateInputs.forEach(input => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        input.min = now.toISOString().slice(0, 16);
    });
    
    // Contact page booking form
    const contactForm = document.getElementById('bookingForm');
    if (contactForm) {
        // Pre-fill from URL params
        const params = new URLSearchParams(window.location.search);
        
        if (params.get('pickup')) {
            document.getElementById('pickupLocation').value = params.get('pickup');
        }
        if (params.get('dropoff')) {
            document.getElementById('dropoffLocation').value = params.get('dropoff');
        }
        if (params.get('date')) {
            document.getElementById('bookingDate').value = params.get('date');
        }
        if (params.get('vehicle')) {
            document.getElementById('vehicleType').value = params.get('vehicle');
        }
        
        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success message (in production, this would send to server)
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                submitBtn.textContent = '✓ Request Sent!';
                submitBtn.style.background = '#10B981';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    contactForm.reset();
                }, 3000);
            }, 1500);
        });
    }
}

/**
 * Intersection Observer for scroll animations
 */
function initAnimations() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.classList.add('animated');
        });
        return;
    }
    
    // Create observer — bidirectional (animate on scroll up and down)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, delay);
            } else {
                entry.target.classList.remove('animated');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });
    
    // Observe all elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Fleet page filtering
 */
function initFleetFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const fleetCards = document.querySelectorAll('.fleet-card-item');
    
    if (filterBtns.length > 0 && fleetCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                
                // Filter cards
                fleetCards.forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.style.display = '';
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, 10);
                    } else {
                        card.classList.remove('visible');
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
}

/**
 * Initialize fleet filter if on fleet page
 */
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.fleet-page')) {
        initFleetFilter();
    }
});

/**
 * Smooth reveal for page elements
 */
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
}

/**
 * Mobile menu swipe support
 */
function initMobileGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    const navLinks = document.getElementById('navLinks');
    
    if (!navLinks) return;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        // Swipe left to close menu
        if (diff > swipeThreshold && navLinks.classList.contains('active')) {
            document.getElementById('mobileToggle').classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

// Initialize mobile gestures
initMobileGestures();

/**
 * CTA Wave Background Animation
 */
function initWaves() {
    const container = document.getElementById('waves-container');
    const svg = document.getElementById('waves-svg');
    if (!container || !svg || typeof window.simplexNoise === 'undefined' && typeof window.SimplexNoise === 'undefined') {
        console.warn('Waves animation skipped: missing elements or simplex-noise');
        return;
    }

    // Try to get constructor based on how it was loaded
    let noiseGen;
    try {
        if (typeof window.simplexNoise === 'function') {
            noiseGen = window.simplexNoise();
        } else if (typeof window.SimplexNoise === 'function') {
            const simplex = new window.SimplexNoise();
            noiseGen = simplex.noise2D.bind(simplex);
        } else {
            console.warn('Could not initialize simplex noise generator');
            return;
        }
    } catch(e) {
        console.warn('Error initializing noise generator:', e);
        return;
    }

    const mouse = {
        x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0,
        v: 0, vs: 0, a: 0, set: false
    };

    let paths = [];
    let lines = [];
    let rafId = null;
    let bounding = null;

    const strokeColor = 'rgba(255, 255, 255, 0.2)'; // Faint white lines
    
    function setSize() {
        bounding = container.getBoundingClientRect();
        svg.style.width = `${bounding.width}px`;
        svg.style.height = `${bounding.height}px`;
    }

    function setLines() {
        if (!bounding) return;
        
        lines = [];
        paths.forEach(path => path.remove());
        paths = [];
        
        const xGap = 15; // Point spacing
        const yGap = 15;
        
        const oWidth = bounding.width + 200;
        const oHeight = bounding.height + 30;
        
        const totalLines = Math.ceil(oWidth / xGap);
        const totalPoints = Math.ceil(oHeight / yGap);
        
        const xStart = (bounding.width - xGap * totalLines) / 2;
        const yStart = (bounding.height - yGap * totalPoints) / 2;
        
        for (let i = 0; i < totalLines; i++) {
            const points = [];
            
            for (let j = 0; j < totalPoints; j++) {
                points.push({
                    x: xStart + xGap * i,
                    y: yStart + yGap * j,
                    wave: { x: 0, y: 0 },
                    cursor: { x: 0, y: 0, vx: 0, vy: 0 }
                });
            }
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', strokeColor);
            path.setAttribute('stroke-width', '1');
            
            svg.appendChild(path);
            paths.push(path);
            lines.push(points);
        }
    }

    function updateMousePosition(x, y) {
        if (!bounding) return;
        
        mouse.x = x - bounding.left;
        mouse.y = y - bounding.top + window.scrollY;
        
        if (!mouse.set) {
            mouse.sx = mouse.x;
            mouse.sy = mouse.y;
            mouse.lx = mouse.x;
            mouse.ly = mouse.y;
            mouse.set = true;
        }
        
        container.style.setProperty('--x', `${mouse.sx}px`);
        container.style.setProperty('--y', `${mouse.sy}px`);
    }

    function movePoints(time) {
        lines.forEach(points => {
            points.forEach(p => {
                const move = noiseGen(
                    (p.x + time * 0.008) * 0.003,
                    (p.y + time * 0.003) * 0.002
                ) * 8;
                
                p.wave.x = Math.cos(move) * 12;
                p.wave.y = Math.sin(move) * 6;
                
                const dx = p.x - mouse.sx;
                const dy = p.y - mouse.sy;
                const d = Math.hypot(dx, dy);
                const l = Math.max(175, mouse.vs);
                
                if (d < l) {
                    const s = 1 - d / l;
                    const f = Math.cos(d * 0.001) * s;
                    p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00035;
                    p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00035;
                }
                
                p.cursor.vx += (0 - p.cursor.x) * 0.01;
                p.cursor.vy += (0 - p.cursor.y) * 0.01;
                p.cursor.vx *= 0.95;
                p.cursor.vy *= 0.95;
                p.cursor.x += p.cursor.vx;
                p.cursor.y += p.cursor.vy;
                p.cursor.x = Math.min(50, Math.max(-50, p.cursor.x));
                p.cursor.y = Math.min(50, Math.max(-50, p.cursor.y));
            });
        });
    }

    function getMoved(p, withCursor = true) {
        return {
            x: p.x + p.wave.x + (withCursor ? p.cursor.x : 0),
            y: p.y + p.wave.y + (withCursor ? p.cursor.y : 0)
        };
    }

    function drawLines() {
        lines.forEach((points, i) => {
            if (points.length < 2 || !paths[i]) return;
            
            const first = getMoved(points[0], false);
            let d = `M ${first.x} ${first.y}`;
            
            for (let j = 1; j < points.length; j++) {
                const cur = getMoved(points[j]);
                d += `L ${cur.x} ${cur.y}`;
            }
            
            paths[i].setAttribute('d', d);
        });
    }

    function tick(time) {
        mouse.sx += (mouse.x - mouse.sx) * 0.1;
        mouse.sy += (mouse.y - mouse.sy) * 0.1;
        
        const dx = mouse.x - mouse.lx;
        const dy = mouse.y - mouse.ly;
        const d = Math.hypot(dx, dy);
        
        mouse.v = d;
        mouse.vs += (d - mouse.vs) * 0.1;
        mouse.vs = Math.min(100, mouse.vs);
        mouse.lx = mouse.x;
        mouse.ly = mouse.y;
        mouse.a = Math.atan2(dy, dx);
        
        container.style.setProperty('--x', `${mouse.sx}px`);
        container.style.setProperty('--y', `${mouse.sy}px`);
        
        movePoints(time);
        drawLines();
        
        rafId = requestAnimationFrame(tick);
    }

    // Initialize
    setSize();
    setLines();
    
    // Listeners
    window.addEventListener('resize', () => {
        setSize();
        setLines();
    });
    
    window.addEventListener('mousemove', e => updateMousePosition(e.pageX, e.pageY));
    container.addEventListener('touchmove', e => {
        // e.preventDefault(); // Optional, prevents scrolling while touching waves
        if (e.touches[0]) updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    
    rafId = requestAnimationFrame(tick);
}
