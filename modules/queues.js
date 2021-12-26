export class Queues {
  /**
   * @param {Number} [interval] - Default interval in ms beetween tasks running. Recommended >=10ms. Default - 10ms.
   */
  constructor(interval = 10) {
    this.queues = {};
    this.types = {
      AsyncFunction: (async () => {}).constructor,
    };
    this.interval = interval;
    this.registerQueue("main");
    this.runQueue("main");
  }

  /**
   * Just registers queue with provided interval.
   * @param {String} queueName - Name of queue, for enqueuing and unenqueuing tasks.
   * @param {Number} [interval] - Time of rest in ms beetween running tasks. If not defined - will be used default value from this.interval.
   */
  registerQueue(queueName, interval = this.interval) {
    this.queues[queueName] = {
      tasks: [],
      isStopped: true,
      interval,
      tmp: { countAttempts: 0 },
    };
  }

  /**
   * Executes the first task of the queue, until it not returns true and queue.isStopped is false.
   * @param {String} queueName - Name of Queue
   */
  async runQueue(queueName) {
    const queue = this.queues[queueName];
    queue.isStopped = false;
    while (!queue.isStopped) {
      const hasTasks = queue.tasks.length > 0;
      if (hasTasks) {
        const task = queue.tasks[0];
        const attempts = queue.tmp.countAttempts++;
        const result =
          task.cb instanceof this.types.AsyncFunction
            ? await task.cb(attempts)
            : task.cb(attempts);

        if (result) {
          queue.tasks.shift();
          queue.tmp.countAttempts = 0;
        }
      }
      await this._sleep(queue.interval);
    }
  }

  /**
   * Stops the queue.
   * @param {String} queueName - Name of Queue
   */
  stopQueue(queueName) {
    this.queues[queueName].isStopped = true;
  }

  /**
   * Enqueues a task with provded params, like taskName, queueName in the object.
   * @param {Object}   param0
   * @param {Function} param0.cb
   * @param {String}   [param0.taskName] - Name of task for unenqueue possibility.
   * @param {String}   [param0.queueName] - Name of queue. Default - "main".
   */
  enqueue({ cb, taskName, queueName = "main" }) {
    this.queues[queueName].tasks.push({ name: taskName, cb });
  }

  /**
   *
   * @param {Function} cb
   * @param {String}   [queueName] - Name of queue. Default - "main".
   */
  justEnqueue(cb, queueName) {
    this.enqueue({
      cb: async () => {
        const res = cb();
        if (res instanceof Promise) await res;
        return true;
      },
      queueName,
    });
  }
  /**
   * Unenqueues a task by name from the queue.
   * @param  {String} taskName - Name of task name for unenqueue it.
   * @param  {String} [queueName] - Name of queue for unenqueue task. Default "main".
   */
  unenqueue(taskName, queueName = "main") {
    this.queues[queueName].tasks = this.queues[queueName].tasks.filter(
      (task) => task.name != taskName
    );
  }

  /**
   * Async sleep function.
   * @param {Number} time - Time for sleep in ms.
   * @returns {Promise<undefined>} Just await it.
   */
  _sleep(time) {
    return new Promise((res) => setTimeout(res, time));
  }
}
