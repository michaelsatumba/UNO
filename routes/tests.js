const express = require("express");
const router = express.Router();
const db = require('../db');
const tables = require("../db/table_names");

router.get("/", (request, response) => {
    db.any(
        `INSERT INTO test_table ("testString") VALUES ('Hello at ${Date.now()}');`
    )
    .then((_)=> db.any(`SELECT * FROM test_table;`) )
    .then( result => response.json( result ) )
    .catch( error => {
        console.log( error );
        response.json({ error });
    });
});

// router.get("/tables", (req, res) => {
//     Promise.all(
//         Object.keys(tables).map((tableName) =>
//             db.any(`SELECT * FROM ${tables[tableName]};`)
//             .then((result) => ({
//             tableName,
//             result,
//             fields: Object.keys(result[0] || {}),
//             }))
//         )
//     )
//     .then((results) => {
//         console.log(results);
//         return results;
//     })
//     .then((results) => {
//         let dataTables = [];
//         let dataResults = [];
//         let dataFields = [];
//         for(var i = 0; i < results.length; i++) {
//             dataTables.push(results[i].tableName);
//             dataResults.push(results[i].result);
//             dataFields.push(results[i].fields);
//         }

//         res.render("test/tables", {
//             tableNames: dataTables,
//             data: dataResults,
//             fields: dataFields
//         })
//     })
// });

module.exports = router;
