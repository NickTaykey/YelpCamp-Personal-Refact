/* form validation code */
const form = document.querySelector("form");
const h2 = document.querySelector("h2");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const pwdStateLabel = document.getElementById("pwdStateLabel");
const submitBtn = document.querySelector("input[type='submit']");
const error = document.getElementById("error");

function setPwdStateMsg(msg, stateToAdd, stateToRemove) {
  pwdStateLabel.textContent = msg;
  pwdStateLabel.classList.add(stateToAdd);
  pwdStateLabel.classList.remove(stateToRemove);
}

function hideAlerts() {
  document.querySelectorAll(".alert").forEach(a => {
    a.style.display = "none";
  });
}

function inputEventController(e) {
  const nPwd = newPassword.value;
  const cPwd = confirmPassword.value;
  if (nPwd === cPwd) {
    setPwdStateMsg("passwords matching!", "success", "error");
    submitBtn.removeAttribute("disabled");
  } else {
    setPwdStateMsg("passwords not matching!", "error", "success");
    submitBtn.setAttribute("disabled", true);
  }
}

// controlla se confirmPassword combacia con newPassword mostrando lo stato sotto i due input
newPassword.addEventListener("input", inputEventController);
confirmPassword.addEventListener("input", inputEventController);

// quando il form viene spedito fa i controlli di validazione, impedendone l'invio in caso diorori
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
    hideAlerts();
    error.textContent = errMsg;
    error.style.display = "block";
  }
});
