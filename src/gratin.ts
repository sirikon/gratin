import * as fs from 'fs';
import * as pathUtils from 'path';

import * as c from 'ansi-colors';

import logger from './cli/logger';
import { IChangelogItem, IDatabase, IMigration } from './models';

export interface IGratinConfiguration {
	migrationsFolder: string;
	database: IDatabase;
}

export class Gratin {

	constructor(
		private configuration: IGratinConfiguration) { }

	public run() {
		this.execute()
			.then(() => { /**/ }, (err) => logger.log(err));
	}

	public async execute() {
		try {
			await this.logStart();
			await this.usingDatabase(async () => {
				await this.ensureChangelogExists();
				await this.applyPendingMigrations();
			});
		} catch (err) {
			logger.newLine();
			logger.log('Execution finished with an unexpected error:');
			logger.error(err);
		}
	}

	private async logStart(): Promise<void> {
		const softwareName = c.bold(`Gratin ${await getVersion()}`);
		logger.log(`Starting ${softwareName} 🧀🔥`);
		logger.newLine();
	}

	private async applyPendingMigrations(): Promise<void> {
		const pendingMigrations = await this.getPendingMigrations();
		printPendingMigrations(pendingMigrations);
		for (const migration of pendingMigrations) {
			await this.applyMigration(migration);
		}
		if (pendingMigrations.length > 0) {
			logger.newLine();
		}
	}

	private async applyMigration(migration: IMigration) {
		await logger.action(`Applying migration '${migration.key}'`, async () => {
			const content = await readFileContent(migration.absolutePath);
			await this.configuration.database.transaction(async () => {
				await this.configuration.database.execute(content);
				await this.configuration.database.insertChangelogItem(migration.key);
			});
		});
	}

	private async getPendingMigrations(): Promise<IMigration[]> {
		const changelog = await this.getChangelog();
		const migrationsFiles = await this.getMigrationsFiles();

		return migrationsFiles.filter((m) => {
			let found = false;
			changelog.forEach((cl) => {
				if (cl.migrationKey === m.key) {
					found = true;
				}
			});
			return !found;
		});
	}

	private getMigrationsFiles(): Promise<IMigration[]> {
		const baseDirectory = this.getMigrationsFolder();
		return new Promise((resolve, reject) => {
			fs.readdir(baseDirectory, (err, files) => {
				if (err) { return reject(err); }
				const result = files
					.sort()
					.map((f) => {
						return {
							key: f,
							relativePath: f,
							absolutePath: pathUtils.join(baseDirectory, f),
						};
					});
				printFoundMigrations(result);
				resolve(result);
			});
		});
	}

	private async usingDatabase(cb: () => Promise<void>) {
		let connected = false;
		try {
			await this.connectDatabase();
			connected = true;
			await cb();
		} finally {
			if (connected) {
				await this.disconnectDatabase();
			}
		}
	}

	private async connectDatabase(): Promise<void> {
		await logger.action('Connecting to the database', async () => {
			await this.configuration.database.connect();
		});
	}

	private async disconnectDatabase(): Promise<void> {
		await logger.action('Disconnecting from the database', async () => {
			await this.configuration.database.disconnect();
		});
	}

	private getMigrationsFolder(): string {
		return pathUtils.resolve(this.configuration.migrationsFolder);
	}

	private async ensureChangelogExists(): Promise<void> {
		await logger.action('Ensuring changelog exists', async () => {
			await this.configuration.database.ensureChangelog();
		});
	}

	private async getChangelog(): Promise<IChangelogItem[]> {
		return await logger.action('Getting changelog', async () => {
			return await this.configuration.database.getChangelog();
		});
	}

}

function printPendingMigrations(migrations: IMigration[]) {
	logger.log(`There ${migrations.length === 1 ? 'is' : 'are'} ${migrations.length} migration${migrations.length === 1 ? '' : 's'} pending to apply`);
	printMigrations(migrations);
	logger.newLine();
}

function printFoundMigrations(migrations: IMigration[]) {
	logger.newLine();
	logger.log(`Found ${migrations.length} migration${migrations.length > 1 ? 's' : ''}`);
	printMigrations(migrations);
	logger.newLine();
}

function printMigrations(migrations: IMigration[]) {
	migrations.forEach((migration) => {
		logger.log(`- ${migration.relativePath}`);
	});
}

async function getVersion(): Promise<string> {
	const data = await readFileContent(pathUtils.join(__dirname, '..', 'package.json'));
	const pkg = JSON.parse(data);
	return pkg.version;
}

function readFileContent(path: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
			if (err) { return reject(err); }
			resolve(data);
		});
	});
}
