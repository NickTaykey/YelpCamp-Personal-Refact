/* form validation code */
const form = document.querySelector("form");
const h2 = document.querySelector("h2");

form.addEventListener("submit", e => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const missingFields = [];

  if (password.length) {
    if (!username.length) missingFields.push("username");
    if (!email.length) missingFields.push("email");
    if (newPassword.length || confirmPassword.length) {
      if (!newPassword.length && confirmPassword.length)
        missingFields.push("new password");
      if (newPassword.length && !confirmPassword.length)
        missingFields.push("password confirmation");
    }
  } else {
    missingFields.push("password");
  }

  if (missingFields.length) {
    e.preventDefault();
    let errMsg = "Missing " + missingFields.join(" ");
    let err = document.getElementById("error");
    if (!err) {
      err = document.createElement("div");
      err.classList.add("alert");
      err.classList.add("alert-danger");
      err.setAttribute("id", "error");
      // per mettere l'errore subito dopo la h2
      h2.parentNode.insertBefore(err, h2.nextSibling);
    }
    err.textContent = errMsg;
  }
});
