const GOOGLE_CLIENT_ID =
  "169132110819-ii7alr12lqb3jvhg74esqllvht3i1ts4.apps.googleusercontent.com";

window.onGoogleLibraryLoad = function () {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse,
  });
  google.accounts.id.renderButton(document.getElementById("google-btn"), {
    theme: "outline",
    size: "medium",
    shape: "pill",
    text: "signin_with",
  });
};

function handleCredentialResponse(response) {
  const payload = JSON.parse(atob(response.credential.split(".")[1]));
  document.getElementById("google-btn").style.display = "none";
  const userInfo = document.getElementById("user-info");
  userInfo.style.display = "flex";
  document.getElementById("user-avatar").src = payload.picture;
  document.getElementById("user-name").textContent = payload.given_name;
}

function signOut() {
  google.accounts.id.disableAutoSelect();
  document.getElementById("user-info").style.display = "none";
  document.getElementById("google-btn").style.display = "block";
}

window.addEventListener("scroll", function () {
  const header = document.getElementById("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
    header.classList.remove("scrolling");
  } else if (window.scrollY > 20) {
    header.classList.add("scrolling");
    header.classList.remove("scrolled");
  } else {
    header.classList.remove("scrolling");
    header.classList.remove("scrolled");
  }
});
