import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Build card list
  const ul = document.createElement('ul');
  ul.classList.add('card-container');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('card-slide');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
        const href = div.querySelector('a')?.getAttribute('href') || '/program';
        div.setAttribute('data-href', href);
        // Use event listener instead of inline onclick
        div.addEventListener('click', () => {
          window.location.href = div.getAttribute('data-href');
        });

        // Fetch the SVG content
        fetch('../../assets/whitecircleArrow.svg')
          .then((response) => response.text())
          .then((svgContent) => {
            // Create a container div to hold the SVG content
            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = svgContent;
            // Append the SVG content to the div
            div.appendChild(svgContainer);
          })
          .catch((error) => console.error('Error fetching SVG:', error));
      }
    });
    ul.append(li);
  });

  ul.querySelectorAll('img').forEach((img) => {
    const pic = img.closest('picture');
    if (pic) pic.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.textContent = '';
  block.append(ul);

  // Determine if carousel should be activated (more than 4 cards)
  const cardSlides = ul.querySelectorAll('.card-slide');
  if (cardSlides.length > 4) {
    block.classList.add('with-carousel');
    // Carousel UI elements
    const dotContainer = document.createElement('div');
    dotContainer.classList.add('dot-container');

    // Add one dot for each card, first dot is active by default
    for (let i = 0; i < cardSlides.length; i++) {
      const dot = document.createElement('div');
      dot.classList.add('carousel-dot', 'dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('data-index', i);
      dotContainer.append(dot);
    }

    // Next/Prev Arrow controls (optional, but if required)
    const arrow = document.createElement('div');
    arrow.classList.add('arrow');
    dotContainer.append(arrow);

    block.append(dotContainer);

    const dots = dotContainer.querySelectorAll('.carousel-dot');
    const buttonArrow = dotContainer.querySelector('.arrow');
    let currentCard = 0;

    function setScrollTo() {
      const card = cardSlides[0];
      const scrollLeft = currentCard * (card ? card.offsetWidth : 0);
      ul.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }

    function updateActiveDots() {
      dots.forEach((dot, idx) => {
        if (idx === currentCard) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    function goToCard(idx) {
      if (idx >= 0 && idx < cardSlides.length) {
        currentCard = idx;
        setScrollTo();
        updateActiveDots();
      }
    }

    function forward() {
      if (currentCard < cardSlides.length - 1) {
        goToCard(currentCard + 1);
      } else {
        goToCard(0); // Optionally loop back to start
      }
    }

    // Dot click event: Go to card on dot click
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => goToCard(idx));
    });

    // Arrow click event
    if (buttonArrow) {
      buttonArrow.addEventListener('click', forward);
    }
  } else {
    // Remove any carousel classes/elements if under 5 cards (simple cards layout)
    block.classList.remove('with-carousel');
  }
}
