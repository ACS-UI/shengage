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
        }
      }
    });
  });
  const homeBannerimgs = document.querySelectorAll('.col-1 img');
  let currentSlide = 0;

  function homeBannerSlider() {
    homeBannerimgs.forEach((image, id) => {
      currentSlide = id;
      if (id === 0) {
        image.classList.add('showslide');
      } else {
        image.classList.add('hideslide');
      }
    });
    homeBannerimgs.forEach((image, id) => {
      image.addEventListener('click', () => {
        homeBannerimgs[id].classList.remove('showslide');
        homeBannerimgs[id].classList.add('hideslide');
        homeBannerimgs[currentSlide].classList.add('showslide');
        homeBannerimgs[currentSlide].classList.remove('hideslide');
        if (currentSlide < homeBannerimgs.length - 1) {
          currentSlide += 1;
        } else {
          currentSlide -= 1;
        }
      });
    });
  }
  homeBannerSlider();
}
