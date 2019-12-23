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
};

export default logger;
