import db from '../../database/connection';

export default class Model {
    private table: string;

    constructor(table: string){
        this.table = table;
    }

    //get all table rows and return the result object:
    async get_all() {
        let cThis = this;
        return new Promise(function(myResolve, myReject) {
            db.query('SELECT * FROM ??',[cThis.table], function (error: any, result: any) {
                if (error) throw  error;
                myResolve( result );
            }); 
        }); 
    }

    //get row by id and return the result object:
    async find(id: any){
        let cThis = this;
        return new Promise(function(myResolve, myReject) {
        db.query('SELECT * FROM ?? WHERE id = ?',[cThis.table,id], function (error: any, result: any) {
            if (error) throw error;
                myResolve( result[0] );
            })
        }); 
    }

    //insert data via object such as {id: 1, title: 'Hello MySQL'} 
    async create(data: any){
        let cThis = this;
        return new Promise(function(myResolve, myReject) {  
            db.query('INSERT INTO ?? SET ?',[ cThis.table,data], function (error: any, result: any) {
                if (error) throw error;
                let data =  cThis.find(result.insertId);
                data.then( function(value){ myResolve( value )})
                .catch( function(error){ myReject(error)});
            });
        }); 
   }

    //update row and return new data as an object
    async update(id: any, data: any){
        let cThis = this;
        return new Promise(function(myResolve, myReject) {  
            db.query('UPDATE  ?? SET ? WHERE id = ?',[ cThis.table,data,id], function (error: any, result: any) {
                if (error) throw  error;
                let data =  cThis.find(id);
                data.then( function(value){ myResolve( value )})
                .catch( function(error){ myReject(error)});
            });
        }); 

    }

    //delete row and return info
    // {"fieldCount":0,"affectedRows":1,"insertId":0,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}
    async delete(id: any){
        let cThis = this;
        return new Promise(function(myResolve, myReject) {  
            db.query('DELETE FROM  ??  WHERE id = ?',[ cThis.table,id], function (error: any, result: any) {
                if (error) throw  error;
                myResolve( result )
            });
        }); 
    }
}