export default function decorate(block) {
  const photoList = block.querySelectorAll('ul li');

  photoList.forEach((photoEl) => {
    const imagePath = photoEl.querySelector('img').src;
    const popUpBox = document.createElement('div');
    popUpBox.classList.add('popup-container');
    popUpBox.innerHTML = `<div class='button-container'>
        <button class='fullscreen-btn'>
         <img src='./assets/full-screen.svg'>
        </button>
        <button class='closefullscreen-btn'>
         <img src='./assets/exitfull-screen.svg'>
        </button>      
        <button class='close-btn'>
         <img src='./assets/close-circle.svg'>
        </button>
        </div>
        <div class='popup-image'>
        <button class='prev'>
        <img src='./assets/previous-circle.svg'>
        </button>
        <img src='' class='fullimage'>        
        <button class='next'>
        <img src='./assets/next-circle.svg'>
        </button>
        </div>`;
    block.append(popUpBox);
    function openModal() {
      document.querySelector('.popup-container').style.display = 'block';
    }

    function closeModal() {
      document.querySelector('.popup-container').style.display = 'none';
    }
    const elem = document.documentElement;
    function openFullscreen() {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }

    function closeFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    photoEl.addEventListener('click', () => {
      document.querySelector('.popup-image .fullimage').setAttribute('src', imagePath);
      openModal();
    });

    const closeBtn = popUpBox.querySelector('.close-btn');
    const fullScreen = popUpBox.querySelector('.fullscreen-btn');
    const closeFullScreen = popUpBox.querySelector('.closefullscreen-btn');
    closeBtn?.addEventListener('click', () => {
      closeModal();
    });

    fullScreen?.addEventListener('click', () => {
      openFullscreen();
      closeFullScreen.style.display = 'block';
      fullScreen.style.display = 'none';
    });

    closeFullScreen?.addEventListener('click', () => {
      closeFullscreen();
      closeFullScreen.style.display = 'none';
      fullScreen.style.display = 'block';
    });
  });

  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');
  function showSlides(n) {
    const nextImageSrc = photoList[n].querySelector('img').src;
    document.querySelector('.popup-image .fullimage').setAttribute('src', nextImageSrc);
  }
  let imgIndex = 0;
  prevBtn?.addEventListener('click', () => {
    imgIndex -= 1;
    if (imgIndex < 0) imgIndex = photoList.length - 1;
    showSlides(imgIndex);
  });

  nextBtn?.addEventListener('click', () => {
    imgIndex = (imgIndex += 1) % photoList.length;
    showSlides(imgIndex);
  });
}
