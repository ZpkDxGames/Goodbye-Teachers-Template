/**
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Common Elements ---
    const vignette = document.getElementById('vignette-overlay');
    
    // --- Detect Current Page ---
    const isSplash = document.getElementById('splash-screen');
    const isHub = document.getElementById('hub-page');

    // --- Mobile Double Tap Logic ---
    function setupDoubleTap() {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouch) return;

        const interactiveElements = document.querySelectorAll('.hub-card, #start-btn');
        
        interactiveElements.forEach(el => {
            el.addEventListener('click', (e) => {
                // If not already active, prevent click and activate
                if (!el.classList.contains('hover-active')) {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent document click from clearing immediately
                    
                    // Clear other active elements
                    interactiveElements.forEach(other => {
                        if (other !== el) other.classList.remove('hover-active');
                    });
                    
                    el.classList.add('hover-active');
                }
                // If already active, let the click happen (navigate)
            });
        });

        // Clear on click outside
        document.addEventListener('click', (e) => {
            interactiveElements.forEach(el => {
                if (!el.contains(e.target)) {
                    el.classList.remove('hover-active');
                }
            });
        });
    }

    // ==========================================
    // HUB PAGE LOGIC
    // ==========================================
    if (isHub) {
        // 1. Fade In Effect (Vignette Out)
        setTimeout(() => {
            if (vignette) vignette.classList.remove('vignette-active');
        }, 100);

        // 2. Initialize Sidebar & Navigation
        initializeHubEvents();
        
        // 3. Setup Mobile Interactions
        setupDoubleTap();
    }

    function initializeHubEvents() {
        const menuBtn = document.getElementById('menu-btn');
        const backBtn = document.getElementById('back-btn');
        const closeBtn = document.getElementById('close-btn');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        const sidebar = document.getElementById('sidebar');
        const body = document.body;

        if (!menuBtn || !sidebar) return;

        function openSidebar() {
            body.classList.add('sidebar-open');
            animateStats();
        }

        function closeSidebar() {
            body.classList.remove('sidebar-open');
        }

        function animateStats() {
            const stats = document.querySelectorAll('.stat-value');
            stats.forEach((stat, index) => {
                // Store original value to prevent loss on re-animation
                if (!stat.dataset.target) {
                    stat.dataset.target = stat.textContent;
                }
                const originalText = stat.dataset.target;

                // Check if it's a number we can animate (remove dots, commas, symbols)
                // Handle Brazilian format (1.000) and US format (1,000) by removing both separators
                const numericValue = parseInt(originalText.replace(/\./g, '').replace(/,/g, '').replace(/%/g, ''));
                
                if (!isNaN(numericValue) && originalText !== '∞') {
                    // Reset to 0 immediately
                    stat.textContent = originalText.includes('%') ? '0%' : '0';

                    setTimeout(() => {
                        let start = 0;
                        const duration = 4000; // Increased to 4 seconds
                        const startTime = performance.now();
                        
                        function update(currentTime) {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            
                            // Ease out quart
                            const ease = 1 - Math.pow(1 - progress, 4);
                            
                            const currentVal = Math.floor(start + (numericValue - start) * ease);
                            
                            // Format back with commas/symbols
                            if (originalText.includes('%')) {
                                stat.textContent = currentVal + '%';
                            } else {
                                // Use Brazilian locale for dot separators (1.000)
                                stat.textContent = currentVal.toLocaleString('pt-BR');
                            }
                            
                            if (progress < 1) {
                                requestAnimationFrame(update);
                            } else {
                                stat.textContent = originalText; // Ensure exact final value
                                
                                // Pop Effect
                                stat.classList.add('stat-pop');
                                setTimeout(() => stat.classList.remove('stat-pop'), 500);
                                
                                // Shiny Particles (Confetti mini burst at stat location)
                                if (typeof confettiSystem !== 'undefined') {
                                    const rect = stat.getBoundingClientRect();
                                    // Small burst of 5-10 particles
                                    for(let i=0; i<8; i++) {
                                        confettiSystem.particles.push(confettiSystem.createParticle(
                                            rect.left + rect.width/2, 
                                            rect.top + rect.height/2,
                                            0.3 // Low force for stats
                                        ));
                                    }
                                    confettiSystem.animate();
                                }
                            }
                        }
                        
                        requestAnimationFrame(update);
                    }, index * 100); // 0.1s gap between starts
                }
            });
        }

        menuBtn.addEventListener('click', openSidebar);
        closeBtn.addEventListener('click', closeSidebar);
        
        // Reason Modal Logic
        const reasonBtn = document.getElementById('reason-btn');
        const reasonOverlay = document.getElementById('reason-overlay');
        const reasonBackBtn = document.getElementById('back-btn-reason');
        
        if (reasonBtn && reasonOverlay) {
            reasonBtn.addEventListener('click', () => {
                // Close sidebar first
                closeSidebar();
                
                // Activate Overlay
                reasonOverlay.classList.add('active');
                
                // Start Fireworks (if class exists)
                if (typeof Fireworks !== 'undefined') {
                    // Assuming Fireworks is a class or global object we can init/start
                    // Based on typical implementation, it might auto-start or need a trigger
                    // If it's the canvas animation loop, it might be running but hidden
                    // Let's ensure it's active if there's a start method
                    if (window.fireworksInstance && window.fireworksInstance.start) {
                        window.fireworksInstance.start();
                    }
                }
            });
            
            if (reasonBackBtn) {
                reasonBackBtn.addEventListener('click', () => {
                    reasonOverlay.classList.remove('active');
                });
            }
        }
        sidebarOverlay.addEventListener('click', closeSidebar);

        // Back Button Logic -> Go to Index
        backBtn.addEventListener('click', () => {
            // Trigger Vignette
            vignette.classList.add('vignette-active');
            
            // Navigate after animation
            setTimeout(() => {
                // Go up two levels from assets/html/ to root
                window.location.href = '../../index.html';
            }, 1000);
        });
    }

    // ==========================================
    // SPLASH SCREEN LOGIC (REBUILT)
    // ==========================================
    if (isSplash) {
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.splash-footer');
        const startBtn = document.getElementById('start-btn');
        const progressContainer = document.querySelector('.progress-container');
        const splashText = document.querySelector('.splash-text');

        // Simple, robust loading animation
        let progress = 0;
        const totalDuration = 2500; // 2.5 seconds
        const intervalTime = 50;
        const increment = 100 / (totalDuration / intervalTime);

        const loadingInterval = setInterval(() => {
            progress += increment;
            
            // Add some randomness to make it look "real"
            if (Math.random() > 0.5) progress += Math.random() * 2;

            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                finishLoading();
            }

            updateUI(progress);
        }, intervalTime);

        function updateUI(percent) {
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (progressText) progressText.textContent = `${Math.floor(percent)}%`;
        }

        function finishLoading() {
            setTimeout(() => {
                if (progressContainer) progressContainer.style.display = 'none';
                if (progressText) progressText.style.display = 'none';
                
                if (splashText) splashText.textContent = "Tudo pronto!";
                
                if (startBtn) {
                    startBtn.classList.remove('hidden');
                    // Add a small pop animation class if you have one, or just rely on CSS transition
                    startBtn.style.animation = "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                }
            }, 500);
        }

        // Start Button Interaction
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent double firing on some touch devices
                
                // 1. Visual Feedback
                startBtn.textContent = "Entrando...";
                startBtn.style.transform = "scale(0.95)";
                
                // 2. Confetti Burst (Safe check)
                if (typeof confettiSystem !== 'undefined' && confettiSystem.burst) {
                    const rect = startBtn.getBoundingClientRect();
                    confettiSystem.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
                }

                // 3. Transition
                if (vignette) vignette.classList.add('vignette-active');

                // 4. Navigate (Delay for effect)
                setTimeout(() => {
                    // Try to save state, but don't block navigation if it fails
                    try {
                        if (typeof AppStorage !== 'undefined') {
                            AppStorage.session.set('session_started', true);
                        }
                    } catch (e) { console.warn('Storage warning:', e); }

                    window.location.href = 'assets/html/hub.html';
                }, 800);
            });
        }
    }
});
