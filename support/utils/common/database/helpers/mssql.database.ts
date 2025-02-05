import * as sql from 'mssql';

export class MSSQLDatabase {
    private static pool: sql.ConnectionPool | null = null;
    private static config: sql.config = {
        server: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'flatfile_demo',
        options: {
            encrypt: true,
            trustServerCertificate: true // Use this for development only
        }
    };

    /**
     * Initializes the database connection pool
     * @returns Promise<void>
     * @throws Error if connection fails
     */
    public static async connect(server?: string, user?: string, password?: string, database?: string): Promise<void> {
        try {
            if (!this.pool) {
                this.config.server = server || this.config.server;
                this.config.user = user || this.config.user;
                this.config.password = password || this.config.password;
                this.config.database = database || this.config.database;
                this.pool = await new sql.ConnectionPool(this.config).connect();
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Closes the database connection pool
     * @returns Promise<void>
     */
    public static async disconnect(): Promise<void> {
        try {
            if (this.pool) {
                await this.pool.close();
                this.pool = null;
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Executes a SELECT query
     * @param query The SQL query to execute
     * @param params Optional parameters for the query
     * @returns Promise<any[]> The query results
     * @throws Error if query fails
     * @example
     * // Select all users
     * const users = await Database.select('SELECT * FROM users');
     * 
     * // Select user by id
     * const user = await Database.select('SELECT * FROM users WHERE id = @id', { id: 1 });
     */
    public static async select(query: string, params: any = {}): Promise<any[]> {
        try {
            if (!this.pool) {
                await this.connect();
            }
            const request = this.pool!.request();
            
            // Add parameters to the request
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value);
            });

            const result = await request.query(query);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Executes an INSERT query
     * @param query The SQL query to execute
     * @param params Parameters for the query
     * @returns Promise<void>
     * @throws Error if query fails
     * @example
     * // Insert a new user
     * await Database.insert(
     *   'INSERT INTO users (name, email) VALUES (@name, @email)',
     *   { name: 'John', email: 'john@example.com' }
     * );
     */
    public static async insert(query: string, params: any = {}): Promise<void> {
        try {
            if (!this.pool) {
                await this.connect();
            }
            const request = this.pool!.request();
            
            // Add parameters to the request
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value);
            });

            await request.query(query);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Executes an UPDATE query
     * @param query The SQL query to execute
     * @param params Parameters for the query
     * @returns Promise<void>
     * @throws Error if query fails
     * @example
     * // Update user email
     * await Database.update(
     *   'UPDATE users SET email = @email WHERE id = @id',
     *   { id: 1, email: 'newemail@example.com' }
     * );
     */
    public static async update(query: string, params: any = {}): Promise<void> {
        try {
            if (!this.pool) {
                await this.connect();
            }
            const request = this.pool!.request();
            
            // Add parameters to the request
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value);
            });

            await request.query(query);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Executes a DELETE query
     * @param query The SQL query to execute
     * @param params Parameters for the query
     * @returns Promise<void>
     * @throws Error if query fails
     * @example
     * // Delete user
     * await Database.delete(
     *   'DELETE FROM users WHERE id = @id',
     *   { id: 1 }
     * );
     */
    public static async delete(query: string, params: any = {}): Promise<void> {
        try {
            if (!this.pool) {
                await this.connect();
            }
            const request = this.pool!.request();
            
            // Add parameters to the request
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value);
            });

            await request.query(query);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Begins a new transaction
     * @returns Promise<sql.Transaction> The transaction object
     */
    public static async beginTransaction(): Promise<sql.Transaction> {
        if (!this.pool) {
            await this.connect();
        }
        const transaction = new sql.Transaction(this.pool!);
        await transaction.begin();
        return transaction;
    }

    /**
     * Executes a query within a transaction
     * @param transaction The transaction object
     * @param query The SQL query to execute
     * @param params Parameters for the query
     * @returns Promise<any> The query results
     */
    public static async executeInTransaction(
        transaction: sql.Transaction,
        query: string,
        params: any = {}
    ): Promise<any> {
        const request = new sql.Request(transaction);
        
        // Add parameters to the request
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        return await request.query(query);
    }
} 