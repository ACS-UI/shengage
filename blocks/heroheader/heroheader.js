export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row, id) => {
    row.classList.add(`row-${id}`);
  });
}
