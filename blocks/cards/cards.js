import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  ul.classList.add('card-container');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('card-slide');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else {
        div.className = 'cards-card-body';

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
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);

  const dotContainer = document.createElement('div');
  dotContainer.classList.add('dot-container');
  const dots = ['dot1 active', 'dot2', 'arrow'];
  dots.forEach((className) => {
    const div = document.createElement('div');
    className.split(' ').forEach((cls) => {
      div.classList.add(cls);
    });
    dotContainer.append(div);
  });
  block.append(dotContainer);

  // start of carousal code
  const buttonBack = document.querySelector('.dot1');
  const buttonNext = document.querySelector('.dot2');
  const listOfCardElements = document.querySelectorAll('.card-slide');
  const cardContainer = document.querySelector('.card-container');
  let currentCard = 0;

  function setScrollTo() {
    const scrollLeft = currentCard * listOfCardElements[0].offsetWidth;
    cardContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }

  buttonBack.addEventListener('click', () => {
    if (currentCard > 0) {
      currentCard -= 1;
    }
    setScrollTo();
  });

  buttonNext.addEventListener('click', () => {
    if (currentCard < listOfCardElements.length - 1) {
      currentCard += 1;
    }
    setScrollTo();
  });

  listOfCardElements.forEach((cardElement, index) => {
    cardElement.addEventListener('click', () => {
      currentCard = index;
      const scrollLeft = currentCard * listOfCardElements[0].offsetWidth;
      cardContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    });
  });
  // carousal code end
}
