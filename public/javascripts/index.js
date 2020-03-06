// CLEAN LOCATION FORM CODE
const cleanLocationLink = document.getElementById("cleanLocation");
const locationInput = document.getElementById("location");
const customDistance = document.getElementById("customDistance");
const geolocationStatus = document.getElementById("geolocationStatus");
const inputGroup = document.querySelector(".input-group");
cleanLocationLink.addEventListener("click", e => {
  // for security sake
  e.preventDefault();
  // reset all the location fields
  inputGroup.style.display = "table";
  geolocationStatus.textContent = "";
  locationInput.value = "";
  customDistance.value = "";
  document.querySelector("input[type='radio']:checked").checked = false;
});

// GEOLOCATION FEATURE CODE
const useMyLocationLink = document.getElementById("useMyLocation");
useMyLocationLink.addEventListener("click", e => {
  // for security sake
  e.preventDefault();
  // if the broswer supports the geolocation API we will get the user's current location
  if (navigator.geolocation) {
    geolocationStatus.textContent = "...";
    // .getCurrentPosition to get the user location
    navigator.geolocation.getCurrentPosition(
      position => {
        // success callback
        const { latitude, longitude } = position.coords;
        // put the coordinates as value (JSON obj) of location and hide it
        locationInput.value = `[${longitude}, ${latitude}]`;
        inputGroup.style.display = "none";
        geolocationStatus.textContent = "geolocation successfully completed!";
      },
      e => {
        // error callback
        geolocationStatus.textContent = "Error happened during the geolocation";
      }
    );
  }
  // otherwise we will give back an error message
  else {
    geolocationStatus.textContent =
      "Your browser do not support the geolocation!";
  }
});
