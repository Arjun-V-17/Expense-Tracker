const categories = {
    Shopping: { icon: "🛍️", color: "#bbe1fa" },
    Food: { icon: "🍽️", color: "#3282b8" },
    Bills: { icon: "📄", color: "#0f4c75" },
    Transport: { icon: "🚗", color: "#1b262c" },
    Health: { icon: "💊", color: "#7fb5d8" },
    Entertainment: { icon: "🎬", color: "#5c98c3" },
    Other: { icon: "💰", color: "#d7eefc" }
};

function createId() {
    return Date.now() + "-" + Math.random().toString(16).slice(2);
}

let transactions = [
    {
        id: createId(),
        description: "Grocery run",
        category: "Food",
        type: "expense",
        amount: 845,
        date: "2026-06-12"
    },
    {
        id: createId(),
        description: "New shoes",
        category: "Shopping",
        type: "expense",
        amount: 1100,
        date: "2026-06-11"
    },
    {
        id: createId(),
        description: "Metro pass",
        category: "Transport",
        type: "expense",
        amount: 320,
        date: "2026-06-10"
    },
    {
        id: createId(),
        description: "Electricity bill",
        category: "Bills",
        type: "expense",
        amount: 684,
        date: "2026-06-08"
    },
    {
        id: createId(),
        description: "Freelance project",
        category: "Other",
        type: "income",
        amount: 5000,
        date: "2026-06-07"
    },
    {
        id: createId(),
        description: "Netflix subscription",
        category: "Entertainment",
        type: "expense",
        amount: 199,
        date: "2026-06-05"
    },
    {
        id: createId(),
        description: "Monthly salary",
        category: "Other",
        type: "income",
        amount: 35000,
        date: "2026-06-01"
    },
    {
        id: createId(),
        description: "Pharmacy",
        category: "Health",
        type: "expense",
        amount: 299,
        date: "2026-06-03"
    }
];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
});

const balanceTotal = document.getElementById("balanceTotal");
const incomeTotal = document.getElementById("incomeTotal");
const expenseTotal = document.getElementById("expenseTotal");

const donutChart = document.getElementById("donutChart");
const categoryList = document.getElementById("categoryList");
const transactionList = document.getElementById("transactionList");

const categoryFilter = document.getElementById("categoryFilter");
const typeFilter = document.getElementById("typeFilter");

const transactionForm = document.getElementById("transactionForm");
const transactionModalElement = document.getElementById("transactionModal");
const openTransactionModal = document.getElementById("openTransactionModal");

const categoryInput = document.getElementById("categoryInput");
const dateInput = document.getElementById("dateInput");
const descriptionInput = document.getElementById("descriptionInput");
const amountInput = document.getElementById("amountInput");
const typeInput = document.getElementById("typeInput");

const transactionModal = window.bootstrap
    ? bootstrap.Modal.getOrCreateInstance(transactionModalElement)
    : {
          show() {
              transactionModalElement.classList.add("show");
              transactionModalElement.style.display = "block";
          },

          hide() {
              transactionModalElement.classList.remove("show");
              transactionModalElement.style.display = "none";
          }
      };

function formatDate(date) {
    return dateFormatter.format(new Date(date + "T00:00:00Z"));
}

function formatAmount(txn) {
    const sign = txn.type === "income" ? "+" : "-";
    return sign + currencyFormatter.format(txn.amount);
}

function loadCategories() {
    for (const category in categories) {
        categoryFilter.add(new Option(category, category));
        categoryInput.add(new Option(category, category));
    }
}

function calculateTotals() {
    let income = 0;
    let expense = 0;

    for (const txn of transactions) {
        if (txn.type === "income") {
            income += txn.amount;
        } else {
            expense += txn.amount;
        }
    }

    return { income, expense };
}

function updateSummary() {
    const totals = calculateTotals();

    balanceTotal.textContent = currencyFormatter.format(
        totals.income - totals.expense
    );

    incomeTotal.textContent = currencyFormatter.format(totals.income);
    expenseTotal.textContent = currencyFormatter.format(totals.expense);
}

function buildExpenseBreakdown() {
    const breakdown = {};

    for (const txn of transactions) {
        if (txn.type !== "expense") continue;

        if (!breakdown[txn.category]) {
            breakdown[txn.category] = 0;
        }

        breakdown[txn.category] += txn.amount;
    }

    return breakdown;
}

