export default function decorate(block) {
  const [iframeElement, videoTextElement] = block.querySelectorAll('p');
  block.innerHTML = '';

  // Extract the actual HTML content of the iframe
  const iframeHTML = iframeElement.textContent || iframeElement.innerText;

  // Create the iframe wrapper div
  const iframeWrapper = document.createElement('div');
  iframeWrapper.classList.add('iframe-video-background');
  iframeWrapper.innerHTML = iframeHTML; // Insert the iframe HTML directly

  // Create the text overlay div
  const overlay = document.createElement('div');
  overlay.classList.add('iframe-video-overlay');

  const textDiv = document.createElement('div');
  textDiv.classList.add('hero-text');
  textDiv.innerText = videoTextElement.innerText;

  // Append the elements to the block
  overlay.appendChild(textDiv);
  block.appendChild(iframeWrapper);
  block.appendChild(overlay);
}
