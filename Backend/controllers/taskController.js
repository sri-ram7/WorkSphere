const Task = require('../models/Task');

const DEFAULT_DAYS = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'];
const DEFAULT_TASK_NAMES = ['Exercise', 'Read', 'Office', 'Learn', 'Sleep'];

const getDefaultTasksData = () =>
  DEFAULT_DAYS.map((day) => ({
    day,
    tasks: DEFAULT_TASK_NAMES.map((name) => ({
      name,
      type: name.toLowerCase(),
      completed: false,
    })),
  }));

const DEFAULT_WORKOUT_PLAN = {
  Monday: {
    theme: 'Speed + Strength',
    sections: [
      {
        id: 's1',
        title: 'Cardio',
        exercises: [{ id: 'e1', name: 'Run', detail: '2.5 km easy pace', done: false }],
      },
      {
        id: 's2',
        title: 'Speed',
        exercises: [{ id: 'e2', name: '4 × 100 m sprints', detail: 'Rest 60–90 sec between', done: false }],
      },
      {
        id: 's3',
        title: 'Strength',
        exercises: [
          { id: 'e3', name: 'Push-ups', detail: '3 × 15', done: false },
          { id: 'e4', name: 'Squats', detail: '3 × 15', done: false },
          { id: 'e5', name: 'Plank', detail: '3 × 40 sec', done: false },
        ],
      },
      {
        id: 's4',
        title: 'Stretch',
        exercises: [{ id: 'e6', name: 'Full body stretching', detail: '5 minutes', done: false }],
      },
    ],
  },
  Tuesday: {
    theme: 'Rest Day',
    sections: [
      {
        id: 's5',
        title: 'Full rest',
        exercises: [{ id: 'e7', name: 'Rest', detail: 'Full rest', done: false }],
      },
      {
        id: 's6',
        title: 'Optional',
        exercises: [
          { id: 'e8', name: 'Light walking', detail: '', done: false },
          { id: 'e9', name: 'Stretching', detail: '', done: false },
        ],
      },
    ],
  },
  Wednesday: {
    theme: 'Cardio + Upper Body',
    sections: [
      {
        id: 's7',
        title: 'Warm-up',
        exercises: [{ id: 'e10', name: 'Dynamic warm-up', detail: '5 minutes', done: false }],
      },
      {
        id: 's8',
        title: 'Cardio',
        exercises: [{ id: 'e11', name: 'Run', detail: '3 km steady pace', done: false }],
      },
      {
        id: 's9',
        title: 'Strength',
        exercises: [
          { id: 'e12', name: 'Push-ups', detail: '4 × 12', done: false },
          { id: 'e13', name: 'Pull-ups', detail: '3 × 8', done: false },
          { id: 'e14', name: 'Bench dips', detail: '3 × 10', done: false },
        ],
      },
      {
        id: 's10',
        title: 'Core',
        exercises: [
          { id: 'e15', name: 'Plank', detail: '3 × 40 sec', done: false },
          { id: 'e16', name: 'Mountain climbers', detail: '3 × 25', done: false },
        ],
      },
      {
        id: 's11',
        title: 'Stretch',
        exercises: [{ id: 'e17', name: 'Stretching', detail: '5 minutes', done: false }],
      },
    ],
  },
  Thursday: {
    theme: 'Legs + Core',
    sections: [
      {
        id: 's12',
        title: 'Warm-up',
        exercises: [{ id: 'e18', name: 'Brisk walk', detail: '5 minutes', done: false }],
      },
      {
        id: 's13',
        title: 'Workout',
        exercises: [
          { id: 'e19', name: 'Squats', detail: '4 × 15', done: false },
          { id: 'e20', name: 'Lunges', detail: '3 × 12 each leg', done: false },
          { id: 'e21', name: 'Calf raises', detail: '3 × 20', done: false },
          { id: 'e22', name: 'Glute bridges', detail: '3 × 15', done: false },
        ],
      },
      {
        id: 's14',
        title: 'Core',
        exercises: [
          { id: 'e23', name: 'Leg raises', detail: '3 × 20', done: false },
          { id: 'e24', name: 'Plank', detail: '3 × 40 sec', done: false },
        ],
      },
      {
        id: 's15',
        title: 'Cool down',
        exercises: [{ id: 'e25', name: 'Light stretching', detail: '', done: false }],
      },
    ],
  },
  Friday: {
    theme: 'Cardio + Arms',
    sections: [
      {
        id: 's16',
        title: 'Cardio',
        exercises: [{ id: 'e26', name: 'Run', detail: '3 km easy pace', done: false }],
      },
      {
        id: 's17',
        title: 'Arms',
        exercises: [
          { id: 'e27', name: 'Pull-ups', detail: '3 × 8', done: false },
          { id: 'e28', name: 'Bench dips', detail: '3 × 12', done: false },
          { id: 'e29', name: 'Diamond push-ups', detail: '3 × 10', done: false },
          { id: 'e30', name: 'Pike push-ups', detail: '3 × 12', done: false },
        ],
      },
      {
        id: 's18',
        title: 'Core',
        exercises: [{ id: 'e31', name: 'Plank', detail: '3 × 40 sec', done: false }],
      },
      {
        id: 's19',
        title: 'Stretch',
        exercises: [{ id: 'e32', name: 'Stretching', detail: '5 minutes', done: false }],
      },
    ],
  },
  Saturday: {
    theme: 'Recovery Day',
    sections: [
      {
        id: 's20',
        title: 'Light walk',
        exercises: [{ id: 'e33', name: 'Walk', detail: '2 km', done: false }],
      },
      {
        id: 's21',
        title: 'Mobility stretching',
        exercises: [
          { id: 'e34', name: 'Hip mobility', detail: '', done: false },
          { id: 'e35', name: 'Hamstring stretch', detail: '', done: false },
          { id: 'e36', name: 'Ankle mobility', detail: '', done: false },
        ],
      },
      {
        id: 's22',
        title: 'Relaxation breathing',
        exercises: [{ id: 'e37', name: 'Breathing', detail: '5 minutes', done: false }],
      },
    ],
  },
  Sunday: {
    theme: 'Long Run Day',
    sections: [
      {
        id: 's23',
        title: 'Warm-up',
        exercises: [{ id: 'e38', name: 'Light jogging', detail: '5 minutes', done: false }],
      },
      {
        id: 's24',
        title: 'Cardio',
        exercises: [{ id: 'e39', name: 'Long run', detail: '7 km easy pace', done: false }],
      },
      {
        id: 's25',
        title: 'Cool down',
        exercises: [{ id: 'e40', name: 'Walk', detail: '5 minutes', done: false }],
      },
      {
        id: 's26',
        title: 'Stretch',
        exercises: [{ id: 'e41', name: 'Full leg stretching', detail: '10 minutes', done: false }],
      },
    ],
  },
};

