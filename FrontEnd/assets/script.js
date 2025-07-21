let allWorks = [];

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
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';

  if (works.length === 0) {
    gallery.textContent = 'Aucun projet trouvé.';
    return;
  }

  works.forEach(work => {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = work.imageUrl;
    img.alt = work.title;
    const caption = document.createElement('figcaption');
    caption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(caption);
    gallery.appendChild(figure);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelectorAll('#filters button');

  reloadWorks();

  filters.forEach(button => {
    button.addEventListener('click', () => {
      const categoryId = parseInt(button.dataset.id);
      filters.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      if (categoryId === 0) {
        displayWorks(allWorks);
      } else {
        const filtered = allWorks.filter(work => work.categoryId === categoryId);
        displayWorks(filtered);
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
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
});

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const loginLink = document.querySelector("nav li:nth-child(3)");
  const filters = document.querySelector("#filters");
  const editionBar = document.getElementById("edition-bar");
  const portfolioTitle = document.querySelector("#portfolio h2");

  if (token) {
    loginLink.textContent = "logout";
    loginLink.style.cursor = "pointer";
    loginLink.addEventListener("click", function () {
      localStorage.removeItem("token");
      window.location.reload();
    });

    editionBar.classList.remove("hidden");
    if (filters) filters.style.display = "none";

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

    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");

    editWrapper.addEventListener("click", () => {
      modal.classList.remove("hidden");
      loadModalGallery();
    });

    closeModal.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
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
});

document.addEventListener("DOMContentLoaded", () => {
  const btnAddProject = document.getElementById("add-project-btn");
  const backBtn = document.getElementById("back-to-gallery");
  const viewGallery = document.getElementById("modal-gallery-view");
  const viewAdd = document.getElementById("modal-add-view");
  const form = document.getElementById("add-project-form");

  // Navigation entre vues
  if (btnAddProject && backBtn) {
    btnAddProject.addEventListener("click", () => {
      viewGallery.classList.add("hidden");
      viewAdd.classList.remove("hidden");
      loadCategories();
    });

    backBtn.addEventListener("click", () => {
      viewAdd.classList.add("hidden");
      viewGallery.classList.remove("hidden");
    });
  }

  // Charger les catégories
  async function loadCategories() {
    try {
      const res = await fetch("http://localhost:5678/api/categories");
      const categories = await res.json();
      const select = document.getElementById("category-select");

      select.innerHTML = "";

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

  // Soumission du formulaire
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Non autorisé");
      return;
    }

    const formData = new FormData(form);

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
        form.reset();
        viewAdd.classList.add("hidden");
        viewGallery.classList.remove("hidden");
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
});

document.addEventListener('DOMContentLoaded', () => {
  const btnAddProject = document.getElementById('add-project-btn');
  const galleryView = document.querySelector('.modal-content'); // ou ton conteneur de vue 1
  const addProjectView = document.getElementById('modal-add-view');
  const backBtn = document.getElementById('back-to-gallery');

  btnAddProject.addEventListener('click', () => {
    galleryView.style.display = 'none';
    addProjectView.classList.add('visible');
  });

  backBtn.addEventListener('click', () => {
    addProjectView.classList.remove('visible');
    galleryView.style.display = 'block';
  });
});
