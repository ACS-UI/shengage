export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col, id) => {
      col.classList.add(`col-${id}`);
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
          /* to add cube video */
          picWrapper.innerHTML = '';
          picWrapper.innerHTML = `<video autoplay loop muted>
          <source src="assets/SHEngage-Cube-Video.mp4" type="video/mp4">
          </video>`;
        }
      }
    });
  });

  const sliderContainer = document.querySelector('.col-1');
  const slides = document.querySelectorAll('.col-1 img');

  if (slides.length > 1) {
    const dotContainer = document.createElement('div');
    dotContainer.classList.add('dot-container');
    const dots = ['dot active', 'dot'];
    dots.forEach((className) => {
      const div = document.createElement('div');
      className.split(' ').forEach((cls) => {
        div.classList.add(cls);
      });
      dotContainer.append(div);
    });
    sliderContainer.append(dotContainer);
    slides.forEach((image, id) => {
      if (id === 0) {
        image.classList.add('showslide');
      }
    });
    const allDots = document.querySelectorAll('.dot');

    let currentSlide = 0;
    // eslint-disable-next-line no-inner-declarations
    function next() {
      if (currentSlide === slides.length - 1) {
        currentSlide = 0;
      } else {
        currentSlide += 1;
      }

      document.querySelector('.col-1 img.showslide').classList.remove('showslide');
      slides[currentSlide].classList.add('showslide');

      document.querySelector('.dot.active').classList.remove('active');
      allDots[currentSlide].classList.add('active');
    }

    setInterval(() => {
      next();
    }, 3000);
  }
}
