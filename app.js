const AstraMind = {
  data: {
    goals: [],
    activeGoalId: null,
    disciplineScore: 0,
    totalFocusMinutes: 0,
    streak: 0,
    lastActiveDate: null,
    achievements: [],
    history: [],
    dailyTasks: [],
    completedTasksCount: 0
  },

  init() {
    this.loadData();
    this.checkInitialScreen();
    this.attachEventListeners();
    this.updateStreak();
  },

  loadData() {
    const stored = localStorage.getItem('astraMindData');
    if (stored) {
      this.data = { ...this.data, ...JSON.parse(stored) };
    }
  },

  saveData() {
    localStorage.setItem('astraMindData', JSON.stringify(this.data));
  },

  checkInitialScreen() {
    if (!this.data.goals.length) {
      this.showScreen('welcome');
    } else {
      if (!this.data.activeGoalId) {
        this.data.activeGoalId = this.data.goals[0].id;
      }
      this.showScreen('dashboard');
      this.loadDashboard();
    }
  },

  showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`${screenName}-screen`).classList.add('active');
  },

  showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageName}`).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

    if (pageName === 'dashboard') this.loadDashboard();
    if (pageName === 'breakdown') this.loadBreakdown();
    if (pageName === 'projection') this.loadProjection();
    if (pageName === 'analytics') this.loadAnalytics();
    if (pageName === 'goals') this.loadGoalsPage();
  },

  attachEventListeners() {
    document.getElementById('get-started-btn').addEventListener('click', () => {
      this.showScreen('goal-setup');
    });

    document.getElementById('goal-setup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.createGoal();
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        this.showPage(item.dataset.page);
      });
    });

    document.getElementById('timer-start').addEventListener('click', () => this.startTimer());
    document.getElementById('timer-pause').addEventListener('click', () => this.pauseTimer());
    document.getElementById('timer-reset').addEventListener('click', () => this.resetTimer());

    document.getElementById('add-task-btn').addEventListener('click', () => {
      document.getElementById('task-modal').classList.add('show');
    });

    document.getElementById('save-task-btn').addEventListener('click', () => this.addCustomTask());
    document.getElementById('cancel-task-btn').addEventListener('click', () => {
      document.getElementById('task-modal').classList.remove('show');
    });

    document.getElementById('close-achievement').addEventListener('click', () => {
      document.getElementById('achievement-popup').classList.remove('show');
    });

    document.getElementById('create-new-goal-btn').addEventListener('click', () => {
      this.showScreen('goal-setup');
    });

    document.getElementById('edit-goal-btn').addEventListener('click', () => this.editCurrentGoal());
    document.getElementById('delete-goal-btn').addEventListener('click', () => this.deleteCurrentGoal());
    document.getElementById('export-data-btn').addEventListener('click', () => this.exportData());
    document.getElementById('clear-data-btn').addEventListener('click', () => this.clearAllData());
  },

  createGoal() {
    const goal = {
      id: Date.now().toString(),
      title: document.getElementById('goal-title').value,
      targetDate: document.getElementById('target-date').value,
      skillLevel: document.getElementById('skill-level').value,
      weeklyHours: parseInt(document.getElementById('weekly-hours').value),
      focusArea: document.getElementById('focus-area').value,
      createdAt: new Date().toISOString(),
      breakdown: null
    };

    goal.breakdown = this.generateBreakdown(goal);
    this.data.goals.push(goal);
    this.data.activeGoalId = goal.id;

    this.generateDailyTasks();
    this.saveData();
    this.showScreen('dashboard');
    this.loadDashboard();
  },

  generateBreakdown(goal) {
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    const weeksRemaining = Math.ceil(daysRemaining / 7);
    const monthsRemaining = Math.ceil(daysRemaining / 30);
    const totalHoursAvailable = weeksRemaining * goal.weeklyHours;

    const skillMultiplier = {
      'beginner': 1.5,
      'intermediate': 1.2,
      'advanced': 1.0
    };

    const estimatedHoursNeeded = Math.floor(totalHoursAvailable * skillMultiplier[goal.skillLevel]);

    const milestones = this.generateMilestones(goal, monthsRemaining);
    const weeklyGoals = this.generateWeeklyGoals(goal, weeksRemaining);

    return {
      daysRemaining,
      weeksRemaining,
      monthsRemaining,
      totalHoursAvailable,
      estimatedHoursNeeded,
      milestones,
      weeklyGoals,
      dailyHoursTarget: (goal.weeklyHours / 7).toFixed(1)
    };
  },

  generateMilestones(goal, months) {
    const milestoneTemplates = {
      tech: [
        { title: 'Foundation & Setup', tasks: ['Set up development environment', 'Learn core syntax and basics', 'Complete introductory tutorials', 'Build first simple project'] },
        { title: 'Core Concepts Mastery', tasks: ['Deep dive into fundamental concepts', 'Practice data structures & algorithms', 'Build intermediate projects', 'Code review and refactoring'] },
        { title: 'Advanced Implementation', tasks: ['Learn advanced patterns and practices', 'Work on complex projects', 'Contribute to open source', 'Build portfolio projects'] },
        { title: 'Specialization & Optimization', tasks: ['Master specific frameworks/tools', 'Performance optimization', 'Security best practices', 'Deploy production applications'] },
        { title: 'Expert Level & Teaching', tasks: ['Build advanced full-stack applications', 'Mentor others and write documentation', 'Contribute to community', 'Achieve mastery certification'] }
      ],
      science: [
        { title: 'Fundamentals', tasks: ['Study core principles', 'Complete foundational courses', 'Lab work and experiments', 'Research paper reviews'] },
        { title: 'Specialized Knowledge', tasks: ['Advanced topic studies', 'Specialized experiments', 'Data analysis', 'Research methodology'] },
        { title: 'Research & Application', tasks: ['Independent research project', 'Publish findings', 'Collaborate with peers', 'Present at conferences'] },
        { title: 'Mastery', tasks: ['Advanced research', 'Innovation and discovery', 'Peer recognition', 'Teaching and mentoring'] }
      ],
      business: [
        { title: 'Business Fundamentals', tasks: ['Learn business basics', 'Market research', 'Business model development', 'Financial planning'] },
        { title: 'Strategy & Planning', tasks: ['Competitive analysis', 'Strategic planning', 'Operations setup', 'Team building'] },
        { title: 'Execution & Growth', tasks: ['Launch and iterate', 'Customer acquisition', 'Revenue generation', 'Scale operations'] },
        { title: 'Optimization & Leadership', tasks: ['Process optimization', 'Leadership development', 'Market expansion', 'Sustainable growth'] }
      ],
      creative: [
        { title: 'Skill Development', tasks: ['Learn core techniques', 'Daily practice sessions', 'Study great works', 'Basic project completion'] },
        { title: 'Style & Voice', tasks: ['Develop unique style', 'Experiment with techniques', 'Portfolio building', 'Seek feedback'] },
        { title: 'Professional Work', tasks: ['Client projects', 'Portfolio refinement', 'Networking', 'Exhibition/publication'] },
        { title: 'Mastery & Recognition', tasks: ['Signature work creation', 'Professional recognition', 'Teaching others', 'Industry impact'] }
      ],
      personal: [
        { title: 'Self-Assessment', tasks: ['Identify areas for growth', 'Set clear objectives', 'Create action plan', 'Build support system'] },
        { title: 'Habit Formation', tasks: ['Daily practice', 'Track progress', 'Overcome obstacles', 'Celebrate small wins'] },
        { title: 'Consistent Growth', tasks: ['Maintain momentum', 'Deepen practices', 'Expand capabilities', 'Help others'] },
        { title: 'Transformation', tasks: ['Achieve major milestones', 'Sustainable lifestyle change', 'Inspire others', 'Continuous improvement'] }
      ],
      other: [
        { title: 'Foundation', tasks: ['Research and planning', 'Gather resources', 'Initial learning', 'First steps'] },
        { title: 'Development', tasks: ['Skill building', 'Regular practice', 'Intermediate achievements', 'Feedback integration'] },
        { title: 'Advancement', tasks: ['Advanced techniques', 'Complex projects', 'Performance improvement', 'Recognition'] },
        { title: 'Mastery', tasks: ['Expert level work', 'Teaching others', 'Innovation', 'Legacy building'] }
      ]
    };

    let templates = milestoneTemplates[goal.focusArea] || milestoneTemplates.other;
    const numMilestones = Math.min(Math.max(4, Math.ceil(months / 2)), templates.length);

    return templates.slice(0, numMilestones).map((template, index) => ({
      id: index + 1,
      title: template.title,
      tasks: template.tasks,
      targetMonth: Math.ceil((index + 1) * (months / numMilestones))
    }));
  },

  generateWeeklyGoals(goal, weeks) {
    const goalsPerWeek = [
      'Study fundamentals for 1 hour daily',
      'Complete practice exercises',
      'Build a small project',
      'Review and reflect on progress',
      'Seek feedback and improve'
    ];

    return Array.from({ length: Math.min(weeks, 12) }, (_, i) => ({
      week: i + 1,
      goals: goalsPerWeek
    }));
  },

  generateDailyTasks() {
    const activeGoal = this.getActiveGoal();
    if (!activeGoal) return;

    const today = new Date().toDateString();
    const existingTasks = this.data.dailyTasks.filter(t => t.date === today);

    if (existingTasks.length > 0) {
      return;
    }

    const taskTemplates = [
      `Study ${activeGoal.focusArea} for ${activeGoal.breakdown.dailyHoursTarget} hours`,
      'Complete one practice exercise or tutorial',
      'Review yesterday\'s learnings',
      'Work on current project milestone',
      'Document progress and insights'
    ];

    this.data.dailyTasks = taskTemplates.map((task, index) => ({
      id: Date.now() + index,
      text: task,
      completed: false,
      date: today
    }));

    this.saveData();
  },

  getActiveGoal() {
    return this.data.goals.find(g => g.id === this.data.activeGoalId);
  },

  loadDashboard() {
    const goal = this.getActiveGoal();
    if (!goal) return;

    document.getElementById('dashboard-greeting').textContent = this.getGreeting();
    document.getElementById('current-goal-title').textContent = goal.title;
    document.getElementById('streak-count').textContent = this.data.streak;
    document.getElementById('user-level').textContent = this.getLevel();
    document.getElementById('discipline-score').textContent = this.data.disciplineScore;

    const level = this.getLevelInfo();
    const progress = ((this.data.disciplineScore - level.min) / (level.max - level.min)) * 100;
    document.getElementById('level-progress').style.width = `${progress}%`;
    document.getElementById('points-to-next').textContent = level.max - this.data.disciplineScore;

    document.getElementById('total-focus-time').textContent = (this.data.totalFocusMinutes / 60).toFixed(1);

    this.generateDailyTasks();
    this.renderDailyTasks();
    this.renderAchievements();
    this.showMotivation();
  },

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  },

  getLevel() {
    if (this.data.disciplineScore < 100) return 'Bronze';
    if (this.data.disciplineScore < 300) return 'Silver';
    if (this.data.disciplineScore < 600) return 'Gold';
    return 'Elite';
  },

  getLevelInfo() {
    const score = this.data.disciplineScore;
    if (score < 100) return { name: 'Bronze', min: 0, max: 100 };
    if (score < 300) return { name: 'Silver', min: 100, max: 300 };
    if (score < 600) return { name: 'Gold', min: 300, max: 600 };
    return { name: 'Elite', min: 600, max: 1000 };
  },

  renderDailyTasks() {
    const container = document.getElementById('daily-tasks');
    const today = new Date().toDateString();
    const todayTasks = this.data.dailyTasks.filter(t => t.date === today);

    if (todayTasks.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No tasks for today. Click + Add Task to create one.</p>';
      return;
    }

    container.innerHTML = todayTasks.map(task => `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
        <span class="task-text">${task.text}</span>
      </div>
    `).join('');

    container.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        const taskId = parseInt(taskItem.dataset.taskId);
        this.toggleTask(taskId);
      });
    });
  },

  toggleTask(taskId) {
    const task = this.data.dailyTasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    if (task.completed) {
      this.data.disciplineScore += 10;
      this.data.completedTasksCount++;
      this.checkAchievements();
      this.recordHistory('task_completed', 10);
    } else {
      this.data.disciplineScore = Math.max(0, this.data.disciplineScore - 10);
      this.data.completedTasksCount--;
    }

    this.saveData();
    this.renderDailyTasks();
    this.loadDashboard();
  },

  addCustomTask() {
    const input = document.getElementById('new-task-input');
    const taskText = input.value.trim();

    if (!taskText) return;

    const today = new Date().toDateString();
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      date: today
    };

    this.data.dailyTasks.push(newTask);
    this.saveData();
    this.renderDailyTasks();

    input.value = '';
    document.getElementById('task-modal').classList.remove('show');
  },

  startTimer() {
    if (this.timerInterval) return;

    this.timerSeconds = this.timerSeconds || 25 * 60;
    document.querySelector('.timer-circle').classList.add('active');
    document.getElementById('timer-start').style.display = 'none';
    document.getElementById('timer-pause').style.display = 'inline-block';

    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      this.updateTimerDisplay();

      if (this.timerSeconds <= 0) {
        this.completeTimer();
      }
    }, 1000);
  },

  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      document.querySelector('.timer-circle').classList.remove('active');
      document.getElementById('timer-start').style.display = 'inline-block';
      document.getElementById('timer-pause').style.display = 'none';
    }
  },

  resetTimer() {
    this.pauseTimer();
    this.timerSeconds = 25 * 60;
    this.updateTimerDisplay();
  },

  completeTimer() {
    this.pauseTimer();
    this.data.totalFocusMinutes += 25;
    this.data.disciplineScore += 15;
    this.recordHistory('focus_session', 15);
    this.checkAchievements();
    this.saveData();
    this.loadDashboard();
    this.timerSeconds = 25 * 60;
    this.updateTimerDisplay();

    this.showNotification('Focus Session Complete!', 'Great work! You completed 25 minutes of focused work.');
  },

  updateTimerDisplay() {
    const minutes = Math.floor(this.timerSeconds / 60);
    const seconds = this.timerSeconds % 60;
    document.getElementById('timer-value').textContent =
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  updateStreak() {
    const today = new Date().toDateString();
    const lastActive = this.data.lastActiveDate;

    if (!lastActive) {
      this.data.streak = 1;
      this.data.lastActiveDate = today;
    } else if (lastActive !== today) {
      const lastDate = new Date(lastActive);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.data.streak++;
      } else if (diffDays > 1) {
        this.data.streak = 1;
      }

      this.data.lastActiveDate = today;
    }

    this.saveData();
  },

  checkAchievements() {
    const achievements = [
      { id: 'first_focus', name: 'First Focus', description: 'Complete your first focus session', icon: '🎯', condition: () => this.data.totalFocusMinutes >= 25 },
      { id: 'five_streak', name: '5-Day Warrior', description: 'Maintain a 5-day streak', icon: '🔥', condition: () => this.data.streak >= 5 },
      { id: 'ten_hours', name: '10 Hour Hero', description: 'Complete 10 hours of focused work', icon: '⏰', condition: () => this.data.totalFocusMinutes >= 600 },
      { id: 'hundred_tasks', name: 'Task Master', description: 'Complete 100 tasks', icon: '✅', condition: () => this.data.completedTasksCount >= 100 },
      { id: 'silver_level', name: 'Silver Achiever', description: 'Reach Silver level', icon: '🥈', condition: () => this.data.disciplineScore >= 100 },
      { id: 'gold_level', name: 'Gold Champion', description: 'Reach Gold level', icon: '🥇', condition: () => this.data.disciplineScore >= 300 },
      { id: 'elite_level', name: 'Elite Master', description: 'Reach Elite level', icon: '👑', condition: () => this.data.disciplineScore >= 600 }
    ];

    achievements.forEach(achievement => {
      if (!this.data.achievements.includes(achievement.id) && achievement.condition()) {
        this.unlockAchievement(achievement);
      }
    });
  },

  unlockAchievement(achievement) {
    this.data.achievements.push(achievement.id);
    this.saveData();
    this.showAchievementPopup(achievement);
  },

  showAchievementPopup(achievement) {
    document.getElementById('achievement-title').textContent = achievement.name;
    document.getElementById('achievement-description').textContent = achievement.description;
    document.getElementById('achievement-popup').classList.add('show');
  },

  renderAchievements() {
    const allAchievements = [
      { id: 'first_focus', name: 'First Focus', description: 'Complete your first focus session', icon: '🎯' },
      { id: 'five_streak', name: '5-Day Warrior', description: 'Maintain a 5-day streak', icon: '🔥' },
      { id: 'ten_hours', name: '10 Hour Hero', description: 'Complete 10 hours of focused work', icon: '⏰' },
      { id: 'hundred_tasks', name: 'Task Master', description: 'Complete 100 tasks', icon: '✅' },
      { id: 'silver_level', name: 'Silver Achiever', description: 'Reach Silver level', icon: '🥈' },
      { id: 'gold_level', name: 'Gold Champion', description: 'Reach Gold level', icon: '🥇' }
    ];

    const container = document.getElementById('achievements-list');
    container.innerHTML = allAchievements.map(ach => {
      const unlocked = this.data.achievements.includes(ach.id);
      return `
        <div class="achievement-badge ${unlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${ach.icon}</div>
          <div class="achievement-name">${ach.name}</div>
          <div class="achievement-desc">${unlocked ? 'Unlocked!' : 'Locked'}</div>
        </div>
      `;
    }).join('');
  },

  showMotivation() {
    const messages = [
      'You\'re building momentum. Every action compounds.',
      'Small actions, repeated daily, create extraordinary results.',
      'Consistency beats intensity. Show up every day.',
      'Your future self will thank you for the work you do today.',
      'Discipline is choosing between what you want now and what you want most.',
      'Success is the sum of small efforts repeated day in and day out.',
      'The only way to do great work is to love what you do.',
      'Don\'t watch the clock; do what it does. Keep going.',
      'Your limitation—it\'s only your imagination.',
      'Great things never come from comfort zones.'
    ];

    let message;
    if (this.data.streak >= 7) {
      message = `Amazing! ${this.data.streak} days of consistency. You're unstoppable!`;
    } else if (this.data.disciplineScore >= 500) {
      message = 'You\'re at an elite level. Your discipline is inspiring!';
    } else if (this.data.totalFocusMinutes >= 300) {
      message = 'Your focus time is impressive. Keep pushing forward!';
    } else {
      message = messages[Math.floor(Math.random() * messages.length)];
    }

    document.getElementById('motivation-message').textContent = message;
  },

  loadBreakdown() {
    const goal = this.getActiveGoal();
    if (!goal || !goal.breakdown) return;

    const container = document.getElementById('breakdown-content');

    const summaryHtml = `
      <div class="glass-card" style="margin-bottom: 32px; text-align: center;">
        <h2 style="margin-bottom: 24px; color: var(--primary);">${goal.title}</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 24px;">
          <div>
            <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Time Remaining</h4>
            <p style="font-size: 2rem; font-weight: 700; color: var(--primary);">${goal.breakdown.daysRemaining} days</p>
          </div>
          <div>
            <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Available Hours</h4>
            <p style="font-size: 2rem; font-weight: 700; color: var(--success);">${goal.breakdown.totalHoursAvailable}h</p>
          </div>
          <div>
            <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Daily Target</h4>
            <p style="font-size: 2rem; font-weight: 700; color: var(--secondary);">${goal.breakdown.dailyHoursTarget}h</p>
          </div>
        </div>
      </div>
    `;

    const milestonesHtml = goal.breakdown.milestones.map(milestone => `
      <div class="glass-card milestone-card">
        <div class="milestone-number">${milestone.id}</div>
        <div class="milestone-header">
          <h3 class="milestone-title">${milestone.title}</h3>
        </div>
        <div class="milestone-tasks">
          ${milestone.tasks.map(task => `<div class="milestone-task">• ${task}</div>`).join('')}
        </div>
        <p style="margin-top: 16px; color: var(--text-secondary); font-size: 0.9rem;">Target: Month ${milestone.targetMonth}</p>
      </div>
    `).join('');

    container.innerHTML = summaryHtml + milestonesHtml;
  },

  loadProjection() {
    const goal = this.getActiveGoal();
    if (!goal) return;

    const currentHoursPerDay = this.data.totalFocusMinutes / 60 / Math.max(this.data.streak, 1);
    const projectedHoursIn365Days = currentHoursPerDay * 365;
    const projectedScore = this.data.disciplineScore + (365 * 2);

    const summaryText = `Based on your current consistency of ${currentHoursPerDay.toFixed(1)} hours per day,
    you will complete approximately ${projectedHoursIn365Days.toFixed(0)} hours of focused work in the next year.
    Your discipline score will reach approximately ${projectedScore} points, placing you at the ${projectedScore >= 600 ? 'Elite' : projectedScore >= 300 ? 'Gold' : 'Silver'} level.
    Continue your daily practice, and you'll achieve remarkable growth!`;

    document.getElementById('projection-summary-text').textContent = summaryText;

    const ctx = document.getElementById('projection-chart');
    if (this.projectionChart) {
      this.projectionChart.destroy();
    }

    const labels = [];
    const hoursData = [];
    const scoreData = [];

    for (let month = 0; month <= 12; month++) {
      labels.push(`Month ${month}`);
      hoursData.push((currentHoursPerDay * 30 * month).toFixed(0));
      scoreData.push(this.data.disciplineScore + (month * 30 * 2));
    }

    this.projectionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Projected Focus Hours',
            data: hoursData,
            borderColor: '#4DA3FF',
            backgroundColor: 'rgba(77, 163, 255, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Projected Discipline Score',
            data: scoreData,
            borderColor: '#8A6CFF',
            backgroundColor: 'rgba(138, 108, 255, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: '#E6EAF2' }
          }
        },
        scales: {
          y: {
            ticks: { color: '#9CA3AF' },
            grid: { color: 'rgba(77, 163, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#9CA3AF' },
            grid: { color: 'rgba(77, 163, 255, 0.1)' }
          }
        }
      }
    });
  },

  loadAnalytics() {
    document.getElementById('total-hours-stat').textContent = (this.data.totalFocusMinutes / 60).toFixed(1);
    document.getElementById('tasks-completed-stat').textContent = this.data.completedTasksCount;
    document.getElementById('streak-stat').textContent = `${this.data.streak} days`;
    document.getElementById('discipline-stat').textContent = this.data.disciplineScore;

    this.renderWeeklyChart();
    this.renderDisciplineChart();
  },

  renderWeeklyChart() {
    const ctx = document.getElementById('weekly-chart');
    if (this.weeklyChart) {
      this.weeklyChart.destroy();
    }

    const weekData = this.data.history.slice(-7);
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = new Array(7).fill(0);

    weekData.forEach(entry => {
      const day = new Date(entry.date).getDay();
      data[day] += entry.points || 0;
    });

    this.weeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Points Earned',
          data: data,
          backgroundColor: 'rgba(77, 163, 255, 0.6)',
          borderColor: '#4DA3FF',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { labels: { color: '#E6EAF2' } }
        },
        scales: {
          y: {
            ticks: { color: '#9CA3AF' },
            grid: { color: 'rgba(77, 163, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#9CA3AF' },
            grid: { color: 'rgba(77, 163, 255, 0.1)' }
          }
        }
      }
    });
  },

  renderDisciplineChart() {
    const ctx = document.getElementById('discipline-chart');
    if (this.disciplineChart) {
      this.disciplineChart.destroy();
    }

    const historyData = this.data.history.slice(-30);
    const labels = historyData.map((_, i) => `Day ${i + 1}`);
    const data = historyData.map(h => h.totalScore || 0);

    this.disciplineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Discipline Score Trend',
          data: data,
          borderColor: '#8A6CFF',
          backgroundColor: 'rgba(138, 108, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { labels: { color: '#E6EAF2' } }
        },
        scales: {
          y: {
            ticks: { color: '#9CA3AF' },
            grid: { color: 'rgba(77, 163, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#9CA3AF' },
            grid: { color: 'rgba(77, 163, 255, 0.1)' }
          }
        }
      }
    });
  },

  recordHistory(type, points) {
    this.data.history.push({
      date: new Date().toISOString(),
      type: type,
      points: points,
      totalScore: this.data.disciplineScore
    });

    if (this.data.history.length > 100) {
      this.data.history = this.data.history.slice(-100);
    }

    this.saveData();
  },

  loadGoalsPage() {
    const container = document.getElementById('goals-list');

    if (this.data.goals.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No goals yet. Create your first goal!</p>';
      return;
    }

    container.innerHTML = this.data.goals.map(goal => {
      const isActive = goal.id === this.data.activeGoalId;
      const progress = this.calculateGoalProgress(goal);

      return `
        <div class="glass-card goal-card ${isActive ? 'active' : ''}" data-goal-id="${goal.id}">
          <h3 class="goal-title">${goal.title}</h3>
          <div class="goal-meta">
            <span>📅 ${new Date(goal.targetDate).toLocaleDateString()}</span>
            <span>⏰ ${goal.weeklyHours}h/week</span>
          </div>
          <div class="goal-progress">
            <div class="goal-progress-bar" style="width: ${progress}%"></div>
          </div>
          <p style="margin-top: 8px; text-align: center; color: var(--text-secondary);">${progress}% Complete</p>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.goal-card').forEach(card => {
      card.addEventListener('click', () => {
        const goalId = card.dataset.goalId;
        this.switchGoal(goalId);
      });
    });
  },

  calculateGoalProgress(goal) {
    const today = new Date();
    const start = new Date(goal.createdAt);
    const end = new Date(goal.targetDate);

    const totalDays = (end - start) / (1000 * 60 * 60 * 24);
    const daysPassed = (today - start) / (1000 * 60 * 60 * 24);

    return Math.min(Math.max(Math.floor((daysPassed / totalDays) * 100), 0), 100);
  },

  switchGoal(goalId) {
    this.data.activeGoalId = goalId;
    this.saveData();
    this.showPage('dashboard');
  },

  editCurrentGoal() {
    alert('Edit feature: Would populate the goal form with current data. For this demo, please create a new goal instead.');
  },

  deleteCurrentGoal() {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    this.data.goals = this.data.goals.filter(g => g.id !== this.data.activeGoalId);

    if (this.data.goals.length > 0) {
      this.data.activeGoalId = this.data.goals[0].id;
      this.saveData();
      this.showPage('dashboard');
    } else {
      this.data.activeGoalId = null;
      this.saveData();
      this.showScreen('welcome');
    }
  },

  exportData() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astra mind-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  clearAllData() {
    if (!confirm('Are you sure you want to clear ALL data? This will delete everything and cannot be undone!')) {
      return;
    }

    localStorage.removeItem('astraMindData');
    location.reload();
  },

  showNotification(title, message) {
    console.log(`${title}: ${message}`);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AstraMind.init();
});
