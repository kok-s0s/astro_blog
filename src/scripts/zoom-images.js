import mediumZoom from 'medium-zoom';

function setupZoom() {
  const images = Array.from(document.querySelectorAll('img:not([data-no-zoom]):not([data-zoom-ready])'));
  images.forEach((img) => {
    img.dataset.zoomReady = 'true';
  });
  if (images.length === 0) return;

  mediumZoom(images, {
    margin: 24,
    background: '#000',
  });
}

document.addEventListener('DOMContentLoaded', setupZoom);
document.addEventListener('astro:page-load', setupZoom);
