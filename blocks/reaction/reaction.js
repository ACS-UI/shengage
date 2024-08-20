/*
 * Reaction Block
 * collect the user reaction
 */

async function submitReaction() {
  const payload = {
    articleId: 'SR1', likedUser: 'UR1', strongUser: 'UR5', bulpUser: 'UR7', timestamp: new Date().toJSON(),
  };
  const resp = await fetch('/stories/comment', {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const icons = block.querySelectorAll('.reaction-container div:nth-child(2) > div p');
  icons.forEach((icon) => {
    icon.addEventListener('click', () => {
      icons.forEach((i) => i.classList.remove('active'));
      icon.classList.add('active');
      submitReaction();
    });
  });
}
