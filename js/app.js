/**
 * CampusCare – Smart Campus Issue Reporter
 * Modern, responsive web application for reporting and resolving campus issues.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Constants & Sample Initial Data
  // ==========================================================================
  const STORAGE_KEY = 'campuscare_complaints_v1';
  const UPVOTES_KEY = 'campuscare_user_upvotes_v1';

  const SAMPLE_COMPLAINTS = [
    {
      id: 'CMP-2026-101',
      title: 'High-speed Wi-Fi dropping frequently in Library 2nd Floor',
      description: 'Students are unable to connect to the Campus-Secure-5G network in Hall B. Signal is visible but IP configuration fails with DHCP timeout.',
      category: 'Wi-Fi',
      location: 'Central Library, 2nd Floor, Hall B',
      priority: 'High',
      status: 'In Progress',
      reporterName: 'Aarav Patel',
      reporterEmail: 'aarav.p@campus.edu',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      adminNotes: 'Network engineers restarted switch cluster B2. Replacing faulty fiber patch cord.',
      upvotes: 14,
      image: null
    },
    {
      id: 'CMP-2026-102',
      title: 'Ceiling fan rattling violently during lectures',
      description: 'The middle fan in row 3 is vibrating heavily and making a loud clicking sound. Risk of falling if not secured promptly.',
      category: 'Classroom',
      location: 'Science Block B, Room 302',
      priority: 'Urgent',
      status: 'Pending',
      reporterName: 'Ananya Sharma',
      reporterEmail: 'ananya.s@campus.edu',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      adminNotes: 'Safety inspection scheduled with facility technician before 5:00 PM.',
      upvotes: 9,
      image: null
    },
    {
      id: 'CMP-2026-103',
      title: 'Continuous water leakage in 1st Floor washroom sink',
      description: 'The second faucet from the door is stuck and pouring water constantly, flooding the washroom floor and causing a slipping hazard.',
      category: 'Washroom',
      location: 'Engineering Block A, 1st Floor Restroom',
      priority: 'High',
      status: 'Resolved',
      reporterName: 'Devansh Verma',
      reporterEmail: 'devansh.v@campus.edu',
      createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), // 1.5 days ago
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      adminNotes: 'Plumber replaced the worn cartridge and pressure seal. Area mopped and slip warning sign removed.',
      upvotes: 6,
      image: null
    },
    {
      id: 'CMP-2026-104',
      title: 'Short circuit sparks from laboratory power strip',
      description: 'A 3-pin wall outlet near workstation 12 sparked when connecting a laptop adapter. The circuit breaker tripped immediately.',
      category: 'Electricity',
      location: 'Computer Science Lab 3, Workstation #12',
      priority: 'Urgent',
      status: 'In Progress',
      reporterName: 'Rohan Mehra',
      reporterEmail: 'rohan.m@campus.edu',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      adminNotes: 'Senior electrician isolated the sub-distribution panel. Testing earthing resistance and rewiring socket box.',
      upvotes: 21,
      image: null
    },
    {
      id: 'CMP-2026-105',
      title: 'Seminar Hall ceiling projector showing distorted colors',
      description: 'Projector image is tinted heavily magenta/pink. Both HDMI and Type-C input adapters were tested but color rendering remains broken.',
      category: 'Classroom',
      location: 'Auditorium Ground Floor, Seminar Room 1',
      priority: 'Medium',
      status: 'Pending',
      reporterName: 'Pooja Iyer',
      reporterEmail: 'pooja.i@campus.edu',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      adminNotes: '',
      upvotes: 4,
      image: null
    },
    {
      id: 'CMP-2026-106',
      title: 'Broken window latch causing draft and water ingress',
      description: 'The right-side casement window latch is snapped. During heavy rains yesterday, water accumulated on the window sills.',
      category: 'Other',
      location: 'Hostel Block A, 1st Floor Common Room',
      priority: 'Low',
      status: 'Resolved',
      reporterName: 'Kavita Nair',
      reporterEmail: 'kavita.n@campus.edu',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      adminNotes: 'Carpentry staff installed a heavy-duty brass latch and silicon weatherproofing.',
      upvotes: 2,
      image: null
    },
    {
      id: 'CMP-2026-107',
      title: 'Soap dispensers and paper towel holders empty',
      description: 'All 4 liquid soap dispensers in the main dining hall washrooms have been empty since morning.',
      category: 'Washroom',
      location: 'Campus Cafeteria, East Washroom',
      priority: 'Medium',
      status: 'Pending',
      reporterName: 'Vikram Joshi',
      reporterEmail: 'vikram.j@campus.edu',
      createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      adminNotes: 'Sent notification to housekeeping shift manager.',
      upvotes: 11,
      image: null
    }
  ];

  // ==========================================================================
  // 2. State Management & Storage Helpers
  // ==========================================================================
  let complaints = [];
  let userUpvotes = new Set();
  let currentActiveComplaintId = null;
  let pendingDeleteComplaintId = null;

  function loadState() {
    try {
      const storedComplaints = localStorage.getItem(STORAGE_KEY);
      if (storedComplaints) {
        complaints = JSON.parse(storedComplaints);
      } else {
        complaints = [...SAMPLE_COMPLAINTS];
        saveState();
      }

      const storedUpvotes = localStorage.getItem(UPVOTES_KEY);
      if (storedUpvotes) {
        userUpvotes = new Set(JSON.parse(storedUpvotes));
      }
    } catch (e) {
      console.warn('Storage read error, using sample data:', e);
      complaints = [...SAMPLE_COMPLAINTS];
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch (e) {
      console.error('Failed to save complaints to localStorage:', e);
      showToast('Local storage limit reached or disabled.', 'error');
    }
  }

  function saveUpvotes() {
    try {
      localStorage.setItem(UPVOTES_KEY, JSON.stringify(Array.from(userUpvotes)));
    } catch (e) {
      console.error('Failed to save upvotes:', e);
    }
  }

  // ==========================================================================
  // 3. Date & Format Helpers
  // ==========================================================================
  function formatRelativeTime(isoString) {
    if (!isoString) return 'Unknown';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  function formatFullDateTime(isoString) {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function generateTicketId() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const count = complaints.length + 1;
    return `CMP-${year}-${String(count).padStart(3, '0')}`;
  }

  // ==========================================================================
  // 4. Category & Status Meta Icons
  // ==========================================================================
  function getCategoryIconSvg(category) {
    switch (category) {
      case 'Electricity':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
      case 'Wi-Fi':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`;
      case 'Classroom':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
      case 'Washroom':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10v12"/><path d="M15 10v12"/><path d="M11 10v12"/><path d="M4 10h16"/><path d="M9 4a3 3 0 0 1 6 0v6H9V4z"/></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    }
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Pending': return 'badge-status-pending';
      case 'In Progress': return 'badge-status-progress';
      case 'Resolved': return 'badge-status-resolved';
      default: return 'badge-subtle';
    }
  }

  function getPriorityBadgeClass(priority) {
    switch (priority) {
      case 'Urgent': return 'badge-prio-urgent';
      case 'High': return 'badge-prio-high';
      case 'Medium': return 'badge-prio-medium';
      case 'Low': return 'badge-prio-low';
      default: return 'badge-subtle';
    }
  }

  // ==========================================================================
  // 5. Toast Notification System
  // ==========================================================================
  function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Dismiss">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);

    setTimeout(() => {
      removeToast(toast);
    }, duration);
  }

  function removeToast(toast) {
    if (!toast) return;
    toast.classList.add('toast-hide');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 250);
  }

  // ==========================================================================
  // 6. Statistics & KPI Counter Calculation
  // ==========================================================================
  function updateStatistics() {
    const total = complaints.length;
    let pendingCount = 0;
    let progressCount = 0;
    let resolvedCount = 0;

    const categoryCounts = {
      Electricity: 0,
      'Wi-Fi': 0,
      Classroom: 0,
      Washroom: 0,
      Other: 0
    };

    complaints.forEach((c) => {
      if (c.status === 'Pending') pendingCount++;
      else if (c.status === 'In Progress') progressCount++;
      else if (c.status === 'Resolved') resolvedCount++;

      if (categoryCounts[c.category] !== undefined) {
        categoryCounts[c.category]++;
      } else {
        categoryCounts['Other']++;
      }
    });

    // Update KPI DOM
    const elTotal = document.getElementById('statTotalCount');
    const elPending = document.getElementById('statPendingCount');
    const elProgress = document.getElementById('statProgressCount');
    const elResolved = document.getElementById('statResolvedCount');
    const elResolutionRate = document.getElementById('statResolutionRate');
    const elPendingBadge = document.getElementById('headerPendingBadge');

    if (elTotal) elTotal.textContent = total;
    if (elPending) elPending.textContent = pendingCount;
    if (elProgress) elProgress.textContent = progressCount;
    if (elResolved) elResolved.textContent = resolvedCount;

    if (elPendingBadge) {
      elPendingBadge.textContent = pendingCount;
      elPendingBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }

    if (elResolutionRate) {
      const rate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
      elResolutionRate.textContent = `${rate}% Resolved`;
    }

    renderCategoryDistribution(categoryCounts, total);
  }

  function renderCategoryDistribution(counts, total) {
    const container = document.getElementById('categoryDistributionBars');
    if (!container) return;

    const categories = [
      { key: 'Electricity', color: 'var(--cat-electricity)' },
      { key: 'Wi-Fi', color: 'var(--cat-wifi)' },
      { key: 'Classroom', color: 'var(--cat-classroom)' },
      { key: 'Washroom', color: 'var(--cat-washroom)' },
      { key: 'Other', color: 'var(--cat-other)' }
    ];

    container.innerHTML = categories.map((cat) => {
      const count = counts[cat.key] || 0;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return `
        <div class="breakdown-item">
          <div class="breakdown-meta">
            <span>${cat.key}</span>
            <span class="breakdown-count">${count} <small>(${pct}%)</small></span>
          </div>
          <div class="breakdown-bar-bg">
            <div class="breakdown-bar-fill" style="width: ${pct}%; background-color: ${cat.color};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // 7. Student Feed Rendering & Filtering
  // ==========================================================================
  function renderStudentFeed() {
    const container = document.getElementById('studentIssuesList');
    if (!container) return;

    const searchTerm = (document.getElementById('studentSearchInput')?.value || '').trim().toLowerCase();
    const categoryFilter = document.getElementById('studentCategoryFilter')?.value || 'ALL';
    const statusFilter = document.getElementById('studentStatusFilter')?.value || 'ALL';

    const filtered = complaints.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm);

      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box" style="padding: 2.5rem 1rem;">
          <div class="empty-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h4 class="empty-title">No issues found</h4>
          <p class="empty-desc">No complaints match your current filter criteria.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((c) => {
      const isUpvoted = userUpvotes.has(c.id);
      return `
        <article class="issue-card" data-id="${c.id}">
          <div class="issue-card-top">
            <div class="issue-badges">
              <span class="badge badge-id">${escapeHtml(c.id)}</span>
              <span class="badge ${getStatusBadgeClass(c.status)}">${escapeHtml(c.status)}</span>
              <span class="badge ${getPriorityBadgeClass(c.priority)}">${escapeHtml(c.priority)}</span>
              <span class="badge badge-category">${escapeHtml(c.category)}</span>
            </div>
            <span class="step-time">${formatRelativeTime(c.createdAt)}</span>
          </div>

          <h3 class="issue-card-title">${escapeHtml(c.title)}</h3>
          <p class="issue-card-desc">${escapeHtml(c.description)}</p>

          <div class="issue-card-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${escapeHtml(c.location)}</span>
          </div>

          <div class="issue-card-footer">
            <div class="reporter-meta">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>${escapeHtml(c.reporterName || 'Anonymous Student')}</span>
            </div>

            <div class="issue-card-actions">
              <button type="button" class="btn-upvote ${isUpvoted ? 'upvoted' : ''}" data-action="upvote" data-id="${c.id}" title="Upvote issue priority">
                <span>👍</span>
                <span>${c.upvotes || 0}</span>
              </button>
              <button type="button" class="btn-track" data-action="view-details" data-id="${c.id}">
                <span>Track Status →</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // ==========================================================================
  // 8. Admin Management Table & Card Rendering
  // ==========================================================================
  function renderAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    const mobileCardsContainer = document.getElementById('adminMobileCards');
    const emptyState = document.getElementById('adminEmptyState');
    const countBadge = document.getElementById('adminResultsCount');
    const clearBtn = document.getElementById('btnClearAllFilters');

    if (!tbody || !mobileCardsContainer) return;

    const searchTerm = (document.getElementById('adminSearchInput')?.value || '').trim().toLowerCase();
    const categoryFilter = document.getElementById('adminCategoryFilter')?.value || 'ALL';
    const statusFilter = document.getElementById('adminStatusFilter')?.value || 'ALL';
    const priorityFilter = document.getElementById('adminPriorityFilter')?.value || 'ALL';
    const sortOption = document.getElementById('adminSortSelect')?.value || 'newest';

    const hasActiveFilters =
      Boolean(searchTerm) ||
      categoryFilter !== 'ALL' ||
      statusFilter !== 'ALL' ||
      priorityFilter !== 'ALL';

    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !hasActiveFilters);
    }

    let filtered = complaints.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.id.toLowerCase().includes(searchTerm) ||
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm) ||
        (item.reporterName && item.reporterName.toLowerCase().includes(searchTerm));

      const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

      return matchesSearch && matchesCat && matchesStatus && matchesPriority;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortOption === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      }
      const priorityWeights = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      if (sortOption === 'priority-desc') {
        return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
      }
      if (sortOption === 'priority-asc') {
        return (priorityWeights[a.priority] || 0) - (priorityWeights[b.priority] || 0);
      }
      return 0;
    });

    if (countBadge) {
      countBadge.textContent = `Showing ${filtered.length} of ${complaints.length} tickets`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      mobileCardsContainer.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    // Desktop Table Rows
    tbody.innerHTML = filtered.map((c) => {
      const statusClass =
        c.status === 'Pending' ? 'pending' : c.status === 'In Progress' ? 'progress' : 'resolved';

      return `
        <tr data-id="${c.id}">
          <td class="td-id">${escapeHtml(c.id)}</td>
          <td>
            <span class="td-issue-title">${escapeHtml(c.title)}</span>
            <span class="td-issue-desc">${escapeHtml(c.description)}</span>
            <div class="td-reporter">Reported by: ${escapeHtml(c.reporterName || 'Student')} (${escapeHtml(c.reporterEmail || 'N/A')})</div>
          </td>
          <td>
            <span class="badge badge-category">${escapeHtml(c.category)}</span>
          </td>
          <td>
            <div class="td-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${escapeHtml(c.location)}</span>
            </div>
          </td>
          <td>
            <span class="badge ${getPriorityBadgeClass(c.priority)}">${escapeHtml(c.priority)}</span>
          </td>
          <td>
            <span class="step-time" title="${formatFullDateTime(c.createdAt)}">${formatRelativeTime(c.createdAt)}</span>
          </td>
          <td>
            <select class="status-changer-select ${statusClass}" data-action="change-status" data-id="${c.id}" aria-label="Change status">
              <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
              <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>🛠️ In Progress</option>
              <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>✅ Resolved</option>
            </select>
          </td>
          <td class="td-actions">
            <div class="action-btn-group">
              <button type="button" class="btn-icon-action" data-action="view-details" data-id="${c.id}" title="View Details / Notes">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button type="button" class="btn-icon-action danger" data-action="delete" data-id="${c.id}" title="Delete complaint">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Mobile Cards View
    mobileCardsContainer.innerHTML = filtered.map((c) => {
      const statusClass =
        c.status === 'Pending' ? 'pending' : c.status === 'In Progress' ? 'progress' : 'resolved';

      return `
        <div class="admin-card-item" data-id="${c.id}">
          <div class="admin-card-header">
            <span class="badge badge-id">${escapeHtml(c.id)}</span>
            <span class="badge ${getPriorityBadgeClass(c.priority)}">${escapeHtml(c.priority)}</span>
          </div>
          <div class="admin-card-body">
            <h4 class="td-issue-title">${escapeHtml(c.title)}</h4>
            <div class="td-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${escapeHtml(c.location)}</span>
            </div>
            <div class="td-reporter">Reported: ${formatRelativeTime(c.createdAt)} by ${escapeHtml(c.reporterName || 'Student')}</div>
          </div>
          <div class="admin-card-controls">
            <select class="status-changer-select ${statusClass}" data-action="change-status" data-id="${c.id}" aria-label="Change status">
              <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
              <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>🛠️ In Progress</option>
              <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>✅ Resolved</option>
            </select>
            <div class="action-btn-group">
              <button type="button" class="btn-icon-action" data-action="view-details" data-id="${c.id}" title="View Details">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button type="button" class="btn-icon-action danger" data-action="delete" data-id="${c.id}" title="Delete complaint">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // 9. Complaint Lifecycle & CRUD Actions
  // ==========================================================================
  function updateComplaintStatus(id, newStatus) {
    const item = complaints.find((c) => c.id === id);
    if (!item) return;

    item.status = newStatus;
    item.updatedAt = new Date().toISOString();
    saveState();
    updateStatistics();
    renderStudentFeed();
    renderAdminTable();

    // If modal open for this item, refresh modal view
    if (currentActiveComplaintId === id) {
      populateDetailModal(item);
    }

    showToast(`Status updated to "${newStatus}" for ticket ${id}`, 'success');
  }

  function handleAddComplaint(formData) {
    const newComplaint = {
      id: generateTicketId(),
      title: formData.title.trim(),
      category: formData.category,
      location: formData.location.trim(),
      priority: formData.priority,
      description: formData.description.trim(),
      reporterName: formData.reporterName?.trim() || 'Anonymous Student',
      reporterEmail: formData.reporterEmail?.trim() || 'student@campus.edu',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminNotes: '',
      upvotes: 1,
      image: formData.image || null
    };

    complaints.unshift(newComplaint);
    saveState();
    updateStatistics();
    renderStudentFeed();
    renderAdminTable();

    showToast(`Ticket ${newComplaint.id} submitted successfully!`, 'success');
    return newComplaint;
  }

  function handleDeleteComplaint(id) {
    complaints = complaints.filter((c) => c.id !== id);
    saveState();
    updateStatistics();
    renderStudentFeed();
    renderAdminTable();

    showToast(`Complaint ${id} deleted successfully.`, 'info');
  }

  function handleUpvote(id) {
    const item = complaints.find((c) => c.id === id);
    if (!item) return;

    if (userUpvotes.has(id)) {
      userUpvotes.delete(id);
      item.upvotes = Math.max(0, (item.upvotes || 1) - 1);
      showToast('Upvote removed.', 'info');
    } else {
      userUpvotes.add(id);
      item.upvotes = (item.upvotes || 0) + 1;
      showToast('Upvoted! Thank you for raising awareness.', 'success');
    }

    saveUpvotes();
    saveState();
    renderStudentFeed();
  }

  // ==========================================================================
  // 10. Detail & Resolution Lifecycle Modal
  // ==========================================================================
  function openDetailModal(id) {
    const item = complaints.find((c) => c.id === id);
    if (!item) return;

    currentActiveComplaintId = id;
    populateDetailModal(item);

    const backdrop = document.getElementById('detailModalBackdrop');
    if (backdrop) backdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailModal() {
    const backdrop = document.getElementById('detailModalBackdrop');
    if (backdrop) backdrop.classList.add('hidden');
    document.body.style.overflow = '';
    currentActiveComplaintId = null;

    const indicator = document.getElementById('noteSavedIndicator');
    if (indicator) indicator.classList.add('hidden');
  }

  function populateDetailModal(item) {
    document.getElementById('modalTicketId').textContent = item.id;
    document.getElementById('modalComplaintTitle').textContent = item.title;

    const statusBadge = document.getElementById('modalStatusBadge');
    statusBadge.textContent = item.status;
    statusBadge.className = `badge ${getStatusBadgeClass(item.status)}`;

    const prioBadge = document.getElementById('modalPriorityBadge');
    prioBadge.textContent = item.priority;
    prioBadge.className = `badge ${getPriorityBadgeClass(item.priority)}`;

    document.getElementById('modalCategory').textContent = item.category;
    document.getElementById('modalLocation').textContent = item.location;
    document.getElementById('modalReporter').textContent = `${item.reporterName || 'Anonymous'} (${item.reporterEmail || 'N/A'})`;
    document.getElementById('modalTimestamp').textContent = formatFullDateTime(item.createdAt);
    document.getElementById('modalDescription').textContent = item.description;

    // Attached Image Preview
    const imgSection = document.getElementById('modalImageSection');
    const modalImg = document.getElementById('modalAttachedImage');
    if (item.image) {
      modalImg.src = item.image;
      imgSection.classList.remove('hidden');
    } else {
      imgSection.classList.add('hidden');
      modalImg.src = '';
    }

    // Admin Notes Field
    const notesInput = document.getElementById('modalAdminNotesInput');
    notesInput.value = item.adminNotes || '';

    // Update Stepper Lifecycle
    updateModalStepper(item);

    // Update status buttons selected state
    document.querySelectorAll('.btn-status-choice').forEach((btn) => {
      btn.classList.toggle('selected', btn.getAttribute('data-status') === item.status);
    });
  }

  function updateModalStepper(item) {
    const stepPending = document.getElementById('stepPending');
    const stepProgress = document.getElementById('stepProgress');
    const stepResolved = document.getElementById('stepResolved');

    const conn1 = document.getElementById('connectorPendingProgress');
    const conn2 = document.getElementById('connectorProgressResolved');

    const timeReported = document.getElementById('stepTimeReported');
    const timeProgress = document.getElementById('stepTimeProgress');
    const timeResolved = document.getElementById('stepTimeResolved');

    timeReported.textContent = formatRelativeTime(item.createdAt);

    // Reset classes
    [stepPending, stepProgress, stepResolved].forEach((el) => {
      el.classList.remove('active', 'completed');
    });
    [conn1, conn2].forEach((el) => el.classList.remove('completed'));

    if (item.status === 'Pending') {
      stepPending.classList.add('active');
      timeProgress.textContent = 'Awaiting triage';
      timeResolved.textContent = 'Pending';
    } else if (item.status === 'In Progress') {
      stepPending.classList.add('completed');
      conn1.classList.add('completed');
      stepProgress.classList.add('active');
      timeProgress.textContent = 'Active Investigation';
      timeResolved.textContent = 'Pending';
    } else if (item.status === 'Resolved') {
      stepPending.classList.add('completed');
      conn1.classList.add('completed');
      stepProgress.classList.add('completed');
      conn2.classList.add('completed');
      stepResolved.classList.add('completed');
      timeProgress.textContent = 'Work Done';
      timeResolved.textContent = formatRelativeTime(item.updatedAt);
    }
  }

  // ==========================================================================
  // 11. Confirmation Modal for Deletion
  // ==========================================================================
  function openConfirmDeleteModal(id) {
    pendingDeleteComplaintId = id;
    const item = complaints.find((c) => c.id === id);
    const titleText = item ? `Delete Ticket ${item.id}?` : 'Delete Complaint?';
    const messageText = item
      ? `Are you sure you want to permanently remove "${item.title}"? This cannot be undone.`
      : 'Are you sure you want to delete this complaint?';

    document.getElementById('confirmDialogTitle').textContent = titleText;
    document.getElementById('confirmDialogMessage').textContent = messageText;

    const modal = document.getElementById('confirmModalBackdrop');
    if (modal) modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeConfirmModal() {
    const modal = document.getElementById('confirmModalBackdrop');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
    pendingDeleteComplaintId = null;
  }

  // ==========================================================================
  // 12. Export to CSV & Demo Data Reset
  // ==========================================================================
  function exportComplaintsToCSV() {
    if (!complaints.length) {
      showToast('No complaints to export.', 'warning');
      return;
    }

    const headers = ['Ticket ID', 'Title', 'Category', 'Location', 'Priority', 'Status', 'Reporter Name', 'Reporter Email', 'Created At', 'Admin Notes'];
    const rows = complaints.map((c) => [
      c.id,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.category,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      c.priority,
      c.status,
      `"${(c.reporterName || '').replace(/"/g, '""')}"`,
      c.reporterEmail || '',
      c.createdAt,
      `"${(c.adminNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CampusCare_Complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Complaints exported to CSV successfully.', 'success');
  }

  function resetDemoComplaints() {
    complaints = JSON.parse(JSON.stringify(SAMPLE_COMPLAINTS));
    saveState();
    updateStatistics();
    renderStudentFeed();
    renderAdminTable();
    showToast('Reset to original demo complaints.', 'info');
  }

  // ==========================================================================
  // 13. UI Navigation & Role Switcher & Theme Manager
  // ==========================================================================
  const THEME_STORAGE_KEY = 'campuscare_theme_v1';

  function initTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(currentTheme, false);
  }

  function applyTheme(theme, notify = true) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme preference', e);
    }

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      toggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }

    if (notify) {
      showToast(theme === 'dark' ? 'Switched to Dark Mode 🌙' : 'Switched to Light Mode ☀️', 'info', 2000);
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  }

  function switchRole(role) {
    const btnStudent = document.getElementById('btnRoleStudent');
    const btnAdmin = document.getElementById('btnRoleAdmin');
    const viewStudent = document.getElementById('viewStudent');
    const viewAdmin = document.getElementById('viewAdmin');

    if (role === 'admin') {
      btnAdmin.classList.add('active');
      btnAdmin.setAttribute('aria-selected', 'true');
      btnStudent.classList.remove('active');
      btnStudent.setAttribute('aria-selected', 'false');

      viewAdmin.classList.add('active');
      viewStudent.classList.remove('active');
      renderAdminTable();
    } else {
      btnStudent.classList.add('active');
      btnStudent.setAttribute('aria-selected', 'true');
      btnAdmin.classList.remove('active');
      btnAdmin.setAttribute('aria-selected', 'false');

      viewStudent.classList.add('active');
      viewAdmin.classList.remove('active');
      renderStudentFeed();
    }
  }

  // ==========================================================================
  // 14. Event Listeners & Initialization
  // ==========================================================================
  function setupEventListeners() {
    // Theme Switcher (Light / Dark Mode)
    document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);

    // Role switcher
    document.getElementById('btnRoleStudent')?.addEventListener('click', () => switchRole('student'));
    document.getElementById('btnRoleAdmin')?.addEventListener('click', () => switchRole('admin'));

    // Quick report button in header
    document.getElementById('btnQuickReport')?.addEventListener('click', () => {
      switchRole('student');
      const formAnchor = document.getElementById('reportFormAnchor');
      if (formAnchor) {
        formAnchor.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('complaintTitle')?.focus();
      }
    });

    // Admin toolbar "New Complaint" button
    document.getElementById('btnAdminNewComplaint')?.addEventListener('click', () => {
      switchRole('student');
      const formAnchor = document.getElementById('reportFormAnchor');
      if (formAnchor) {
        formAnchor.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('complaintTitle')?.focus();
      }
    });

    // Export CSV and Reset buttons
    document.getElementById('btnExportCSV')?.addEventListener('click', exportComplaintsToCSV);
    document.getElementById('btnResetDemoData')?.addEventListener('click', resetDemoComplaints);

    // Form: Description character counter
    const descInput = document.getElementById('complaintDescription');
    const charCounter = document.getElementById('descCharCounter');
    descInput?.addEventListener('input', () => {
      const len = descInput.value.length;
      charCounter.textContent = `${len} / 500`;
    });

    // Quick Location Chips
    document.querySelectorAll('.chip-btn').forEach((chip) => {
      chip.addEventListener('click', () => {
        const loc = chip.getAttribute('data-loc');
        const locInput = document.getElementById('complaintLocation');
        if (locInput && loc) {
          locInput.value = loc;
          locInput.focus();
        }
      });
    });

    // Category Radio visual card highlight
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.category-card').forEach((card) => card.classList.remove('selected'));
        const parentCard = radio.closest('.category-card');
        if (parentCard) parentCard.classList.add('selected');
        document.getElementById('categoryError').textContent = '';
      });
    });

    // File Drag & Drop / Upload
    const fileDropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('complaintImage');
    const imagePreviewWrapper = document.getElementById('imagePreviewWrapper');
    const dropPrompt = document.getElementById('dropPrompt');
    const imagePreview = document.getElementById('imagePreview');
    const btnRemoveImage = document.getElementById('btnRemoveImage');
    let attachedImageDataUrl = null;

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleImageFile(file);
      });
    }

    if (fileDropZone) {
      ['dragenter', 'dragover'].forEach((eventName) => {
        fileDropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          fileDropZone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach((eventName) => {
        fileDropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          fileDropZone.classList.remove('dragover');
        });
      });
      fileDropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleImageFile(e.dataTransfer.files[0]);
        }
      });
    }

    function handleImageFile(file) {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (PNG, JPG, WEBP).', 'warning');
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        showToast('Image size exceeds 3MB limit.', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        attachedImageDataUrl = e.target.result;
        imagePreview.src = attachedImageDataUrl;
        imagePreviewWrapper.classList.remove('hidden');
        dropPrompt.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }

    btnRemoveImage?.addEventListener('click', (e) => {
      e.stopPropagation();
      attachedImageDataUrl = null;
      if (fileInput) fileInput.value = '';
      imagePreview.src = '';
      imagePreviewWrapper.classList.add('hidden');
      dropPrompt.classList.remove('hidden');
    });

    // Form Submission
    const complaintForm = document.getElementById('complaintForm');
    complaintForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      // Reset feedbacks
      ['titleError', 'categoryError', 'locationError', 'priorityError', 'descError'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
      });

      const title = document.getElementById('complaintTitle').value;
      const selectedCategory = document.querySelector('input[name="category"]:checked')?.value;
      const location = document.getElementById('complaintLocation').value;
      const priority = document.getElementById('complaintPriority').value;
      const description = document.getElementById('complaintDescription').value;
      const reporterName = document.getElementById('reporterName').value;
      const reporterEmail = document.getElementById('reporterEmail').value;

      let isValid = true;

      if (!title || title.trim().length < 5) {
        document.getElementById('titleError').textContent = 'Please enter a descriptive title (at least 5 characters).';
        isValid = false;
      }
      if (!selectedCategory) {
        document.getElementById('categoryError').textContent = 'Please select a complaint category.';
        isValid = false;
      }
      if (!location || location.trim().length < 3) {
        document.getElementById('locationError').textContent = 'Please specify the exact room, floor or block.';
        isValid = false;
      }
      if (!priority) {
        document.getElementById('priorityError').textContent = 'Please select a priority level.';
        isValid = false;
      }
      if (!description || description.trim().length < 10) {
        document.getElementById('descError').textContent = 'Please provide details describing the problem (at least 10 characters).';
        isValid = false;
      }

      if (!isValid) return;

      const submitBtn = document.getElementById('btnSubmitComplaint');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Submitting ticket...</span>`;

      setTimeout(() => {
        handleAddComplaint({
          title,
          category: selectedCategory,
          location,
          priority,
          description,
          reporterName,
          reporterEmail,
          image: attachedImageDataUrl
        });

        // Reset form
        complaintForm.reset();
        attachedImageDataUrl = null;
        if (fileInput) fileInput.value = '';
        imagePreview.src = '';
        imagePreviewWrapper.classList.add('hidden');
        dropPrompt.classList.remove('hidden');
        charCounter.textContent = '0 / 500';
        document.querySelectorAll('.category-card').forEach((card) => card.classList.remove('selected'));

        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <span>Submit Complaint</span>
        `;
      }, 350);
    });

    // Reset Form button
    document.getElementById('btnResetForm')?.addEventListener('click', () => {
      attachedImageDataUrl = null;
      if (fileInput) fileInput.value = '';
      imagePreview.src = '';
      imagePreviewWrapper.classList.add('hidden');
      dropPrompt.classList.remove('hidden');
      charCounter.textContent = '0 / 500';
      document.querySelectorAll('.category-card').forEach((card) => card.classList.remove('selected'));
      ['titleError', 'categoryError', 'locationError', 'priorityError', 'descError'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
      });
    });

    // Student Search & Filters
    const studentSearchInput = document.getElementById('studentSearchInput');
    const btnStudentClearSearch = document.getElementById('btnStudentClearSearch');
    studentSearchInput?.addEventListener('input', () => {
      btnStudentClearSearch.classList.toggle('hidden', !studentSearchInput.value);
      renderStudentFeed();
    });
    btnStudentClearSearch?.addEventListener('click', () => {
      studentSearchInput.value = '';
      btnStudentClearSearch.classList.add('hidden');
      renderStudentFeed();
    });

    document.getElementById('studentCategoryFilter')?.addEventListener('change', renderStudentFeed);
    document.getElementById('studentStatusFilter')?.addEventListener('change', renderStudentFeed);

    // Student Feed delegation: Upvote & Track
    document.getElementById('studentIssuesList')?.addEventListener('click', (e) => {
      const upvoteBtn = e.target.closest('[data-action="upvote"]');
      if (upvoteBtn) {
        const id = upvoteBtn.getAttribute('data-id');
        handleUpvote(id);
        return;
      }

      const trackBtn = e.target.closest('[data-action="view-details"]');
      if (trackBtn) {
        const id = trackBtn.getAttribute('data-id');
        openDetailModal(id);
      }
    });

    // Admin Filters & Search
    document.getElementById('adminSearchInput')?.addEventListener('input', renderAdminTable);
    document.getElementById('adminCategoryFilter')?.addEventListener('change', renderAdminTable);
    document.getElementById('adminStatusFilter')?.addEventListener('change', renderAdminTable);
    document.getElementById('adminPriorityFilter')?.addEventListener('change', renderAdminTable);
    document.getElementById('adminSortSelect')?.addEventListener('change', renderAdminTable);

    document.getElementById('btnClearAllFilters')?.addEventListener('click', () => {
      document.getElementById('adminSearchInput').value = '';
      document.getElementById('adminCategoryFilter').value = 'ALL';
      document.getElementById('adminStatusFilter').value = 'ALL';
      document.getElementById('adminPriorityFilter').value = 'ALL';
      document.getElementById('adminSortSelect').value = 'newest';
      renderAdminTable();
    });

    // Admin Table / Card Event Delegation (Status Change, View, Delete)
    const handleAdminActions = (e) => {
      // Status dropdown change
      if (e.target.matches('[data-action="change-status"]')) {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        updateComplaintStatus(id, newStatus);
        return;
      }

      // View details button
      const viewBtn = e.target.closest('[data-action="view-details"]');
      if (viewBtn) {
        const id = viewBtn.getAttribute('data-id');
        openDetailModal(id);
        return;
      }

      // Delete button
      const deleteBtn = e.target.closest('[data-action="delete"]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        openConfirmDeleteModal(id);
      }
    };

    document.getElementById('adminComplaintsTable')?.addEventListener('change', handleAdminActions);
    document.getElementById('adminComplaintsTable')?.addEventListener('click', handleAdminActions);
    document.getElementById('adminMobileCards')?.addEventListener('change', handleAdminActions);
    document.getElementById('adminMobileCards')?.addEventListener('click', handleAdminActions);

    // Detail Modal Controls
    document.getElementById('btnCloseDetailModal')?.addEventListener('click', closeDetailModal);
    document.getElementById('btnCloseModalFooter')?.addEventListener('click', closeDetailModal);

    // Save Admin Notes in Modal
    document.getElementById('btnSaveAdminNotes')?.addEventListener('click', () => {
      if (!currentActiveComplaintId) return;
      const notes = document.getElementById('modalAdminNotesInput').value.trim();
      const item = complaints.find((c) => c.id === currentActiveComplaintId);
      if (item) {
        item.adminNotes = notes;
        item.updatedAt = new Date().toISOString();
        saveState();
        renderAdminTable();

        const indicator = document.getElementById('noteSavedIndicator');
        if (indicator) {
          indicator.classList.remove('hidden');
          setTimeout(() => indicator.classList.add('hidden'), 2500);
        }
        showToast('Admin maintenance note saved.', 'success');
      }
    });

    // Status choices inside Detail Modal
    document.querySelectorAll('.btn-status-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!currentActiveComplaintId) return;
        const newStatus = btn.getAttribute('data-status');
        updateComplaintStatus(currentActiveComplaintId, newStatus);
      });
    });

    // Close modal on backdrop click
    document.getElementById('detailModalBackdrop')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('detailModalBackdrop')) {
        closeDetailModal();
      }
    });

    // Confirm Delete Modal Actions
    document.getElementById('btnCancelConfirm')?.addEventListener('click', closeConfirmModal);
    document.getElementById('btnAcceptConfirm')?.addEventListener('click', () => {
      if (pendingDeleteComplaintId) {
        handleDeleteComplaint(pendingDeleteComplaintId);
        closeConfirmModal();
      }
    });

    document.getElementById('confirmModalBackdrop')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('confirmModalBackdrop')) {
        closeConfirmModal();
      }
    });

    // Global ESC key closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDetailModal();
        closeConfirmModal();
      }
    });
  }

  // ==========================================================================
  // 15. App Bootstrap
  // ==========================================================================
  function init() {
    initTheme();
    loadState();
    setupEventListeners();
    updateStatistics();
    renderStudentFeed();
    renderAdminTable();

    // Expose limited methods to global app object for inline handlers if any
    window.app = {
      resetAdminFilters: () => {
        document.getElementById('adminSearchInput').value = '';
        document.getElementById('adminCategoryFilter').value = 'ALL';
        document.getElementById('adminStatusFilter').value = 'ALL';
        document.getElementById('adminPriorityFilter').value = 'ALL';
        renderAdminTable();
      }
    };
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
