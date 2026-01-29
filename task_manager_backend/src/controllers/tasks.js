const tasksRepo = require('../repositories/tasks');

class TasksController {
  /**
   * PUBLIC_INTERFACE
   * GET /tasks - list tasks.
   */
  async list(req, res, next) {
    /** This is a public function. */
    try {
      const tasks = await tasksRepo.listTasks();
      return res.status(200).json(tasks);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * POST /tasks - create a new task.
   * Body: { description: string }
   */
  async create(req, res, next) {
    /** This is a public function. */
    try {
      const { description } = req.body || {};

      if (typeof description !== 'string' || description.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error: "description" is required and must be a non-empty string.',
        });
      }

      // Reasonable guardrail
      if (description.trim().length > 500) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error: "description" must be <= 500 characters.',
        });
      }

      const created = await tasksRepo.createTask({ description: description.trim() });
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * DELETE /tasks/:id - delete a task by id.
   */
  async delete(req, res, next) {
    /** This is a public function. */
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error: "id" must be a positive integer.',
        });
      }

      const deleted = await tasksRepo.deleteTaskById(id);
      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: 'Task not found.',
        });
      }

      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new TasksController();

