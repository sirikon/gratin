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

## What

Gratin is a **very** simple database migration tool that will:

- Read all the files from a given folder, assuming each of them is a valid
script for your target database.
- Connect to a given database
- Apply each file in a transaction
- Keep track of each applied migration in the database itself, creating the
table `gratin_changelog`.

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

And, because it's just code, you can do whatever you want to get the proper
database credentials, do some tasks before or after migrating, etc.

Now all you have to do is run it with something like
[ts-node](https://github.com/TypeStrong/ts-node) or compile it with Typescript
`tsc`.

## Database support

Currently, only PostgreSQL. But you could create a new implementation of
`IDatabase` on your own and use it. The PostgreSQL implementation is included
in the package as a commodity.

## Credits

- Lasagna by [I love PNG](https://i-love-png.com/lasagna_png_771374.html).
