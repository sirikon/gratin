import * as fs from 'fs';
import * as pathUtils from 'path';
import { IDatabase } from './models';

export interface IGratinConfiguration {
	migrationsFolder: string;
	database: IDatabase;
}

export class Gratin {

	constructor(
		private configuration: IGratinConfiguration) { }

	public async run() {
		const migrationsFiles = await getMigrationsFiles(this.getMigrationsFolder());
		// tslint:disable-next-line: no-console
		console.log(migrationsFiles);
		await this.configuration.database.connect();
		// tslint:disable-next-line: no-console
		console.log('Connected!');
		await this.configuration.database.disconnect();
	}

	private getMigrationsFolder(): string {
		return pathUtils.resolve(this.configuration.migrationsFolder);
	}

}

function getMigrationsFiles(baseDirectory: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		fs.readdir(baseDirectory, (err, files) => {
			if (err) { return reject(err); }
			resolve(files
				.sort()
				.map((f) => pathUtils.join(baseDirectory, f)));
		});
	});
}
