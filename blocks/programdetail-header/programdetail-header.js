export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    row.classList.add(`row-${i}`);
  });
}
