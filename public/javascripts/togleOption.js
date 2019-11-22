/* 
  ATTENZIONE!

  OGNI VOLTA CHE NASCONDIAMO UNA MAPPA (il div con id map) E LA FACCIAMO RIAPPARIRE DOBBIAMO RICHIAMARE IL 
  METODO resize() SUL OGGETTO map CHE LA RAPPRESENTA, ALTRIMENTI LA MAPPA NON VIENE RENDERIZZATA CON LE 
  DIMENSIONI CORRETTE CHE ABBIAMO SPECIFICATO DAL CSS
*/
let options = document.querySelectorAll(".list-group-item"),
  elems = [".geo", ".reviews", ".info", ".images"],
  elemToShow,
  getElementsToHide = el => {
    let arr = [...elems];
    arr.splice(elems.indexOf(el), 1);
    return arr;
  };
for (const opt of options) {
  opt.addEventListener("click", function() {
    if (!this.classList.contains("active")) {
      document
        .querySelector(".list-group-item.active")
        .classList.remove("active");
      this.classList.add("active");
      let text = this.textContent;
      if (text === "General Info") elemToShow = ".info";
      else if (text === "Location") elemToShow = ".geo";
      else if (text === "Photos") elemToShow = ".images";
      else if (text === "Reviews") elemToShow = ".reviews";
      for (const el of document.querySelectorAll(elemToShow)) {
        el.style.display = "block";
        let thumbnail = document.querySelector(".thumbnail");
        if (elemToShow === ".reviews") thumbnail.style.display = "none";
        else {
          thumbnail.style.display = "block";
          if (elemToShow === ".geo") map.resize();
        }
      }
      elemsTohide = getElementsToHide(elemToShow);
      for (const el of document.querySelectorAll(elemsTohide))
        el.style.display = "none";
    }
  });
}
