godvilleui.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ godvilleui.showFirefoxContextMenu(e); }, false);
};

godvilleui.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-godvilleui").hidden = gContextMenu.onImage;
};

window.addEventListener("load", godvilleui.onFirefoxLoad, false);
