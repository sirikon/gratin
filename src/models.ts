export interface IMigration {
  key: string;
  relativePath: string;
  absolutePath: string;
}

export interface IChangelogItem {
  id: number;
  migrationKey: string;
  date: Date;
}

export interface IDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  execute(statement: string): Promise<void>;
  transaction(cb: () => Promise<void>): Promise<void>;

  ensureChangelog(): Promise<void>;
  getChangelog(): Promise<IChangelogItem[]>;
  insertChangelogItem(key: string): Promise<void>;
}
