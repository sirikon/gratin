export interface IDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(query: string): Promise<void>;
  transaction(cb: () => Promise<void>): Promise<void>;
}
