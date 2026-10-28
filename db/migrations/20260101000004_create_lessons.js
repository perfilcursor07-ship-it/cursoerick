/**
 * Aulas. O controle de liberacao fica em release_mode:
 *  - free      : liberada para todos (use na aula de apresentacao)
 *  - manual    : liberada somente quando is_released = true (admin clica em "liberar")
 *  - scheduled : liberada automaticamente a partir de release_at
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('lessons', (t) => {
    t.engine('InnoDB'); // InnoDB e necessario para as chaves estrangeiras
    t.increments('id').primary();
    t.integer('module_id').unsigned().notNullable();
    t.string('title', 180).notNullable();
    t.string('slug', 200).notNullable().unique();
    t.text('description').nullable();

    t.enu('video_type', ['upload', 'external'], {
      useNative: false,
      enumName: 'lessons_video_type',
    })
      .notNullable()
      .defaultTo('upload');
    // caminho relativo do arquivo em storage/videos (video_type = upload)
    t.string('video_path', 500).nullable();
    // link do YouTube / Vimeo (video_type = external)
    t.string('video_url', 500).nullable();
    t.string('thumbnail_url', 500).nullable();
    t.integer('duration_seconds').notNullable().defaultTo(0);

    t.enu('release_mode', ['free', 'manual', 'scheduled'], {
      useNative: false,
      enumName: 'lessons_release_mode',
    })
      .notNullable()
      .defaultTo('manual');
    t.boolean('is_released').notNullable().defaultTo(false);
    t.timestamp('release_at').nullable();

    t.boolean('is_published').notNullable().defaultTo(true);
    t.integer('position').notNullable().defaultTo(0);
    t.timestamps(true, true);

    t.foreign('module_id').references('modules.id').onDelete('CASCADE');
    t.index(['module_id', 'position'], 'lessons_module_position_idx');
    t.index(['release_mode', 'is_released'], 'lessons_release_idx');
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('lessons');
};
