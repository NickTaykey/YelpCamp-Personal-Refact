const cleanLocationLink = document.getElementById("cleanLocation");
const locationInput = document.getElementById("location");
const customDistance = document.getElementById("customDistance");
cleanLocationLink.addEventListener("click", e => {
  // for security sake
  e.preventDefault();
  // reset all the location fields
  locationInput.value = "";
  document.querySelector("input[type='radio']:checked").checked = false;
  customDistance.value = "";
});
