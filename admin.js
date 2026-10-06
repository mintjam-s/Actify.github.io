// ===== SETTINGS =====
// Placeholder password. Change it here. (This is NOT secure, see notes.)
var adminPassword = "admin123";

var artworks = [];   // each one: { title, artist, src }

// ===== LOAD AND SAVE (same storage the public site uses) =====
function loadArtworks() {
  try {
    var saved = localStorage.getItem("actifyArtworks");
    if (saved) {
      artworks = JSON.parse(saved);
    } else {
      artworks = [];
    }
  } catch (error) {
    artworks = [];
  }
}

function saveArtworks() {
  try {
    localStorage.setItem("actifyArtworks", JSON.stringify(artworks));
  } catch (error) {
    document.getElementById("delete-message").innerText = "Could not save the change. Check your browser storage.";
  }
}

// ===== LOGIN =====
function adminLogIn() {
  var typed = document.getElementById("password-input").value;

  if (typed != adminPassword) {
    document.getElementById("login-message").innerText = "Wrong password. Try again.";
    return;
  }

  document.getElementById("page-login").classList.add("hidden");
  document.getElementById("page-moderation").classList.remove("hidden");
  document.getElementById("logout-button").classList.remove("hidden");
  document.getElementById("password-input").value = "";
  document.getElementById("login-message").innerText = "";

  showArtworks();
}

function adminLogOut() {
  document.getElementById("page-moderation").classList.add("hidden");
  document.getElementById("page-login").classList.remove("hidden");
  document.getElementById("logout-button").classList.add("hidden");
}

// ===== DELETE =====
function deleteArtwork(index) {
  loadArtworks();   // get the newest list first

  var art = artworks[index];
  if (!art) {
    showArtworks();
    return;
  }

  var sure = confirm('Delete "' + art.title + '" by ' + art.artist + '? This cannot be undone.');
  if (!sure) {
    return;
  }

  artworks.splice(index, 1);   // remove 1 item at this position
  saveArtworks();
  document.getElementById("delete-message").innerText = 'Deleted "' + art.title + '" by ' + art.artist + '.';
  showArtworks();
}

// ===== SHOW =====
function showArtworks() {
  loadArtworks();

  var html = "";
  for (var i = 0; i < artworks.length; i++) {
    var art = artworks[i];
    html = '<div class="art-card">' +
      '<img src="' + art.src + '" alt="' + art.title + '">' +
      '<div><strong>' + art.title + '</strong>by ' + art.artist +
      '<br><button class="delete-button" onclick="deleteArtwork(' + i + ')">Delete</button></div>' +
      '</div>' + html;   // newest first, same order as the public gallery
  }

  if (html == "") {
    html = '<p class="empty-note">The gallery is empty. Nothing to moderate right now.</p>';
  }

  document.getElementById("count-message").innerText = artworks.length + " artwork(s) in the gallery.";
  document.getElementById("admin-list").innerHTML = html;
}
