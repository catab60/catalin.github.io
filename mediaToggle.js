document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('media-container');
  const maskSrc   = './head/mask.png';
  const videoSrc  = './head/hit1.webm';
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

  let preloadedVideo;
  let videoReady = false;

  window.addEventListener('load', () => {
    preloadedVideo = document.createElement('video');
    preloadedVideo.src = videoSrc;
    preloadedVideo.preload = 'auto';
    preloadedVideo.muted = true;
    preloadedVideo.playsInline = true;
    preloadedVideo.style.display = 'none';
    preloadedVideo.load();

    preloadedVideo.addEventListener('canplaythrough', () => {
      videoReady = true;
      console.log('Video preloaded and ready to play');
    });

    document.body.appendChild(preloadedVideo);
  });

  function getEventCoords(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function handleInteraction(e) {
    e.preventDefault();

    if (clicked) return;
    if (!maskCtx) return;
    if (!videoReady) {
      console.log('Video not ready yet');
      return;
    }

    const rect = container.getBoundingClientRect();
    const { x, y } = getEventCoords(e);

    const px = Math.floor((x - rect.left) * (maskW / rect.width));
    const py = Math.floor((y - rect.top) * (maskH / rect.height));

    if (px < 0 || py < 0 || px >= maskW || py >= maskH) return;

    const p = maskCtx.getImageData(px, py, 1, 1).data;
    const alpha = p[3];
    if (alpha < 10) return;

    clicked = true;
    container.style.backgroundImage = 'none';

    const overlay = container.querySelector('.bg-opacity-40');
    if (overlay) overlay.style.display = 'none';

    const playingText = container.querySelector('.playing-text');
    if (playingText) playingText.remove();

    const video = document.createElement('video');
    video.src = videoSrc;
    video.className = 'absolute inset-0 w-full h-full object-cover rounded-lg z-10 pointer-events-none';
    video.muted = true;
    video.playsInline = true;

    container.appendChild(video);

    video.play().catch(err => {
      console.log('Video playback failed:', err);
    });

    video.onended = () => {
      video.pause();
      video.currentTime = video.duration;
    };
  }

  container.addEventListener('click', handleInteraction);
  container.addEventListener('touchstart', handleInteraction, { passive: false });
});