function renderDonutChart() {
    const breakdown = buildExpenseBreakdown();

    const entries = Object.entries(breakdown);
    entries.sort((a, b) => b[1] - a[1]);

    let totalExpense = 0;

    for (const item of entries) {
        totalExpense += item[1];
    }

    if (totalExpense === 0) {
        donutChart.style.background = "#bbe1fa";
        categoryList.innerHTML =
            '<p class="empty-state">No expenses yet.</p>';
        return;
    }

    let currentAngle = 0;
    const slices = [];

    for (const [category, amount] of entries) {
        const start = currentAngle;
        const angle = (amount / totalExpense) * 360;

        currentAngle += angle;

        slices.push(
            `${categories[category].color} ${start}deg ${currentAngle}deg`
        );
    }

    donutChart.style.background =
        `conic-gradient(${slices.join(", ")})`;

    let html = "";

    for (const [category, amount] of entries) {
        html += `
            <div class="category-item">
                <span class="dot"
                    style="background:${categories[category].color}">
                </span>

                <span class="category-name">
                    ${categories[category].icon} ${category}
                </span>

                <span>${currencyFormatter.format(amount)}</span>
            </div>
        `;
    }

    categoryList.innerHTML = html;
}

function getFilteredTransactions() {
    const selectedCategory = categoryFilter.value;
    const selectedType = typeFilter.value;

    const result = [];

    for (const txn of transactions) {
        if (
            selectedCategory !== "all" &&
            txn.category !== selectedCategory
        ) {
            continue;
        }

        if (
            selectedType !== "all" &&
            txn.type !== selectedType
        ) {
            continue;
        }

        result.push(txn);
    }

    result.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    return result;
}

function renderTransactions() {
    const filtered = getFilteredTransactions();

    if (filtered.length === 0) {
        transactionList.innerHTML =
            '<p class="empty-state">No transactions match these filters.</p>';
        return;
    }

    let html = "";

    for (const txn of filtered) {
        const cat = categories[txn.category];

        html += `
            <article class="transaction-row">
                <span
                    class="transaction-icon"
                    style="background:${cat.color}33"
                >
                    ${cat.icon}
                </span>

                <div>
                    <h3 class="transaction-title">
                        ${txn.description}
                    </h3>

                    <p class="transaction-meta">
                        ${txn.category} • ${formatDate(txn.date)}
                    </p>
                </div>

                <strong class="amount ${
                    txn.type === "income" ? "income" : ""
                }">
                    ${formatAmount(txn)}
                </strong>
            </article>
        `;
    }

    transactionList.innerHTML = html;
}

function renderAll() {
    updateSummary();
    renderDonutChart();
    renderTransactions();
}

transactionModalElement.addEventListener("shown.bs.modal", () => {
    dateInput.valueAsDate = new Date();
    descriptionInput.focus();
});

openTransactionModal.addEventListener("click", () => {
    if (!window.bootstrap) {
        transactionModal.show();
        dateInput.valueAsDate = new Date();
        descriptionInput.focus();
    }
});

transactionModalElement.addEventListener("click", (e) => {
    if (
        !window.bootstrap &&
        e.target.matches("[data-bs-dismiss='modal'], .btn-close")
    ) {
        transactionModal.hide();
    }
});

transactionForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;

    if (!description || amount <= 0 || !dateInput.value) {
        return;
    }

    // --- Insufficient Funds Check Implementation ---
    if (type === "expense") {
        const totals = calculateTotals();
        const currentBalance = totals.income - totals.expense;

        if (amount > currentBalance) {
            alert(`⚠️ Insufficient Funds!\nYour remaining balance is ${currencyFormatter.format(currentBalance)}. You cannot spend ${currencyFormatter.format(amount)}.`);
            return; // Stops submission right here
        }
    }
    // ------------------------------------------------

    const newTransaction = {
        id: createId(),
        description: description,
        amount: amount,
        type: type,
        category: categoryInput.value,
        date: dateInput.value
    };

    transactions.unshift(newTransaction);

    transactionForm.reset();
    transactionModal.hide();

    renderAll();
});

categoryFilter.addEventListener("change", renderTransactions);
typeFilter.addEventListener("change", renderTransactions);

loadCategories();
renderAll();
