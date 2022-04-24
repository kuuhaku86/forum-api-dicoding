/* eslint-disable camelcase */

exports.up = pgm => {
	pgm.createTable('replies', {
    id: {
			type: 'VARCHAR(50)',
			primaryKey: true,
    },
    owner: {
			type: 'VARCHAR(50)',
			notNull: true,
    },
    comment_id: {
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

	pgm.addConstraint('replies', 'users_fk', {
		foreignKeys: {
			columns: 'owner',
			references: {
				name:    'users',
				columns: 'id',
			},
    },
	});

	pgm.addConstraint('replies', 'comments_fk', {
		foreignKeys: {
			columns: 'comment_id',
			references: {
				name:    'comments',
				columns: 'id',
			},
    },
	});
};

exports.down = pgm => {
	pgm.dropTable('replies');
};
