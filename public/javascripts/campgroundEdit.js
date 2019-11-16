let form = document.querySelector("form");
form.addEventListener("submit", event => {
  let newImgs = document.querySelector("#imgInput").files.length,
    deletedImgs = document.querySelectorAll(".deleteImg:checked").length,
    totImgs = document.querySelectorAll("img").length,
    tot = totImgs - deletedImgs + newImgs;
  if (tot > 4) {
    event.preventDefault();
    alert(
      `You have to remove at least ${tot - 4} more image${
        tot - 4 > 1 ? "s" : ""
      }`
    );
  }
});
