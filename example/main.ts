import * as pathUtils from 'path';

import { Gratin } from '..';

const gratin = new Gratin({
	migrationsFolder: pathUtils.join(__dirname, 'migrations'),
	database: {
		address: 'localhost',
		port: '5432',
		username: 'postgres',
		password: '12345',
		schema: 'postgres',
	},
});

gratin.run();
