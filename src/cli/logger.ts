import * as c from 'ansi-colors';

async function action<T>(name: string, cb: () => Promise<T>): Promise<T> {
	process.stdout.write(`${name}... `);
	try {
		const result = await cb();
		process.stdout.write(`${c.green('OK')}\n`);
		return result;
	} catch (err) {
		process.stdout.write(`${c.red('ERROR')}\n`);
		throw err;
	}
}

function error(err: Error) {
	log(err.stack);
}

function log(obj: any) {
	// tslint:disable-next-line: no-console
	console.log(obj);
}

function newLine() {
	log('');
}

const logger = {
	log,
	newLine,
	error,
	action,
};

export default logger;
