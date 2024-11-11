const { nanoid } = require('nanoid');
const books = require('../database/bookDb');

const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    }).code(400);
  }

  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  const newBook = {
    id, name, year, author, summary, publisher,
    pageCount, readPage, finished, reading,
    insertedAt, updatedAt
  };
  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if(isSuccess) {
    return h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: { bookId: id },
    }).code(201);
  } else {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku.',
    }).code(500);
  }
  
};

const getAllBooksHandler = (req, h) => {
  const { reading, finished, name } = req.query;
  
  let filterBooks = books;

  if (reading !== undefined) {
    filterBooks = filterBooks.filter(book => book.reading === Boolean(Number(reading)));
  }

  if (finished !== undefined) {
    filterBooks = filterBooks.filter(book => book.finished === Boolean(Number(finished)));
  }

  if (name) {
    filterBooks = filterBooks.filter(book => book.name.toLowerCase().includes(name.toLowerCase()));
  }

  return h.response({
    status: 'success',
    data: {
      books: filterBooks.map(({ id, name, publisher }) => ({ id, name, publisher })),
    },
  }).code(200);
};


const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.find((b) => b.id === bookId);

  if (!book) {
    return h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    }).code(404);
  } else {
    return h.response({
      status: 'success',
      data: { book },
    }).code(200);
  }
};

const updateBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }

  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  const bookIndex = books.findIndex((book) => book.id === bookId);

  if (bookIndex === -1) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
  }

  const updatedAt = new Date().toISOString();
  books[bookIndex] = {
    ...books[bookIndex],
    name, year, author, summary, publisher,
    pageCount, readPage, reading,
    finished: pageCount === readPage,
    updatedAt
  };

  const isSuccess = books.filter((book) => (book.updatedAt === updatedAt) && (book.id == bookId)).length > 0;

  if(isSuccess) {
    return h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    }).code(200);
  } else {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku.',
    }).code(500);
  }
  
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const bookIndex = books.findIndex((book) => book.id === bookId);

  if (bookIndex === -1) {
    return h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    }).code(404);
  }

  books.splice(bookIndex, 1);

  const isSuccess = books.filter((book) => book.id === bookId).length === 0;

  if(isSuccess){
    return h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    }).code(200);
  } else {
    return h.response({
      status: 'fail',
      message: 'Buku gagal dihapus.',
    }).code(500);
  }
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};
