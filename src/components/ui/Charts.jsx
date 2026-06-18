import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area,
} from 'recharts';

// ── Warm palette for charts ──────────────────────────────────
export const CHART_COLORS = ['#D4AF37', '#B8714F', '#705138', '#A87E5C', '#BE9B78', '#543C29'];
const GRID = '#EAD5C4';
const AXIS = '#A87E5C';

const peso = (v) => `$${Number(v).toLocaleString('es-AR')}`;

// ── Custom tooltip (warm styled) ─────────────────────────────
const WarmTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-primary-200 shadow-modal px-3 py-2 text-xs">
      {label && <p className="font-semibold text-secondary mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-primary-600 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
          {entry.name}: <span className="font-semibold text-secondary">{formatter ? formatter(entry.value) : entry.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── Card wrapper ─────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, height = 260 }) => (
  <div className="chart-card">
    {title && <h3 className="chart-title">{title}</h3>}
    {subtitle && <p className="chart-sub">{subtitle}</p>}
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

// ── Bar chart card ───────────────────────────────────────────
// data: [{ name, ...series }], bars: [{ key, label, color? }]
export const BarCard = ({ title, subtitle, data, bars, money = false, height }) => (
  <ChartCard title={title} subtitle={subtitle} height={height}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: money ? 8 : -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
      <XAxis dataKey="name" tick={{ fill: AXIS, fontSize: 12 }} axisLine={{ stroke: GRID }} tickLine={false} />
      <YAxis tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false}
        tickFormatter={money ? (v) => `$${v >= 1000 ? (v / 1000) + 'k' : v}` : undefined} />
      <Tooltip content={<WarmTooltip formatter={money ? peso : undefined} />} cursor={{ fill: '#F5EAE0', opacity: 0.5 }} />
      {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: AXIS }} />}
      {bars.map((b, i) => (
        <Bar key={b.key} dataKey={b.key} name={b.label} fill={b.color || CHART_COLORS[i % CHART_COLORS.length]} radius={[6, 6, 0, 0]} maxBarSize={48} />
      ))}
    </BarChart>
  </ChartCard>
);

// ── Pie / donut card ─────────────────────────────────────────
// data: [{ name, value }]
export const PieCard = ({ title, subtitle, data, money = false, height, donut = true }) => (
  <ChartCard title={title} subtitle={subtitle} height={height}>
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        innerRadius={donut ? 56 : 0}
        outerRadius={88}
        paddingAngle={2}
        stroke="none"
      >
        {data.map((entry, i) => (
          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<WarmTooltip formatter={money ? peso : undefined} />} />
      <Legend wrapperStyle={{ fontSize: 12, color: AXIS }} />
    </PieChart>
  </ChartCard>
);

// ── Line / area card ─────────────────────────────────────────
// data: [{ name, value }]
export const LineCard = ({ title, subtitle, data, money = false, height, area = true, label = 'Total' }) => (
  <ChartCard title={title} subtitle={subtitle} height={height}>
    {area ? (
      <AreaChart data={data} margin={{ top: 8, right: 8, left: money ? 8 : -16, bottom: 0 }}>
        <defs>
          <linearGradient id="warmArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: AXIS, fontSize: 12 }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false}
          tickFormatter={money ? (v) => `$${v >= 1000 ? (v / 1000) + 'k' : v}` : undefined} />
        <Tooltip content={<WarmTooltip formatter={money ? peso : undefined} />} />
        <Area type="monotone" dataKey="value" name={label} stroke="#B8942A" strokeWidth={2.5} fill="url(#warmArea)" />
      </AreaChart>
    ) : (
      <LineChart data={data} margin={{ top: 8, right: 8, left: money ? 8 : -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: AXIS, fontSize: 12 }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false}
          tickFormatter={money ? (v) => `$${v >= 1000 ? (v / 1000) + 'k' : v}` : undefined} />
        <Tooltip content={<WarmTooltip formatter={money ? peso : undefined} />} />
        <Line type="monotone" dataKey="value" name={label} stroke="#B8942A" strokeWidth={2.5} dot={{ fill: '#D4AF37', r: 3 }} />
      </LineChart>
    )}
  </ChartCard>
);

export default { BarCard, PieCard, LineCard, CHART_COLORS };
