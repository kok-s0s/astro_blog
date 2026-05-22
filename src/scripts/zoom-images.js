import mediumZoom from 'medium-zoom';

document.addEventListener('DOMContentLoaded', () => {
  mediumZoom('img:not([data-no-zoom])', {
    margin: 24,
    background: '#000',
  });
});
