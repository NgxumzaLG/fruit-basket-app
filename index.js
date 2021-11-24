const express = require('express');
const exphbs  = require('express-handlebars');
const FruitBasket = require("./fruit-basket-service");
const pg = require("pg");
const Pool = pg.Pool;

const app = express();
const PORT =  process.env.PORT || 3017;

// should we use a SSL connection
let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local){
	useSSL = true;
}

// which db connection to use
const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/fruit_basket_app';

const pool = new Pool({
	connectionString,
	ssl : {
		rejectUnauthorized:false
	}
});

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

// console.log(exphbs);
const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

const fruitBasket = FruitBasket(pool);

// let counter = 0;

app.get('/', async function(req, res) {
	const baskets = await fruitBasket.listBaskets();

	res.render('index', {
		baskets
	});
});

app.get('/basket/add', function(req, res) {
	
	res.render('basket/add');
});

app.get('/basket/edit/:id', async function(req, res) {
	const basketId = req.params.id;
	const basket = await fruitBasket.getBasket(basketId);
	const fruits = await fruitBasket.listFruits();
	const basketItems = await fruitBasket.getBasketItems(basketId);
	const totalCost = await fruitBasket.totalBasketCost(basketId);

	res.render('basket/edit', {
		basket,
		fruits,
		basketItems,
		totalCost
	});
});

app.post('/basket/update/:id', async function(req, res) {
	const basketId = req.params.id;
	const qty = req.body.qty;
	const fruit_id = req.body.fruit_id;
	
	await fruitBasket.addFruitToBasket(fruit_id, basketId, qty);

	res.redirect(`/basket/edit/${basketId}`);
});

app.post('/basket/add', async function(req, res) {
	try {
		// console.log(req.body.basket_name)
		await fruitBasket.createBasket(req.body.basket_name);
		
	} catch (error) {
		console.log(error);
		
	}
	

	res.redirect('/');
});

// app.post('/count', function(req, res) {
// 	counter++;
// 	res.redirect('/')
// });


// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`App started on port ${PORT}`)
});