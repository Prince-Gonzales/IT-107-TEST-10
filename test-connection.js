// Romeo


const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Testing Database Connection...');
console.log('Environment variables:');
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_PORT:', process.env.DB_PORT);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***hidden***' : 'NOT SET');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 1,
    connectionTimeoutMillis: 5000,
});

async function testConnection() {
    try {
        console.log('\n📡 Attempting to connect to PostgreSQL...');
        const client = await pool.connect();
        console.log('✅ Database connection successful!');
        
        console.log('\n🔍 Testing basic query...');
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Query successful! Current time:', result.rows[0].current_time);
        
        console.log('\n📋 Checking if tables exist...');
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        if (tables.rows.length > 0) {
            console.log('✅ Found tables:');
            tables.rows.forEach(row => console.log('  -', row.table_name));
        } else {
            console.log('⚠️  No tables found. You may need to run the database schema.');
        }
        
        client.release();
        console.log('\n🎉 All tests passed! Database is ready.');
        
    } catch (error) {
        console.error('\n❌ Database connection failed:');
        console.error('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Possible solutions:');
            console.log('1. Make sure PostgreSQL is running');
            console.log('2. Check if the database "student_note_app" exists');
            console.log('3. Verify username/password are correct');
            console.log('4. Check if PostgreSQL is running on port 5432');
        }
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testConnection();
