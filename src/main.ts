export interface IGratinConfiguration {
	migrationsFolder: string;
	database: {
		address: string;
		port: string;
		username: string;
		password: string;
		schema: string;
	};
}

export class Gratin {

	constructor(
		private configuration: IGratinConfiguration) { }

	public run() {
		// tslint:disable-next-line: no-console
		console.log(this.configuration);
	}

}
