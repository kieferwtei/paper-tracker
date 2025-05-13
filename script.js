const form = document.getElementById('paperForm');
const tableBody = document.querySelector('#trackingTable tbody');
const users = [
   { username: "wteistaff1", password: "wtei_2025!" },
  { username: "wteistaff2", password: "wtei_2025@" },
  { username: "wteiadmin", password: "wtei_2025#" }
];

function login(event) {
  event.preventDefault();

  const inputUser = document.querySelector('input[type="text"]').value;
  const inputPass = document.querySelector('input[type="password"]').value;

  const foundUser = users.find(u => u.username === inputUser && u.password === inputPass);

  if (foundUser) {
    localStorage.setItem('currentUser', foundUser.username); // Store for dashboard
    window.location.href = "paper-tracker.html"; // ✅ This should be the correct file
  } else {
    alert("Invalid username or password.");

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = "login-page.html"; // ✅ match your actual login file name
}

}

}
function updateStatusCounts() {
  const data = JSON.parse(localStorage.getItem('paperTracker')) || [];

  const total = data.length;
  const received = data.filter(e => e.status === "Received").length;
  const inProcess = data.filter(e => e.status === "In Process").length;
  const completed = data.filter(e => e.status === "Completed").length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("receivedCount").textContent = received;
  document.getElementById("processCount").textContent = inProcess;
  document.getElementById("completedCount").textContent = completed;
}


// Load saved data from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedData = JSON.parse(localStorage.getItem('paperTracker')) || [];
  savedData.forEach((entry, index) => addRow(entry, index));
  updateStatusCounts(); // ✅ refresh counts
});

window.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser}`;
  } else {
    // No session? Go back to login
    window.location.href = "login-page.html";
  }
});

// Handle form submission
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const docName = document.getElementById('docName').value;
  const owner = document.getElementById('owner').value;
  const recipient = document.getElementById('recipient').value;
  const date = document.getElementById('date').value;
  const status = document.getElementById('status').value;
  const transmit = document.getElementById('transmit').value; // ✅ moved here

  const newEntry = { docName, owner, recipient, date, status, transmit }; // ✅ included here
  const currentData = JSON.parse(localStorage.getItem('paperTracker')) || [];
  currentData.push(newEntry);
  localStorage.setItem('paperTracker', JSON.stringify(currentData));

  addRow(newEntry, currentData.length - 1);
  form.reset();
});

// Add a new row to the table
function addRow(entry, index) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${entry.docName}</td>
    <td>${entry.owner}</td>
    <td>${entry.recipient}</td>
    <td>${entry.date}</td>
    <td>${entry.status}</td>
    <td>${entry.transmit}</td>
    <td>
      <button class="editBtn" data-index="${index}">✏️ Edit</button>
      <button class="saveBtn" data-index="${index}" style="display:none;">💾 Save</button>
      <button class="deleteBtn" data-index="${index}">🗑️ Delete</button>
    </td>
  `;
  tableBody.appendChild(row);
}
function exportToCSV() {
  let csv = [];
  const rows = document.querySelectorAll("#trackingTable tr");

  rows.forEach(row => {
    const cols = row.querySelectorAll("td, th");
    const rowData = [];
    cols.forEach(col => rowData.push('"' + col.innerText + '"'));
    csv.push(rowData.join(","));
  });

  const csvBlob = new Blob([csv.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(csvBlob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "paper-tracker.csv";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Handle Edit, Save, and Delete actions
document.addEventListener("click", function (e) {
  const target = e.target;
  const row = target.closest("tr");
  const index = parseInt(target.dataset.index);

  if (target.classList.contains("editBtn")) {
    for (let i = 0; i < 5; i++) {
      row.children[i].setAttribute("contenteditable", "true");
    }
    row.querySelector(".editBtn").style.display = "none";
    row.querySelector(".saveBtn").style.display = "inline-block";
  }

  if (target.classList.contains("saveBtn")) {
    const cells = row.querySelectorAll("td");
    const updatedEntry = {
      docName: cells[0].innerText.trim(),
      owner: cells[1].innerText.trim(),
      recipient: cells[2].innerText.trim(),
      date: cells[3].innerText.trim(),
      status: cells[4].innerText.trim()
    };

    const savedData = JSON.parse(localStorage.getItem("paperTracker")) || [];
    savedData[index] = updatedEntry;
    localStorage.setItem("paperTracker", JSON.stringify(savedData));

    for (let i = 0; i < 5; i++) {
      row.children[i].removeAttribute("contenteditable");
    }
    row.querySelector(".editBtn").style.display = "inline-block";
    row.querySelector(".saveBtn").style.display = "none";
    alert("Entry saved!");
  }

  if (target.classList.contains("deleteBtn")) {
    if (confirm("Are you sure you want to delete this entry?")) {
      const savedData = JSON.parse(localStorage.getItem("paperTracker")) || [];
      savedData.splice(index, 1);
      localStorage.setItem("paperTracker", JSON.stringify(savedData));
      row.remove(); // remove the row from the table
updateStatusCounts(); // update the dashboard
    }
  }
});

// Filter by status
document.getElementById('statusFilter')?.addEventListener('change', function () {
  const selected = this.value.toLowerCase();
  const rows = tableBody.querySelectorAll('tr');

  rows.forEach(row => {
    const statusText = row.children[4].textContent.toLowerCase();
    row.style.display = (selected === "all" || statusText === selected) ? "" : "none";

    function updateDashboard() {
  const data = JSON.parse(localStorage.getItem("paperTracker")) || [];

  document.getElementById("totalCount").textContent = data.length;
  document.getElementById("receivedCount").textContent = data.filter(e => e.status === "Received").length;
  document.getElementById("processCount").textContent = data.filter(e => e.status === "In Process").length;
  document.getElementById("completedCount").textContent = data.filter(e => e.status === "Completed").length;
}
function togglePassword() {
  const passwordField = document.getElementById("password");
  if (passwordField) {
    passwordField.type = passwordField.type === "password" ? "text" : "password";
  }
}

  });
});

