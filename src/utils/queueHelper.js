const {Pool} = require('pg');
const dotenv = require('dotenv');

dotenv.config();

//initialize postgres connection pool

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
    ssl :  {
        rejectUnauthorized: false,
    },
})

// add job and record it in postgres
async function addJob (queue, data, options = {}) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        //add job to bull queue
        const job = await queue.add(data, options);

        //record the job in postgres
        const result = await client.query(
            "INSERT INTO jobs (job_id, queue_name, data, status) VALUES ($1, $2, $3, $4) RETURNING id",
            [job.id.toString(), queue.name, JSON.stringify(data), 'pending']
        );

        await client.query('COMMIT');
        return {
            jobId: job.id,
            dbId: result.rows[0].id,
          };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}


//update job status in postgres
async function updateJobStatus(jobId, queueName, updates) {
    const client = await pool.connect();

 try {
    // build the set clause based on provided updates
    const setClauses = [];
    const values = [jobId, queueName];
    let paramIndex = 3;
    
    for (const [key, value] of Object.entries(updates)) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      if (setClauses.length === 0) {
        return 0;
      }

      await client.query(
        "UPDATE jobs SET ${setClause} WHERE job_id = $1 AND queue_name = $2",
        values
      );
 }   
 finally{
    client.release();
 }
}

module.exports ={
    addJob,
    updateJobStatus
}