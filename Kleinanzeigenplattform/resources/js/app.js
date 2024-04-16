function enableInputs() {
  document.getElementById("profileImage").disabled = false;
  document.getElementById("email").disabled = false;
  document.getElementById("vorname").disabled = false;
  document.getElementById("nachname").disabled = false;
  document.getElementById("changeDataBtn").classList.add("d-none");
  document.getElementById("cancelBtn").classList.remove("d-none");
  document.getElementById("doChangeBtn").classList.remove("d-none");
}

function disableInputs() {
  document.getElementById("profileImage").disabled = true;
  document.getElementById("email").disabled = true;
  document.getElementById("vorname").disabled = true;
  document.getElementById("nachname").disabled = true;
  document.getElementById("changeDataBtn").classList.remove("d-none");
  document.getElementById("cancelBtn").classList.add("d-none");
  document.getElementById("doChangeBtn").classList.add("d-none");
}

function previewImages() {
  let preview = document.getElementById('image-preview');
  let files = document.getElementById('imageID').files;

  preview.innerHTML = '';

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let reader = new FileReader();

    reader.onload = function (event) {
      let imageContainer = document.createElement('div');
      imageContainer.setAttribute('class', 'd-flex flex-column justify-content-start mt-2 me-2');

      let image = document.createElement('img');
      image.setAttribute('src', event.target.result);
      image.setAttribute('class', 'imageRatioSmall');

      let closeButton = document.createElement('button');
      closeButton.setAttribute('class', 'btn btn-danger btn-sm mt-2');
      closeButton.setAttribute('type', 'button');
      closeButton.innerText = 'Entfernen';
      closeButton.addEventListener('click', function () {
        preview.removeChild(imageContainer);
        if (preview.childElementCount === 0) {
          preview.classList.remove('overflow-scroll');
        }
      });

      imageContainer.appendChild(image);
      imageContainer.appendChild(closeButton);
      preview.appendChild(imageContainer);
    }

    reader.readAsDataURL(file);
  }

  if (files.length > 0) {
    preview.classList.add('overflow-scroll');
  }
}
