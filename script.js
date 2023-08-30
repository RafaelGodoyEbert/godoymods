var currentTab = "home";

function openTab(evt, tabName) {
  var i, tabContent, tabButtons;

  tabContent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  tabButtons = document.getElementsByClassName("tab-button");
  for (i = 0; i < tabButtons.length; i++) {
    tabButtons[i].classList.remove("active");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");

  currentTab = tabName;

  var filterIcon = document.querySelector(".filter-icon");
  if (currentTab === "home") {
    filterIcon.style.display = "none";
  } else {
    filterIcon.style.display = "block";
  }
}

function toggleFilterButtons() {
  var filterButtons = document.querySelector(".filter-buttons");
  filterButtons.classList.toggle("show");
}

function closeFilterButtons() {
  var filterButtons = document.querySelector(".filter-buttons");
  filterButtons.classList.remove("show");
}

function filterProjects(tag) {
  var projects = document.querySelectorAll(".project-box");

  projects.forEach(function(project) {
    var tagsElement = project.querySelector(".project-tags");
    if (tagsElement) {
      var tags = tagsElement.getAttribute("data-tags").split(",");
      var shouldShow = tags.includes(tag) || tag === "all";
      project.style.display = shouldShow ? "block" : "none";
    }
  });

  var filterButtons = document.querySelector(".filter-buttons");
  filterButtons.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("home").style.display = "block";
  var filterIcon = document.querySelector(".filter-icon");
  filterIcon.style.display = "none";

  // Event listener para fechar filtro ao clicar fora
  document.addEventListener("click", function(event) {
    if (!event.target.closest(".filter-icon") && !event.target.closest(".filter-buttons")) {
      closeFilterButtons();
    }
  });
});

function showTab(tabId) {
  var tabs = document.querySelectorAll(".tab-content");
  tabs.forEach(function(tab) {
    tab.style.display = "none";
  });

  var tabToShow = document.getElementById(tabId);
  tabToShow.style.display = "block";

  if (tabId === "home") {
    document.querySelectorAll(".filter-button").forEach(function(button) {
      button.classList.remove("active");
    });

    // Use setTimeout para aguardar um breve instante antes de chamar filterProjects('all')
    setTimeout(function() {
      filterProjects('all'); // Redefine o filtro
    }, 0);
  }
}

