
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

const COLLECTION = 'todos';

// GET /api/todos
async function getTodos(req, res) {
  try {
    const todos = await getDB()
      .collection(COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(todos);
  } catch (error) {
    console.error('Gagal mengambil tugas:', error.message);
    res.status(500).json({ message: 'Gagal mengambil daftar tugas' });
  }
}

// POST /api/todos
async function createTodo(req, res) {
  try {
    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({
        message: 'Judul tugas wajib diisi',
      });
    }

    const todo = {
      title,
      completed: false,
      createdAt: new Date(),
    };

    const result = await getDB()
      .collection(COLLECTION)
      .insertOne(todo);

    res.status(201).json({
      _id: result.insertedId,
      ...todo,
    });
  } catch (error) {
    console.error('Gagal menambahkan tugas:', error.message);
    res.status(500).json({ message: 'Gagal menambahkan tugas' });
  }
}

// PUT /api/todos/:id
async function updateTodo(req, res) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID tugas tidak valid' });
    }

    const { title, completed } = req.body;
    const updates = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          message: 'Judul tugas tidak boleh kosong',
        });
      }

      updates.title = title.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          message: 'Status completed harus berupa boolean',
        });
      }

      updates.completed = completed;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'Tidak ada perubahan yang dikirim',
      });
    }

    const result = await getDB()
      .collection(COLLECTION)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    const updatedTodo = await getDB()
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    res.json(updatedTodo);
  } catch (error) {
    console.error('Gagal mengubah tugas:', error.message);
    res.status(500).json({ message: 'Gagal mengubah tugas' });
  }
}

// DELETE /api/todos/:id
async function deleteTodo(req, res) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID tugas tidak valid' });
    }

    const result = await getDB()
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    res.json({ message: 'Tugas berhasil dihapus' });
  } catch (error) {
    console.error('Gagal menghapus tugas:', error.message);
    res.status(500).json({ message: 'Gagal menghapus tugas' });
  }
}

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};
