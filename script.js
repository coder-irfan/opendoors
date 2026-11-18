const entries = [];
let editingId = null;

const portfolioTables = document.querySelector("#portfolioTables");
const template = document.querySelector("#portfolioTableTemplate");
const navLinks = document.querySelectorAll("[data-view]");
const portfolioView = document.querySelector("#portfolioView");
const formView = document.querySelector("#formView");
const pageTitle = document.querySelector("#pageTitle");
const entryForm = document.querySelector("#entryForm");
const entryManager = document.querySelector("#entryManager");
const saveButton = document.querySelector("#saveButton");
const cancelEdit = document.querySelector("#cancelEdit");
const statusInput = document.querySelector("#status");
const statusHelp = document.querySelector("#statusHelp");
const accountName = document.querySelector("#accountName");

function textCell(value) {
  const cell = document.createElement("td");
  String(value ?? "").split("|").forEach((part, index) => {
    if (index) cell.appendChild(document.createElement("br"));
    cell.append(document.createTextNode(part));
  });
  return cell;
}

function renderPortfolioEntry(entry) {
  const fragment = template.content.cloneNode(true);
  const row = fragment.querySelector("tbody tr");
  const subject = document.createElement("td");
  subject.textContent = entry.subject;
  row.append(
    subject,
    textCell(entry.education),
    textCell(entry.motivation),
    textCell(entry.entryTest),
    textCell(entry.firstStage),
  );

  const statusCell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = entry.admitted ? "status-admitted" : "status-badge";
  badge.textContent = entry.admitted
    ? "Admitted to the second stage"
    : "Not admitted to the second stage";
  statusCell.append(badge);
  row.append(statusCell);
  portfolioTables.append(fragment);
}

function renderPortfolio() {
  portfolioTables.replaceChildren();
  entries.forEach(renderPortfolioEntry);
}

function renderEntryManager() {
  entryManager.replaceChildren();
  if (!entries.length) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-entries";
    emptyMessage.textContent = "No saved tables yet.";
    entryManager.append(emptyMessage);
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement("article");
    item.className = "saved-entry";
    const title = document.createElement("span");
    title.className = "saved-entry-title";
    title.textContent = `Table ${index + 1}: ${entry.subject}`;
    const actions = document.createElement("div");
    actions.className = "saved-entry-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.dataset.action = "edit";
    editButton.dataset.id = entry.id;
    editButton.textContent = "Edit";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-entry";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = entry.id;
    deleteButton.textContent = "Delete";

    actions.append(editButton, deleteButton);
    item.append(title, actions);
    entryManager.append(item);
  });
}

function showView(viewName) {
  const showPortfolio = viewName === "portfolio";
  portfolioView.classList.toggle("hidden", !showPortfolio);
  formView.classList.toggle("hidden", showPortfolio);
  pageTitle.textContent = showPortfolio ? "Portfolio" : "Form";
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.view === viewName));
  window.location.hash = viewName;
}

function updateStatusCopy() {
  statusHelp.textContent = statusInput.checked ? "Admitted to the second stage" : "Not admitted to the second stage";
  statusHelp.classList.toggle("is-admitted", statusInput.checked);
}

function resetForm() {
  editingId = null;
  entryForm.reset();
  saveButton.textContent = "Save";
  cancelEdit.classList.add("hidden");
  updateStatusCopy();
}

function startEdit(id) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;
  editingId = id;
  entryForm.elements.personName.value = entry.personName;
  entryForm.elements.subject.value = entry.subject;
  entryForm.elements.education.value = entry.education;
  entryForm.elements.motivation.value = entry.motivation;
  entryForm.elements.entryTest.value = entry.entryTest;
  entryForm.elements.firstStage.value = entry.firstStage;
  statusInput.checked = entry.admitted;
  saveButton.textContent = "Save changes";
  cancelEdit.classList.remove("hidden");
  updateStatusCopy();
  entryForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

navLinks.forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  showView(link.dataset.view);
}));

statusInput.addEventListener("change", updateStatusCopy);
cancelEdit.addEventListener("click", resetForm);

entryManager.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "edit") startEdit(id);
  if (action === "delete") {
    const entryIndex = entries.findIndex((entry) => entry.id === id);
    if (entryIndex === -1) return;
    entries.splice(entryIndex, 1);
    if (editingId === id) resetForm();
    renderPortfolio();
    renderEntryManager();
  }
});

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(entryForm);
  const entry = {
    personName: form.get("personName").trim(),
    subject: form.get("subject").trim(),
    education: form.get("education").trim(),
    motivation: form.get("motivation").trim(),
    entryTest: form.get("entryTest").trim(),
    firstStage: form.get("firstStage").trim(),
    admitted: statusInput.checked,
  };

  if (editingId) {
    const entryIndex = entries.findIndex((item) => item.id === editingId);
    if (entryIndex !== -1) entries[entryIndex] = { ...entry, id: editingId };
  } else {
    entries.push({ ...entry, id: `${Date.now()}-${Math.random()}` });
  }

  accountName.textContent = entry.personName;
  renderPortfolio();
  renderEntryManager();
  resetForm();
  showView("portfolio");
});

updateStatusCopy();
renderPortfolio();
renderEntryManager();
if (window.location.hash === "#form") showView("form");
