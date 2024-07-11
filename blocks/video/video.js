export default function decorate(block) {
    const [videourl, videoText] = block.querySelectorAll('p');
    block.innerHTML = '';
    block.innerHTML = `
    <div class="video-background">
        <video autoplay loop muted playsinline class="desktop">
            <source src="../../assets/ACS-GDC-shEngage.mp4" type="video/mp4">            
        </video>
        </div>
        <div class="video-overlay">
        <div class="hero-text">
          ${videoText.innerText}
        </div>        
    </div>`;
}
