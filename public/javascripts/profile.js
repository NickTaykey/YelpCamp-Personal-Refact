const campgroundsBtn = document.getElementById("campgrounds-btn");
const commentsBtn = document.getElementById("comments-btn");
const campgrounds = document.getElementById("campgrounds");
const comments = document.getElementById("comments");

function toggleDisplay(elemD, elemH) {
  if (elemD.style.display === "none" && !this.classList.contains("disabled")) {
    elemD.style.display = "block";
    elemH.style.display = "none";
  } else {
    elemD.style.display = "none";
  }
}

campgroundsBtn.addEventListener("click", function(e) {
  toggleDisplay.call(this, campgrounds, comments);
});
commentsBtn.addEventListener("click", function(e) {
  toggleDisplay.call(this, comments, campgrounds);
});
