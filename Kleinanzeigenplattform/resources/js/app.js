function enableInputs() {
  document.querySelectorAll(".input_visibility").forEach(attribute => attribute.disabled = false);
  document.querySelectorAll(".button_visibility").forEach(attribute => attribute.classList.remove("d-none"));
  document.getElementById("changeDataBtn").classList.add("d-none");
}

function disableInputs() {
  document.querySelectorAll(".input_visibility").forEach(attribute => attribute.disabled = true);
  document.querySelectorAll(".button_visibility").forEach(attribute => attribute.classList.add("d-none"));
  document.getElementById("changeDataBtn").classList.remove("d-none");
}

function sendWasLetztePreis() {
  let messageInput = document.querySelector('input[name="message"]');
  if (messageInput) {
    messageInput.value = "Was letzte Preis?";
    document.querySelector('form').submit();
  }
}

function scrollToBottom() {
  let chatBox = document.getElementById('chatBox');
  if(chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// Call scrollToBottom when the page loads or new messages are added
window.onload = scrollToBottom;

function previewImages() {
  let preview = document.getElementById('image-preview');
  let files = document.getElementById('imageInputId').files;

  preview.innerHTML = '';

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let reader = new FileReader();

    reader.onload = function (event) {
      let imageContainer = document.createElement('div');
      imageContainer.setAttribute('class', 'd-flex flex-column align-items-center mt-2 me-2');

      let image = document.createElement('img');
      image.setAttribute('src', event.target.result);
      image.setAttribute('class', 'd-block object-fit-cover profilePicture');
      imageContainer.appendChild(image);
      preview.appendChild(imageContainer);
    }

    reader.readAsDataURL(file);
  }
}
