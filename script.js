gsap.registerPlugin(ScrollTrigger);

function initAnimations() {
    gsap.from("header", {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    gsap.from("#hero", {
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power2.out"
    });

    gsap.utils.toArray('.section-padding').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "top 20%",
                toggleActions: "play none none reverse"
            }
        });
    });

    gsap.utils.toArray('.category-card').forEach((card, i) => {
        gsap.from(card, {
            opacity: 0,
            y: 50,
            duration: 0.5,
            delay: i * 0.1,
            scrollTrigger: {
                trigger: card,
                start: "top 90%"
            }
        });
    });
}

const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('nav ul');

menuToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded',
        menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
    );
});

const books = [
    {
        id: 1,
        title: "The Digital Mind",
        author: "Sarah Johnson",
        cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000",
        description: "Explore the intersection of technology and human consciousness in this groundbreaking work."
    },
    {
        id: 2,
        title: "Nature's Symphony",
        author: "Michael Chen",
        cover: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000",
        description: "A beautiful journey through the natural world and its hidden musical patterns."
    },
    {
        id: 3,
        title: "Urban Future",
        author: "Elena Rodriguez",
        cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1000",
        description: "Discover how cities will evolve in the next decade and beyond."
    }
];

class VoiceSearch {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.setupRecognition();
    }

    setupRecognition() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.setupEventListeners();
        } else {
            console.error('Speech recognition not supported');
            this.showFeedback('Speech recognition is not supported in your browser.', 'error');
            if (voiceButton) {
                voiceButton.style.display = 'none';
            }
        }
    }

    setupEventListeners() {
        if (!this.recognition) return;

        this.recognition.onstart = () => {
            this.isListening = true;
            if (voiceButton) {
                voiceButton.classList.add('listening');
                voiceButton.setAttribute('aria-pressed', 'true');
            }
            if (searchStatus) {
                searchStatus.textContent = 'Listening...';
            }
            if (searchInput) {
                searchInput.placeholder = 'Listening...';
            }
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (searchInput) {
                searchInput.value = transcript;
            }
            searchBooks(transcript);
            this.showFeedback('Voice input received!', 'success');
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showFeedback(`Error: ${event.error}. Please try again.`, 'error');
            this.reset();
        };

        this.recognition.onend = () => {
            this.reset();
        };
    }

    reset() {
        this.isListening = false;
        if (voiceButton) {
            voiceButton.classList.remove('listening');
            voiceButton.setAttribute('aria-pressed', 'false');
        }
        if (searchStatus) {
            searchStatus.textContent = '';
        }
        if (searchInput) {
            searchInput.placeholder = 'Search books...';
        }
    }

    toggle() {
        if (!this.recognition) {
            this.showFeedback('Speech recognition is not supported in your browser.', 'error');
            return;
        }

        try {
            if (this.isListening) {
                this.recognition.stop();
            } else {
                this.recognition.start();
            }
        } catch (error) {
            console.error('Speech recognition error:', error);
            this.showFeedback('Error starting voice recognition. Please try again.', 'error');
            this.reset();
        }
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        if (feedback) {
            feedback.textContent = message;
            feedback.className = `feedback ${type}`;
            feedback.style.display = 'block';

            setTimeout(() => {
                feedback.style.display = 'none';
            }, 3000);
        }
    }
}

const voiceSearch = new VoiceSearch();

const voiceButton = document.getElementById('voiceSearch');
const searchInput = document.getElementById('searchInput');
const searchStatus = document.getElementById('searchStatus');
const booksContainer = document.querySelector('.books-container');
const audioPlayer = document.getElementById('audioPlayer');

voiceButton?.addEventListener('click', () => voiceSearch.toggle());

function searchBooks(query) {
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase())
    );
    renderBooks(filteredBooks);
}

class AudioController {
    constructor() {
        this.utterance = null;
        this.audioPlayer = document.getElementById('audioPlayer');
        this.pauseResumeBtn = this.audioPlayer.querySelector('.pause-resume');
        this.stopBtn = this.audioPlayer.querySelector('.stop');
        this.closeBtn = this.audioPlayer.querySelector('.close-player');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.pauseResumeBtn.addEventListener('click', () => this.togglePlayback());
        this.stopBtn.addEventListener('click', () => this.stopPlayback());
        this.closeBtn.addEventListener('click', () => this.closePlayer());
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            this.stopPlayback();

            this.utterance = new SpeechSynthesisUtterance(text);
            this.utterance.rate = 0.9;
            this.utterance.pitch = 1;

            speechSynthesis.speak(this.utterance);
            this.audioPlayer.style.display = 'block';
        }
    }

    togglePlayback() {
        if (speechSynthesis.speaking) {
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
                this.pauseResumeBtn.textContent = '⏸️';
            } else {
                speechSynthesis.pause();
                this.pauseResumeBtn.textContent = '▶️';
            }
        }
    }

    stopPlayback() {
        speechSynthesis.cancel();
        this.audioPlayer.style.display = 'none';
    }

    closePlayer() {
        this.stopPlayback();
    }
}

const audioController = new AudioController();

function renderBooks(booksToRender = books) {
    if (!booksContainer) return;

    booksContainer.innerHTML = '';

    booksToRender.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="book-image">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">By ${book.author}</p>
                <button class="listen-button" aria-label="Listen to description of ${book.title}">
                    Listen to Description
                </button>
            </div>
        `;

        const listenButton = bookCard.querySelector('.listen-button');
        listenButton?.addEventListener('click', () => {
            audioController.speak(book.description);
        });

        booksContainer.appendChild(bookCard);
    });
}

const contactForm = document.querySelector('.contact-form');
contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    voiceSearch.showFeedback('Message sent successfully!', 'success');
});

document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    renderBooks();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (voiceSearch.isListening) {
            voiceSearch.toggle();
        }
        if (speechSynthesis.speaking) {
            audioController.stopPlayback();
        }
    }
});