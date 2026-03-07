import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Check, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import * as XLSX from "xlsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import type { LeadStatus } from "@/types/database.types";
import { DatePicker } from "@/components/ui/date-picker";

const Reports = () => {
  const { userRole, userName } = useUser();
  const [salesTeamData, setSalesTeamData] = useState<Array<{
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    leads: number;
    converted: number;
    rate: string;
    status: "Active" | "Inactive";
  }>>([]);
  const [leadsData, setLeadsData] = useState<Array<{
    status: LeadStatus;
    assigned_to: string | null;
    inquiry_date: string | null;
    created_at: string;
  }>>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("All Sales Persons");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPersonOpen, setIsPersonOpen] = useState(false);

  const statusOptions = [
    "All Status",
    "New",
    "Connected",
    "Interested",
    "Not Interested",
    "Detail Share",
    "Re-connected",
    "Negotiation",
    "Converted",
    "Irrelevant",
    "Lost"
  ];

  useEffect(() => {
    const fetchSalesTeam = async () => {
      try {
        const { data, error } = await supabase
          .from("sales_team")
          .select("id, name, email, avatar, leads, converted, rate, status")
          .order("name", { ascending: true });

        if (error) throw error;
        setSalesTeamData(data || []);
      } catch (err) {
        console.error("Error fetching sales team for reports:", err);
      }
    };

    const fetchLeads = async () => {
      try {
        let query = supabase
          .from("leads")
          .select("status, assigned_to, inquiry_date, created_at");
        
        // Filter by assigned salesperson if not admin
        if (userRole === 'salesperson' && userName) {
          query = query.eq('assigned_to', userName);
        }
        
        const { data, error } = await query;

        if (error) throw error;
        setLeadsData(
          (data || []) as Array<{
            status: LeadStatus;
            assigned_to: string | null;
            inquiry_date: string | null;
            created_at: string;
          }>
        );
      } catch (err) {
        console.error("Error fetching leads for reports:", err);
      }
    };

    fetchSalesTeam();
    fetchLeads();
  }, [userRole, userName]);

  const personOptions = useMemo(() => {
    if (userRole === "salesperson" && userName) {
      return [userName];
    }

    return ["All Sales Persons", ...salesTeamData.map((person) => person.name)];
  }, [salesTeamData, userRole, userName]);

  useEffect(() => {
    if (userRole === "salesperson" && userName) {
      setSelectedPerson(userName);
      return;
    }

    if (!personOptions.includes(selectedPerson)) {
      setSelectedPerson("All Sales Persons");
    }
  }, [userRole, userName, personOptions, selectedPerson]);

  const statusColors: Record<LeadStatus, string> = {
    New: "#3b82f6",
    Connected: "#22c55e",
    Interested: "#a855f7",
    "Not Interested": "#ef4444",
    "Detail Share": "#eab308",
    "Re-connected": "#14b8a6",
    Negotiation: "#f97316",
    Converted: "#10b981",
    Irrelevant: "#6b7280",
    Lost: "#f43f5e",
  };

  const filteredLeads = useMemo(() => {
    return leadsData.filter((lead) => {
      const leadDate = (lead.inquiry_date || lead.created_at.slice(0, 10)) ?? "";

      if (dateFrom && leadDate < dateFrom) {
        return false;
      }

      if (dateTo && leadDate > dateTo) {
        return false;
      }

      if (selectedPerson !== "All Sales Persons" && lead.assigned_to !== selectedPerson) {
        return false;
      }

      if (selectedStatus !== "All Status" && lead.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [leadsData, dateFrom, dateTo, selectedPerson, selectedStatus]);

  const salesPerformanceData = useMemo(() => {
    const validSalesPeople = new Set(salesTeamData.map((person) => person.name));
    const countsByPerson = new Map<string, { leads: number; conversions: number }>();

    if (userRole === "salesperson" && userName) {
      countsByPerson.set(userName, { leads: 0, conversions: 0 });
      validSalesPeople.add(userName);
    } else {
      // Initialize with known sales team members so empty values still render as 0.
      salesTeamData.forEach((person) => {
        countsByPerson.set(person.name, { leads: 0, conversions: 0 });
      });
    }

    filteredLeads.forEach((lead) => {
      const personName = lead.assigned_to;
      if (!personName || !validSalesPeople.has(personName)) {
        return;
      }

      const existing = countsByPerson.get(personName) || { leads: 0, conversions: 0 };
      existing.leads += 1;
      if (lead.status === "Converted") {
        existing.conversions += 1;
      }
      countsByPerson.set(personName, existing);
    });

    return Array.from(countsByPerson.entries())
      .filter(([name]) => selectedPerson === "All Sales Persons" || name === selectedPerson)
      .map(([name, metrics]) => ({
        name,
        leads: metrics.leads,
        conversions: metrics.conversions,
      }));
  }, [filteredLeads, salesTeamData, selectedPerson, userRole, userName]);

  const leadStatusDistribution = useMemo(() => {
    return statusOptions
      .filter((status) => status !== "All Status")
      .map((status) => {
        const typedStatus = status as LeadStatus;
        return {
          name: typedStatus,
          value: filteredLeads.filter((lead) => lead.status === typedStatus).length,
          color: statusColors[typedStatus],
        };
      })
      .filter((item) => item.value > 0);
  }, [filteredLeads]);

  const salesSummaryRows = useMemo(() => {
    const metricsByName = new Map(
      salesPerformanceData.map((item) => [item.name, { leads: item.leads, conversions: item.conversions }])
    );

    return salesTeamData
      .filter((person) => selectedPerson === "All Sales Persons" || person.name === selectedPerson)
      .map((person) => {
        const metrics = metricsByName.get(person.name) || { leads: 0, conversions: 0 };
        const conversionRate = metrics.leads > 0
          ? `${Math.round((metrics.conversions / metrics.leads) * 100)}%`
          : "0%";

        return {
          ...person,
          dynamicLeads: metrics.leads,
          dynamicConversions: metrics.conversions,
          dynamicRate: conversionRate,
        };
      });
  }, [salesPerformanceData, salesTeamData, selectedPerson]);

  const filteredLeadCount = filteredLeads.length;

  const exportRows = useMemo(() => {
    return filteredLeads.map((lead, index) => ({
      "Sr No": index + 1,
      "Assigned To": lead.assigned_to || "Unassigned",
      Status: lead.status,
      Date: lead.inquiry_date || lead.created_at.slice(0, 10),
    }));
  }, [filteredLeads]);

  const getReportFileSuffix = () => {
    const from = dateFrom || "start";
    const to = dateTo || "today";
    return `${from}_to_${to}`;
  };

  const handleExportExcel = () => {
    if (exportRows.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, `reports_${getReportFileSuffix()}.xlsx`);
  };

  const handleExportPdf = () => {
    if (exportRows.length === 0) return;

    const printWindow = window.open("", "_blank", "width=1000,height=700");
    if (!printWindow) return;

    const rowsHtml = exportRows
      .map(
        (row) => `
          <tr>
            <td>${row["Sr No"]}</td>
            <td>${row["Assigned To"]}</td>
            <td>${row.Status}</td>
            <td>${row.Date}</td>
          </tr>
        `
      )
      .join("");

    const dateRangeLabel = `${dateFrom || "Any"} to ${dateTo || "Any"}`;
    const statusLabel = selectedStatus;
    const personLabel = selectedPerson;

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Reports Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
            h1 { margin: 0 0 6px 0; font-size: 22px; }
            .meta { margin-bottom: 16px; font-size: 13px; color: #374151; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f9fafb; }
          </style>
        </head>
        <body>
          <h1>Reports Export</h1>
          <div class="meta">Date Range: ${dateRangeLabel}</div>
          <div class="meta">Sales Person: ${personLabel} | Lead Status: ${statusLabel}</div>
          <table>
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Sales performance analytics & exports</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            disabled={filteredLeadCount === 0}
            className="flex items-center gap-2 rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-200"
          >
            <Download className="h-4 w-4" /> Excel
          </button>
          <button
            onClick={handleExportPdf}
            disabled={filteredLeadCount === 0}
            className="flex items-center gap-2 rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-200"
          >
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
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="From Date"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Date To</label>
            <DatePicker
              value={dateTo}
              onChange={setDateTo}
              placeholder="To Date"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Sales Person</label>
            <Popover open={isPersonOpen} onOpenChange={setIsPersonOpen}>
              <PopoverTrigger asChild>
                <button className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-left flex items-center justify-between hover:bg-gray-50">
                  <span>{selectedPerson}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0" align="start">
                <div className="py-1">
                  {personOptions.map((person) => (
                    <button
                      key={person}
                      onClick={() => {
                        setSelectedPerson(person);
                        setIsPersonOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 ${
                        selectedPerson === person
                          ? "bg-red-600 text-white"
                          : "hover:bg-gray-100 text-gray-900"
                      }`}
                    >
                      {selectedPerson === person && <Check className="h-4 w-4" />}
                      <span className={selectedPerson === person ? "" : "ml-6"}>{person}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
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
          {salesPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesPerformanceData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="leads" fill="hsl(210, 50%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversions" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
              No lead data found for selected filters.
            </div>
          )}
        </div>

        {/* Status-wise Breakup Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 font-semibold text-gray-900">Status-wise Breakup</h3>
          {leadStatusDistribution.length > 0 ? (
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
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
              No status data found for selected filters.
            </div>
          )}
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
              {salesSummaryRows.map((person) => (
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
                  <td className="px-4 py-3 text-gray-900 font-medium">{person.dynamicLeads}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{person.dynamicConversions}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{person.dynamicRate}</td>
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
