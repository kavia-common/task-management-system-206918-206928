const { getDb } = require('../db/sqlite');

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this); // includes lastID, changes
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * PUBLIC_INTERFACE
 * List tasks sorted newest-first.
 *
 * @returns {Promise<Array<{id:number,description:string,created_at:string,completed:number}>>}
 */
async function listTasks() {
  /** This is a public function. */
  const db = getDb();
  return all(
    db,
    'SELECT id, description, created_at, completed\n' +
      'FROM tasks\n' +
      'ORDER BY datetime(created_at) DESC, id DESC'
  );
}

/**
 * PUBLIC_INTERFACE
 * Create a new task.
 *
 * @param {{description: string}} input task payload
 * @returns {Promise<{id:number,description:string,created_at:string,completed:number}>}
 */
async function createTask(input) {
  /** This is a public function. */
  const db = getDb();
  const description = input.description;

  const result = await run(
    db,
    'INSERT INTO tasks (description) VALUES (?)',
    [description]
  );

  const rows = await all(
    db,
    'SELECT id, description, created_at, completed FROM tasks WHERE id = ? LIMIT 1',
    [result.lastID]
  );

  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * Delete task by id.
 *
 * @param {number} id task id
 * @returns {Promise<boolean>} true if deleted, false if not found
 */
async function deleteTaskById(id) {
  /** This is a public function. */
  const db = getDb();
  const result = await run(db, 'DELETE FROM tasks WHERE id = ?', [id]);
  return result.changes > 0;
}

module.exports = {
  listTasks,
  createTask,
  deleteTaskById,
};

