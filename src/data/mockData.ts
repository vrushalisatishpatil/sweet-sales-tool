export type LeadStatus = "New" | "Contacted" | "Follow-up" | "Interested" | "Converted" | "Lost" | "Pending";

export interface Lead {
  id: string;
  company: string;
  contact: string;
  source: string;
  status: LeadStatus;
  phone: string;
  email: string;
  assignedTo: string;
  createdAt: string;
  value: number;
  city: string;
  state: string;
  country: string;
  leadId: string;
  inquiryDate: string;
  productInterested: string;
  remarks: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  company: string;
  note: string;
  by: string;
  method: string;
  phone: string;
  date: string;
  completed: boolean;
  nextAction: string;
  nextFollowUpDate: string;
}

export interface SalesPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  leadsAssigned: number;
  conversions: number;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  leadCompany: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
}

export interface Note {
  id: string;
  leadId: string;
  company: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface Client {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  industry: string;
  convertedDate: string;
  value: number;
}

export const leads: Lead[] = [
  { id: "1", company: "TechVista Solutions", contact: "Arjun Mehta", source: "Website", status: "New", phone: "9812345678", email: "arjun@techvista.com", assignedTo: "Rahul Sharma", createdAt: "10/02/2025", value: 250000, city: "Mumbai", state: "Maharashtra", country: "India", leadId: "LD-2025-001", inquiryDate: "2025-02-10", productInterested: "CRM Software", remarks: "Looking for enterprise CRM solution" },
  { id: "2", company: "GreenLeaf Industries", contact: "Kavita Nair", source: "Reference", status: "Contacted", phone: "9823456789", email: "kavita@greenleaf.com", assignedTo: "Priya Patel", createdAt: "09/02/2025", value: 180000, city: "Pune", state: "Maharashtra", country: "India", leadId: "LD-2025-002", inquiryDate: "2025-02-09", productInterested: "ERP System", remarks: "Interested in manufacturing ERP solution" },
  { id: "3", company: "Metro Builders", contact: "Rajesh Iyer", source: "Call", status: "Follow-up", phone: "9834567890", email: "rajesh@metrobuilders.com", assignedTo: "Amit Kumar", createdAt: "08/02/2025", value: 420000, city: "Chennai", state: "Tamil Nadu", country: "India", leadId: "LD-2025-003", inquiryDate: "2025-02-08", productInterested: "Project Management Tool", remarks: "Requires project management and tracking system" },
  { id: "4", company: "Sunrise Healthcare", contact: "Dr. Meena Shah", source: "WhatsApp", status: "Interested", phone: "9845678901", email: "meena@sunrisehc.com", assignedTo: "Sneha Gupta", createdAt: "07/02/2025", value: 350000, city: "Ahmedabad", state: "Gujarat", country: "India", leadId: "LD-2025-004", inquiryDate: "2025-02-07", productInterested: "Hospital Management System", remarks: "Looking for comprehensive HMS with billing" },
  { id: "5", company: "FastTrack Logistics", contact: "Nikhil Joshi", source: "Email", status: "Pending", phone: "9856789012", email: "nikhil@fasttrack.com", assignedTo: "Rahul Sharma", createdAt: "06/02/2025", value: 150000, city: "Delhi", state: "Delhi", country: "India", leadId: "LD-2025-005", inquiryDate: "2025-02-06", productInterested: "Fleet Management", remarks: "Need fleet tracking and management solution" },
  { id: "6", company: "FoodChain India", contact: "Sanjay Gupta", source: "Visit", status: "Follow-up", phone: "9801234567", email: "sanjay@foodchain.com", assignedTo: "Rahul Sharma", createdAt: "05/02/2025", value: 280000, city: "Bangalore", state: "Karnataka", country: "India", leadId: "LD-2025-006", inquiryDate: "2025-02-05", productInterested: "POS System", remarks: "Wants integrated POS for multiple outlets" },
  { id: "7", company: "AquaPure Water", contact: "Deepa Menon", source: "Email", status: "New", phone: "9812340000", email: "deepa@aquapure.com", assignedTo: "Priya Patel", createdAt: "04/02/2025", value: 120000, city: "Kochi", state: "Kerala", country: "India", leadId: "LD-2025-007", inquiryDate: "2025-02-04", productInterested: "IoT Dashboard", remarks: "IoT monitoring solution for water quality" },
  { id: "8", company: "SkyNet Telecom", contact: "Vikram Singh", source: "Website", status: "Contacted", phone: "9867890123", email: "vikram@skynet.com", assignedTo: "Amit Kumar", createdAt: "03/02/2025", value: 550000, city: "Hyderabad", state: "Telangana", country: "India", leadId: "LD-2025-008", inquiryDate: "2025-02-03", productInterested: "Billing Software", remarks: "Telecom billing and customer management" },
  { id: "9", company: "Elegant Interiors", contact: "Priya Desai", source: "Reference", status: "Interested", phone: "9878901234", email: "priya@elegant.com", assignedTo: "Sneha Gupta", createdAt: "02/02/2025", value: 200000, city: "Surat", state: "Gujarat", country: "India", leadId: "LD-2025-009", inquiryDate: "2025-02-02", productInterested: "Design Software", remarks: "3D design and visualization tools needed" },
  { id: "10", company: "Digital Dynamics", contact: "Rahul Verma", source: "Call", status: "Converted", phone: "9889012345", email: "rahul@digitald.com", assignedTo: "Rahul Sharma", createdAt: "01/02/2025", value: 480000, city: "Kolkata", state: "West Bengal", country: "India", leadId: "LD-2025-010", inquiryDate: "2025-02-01", productInterested: "Marketing Automation", remarks: "Digital marketing automation platform" },
  { id: "11", company: "NatureFirst Organics", contact: "Anita Rao", source: "WhatsApp", status: "Lost", phone: "9890123456", email: "anita@naturefirst.com", assignedTo: "Priya Patel", createdAt: "31/01/2025", value: 90000, city: "Nagpur", state: "Maharashtra", country: "India", leadId: "LD-2025-011", inquiryDate: "2025-01-31", productInterested: "Inventory Management", remarks: "Organic product inventory tracking" },
  { id: "12", company: "BuildRight Construction", contact: "Manoj Patil", source: "Visit", status: "Follow-up", phone: "9801234500", email: "manoj@buildright.com", assignedTo: "Amit Kumar", createdAt: "30/01/2025", value: 670000, city: "Nashik", state: "Maharashtra", country: "India", leadId: "LD-2025-012", inquiryDate: "2025-01-30", productInterested: "Construction ERP", remarks: "End-to-end construction management system" },
];

export const followUps: FollowUp[] = [
  { id: "1", leadId: "3", company: "Metro Builders", note: "Discussed project management requirements in detail", by: "Amit Kumar", method: "Call", phone: "9834567890", date: "2025-02-13", completed: false, nextAction: "Schedule product demo", nextFollowUpDate: "2025-02-15" },
  { id: "2", leadId: "4", company: "Sunrise Healthcare", note: "Sent pricing proposal for HMS software", by: "Sneha Gupta", method: "Email", phone: "9845678901", date: "2025-02-13", completed: false, nextAction: "Follow up on pricing approval", nextFollowUpDate: "2025-02-16" },
  { id: "3", leadId: "5", company: "FastTrack Logistics", note: "Checked on budget approval status", by: "Rahul Sharma", method: "WhatsApp", phone: "9856789012", date: "2025-02-13", completed: false, nextAction: "Send detailed quotation", nextFollowUpDate: "2025-02-17" },
  { id: "4", leadId: "6", company: "FoodChain India", note: "Visited their main outlet, assessed POS needs", by: "Rahul Sharma", method: "Visit", phone: "9801234567", date: "2025-02-13", completed: false, nextAction: "Prepare customized proposal", nextFollowUpDate: "2025-02-18" },
  { id: "5", leadId: "1", company: "TechVista Solutions", note: "Initial discovery call, needs identified", by: "Rahul Sharma", method: "Call", phone: "9812345678", date: "2025-02-13", completed: false, nextAction: "Share case studies", nextFollowUpDate: "2025-02-19" },
  { id: "6", leadId: "7", company: "AquaPure Water", note: "Shared IoT dashboard demo link", by: "Priya Patel", method: "Email", phone: "9812340000", date: "2025-02-13", completed: false, nextAction: "Arrange technical discussion", nextFollowUpDate: "2025-02-20" },
];

export const salesTeam: SalesPerson[] = [
  { id: "1", name: "Rahul Sharma", email: "rahul@waxity.com", phone: "9800000001", role: "Senior Sales Executive", leadsAssigned: 4, conversions: 1, avatar: "RS" },
  { id: "2", name: "Priya Patel", email: "priya@waxity.com", phone: "9800000002", role: "Sales Executive", leadsAssigned: 3, conversions: 0, avatar: "PP" },
  { id: "3", name: "Amit Kumar", email: "amit@waxity.com", phone: "9800000003", role: "Sales Manager", leadsAssigned: 3, conversions: 0, avatar: "AK" },
  { id: "4", name: "Sneha Gupta", email: "sneha@waxity.com", phone: "9800000004", role: "Business Development", leadsAssigned: 2, conversions: 0, avatar: "SG" },
];

export const tasks: Task[] = [
  { id: "1", title: "Send proposal to Metro Builders", description: "Prepare and send a detailed software proposal", assignedTo: "Amit Kumar", leadCompany: "Metro Builders", priority: "High", status: "In Progress", dueDate: "2025-02-24" },
  { id: "2", title: "Follow up with Sunrise Healthcare", description: "Check on the pricing proposal response", assignedTo: "Sneha Gupta", leadCompany: "Sunrise Healthcare", priority: "High", status: "Pending", dueDate: "2025-02-23" },
  { id: "3", title: "Demo for TechVista Solutions", description: "Prepare and conduct product demo", assignedTo: "Rahul Sharma", leadCompany: "TechVista Solutions", priority: "Medium", status: "Pending", dueDate: "2025-02-25" },
  { id: "4", title: "Collect requirements from FoodChain", description: "Visit and document POS requirements", assignedTo: "Rahul Sharma", leadCompany: "FoodChain India", priority: "Medium", status: "Completed", dueDate: "2025-02-22" },
  { id: "5", title: "Send brochure to AquaPure Water", description: "Email product brochure and case studies", assignedTo: "Priya Patel", leadCompany: "AquaPure Water", priority: "Low", status: "Pending", dueDate: "2025-02-26" },
];

export const notes: Note[] = [
  { id: "1", leadId: "3", company: "Metro Builders", content: "Client is interested in project management module. Budget around 4-5 lakhs. Decision expected by end of month.", createdBy: "Amit Kumar", createdAt: "2025-02-22" },
  { id: "2", leadId: "4", company: "Sunrise Healthcare", content: "Needs HMS with patient management, billing, and pharmacy modules. Currently using manual processes.", createdBy: "Sneha Gupta", createdAt: "2025-02-21" },
  { id: "3", leadId: "1", company: "TechVista Solutions", content: "Looking for CRM solution. Has a team of 50+ employees. Wants cloud-based solution.", createdBy: "Rahul Sharma", createdAt: "2025-02-20" },
  { id: "4", leadId: "6", company: "FoodChain India", content: "Operates 12 outlets. Needs centralized POS with inventory management. Pilot at one outlet first.", createdBy: "Rahul Sharma", createdAt: "2025-02-19" },
  { id: "5", leadId: "10", company: "Digital Dynamics", content: "Converted! Signed contract for ERP implementation. Project starts March 1st.", createdBy: "Rahul Sharma", createdAt: "2025-02-18" },
];

export const clients: Client[] = [
  { id: "1", company: "Digital Dynamics", contact: "Rahul Verma", email: "rahul@digitald.com", phone: "9889012345", industry: "Technology", convertedDate: "2025-02-11", value: 480000 },
];

export const salesPerformanceData = [
  { name: "Rahul", leads: 45, conversions: 12 },
  { name: "Priya", leads: 38, conversions: 8 },
  { name: "Amit", leads: 42, conversions: 10 },
  { name: "Sneha", leads: 35, conversions: 9 },
];

export const weeklyLeadTrend = [
  { day: "Mon", leads: 5 },
  { day: "Tue", leads: 7 },
  { day: "Wed", leads: 4 },
  { day: "Thu", leads: 6 },
  { day: "Fri", leads: 8 },
  { day: "Sat", leads: 3 },
  { day: "Sun", leads: 2 },
];

export const leadStatusDistribution = [
  { name: "New", value: 2, color: "hsl(210, 80%, 55%)" },
  { name: "Contacted", value: 2, color: "hsl(220, 15%, 50%)" },
  { name: "Follow-up", value: 2, color: "hsl(45, 93%, 58%)" },
  { name: "Interested", value: 2, color: "hsl(270, 60%, 55%)" },
  { name: "Converted", value: 1, color: "hsl(142, 70%, 45%)" },
  { name: "Lost", value: 1, color: "hsl(0, 72%, 51%)" },
];

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    "New": "bg-status-new text-primary-foreground",
    "Contacted": "bg-status-contacted text-primary-foreground",
    "Follow-up": "bg-status-followup text-foreground",
    "Interested": "bg-status-interested text-primary-foreground",
    "Converted": "bg-status-converted text-primary-foreground",
    "Lost": "bg-status-lost text-primary-foreground",
    "Pending": "bg-status-pending text-primary-foreground",
    "Follow-up Required": "bg-status-followup text-foreground",
  };
  return colors[status] || "bg-muted text-muted-foreground";
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    "High": "bg-status-lost text-primary-foreground",
    "Medium": "bg-status-followup text-foreground",
    "Low": "bg-status-converted text-primary-foreground",
  };
  return colors[priority] || "bg-muted text-muted-foreground";
};

export const getTaskStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    "Pending": "bg-status-pending text-primary-foreground",
    "In Progress": "bg-status-new text-primary-foreground",
    "Completed": "bg-status-converted text-primary-foreground",
  };
  return colors[status] || "bg-muted text-muted-foreground";
};
