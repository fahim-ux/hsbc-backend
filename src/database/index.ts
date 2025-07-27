import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { User, Account, Transaction, Card, Loan, Complaint, Offer, Branch } from '../types';

export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string = './banking.db') {
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  private async init() {
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
    
    // Create Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        fullName TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        accountNumber TEXT UNIQUE NOT NULL,
        balance REAL DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Accounts table
    await run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        accountNumber TEXT UNIQUE NOT NULL,
        accountType TEXT NOT NULL,
        balance REAL DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `);

    // Create Transactions table
    await run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        fromAccountId TEXT NOT NULL,
        toAccountId TEXT,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        reference TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fromAccountId) REFERENCES accounts (id)
      )
    `);

    // Create Cards table
    await run(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        cardNumber TEXT UNIQUE NOT NULL,
        cardType TEXT NOT NULL,
        expiryDate DATETIME NOT NULL,
        isBlocked BOOLEAN DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        cardLimit REAL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `);

    // Create Loans table
    await run(`
      CREATE TABLE IF NOT EXISTS loans (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        loanType TEXT NOT NULL,
        amount REAL NOT NULL,
        interestRate REAL NOT NULL,
        tenure INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        applicationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        approvalDate DATETIME,
        disbursementDate DATETIME,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `);

    // Create Complaints table
    await run(`
      CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'open',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `);

    // Create Offers table
    await run(`
      CREATE TABLE IF NOT EXISTS offers (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        validFrom DATETIME NOT NULL,
        validTo DATETIME NOT NULL,
        isActive BOOLEAN DEFAULT 1,
        termsAndConditions TEXT
      )
    `);

    // Create Branches table
    await run(`
      CREATE TABLE IF NOT EXISTS branches (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        email TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        workingHours TEXT NOT NULL,
        services TEXT NOT NULL,
        hasATM BOOLEAN DEFAULT 1
      )
    `);

    // Insert sample data
    await this.insertSampleData();
  }

  private async insertSampleData() {
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;

    try {
      // Check if sample data already exists
      const existingUser = await get('SELECT * FROM users WHERE username = ?', ['john_doe']);
      if (existingUser) return;

      console.log('Inserting sample data...');

      // Sample users (password is 'password' for both)
      await run(`
        INSERT INTO users (id, username, password, email, fullName, phoneNumber, accountNumber, balance)
        VALUES 
          (?, ?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'user-1', 'john_doe', '$2a$10$2NE0r3.bJsW1tZPD7w0VLuV33V04Dt38TICVI/RB1rDBIo.OYhKx.', 
        'john@example.com', 'John Doe', '1234567890', 'ACC001', 10000,
        'user-2', 'jane_smith', '$2a$10$2NE0r3.bJsW1tZPD7w0VLuV33V04Dt38TICVI/RB1rDBIo.OYhKx.', 
        'jane@example.com', 'Jane Smith', '0987654321', 'ACC002', 25000
      ]);

      // Sample accounts
      await run(`
        INSERT INTO accounts (id, userId, accountNumber, accountType, balance)
        VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)
      `, ['acc-1', 'user-1', 'ACC001', 'savings', 10000, 'acc-2', 'user-2', 'ACC002', 'current', 25000]);

      // Sample cards
      await run(`
        INSERT INTO cards (id, userId, cardNumber, cardType, expiryDate, cardLimit)
        VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)
      `, [
        'card-1', 'user-1', '4532-1234-5678-9012', 'debit', '2027-12-31', 5000,
        'card-2', 'user-2', '4532-9876-5432-1098', 'credit', '2026-11-30', 50000
      ]);

      // Sample offers
      await run(`
        INSERT INTO offers (id, title, description, category, validFrom, validTo, termsAndConditions)
        VALUES (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)
      `, [
        'offer-1', 'Personal Loan at 8.5%', 'Get personal loan at attractive interest rate', 'loan', '2025-01-01', '2025-12-31', 'Minimum salary requirement applies',
        'offer-2', 'Zero Balance Savings Account', 'Open savings account with zero balance', 'deposit', '2025-01-01', '2025-06-30', 'Valid for new customers only'
      ]);

      // Sample branches
      await run(`
        INSERT INTO branches (id, name, address, city, state, pincode, phoneNumber, email, workingHours, services, hasATM)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'branch-1', 'HSBC Main Branch', '123 Main Street', 'New York', 'NY', '10001', '555-0123', 'mainbranch@hsbc.com', '9:00 AM - 5:00 PM', 'Banking,Loans,Cards,Investment', 1,
        'branch-2', 'HSBC Downtown', '456 Business Ave', 'New York', 'NY', '10002', '555-0456', 'downtown@hsbc.com', '9:00 AM - 6:00 PM', 'Banking,ATM', 1
      ]);

      console.log('Sample data inserted successfully!');
    } catch (error) {
      console.log('Error inserting sample data:', error);
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    return await get('SELECT * FROM users WHERE username = ?', [username]) as User | null;
  }

  async getUserById(id: string): Promise<User | null> {
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    return await get('SELECT * FROM users WHERE id = ?', [id]) as User | null;
  }

  async getAccountByUserId(userId: string): Promise<Account | null> {
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    return await get('SELECT * FROM accounts WHERE userId = ?', [userId]) as Account | null;
  }

  async getTransactionsByUserId(userId: string, limit: number = 10): Promise<Transaction[]> {
    const all = promisify(this.db.all.bind(this.db)) as (sql: string, params?: any[]) => Promise<any[]>;
    return await all(`
      SELECT t.* FROM transactions t
      JOIN accounts a ON t.fromAccountId = a.id
      WHERE a.userId = ?
      ORDER BY t.createdAt DESC
      LIMIT ?
    `, [userId, limit]) as Transaction[];
  }

  async getCardsByUserId(userId: string): Promise<Card[]> {
    const all = promisify(this.db.all.bind(this.db)) as (sql: string, params?: any[]) => Promise<any[]>;
    return await all('SELECT * FROM cards WHERE userId = ?', [userId]) as Card[];
  }

  async getLoansByUserId(userId: string): Promise<Loan[]> {
    const all = promisify(this.db.all.bind(this.db)) as (sql: string, params?: any[]) => Promise<any[]>;
    return await all('SELECT * FROM loans WHERE userId = ?', [userId]) as Loan[];
  }

  async getComplaintsByUserId(userId: string): Promise<Complaint[]> {
    const all = promisify(this.db.all.bind(this.db)) as (sql: string, params?: any[]) => Promise<any[]>;
    return await all('SELECT * FROM complaints WHERE userId = ?', [userId]) as Complaint[];
  }

  async getAllOffers(): Promise<Offer[]> {
    const all = promisify(this.db.all.bind(this.db)) as (sql: string, params?: any[]) => Promise<any[]>;
    return await all('SELECT * FROM offers WHERE isActive = 1 AND validTo > datetime("now")') as Offer[];
  }

  async getAllBranches(): Promise<Branch[]> {
    const all = promisify(this.db.all.bind(this.db)) as (sql: string, params?: any[]) => Promise<any[]>;
    return await all('SELECT * FROM branches') as Branch[];
  }

  // Write operations
  async createTransaction(transaction: Omit<Transaction, 'createdAt' | 'updatedAt'>): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
    await run(`
      INSERT INTO transactions (id, fromAccountId, toAccountId, amount, type, description, reference, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [transaction.id, transaction.fromAccountId, transaction.toAccountId, transaction.amount, 
        transaction.type, transaction.description, transaction.reference, transaction.status]);
  }

  async updateAccountBalance(accountId: string, newBalance: number): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
    await run('UPDATE accounts SET balance = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [newBalance, accountId]);
  }

  async updateCardStatus(cardId: string, isBlocked: boolean): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
    await run('UPDATE cards SET isBlocked = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [isBlocked, cardId]);
  }

  async createLoan(loan: Omit<Loan, 'applicationDate'>): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
    await run(`
      INSERT INTO loans (id, userId, loanType, amount, interestRate, tenure, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [loan.id, loan.userId, loan.loanType, loan.amount, loan.interestRate, loan.tenure, loan.status]);
  }

  async createComplaint(complaint: Omit<Complaint, 'createdAt' | 'updatedAt'>): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
    await run(`
      INSERT INTO complaints (id, userId, subject, description, category, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [complaint.id, complaint.userId, complaint.subject, complaint.description, 
        complaint.category, complaint.priority, complaint.status]);
  }

  async updateTransactionStatus(transactionId: string, status: string): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
    await run('UPDATE transactions SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [status, transactionId]);
  }

  async getCardById(cardId: string): Promise<Card | null> {
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    return await get('SELECT * FROM cards WHERE id = ?', [cardId]) as Card | null;
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    return await get('SELECT * FROM transactions WHERE id = ?', [transactionId]) as Transaction | null;
  }

  async getComplaintById(complaintId: string): Promise<Complaint | null> {
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    return await get('SELECT * FROM complaints WHERE id = ?', [complaintId]) as Complaint | null;
  }

  async createCard(card: Omit<Card, 'createdAt' | 'updatedAt'>): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
    await run(`
      INSERT INTO cards (id, userId, cardNumber, cardType, expiryDate, cardLimit)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [card.id, card.userId, card.cardNumber, card.cardType, card.expiryDate, card.cardLimit]);
  }

  close() {
    this.db.close();
  }
}
