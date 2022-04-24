/* eslint-disable camelcase */

exports.up = pgm => {
	pgm.createTable('comments', {
    id: {
			type: 'VARCHAR(50)',
			primaryKey: true,
    },
    owner: {
			type: 'VARCHAR(50)',
			notNull: true,
    },
    thread_id: {
			type: 'VARCHAR(50)',
			notNull: true,
    },
    date: {
			type: 'TIMESTAMP',
			notNull: true,
			default: pgm.func('current_timestamp'),
    },
    content: {
			type: 'TEXT',
			notNull: true,
    },
    is_deleted: {
			type: 'BOOLEAN',
      default: false,
			notNull: true,
    },
	});

	pgm.addConstraint('comments', 'users_fk', {
		foreignKeys: {
			columns: 'owner',
			references: {
				name: 'users',
				columns: 'id',
			},
    },
	});

	pgm.addConstraint('comments', 'threads_fk', {
		foreignKeys: {
			columns: 'thread_id',
			references: {
				name: 'threads',
				columns: 'id',
			},
    },
	});
};

exports.down = pgm => {
	pgm.dropTable('comments');
};
