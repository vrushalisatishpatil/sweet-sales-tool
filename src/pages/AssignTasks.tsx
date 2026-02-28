import { useState, useEffect } from "react";
import { Plus, Search, ListTodo, Clock, AlertTriangle, CheckCircle2, User, Calendar, Building2, Filter, Check, ChevronDown } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { formatDateDDMMYYYY } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/types/database.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Task {
  id: string;
  taskId: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}

const AssignTasks = () => {
  const { userRole } = useUser();
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [openTaskDropdown, setOpenTaskDropdown] = useState<string | null>(null);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({});
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignTo: "",
    priority: "",
    dueDate: ""
  });

  const statusOptions: TaskStatus[] = [
    "Pending",
    "In Progress",
    "Completed"
  ];

  const filterStatusOptions = [
    "All Status",
    "Pending",
    "In Progress",
    "Completed"
  ];

  const priorityOptions = [
    "All Priorities",
    "Low",
    "Medium",
    "High",
    "Urgent"
  ];

  // Fetch tasks from Supabase
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform Supabase data to match component interface
      const transformedTasks: Task[] = (data || []).map((dbTask) => ({
        id: dbTask.id,
        taskId: dbTask.task_id,
        title: dbTask.title,
        description: dbTask.description || '',
        assignedTo: dbTask.assigned_to || '',
        priority: dbTask.priority as TaskPriority,
        status: dbTask.status as TaskStatus,
        dueDate: dbTask.due_date || '',
      }));

      setTasksData(transformedTasks);
      
      // Initialize task statuses
      const statuses = transformedTasks.reduce((acc, task) => ({
        ...acc,
        [task.id]: task.status
      }), {});
      setTaskStatuses(statuses);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateTaskId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TSK-${timestamp}${random}`;
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus as TaskStatus })
        .eq('id', taskId);

      if (updateError) throw updateError;

      setTaskStatuses(prev => ({
        ...prev,
        [taskId]: newStatus
      }));
      setOpenTaskDropdown(null);
      
      // Refresh tasks list
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleOpenCreateTaskDialog = () => {
    setIsCreateTaskDialogOpen(true);
  };

  const handleCloseCreateTaskDialog = () => {
    setIsCreateTaskDialogOpen(false);
    setNewTask({
      title: "",
      description: "",
      assignTo: "",
      priority: "",
      dueDate: ""
    });
  };

  const handleCreateTask = async () => {
    try {
      if (!newTask.title || !newTask.assignTo || !newTask.priority) {
        alert('Please fill in required fields: Title, Assign To, and Priority');
        return;
      }

      const taskId = generateTaskId();
      
      const insertData = {
        task_id: taskId,
        title: newTask.title,
        description: newTask.description || null,
        assigned_to: newTask.assignTo,
        priority: newTask.priority,
        status: 'Pending' as TaskStatus,
        due_date: newTask.dueDate || null,
      };

      console.log('Inserting task data:', insertData);

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert([insertData]);

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw insertError;
      }

      // Refresh tasks list
      await fetchTasks();
      
      alert('Task created successfully!');
      handleCloseCreateTaskDialog();
    } catch (err: any) {
      console.error('Error creating task:', err);
      const errorMessage = err?.message || err?.error_description || JSON.stringify(err);
      alert(`Failed to create task: ${errorMessage}`);
    }
  };

  // Filter tasks
  const filteredTasks = tasksData.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "All Priorities" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate statistics
  const totalTasks = tasksData.length;
  const pendingTasks = tasksData.filter(t => t.status === "Pending").length;
  const inProgressTasks = tasksData.filter(t => t.status === "In Progress").length;
  const completedTasks = tasksData.filter(t => t.status === "Completed").length;

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Medium":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Low":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchTasks}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assign Tasks</h1>
          <p className="text-sm text-muted-foreground">{totalTasks} tasks found</p>
        </div>
        {userRole === "admin" && (
          <button 
            onClick={handleOpenCreateTaskDialog}
            className="flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" /> New Task
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Tasks</p>
            <ListTodo className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{totalTasks}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Pending</p>
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{pendingTasks}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <AlertTriangle className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{inProgressTasks}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Completed</p>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{completedTasks}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 flex-1 min-w-[200px] max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground" 
          />
        </div>
        <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">
              <Filter className="h-4 w-4 text-gray-600" />
              <span>{statusFilter}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0" align="start">
            <div className="py-1">
              {filterStatusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setIsStatusOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 ${
                    statusFilter === status
                      ? "bg-red-600 text-white"
                      : "hover:bg-gray-100 text-gray-900"
                  }`}
                >
                  {statusFilter === status && <Check className="h-4 w-4" />}
                  <span className={statusFilter === status ? "" : "ml-6"}>{status}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Popover open={isPriorityOpen} onOpenChange={setIsPriorityOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">
              <AlertTriangle className="h-4 w-4 text-gray-600" />
              <span>{priorityFilter}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0" align="start">
            <div className="py-1">
              {priorityOptions.map((priority) => (
                <button
                  key={priority}
                  onClick={() => {
                    setPriorityFilter(priority);
                    setIsPriorityOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 ${
                    priorityFilter === priority
                      ? "bg-red-600 text-white"
                      : "hover:bg-gray-100 text-gray-900"
                  }`}
                >
                  {priorityFilter === priority && <Check className="h-4 w-4" />}
                  <span className={priorityFilter === priority ? "" : "ml-6"}>{priority}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Task ID and Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{task.taskId}</span>
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getPriorityBadgeColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                {/* Task Title */}
                <h3 className="text-base font-semibold text-foreground mb-2">{task.title}</h3>

                {/* Task Description */}
                <p className="text-sm text-muted-foreground mb-4">{task.description}</p>

                {/* Task Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span>{task.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {formatDateDDMMYYYY(task.dueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="shrink-0">
                <Popover open={openTaskDropdown === task.id} onOpenChange={(open) => setOpenTaskDropdown(open ? task.id : null)}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50">
                      <span>{taskStatuses[task.id]}</span>
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[160px] p-0" align="end">
                    <div className="py-1">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleTaskStatusChange(task.id, status)}
                          className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 ${
                            taskStatuses[task.id] === status
                              ? "bg-red-600 text-white"
                              : "hover:bg-gray-100 text-gray-900"
                          }`}
                        >
                          {taskStatuses[task.id] === status && <Check className="h-4 w-4" />}
                          <span className={taskStatuses[task.id] === status ? "" : "ml-6"}>{status}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <ListTodo className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {tasksData.length === 0 
              ? "Get started by creating your first task" 
              : "Try adjusting your search or filters"}
          </p>
          {userRole === "admin" && tasksData.length === 0 && (
            <Button onClick={handleOpenCreateTaskDialog} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" /> Create Your First Task
            </Button>
          )}
        </div>
      )}

      {/* Create New Task Dialog */}
      <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Task Title */}
            <div>
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description..."
                className="mt-1 min-h-[80px] resize-none"
              />
            </div>

            {/* Assign To */}
            <div>
              <Label htmlFor="assignTo">Assign To</Label>
              <Select value={newTask.assignTo} onValueChange={(value) => setNewTask({ ...newTask, assignTo: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rahul Sharma">Rahul Sharma</SelectItem>
                  <SelectItem value="Priya Patel">Priya Patel</SelectItem>
                  <SelectItem value="Amit Kumar">Amit Kumar</SelectItem>
                  <SelectItem value="Sneha Gupta">Sneha Gupta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  placeholder="mm/dd/yyyy"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Create Task Button */}
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreateTask}
            >
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignTasks;
