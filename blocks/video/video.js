export default function decorate(block) {
  const [videourl, videoText] = block.querySelectorAll('p');
  block.innerHTML = '';
  block.innerHTML = `
    <div class="video-background">
        <video autoplay loop muted playsinline id="video" class="desktop">
            <source src="${videourl.innerText}" type="video/mp4">            
        </video>
    </div>
    <button id="unmute" class="unmute-button">Unmute</button>
    <div class="video-overlay">
        <div class="hero-text">
          ${videoText.innerText}
        </div>        
    </div>`;

  const video = block.querySelector('#video');
  const unmute = block.querySelector('#unmute');

  // Event listener to unmute the video
  unmute.addEventListener('click', () => {
    if (video.muted) {
      video.muted = false;
      video.play();
      unmute.style.display = 'none'; // Hide the unmute button after it's clicked
    }
  });
}
