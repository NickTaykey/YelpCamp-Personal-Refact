/* 
  ATTENZIONE!

  OGNI VOLTA CHE NASCONDIAMO UNA MAPPA (il div con id map) E LA FACCIAMO RIAPPARIRE DOBBIAMO RICHIAMARE IL 
  METODO resize() SUL OGGETTO map CHE LA RAPPRESENTA, ALTRIMENTI LA MAPPA NON VIENE RENDERIZZATA CON LE 
  DIMENSIONI CORRETTE CHE ABBIAMO SPECIFICATO DAL CSS
*/

// selezioniamo tutte le opzioni
let options = document.querySelectorAll(".list-group-item"),
  // classi di tutti gli elementi che POSSIAMO nascondere
  elems = [".geo", ".reviews", ".info", ".images"],
  // ELEMENTO DA MOSTRARE
  elemToShow,
  // RIMUOVE DAL ARRAY CON GLI ELEMENTI CHE POSSIAMO NASCONDERE
  // QUELLO CHE NON VOGLIAMO NASCONDERE E RITORNA L'ARRAY MODIFICATO
  getElementsToHide = el => {
    let arr = [...elems];
    arr.splice(elems.indexOf(el), 1);
    return arr;
  };

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
      // recuperiamo il testo del elemento
      let text = this.textContent;
      // constrolliamo il testo IN BASE AL NOME DEL OPZIONE SPECIFICHIAMO L'ELEMENTO DA MOSTRARE
      if (text === "General Info") {
        elemToShow = ".info";
      } else if (text === "Location") {
        elemToShow = ".geo";
      } else if (text === "Photos") {
        elemToShow = ".images";
      } else if (text === "Reviews") {
        elemToShow = ".reviews";
      }
      // MOSTRIAMO TUTTI GLI ELEMENTI DA MOSTRARE
      for (const el of document.querySelectorAll(elemToShow)) {
        el.style.display = "block";
        // SELEZIONIAMO IL THUMBNAIL
        let thumbnail = document.querySelector(".thumbnail");
        // SE L'ELEMENTO DA MOSTRARE E' .reviews NASCONDIAMO IL THUMBNAIL
        if (elemToShow === ".reviews") thumbnail.style.display = "none";
        else {
          // ALTIRMENTI MOSTRIAMO IL THUMBNAIL
          thumbnail.style.display = "block";
          // SE L'ELEMENTO DA MOSTRARE E' LA MAPPA ALLORA LA RIDIMENSIONIAMO
          // (altimenti nn apparirebbe con le dimensioni corrette)
          if (elemToShow === ".geo") map.resize();
        }
      }
      // selezioniamo tutti gli elementi da nascondere
      elemsTohide = getElementsToHide(elemToShow);
      // li nascondiamo
      for (const el of document.querySelectorAll(elemsTohide))
        el.style.display = "none";
    }
  });
}
