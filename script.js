let employees = [];
let financeData = JSON.parse(localStorage.getItem("financeData")) || {};
let currentMonth = "";
let chart;

// Initialize month dropdown
function populateMonths() {
  const monthSelect = document.getElementById("monthSelect");
  monthSelect.innerHTML = "";
  Object.keys(financeData).forEach(month => {
    const opt = document.createElement("option");
    opt.value = month;
    opt.textContent = month;
    monthSelect.appendChild(opt);
  });
}

// Create new month
function createNewMonth() {
  const month = prompt("Enter month name (e.g., November-2025):");
  if (!month) return;
  if (!financeData[month]) {
    financeData[month] = {
      employees: [],
      attendance: {},
      income: 0,
      expenses: 0
    };
  }
  currentMonth = month;
  localStorage.setItem("financeData", JSON.stringify(financeData));
  populateMonths();
  document.getElementById("monthSelect").value = month;
  loadMonth(month);
}

// Load month data
document.getElementById("monthSelect").addEventListener("change", e => {
  currentMonth = e.target.value;
  loadMonth(currentMonth);
});

function loadMonth(month) {
  if (!financeData[month]) return;
  employees = financeData[month].employees || [];
  document.getElementById("income").value = financeData[month].income || "";
  document.getElementById("expenses").value = financeData[month].expenses || "";
  updateEmployeeTable();
  updateAttendanceTable();
}

// Add Employee
function addEmployee() {
  const name = document.getElementById("empName").value.trim();
  const dept = document.getElementById("empDept").value.trim();
  const salary = Number(document.getElementById("empSalary").value);
  if (!name || !dept || !salary) return alert("Please fill all fields!");

  employees.push({ name, dept, salary });
  saveMonth();
  updateEmployeeTable();

  document.getElementById("empName").value = "";
  document.getElementById("empDept").value = "";
  document.getElementById("empSalary").value = "";
}

// Save month to localStorage
function saveMonth() {
  if (!currentMonth) return;
  if (!financeData[currentMonth]) financeData[currentMonth] = {};
  financeData[currentMonth].employees = employees;
  financeData[currentMonth].income = Number(document.getElementById("income").value) || 0;
  financeData[currentMonth].expenses = Number(document.getElementById("expenses").value) || 0;
  localStorage.setItem("financeData", JSON.stringify(financeData));
}

// Update Employee Table
function updateEmployeeTable() {
  const tbody = document.querySelector("#employeeTable tbody");
  tbody.innerHTML = "";
  employees.forEach(emp => {
    const attData = financeData[currentMonth]?.attendance || {};
    const presentDays = Object.values(attData).filter(a => a[emp.name] === "Present").length;
    const totalDays = Object.keys(attData).length;
    const percent = totalDays ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    const row = `
      <tr>
        <td>${emp.name}</td>
        <td>${emp.dept}</td>
        <td>${emp.salary}</td>
        <td>${percent}%</td>
        <td><button onclick="removeEmployee('${emp.name}')">🗑️</button></td>
      </tr>`;
    tbody.innerHTML += row;
  });

  document.getElementById("totalEmp").innerText = employees.length;
  document.getElementById("totalSalary").innerText = employees.reduce((s, e) => s + e.salary, 0);
  saveMonth();
}

// Remove Employee
function removeEmployee(name) {
  employees = employees.filter(e => e.name !== name);
  saveMonth();
  updateEmployeeTable();
}

// Mark Attendance
function markAttendance() {
  if (!currentMonth) return alert("Select a month first!");
  const date = document.getElementById("attDate").value;
  if (!date) return alert("Select a date!");

  if (!financeData[currentMonth].attendance[date]) financeData[currentMonth].attendance[date] = {};

  employees.forEach(emp => {
    const status = confirm(`Is ${emp.name} Present on ${date}? (OK = Present, Cancel = Absent)`);
    financeData[currentMonth].attendance[date][emp.name] = status ? "Present" : "Absent";
  });

  localStorage.setItem("financeData", JSON.stringify(financeData));
  updateEmployeeTable();
  updateAttendanceTable();
}

// Attendance Table
function updateAttendanceTable() {
  const tbody = document.querySelector("#attendanceTable tbody");
  tbody.innerHTML = "";
  const attData = financeData[currentMonth]?.attendance || {};
  Object.keys(attData).forEach(date => {
    Object.entries(attData[date]).forEach(([emp, status]) => {
      tbody.innerHTML += `<tr><td>${date}</td><td>${emp}</td><td>${status}</td></tr>`;
    });
  });
}

// Calculate Profit and Chart
function calculateProfit() {
  const income = Number(document.getElementById("income").value);
  const expenses = Number(document.getElementById("expenses").value);
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
  const totalExpenses = totalSalary + expenses;
  const profit = income - totalExpenses;

  document.getElementById("netProfit").innerText = `₹${profit.toLocaleString()}`;

  const ctx = document.getElementById("financeChart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Income", "Expenses", "Salary", "Net Profit"],
      datasets: [{
        data: [income, expenses, totalSalary, profit],
        backgroundColor: ["#0078d7", "#ffc107", "#17a2b8", profit >= 0 ? "#28a745" : "#dc3545"]
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  saveMonth();
}

// Initialize
populateMonths();
