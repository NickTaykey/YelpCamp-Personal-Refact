const passwords = document.querySelectorAll("input[type='password']");
const pwdStateLabel = document.getElementById("pwdStateLabel");
const submitBtn = document.querySelector("button[type='submit']");
submitBtn.setAttribute("disabled", true);

function setPwdStateMsg(msg, stateToAdd, stateToRemove) {
  pwdStateLabel.textContent = msg;
  pwdStateLabel.classList.add(stateToAdd);
  pwdStateLabel.classList.remove(stateToRemove);
}

passwords.forEach(e =>
  e.addEventListener("input", e => {
    if (passwords[0].value.length && passwords[1].value.length)
      if (passwords[0].value === passwords[1].value) {
        setPwdStateMsg("passwords matching!", "success", "error");
        submitBtn.removeAttribute("disabled");
      } else {
        setPwdStateMsg("passwords not matching!", "error", "success");
        submitBtn.setAttribute("disabled", true);
      }
    else {
      setPwdStateMsg("missing passwords!", "error", "success");
      submitBtn.setAttribute("disabled", true);
    }
  })
);
