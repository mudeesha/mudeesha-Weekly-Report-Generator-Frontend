import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MemberStatusPoint, TaskType } from '@/types';
const BRAND = '#5B3FB3';
const BRAND_LIGHT = '#9D83E1';
const SUCCESS = '#55C98E';
const WARNING = '#F28B64';
const GRAY = '#CFC6DE';
const ERROR = '#E65B70';
const axis = {
  tick: { fill: '#807895', fontSize: 11 },
  axisLine: false as const,
  tickLine: false as const
};
const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: '1px solid #E5DDEE',
    boxShadow: '0 12px 28px rgba(58,42,99,0.12)',
    fontSize: 12,
    padding: '8px 12px'
  },
  labelStyle: { color: '#302861', fontWeight: 600, marginBottom: 4 }
};
export function SubmissionTrendChart({ data, height = 300, mode = 'bar' }: {
  data: {
    label: string;
    submitted: number;
    approved: number;
    expected: number;
  }[];
  height?: number;
  mode?: 'bar' | 'area';
}) {
  return (<div style={{ height }} className="w-full">
    <ResponsiveContainer width="100%" height="100%">
      {mode === 'bar' ?
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEE8F5" vertical={false} />
          <XAxis dataKey="label" {...axis} />
          <YAxis allowDecimals={false} {...axis} />
          <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(117,86,200,0.07)' }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#807895', paddingTop: 8 }} />
          <Bar name="Submitted" dataKey="submitted" fill={BRAND} radius={[6, 6, 0, 0]} maxBarSize={28} />
          <Bar name="Approved" dataKey="approved" fill={BRAND_LIGHT} radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart> :
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="submittedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="approvedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND_LIGHT} stopOpacity={0.28} />
              <stop offset="100%" stopColor={BRAND_LIGHT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEE8F5" vertical={false} />
          <XAxis dataKey="label" {...axis} />
          <YAxis allowDecimals={false} {...axis} />
          <Tooltip {...tooltipStyle} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#807895', paddingTop: 8 }} />
          <Area name="Submitted" type="monotone" dataKey="submitted" stroke={BRAND} strokeWidth={2} fill="url(#submittedFill)" />
          <Area name="Approved" type="monotone" dataKey="approved" stroke={BRAND_LIGHT} strokeWidth={2} fill="url(#approvedFill)" />
        </AreaChart>}
    </ResponsiveContainer>
  </div>);
}

export function MemberStatusTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    payload: MemberStatusPoint;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="min-w-[190px] rounded-[12px] border border-[#e5ddee] bg-white px-3 py-2.5 shadow-[0_12px_28px_rgba(58,42,99,0.12)]">
      <div className="text-[12px] font-semibold text-[#302861]">
        {label}
      </div>

      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between gap-6 text-[11px]">
          <span className="flex items-center gap-2 text-[#594dba]">
            <span className="h-2 w-2 rounded-full bg-[#5B3FB3]" />
            Submitted
          </span>

          <span className="font-medium text-[#4e4769]">
            {item.submitted}
          </span>
        </div>

        {item.submitted > 0 && (
          <div className="ml-4 space-y-1 border-l border-[#e8e3ef] pl-3">
            <div className="flex items-center justify-between gap-6 text-[10px]">
              <span className="text-[#55a97e]">
                Approved
              </span>

              <span className="text-[#6f687d]">
                {item.approved}
              </span>
            </div>

            <div className="flex items-center justify-between gap-6 text-[10px]">
              <span className="text-[#f28b64]">
                Needs Correction
              </span>

              <span className="text-[#6f687d]">
                {item.needsCorrection}
              </span>
            </div>

            <div className="flex items-center justify-between gap-6 text-[10px]">
              <span className="text-[#7761d8]">
                Awaiting Review
              </span>

              <span className="text-[#6f687d]">
                {item.awaitingReview}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-6 text-[11px]">
          <span className="flex items-center gap-2 text-[#8f879e]">
            <span className="h-2 w-2 rounded-full bg-[#CFC6DE]" />
            Draft
          </span>

          <span className="font-medium text-[#4e4769]">
            {item.draft}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6 text-[11px]">
          <span className="flex items-center gap-2 text-[#a29bad]">
            <span className="h-2 w-2 rounded-full bg-[#E9E5EF]" />
            Not Submitted
          </span>

          <span className="font-medium text-[#4e4769]">
            {item.notSubmitted}
          </span>
        </div>
      </div>
    </div>
  );
}

