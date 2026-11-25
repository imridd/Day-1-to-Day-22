const btnList = document.querySelector("#btnList");
const btnSearch = document.querySelector("#btnSearch");
const btnCancel = document.querySelector("#btnCancel");
const searchInput = document.querySelector("#searchInput");
const tableBody = document.querySelector("#tableBody");
const tableContainer = document.querySelector("#tableContainer");
let controller;
let users = [];
const displayUsers = users => {
    tableBody.innerHTML = "";
    users.forEach(user => {
        tableBody.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
            </tr>
        `;

    });
    tableContainer.classList.remove("d-none");
};
const listUsers = async () => {
    try {
        controller = new AbortController();
        const timer = setTimeout(() => {
            controller.abort();

            tableBody.innerHTML = "";

            tableContainer.classList.add("d-none");

            alert("Request Cancelled After 2 Seconds");

        }, 2000);

        const response = await fetch(
            "https://jsonplaceholder.typicode.com/users",
            {
                signal: controller.signal
            }
        );

        clearTimeout(timer);

        const data = await response.json();

        users = [];
        for (let i = 0; i < 3; i++) {

            data.forEach(user => {

                users.push({
                    ...user,
                    id: users.length + 1
                });

            });

        }

        displayUsers(users);

    }
    catch (error) {

        if (error.name === "AbortError") {

            tableBody.innerHTML = "";

            tableContainer.classList.add("d-none");

        }
        else {

            console.log(error);

        }

    }

};
const searchUser = () => {
    const searchText =
    searchInput.value
    .trim()
    .toLowerCase();

    const filteredUsers =
    users.filter(user =>
        user.name
        .toLowerCase()
        .includes(searchText)
    );

    displayUsers(filteredUsers);

};

const cancelSearch = () => {

    if (controller) {

        controller.abort();

    }

    tableBody.innerHTML = "";

    tableContainer.classList.add("d-none");

    searchInput.value = "";

    alert("Search Cancelled");

};

btnList.addEventListener(
    "click",
    listUsers
);

btnSearch.addEventListener(
    "click",
    searchUser
);

btnCancel.addEventListener(
    "click",
    cancelSearch
);