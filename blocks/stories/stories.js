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
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'stories-story-image';
      else div.className = 'stories-story-body';
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
  const listOfstoryElements = document.querySelectorAll('.story-slide');
  const storyContainer = document.querySelector('.story-container');
  let currentstory = 0;

  function setScrollTo() {
    const scrollLeft = currentstory * listOfstoryElements[0].offsetWidth;
    storyContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }

  buttonBack.addEventListener('click', () => {
    if (currentstory > 0) {
      currentstory -= 1;
    }
    setScrollTo();
  });

  buttonNext.addEventListener('click', () => {
    if (currentstory < listOfstoryElements.length - 1) {
      currentstory += 1;
    }
    setScrollTo();
  });

  listOfstoryElements.forEach((storyElement, index) => {
    storyElement.addEventListener('click', () => {
      currentstory = index;
      const scrollLeft = currentstory * listOfstoryElements[0].offsetWidth;
      storyContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    });
  });
  // carousal code end
}
