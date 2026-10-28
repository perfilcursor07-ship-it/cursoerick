/**
 * Conteudo editavel da pagina inicial e configuracoes gerais.
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('settings', (t) => {
    t.engine('InnoDB'); // InnoDB e necessario para as chaves estrangeiras
    t.string('key', 120).primary();
    t.text('value').nullable();
    t.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('settings');
};
