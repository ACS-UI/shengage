/* eslint-disable no-use-before-define */
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  let currentPage = 0;
  const ul = document.createElement('ul');
  ul.classList.add('story-container');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('story-slide');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'stories-story-image';
      } else {
        div.className = 'stories-story-body';

        fetch('../../assets/cricleArrow.svg')
          .then((response) => response.text())
          .then((svgContent) => {
            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = svgContent;
            div.appendChild(svgContainer);
          })
          .catch((error) => console.error('Error fetching SVG:', error));
      }
    });
    ul.prepend(li);
  });

  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  block.textContent = '';
  block.appendChild(ul);

  const controlsContainer = document.createElement('div');
  controlsContainer.classList.add('controls-container');
  block.appendChild(controlsContainer);
  const createArrow = (direction) => {
    const arrow = document.createElement('div');
    arrow.classList.add('arrow', direction);
    const svgPath = '../../assets/carousel-arrow.svg';
    fetch(svgPath)
      .then((response) => response.text())
      .then((svgContent) => {
        arrow.innerHTML = svgContent;
      })
      .catch((error) => console.error('Error fetching SVG:', error));
    arrow.addEventListener('click', () => {
      if (direction === 'left' && currentPage > 0) {
        currentPage -= 1;
      } else if (direction === 'right' && currentPage < totalPages - 1) {
        currentPage += 1;
      }
      updateCarousel();
    });
    return arrow;
  };
  const leftArrow = createArrow('left');
  controlsContainer.appendChild(leftArrow);
  const slides = ul.children;
  const totalSlides = slides.length;
  const slidesPerPage = 3;
  const totalPages = Math.ceil(totalSlides / slidesPerPage);

  const dotContainer = document.createElement('div');
  dotContainer.classList.add('dot-container');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    // eslint-disable-next-line no-loop-func
    dot.addEventListener('click', () => {
      currentPage = i;
      updateCarousel();
    });
    dotContainer.appendChild(dot);
  }
  controlsContainer.appendChild(dotContainer);
  const dots = dotContainer.querySelectorAll('.dot');

  const rightArrow = createArrow('right');
  controlsContainer.appendChild(rightArrow);

  const updateCarousel = () => {
    const offset = -(currentPage * 100);
    ul.style.transform = `translateX(${offset}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentPage);
    });
  };

  updateCarousel();
}
