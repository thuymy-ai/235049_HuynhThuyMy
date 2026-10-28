require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const bookSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: ""
  },
  publisher: {
    type: String,
    default: ""
  },
  publishYear: {
    type: Number,
    min: 0
  },
  isbn: {
    type: String,
    default: ""
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  description: {
    type: String,
    default: ""
  }
});

const Book = mongoose.model("Book", bookSchema, "books");

// Kiem tra trang thai backend
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected"
  });
});

// Lay danh sach va tim kiem sach
app.get("/api/books", async (req, res) => {
  try {
    const search = req.query.search || "";

    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const books = await Book.find(filter).sort({ title: 1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Xem chi tiet sach
app.get("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Khong tim thay sach"
      });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({
      message: "ID sach khong hop le"
    });
  }
});

// Them sach
app.post("/api/books", async (req, res) => {
  try {
    const {
      bookId,
      title,
      author,
      category,
      publisher,
      publishYear,
      isbn,
      quantity,
      description
    } = req.body;

    if (!bookId || !title || !author) {
      return res.status(400).json({
        message: "Ma sach, ten sach va tac gia la bat buoc"
      });
    }

    const book = await Book.create({
      bookId,
      title,
      author,
      category,
      publisher,
      publishYear,
      isbn,
      quantity,
      description
    });

    res.status(201).json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ma sach da ton tai"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({ message: error.message });
  }
});

// Cap nhat sach
app.put("/api/books/:id", async (req, res) => {
  try {
    const {
      bookId,
      title,
      author,
      category,
      publisher,
      publishYear,
      isbn,
      quantity,
      description
    } = req.body;

    if (
      !bookId ||
      !title ||
      !author ||
      (quantity !== undefined &&
        (!Number.isInteger(quantity) || quantity < 0)) ||
      (publishYear !== undefined &&
        !Number.isInteger(publishYear))
    ) {
      return res.status(400).json({
        message: "Du lieu cap nhat khong hop le"
      });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        bookId,
        title,
        author,
        category,
        publisher,
        publishYear,
        isbn,
        quantity,
        description
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!book) {
      return res.status(404).json({
        message: "Khong tim thay sach"
      });
    }

    res.json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ma sach da ton tai"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(400).json({ message: error.message });
  }
});

// Xoa sach
app.delete("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Khong tim thay sach"
      });
    }

    res.json({
      message: "Xoa sach thanh cong"
    });
  } catch (error) {
    res.status(400).json({
      message: "ID sach khong hop le"
    });
  }
});

// Khoi dong server sau khi ket noi database
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Thieu bien moi truong MONGODB_URI");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Da ket noi MongoDB Atlas");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server dang chay tai cong ${PORT}`);
    });
  } catch (error) {
    console.error("Khong the khoi dong server:", error.message);
    process.exit(1);
  }
}

startServer();