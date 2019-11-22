// CONTROLLA CHE L'UTENTE INSERISCA UNA LOCATION VALIDA
var form = document.querySelector("form");
form.addEventListener("submit", event => {
  let location = document.querySelector("#location").value;
  if (!location.length || !/[\w-]+\s*/g.test(location)) {
    event.preventDefault();
    let msg;
    if (!location.length) msg = "you have to provvide a location";
    else if (!/[\w-]+\s*/g.test(location)) msg = "the location is not valid";
    alert(msg);
  }
});
