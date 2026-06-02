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
