var Modal = require('client/head/modal');
var clientRender = require('client/clientRender');
var newsletter = require('newsletter/client');
var gaHitCallback = require('gaHitCallback');

function init() {
  initList();

  initNewsletterForm();
}


function initNewsletterForm() {

  var form = document.querySelector('[data-newsletter-subscribe-form]');
  if (!form) return;

  form.onsubmit = function(event) {
    event.preventDefault();
    newsletter.submitSubscribeForm(form);
  };

}

function initList() {
  var lis = document.querySelectorAll('li[data-mnemo]');

  for (var i = 0; i < lis.length; i++) {
    var li = lis[i];
    var mnemo = li.getAttribute('data-mnemo');

    li.insertAdjacentHTML(
      'beforeEnd',

      '<div class="lessons-list__download">' +
      '<div class="lessons-list__popup">' +
      '<ul class="lessons-list__popup-list">' +
      '<li class="lessons-list__popup-item">' +
      '<a data-track-outbound href="/webpack-screencast/webpack-mp4-low/' +
      mnemo + '.mp4">Компактный размер</a>' +
      '</li>' +

      '<li class="lessons-list__popup-item">' +
      '<a data-track-outbound href="/webpack-screencast/webpack-mp4/' +
      mnemo + '.mp4">Высокое качество</a>' +
      '</li>' +
      '</ul>' +
      '</div>' +
      '</div>'
    );
  }

  var links = document.querySelectorAll('a[data-video-id]');
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    link.onclick = function(e) {
      e.preventDefault();
      var videoId = this.getAttribute('data-video-id');
      window.ga('send', 'event', 'webpack-screencast', 'open', videoId, {
        hitCallback: gaHitCallback(function() {
          openVideo(videoId);
        })
      });
    };
  }
}


var player;

function openVideo(videoId) {
  // sizes from https://developers.google.com/youtube/iframe_api_reference
  var sizeList = [
    {width: 0, height: 0}, // mobile screens lower than any player => new window
    {width: 640, height: 360},
    {width: 853, height: 480},
    {width: 1280, height: 720}
  ];

  for (var i = 0; i < sizeList.length; i++) {
    if (document.documentElement.clientHeight < sizeList[i].height ||
      document.documentElement.clientWidth < sizeList[i].width) break;
  }
  i--;

  var width = sizeList[i].width;
  var height = sizeList[i].height;

  if (i === 0) {
    window.location.href = '//www.youtube.com/watch?v=' + videoId;
  } else {

    var modal = new Modal();
    modal.setContent(
      `<div id="player"></div>`
    );

    modal.elem.addEventListener('modal-remove', function() {
      if (player) {
        player.destroy();
        player = null;
      }
    });


    if (!window.YT) {
      var iframeApiScript = document.createElement('script');
      iframeApiScript.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(iframeApiScript);

      window.onYouTubeIframeAPIReady = function() {
        initPlayer(videoId, width, height);
        delete window.onYouTubeIframeAPIReady;
      };
    } else {
      initPlayer(videoId, width, height);
    }

  }
  // <iframe width="${width}" height="${height}" src="//www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>


}


function initPlayer(videoId, width, height) {


  if (player) {
    player.destroy();
  }

  player = new window.YT.Player('player', {
    height:  height,
    width:   width,
    videoId: videoId,
    events:  {
      onReady:       function() {
        player.playVideo();
      },
      onStateChange: function(event) {
        var videoIds = document.querySelectorAll('[data-video-id]');
        if (event.data == 1) { // start
          player.videoId = videoId;
        }

        if (event.data == 0) { // end
          var videoLinks = document.querySelectorAll('[data-video-id]');
          for (var i = 0; i < videoLinks.length; i++) {
            var videoLink = videoLinks[i];
            if (videoLink.getAttribute('data-video-id') == player.videoId) {
              let nextVideoId = videoLinks[i + 1] && videoLinks[i + 1].getAttribute('data-video-id');
              if (nextVideoId) {
                initPlayer(nextVideoId, width, height);
              }
              break;
            }
          }
        }
      }
    }
  });
}


init();
