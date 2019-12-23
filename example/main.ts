import { join } from 'path';

import { Gratin, Postgres } from '..';

const gratin = new Gratin({
	migrationsFolder: join(__dirname, 'migrations'),
	database: new Postgres({
		host: '127.0.0.1',
		port: 5432,
		database: 'postgres',
		username: 'postgres',
		password: '12345',
	}),
});

gratin.run();