const getTasks = async (req, res, next) => {
  try {
    let taskDoc = await Task.findOne({ user: req.user._id });

    if (!taskDoc) {
      taskDoc = await Task.create({
        user: req.user._id,
        tasksData: getDefaultTasksData(),
        workoutPlan: DEFAULT_WORKOUT_PLAN,
      });
    }

    res.status(200).json({
      success: true,
      tasksData: taskDoc.tasksData,
      workoutPlan: taskDoc.workoutPlan || DEFAULT_WORKOUT_PLAN,
    });
  } catch (error) {
    next(error);
  }
};

const saveTasks = async (req, res, next) => {
  try {
    const { tasksData, workoutPlan } = req.body;
    console.log('📝 saveTasks request:', { hasTasksData: !!tasksData, hasWorkoutPlan: !!workoutPlan, userId: req.user._id });

    if (tasksData !== undefined && !Array.isArray(tasksData)) {
      return res.status(400).json({ success: false, message: 'tasksData must be an array when provided' });
    }

    const updateDoc = {};
    if (tasksData !== undefined) updateDoc.tasksData = tasksData;
    if (workoutPlan !== undefined && typeof workoutPlan === 'object') updateDoc.workoutPlan = workoutPlan;

    console.log('💾 Saving tasks update...');
    const taskDoc = await Task.findOneAndUpdate(
      { user: req.user._id },
      updateDoc,
      { new: true, upsert: true, runValidators: true }
    );
    console.log('✅ Tasks saved successfully');

    res.status(200).json({
      success: true,
      message: 'Tasks and workout saved',
      tasksData: taskDoc.tasksData,
      workoutPlan: taskDoc.workoutPlan || DEFAULT_WORKOUT_PLAN,
    });
  } catch (error) {
    console.error('❌ saveTasks error:', error.message);
    next(error);
  }
};

