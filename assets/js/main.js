if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", {scope: "/sw/"});
}
else if (document.getElementById("shims_table")) {
  let shim_links = document.getElementsByClassName("shim_link");
  for (let i = 0; i < shim_links.length; i++) {
    let shim_link = shim_links[i];
    shim_link.onclick = (event) => {
      alert("Error: Service workers are not available in your browser.");
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
