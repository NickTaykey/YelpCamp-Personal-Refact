// selezioniamo tutte le opzioni
let options = document.querySelectorAll(".list-group-item");
for (const opt of options) {
  // applichiamo un click su tutte le opzioni
  opt.addEventListener("click", function() {
    // se l'elemento non ha classe active
    if (!this.classList.contains("active")) {
      // rimuoviamo active dal altra
      document
        .querySelector(".list-group-item.active")
        .classList.remove("active");
      // gliela aggiungiamo
      this.classList.add("active");
      let clsToDisplay, clsToHide;
      // per ogni classe da mostrare trova il suo nome ed il nome delle classi degli elementi da nascondere
      if (this.textContent === "General Info") {
        clsToDisplay = ".info";
        clsToHide = ".images, .geo, .reviews";
      } else if (this.textContent === "Photos") {
        clsToDisplay = ".images";
        clsToHide = ".info, .geo, .reviews";
      } else if (this.textContent === "Location") {
        clsToDisplay = ".geo";
        clsToHide = ".images, .info, .reviews";
      } else if (this.textContent === "Reviews") {
        clsToDisplay = ".reviews";
        clsToHide = ".images, .geo, .info";
      }
      // mostra tutti gli elementi con la classe da mostrare
      let els = document.querySelectorAll(clsToDisplay);
      for (const el of els) {
        // quando cambiamo il valore di display della mappa x mostrarla chiamiamo sempre il metodo resize per
        // ridimensionarla e farla apparire della grandezza giusta
        el.style.display = "block";
        let thumbnail = document.querySelector(".thumbnail");
        if (clsToDisplay === ".geo") map.resize();
        else if (clsToDisplay === ".reviews") thumbnail.style.display = "none";
        else thumbnail.style.display = "block";
      }
      // nasconde tutti gli elementi con la classe da nascondere
      els = document.querySelectorAll(clsToHide);
      for (const el of els) {
        el.style.display = "none";
      }
    }
  });
}
