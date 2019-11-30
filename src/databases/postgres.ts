import { Client } from 'pg';

import { IDatabase } from '../models';

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

	public async query(text: string): Promise<void> {
		await this.dbClient.query(text);
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

}
