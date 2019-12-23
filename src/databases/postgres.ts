import { Client } from 'pg';

import { IChangelogItem, IDatabase } from '../models';

export interface IPostgresConfig {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
}

export class Postgres implements IDatabase {

	private dbClient: Client;

	constructor(
		private configuration: IPostgresConfig) {
		this.dbClient = new Client({
			host: this.configuration.host,
			port: this.configuration.port,
			database: this.configuration.database,
			user: this.configuration.username,
			password: this.configuration.password,
		});
	}

	public async connect(): Promise<void> {
		await this.dbClient.connect();
	}

	public async disconnect(): Promise<void> {
		await this.dbClient.end();
	}

	public async execute(statement: string): Promise<void> {
		await this.dbClient.query(statement);
	}

	public async transaction(cb: () => Promise<void>): Promise<void> {
		try {
			await this.dbClient.query('BEGIN');
			await cb();
			await this.dbClient.query('COMMIT');
		} catch (err) {
			await this.dbClient.query('ROLLBACK');
			throw err;
		}
	}

	public async ensureChangelog(): Promise<void> {
		await this.dbClient.query(`
			CREATE TABLE IF NOT EXISTS gratin_changelog (
				id SERIAL,
				migration_key VARCHAR(200) UNIQUE NOT NULL,
				date TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
			)
		`);
	}

	public async getChangelog(): Promise<IChangelogItem[]> {
		const result = await this.dbClient.query(`
			SELECT * FROM gratin_changelog ORDER BY id;
		`);
		return result.rows.map((row) => {
			return {
				id: row.id,
				migrationKey: row.migration_key,
				date: row.date,
			};
		});
	}

	public async insertChangelogItem(key: string): Promise<void> {
		await this.dbClient.query(`
			INSERT INTO gratin_changelog (migration_key) VALUES ($1::text)
		`, [key]);
	}

}
