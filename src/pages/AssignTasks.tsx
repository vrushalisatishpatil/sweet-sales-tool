import { tasks as initialTasks, getPriorityColor, getTaskStatusColor, salesTeam, leads } from "@/data/mockData";
import { useState } from "react";
import { Plus, Search, ListTodo, Clock, AlertTriangle, CheckCircle2, User, Calendar, Building2, Filter, Check, ChevronDown } from "lucide-react";
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

const AssignTasks = () => {
  const [tasksData] = useState(initialTasks);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [openTaskDropdown, setOpenTaskDropdown] = useState<string | null>(null);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>(
    initialTasks.reduce((acc, task) => ({
      ...acc,
      [task.id]: task.status
    }), {})
  );
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignTo: "",
    linkToLead: "",
    priority: "",
    dueDate: ""
  });

  const statusOptions = [
    "Pending",
    "In Progress",
    "Completed",
    "Overdue"
  ];

  const filterStatusOptions = [
    "All Status",
    "Pending",
    "In Progress",
    "Completed",
    "Overdue"
  ];

  const priorityOptions = [
    "All Priorities",
    "Low",
    "Medium",
    "High",
    "Urgent"
  ];

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    setTaskStatuses(prev => ({
      ...prev,
      [taskId]: newStatus
    }));
    setOpenTaskDropdown(null);
    handleStatusChange(taskId, newStatus);
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
      linkToLead: "",
      priority: "",
      dueDate: ""
    });
  };

  const handleCreateTask = () => {
    console.log("New task created:", newTask);
    // Add your task creation logic here
    handleCloseCreateTaskDialog();
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    console.log(`Task ${taskId} status changed to ${newStatus}`);
    // Add your status update logic here
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assign Tasks</h1>
          <p className="text-sm text-muted-foreground">{totalTasks} tasks found</p>
        </div>
        <button 
          onClick={handleOpenCreateTaskDialog}
          className="flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> New Task
        </button>
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
                    <span>Due: {task.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    <span>{task.leadCompany}</span>
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
          <p className="text-muted-foreground">No tasks found</p>
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

            {/* Assign To and Link to Lead */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignTo">Assign To</Label>
                <Select value={newTask.assignTo} onValueChange={(value) => setNewTask({ ...newTask, assignTo: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesTeam.map((person) => (
                      <SelectItem key={person.id} value={person.name}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="linkToLead">Link to Lead (Optional)</Label>
                <Select value={newTask.linkToLead} onValueChange={(value) => setNewTask({ ...newTask, linkToLead: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.company}>
                        {lead.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
