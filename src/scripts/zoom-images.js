import mediumZoom from 'medium-zoom';

function setupZoom() {
  mediumZoom('img:not([data-no-zoom])', {
    margin: 24,
    background: '#000',
  });
}

document.addEventListener('DOMContentLoaded', setupZoom);
document.addEventListener('astro:page-load', setupZoom);
