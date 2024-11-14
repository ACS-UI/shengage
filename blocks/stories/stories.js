import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
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

        // Fetch the SVG content
        fetch('../../assets/cricleArrow.svg')
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

    ul.prepend(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);

  const dotContainer = document.createElement('div');
  dotContainer.classList.add('dot-container');

  const liCount = ul.children.length;

  if (liCount > 3) {
    const dotCount = Math.ceil(liCount / 3);
    for (let i = 0; i < dotCount; i += 1) {
      const div = document.createElement('div');
      div.classList.add('dot');
      if (i === 0) {
        div.classList.add('active');
      }
      dotContainer.append(div);
    }

    block.append(dotContainer);

    const dots = dotContainer.querySelectorAll('.dot');
    const carousel = document.querySelector('.story-container');

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const offset = -(index * 101);
        dots.forEach((d) => d.classList.remove('active'));
        dot.classList.add('active');
        carousel.style.transform = `translateX(${offset}%)`;
      });
    });

    carousel.style.transform = 'translateX(0%)';
  } else {
    // Hide the dot container if less than 4 li elements
    dotContainer.classList.add('d-none');
  }
}
