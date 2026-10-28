const API_URL = import.meta.env.VITE_API_URL;

export async function getTodos() {
  const response = await fetch(`${API_URL}/todos`);
  if (!response.ok) throw new Error('Gagal mengambil tugas');
  return response.json();
}

export async function createTodo(title) {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) throw new Error('Gagal menambahkan tugas');
  return response.json();
}

export async function updateTodo(id, changes) {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });

  if (!response.ok) throw new Error('Gagal mengubah tugas');
  return response.json();
}

export async function deleteTodo(id) {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Gagal menghapus tugas');
  return response.json();
}