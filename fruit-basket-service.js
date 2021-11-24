module.exports = function(pool) {

	async function createBasket(name) {
		const result = await pool.query(`
			insert into basket (description) values ($1) returning id`, [name])
		if (result.rows) {
			return result.rows[0].id;
		}
		return null;
	}

	async function addFruitToBasket(fruitId, basketId, qty) {
		const insertFruitInBasketSQL = `insert into basket_item (basket_id, fruit_id, qty) values ($1, $2, $3)`;
		const result = await pool.query(insertFruitInBasketSQL, [basketId, fruitId, qty]);

		if (result.rows.length > 0) {
			return result.rows[0];
		}
	}

	async function removeBasket(basketId) {

	}

	async function removeFruitFromBasket(fruitId, basketId) {

	}

	async function listFruits() {
		const selectFruitsSQL = `select * from fruit order by name asc`;
		const result = await pool.query(selectFruitsSQL);

		return result.rows;
	}

	async function listBaskets() {
		const selectBasketsSQL = `select * from basket`;
		const result = await pool.query(selectBasketsSQL);
		const results = result.rows

		// for each basket get the total_cost
		const resultsWithToatalCost = [];

		for (const basket of results) {
			const total_cost = await totalBasketCost(basket.id);

			if (total_cost) {
				basket.total_cost = total_cost;

			} else {
				basket.total_cost = '0.00'
			}

			resultsWithToatalCost.push(basket);
		}

		return resultsWithToatalCost;
	}

	async function getBasket(basketId) {
		const selectBasketByIdSQL = `select * from basket where id = $1`;
		const result = await pool.query(selectBasketByIdSQL, [basketId]);

		if (result.rows.length > 0) {
			return result.rows[0];
		}
	}

	async function getBasketItems(basketId) {
		const selectBasketItemsSQL = `select *, qty * price as total_price 
			from basket_item 
				join fruit on fruit.id = basket_item.fruit_id
			where basket_id = $1`;

		const result = await pool.query(selectBasketItemsSQL, [basketId]);

		if (result.rowCount > 0) {
			return result.rows;
		}
	}

	async function totalBasketCost(basketId) {
		const sql= `select  sum(qty * price) as total_cost 
			from basket join basket_item on basket_item.basket_id = basket.id 
			join fruit on fruit.id = basket_item.fruit_id 
			where basket.id = $1`

		const result = await pool.query(sql, [basketId]);

		if (result.rowCount > 0) {
			return result.rows[0].total_cost;
		}

		return 0;
	}

	return {
		addFruitToBasket,
		createBasket,
		getBasket,
		listBaskets,
		getBasketItems,
		listFruits,
		totalBasketCost
	}

}