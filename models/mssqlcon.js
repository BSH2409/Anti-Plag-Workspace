require('dotenv').config();
const sql = require('mysql');
const util = require('util');
const config = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_SERVER,
  multipleStatements: true,
  port: 3306,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}

var obj = {};

obj.query= async (query)=>{
     try{
        const conn = sql.createConnection(config);
        const qry = util.promisify(conn.query).bind(conn);
        
        const rows = await qry(query);
        //console.log(rows);
        conn.end();
        return rows;
    }
    catch(error){
        console.log(error);
        //sql.end();
        throw new Error(error.message);
    }
}

obj.callProcedure = async (proc,params)=>{
    try{
        const conn = sql.createConnection(config);
        const qry = util.promisify(conn.query).bind(conn);
        
        //const rows = await qry(`CALL ${proc}(${params.ch},'${params.username}','${params.password}')`);
        const rows = await qry(`CALL ${proc}(${params.ch},'${params.username}')`);
        //console.log(rows);
        conn.end();
        return rows;
    }
    catch(error){
        console.log(error);
        //sql.end();
        throw new Error(error.message);
    }
}
module.exports = obj;

