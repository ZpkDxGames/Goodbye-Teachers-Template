const messages = [
    "Olá! Esta é a primeira mensagem.",
    "Aqui está a segunda mensagem, aparecendo como um pop-up.",
    "Você pode personalizar estas mensagens no arquivo messages.js.",
    "Siga o fluxo e aproveite a experiência!",
    "Fim das mensagens por enquanto."
];

let currentMessageIndex = 0;
const messageCard = document.getElementById('message-card');
const messageText = document.getElementById('message-text');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dotsContainer = document.getElementById('dots-container');
const vignette = document.getElementById('vignette-overlay');

function initDots() {
    dotsContainer.innerHTML = '';
    messages.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === currentMessageIndex) dot.classList.add('active');
        dot.addEventListener('click', () => {
            showMessage(index);
        });
        dotsContainer.appendChild(dot);
    });
}

function updateDots(index) {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function updateButtons(index) {
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === messages.length - 1;
}

function showMessage(index) {
    if (index >= 0 && index < messages.length) {
        currentMessageIndex = index;
        
        // Animate out
        messageCard.style.opacity = '0';
        messageCard.style.transform = 'scale(0.9) translateY(20px)';
        
        setTimeout(() => {
            messageText.textContent = messages[index];
            
            // Animate in
            messageCard.style.opacity = '1';
            messageCard.style.transform = 'scale(1) translateY(0)';
            
            updateDots(index);
            updateButtons(index);
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Fade in vignette
    setTimeout(() => {
        vignette.classList.remove('vignette-active');
    }, 100);

    initDots();
    
    // Show first message
    setTimeout(() => {
        messageText.textContent = messages[0];
        messageCard.classList.add('active');
        updateButtons(0);
    }, 500);

    prevBtn.addEventListener('click', () => {
        if (currentMessageIndex > 0) {
            showMessage(currentMessageIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentMessageIndex < messages.length - 1) {
            showMessage(currentMessageIndex + 1);
        }
    });
});
