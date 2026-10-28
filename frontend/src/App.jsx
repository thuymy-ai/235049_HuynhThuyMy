import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyBook = {
  bookId: "",
  title: "",
  author: "",
  category: "",
  publisher: "",
  publishYear: new Date().getFullYear(),
  isbn: "",
  quantity: 0,
  description: ""
};

function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadBooks(keyword = search) {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/books?search=${encodeURIComponent(keyword)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Khong tai duoc danh sach sach");
      }

      setBooks(data);
    } catch (error) {
      setMessage(`Loi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks("");
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "publishYear" || name === "quantity"
          ? value === ""
            ? ""
            : Number(value)
          : value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const url = editingId
        ? `${API_URL}/api/books/${editingId}`
        : `${API_URL}/api/books`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Khong the luu sach");
      }

      setMessage(
        editingId ? "Cap nhat sach thanh cong" : "Them sach thanh cong"
      );

      setForm(emptyBook);
      setEditingId(null);
      await loadBooks("");
    } catch (error) {
      setMessage(`Loi: ${error.message}`);
    }
  }

  function handleEdit(book) {
    setEditingId(book._id);

    setForm({
      bookId: book.bookId || "",
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      publisher: book.publisher || "",
      publishYear: book.publishYear ?? "",
      isbn: book.isbn || "",
      quantity: book.quantity ?? 0,
      description: book.description || ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Ban co chac muon xoa sach nay?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/books/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Khong the xoa sach");
      }

      setMessage("Xoa sach thanh cong");
      await loadBooks("");
    } catch (error) {
      setMessage(`Loi: ${error.message}`);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    await loadBooks(search);
  }

  function resetForm() {
    setForm(emptyBook);
    setEditingId(null);
    setMessage("");
  }

  return (
    <main className="container">
      <h1>HE THONG QUAN LY SACH</h1>

      <section className="card">
        <h2>{editingId ? "Cap nhat sach" : "Them sach moi"}</h2>

        <form onSubmit={handleSubmit}>
          <label>Ma sach *</label>
          <input
            name="bookId"
            value={form.bookId}
            onChange={handleChange}
            required
          />

          <label>Ten sach *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label>Tac gia *</label>
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            required
          />

          <label>The loai</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
          />

          <label>Nha xuat ban</label>
          <input
            name="publisher"
            value={form.publisher}
            onChange={handleChange}
          />

          <label>Nam xuat ban</label>
          <input
            type="number"
            name="publishYear"
            value={form.publishYear}
            onChange={handleChange}
          />

          <label>ISBN</label>
          <input
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
          />

          <label>So luong</label>
          <input
            type="number"
            min="0"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
          />

          <label>Mo ta</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <div className="actions">
            <button type="submit">
              {editingId ? "Luu cap nhat" : "Them sach"}
            </button>

            <button type="button" onClick={resetForm}>
              Lam moi
            </button>
          </div>
        </form>

        {message && <p className="message">{message}</p>}
      </section>

      <section className="card">
        <h2>Danh sach sach</h2>

        <form onSubmit={handleSearch} className="search">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nhap ten sach, tac gia hoac the loai"
          />

          <button type="submit">Tim kiem</button>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              loadBooks("");
            }}
          >
            Tat ca
          </button>
        </form>

        {loading ? (
          <p>Dang tai du lieu...</p>
        ) : books.length === 0 ? (
          <p>Khong co sach nao.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ma sach</th>
                  <th>Ten sach</th>
                  <th>Tac gia</th>
                  <th>The loai</th>
                  <th>So luong</th>
                  <th>Thao tac</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>{book.bookId}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.category}</td>
                    <td>{book.quantity}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            `Ma sach: ${book.bookId}\n` +
                            `Ten sach: ${book.title}\n` +
                            `Tac gia: ${book.author}\n` +
                            `Nha xuat ban: ${book.publisher}\n` +
                            `Nam xuat ban: ${book.publishYear}\n` +
                            `ISBN: ${book.isbn}\n` +
                            `Mo ta: ${book.description}`
                          )
                        }
                      >
                        Chi tiet
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(book)}
                      >
                        Sua
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(book._id)}
                      >
                        Xoa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;