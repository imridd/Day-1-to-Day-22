const URL = "http://localhost:3001/users";

export async function getUsers() {
  const response = await fetch(URL);
  return response.json();
}

export async function addUser(user) {
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  return response.json();
}

export async function updateUser(id, user) {
  const response = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  return response.json();
}

export async function deleteUser(id) {
  await fetch(`${URL}/${id}`, {
    method: "DELETE"
  });
}