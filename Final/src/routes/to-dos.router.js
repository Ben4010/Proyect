import  express  from "express";
import { getDB } from "../db/index.js";
import { validator } from "../middlewares/validator.js";

export const TodosRouter = express.Router();

//CRUD
TodosRouter.get("/to-dos", async function (request, response) {
    try {
        const db = await getDB();

        const todos = await db.all("SELECT * FROM todos");

        await db.close()

        response.send({todos});
    } catch (error) {
        response.status(500).send({
            message: "Something went wrong trying to get to dos", 
            error,
        });
    }
});

TodosRouter.post("/to-do", validator, async function (request, response) {
    try {
        const {title, description} = request.body;

        const db = await getDB();

        const queryInfo = await db.run(`
            INSERT INTO todos (title, description)
            VALUES (
                '${title}',
                '${description}'
            )
        `);

        await db.close();

        response.send({
            newTodo: {title, description},
            queryInfo,
        });

    } catch (error) {
        console.error(error)
        response.status(500).send({
            message: "Something went wrong trying to get to dos", 
            error,
        });
    }
});

TodosRouter.delete("/to-do/:id", async function (request, response) {
    try {
        const id = request.params.id;

        const db = await getDB();

        const todoExists = await db.get(
            'SELECT * FROM todos WHERE id = ?',
            id
        );
        if (!todoExists){
            return response.status(404).send({message: "To Do not Found"});
        }
        const deletionInfo = await db.run(
            'DELETE FROM todos WHERE id = ?',
            id
        );
        await db.close()
        response.send({deletionInfo})
    } catch (error) {
        response.status(500).send({
            message: "Something went wrong trying to get to dos", 
            error,
        });
    }
});

TodosRouter.patch("/to-do/:id", async function (request, response) {
    try {
        const {id} = request.params;
        const db = await getDB();
    
        const todoExists = await db.get(
            'SELECT * FROM todos WHERE id = ?',
            id
        );
        if (!todoExists){
            return response.status(404).send({message: "To Do not Found"});
        }

        const {title, description, isDone: is_done} = request.body;
        await db.run(
            `UPDATE todos
            SET title = ?, description = ?, is_done = ?
            WHERE id=?
        `, 
        title || todoExists.title, 
        description || todoExists.description, 
        is_done !== undefined ? is_done : todoExists.todoExists, 
        id
        );
        await db.close();
        
        response.send({message: "To Do Update"})

    } catch (error) {
        console.error(error)
        response.status(500).send({
            message: "Something went wrong trying to update to dos", 
            error,
        });
    }
});

