
export function thumb(url, width, height) {
  var pixelRatio = window.devicePixelRatio;

  // return pixelRatio times larger image for retina
  width *= pixelRatio;
  height *= pixelRatio;

  var modifier = (width <= 160 && height <= 160) ? 't' :
    (width <= 320 && height <= 320) ? 'm' :
      (width <= 640 && height <= 640) ? 'i' :
        (width <= 1024 && height <= 1024) ? 'h' : '';

  return url.slice(0, url.lastIndexOf('.')) + modifier + url.slice(url.lastIndexOf('.'));
}

