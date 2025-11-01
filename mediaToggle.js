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
    off.width = maskW;
    off.height = maskH;
    maskCtx = off.getContext('2d');
    maskCtx.drawImage(maskImg, 0, 0);
  };

  let preloadedVideo;
  let videoReady = false;

  // detect "mobile-like" input (touch-capable or coarse pointer)
  const isTouchDevice = (() => {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
           window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  })();

  window.addEventListener('load', () => {
    preloadedVideo = document.createElement('video');
    preloadedVideo.src = videoSrc;
    preloadedVideo.preload = 'auto';
    preloadedVideo.muted = true;
    preloadedVideo.playsInline = true;
    preloadedVideo.style.display = 'none';
    document.body.appendChild(preloadedVideo);

    preloadedVideo.addEventListener('canplaythrough', () => {
      videoReady = true;
    });

    function playAnimation() {
      if (clicked) return;
      clicked = true;
      container.style.backgroundImage = 'none';

      const overlay = container.querySelector('.bg-opacity-0');
      if (overlay) overlay.style.display = 'none';

      const video = document.createElement('video');
      video.src = videoSrc;
      video.className =
        'absolute inset-0 w-full h-full object-cover rounded-lg z-10 pointer-events-none';
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;

      video.onended = () => {
        video.pause();
        video.currentTime = video.duration;
      };

      container.appendChild(video);
    }

    function handleInteraction(e) {
      // prevent double fire (touch -> click)
      if (clicked || !videoReady) return;

      // determine coordinate (supports touch & mouse)
      let clientX, clientY;
      if (e.type === 'touchend' && e.changedTouches && e.changedTouches[0]) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else if (e.clientX !== undefined && e.clientY !== undefined) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      // mobile: accept any tap anywhere on the container
      if (isTouchDevice) {
        e.preventDefault();
        playAnimation();
        return;
      }

      // desktop: use mask pixel alpha test
      if (!maskCtx) return;
      const rect = container.getBoundingClientRect();
      const x = Math.floor((clientX - rect.left) * (maskW / rect.width));
      const y = Math.floor((clientY - rect.top) * (maskH / rect.height));

      // bounds safety
      if (x < 0 || y < 0 || x >= maskW || y >= maskH) return;

      const alpha = maskCtx.getImageData(x, y, 1, 1).data[3];
      if (alpha < 10) return;

      // passed mask test -> play
      e.preventDefault();
      playAnimation();
    }

    // Bind events:
    // - touchend for touch devices (passive:false so we can preventDefault if needed)
    // - click for mouse/desktop
    container.addEventListener('touchend', handleInteraction, { passive: false });
    container.addEventListener('click', handleInteraction);
  });
});
