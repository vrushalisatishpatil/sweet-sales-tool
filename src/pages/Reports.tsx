import { salesTeam, salesPerformanceData, leadStatusDistribution } from "@/data/mockData";
import { useState } from "react";
import { Download, FileText, Check, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Reports = () => {
  const [dateFrom, setDateFrom] = useState("02/01/2025");
  const [dateTo, setDateTo] = useState("02/13/2025");
  const [selectedPerson, setSelectedPerson] = useState("All Sales Persons");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const statusOptions = [
    "All Status",
    "New",
    "Contacted",
    "Follow-up Required",
    "Interested",
    "Not Interested",
    "Pending",
    "Converted",
    "Lost"
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Sales performance analytics & exports</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors">
            <Download className="h-4 w-4" /> Excel
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors">
            <FileText className="h-4 w-4" /> PDF
          </button>
        </div>
      </div>

      {/* Report Filters */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-4 font-medium text-gray-900 flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Report Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Date From</label>
            <div className="relative">
              <input 
                type="date" 
                value="2025-02-01"
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Date To</label>
            <div className="relative">
              <input 
                type="date" 
                value="2025-02-13"
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Sales Person</label>
            <select 
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option>All Sales Persons</option>
              <option>Rahul Sharma</option>
              <option>Priya Patel</option>
              <option>Amit Kumar</option>
              <option>Sneha Gupta</option>
              <option>Vikram Singh</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Lead Status</label>
            <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
              <PopoverTrigger asChild>
                <button className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-left flex items-center justify-between hover:bg-gray-50">
                  <span>{selectedStatus}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0" align="start">
                <div className="py-1">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 ${
                        selectedStatus === status
                          ? "bg-red-600 text-white"
                          : "hover:bg-gray-100 text-gray-900"
                      }`}
                    >
                      {selectedStatus === status && <Check className="h-4 w-4" />}
                      <span className={selectedStatus === status ? "" : "ml-6"}>{status}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Sales Person Performance Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 font-semibold text-gray-900">Sales Person Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesPerformanceData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="leads" fill="hsl(210, 50%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversions" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status-wise Breakup Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 font-semibold text-gray-900">Status-wise Breakup</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={leadStatusDistribution} 
                cx="50%" 
                cy="40%" 
                innerRadius={60}
                outerRadius={100} 
                dataKey="value"
              >
                {leadStatusDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
            {leadStatusDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-700">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Person Summary Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-4 font-semibold text-gray-900">Sales Person Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Person</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Leads</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesTeam.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-white text-sm font-bold">
                        {person.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{person.name}</p>
                        <p className="text-sm text-gray-500">{person.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{person.leads}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{person.converted}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{person.rate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                      person.status === "Active" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {person.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
