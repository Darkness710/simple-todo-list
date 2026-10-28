
<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from './services/todoService'

const todos = ref([])
const title = ref('')
const search = ref('')
const filter = ref('all')

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const editingId = ref(null)

const isDark = ref(false)

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)

  localStorage.setItem(
    'todo-theme',
    isDark.value ? 'dark' : 'light',
  )
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

function loadTheme() {
  isDark.value = localStorage.getItem('todo-theme') === 'dark'
  applyTheme()
}

const filteredTodos = computed(() => {
  return todos.value.filter((todo) => {
    const matchesSearch = todo.title
      .toLowerCase()
      .includes(search.value.toLowerCase())

    const matchesFilter =
      filter.value === 'all' ||
      (filter.value === 'active' && !todo.completed) ||
      (filter.value === 'completed' && todo.completed)

    return matchesSearch && matchesFilter
  })
})

const remainingTodos = computed(() =>
  todos.value.filter((todo) => !todo.completed).length,
)

const completedTodos = computed(() =>
  todos.value.filter((todo) => todo.completed).length,
)

async function loadTodos() {
  loading.value = true
  error.value = ''

  try {
    todos.value = await getTodos()
  } catch (err) {
    error.value = err.message || 'Gagal mengambil daftar tugas.'
  } finally {
    loading.value = false
  }
}

async function submitTodo() {
  const trimmedTitle = title.value.trim()

  if (!trimmedTitle) {
    error.value = 'Judul tugas tidak boleh kosong.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    if (editingId.value) {
      const updated = await updateTodo(editingId.value, {
        title: trimmedTitle,
      })

      const index = todos.value.findIndex(
        (todo) => todo._id === editingId.value,
      )

      if (index !== -1) {
        todos.value[index] = updated
      }
    } else {
      const created = await createTodo(trimmedTitle)
      todos.value.unshift(created)
    }

    title.value = ''
    editingId.value = null
  } catch (err) {
    error.value = err.message || 'Gagal menyimpan tugas.'
  } finally {
    saving.value = false
  }
}

async function toggleTodo(todo) {
  error.value = ''

  try {
    const updated = await updateTodo(todo._id, {
      completed: !todo.completed,
    })

    const index = todos.value.findIndex(
      (item) => item._id === todo._id,
    )

    if (index !== -1) {
      todos.value[index] = updated
    }
  } catch (err) {
    error.value = err.message || 'Gagal mengubah status tugas.'
  }
}

