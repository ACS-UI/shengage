export default function decorate(block) {
    const divs = [...block.children];
    divs.forEach((div, id) => {
      div.classList.add(`box-${id}`);
    });
}