export function StatusByMemberChart({
  data,
  height = 300,
}: {
  data: MemberStatusPoint[];
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 8,
            right: 8,
            left: -18,
            bottom: 0,
          }}
          barGap={6}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#EEE8F5"
            vertical={false}
          />

          <XAxis
            dataKey="member"
            {...axis}
          />

          <YAxis
            allowDecimals={false}
            {...axis}
          />

          <Tooltip
            content={<MemberStatusTooltip />}
            cursor={{
              fill: 'rgba(117,86,200,0.07)',
            }}
          />

          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: 12,
              color: '#807895',
              paddingTop: 8,
            }}
          />

          <Bar
            name="Submitted"
            dataKey="submitted"
            fill={BRAND}
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />

          <Bar
            name="Draft"
            dataKey="draft"
            fill={GRAY}
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />

          <Bar
            name="Not Submitted"
            dataKey="notSubmitted"
            fill="#E9E5EF"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


export function WorkloadByProjectChart({ data, height = 300 }: {
  data: {
    project: string;
    tasks: number;
    hours: number;
  }[];
  height?: number;
}) {
  return (<div style={{ height }} className="w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEE8F5" horizontal={false} />
        <XAxis type="number" {...axis} />
        <YAxis type="category" dataKey="project" width={118} {...axis} />
        <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(117,86,200,0.07)' }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#807895', paddingTop: 8 }} />
        <Bar name="Tasks" dataKey="tasks" fill={BRAND} radius={[0, 6, 6, 0]} maxBarSize={14} />
        <Bar name="Hours" dataKey="hours" fill={BRAND_LIGHT} radius={[0, 6, 6, 0]} maxBarSize={14} />
      </BarChart>
    </ResponsiveContainer>
  </div>);
}
const TYPE_COLORS: Record<TaskType, string> = {
  Development: BRAND,
  Testing: '#7A64CE',
  Meetings: '#B8A2F2',
  Documentation: '#55C98E',
  Support: WARNING,
  Research: '#8E72D8',
  Other: GRAY
};
export function TimeByTaskTypeChart({ data, height = 260 }: {
  data: {
    type: TaskType;
    hours: number;
  }[];
  height?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.hours, 0);
  return (<div>
    <div style={{ height }} className="relative w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="hours" nameKey="type" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none">
            {data.map((entry) => <Cell key={entry.type} fill={TYPE_COLORS[entry.type]} />)}
          </Pie>
          <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value} h`, 'Hours']} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[20px] font-semibold text-[#3c3374]">
          {total}
        </span>
        <span className="text-[10px] text-[#887f9d]">Total hours</span>
      </div>
    </div>
    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
      {data.map((entry) => <li key={entry.type} className="flex items-center gap-2 text-[10px] text-[#655d82]">
        <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COLORS[entry.type] }} />
        <span className="flex-1 truncate">
          {entry.type}
        </span>
        <span className="font-medium text-[#4e4769]">{entry.hours}h</span>
      </li>)}
    </ul>
  </div>);
}
export function ComplianceGauge({ value, caption, trend }: {
  value: number;
  caption: string;
  trend?: number;
}) {
  const data = [{ name: 'compliance', value, fill: BRAND }];
  return (<div>
    <div className="relative h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart data={data} innerRadius="72%" outerRadius="100%" startAngle={180} endAngle={0} cy="78%">
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar background={{ fill: '#EEE8F5' }} dataKey="value" cornerRadius={20} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center">
        <span className="text-[20px] font-semibold text-[#3c3374]">{value}%</span>
        {typeof trend === 'number' &&
          <span className="mt-1 text-[10px] font-medium text-success-700">
            +{trend}%
          </span>}
      </div>
    </div>
    <p className="mt-2 text-center text-[11px] text-[#887f9d]">
      {caption}
    </p>
  </div>);
}
export function CompletionTrendChart({ data, height = 300 }: {
  data: {
    label: string;
    planned: number;
    actual: number;
  }[];
  height?: number;
}) {
  return (<div style={{ height }} className="w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEE8F5" vertical={false} />
        <XAxis dataKey="label" {...axis} />
        <YAxis unit="%" domain={[0, 100]} {...axis} />
        <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value}%`, '']} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#807895', paddingTop: 8 }} />
        <Line name="Planned completion" type="monotone" dataKey="planned" stroke={BRAND_LIGHT} strokeWidth={2} dot={{ r: 3 }} />
        <Line name="Actual completion" type="monotone" dataKey="actual" stroke={BRAND} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>);
}
export function MiniSparkline({ data, tone = 'brand' }: {
  data: {
    value: number;
  }[];
  tone?: 'brand' | 'success' | 'error';
}) {
  const stroke = tone === 'success' ? SUCCESS : tone === 'error' ? ERROR : BRAND;
  return (<div className="h-12 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>);
}
export function CompletedTasksTrendChart({ data, height = 280 }: {
  data: {
    label: string;
    completed: number;
  }[];
  height?: number;
}) {
  return <div style={{ height }} className="w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEE8F5" vertical={false} />
        <XAxis dataKey="label" {...axis} />
        <YAxis allowDecimals={false} {...axis} />
        <Tooltip {...tooltipStyle} />
        <Line name="Completed tasks" type="monotone" dataKey="completed" stroke={BRAND} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>;
}
