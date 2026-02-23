import { tasks as initialTasks, getPriorityColor, getTaskStatusColor, salesTeam, leads } from "@/data/mockData";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const AssignTasks = () => {
  const [tasksData] = useState(initialTasks);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignTo: "",
    linkToLead: "",
    priority: "",
    dueDate: ""
  });

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assign Tasks</h1>
          <p className="text-sm text-muted-foreground">Create and manage tasks for your sales team</p>
        </div>
        <button 
          onClick={handleOpenCreateTaskDialog}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-accent">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Task</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Lead</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasksData.map((task) => (
              <tr key={task.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{task.leadCompany}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{task.assignedTo}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getTaskStatusColor(task.status)}`}>{task.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{task.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
