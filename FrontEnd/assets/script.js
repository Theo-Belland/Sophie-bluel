let allWorks = [];

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  const filters = document.querySelectorAll("#filters button");
  const formLogin = document.getElementById("login-form");
  const token = localStorage.getItem("token");
  const loginLink = document.querySelector("nav li:nth-child(3)");
  const filtersWrapper = document.querySelector("#filters");
  const editionBar = document.getElementById("edition-bar");
  const portfolioTitle = document.querySelector("#portfolio h2");
  const modal = document.getElementById("modal");
  const closeModal = document.querySelector(".close");
  const viewGallery = document.getElementById("modal-gallery-view");
  const viewAdd = document.getElementById("modal-add-view");
  const btnAddProject = document.getElementById("add-project-btn");
  const backBtn = document.getElementById("back-to-gallery");
  const formAddProject = document.getElementById("add-project-form");
  const imageInput = document.getElementById("image");
  const previewImage = document.getElementById("preview-image");
  const uploadIcon = document.querySelector(".upload-icon");
  const uploadButton = document.querySelector(".upload-button-style");
  const uploadInfo = document.querySelector(".upload-info");
  const btnBackToGallery = document.getElementById("back-to-gallery");

  async function reloadWorks() {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      const works = await response.json();
      allWorks = works;
      displayWorks(works);
    } catch (error) {
      console.error("Erreur lors du rechargement des projets :", error);
    }
  }

  function displayWorks(works) {

    if (!gallery) {
      return
    }

    gallery.innerHTML = "";
    
    if (works.length === 0) {
      gallery.textContent = "Aucun projet trouvé.";
      return;
    }

    works.forEach(work => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;
      const caption = document.createElement("figcaption");
      caption.textContent = work.title;

      figure.appendChild(img);
      figure.appendChild(caption);
      gallery.appendChild(figure);

    });
  }


  filters.forEach(button => {
    button.addEventListener("click", () => {
      const categoryId = parseInt(button.dataset.id);
      filters.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      if (categoryId === 0) {
        displayWorks(allWorks);
      } else {
        const filtered = allWorks.filter(work => work.categoryId === categoryId);
        displayWorks(filtered);
      }
    });
  });

  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.querySelector('input[name="username"]').value;
      const password = document.querySelector('input[name="password"]').value;

      try {
        const response = await fetch("http://localhost:5678/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error("Erreur lors de la connexion");

        const data = await response.json();
        localStorage.setItem("token", data.token);
        window.location.href = "index.html";
      } catch (error) {
        alert("Échec de la connexion : vérifiez vos identifiants");
        console.error(error);
      }
    });
  }

  if (token) {
    loginLink.textContent = "logout";
    loginLink.style.cursor = "pointer";
    loginLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.reload();
    });

    editionBar.classList.remove("hidden");
    if (filtersWrapper) filtersWrapper.style.display = "none";

    const editWrapper = document.createElement("div");
    editWrapper.classList.add("edit-wrapper");
    editWrapper.style.cursor = "pointer";

    const editIcon = document.createElement("i");
    editIcon.classList.add("fas", "fa-pen-to-square");
    const editText = document.createElement("span");
    editText.textContent = "modifier";

    editWrapper.appendChild(editIcon);
    editWrapper.appendChild(editText);
    portfolioTitle.appendChild(editWrapper);

    editWrapper.addEventListener("click", () => {
      modal.classList.remove("hidden");
      viewGallery.classList.remove("hidden");
      viewAdd.classList.add("hidden");
      loadModalGallery();
    });

    closeModal.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });

    btnAddProject.addEventListener("click", () => {
      modal.classList.remove("hidden");
      viewGallery.classList.add("hidden");
      viewAdd.classList.remove("hidden");
      loadCategories();
    });

    backBtn.addEventListener("click", () => {
      viewAdd.classList.add("hidden");
      viewGallery.classList.remove("hidden");
    });

    async function loadCategories() {
      try {
        const res = await fetch("http://localhost:5678/api/categories");
        const categories = await res.json();
        const select = document.getElementById("category-select");

        select.innerHTML = "<option value=''></option>";

        categories.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat.id;
          option.textContent = cat.name;
          select.appendChild(option);
        });
      } catch (err) {
        console.error("Erreur lors du chargement des catégories :", err);
      }
    }

    formAddProject.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const formData = new FormData(formAddProject);

      try {
        const res = await fetch("http://localhost:5678/api/works", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (res.ok) {
          alert("Projet ajouté !");
          formAddProject.reset();
          viewAdd.classList.add("hidden");
          viewGallery.classList.remove("hidden");

          // Réinitialiser l’aperçu image
          previewImage.src = "";
          previewImage.style.display = "none";
          uploadIcon.style.display = "block";
          uploadButton.style.display = "block";
          uploadInfo.style.display = "block";

          await loadModalGallery();
          await reloadWorks();
        } else {
          alert("Erreur lors de l'ajout du projet");
        }
      } catch (err) {
        console.error("Erreur réseau", err);
        alert("Erreur réseau");
      }
    });

    async function loadModalGallery() {
      const res = await fetch("http://localhost:5678/api/works");
      const works = await res.json();
      const modalGallery = document.getElementById("modal-gallery");

      modalGallery.innerHTML = "";

      works.forEach((work) => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fas", "fa-trash-can", "delete-icon");
        deleteIcon.addEventListener("click", () => deleteWork(work.id));

        figure.appendChild(img);
        figure.appendChild(deleteIcon);
        modalGallery.appendChild(figure);
      });
    }

    async function deleteWork(id) {
      try {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          await loadModalGallery();
          await reloadWorks();
        } else {
          alert("Erreur lors de la suppression");
        }
      } catch (error) {
        alert("Erreur Réseau");
        console.error(error);
      }
    }
  }
  if(imageInput){
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
        uploadIcon.style.display = 'none';
        uploadButton.style.display = 'none';
        uploadInfo.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
    

  btnBackToGallery.addEventListener("click", () => {
    viewAdd.classList.add("hidden");

    viewGallery.classList.remove("hiddend");
      previewImage.src = "";
      previewImage.style.display = "none";
      uploadIcon.style.display = "block";
      uploadButton.style.display = "block";
      uploadInfo.style.display = "block";

      formAddProject.reset();

  }) 
  });
}
  reloadWorks();
});
