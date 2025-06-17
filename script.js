document.addEventListener('DOMContentLoaded', function() {
    // Form submission handler
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: this.querySelector('[name="name"]')?.value || '',
                email: this.querySelector('[name="email"]')?.value || '',
                phone: this.querySelector('[name="phone"]')?.value || '',
                message: this.querySelector('[name="message"]')?.value || ''
            };

            try {
                const response = await fetch('http://localhost:3000/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    // Show success message
                    alert('Thank you for your message! We will get back to you soon.');
                    this.reset();
                } else {
                    // Show error message
                    alert(data.error || 'Something went wrong. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to submit form. Please try again later.');
            }
        });
    }

    // Carousel functionality (existing code)
    const slide = document.querySelector('.carousel-slide');
    const items = document.querySelectorAll('.gallery-item');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    if (slide && items.length > 0) {
        let currentIndex = 0;
        const itemsPerView = 3;
        const totalItems = items.length;
        
        // Create dots
        items.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.dot');

        function updateDots() {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            const offset = -currentIndex * (100 / itemsPerView);
            slide.style.transform = `translateX(${offset}%)`;
            updateDots();
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentIndex === 0) {
                    currentIndex = totalItems - itemsPerView;
                } else {
                    currentIndex--;
                }
                goToSlide(currentIndex);
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentIndex >= totalItems - itemsPerView) {
                    currentIndex = 0;
                } else {
                    currentIndex++;
                }
                goToSlide(currentIndex);
            });
        }

        // Initialize carousel
        goToSlide(0);
    }
}); 