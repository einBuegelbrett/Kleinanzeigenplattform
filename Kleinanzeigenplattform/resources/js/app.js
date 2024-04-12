document.getElementById("enableInputBtn").addEventListener("click", function() {
  document.getElementById("profileImage").removeAttribute("disabled");
  document.getElementById("email").removeAttribute("disabled");
  document.getElementById("vorname").removeAttribute("disabled");
  document.getElementById("nachname").removeAttribute("disabled");
  document.getElementById("versteckterBtn").style.display = "block";
});
