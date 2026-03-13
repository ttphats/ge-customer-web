const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing database connection...');
  
  try {
    const connection = await mysql.createConnection({
      host: '202.92.4.66',
      port: 3306,
      user: 'jyndyeeuhosting_admin',
      password: 'Matkinhminhanh2025@',
      database: 'jyndyeeuhosting_minhanhdb'
    });

    console.log('✅ Connected to database successfully!');

    // Test query - get tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Tables in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    // Test customers table
    const [customers] = await connection.execute('SELECT COUNT(*) as count FROM customers');
    console.log(`\n👥 Total customers: ${customers[0].count}`);

    // Test prescriptions table
    const [prescriptions] = await connection.execute('SELECT COUNT(*) as count FROM prescription');
    console.log(`📋 Total prescriptions: ${prescriptions[0].count}`);

    await connection.end();
    console.log('\n✅ Connection test completed!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();

