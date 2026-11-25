"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Divider,
  TextField,
  MenuItem,
} from "@mui/material";

import {
  DashboardRounded,
  SupportAgentRounded,
  ChatRounded,
  PeopleRounded,
  AssessmentRounded,
  AddRounded,
  ViewListRounded,
  GridViewRounded,
  FactCheckRounded,
  CheckCircleRounded,
  CancelRounded,
  RefreshRounded,
} from "@mui/icons-material";

import { api, clearSession } from "../../lib/api";
import { useAppTheme } from "../../components/AppTheme";

import Sidebar from "../../components/dashboard/Sidebar";
import TopNavbar from "../../components/dashboard/TopNavbar";
import NotificationMenu from "../../components/dashboard/NotificationMenu";
import Overview from "../../components/dashboard/Overview";

import TicketTable from "../../components/dashboard/TicketTable";
import TicketCards from "../../components/dashboard/TicketCards";

import ConversationInbox from "../../components/dashboard/ConversationInbox";
import RaiseTicket from "../../components/dashboard/RaiseTicket";
import AgentManagement from "../../components/dashboard/AgentManagement";
import Reports from "../../components/dashboard/Reports";
import TicketDialog from "../../components/dashboard/TicketDialog";

import {
  STATUS_LABELS,
  TICKET_PAGE_SIZE,
  AGENT_PAGE_SIZE,
  CHAT_CHANNELS,
} from "../../constants/dashboard";

// =====================================================
// NORMALISE BOOLEAN PERMISSIONS
// =====================================================

