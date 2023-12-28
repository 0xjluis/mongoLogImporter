import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

const uri = 'mongodb://127.0.0.1:27017'; // !! Update this before use plz 
const client = new MongoClient(uri);
const dbName = 'logs';
const baseLogDir = './ONLY_Monthly_Logs_Here';

async function connectToMongo() {
    console.log("Try to connect to Mongo...");
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Cannot connect to MongoDB', error);
        process.exit(1);
    }
}

async function importLogs() {
    try {
        const db = client.db(dbName);

        await connectToMongo();
        
        const monthlyLogDirs = fs.readdirSync(baseLogDir);

        console.log(monthlyLogDirs);

        for (const monthlyDir of monthlyLogDirs) {
            const monthlyDirPath = path.join(baseLogDir, monthlyDir);
            if (fs.statSync(monthlyDirPath).isDirectory()) {
                const monthlyCollectionName = monthlyDir.replace('-', '_');
                const collection = db.collection(monthlyCollectionName);
                const logFiles = fs.readdirSync(monthlyDirPath);
                
                console.log(logFiles);

                for (const fileName of logFiles) {
                    if (path.extname(fileName) === '.json') {
                        const filePath = path.join(monthlyDirPath, fileName);
                        const logData = fs.readFileSync(filePath, 'utf8');
                        const logEntries = logData.split('\n')
                            .filter(line => line)
                            .map(line => JSON.parse(line))
                            .map(entry => ({
                                dt: new Date(entry.dt),
                                msg: entry.message,
                                host: entry.syslog.hostname
                            }));
                        
                        await collection.insertMany(logEntries);
                        console.log(`Inserted logs from ${fileName} into collection ${monthlyCollectionName}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error importing logs', error);
    } finally {
        await client.close();
    }
}

importLogs();