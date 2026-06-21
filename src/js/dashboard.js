const Dashboard = {
  defaultColors: ['#6c757d', '#adb5bd', '#ced4da', '#dee2e6', '#495057'],

  mockData: {
    chartDonut: [
      { label: 'Segment A', value: 35 },
      { label: 'Segment B', value: 25 },
      { label: 'Segment C', value: 20 },
      { label: 'Segment D', value: 20 }
    ],
    chartbar: [
      { label: 'A', value: 40 },
      { label: 'B', value: 80 },
      { label: 'C', value: 65 },
      { label: 'D', value: 35 },
      { label: 'E', value: 55 },
      { label: 'F', value: 15 },
      { label: 'G', value: 85 }
    ],
    tableUsers: [
      { firstName: 'Mark', lastName: 'Otto', userName: '@mdo' },
      { firstName: 'Jacob', lastName: 'Throton', userName: '@fat' },
      { firstName: 'Larry', lastName: 'theBird', userName: '@twitter' }
    ]
  },

  normalizeChartData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item, index) => {
      if (typeof item === 'number') {
        return { label: String(index + 1), value: item };
      }
      if (item && typeof item === 'object') {
        const label = item.label || item.name || item.key || item.category || String(index + 1);
        const value = Number(item.value || item.count || item.total || item.y || 0);
        return { label, value };
      }
      return { label: String(index + 1), value: 0 };
    }).filter(item => item.value > 0);
  },

  normalizeUserData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item, index) => ({
      id: item.id || index + 1,
      firstName: item.firstName || item.first_name || item.FirstName || '',
      lastName: item.lastName || item.last_name || item.LastName || '',
      userName: item.userName || item.user_name || item.UserName || item.username || ''
    }));
  },

  renderDonutChart(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const normalizedData = this.normalizeChartData(data);
    if (normalizedData.length === 0) {
      container.innerHTML = '<p class="text-muted">No data available</p>';
      return;
    }

    const width = 280;
    const height = 280;
    const margin = 20;
    const radius = Math.min(width, height) / 2 - margin;
    const innerRadius = radius * 0.55;

    const svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(normalizedData.map(d => d.label))
      .range(this.defaultColors);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcs = svg.selectAll('arc')
      .data(pie(normalizedData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label))
      .attr('stroke', '#fff')
      .style('stroke-width', '2px');
  },

  renderBarChart(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const normalizedData = this.normalizeChartData(data);
    if (normalizedData.length === 0) {
      container.innerHTML = '<p class="text-muted">No data available</p>';
      return;
    }

    const width = 360;
    const height = 260;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(normalizedData.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(normalizedData, d => d.value) * 1.1])
      .range([innerHeight, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '12px');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('font-size', '12px');

    svg.selectAll('.bar')
      .data(normalizedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.value))
      .attr('fill', '#adb5bd');
  },

  renderUserTable(data) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const normalizedData = this.normalizeUserData(data);
    tbody.innerHTML = '';

    if (normalizedData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No users found</td></tr>';
      return;
    }

    normalizedData.forEach((user, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${user.firstName}</td>
        <td>${user.lastName}</td>
        <td>${user.userName}</td>
      `;
      tbody.appendChild(row);
    });
  },

  showError(message) {
    const tbody = document.getElementById('users-table-body');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">${message}</td></tr>`;
    }
  },

  async fetchDashboardData() {
    try {
      return await window.api.getDashboard();
    } catch (err) {
      console.warn('Failed to fetch dashboard data, using mock data:', err);
      return this.mockData;
    }
  },

  async init() {
    const data = await this.fetchDashboardData();
    this.renderDonutChart(data.chartDonut, 'donut-chart');
    this.renderBarChart(data.chartBar || data.chartbar, 'bar-chart');
    this.renderUserTable(data.tableUsers);
  }
};

window.Dashboard = Dashboard;
