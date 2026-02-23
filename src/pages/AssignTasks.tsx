import { tasks as initialTasks, getPriorityColor, getTaskStatusColor, salesTeam } from "@/data/mockData";
import { useState } from "react";
import { Plus } from "lucide-react";

const AssignTasks = () => {
  const [tasksData] = useState(initialTasks);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assign Tasks</h1>
          <p className="text-sm text-muted-foreground">Create and manage tasks for your sales team</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
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
    </div>
  );
};

export default AssignTasks;
