const { createClient } = require('redis');

async function testRedis() {
    console.log('Testing Redis Connection...');
    const redisUri = 'redis://default:ZCnnWwRPWtXsD5PxOpdH7WBC3c6oTGna@redis-14399.c311.eu-central-1-1.ec2.cloud.redislabs.com:14399';

    const client = createClient({
        url: redisUri,
        socket: {
            connectTimeout: 10000
        }
    });

    client.on('error', (err) => console.log('Redis Client Error', err));

    try {
        await client.connect();
        console.log('✅ Connection Successful!');

        await client.set('test_key', 'test_value');
        const val = await client.get('test_key');
        console.log('✅ Read/Write Test:', val);

        await client.quit();
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
    }
}

testRedis();
