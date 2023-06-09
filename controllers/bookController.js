const Book = require('../models/Book');
const User = require('../models/User');
const BASEURL = 'https://books.googleapis.com/books/v1/volumes';

module.exports = {
  getBooks: async (req, res) => {
    const books = await Book.find().populate('user', 'userName');

    res.status(200).json(books);
  },
  getBook: async (req, res) => {
    try {
      const { id } = req.params;

      const response = await fetch(
        `${BASEURL}/${id}?key=${process.env.GOOGLE_API_KEY}`
      );
      const json = await response.json();

      if (!response.ok) {
        throw Error('The book ID could not be found.');
      }

      const book = await Book.findOne({
        $and: [{ user: req.user.id }, { bookId: id }],
      });

      const status = book ? book.status : null;

      res.status(200).json({ details: json.volumeInfo, status });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  searchBooks: async (req, res) => {
    try {
      const query = req.params.query.replaceAll(' ', '%20');

      const response = await fetch(
        `${BASEURL}?q=${query}&maxResults=40&key=${process.env.GOOGLE_API_KEY}`
      );
      const json = await response.json();
      const books = json.items ? json.items : [];

      res.status(200).json(books);
    } catch (error) {
      res
        .status(400)
        .json({ error: 'Something went wrong. Please try again.' });
    }
  },
  getProfile: async (req, res) => {
    try {
      const { userName } = req.params;
      const user = await User.findOne({ userName }, 'userName').collation({
        locale: 'en',
        strength: 2,
      });

      if (!user) {
        throw Error('Profile not found.');
      }

      const books = await Book.find({ user: user }).populate(
        'user',
        'userName'
      );

      res.status(200).json({ userName: user.userName, books });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  addBook: async (req, res) => {
    try {
      const { bookId, title, authors, cover, status } = req.body;

      const existingBook = await Book.findOne({
        $and: [{ user: req.user.id }, { bookId }],
      });

      if (existingBook) {
        throw Error('Already added book to your list.');
      }

      const book = await Book.create({
        user: req.user.id,
        bookId,
        title,
        authors,
        cover,
        status,
      });

      await book.populate('user', 'userName');

      res.status(200).json(book);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  updateBook: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const book = await Book.findOne({
        $and: [{ user: req.user.id }, { bookId: id }],
      }).populate('user', 'userName');

      if (!book) {
        throw Error('Book has not been added to your list.');
      }

      book.status = status;
      await book.save();

      res.status(200).json(book);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  deleteBook: async (req, res) => {
    try {
      const { id } = req.params;

      const book = await Book.findOne({
        $and: [{ user: req.user.id }, { bookId: id }],
      });

      if (!book) {
        throw Error('Book has not been added to your list.');
      }

      await book.deleteOne();

      res.status(200).json(book);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};
