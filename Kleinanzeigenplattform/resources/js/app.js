document.getElementById("enableInputBtn").addEventListener("click", function() {
  document.getElementById("benutzername").removeAttribute("disabled");
  document.getElementById("vorname").removeAttribute("disabled");
  document.getElementById("nachname").removeAttribute("disabled");
  document.getElementById("versteckterBtn").style.display = "block";
});
