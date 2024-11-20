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

  const arrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 45 45">\r\n  <g id="Group_5" data-name="Group 5" transform="translate(-532 -1886)">\r\n    <g id="Ellipse_3" data-name="Ellipse 3" transform="translate(532 1886)" fill="none" stroke="#000000" stroke-width="3">\r\n      <circle cx="22.5" cy="22.5" r="22.5" stroke="none"/>\r\n      <circle cx="22.5" cy="22.5" r="21" fill="none"/>\r\n    </g>\r\n    <line id="Line_4" data-name="Line 4" x2="16" transform="translate(546.196 1908.008)" fill="none" stroke="#000000" stroke-linecap="round" stroke-width="3"/>\r\n    <line id="Line_5" data-name="Line 5" x2="8" y2="7" transform="translate(556.196 1901.008)" fill="none" stroke="#000000" stroke-linecap="round" stroke-width="3"/>\r\n    <line id="Line_6" data-name="Line 6" y1="8" x2="8" transform="translate(556.196 1908.008)" fill="none" stroke="#000000" stroke-linecap="round" stroke-width="3"/>\r\n  </g>\r\n</svg>\r\n'
	  // Create the arrow container and append the SVG content to it
	  const arrowContainer = document.createElement('div');
	  arrowContainer.classList.add('arrow');
	  arrowContainer.innerHTML = arrowSvg;
	  
	  // Append the arrow container to the dot container
	  dotContainer.append(arrowContainer);
	  
	  // Add an event listener to the arrow container
	  arrowContainer.addEventListener('click', (event) => {
	    // Get the index based on the arrow's position in the dot container
	    const dots = dotContainer.querySelectorAll('.dot');
	    const index = Array.from(dots).indexOf(arrowContainer);
	  
	    // Calculate the offset for the carousel translation
	    const offset = (index * 101);
	  
	    // Find the carousel and apply the translateX transform
	    const carousel = document.querySelector('.story-container');
	    if (carousel) {
	      carousel.style.transform = `translateX(${offset}%)`;
	    }
	  
	    // Optionally, you can also update the active class for the dots
	    dots.forEach((dot) => dot.classList.remove('active'));
	    if (dots[index]) {
	      dots[index].classList.add('active');
	    }
	  
	    console.log('Arrow clicked!', event);
	  });
	  const leftArrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 45 45"><g id="Group_5" data-name="Group 5" transform="translate(-532 -1886) rotate(180 532 1886)"><g id="Ellipse_3" data-name="Ellipse 3" transform="translate(532 1886)" fill="none" stroke="#000000" stroke-width="3"><circle cx="22.5" cy="22.5" r="22.5" stroke="none"/><circle cx="22.5" cy="22.5" r="21" fill="none"/></g><line id="Line_4" data-name="Line 4" x2="16" transform="translate(546.196 1908.008)" fill="none" stroke="#000000" stroke-linecap="round" stroke-width="3"/><line id="Line_5" data-name="Line 5" x2="8" y2="7" transform="translate(556.196 1901.008)" fill="none" stroke="#000000" stroke-linecap="round" stroke-width="3"/><line id="Line_6" data-name="Line 6" y1="8" x2="8" transform="translate(556.196 1908.008)" fill="none" stroke="#000000" stroke-linecap="round" stroke-width="3"/></g></svg>'
	  const leftArrowContainer = document.createElement('div');
	  leftArrowContainer.classList.add('arrow');
	  leftArrowContainer.innerHTML = arrowSvg;
	  dotContainer.prepend(leftArrowContainer);

}
