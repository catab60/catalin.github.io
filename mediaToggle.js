document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('media-container');
  const maskSrc   = './head/mask.png';
  const videoSrc  = './head/hit1.webm';
  const newImage  = './head/final.png';
  const duration  = 900;
  let clicked     = false;

  const maskImg = new Image();
  let maskCtx, maskW, maskH;
  maskImg.src = maskSrc;
  maskImg.onload = () => {
    maskW = maskImg.width;
    maskH = maskImg.height;
    const off = document.createElement('canvas');
    off.width  = maskW;
    off.height = maskH;
    maskCtx = off.getContext('2d');
    maskCtx.drawImage(maskImg, 0, 0);
  };

  // Wait for the full page (images, videos, etc.) to load
  window.addEventListener('load', () => {
    container.addEventListener('click', e => {
      if (clicked) return;
      if (!maskCtx) return;

      const rect = container.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left)  * (maskW  / rect.width));
      const y = Math.floor((e.clientY - rect.top)   * (maskH  / rect.height));

      const p = maskCtx.getImageData(x, y, 1, 1).data;
      const alpha = p[3];
      if (alpha < 10) return;

      clicked = true;
      container.style.backgroundImage = 'none';
      const overlay = container.querySelector('.bg-opacity-40');
      if (overlay) overlay.style.display = 'none';

      const video = document.createElement('video');
      video.src       = `${videoSrc}?t=${Date.now()}`;
      video.className = 'absolute inset-0 w-full h-full object-cover rounded-lg z-10 pointer-events-none';
      video.autoplay  = true;
      video.muted     = true;
      video.playsInline = true;

      video.onended = () => {
        video.remove();
        container.style.backgroundImage = `url('${newImage}')`;
        if (overlay) overlay.style.display = '';
      };

      container.appendChild(video);
    });
  });

  // Preload the video
  const preload = document.createElement('video');
  preload.src = videoSrc;
  preload.preload = 'auto';
  preload.style.display = 'none';
  document.body.appendChild(preload);
});