function editTodo(todo) {
  editingId.value = todo._id
  title.value = todo.title

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

function cancelEdit() {
  editingId.value = null
  title.value = ''
  error.value = ''
}

async function removeTodo(id) {
  if (!window.confirm('Yakin ingin menghapus tugas ini?')) {
    return
  }

  error.value = ''

  try {
    await deleteTodo(id)
    todos.value = todos.value.filter((todo) => todo._id !== id)

    if (editingId.value === id) {
      cancelEdit()
    }
  } catch (err) {
    error.value = err.message || 'Gagal menghapus tugas.'
  }
}

onMounted(() => {
  loadTheme()
  loadTodos()
})
</script>

<template>
  <main
    class="min-h-screen bg-slate-100 px-4 py-8 text-slate-800 transition-colors duration-200
           dark:bg-slate-950 dark:text-slate-100 sm:px-6 sm:py-12"
  >
    <div class="mx-auto max-w-3xl">

      <!-- Header -->
      <header class="mb-8 flex items-center justify-between gap-4">
        <div>
          <p
            class="mb-1 text-sm font-semibold uppercase tracking-widest
                   text-indigo-600 dark:text-indigo-400"
          >
            Productivity
          </p>

          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
            To-Do List
          </h1>

          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Atur tugasmu, selesaikan satu per satu.
          </p>
        </div>

        <button
          type="button"
          @click="toggleTheme"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                 border border-slate-200 bg-white text-xl shadow-sm
                 transition hover:bg-slate-50
                 dark:border-slate-700 dark:bg-slate-800
                 dark:hover:bg-slate-700"
          :aria-label="isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
          :title="isDark ? 'Mode terang' : 'Mode gelap'"
        >
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </header>

      <!-- Statistik -->
      <section class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
                 dark:border-slate-800 dark:bg-slate-900"
        >
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Total Tugas
          </p>
          <p class="mt-2 text-3xl font-bold">
            {{ todos.length }}
          </p>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
                 dark:border-slate-800 dark:bg-slate-900"
        >
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Belum Selesai
          </p>
          <p class="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {{ remainingTodos }}
          </p>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
                 dark:border-slate-800 dark:bg-slate-900"
        >
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Selesai
          </p>
          <p class="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {{ completedTodos }}
          </p>
        </div>
      </section>

      <!-- Form Tambah / Edit -->
      <section
        class="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
               dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      >
        <h2 class="mb-4 text-lg font-semibold">
          {{ editingId ? 'Edit Tugas' : 'Tambah Tugas Baru' }}
        </h2>

        <form @submit.prevent="submitTodo" class="space-y-3">
          <label for="todo-title" class="sr-only">
            Judul tugas
          </label>

          <input
            id="todo-title"
            v-model="title"
            type="text"
            maxlength="200"
            placeholder="Contoh: Mengerjakan tugas kuliah..."
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3
                   text-slate-900 outline-none transition
                   placeholder:text-slate-400
                   focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                   dark:border-slate-700 dark:bg-slate-800
                   dark:text-slate-100 dark:placeholder:text-slate-500
                   dark:focus:border-indigo-400"
          />

          <div class="flex flex-wrap gap-2">
            <button
              type="submit"
              :disabled="saving"
              class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white
                     transition hover:bg-indigo-700 disabled:cursor-not-allowed
                     disabled:opacity-50"
            >
              {{
                saving
                  ? 'Menyimpan...'
                  : editingId
                    ? 'Simpan Perubahan'
                    : '+ Tambah Tugas'
              }}
            </button>

            <button
              v-if="editingId"
              type="button"
              @click="cancelEdit"
              class="rounded-xl border border-slate-300 px-5 py-3 font-semibold
                     text-slate-700 transition hover:bg-slate-100
                     dark:border-slate-700 dark:text-slate-300
                     dark:hover:bg-slate-800"
            >
              Batal
            </button>
          </div>
        </form>
      </section>

      <!-- Pesan Error -->
      <div
        v-if="error"
        role="alert"
        class="mb-6 flex items-start justify-between gap-3 rounded-xl
               border border-red-200 bg-red-50 p-4 text-sm text-red-700
               dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
      >
        <span>{{ error }}</span>

        <button
          type="button"
          @click="error = ''"
          class="shrink-0 font-bold"
          aria-label="Tutup pesan"
        >
          ✕
        </button>
      </div>

      <!-- Daftar Tugas -->
      <section
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
               dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      >
        <div
          class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center
                 sm:justify-between"
        >
          <h2 class="text-lg font-semibold">
            Daftar Tugas
          </h2>

          <span class="text-sm text-slate-500 dark:text-slate-400">
            {{ filteredTodos.length }} tugas ditampilkan
          </span>
        </div>

        <!-- Pencarian -->
        <label for="todo-search" class="sr-only">
          Cari tugas
        </label>

        <input
          id="todo-search"
          v-model="search"
          type="search"
          placeholder="Cari tugas..."
          class="mb-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3
                 text-slate-900 outline-none transition
                 placeholder:text-slate-400 focus:border-indigo-500
                 focus:ring-2 focus:ring-indigo-500/20
                 dark:border-slate-700 dark:bg-slate-800
                 dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        <!-- Filter -->
        <div class="mb-5 flex flex-wrap gap-2">
          <button
            v-for="option in [
              { value: 'all', label: 'Semua' },
              { value: 'active', label: 'Belum Selesai' },
              { value: 'completed', label: 'Selesai' },
            ]"
            :key="option.value"
            type="button"
            @click="filter = option.value"
            :class="[
              'rounded-lg px-4 py-2 text-sm font-medium transition',
              filter === option.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
            ]"
          >
            {{ option.label }}
          </button>
        </div>

        <!-- Loading -->
        <div
          v-if="loading"
          class="py-12 text-center text-slate-500 dark:text-slate-400"
        >
          Memuat daftar tugas...
        </div>

        <!-- Daftar Kosong -->
        <div
          v-else-if="filteredTodos.length === 0"
          class="rounded-xl border border-dashed border-slate-300 px-4 py-12
                 text-center dark:border-slate-700"
        >
          <div class="mb-3 text-4xl">📝</div>

          <p class="font-medium text-slate-700 dark:text-slate-200">
            {{
              todos.length === 0
                ? 'Belum ada tugas'
                : 'Tugas tidak ditemukan'
            }}
          </p>

          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{
              todos.length === 0
                ? 'Tambahkan tugas pertamamu menggunakan form di atas.'
                : 'Coba ubah kata pencarian atau filter.'
            }}
          </p>
        </div>

        <!-- Item Tugas -->
        <ul v-else class="divide-y divide-slate-200 dark:divide-slate-800">
          <li
            v-for="todo in filteredTodos"
            :key="todo._id"
            class="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
          >
            <input
              type="checkbox"
              :checked="todo.completed"
              @change="toggleTodo(todo)"
              :aria-label="`Tandai ${todo.title} sebagai ${todo.completed ? 'belum selesai' : 'selesai'}`"
              class="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-indigo-600"
            />

            <div class="min-w-0 flex-1">
              <p
                :class="[
                  'break-words font-medium',
                  todo.completed
                    ? 'text-slate-400 line-through dark:text-slate-500'
                    : 'text-slate-800 dark:text-slate-100',
                ]"
              >
                {{ todo.title }}
              </p>

              <p
                class="mt-1 text-xs text-slate-500 dark:text-slate-400"
              >
                {{ todo.completed ? 'Selesai' : 'Belum selesai' }}
              </p>
            </div>

            <div class="flex shrink-0 gap-2">
              <button
                type="button"
                @click="editTodo(todo)"
                class="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600
                       transition hover:bg-indigo-50
                       dark:text-indigo-400 dark:hover:bg-indigo-950/50"
              >
                Edit
              </button>

              <button
                type="button"
                @click="removeTodo(todo._id)"
                class="rounded-lg px-3 py-2 text-sm font-medium text-red-600
                       transition hover:bg-red-50
                       dark:text-red-400 dark:hover:bg-red-950/50"
              >
                Hapus
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Footer -->
      <footer
        class="mt-6 text-center text-sm text-slate-500 dark:text-slate-500"
      >
        Simple To-Do List · Vue 3 · Tailwind CSS · MongoDB
      </footer>
    </div>
  </main>
</template>
