import * as fs from 'fs';
import * as pathUtils from 'path';
import { IChangelogItem, IDatabase, IMigration } from './models';

import logger from './cli/logger';

export interface IGratinConfiguration {
	migrationsFolder: string;
	database: IDatabase;
}

export class Gratin {

	constructor(
		private configuration: IGratinConfiguration) { }

	public async run() {
		await this.logStart();
		await this.connectDatabase();
		await this.ensureChangelogExists();
		await this.applyPendingMigrations();
		await this.disconnectDatabase();
	}

	private async logStart(): Promise<void> {
		logger.log(`Starting Gratin ${await getVersion()}`);
		logger.newLine();
	}

	private async applyPendingMigrations(): Promise<void> {
		const pendingMigrations = await this.getPendingMigrations();
		printPendingMigrations(pendingMigrations);
		for (const migration of pendingMigrations) {
			await this.applyMigration(migration);
		}
	}

	private async applyMigration(migration: IMigration) {
		logger.log(`Applying migration '${migration.key}'`);
		const content = await readFileContent(migration.absolutePath);
		await this.configuration.database.transaction(async () => {
			await this.configuration.database.execute(content);
			await this.configuration.database.insertChangelogItem(migration.key);
		});
	}

	private async getPendingMigrations(): Promise<IMigration[]> {
		const migrationsFiles = await this.getMigrationsFiles();
		const changelog = await this.getChangelog();

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

	private async connectDatabase(): Promise<void> {
		logger.log('Connecting to the database...');
		await this.configuration.database.connect();
		logger.log('Connection with database successful');
		logger.newLine();
	}

	private async disconnectDatabase(): Promise<void> {
		logger.log('Disconnecting from the database...');
		await this.configuration.database.disconnect();
		logger.log('Successfully disconnected');
		logger.newLine();
	}

	private getMigrationsFolder(): string {
		return pathUtils.resolve(this.configuration.migrationsFolder);
	}

	private async ensureChangelogExists(): Promise<void> {
		logger.log('Ensuring changelog exists...');
		await this.configuration.database.ensureChangelog();
		logger.log('Changelog ensured');
		logger.newLine();
	}

	private async getChangelog(): Promise<IChangelogItem[]> {
		logger.log('Getting changelog...');
		const result = await this.configuration.database.getChangelog();
		logger.log('OK');
		logger.newLine();
		return result;
	}

}

function printPendingMigrations(migrations: IMigration[]) {
	logger.log(`There ${migrations.length === 1 ? 'is' : 'are'} ${migrations.length} migration${migrations.length === 1 ? '' : 's'} pending to apply`);
	printMigrations(migrations);
	logger.newLine();
}

function printFoundMigrations(migrations: IMigration[]) {
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
