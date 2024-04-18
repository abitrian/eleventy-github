const imagesHome = document.querySelectorAll('.img-cells');

document.querySelectorAll('.link').forEach( link => {
  link.addEventListener('mouseover', () => {
    const dataType = link.dataset.type;

    imagesHome.forEach(img => {
      img.classList.remove('show');

      if (img.dataset.type === dataType) {
        img.classList.add('show');
      }
    });
  });

  link.addEventListener('mouseout', () => {
    imagesHome.forEach((img, index) => {
      img.classList.remove('show');
      index === 0 && img.classList.add('show');
    });
  });
});

/* HEADER BOX-SHADOW */
const header = document.querySelector('.page-header');

document.addEventListener('scroll', (ev) => {
  const scrollPosition = window.scrollY;
  header?.classList.toggle('scroll', scrollPosition > 0);
});