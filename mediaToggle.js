document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('media-container');
    const maskSrc   = '/mask.png';
    const gifSrc    = '/hit1.gif';
    const newImage  = '/final.png';
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

    container.addEventListener('click', e => {
      if (clicked) return;
      if (!maskCtx) return;


      const rect = container.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left)  * (maskW  / rect.width));
      const y = Math.floor((e.clientY - rect.top)   * (maskH  / rect.height));


      const p = maskCtx.getImageData(x, y, 1, 1).data;
      const alpha = p[3];
      if (alpha < 10) {

        return;
      }

      clicked = true;
      container.style.backgroundImage = 'none';
      const overlay = container.querySelector('.bg-opacity-40');
      if (overlay) overlay.style.display = 'none';

      const gif = document.createElement('img');
      gif.src       = `${gifSrc}?t=${Date.now()}`;
      gif.alt       = 'Playing GIF';
      gif.className = 'absolute inset-0 w-full h-full object-cover rounded-lg z-10 pointer-events-none';
      container.appendChild(gif);

      setTimeout(() => {
        gif.remove();
        container.style.backgroundImage = `url('${newImage}')`;
        if (overlay) overlay.style.display = '';
      }, duration);
    });


    const preload = new Image();
    preload.src = gifSrc;
    preload.style.display = 'none';
    document.body.appendChild(preload);
  });