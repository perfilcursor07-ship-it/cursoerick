/**
 * Tabela de usuarios (alunos e administradores).
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('users', (t) => {
    t.engine('InnoDB'); // InnoDB e necessario para as chaves estrangeiras
    t.increments('id').primary();
    t.string('name', 160).notNullable();
    t.string('email', 190).notNullable().unique();
    t.string('phone', 30).notNullable();
    t.string('password_hash', 255).notNullable();
    t.enu('role', ['student', 'admin'], {
      useNative: false,
      enumName: 'users_role',
    })
      .notNullable()
      .defaultTo('student');
    t.enu('status', ['active', 'blocked'], {
      useNative: false,
      enumName: 'users_status',
    })
      .notNullable()
      .defaultTo('active');
    t.timestamp('last_login_at').nullable();
    t.timestamps(true, true);

    t.index(['role'], 'users_role_idx');
    t.index(['status'], 'users_status_idx');
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('users');
};
