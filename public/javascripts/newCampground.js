var form = document.querySelector("form");
form.addEventListener("submit", event => {
  let images = document.querySelector("#images");
  if (images.files.length > 4) {
    event.preventDefault();
    alert("You can upload at the most 4 images!");
  }
});
