function enableInputs() {
  document.getElementById("profile_picture").disabled = false;
  document.getElementById("email").disabled = false;
  document.getElementById("firstname").disabled = false;
  document.getElementById("lastname").disabled = false;
  document.getElementById("changeDataBtn").classList.add("d-none");
  document.getElementById("cancelBtn").classList.remove("d-none");
  document.getElementById("doChangeBtn").classList.remove("d-none");
  document.getElementById("passwordBtn").classList.remove("d-none");
}

function disableInputs() {
  document.getElementById("profile_picture").disabled = true;
  document.getElementById("email").disabled = true;
  document.getElementById("firstname").disabled = true;
  document.getElementById("lastname").disabled = true;
  document.getElementById("changeDataBtn").classList.remove("d-none");
  document.getElementById("cancelBtn").classList.add("d-none");
  document.getElementById("doChangeBtn").classList.add("d-none");
  document.getElementById("passwordBtn").classList.add("d-none");
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
