const {updateJobStatus} = require ('../utils/queueHelper');
const {Pool} = require ('pg');
const dotenv = require('dotenv');

dotenv.config();

// initizliae pg connection pool
const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnAuthorized: false,
    },
});

async function exportData (query, format){
    console.log(`Executing query: ${query}`);
    console.log(`Export format: ${format}`);

    // execute the query against postgres

    const result = await pool.query(query);

    //sumulate file creation

    await new Promise((resolve) => setTimeout(resolve,3000));

    return {
        records: result.rowCount,
        format: format,
        downloadUrl: `https://example.com/exports/${Date.now()}.${format}`,
        timestamp: new Date(),
      };
    }


async function processDataExportJob(job){
    try {
        await updateJobStatus(job.id, 'data-export', {
            status: 'active',
            started_at: new Date().toISOString(),
        });
    
    const {query, format} = job.data;

    const result = await exportData(query, format);

 
    await updateJobStatus(job.id, 'data-export', {
      status: 'completed',
      result: JSON.stringify(result),
      completed_at: new Date().toISOString(),
    });
    // Return the result
    return result;
  } catch (error) {
    // Update job status on failure
    await updateJobStatus(job.id, 'data-export', {
      status: 'failed',
      error: error.message,
      completed_at: new Date().toISOString(),
    });
    // Re-throw the error for Bull to handle
    throw error;
  }
}
module.exports = processDataExportJob;