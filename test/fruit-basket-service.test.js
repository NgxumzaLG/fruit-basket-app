const assert = require("assert");
const FruitBasket = require("../fruit-basket-service");
const pg = require("pg");
const Pool = pg.Pool;
// require('dotenv').config()

const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/fruit_basket_app_test';

const pool = new Pool({
    connectionString,
	ssl : {
		rejectUnauthorized:false
	}
});

describe("The fruit basket service", function() {
	
	beforeEach(async function(){
		await pool.query(`delete from basket_item;`);
		await pool.query(`delete from basket;`);
	});

	this.afterAll(async function() {
		await pool.end()
	});

	it("should be able to add a basket", async function(){
		const fruitBasket = FruitBasket(pool);

		const basketId = await fruitBasket.createBasket("My test basket");
		assert.ok(basketId, "The basket id should be set");

		const basket = await fruitBasket.getBasket(basketId);
		assert.equal("My test basket", basket.description);

	});

	it("should be able to add 2 fruits to a basket", async function(){
		const fruitBasket = FruitBasket(pool);

		const basketId = await fruitBasket.createBasket("My test basket for fruits");
		assert.ok(basketId, "The basket id should be set");

		const fruits = await fruitBasket.listFruits();

		const apples = fruits[0];
		const bananas = fruits[1];

		await fruitBasket.addFruitToBasket(apples.id, basketId, 3);
		await fruitBasket.addFruitToBasket(bananas.id, basketId, 7);

		const basketItems = await fruitBasket.getBasketItems(basketId);

		assert.equal(2, basketItems.length);
	});

});