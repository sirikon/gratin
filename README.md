<h1 align="center">Gratin</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/sirikon/gratin/master/assets/lasagna.png" width="500px">
</p>
<p align="center">
  <i>Use Gratin. Start migratin'.</i>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/gratin">
    <img src="https://img.shields.io/npm/v/gratin?label=npm%20i%20--save%20gratin&style=flat-square" />
  </a>
  <br />
  <img src="https://img.shields.io/maintenance/yes/2019?style=flat-square" />
  <img src="https://img.shields.io/badge/tasty-of%20course-brightgreen?style=flat-square" />
</p>

## Installation

```bash
npm i --save gratin
```

## Usage

Create a new file, like `migrator.ts`, which will be the entry point for the
migrations tool:

```typescript
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
```
This will find every file inside `./migrations` folder (relative to the script
itself) and apply each of them to the database in separate transactions,
creating a changelog in the database to keep track of all the applied
migrations.

## Credits

- Lasagna by [I love PNG](https://i-love-png.com/lasagna_png_771374.html).
