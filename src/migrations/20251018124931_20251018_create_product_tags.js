/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('product_tags', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable()
      .references('id').inTable('products').onDelete('CASCADE');
    table.integer('tag_id').unsigned().notNullable()
      .references('id').inTable('tags').onDelete('CASCADE');
    table.timestamps(true, true);
    table.unique(['product_id', 'tag_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('product_tags');
};
