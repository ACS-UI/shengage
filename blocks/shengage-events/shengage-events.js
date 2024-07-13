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
}