function hasPermission(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

export default function Dashboard() {
  const { mode, toggle } = useAppTheme();

  const authCheckStarted = useRef(false);

  // =====================================================
  // USER AND DATA
  // =====================================================

  const [user, setUser] = useState(null);

  const [tickets, setTickets] = useState([]);
  const [pool, setPool] = useState([]);
  const [agents, setAgents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [ticketRequests, setTicketRequests] = useState([]);
  const [requestAssignments, setRequestAssignments] = useState({});

  const [reports, setReports] = useState({
    counts: [],
    trend: [],
  });

  // =====================================================
  // NAVIGATION
  // =====================================================

  const [tab, setTab] = useState("overview");
  const [drawer, setDrawer] = useState(false);

  const [notificationAnchor, setNotificationAnchor] = useState(null);

  // =====================================================
  // FILTERS, SORTING AND PAGINATION
  // =====================================================

  const [filter, setFilter] = useState("ALL");

  const [sort, setSort] = useState({
    key: "created_at",
    dir: -1,
  });

  const [page, setPage] = useState(1);
  const [ticketView, setTicketView] = useState("table");

  // =====================================================
  // AGENT PAGINATION
  // =====================================================

  const [agentPage, setAgentPage] = useState(1);

  const [agentSort, setAgentSort] = useState({
    key: "name",
    dir: 1,
  });

  // =====================================================
  // TICKET DETAILS
  // =====================================================

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  const [chatChannel, setChatChannel] = useState(CHAT_CHANNELS.CUSTOMER);

  const [assignment, setAssignment] = useState({
    agentId: "",
    priority: "MEDIUM",
  });

  // =====================================================
  // FORMS
  // =====================================================

  const [issue, setIssue] = useState({
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
  });

  const [issueLoading, setIssueLoading] = useState(false);
  const [claimingTicketId, setClaimingTicketId] = useState(null);

  const [agentForm, setAgentForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // =====================================================
  // ALERTS
  // =====================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [success]);

  // =====================================================
  // ROLES
  // =====================================================

  const manager = user?.role === "MANAGER";
  const agent = user?.role === "AGENT";
  const customer = user?.role === "CUSTOMER";

  const notificationOpen = Boolean(notificationAnchor);

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const visibleNotifications = useMemo(() => {
    if (!manager) return notes;

    return notes.filter((item) =>
      [
        "New internal ticket message",
        "Agent picked up an issue",
        "Customer is back online",
        "New ticket request",
        "Hold request received",
      ].includes(item.title),
    );
  }, [notes, manager]);

  const unreadNotifications = visibleNotifications.filter(
    (item) => !Boolean(item.is_read),
  ).length;

  // =====================================================
  // CONVERSATIONS
  // =====================================================

  const visibleConversations = useMemo(() => {
    if (!manager) return conversations;

    return conversations.filter(
      (conversation) => conversation.channel_type === "INTERNAL",
    );
  }, [conversations, manager]);

  // =====================================================
  // REPORT TOTAL
  // =====================================================

  const totalTickets = useMemo(() => {
    return reports.counts.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0,
    );
  }, [reports.counts]);

  // =====================================================
  // REFRESH DASHBOARD
  // =====================================================

  const refresh = useCallback(async () => {
    if (!user) return;

    try {
      const [ticketData, reportData, notificationData, conversationData] =
        await Promise.all([
          api("/tickets"),
          api("/reports"),
          api("/notifications"),
          api("/conversations"),
        ]);

      setTickets(Array.isArray(ticketData) ? ticketData : []);

      setReports({
        counts: Array.isArray(reportData?.counts) ? reportData.counts : [],

        trend: Array.isArray(reportData?.trend) ? reportData.trend : [],
      });

      setNotes(Array.isArray(notificationData) ? notificationData : []);

      setConversations(Array.isArray(conversationData) ? conversationData : []);

      // AGENT DATA
      if (user.role === "AGENT") {
        const poolData = await api("/tickets?scope=pool");

        setPool(Array.isArray(poolData) ? poolData : []);
      }

      // MANAGER DATA
      if (user.role === "MANAGER") {
        const [agentData, requestData] = await Promise.all([
          api("/agents"),
          api("/ticket-requests"),
        ]);

        setAgents(Array.isArray(agentData) ? agentData : []);

        const requests = Array.isArray(requestData)
          ? requestData
          : Array.isArray(requestData?.requests)
            ? requestData.requests
            : [];

        setTicketRequests(requests);
      }
    } catch (e) {
      setError(e.message || "Unable to refresh dashboard");
    }
  }, [user]);

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  useEffect(() => {
    if (authCheckStarted.current) return;

    authCheckStarted.current = true;

    api("/auth/me")
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        clearSession();
        window.location.replace("/");
      });
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user, refresh]);

  // =====================================================
  // HEARTBEAT AND AUTO REFRESH
  // =====================================================

  useEffect(() => {
    if (!user) return;

    let active = true;

    const beat = () => {
      api("/presence/heartbeat", {
        method: "POST",
      }).catch(() => { });
    };

    beat();

    const heartbeatTimer = setInterval(beat, 15000);

    const refreshTimer = setInterval(() => {
      if (active) refresh();
    }, 12000);

    return () => {
      active = false;
      clearInterval(heartbeatTimer);
      clearInterval(refreshTimer);
    };
  }, [user, refresh]);

  // =====================================================
  // POLL SELECTED TICKET
  // =====================================================

  useEffect(() => {
    if (!selected?.id) return;

    let active = true;

    const poll = async () => {
      try {
        const data = await api(`/tickets/${selected.id}`);

        if (active && data?.ticket) {
          setDetail(data);
        }
      } catch {
        // Keep previously loaded ticket details.
      }
    };

    poll();

    const timer = setInterval(poll, 3000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [selected?.id]);

  // =====================================================
  // ROLE-BASED TICKETS
  // =====================================================

  const mine = useMemo(() => {
    return tickets.filter(
      (ticket) =>
        manager ||
        (agent && String(ticket.assigned_agent_id) === String(user?.id)) ||
        (customer && String(ticket.customer_id) === String(user?.id)),
    );
  }, [tickets, manager, agent, customer, user]);

  // =====================================================
  // FILTER AND SORT TICKETS
  // =====================================================

  const filtered = useMemo(() => {
    return mine
      .filter((ticket) => filter === "ALL" || ticket.status === filter)
      .sort((a, b) => {
        const first = a[sort.key] ?? "";
        const second = b[sort.key] ?? "";

        return (
          String(first).localeCompare(String(second), undefined, {
            numeric: true,
          }) * sort.dir
        );
      });
  }, [mine, filter, sort]);

  // =====================================================
  // SHARED TICKET PAGINATION
  // =====================================================

  const totalTicketPages = Math.max(
    1,
    Math.ceil(filtered.length / TICKET_PAGE_SIZE),
  );

  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * TICKET_PAGE_SIZE;

    return filtered.slice(start, start + TICKET_PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [filter, tab]);

  useEffect(() => {
    if (page > totalTicketPages) {
      setPage(totalTicketPages);
    }
  }, [page, totalTicketPages]);

  // =====================================================
  // AGENT SORTING AND PAGINATION
  // =====================================================

  const sortedAgents = useMemo(() => {
    return [...agents].sort(
      (a, b) =>
        String(a.name || a.full_name || "").localeCompare(
          String(b.name || b.full_name || ""),
          undefined,
          { numeric: true },
        ) * agentSort.dir,
    );
  }, [agents, agentSort]);

  const visibleAgents = sortedAgents.slice(
    (agentPage - 1) * AGENT_PAGE_SIZE,
    agentPage * AGENT_PAGE_SIZE,
  );

  // =====================================================
  // REQUEST FORM VALUES
  // =====================================================

  function getRequestAssignment(request) {
    return (
      requestAssignments[request.id] || {
        category: request.category || "General",
        priority: request.priority || "MEDIUM",
        agentId: "",
      }
    );
  }

  function updateRequestAssignment(requestId, field, value) {
    setRequestAssignments((previous) => ({
      ...previous,
      [requestId]: {
        category: "General",
        priority: "MEDIUM",
        agentId: "",
        ...previous[requestId],
        [field]: value,
      },
    }));
  }

  // =====================================================
  // OPEN TICKET
  // =====================================================

  async function openTicket(ticket, channel) {
    if (!ticket?.id) {
      setError("Invalid ticket selected");
      return false;
    }

    try {
      setError("");
      setSuccess("");

      setSelected(ticket);
      setDetail(null);

      setChatChannel(
        manager ? CHAT_CHANNELS.INTERNAL : channel || CHAT_CHANNELS.CUSTOMER,
      );

      const data = await api(`/tickets/${ticket.id}`);

      if (!data?.ticket) {
        throw new Error("Ticket details were not returned correctly.");
      }

      setDetail(data);

      setAssignment({
        agentId: data.ticket.assigned_agent_id || "",
        priority: data.ticket.priority || "MEDIUM",
      });

      return true;
    } catch (e) {
      setSelected(null);
      setDetail(null);

      setError(e.message || "Unable to open ticket");

      return false;
    }
  }

  // =====================================================
  // OPEN CONVERSATION
  // =====================================================

  async function openConversation(conversation) {
    if (manager && conversation.channel_type !== "INTERNAL") {
      return;
    }

    const ticketId = conversation.ticket_id ?? conversation.id;

    if (!ticketId) {
      setError("Invalid conversation ticket");
      return;
    }

    const channel =
      conversation.channel_type === "INTERNAL"
        ? CHAT_CHANNELS.INTERNAL
        : CHAT_CHANNELS.CUSTOMER;

    const existingTicket = tickets.find(
      (ticket) => String(ticket.id) === String(ticketId),
    );

    const ticketToOpen = existingTicket || {
      id: ticketId,
      ticket_no: conversation.ticket_no,
      title: conversation.title,
      customer_id: conversation.customer_id,
      assigned_agent_id: conversation.assigned_agent_id,
      priority: conversation.priority || "MEDIUM",
    };

    const opened = await openTicket(ticketToOpen, channel);

    if (!opened) return;

    const notificationTitle =
      channel === CHAT_CHANNELS.INTERNAL
        ? "New internal ticket message"
        : "New ticket message";

    const unread = visibleNotifications.filter(
      (item) =>
        String(item.ticket_id) === String(ticketId) &&
        !Boolean(item.is_read) &&
        item.title === notificationTitle,
    );

    if (unread.length) {
      try {
        await Promise.all(
          unread.map((item) =>
            api(`/notifications/${item.id}/read`, {
              method: "PATCH",
            }),
          ),
        );

        await refresh();
      } catch (e) {
        setError(e.message || "Unable to update notifications");
      }
    }
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  function closeNotificationMenu() {
    setNotificationAnchor(null);
  }
  async function handleNotificationClick(notification) {
    closeNotificationMenu();

    try {
      setError("");
      setSuccess("");

      if (!Boolean(notification.is_read)) {
        await api(`/notifications/${notification.id}/read`, {
          method: "PATCH",
        });
      }

      // NEW CUSTOMER REQUEST: navigate to Requests tab
      if (manager && notification.title === "New ticket request") {
        setTab("requests");
        await refresh();
        return;
      }

      // HOLD REQUEST: open the related ticket
      if (manager && notification.title === "Hold request received") {
        if (!notification.ticket_id) {
          throw new Error("Hold notification does not contain a ticket ID.");
        }

        let holdTicket = tickets.find(
          (ticket) => String(ticket.id) === String(notification.ticket_id),
        );

        if (!holdTicket) {
          const ticketData = await api(`/tickets/${notification.ticket_id}`);

          holdTicket = ticketData?.ticket;
        }

        if (!holdTicket) {
          throw new Error(
            "The ticket related to this hold request could not be found.",
          );
        }

        await openTicket(holdTicket, CHAT_CHANNELS.INTERNAL);

        await refresh();
        return;
      }

      // EXISTING TICKET NOTIFICATIONS
      let relatedTicket = tickets.find(
        (ticket) => String(ticket.id) === String(notification.ticket_id),
      );

      if (!relatedTicket && notification.ticket_id) {
        const ticketData = await api(`/tickets/${notification.ticket_id}`);

        if (ticketData?.ticket) {
          relatedTicket = ticketData.ticket;
        }
      }

      if (!relatedTicket) {
        await refresh();

        throw new Error("The related ticket could not be found.");
      }

      const managerInternalNotification = [
        "New internal ticket message",
        "Agent picked up an issue",
        "Customer is back online",
      ].includes(notification.title);

      const channel =
        manager && managerInternalNotification
          ? CHAT_CHANNELS.INTERNAL
          : notification.title === "New internal ticket message"
            ? CHAT_CHANNELS.INTERNAL
            : CHAT_CHANNELS.CUSTOMER;

      await openTicket(relatedTicket, channel);
      await refresh();
    } catch (e) {
      setError(e.message || "Unable to open notification");
    }
  }

  // =====================================================
  // RELOAD
  // =====================================================

  async function reload() {
    await refresh();

    if (selected?.id) {
      try {
        const data = await api(`/tickets/${selected.id}`);

        if (data?.ticket) {
          setDetail(data);
        }
      } catch (e) {
        setError(e.message || "Unable to refresh ticket");
      }
    }
  }

  // =====================================================
  // COMMON API ACTION
  // =====================================================

  async function action(path, method = "POST", body) {
    try {
      setError("");

      await api(path, {
        method,
        body,
      });

      await reload();

      setSuccess("Updated successfully");

      return true;
    } catch (e) {
      setSuccess("");
      setError(e.message || "Action failed");

      return false;
    }
  }

  // =====================================================
  // APPROVE CUSTOMER REQUEST
  // =====================================================

  async function approveRequest(request) {
    if (!manager || !request?.id) return false;

    const values = getRequestAssignment(request);

    if (!values.category?.trim()) {
      setError("Please enter a category.");
      return false;
    }

    if (!values.priority) {
      setError("Please select a priority.");
      return false;
    }

    const approved = await action(
      `/ticket-requests/${request.id}/approve`,
      "PATCH",
      {
        category: values.category.trim(),
        priority: values.priority,
        agentId: values.agentId || null,
      },
    );

    if (approved) {
      setSuccess(
        `Request #${request.id} approved. An operational ticket has been created.`,
      );

      setRequestAssignments((previous) => {
        const updated = { ...previous };
        delete updated[request.id];
        return updated;
      });
    }

    return approved;
  }

  // =====================================================
  // REJECT CUSTOMER REQUEST
  // =====================================================

  async function rejectRequest(request) {
    if (!manager || !request?.id) return false;

    const rejected = await action(
      `/ticket-requests/${request.id}/reject`,
      "PATCH",
      {
        reason: "Rejected by manager",
      },
    );

    if (rejected) {
      setSuccess(`Request #${request.id} rejected.`);

      setRequestAssignments((previous) => {
        const updated = { ...previous };
        delete updated[request.id];
        return updated;
      });
    }

    return rejected;
  }
  async function claimTicket(ticketId) {
    if (!agent || claimingTicketId !== null) return;

    try {
      setClaimingTicketId(ticketId);

      const claimed = await action(`/tickets/${ticketId}/claim`, "POST");

      if (claimed) {
        setSuccess("Ticket picked successfully.");
        await refresh();
      }
    } finally {
      setClaimingTicketId(null);
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {
    clearSession();
    window.location.replace("/");
  }

  // =====================================================
  // SEND CHAT MESSAGE
  // =====================================================

  async function sendChat(event, messageOverride) {
    event?.preventDefault?.();

    const message = String(messageOverride ?? "").trim();

    if (!message || !selected?.id || !detail) {
      return false;
    }

    const isInternal = chatChannel === CHAT_CHANNELS.INTERNAL;

    if (manager && !isInternal) {
      setError("Managers cannot access customer chat.");
      return false;
    }

    // Use the same normalised permissions as the UI.
    const hasAccess = isInternal
      ? hasPermission(detail.canViewInternalChat)
      : hasPermission(detail.canChat);

    if (!hasAccess) {
      setError("You do not have access to this conversation");

      return false;
    }

    const currentStatus = detail.ticket?.status;

    if (["COMPLETED", "RESOLVED", "CLOSED"].includes(currentStatus)) {
      setError("This conversation is read-only");
      return false;
    }

    const endpoint = isInternal
      ? `/tickets/${selected.id}/internal-messages`
      : `/tickets/${selected.id}/messages`;

    try {
      setError("");

      await api(endpoint, {
        method: "POST",
        body: { message },
      });

      const data = await api(`/tickets/${selected.id}`);

      if (data?.ticket) {
        setDetail(data);
      }

      await refresh();

      return true;
    } catch (e) {
      setError(e.message || "Unable to send message");

      return false;
    }
  }

  // =====================================================
  // CREATE CUSTOMER REQUEST
  // =====================================================

  async function createTicket(event) {
    event?.preventDefault?.();

    if (issueLoading) return;

    const title = issue.title.trim();
    const description = issue.description.trim();

    if (!title || !description) {
      setError("Please enter the issue title and description.");

      return;
    }

    try {
      setIssueLoading(true);
      setError("");
      setSuccess("");

      await api("/ticket-requests", {
        method: "POST",
        body: {
          title,
          description,
        },
      });

      setIssue({
        title: "",
        description: "",
        category: "General",
        priority: "MEDIUM",
      });

      await refresh();

      setSuccess(
        "Your issue request has been submitted successfully. Waiting for manager approval.",
      );

      setTab("tickets");
    } catch (e) {
      setError(e.message || "Unable to submit issue request");
    } finally {
      setIssueLoading(false);
    }
  }

  // =====================================================
  // CREATE AGENT
  // =====================================================

  async function createAgent(agentData) {
    const name = agentData?.name?.trim();
    const email = agentData?.email?.trim();
    const password = agentData?.password;

    if (!name || !email || !password) {
      setError("Name, email and password are required.");

      return false;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");

      return false;
    }

    const created = await action("/agents", "POST", {
      name,
      email,
      password,
    });

    if (created) {
      setAgentForm({
        name: "",
        email: "",
        password: "",
      });

      setSuccess("Agent created successfully.");
    }

    return created;
  }

  // =====================================================
  // UPDATE AGENT
  // =====================================================

  async function updateAgent(agentItem, body) {
    const agentId =
      typeof agentItem === "object"
        ? (agentItem.id ?? agentItem.agent_id)
        : agentItem;

    if (!agentId) {
      setError("Invalid agent ID.");
      return false;
    }

    return action(`/agents/${agentId}`, "PATCH", body);
  }

  // =====================================================
  // ACTIVATE / DEACTIVATE AGENT
  // =====================================================

  async function toggleAgent(agentItem) {
    const agentId = agentItem.id ?? agentItem.agent_id;

    if (!agentId) {
      setError("Invalid agent ID.");
      return false;
    }

    return action(`/agents/${agentId}`, "PATCH", {
      isActive: !agentItem.is_active,
    });
  }

  // =====================================================
  // EXPORT CSV
  // =====================================================

  function exportReport() {
    const rows = [
      ["Ticket", "Customer", "Issue", "Priority", "Status", "Agent", "Created"],

      ...tickets.map((ticket) => [
        ticket.ticket_no,
        ticket.customer_name,
        ticket.title,
        ticket.priority,
        ticket.status,
        ticket.agent_name || "Unassigned",
        ticket.created_at,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => '"' + String(value ?? "").replaceAll('"', '""') + '"')
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "helpdesk-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  // =====================================================
  // NAVIGATION ITEMS
  // =====================================================

  const nav = [
    {
      id: "overview",
      label: "Overview",
      icon: <DashboardRounded />,
    },
    {
      id: "tickets",
      label: "Tickets",
      icon: <SupportAgentRounded />,
    },
    {
      id: "inbox",
      label: "Conversations",
      icon: <ChatRounded />,
    },

    ...(agent
      ? [
        {
          id: "pick",
          label: "Pick tickets",
          icon: <SupportAgentRounded />,
        },
      ]
      : []),

    ...(manager
      ? [
        {
          id: "requests",
          label: "Customer Requests",
          icon: <FactCheckRounded />,
        },
        {
          id: "agents",
          label: "Agents",
          icon: <PeopleRounded />,
        },
        {
          id: "reports",
          label: "Reports",
          icon: <AssessmentRounded />,
        },
      ]
      : []),

    ...(customer
      ? [
        {
          id: "raise",
          label: "Raise ticket",
          icon: <AddRounded />,
        },
      ]
      : []),
  ];

  const currentPageTitle =
    nav.find((item) => item.id === tab)?.label || "Dashboard";

  // =====================================================
  // CHAT AND PERMISSIONS
  // =====================================================

  const canChat = hasPermission(detail?.canChat);

  const canViewInternalChat = hasPermission(detail?.canViewInternalChat);

  const chatMessages = manager
    ? detail?.internalMessages || []
    : chatChannel === CHAT_CHANNELS.INTERNAL
      ? detail?.internalMessages || []
      : detail?.messages || [];

  const activityItems = detail?.activities || [];

  // =====================================================
  // LOADING
  // =====================================================

  if (!user) {
    return (
      <Box minHeight="100vh" display="grid" sx={{ placeItems: "center" }}>
        <Typography>Loading workspace…</Typography>
      </Box>
    );
  }

  // =====================================================
  // DASHBOARD UI
  // =====================================================

  return (
    <Box minHeight="100vh" bgcolor="background.default">

      <TopNavbar
        title="helpdesk"
        user={user}
        mode={mode}
        onToggleTheme={toggle}
        onMenuClick={() => setDrawer(true)}
        onNotificationClick={(event) =>
          setNotificationAnchor(event.currentTarget)
        }
        unreadCount={unreadNotifications}
        agents={agents}
      />


      <NotificationMenu
        anchorEl={notificationAnchor}
        open={notificationOpen}
        onClose={closeNotificationMenu}
        notifications={visibleNotifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={async () => {
          const unread = visibleNotifications.filter(
            (item) => !Boolean(item.is_read),
          );

          try {
            await Promise.all(
              unread.map((item) =>
                api(`/notifications/${item.id}/read`, {
                  method: "PATCH",
                }),
              ),
            );

            await refresh();
          } catch (e) {
            setError(e.message || "Unable to mark notifications as read");
          }
        }}
      />

      <Sidebar
        nav={nav}
        tab={tab}
        setTab={setTab}
        mobileOpen={drawer}
        setMobileOpen={setDrawer}
        user={user}
        onLogout={logout}
      />

      <Box
        component="main"
        sx={{
          ml: { xs: 0, md: "260px" },
          minWidth: 0,
          pt: { xs: 2, md: 3 },
          pb: 4,
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: { xs: 1, md: 2 },
            px: { xs: 2, md: 3 },
          }}
        >
          {/* PAGE HEADER */}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
            spacing={2}
            mb={3}
          >
            <Box>
              <Typography
                color="primary"
                fontSize={11}
                fontWeight={900}
                letterSpacing={2}
              >
                {user.role} WORKSPACE
              </Typography>

              <Typography variant="h4">
                {tab === "overview"
                  ? `Hey ${(user.name || "User").split(" ")[0]} 👋`
                  : currentPageTitle}
              </Typography>

              <Typography color="text.secondary">
                {manager
                  ? "Your support operation, at a glance."
                  : agent
                    ? "Your queue and customer conversations."
                    : "Your issues, updates and support conversations."}
              </Typography>
            </Box>

            <Button variant="outlined" onClick={exportReport}>
              Download report CSV
            </Button>
          </Stack>

          {/* ALERTS */}

          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              onClose={() => setSuccess("")}
              sx={{
                mb: 2,
                borderRadius: 2,
                alignItems: "center",
              }}
            >
              {success}
            </Alert>
          )}

          {/* OVERVIEW */}

          {tab === "overview" && (
            <Overview
              counts={reports.counts}
              trend={reports.trend}
              tickets={mine}
              totalTickets={totalTickets}
            />
          )}

          {/* PICK TICKETS */}

          {tab === "pick" && agent && (
            <Card
              sx={{
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <Box p={{ xs: 2, md: 3 }}>
                <Typography variant="h5" mb={2}>
                  Available to pick up
                </Typography>

                {pool
                  .filter(
                    (ticketItem) =>
                      String(ticketItem.assigned_agent_id ?? "") !==
                      String(user.id),
                  )
                  .map((ticketItem) => (
                    <Stack
                      key={ticketItem.id}
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      justifyContent="space-between"
                      alignItems={{
                        xs: "flex-start",
                        sm: "center",
                      }}
                      spacing={1}
                      py={1.5}
                      borderBottom={1}
                      borderColor="divider"
                    >
                      <Box>
                        <Typography color="primary" fontWeight={950}>
                          {ticketItem.ticket_no}
                        </Typography>

                        <Typography fontWeight={800}>
                          {ticketItem.title}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {ticketItem.customer_name}
                          {" · "}
                          {STATUS_LABELS[ticketItem.status] ||
                            ticketItem.status}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        disabled={claimingTicketId !== null}
                        onClick={() => claimTicket(ticketItem.id)}
                      >
                        {claimingTicketId === ticketItem.id
                          ? "Picking..."
                          : "Pick ticket"}
                      </Button>
                    </Stack>
                  ))}

                {pool.filter(
                  (ticketItem) =>
                    String(ticketItem.assigned_agent_id ?? "") !==
                    String(user.id),
                ).length === 0 && (
                    <Alert severity="info">
                      No tickets are waiting to be picked up.
                    </Alert>
                  )}
              </Box>
            </Card>
          )}
          {/* TICKETS */}

          {tab === "tickets" && (
            <Box>
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                mb={2}
              >
                <ToggleButtonGroup
                  exclusive
                  value={ticketView}
                  onChange={(_, nextView) => {
                    if (nextView) {
                      setTicketView(nextView);
                      setPage(1);
                    }
                  }}
                  size="small"
                  sx={{
                    backgroundColor: "background.paper",
                    borderRadius: 3,

                    "& .MuiToggleButton-root": {
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 800,
                      gap: 0.8,
                    },
                  }}
                >
                  <ToggleButton value="table">
                    <ViewListRounded fontSize="small" />
                    Table
                  </ToggleButton>

                  <ToggleButton value="card">
                    <GridViewRounded fontSize="small" />
                    Cards
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {ticketView === "table" && (
                <TicketTable
                  tickets={paginatedTickets}
                  totalCount={filtered.length}
                  page={page}
                  totalPages={totalTicketPages}
                  setPage={setPage}
                  onOpenTicket={openTicket}
                  showCustomerPresence={manager || agent}
                  onSort={(key) => {
                    setSort((current) => ({
                      key,
                      dir: current.key === key ? -current.dir : 1,
                    }));

                    setPage(1);
                  }}
                  sortBy={sort.key}
                  sortOrder={sort.dir}
                />
              )}

              {ticketView === "card" && (
                <TicketCards
                  tickets={paginatedTickets}
                  totalCount={filtered.length}
                  page={page}
                  totalPages={totalTicketPages}
                  setPage={setPage}
                  onOpenTicket={openTicket}
                  showCustomerPresence={manager || agent}
                />
              )}
            </Box>
          )}

          {/* CUSTOMER REQUESTS - MANAGER ONLY */}

          {tab === "requests" && manager && (
            <Box>
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                  xs: "flex-start",
                  sm: "center",
                }}
                spacing={2}
                mb={3}
              >
                <Box>
                  <Typography variant="h5" fontWeight={900}>
                    Customer Requests
                  </Typography>

                  <Typography color="text.secondary" variant="body2">
                    Review incoming issues before creating operational tickets.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    color="warning"
                    label={`${ticketRequests.length} pending`}
                  />

                  <Button
                    variant="outlined"
                    startIcon={<RefreshRounded />}
                    onClick={refresh}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Stack>

              {ticketRequests.length === 0 ? (
                <Card
                  sx={{
                    borderRadius: 4,
                    p: 4,
                    textAlign: "center",
                  }}
                >
                  <FactCheckRounded
                    sx={{
                      fontSize: 52,
                      color: "text.secondary",
                      mb: 1,
                    }}
                  />

                  <Typography variant="h6" fontWeight={800}>
                    No pending requests
                  </Typography>

                  <Typography color="text.secondary" variant="body2" mt={1}>
                    Customer requests will appear here when they are submitted.
                  </Typography>
                </Card>
              ) : (
                <Stack spacing={2}>
                  {ticketRequests.map((request) => {
                    const values = getRequestAssignment(request);

                    return (
                      <Card
                        key={request.id}
                        sx={{
                          borderRadius: 4,
                          border: 1,
                          borderColor: "divider",
                          overflow: "hidden",
                        }}
                      >
                        <Box p={{ xs: 2, md: 3 }}>
                          <Stack
                            direction={{
                              xs: "column",
                              sm: "row",
                            }}
                            justifyContent="space-between"
                            alignItems={{
                              xs: "flex-start",
                              sm: "center",
                            }}
                            spacing={2}
                          >
                            <Box flex={1} minWidth={0}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <Typography
                                  color="primary"
                                  fontWeight={900}
                                  variant="overline"
                                >
                                  REQUEST #{request.id}
                                </Typography>

                                <Chip
                                  size="small"
                                  color="warning"
                                  label={request.status || "PENDING"}
                                />
                              </Stack>

                              <Typography
                                variant="h6"
                                fontWeight={900}
                                sx={{ mt: 0.5 }}
                              >
                                {request.title}
                              </Typography>

                              <Typography
                                color="text.secondary"
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  whiteSpace: "pre-wrap",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {request.description}
                              </Typography>

                              <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                mt={2}
                              >
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={
                                    request.customer_name ||
                                    request.customer?.name ||
                                    `Customer #${request.customer_id}`
                                  }
                                />

                                {request.created_at && (
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label={new Date(
                                      request.created_at,
                                    ).toLocaleString()}
                                  />
                                )}
                              </Stack>
                            </Box>
                          </Stack>

                          <Divider sx={{ my: 2.5 }} />

                          <Typography
                            fontWeight={900}
                            variant="subtitle2"
                            mb={2}
                          >
                            REVIEW AND ASSIGN
                          </Typography>

                          <Box
                            display="grid"
                            gridTemplateColumns={{
                              xs: "1fr",
                              sm: "repeat(3, minmax(0, 1fr))",
                            }}
                            gap={2}
                          >
                            <TextField
                              label="Category"
                              size="small"
                              fullWidth
                              value={values.category}
                              onChange={(event) =>
                                updateRequestAssignment(
                                  request.id,
                                  "category",
                                  event.target.value,
                                )
                              }
                            />

                            <TextField
                              select
                              label="Priority"
                              size="small"
                              fullWidth
                              value={values.priority}
                              onChange={(event) =>
                                updateRequestAssignment(
                                  request.id,
                                  "priority",
                                  event.target.value,
                                )
                              }
                            >
                              <MenuItem value="LOW">Low</MenuItem>

                              <MenuItem value="MEDIUM">Medium</MenuItem>

                              <MenuItem value="HIGH">High</MenuItem>

                              <MenuItem value="CRITICAL">Critical</MenuItem>
                            </TextField>

                            <TextField
                              select
                              label="Assign agent (optional)"
                              size="small"
                              fullWidth
                              value={values.agentId}
                              onChange={(event) =>
                                updateRequestAssignment(
                                  request.id,
                                  "agentId",
                                  event.target.value,
                                )
                              }
                            >
                              <MenuItem value="">Leave unassigned</MenuItem>

                              {agents
                                .filter(
                                  (item) =>
                                    item.is_active === true ||
                                    item.is_active === 1,
                                )
                                .map((item) => (
                                  <MenuItem
                                    key={item.id ?? item.agent_id}
                                    value={String(item.id ?? item.agent_id)}
                                  >
                                    {item.name || item.full_name}
                                  </MenuItem>
                                ))}
                            </TextField>
                          </Box>

                          <Stack
                            direction={{
                              xs: "column",
                              sm: "row",
                            }}
                            justifyContent="flex-end"
                            spacing={1.5}
                            mt={3}
                          >
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<CancelRounded />}
                              onClick={() => rejectRequest(request)}
                            >
                              Reject request
                            </Button>

                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleRounded />}
                              onClick={() => approveRequest(request)}
                            >
                              Approve and create ticket
                            </Button>
                          </Stack>
                        </Box>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Box>
          )}

          {/* CONVERSATIONS */}

          {tab === "inbox" && (
            <ConversationInbox
              conversations={visibleConversations}
              onOpenConversation={openConversation}
            />
          )}

          {/* RAISE TICKET */}

          {tab === "raise" && customer && (
            <RaiseTicket
              form={issue}
              setForm={setIssue}
              onSubmit={createTicket}
              loading={issueLoading}
            />
          )}

          {/* AGENT MANAGEMENT */}

          {tab === "agents" && manager && (
            <AgentManagement
              agents={visibleAgents}
              agentForm={agentForm}
              setAgentForm={setAgentForm}
              onCreateAgent={createAgent}
              onUpdateAgent={updateAgent}
              onToggleAgent={toggleAgent}
            />
          )}

          {/* REPORTS */}

          {tab === "reports" && manager && (
            <Reports
              counts={reports.counts}
              trend={reports.trend}
              totalTickets={totalTickets}
            />
          )}
        </Container>
      </Box>

      {/* TICKET DETAILS DIALOG */}

      <TicketDialog
        open={Boolean(selected)}
        selected={selected}
        detail={detail}
        loading={Boolean(selected && !detail)}
        onClose={() => {
          setSelected(null);
          setDetail(null);

          setChatChannel(
            manager ? CHAT_CHANNELS.INTERNAL : CHAT_CHANNELS.CUSTOMER,
          );
        }}
        manager={manager}
        agent={agent}
        customer={customer}
        showCustomerPresence={manager || agent}
        agents={agents}
        assignment={assignment}
        setAssignment={setAssignment}
        chatChannel={chatChannel}
        setChatChannel={setChatChannel}
        chat={chatMessages}
        sendChat={sendChat}
        activity={activityItems}
        action={action}
        canChat={canChat}
        canViewInternalChat={canViewInternalChat}
      />
    </Box>
  );
}
