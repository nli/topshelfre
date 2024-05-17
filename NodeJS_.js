// NodeJS (Express)

const express = require('express');
const app = express();
app.use(express.json());
const request = require('supertest');

// using map instead of an array for access efficency
let books = {};

app.get('/books', (req, res) => {
	try {
		const booksArrIdSortAsc = Object.keys(books).map(id => books[id]).sort((a,b) => a.id - b.id);
		res.status(200).json(booksArrIdSortAsc)
	} catch {
		res.sendStatus(400);
	}
});

app.get('/books/:id', (req, res) => {
	const id = req?.params?.id
	try {
		// sends error code when no id exists
		if (!id || !books[id]) throw Error('missing id or record with id given');
		return res.status(200).json(books[id])
	} catch {
		res.sendStatus(400)
	}
});

app.post('/books', (req, res) => {
	const id = req?.body?.id;
	const body = req?.body
	try {
		// we prevent creating a new record if it's id already exists;
		if (!id || books[id]) throw Error('missing id or record with id exists');
		books[id] = {...body}
		res.status(201).json({...books[id]});
	} catch {
		res.sendStatus(400);
	}
});

app.put('/books/:id', (req, res) => {
	const id = req?.params?.id;
	const body = req?.body || {};
	try {
		// sends error code when no id record exists to update
		if (!id || !books[id]) throw Error('missing id or record with id given');
		books[id] = {...books[id], ...body}
		return res.status(200).json(books[id])
	} catch {
		res.sendStatus(400);
	}
});

app.delete('/books/:id', (req, res) => {
	const id = req?.params?.id;
	try {
		if (!id || !books[id]) throw Error('missing id or record with id given')
		else {
			delete books[id]
			res.sendStatus(200)
		}
	} catch {
		res.sendStatus(400)
	}
});


app.listen(3000, () => console.log('Server running on port 3000'));


describe('Test the book store API', () => {
	const book1 = {id: 1, title: 'Book 1', author: 'Author 1', published_date: '2022-01-01', price: 9.99};
	const updatedBook1 = {title: 'Updated Book 1', author: 'Updated Author 1', published_date: '2022-01-02', price: 19.99};
	const book2 = {id: 2, title: 'Book 2', author: 'Author 2', published_date: '2022-02-01', price: 10.99};
	it('Test POST /books', () => {
    	return request(app)
        	.post('/books')
        	.send(book1)
        	.expect(201, book1);
	});

	it('Test GET /books/1', () => {
    	return request(app)
        	.get('/books/1')
        	.expect(200, book1);
	});

	it('throws error if posting with existing id in book collection', () => {
    	return request(app)
        	.post('/books')
        	.send({...book2, id: 1})
        	.expect(400);
	});

	it('Test POST for book 2', () => {
    	return request(app)
        	.post('/books')
        	.send({...book2})
        	.expect(201, book2);
	});

	it('Test GET /books for book 1 and 2', () => {
    	return request(app)
        	.get('/books')
        	.expect(200, [book1, book2]);
	});

	it('Test PUT /books/1', () => {
    	return request(app)
        	.put('/books/1')
        	.send(updatedBook1)
        	.expect(200, {id: 1, ...updatedBook1});
	});

	it('Test DELETE /books/1', () => {
    	return request(app)
        	.delete('/books/1')
        	.expect(200);
	});

	it('Test GET /books', () => {
    	return request(app)
        	.get('/books')
        	.expect(200, [book2]);
	});
	it('tries to get book 1 but it throws an error', () => {
    	return request(app)
        	.get('/books/1')
        	.expect(400);
	});
	it('tries to update book 1 but it throws an error because book1 is deleted', () => {
    	return request(app)
        	.put('/books/1')
        	.send(updatedBook1)
        	.expect(400);
	});
	it('tries to delete book1 but it throws an error because book 1 is deleted', () => {
    	return request(app)
        	.delete('/books/1')
        	.expect(400);
	});
	it('making id a required param in a put request', () => {
    	return request(app)
        	.post('/books')
        	.send(updatedBook1)
        	.expect(400);
	});

});
