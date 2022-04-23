/* eslint-disable camelcase */

exports.up = pgm => {
	pgm.createTable('threads', {
    id: {
			type: 'VARCHAR(50)',
			primaryKey: true,
    },
    owner: {
			type: 'VARCHAR(50)',
			notNull: true,
    },
    title: {
			type: 'VARCHAR(50)',
			notNull: true,
    },
    body: {
			type: 'TEXT',
			notNull: true,
    },
    date: {
			type: 'TIMESTAMP',
			notNull: true,
    },
	});

	pgm.addConstraint('threads', 'users_fk', {
		foreignKeys: {
			columns: 'owner',
			references: {
				name: 'users',
				columns: 'id',
			},
    },
	});
};

exports.down = pgm => {
	pgm.dropTable('threads');
};
