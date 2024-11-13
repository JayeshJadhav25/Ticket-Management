const Ticket = require('../models/ticketModel');
const User = require('../models/userModel');

// Create a ticket
const createTicket = async (req, res) => {
  const { title, description, type, venue, status, priority, dueDate, createdBy } = req.body;

  if (new Date(dueDate) <= new Date()) {
    return res.status(400).json({ message: 'Due date must be in the future' });
  }

  const ticket = await Ticket.create({
    title,
    description,
    type,
    venue,
    status,
    priority,
    dueDate,
    createdBy
  });

  res.status(201).json(ticket);
};

// Assign user to a ticket
const assignUserToTicket = async (req, res) => {
  const { userId } = req.body;
  const ticketId = req.params.ticketId;

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  if (ticket.status === 'closed') {
    return res.status(400).json({ message: 'Cannot assign users to a closed ticket' });
  }

  if (ticket.assignedUsers.includes(userId)) {
    return res.status(400).json({ message: 'User already assigned' });
  }

  if (ticket.assignedUsers.length >= 5) {
    return res.status(400).json({ message: 'User assignment limit reached' });
  }

  ticket.assignedUsers.push(userId);
  await ticket.save();
  res.json({ message: 'User assigned successfully' });
};

// Get ticket details
const getTicketDetails = async (req, res) => {
  const ticketId = req.params.ticketId;

  const ticket = await Ticket.findById(ticketId).populate('assignedUsers', 'name email');
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  res.json({
    id: ticket._id,
    title: ticket.title,
    description: ticket.description,
    type: ticket.type,
    venue: ticket.venue,
    status: ticket.status,
    priority: ticket.priority,
    dueDate: ticket.dueDate,
    createdBy: ticket.createdBy,
    assignedUsers: ticket.assignedUsers,
    statistics: {
      totalAssigned: ticket.assignedUsers.length,
      status: ticket.status
    }
  });
};

// Analytics for past tickets
const getTicketAnalytics = async (req, res) => {
  const filters = { ...req.query };

  const tickets = await Ticket.find(filters);
  const closedTickets = tickets.filter(ticket => ticket.status === 'closed').length;
  const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'in-progress').length;

  res.json({
    totalTickets: tickets.length,
    closedTickets,
    openTickets,
    inProgressTickets,
    tickets
  });
};

module.exports = { createTicket, assignUserToTicket, getTicketDetails, getTicketAnalytics };
