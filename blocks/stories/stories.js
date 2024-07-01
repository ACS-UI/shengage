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
          .then(response => response.text())
          .then(svgContent => {
            // Create a container div to hold the SVG content
            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = svgContent;

            // Append the SVG content to the div
            div.appendChild(svgContainer);
          })
          .catch(error => console.error('Error fetching SVG:', error));
      }
    });


    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);

  const dotContainer = document.createElement('div');
  dotContainer.classList.add('dot-container');
  const dots = ['dot dot1 active', 'dot dot2', 'dot dot3'];
  dots.forEach((className) => {
    const div = document.createElement('div');
    className.split(' ').forEach((cls) => {
      div.classList.add(cls);
    });
    dotContainer.append(div);
  });
  block.append(dotContainer);

  const dotts = document.querySelectorAll('.dot');
  const carousel = document.querySelector('.story-container');

  dotts.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      let offset = 0.5;
      dotts.forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
      if (index === 1) {
        offset = -67;
      } else if (index === 2) {
        offset = -101;
      }
      carousel.style.transform = `translateX(${offset}%)`;
    });
  });

  dotts[0].classList.add('active');
  carousel.style.transform = 'translateX(0.5%)';
  // carousal code end
}