const toggleTask = async (req, res, next) => {
  try {
    const { day, taskId } = req.body;
    console.log('✓ toggleTask request:', { day, taskId, userId: req.user._id });

    if (!day || !taskId) {
      return res.status(400).json({ success: false, message: 'day and taskId are required' });
    }

    const taskDoc = await Task.findOne({ user: req.user._id });
    if (!taskDoc) {
      // Create if doesn't exist
      const newTaskDoc = await Task.create({
        user: req.user._id,
        tasksData: getDefaultTasksData(),
        workoutPlan: DEFAULT_WORKOUT_PLAN,
      });
      
      const dayData = newTaskDoc.tasksData.find((d) => d.day === day);
      if (!dayData) {
        return res.status(404).json({ success: false, message: `No tasks found for ${day}` });
      }

      const task = dayData.tasks.id(taskId);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      task.completed = !task.completed;
      await newTaskDoc.save();

      return res.status(200).json({
        success: true,
        message: 'Task toggled',
        tasksData: newTaskDoc.tasksData,
        workoutPlan: newTaskDoc.workoutPlan || DEFAULT_WORKOUT_PLAN,
      });
    }

    // Ensure tasksData is an array
    if (!Array.isArray(taskDoc.tasksData)) {
      taskDoc.tasksData = getDefaultTasksData();
    }

    const dayData = taskDoc.tasksData.find((d) => d.day === day);
    if (!dayData) {
      return res.status(404).json({ success: false, message: `No tasks found for ${day}` });
    }

    const task = dayData.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.completed = !task.completed;
    console.log('💾 Saving task update...');
    await taskDoc.save();
    console.log('✅ Task saved successfully');

    res.status(200).json({
      success: true,
      message: 'Task toggled',
      tasksData: taskDoc.tasksData,
      workoutPlan: taskDoc.workoutPlan || DEFAULT_WORKOUT_PLAN,
    });
  } catch (error) {
    console.error('❌ toggleTask error:', error.message);
    next(error);
  }
};

const addTask = async (req, res, next) => {
  try {
    const { day, name, type = 'custom' } = req.body;

    if (!day || !name) {
      return res.status(400).json({ success: false, message: 'day and name are required' });
    }

    let taskDoc = await Task.findOne({ user: req.user._id });
    if (!taskDoc) {
      taskDoc = await Task.create({
        user: req.user._id,
        tasksData: getDefaultTasksData(),
        workoutPlan: DEFAULT_WORKOUT_PLAN,
      });
    }

    const dayData = taskDoc.tasksData.find((d) => d.day === day);
    if (!dayData) {
      return res.status(404).json({ success: false, message: `Day ${day} not found` });
    }

    dayData.tasks.push({ name: name.trim(), type, completed: false });
    await taskDoc.save();

    res.status(201).json({
      success: true,
      message: 'Task added',
      tasksData: taskDoc.tasksData,
      workoutPlan: taskDoc.workoutPlan || DEFAULT_WORKOUT_PLAN,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { day, taskId } = req.params;

    const taskDoc = await Task.findOne({ user: req.user._id });
    if (!taskDoc) {
      return res.status(404).json({ success: false, message: 'Task document not found' });
    }

    const dayData = taskDoc.tasksData.find((d) => d.day === day);
    if (!dayData) {
      return res.status(404).json({ success: false, message: `Day ${day} not found` });
    }

    dayData.tasks = dayData.tasks.filter((t) => t._id.toString() !== taskId);
    await taskDoc.save();

    res.status(200).json({
      success: true,
      message: 'Task deleted',
      tasksData: taskDoc.tasksData,
      workoutPlan: taskDoc.workoutPlan || DEFAULT_WORKOUT_PLAN,
    });
  } catch (error) {
    next(error);
  }
};

const resetAllTasks = async (req, res, next) => {
  try {
    const taskDoc = await Task.findOne({ user: req.user._id });
    if (!taskDoc) {
      return res.status(404).json({ success: false, message: 'Task document not found' });
    }

    taskDoc.tasksData.forEach((day) => {
      day.tasks.forEach((task) => { task.completed = false; });
    });

    await taskDoc.save();

    res.status(200).json({
      success: true,
      message: 'All tasks reset',
      tasksData: taskDoc.tasksData,
      workoutPlan: taskDoc.workoutPlan || DEFAULT_WORKOUT_PLAN,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, saveTasks, toggleTask, addTask, deleteTask, resetAllTasks };

