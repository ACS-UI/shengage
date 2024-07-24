export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  const firstChild = block.firstElementChild;
  firstChild.classList.add('eventscontainer');
  block.classList.add(`columns-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col, id) => {
      col.classList.add(`col-${id}`);
    });
  });

  const textFields = block.querySelector('.col-0');
  let i = 1;

  if (textFields && textFields.children) {
    Array.from(textFields.children).forEach((child) => {
      if (child.tagName === 'TABLE') {
        child.classList.add('card');
        child.classList.add(`impactcard${i}`);
      } else {
        child.classList.add(`textfield${i}`);
      }
      i += 1;
    });
  } else {
    console.error('Unable to find textFields or its children.');
  }

  // Entire animation login below

  const animateValue = (el, start, end, duration, suffix) => {
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const current = Math.min(
        Math.floor((progress / duration) * (end - start) + start),
        end,
      );
      el.textContent = current + suffix;
      if (progress < duration) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  const callback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const h3 = entry.target;
        const text = h3.textContent;
        const numberMatch = text.match(/\d+/);
        if (numberMatch) {
          const endValue = parseInt(numberMatch[0], 10);
          const suffix = text.replace(numberMatch[0], '');
          animateValue(h3, 0, endValue, 2000, suffix); // Animate over 2 seconds
        }
        observer.unobserve(h3);
      }
    });
  };

  const observer = new IntersectionObserver(callback, { threshold: 0.1 });

  const allCards = document.querySelectorAll('.eventscontainer .card h3');
  allCards.forEach((h3) => {
    observer.observe(h3);
  });
}
