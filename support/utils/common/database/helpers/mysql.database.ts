import * as mysql from 'mysql2/promise';

export class MySQLDatabase {
    private static pool: mysql.Pool | null = null;
    private static config: mysql.PoolOptions = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'flatfile_demo',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };

    /**
     * Initializes the database connection pool
     * @returns Promise<void>
     * @throws Error if connection fails
     */
    public static async connect(server?: string, user?: string, password?: string, database?: string): Promise<void> {
        try {
            if (!this.pool) {
                this.config.host = server || this.config.host;
                this.config.user = user || this.config.user;
                this.config.password = password || this.config.password;
                this.config.database = database || this.config.database;
                this.pool = mysql.createPool(this.config);
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
                await this.pool.end();
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
     * const user = await Database.select('SELECT * FROM users WHERE id = ?', [1]);
     */
    public static async select(query: string, params: any = []): Promise<any[]> {
        try {
            if (!this.pool) {
                await this.connect();
            }
            const [rows] = await this.pool!.execute(query, params);
            return rows as any[];
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
     *   'INSERT INTO users (name, email) VALUES (?, ?)',
     *   ['John', 'john@example.com']
     * );
     */
    public static async insert(query: string, params: any = []): Promise<void> {
        try {
            if (!this.pool) {
                await this.connect();
            }
            await this.pool!.execute(query, params);
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
     *   'UPDATE users SET email = ? WHERE id = ?',
     *   ['newemail@example.com', 1]
     * );
     */
    public static async update(query: string, params: any = []): Promise<void> {
        try {
            if (!this.pool) {
                await this.connect();
            }
            await this.pool!.execute(query, params);
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
     *   'DELETE FROM users WHERE id = ?',
     *   [1]
     * );
     */
    public static async delete(query: string, params: any = []): Promise<void> {
        try {
            if (!this.pool) {
                await this.connect();
            }
            await this.pool!.execute(query, params);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Begins a new transaction
     * @returns Promise<mysql.PoolConnection> The connection with active transaction
     */
    public static async beginTransaction(): Promise<mysql.PoolConnection> {
        if (!this.pool) {
            await this.connect();
        }
        const connection = await this.pool!.getConnection();
        await connection.beginTransaction();
        return connection;
    }

    /**
     * Executes a query within a transaction
     * @param connection The connection with active transaction
     * @param query The SQL query to execute
     * @param params Parameters for the query
     * @returns Promise<any> The query results
     */
    public static async executeInTransaction(
        connection: mysql.PoolConnection,
        query: string,
        params: any = []
    ): Promise<any> {
        const [results] = await connection.execute(query, params);
        return results;
    }
} 