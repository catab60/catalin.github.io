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

    function handleClickOrTouch(e) {
      if (clicked) return;
      if (!maskCtx) return;
      if (!videoReady) return;
      e.preventDefault();

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

      const playingText = container.querySelector('.playing-text');
      if (playingText) playingText.remove();

      const video = document.createElement('video');
      video.src = videoSrc;
      video.className = 'absolute inset-0 w-full h-full object-cover rounded-lg z-10 pointer-events-none';
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;

      video.onended = () => {
        video.pause();
        video.currentTime = video.duration;
      };

      container.appendChild(video);
    }

    container.addEventListener('click', handleClickOrTouch);
    container.addEventListener('touchstart', handleClickOrTouch, { passive: false });
  });
});
