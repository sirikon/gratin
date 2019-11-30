import * as pathUtils from 'path';

import { Gratin, Postgres } from '..';

async function main() {
	const gratin = new Gratin({
		migrationsFolder: pathUtils.join(__dirname, 'migrations'),
		database: new Postgres({
			host: '127.0.0.1',
			port: 5432,
			database: 'postgres',
			username: 'postgres',
			password: '12345',
		}),
	});

	await gratin.run();
}

main().then(
	() => { /**/ },
	// tslint:disable-next-line: no-console
	(err) => console.log(err));
