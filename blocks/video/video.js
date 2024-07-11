export default function decorate(block) {
    const [videourl, videoText] = block.querySelectorAll('p');
    block.innerHTML = '';
    block.innerHTML = `
    <div class="video-background">
        <video autoplay loop muted playsinline class="desktop">
            <source src="${videourl.innerText}" type="video/mp4">            
        </video>
        </div>
        <div class="video-overlay">
        <div class="hero-text">
          ${videoText.innerText}
        </div>        
    </div>`;
}