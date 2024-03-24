document.getElementById('zeigeRegistrierungForm').addEventListener('click', function(event) {
  event.preventDefault();
  document.getElementById('anmeldungForm').style.display = 'none';
  document.getElementById('registrierungForm').style.display = 'block';

  document.getElementById('textRegistrierung').classList.add("d-block");
  document.getElementById('textAnmeldung').classList.add("d-none");

  document.getElementById('textRegistrierung').classList.remove("d-none");
  document.getElementById('textAnmeldung').classList.remove("d-block");
});

document.getElementById('zeigeAnmeldungForm').addEventListener('click', function(event) {
  event.preventDefault();
  document.getElementById('registrierungForm').style.display = 'none';
  document.getElementById('anmeldungForm').style.display = 'block';

  document.getElementById('textAnmeldung').classList.add("d-block");
  document.getElementById('textRegistrierung').classList.add("d-none");

  document.getElementById('textAnmeldung').classList.remove("d-none");
  document.getElementById('textRegistrierung').classList.remove("d-block");
});
