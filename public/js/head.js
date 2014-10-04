require=function e(t,o,n){function i(r,a){if(!o[r]){if(!t[r]){var d="function"==typeof require&&require;if(!a&&d)return d(r,!0);if(s)return s(r,!0);var c=new Error("Cannot find module '"+r+"'");throw c.code="MODULE_NOT_FOUND",c}var l=o[r]={exports:{}};t[r][0].call(l.exports,function(e){var o=t[r][1][e];return i(o?o:e)},l,l.exports,e,t,o,n)}return o[r].exports}for(var s="function"==typeof require&&require,r=0;r<n.length;r++)i(n[r]);return i}({"/root/javascript-nodejs/node_modules/client/dom/findClosest.js":[function(e,t){t.exports=function(e,t){for(;e;){if(e.matches(t))return e;e=e.parentElement}return null}},{}],"/root/javascript-nodejs/node_modules/client/dom/getBrowserScrollCause.js":[function(e,t){function o(){return n?"initial":i?"onload":s?"click":null}var n=!0,i=!1,s=!1;document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){n=!1},2e3)}),document.addEventListener("click",function(){s=!0,setTimeout(function(){s=!1},50)}),window.onload=function(){i=!0,setTimeout(function(){i=!1},200)},t.exports=o},{}],"/root/javascript-nodejs/node_modules/client/dom/getDocumentHeight.js":[function(e,t){var o=e("./getScrollbarHeight");t.exports=function(e){e=e||document;var t=e.documentElement.scrollHeight||e.body.scrollHeight;return e.documentElement.scrollWidth>e.documentElement.clientWidth&&(t+=o),t}},{"./getScrollbarHeight":"/root/javascript-nodejs/node_modules/client/dom/getScrollbarHeight.js"}],"/root/javascript-nodejs/node_modules/client/dom/getScrollbarHeight.js":[function(e,t){function o(){var e=document.createElement("div");if(e.style.cssText="visibility:hidden;height:100px",!document.body)throw new Error("getScrollbarHeight called to early: no document.body");document.body.appendChild(e);var t=e.offsetWidth;e.style.overflow="scroll";var o=document.createElement("div");o.style.width="100%",e.appendChild(o);var n=o.offsetWidth;return e.parentNode.removeChild(e),t-n}t.exports=o()},{}],"/root/javascript-nodejs/node_modules/client/head/fontTest.js":[function(e,t){t.exports=function(){function e(){o!=t.offsetWidth?document.body.classList.remove("no-icons"):setTimeout(e,100)}var t=document.createElement("span");document.body.appendChild(t),t.className="font-test",t.style.fontFamily="serif";var o=t.offsetWidth;t.style.fontFamily="",e()}},{}],"/root/javascript-nodejs/node_modules/client/head/init.js":[function(e,t){function o(e){i[e]?i[e]():s[e]=!0}function n(e,t){s[e]?t():i[e]=t}var i={},s={};t.exports={whenReady:o,addHandler:n}},{}],"/root/javascript-nodejs/node_modules/client/head/insertNonBlockingScript.js":[function(e,t){var o=e("client/versions");t.exports=function(e,t){t=t||{};var n=document.createElement("script");return o[e]&&(e=e.replace(".js",".v"+o[e]+".js")),n.src=e,n.async=t.async||!1,document.head.appendChild(n),n}},{"client/versions":"/root/javascript-nodejs/node_modules/client/versions.json"}],"/root/javascript-nodejs/node_modules/client/head/login.js":[function(e,t){function o(){var t=new s,o=new r;t.setContent(o.elem),o.start();var n=i("/js/auth.js");n.onload=function(){t.remove();var o=e("auth/client").AuthModal;new o}}var n=e("./init"),i=e("./insertNonBlockingScript"),s=e("./modal"),r=e("client/spinner");n.addHandler("login",function(){var e=document.querySelector(".sitetoolbar__login");e.onclick=function(e){e.preventDefault(),o()}}),t.exports=o},{"./init":"/root/javascript-nodejs/node_modules/client/head/init.js","./insertNonBlockingScript":"/root/javascript-nodejs/node_modules/client/head/insertNonBlockingScript.js","./modal":"/root/javascript-nodejs/node_modules/client/head/modal.js","auth/client":"auth/client","client/spinner":"/root/javascript-nodejs/node_modules/client/spinner.js"}],"/root/javascript-nodejs/node_modules/client/head/logout.js":[function(e,t){function o(){var e=document.createElement("form");e.innerHTML='<input name="_csrf" value="'+window.csrf+'">',e.method="POST",e.action="/auth/logout",e.submit()}var n=e("./init");n.addHandler("logout",function(){var e=document.querySelector(".sitetoolbar__logout");e.onclick=function(e){e.preventDefault(),o()},e.classList.remove("unready")}),t.exports=o},{"./init":"/root/javascript-nodejs/node_modules/client/head/init.js"}],"/root/javascript-nodejs/node_modules/client/head/modal.js":[function(e,t){function o(){document.body.insertAdjacentHTML("beforeEnd",'<div class="modal"><div class="modal-dialog"></div></div>');this.elem=document.body.lastChild,this.contentElem=this.elem.lastChild,this.onClick=this.onClick.bind(this),this.onDocumentKeyDown=this.onDocumentKeyDown.bind(this),this.elem.addEventListener("click",this.onClick),document.addEventListener("keydown",this.onDocumentKeyDown)}o.prototype.onClick=function(e){e.target.classList.contains("close-button")&&this.remove()},o.prototype.onDocumentKeyDown=function(e){27==e.keyCode&&(e.preventDefault(),this.remove())},o.prototype.showOverlay=function(){this.contentElem.classList.add("modal-overlay")},o.prototype.hideOverlay=function(){this.contentElem.classList.remove("modal-overlay")},o.prototype.setContent=function(e){"string"==typeof e?this.contentElem.innerHTML=e:(this.contentElem.innerHTML="",this.contentElem.appendChild(e));var t=this.contentElem.querySelector("[autofocus]");t&&t.focus()},o.prototype.remove=function(){document.body.removeChild(this.elem),document.removeEventListener("keydown",this.onDocumentKeyDown)},t.exports=o},{}],"/root/javascript-nodejs/node_modules/client/head/navigation.js":[function(){function e(e){if(!~["INPUT","TEXTAREA","SELECT"].indexOf(document.activeElement.tagName)&&e[t+"Key"]){var o=null;switch(e.keyCode){case 37:o="prev";break;case 39:o="next";break;default:return}var n=document.querySelector('link[rel="'+o+'"]');n&&(document.location=n.href,e.preventDefault())}}document.addEventListener("keydown",e);var t=~navigator.userAgent.toLowerCase().indexOf("mac os x")?"ctrl":"alt";document.addEventListener("DOMContentLoaded",function(){var e,o=t[0].toUpperCase()+t.slice(1),n=document.querySelector('link[rel="next"]');n&&(e=document.querySelector('a[href="'+n.getAttribute("href")+'"] .page__nav-text-shortcut'),e.innerHTML=o+' + <span class="page__nav-text-arr">→</span>');var i=document.querySelector('link[rel="prev"]');i&&(e=document.querySelector('a[href="'+i.getAttribute("href")+'"] .page__nav-text-shortcut'),e.innerHTML=o+' + <span class="page__nav-text-arr">←</span>')})},{}],"/root/javascript-nodejs/node_modules/client/head/resizeOnload/iframeResize.js":[function(e,t){function o(e,t){function o(e,o){clearTimeout(s),t(e,o)}var s=setTimeout(function(){t(new Error("timeout"))},500);try{(e.contentDocument||e.contentWindow.document).body}catch(r){n(e,o)}if(!e.offsetWidth){var a=e.cloneNode(!0);return a.name="",a.style.height="50px",a.style.position="absolute",a.style.display="block",a.style.top="10000px",a.onload=function(){var t=i(this.contentDocument);e.style.display="block",a.remove(),o(null,t)},void document.body.appendChild(a)}e.style.display="block",e.style.height="1px";var d=i(e.contentDocument);e.style.height="",o(null,d)}function n(){throw new Error("Not implemented yet")}var i=e("client/dom/getDocumentHeight");o.async=function(e,t){setTimeout(function(){o(e,t)},0)},t.exports=o},{"client/dom/getDocumentHeight":"/root/javascript-nodejs/node_modules/client/dom/getDocumentHeight.js"}],"/root/javascript-nodejs/node_modules/client/head/resizeOnload/index.js":[function(e,t,o){var n=e("./iframeResize"),i=e("client/dom/findClosest"),s=e("lib/throttle"),r=[];o.iframe=function(e){function t(){n.async(e,function(t,o){t&&console.error(t),o&&(e.style.height=o+"px")})}t()},o.codeTabs=function(e){function t(){var t=i(e,".code-tabs"),o=(i(e,"[data-code-tabs-content]"),t.querySelector("[data-code-tabs-switches]")),n=o.firstElementChild;n.offsetWidth>o.offsetWidth?t.classList.add("code-tabs_scroll"):t.classList.remove("code-tabs_scroll")}t(),r.push(t)},window.addEventListener("resize",s(function(){r.forEach(function(e){e()})},200))},{"./iframeResize":"/root/javascript-nodejs/node_modules/client/head/resizeOnload/iframeResize.js","client/dom/findClosest":"/root/javascript-nodejs/node_modules/client/dom/findClosest.js","lib/throttle":"/root/javascript-nodejs/node_modules/lib/throttle.js"}],"/root/javascript-nodejs/node_modules/client/head/sitetoolbar.js":[function(e){function t(e){document.body.setAttribute("data-scroll-prev",document.body.getAttribute("data-scroll")||""),e?document.body.setAttribute("data-scroll",e):document.body.removeAttribute("data-scroll"),d=e}function o(){if(!n()){var e=document.querySelector(".sitetoolbar");if(e){var o=e.offsetHeight,i=s();if(null!==i)return a=window.pageYOffset,void t(window.pageYOffset>o?"out":"");if("in"==d&&window.pageYOffset<3)return a=window.pageYOffset,void t("");if(""===d&&window.pageYOffset<o)return void(a=window.pageYOffset);var l=window.pageYOffset>a?"down":"up",u=Math.abs(window.pageYOffset-a);if(!(c[l]>u)){a=window.pageYOffset;var m=r()-window.pageYOffset-window.innerHeight;if(!("up"==l&&m<c.upAtBottom&&window.pageYOffset>c.upAtBottom))return"up"==l?void t("in"):"down"==l?void t("out"):void 0}}}}function n(){if("complete"!=document.readyState)return!1;var e=window.pageYOffset<0,t=window.pageYOffset+window.innerHeight>r();return e||t}var i,s=e("client/dom/getBrowserScrollCause"),r=e("client/dom/getDocumentHeight"),a=0,d="",c={up:10,upAtBottom:60,down:10};window.addEventListener("scroll",function(){i||(i=window.requestAnimationFrame(function(){o(),i=null}))})},{"client/dom/getBrowserScrollCause":"/root/javascript-nodejs/node_modules/client/dom/getBrowserScrollCause.js","client/dom/getDocumentHeight":"/root/javascript-nodejs/node_modules/client/dom/getDocumentHeight.js"}],"/root/javascript-nodejs/node_modules/client/head/unready.js":[function(){document.addEventListener("click",function(e){for(var t=e.target;t;){if(t.className.match(/_unready\b/))return void e.preventDefault();t=t.parentElement}}),document.addEventListener("submit",function(e){e.target.className.match(/_unready\b/)&&event.preventDefault()})},{}],"/root/javascript-nodejs/node_modules/client/spinner.js":[function(e,t){function o(e){if(e=e||{},this.elem=e.elem,this.size=e.size||"medium",this.class=e.class?" "+e.class:"",this.elemClass=e.elemClass,"medium"!=this.size&&"small"!=this.size)throw new Error("Unsupported size: "+this.size);this.elem||(this.elem=document.createElement("div"))}o.prototype.start=function(){this.elemClass&&this.elem.classList.toggle(this.elemClass),this.elem.insertAdjacentHTML("beforeend",'<span class="spinner spinner_active spinner_'+this.size+this.class+'"><span class="spinner__dot spinner__dot_1"></span><span class="spinner__dot spinner__dot_2"></span><span class="spinner__dot spinner__dot_3"></span></span>')},o.prototype.stop=function(){this.elem.removeChild(this.elem.querySelector(".spinner")),this.elemClass&&this.elem.classList.toggle(this.elemClass)},t.exports=o},{}],"/root/javascript-nodejs/node_modules/client/versions.json":[function(e,t){t.exports={"/js/auth.js":"dfbf65","/js/profile.js":"2ddae9","/js/tutorial.js":"5ac0ff","/js/footer.js":"90907c","/js/head.js":"4cb235"}},{}],"/root/javascript-nodejs/node_modules/lib/throttle.js":[function(e,t){function o(e,t){function o(){return s?(n=arguments,void(i=this)):(e.apply(this,arguments),s=!0,void setTimeout(function(){s=!1,n&&(o.apply(i,n),n=i=null)},t))}var n,i,s=!1;return o}t.exports=o},{}],"client/head":[function(e,t,o){o.insertNonBlockingScript=e("./insertNonBlockingScript"),e("./unready"),o.init=e("./init"),o.login=e("./login"),o.logout=e("./logout"),o.Modal=e("./modal"),o.fontTest=e("./fontTest"),o.resizeOnload=e("./resizeOnload"),e("./sitetoolbar"),e("./navigation")},{"./fontTest":"/root/javascript-nodejs/node_modules/client/head/fontTest.js","./init":"/root/javascript-nodejs/node_modules/client/head/init.js","./insertNonBlockingScript":"/root/javascript-nodejs/node_modules/client/head/insertNonBlockingScript.js","./login":"/root/javascript-nodejs/node_modules/client/head/login.js","./logout":"/root/javascript-nodejs/node_modules/client/head/logout.js","./modal":"/root/javascript-nodejs/node_modules/client/head/modal.js","./navigation":"/root/javascript-nodejs/node_modules/client/head/navigation.js","./resizeOnload":"/root/javascript-nodejs/node_modules/client/head/resizeOnload/index.js","./sitetoolbar":"/root/javascript-nodejs/node_modules/client/head/sitetoolbar.js","./unready":"/root/javascript-nodejs/node_modules/client/head/unready.js"}]},{},[]);