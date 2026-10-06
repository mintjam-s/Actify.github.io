// ===== DATA (kept in memory, resets when the page is refreshed) =====
var currentUser = "";
var artworks = [];   // each one: { title, artist, src }

// ===== SAVING (shared with the admin page through the browser's storage) =====
function loadArtworks() {
  try {
    var saved = localStorage.getItem("actifyArtworks");
    if (saved) {
      artworks = JSON.parse(saved);
    }
  } catch (error) {
    // storage not available, keep what is in memory
  }
}

function saveArtworks() {
  try {
    localStorage.setItem("actifyArtworks", JSON.stringify(artworks));
  } catch (error) {
    document.getElementById("studio-message").innerText = "Posted, but the browser storage is full so it may not be kept after a refresh.";
  }
}

loadArtworks();

// ===== PAGES =====
function showPage(name) {
  // Portfolio is only for logged in artists
  if (name == "portfolio" && currentUser == "") {
    name = "login";
    document.getElementById("login-message").innerText = "Please log in to open your portfolio.";
  }

  var pages = ["home", "login", "portfolio", "gallery"];
  for (var i = 0; i < pages.length; i++) {
    document.getElementById("page-" + pages[i]).classList.add("hidden");
  }
  document.getElementById("page-" + name).classList.remove("hidden");

  loadArtworks();
  showArtworks();
  window.scrollTo(0, 0);
}

// ===== LOGIN =====
function logIn() {
  var name = document.getElementById("name-input").value;

  if (name == "") {
    document.getElementById("login-message").innerText = "Type an artist name first.";
    return;
  }

  currentUser = name;
  document.getElementById("welcome").innerText = "Hi, " + currentUser;
  document.getElementById("welcome").classList.remove("hidden");
  document.getElementById("link-portfolio").classList.remove("hidden");
  document.getElementById("login-button").classList.add("hidden");
  document.getElementById("logout-button").classList.remove("hidden");
  document.getElementById("login-message").innerText = "";

  showPage("portfolio");
}

function logOut() {
  currentUser = "";
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("link-portfolio").classList.add("hidden");
  document.getElementById("login-button").classList.remove("hidden");
  document.getElementById("logout-button").classList.add("hidden");
  document.getElementById("name-input").value = "";

  showPage("home");
}

// ===== CANVAS =====
var canvas = document.getElementById("canvas");
var pen = canvas.getContext("2d");
var drawing = false;
var erasing = false;

// start with a white canvas
pen.fillStyle = "white";
pen.fillRect(0, 0, canvas.width, canvas.height);

function getPosition(event) {
  var box = canvas.getBoundingClientRect();
  var scale = canvas.width / box.width;
  return {
    x: (event.clientX - box.left) * scale,
    y: (event.clientY - box.top) * scale
  };
}

canvas.addEventListener("pointerdown", function (event) {
  drawing = true;
  var p = getPosition(event);
  pen.beginPath();
  pen.moveTo(p.x, p.y);
  draw(event);
});

canvas.addEventListener("pointermove", function (event) {
  if (drawing) {
    draw(event);
  }
});

window.addEventListener("pointerup", function () {
  drawing = false;
});

function draw(event) {
  var p = getPosition(event);
  pen.lineWidth = document.getElementById("size-input").value;
  pen.lineCap = "round";
  pen.lineJoin = "round";

  if (erasing) {
    pen.strokeStyle = "white";
  } else {
    pen.strokeStyle = document.getElementById("color-input").value;
  }

  pen.lineTo(p.x, p.y);
  pen.stroke();
}

function useEraser() { erasing = true; }
function usePen() { erasing = false; }

function clearCanvas() {
  pen.fillStyle = "white";
  pen.fillRect(0, 0, canvas.width, canvas.height);
}

// ===== POST A DRAWING =====
function saveDrawing() {
  var title = document.getElementById("title-input").value;
  if (title == "") {
    title = "Untitled";
  }

  artworks.push({
    title: title,
    artist: currentUser,
    src: canvas.toDataURL("image/png")
  });
  saveArtworks();

  document.getElementById("title-input").value = "";
  document.getElementById("studio-message").innerText = "Posted! Your drawing is in your portfolio and the gallery.";
  clearCanvas();
  showArtworks();
}

// ===== UPLOAD AN ARTWORK =====
function uploadFile() {
  var file = document.getElementById("file-input").files[0];
  if (!file) {
    return;
  }

  var reader = new FileReader();
  reader.onload = function () {
    var title = document.getElementById("title-input").value;
    if (title == "") {
      title = file.name;
    }

    artworks.push({
      title: title,
      artist: currentUser,
      src: reader.result
    });
    saveArtworks();

    document.getElementById("title-input").value = "";
    document.getElementById("file-input").value = "";
    document.getElementById("studio-message").innerText = "Uploaded! Your artwork is in your portfolio and the gallery.";
    showArtworks();
  };
  reader.readAsDataURL(file);
}

// ===== SHOW ARTWORKS =====
function makeCard(art) {
  return '<div class="art-card">' +
    '<img src="' + art.src + '" alt="' + art.title + '">' +
    '<div><strong>' + art.title + '</strong>by ' + art.artist + '</div>' +
    '</div>';
}

function showArtworks() {
  var galleryHtml = "";
  var portfolioHtml = "";

  for (var i = 0; i < artworks.length; i++) {
    var card = makeCard(artworks[i]);
    galleryHtml = card + galleryHtml;          // newest first
    if (artworks[i].artist == currentUser) {
      portfolioHtml = card + portfolioHtml;
    }
  }

  if (galleryHtml == "") {
    galleryHtml = '<p class="empty-note">No art here yet. Log in, open your Portfolio, and post the first piece.</p>';
  }
  if (portfolioHtml == "") {
    portfolioHtml = '<p class="empty-note">Your portfolio is empty. Draw something above, or upload art you made elsewhere.</p>';
  }

  document.getElementById("gallery-list").innerHTML = galleryHtml;
  document.getElementById("portfolio-list").innerHTML = portfolioHtml;
}

showArtworks();
