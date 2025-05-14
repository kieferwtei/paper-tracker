// ✅ Login Users
const users = [
  { username: "wteistaff1", password: "wtei_2025!" },
  { username: "wteistaff2", password: "wtei_2025@" },
  { username: "wteiadmin", password: "wtei_2025#" }
];

// ✅ Get Elements
const form = document.getElementById('paperForm');
const tableBody = document.querySelector('#trackingTable tbody');
const currentUser = localStorage.getItem('currentUser');
const key = `trackerData_${currentUser}`;

// ✅ Login Function
function login(event) {
  event.preventDefault();
  const inputUser = document.querySelector('input[type="text"]').value;
  const inputPass = document.querySelector('input[type="password"]').value;

  const foundUser = users.find(u => u.username === inputUser && u.password === inputPass);

  if (foundUser) {
    localStorage.setItem('currentUser', foundUser.username);
    window.location.href = "paper-tracker.html";
  } else {
    alert("Invalid username or password.");
  }
}

// ✅ Logout Function
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = "index.html";
}

// ✅ Update Dashboard Count
function updateStatusCounts() {
  const data = JSON.parse(localStorage.getItem(key)) || [];
  const total = data.length;
  const received = data.filter(e => e.status === "Received").length;
  const inProcess = data.filter(e => e.status === "In Process").length;
  const completed = data.filter(e => e.status === "Completed").length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("receivedCount").textContent = received;
  document.getElementById("processCount").textContent = inProcess;
  document.getElementById("completedCount").textContent = completed;
}

// ✅ Load Saved Data
window.addEventListener('DOMContentLoaded', () => {
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser}`;

  const savedData = JSON.parse(localStorage.getItem(key)) || [];
  savedData.forEach((entry, index) => addRow(entry, index));
  updateStatusCounts();
});

// ✅ Form Submission
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const docName = document.getElementById('docName').value;
  const owner = document.getElementById('owner').value;
  const recipient = document.getElementById('recipient').value;
  const date = document.getElementById('date').value;
  const status = document.getElementById('status').value;
  const transmit = document.getElementById('transmit').value;

  const newEntry = { docName, owner, recipient, date, status, transmit };
  const currentData = JSON.parse(localStorage.getItem(key)) || [];
  currentData.push(newEntry);
  localStorage.setItem(key, JSON.stringify(currentData));

  addRow(newEntry, currentData.length - 1);
  updateStatusCounts();
  form.reset();
});

// ✅ Add a Row
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

// ✅ Export to CSV
function exportToCSV() {
  let csv = [];
  const rows = document.querySelectorAll("#trackingTable tr");
  rows.forEach(row => {
    const cols = row.querySelectorAll("td, th");
    const rowData = [];
    cols.forEach(col => rowData.push('"' + col.innerText + '"'));
    csv.push(rowData.join(","));
  });

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "paper-tracker.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ✅ Edit, Save, Delete

document.addEventListener("click", function (e) {
  const target = e.target;
  const row = target.closest("tr");
  const index = parseInt(target.dataset.index);

  const data = JSON.parse(localStorage.getItem(key)) || [];

  if (target.classList.contains("editBtn")) {
    for (let i = 0; i < 5; i++) row.children[i].setAttribute("contenteditable", "true");
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
      status: cells[4].innerText.trim(),
      transmit: cells[5].innerText.trim()
    };
    data[index] = updatedEntry;
    localStorage.setItem(key, JSON.stringify(data));
    for (let i = 0; i < 5; i++) row.children[i].removeAttribute("contenteditable");
    row.querySelector(".editBtn").style.display = "inline-block";
    row.querySelector(".saveBtn").style.display = "none";
    updateStatusCounts();
  }

  if (target.classList.contains("deleteBtn")) {
    if (confirm("Are you sure you want to delete this entry?")) {
      data.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(data));
      row.remove();
      updateStatusCounts();
    }
  }
});

// ✅ Filter
const filter = document.getElementById('statusFilter');
if (filter) {
  filter.addEventListener('change', function () {
    const selected = this.value.toLowerCase();
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
      const statusText = row.children[4].textContent.toLowerCase();
      row.style.display = (selected === "all" || statusText === selected) ? "" : "none";
    });
  });
}
function deleteAllData() {
  if (confirm("Are you sure you want to delete ALL your documents? Make sure you exported them first.")) {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const key = `trackerData_${currentUser}`;
      localStorage.removeItem(key);
    }
    // Clear table visually
    document.querySelector("#trackingTable tbody").innerHTML = "";
    // Reset dashboard counts
    document.getElementById("totalCount").textContent = 0;
    document.getElementById("receivedCount").textContent = 0;
    document.getElementById("processCount").textContent = 0;
    document.getElementById("completedCount").textContent = 0;
    alert("All documents have been deleted.");
  }
  function togglePassword() {
  const passwordField = document.getElementById("password");  // Get the password input
  const checkbox = document.querySelector("input[type='checkbox']");  // Get the checkbox

  // Toggle the password visibility
  if (checkbox.checked) {
    passwordField.type = "text";  // Show the password
  } else {
    passwordField.type = "password";  // Hide the password
  }
}

}
