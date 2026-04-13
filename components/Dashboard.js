'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function fmt(n) {
  if (Math.abs(n) >= 10000) return (n / 10000).toFixed(0) + '만';
  return n.toLocaleString('ko-KR');
}

function fmtFull(n) {
  return n.toLocaleString('ko-KR') + '원';
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chartTooltip">
      <p className="chartTooltipTitle">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmtFull(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const saved = localStorage.getItem('gaegebu');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  // 전체 연도 목록
  const years = [...new Set(entries.map(e => e.date.slice(0, 4)))]
    .map(Number)
    .sort((a, b) => b - a);

  if (years.length === 0 || !years.includes(year)) {
    const currentYear = new Date().getFullYear();
    if (!years.includes(currentYear)) years.unshift(currentYear);
  }

  // 선택 연도 데이터 월별 집계
  const monthlyData = MONTHS.map((label, i) => {
    const month = String(i + 1).padStart(2, '0');
    const prefix = `${year}-${month}`;
    const rows = entries.filter(e => e.date.startsWith(prefix));

    const income   = rows.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const fixed    = rows.filter(e => e.type === 'fixed').reduce((s, e) => s + e.amount, 0);
    const variable = rows.filter(e => e.type === 'variable').reduce((s, e) => s + e.amount, 0);
    const balance  = income - fixed - variable;

    return { label, income, fixed, variable, balance };
  });

  // 연간 합계
  const totalIncome   = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalFixed    = monthlyData.reduce((s, m) => s + m.fixed, 0);
  const totalVariable = monthlyData.reduce((s, m) => s + m.variable, 0);
  const totalBalance  = totalIncome - totalFixed - totalVariable;

  return (
    <>
      <h1>📊 대시보드</h1>

      {/* 연도 선택 */}
      <div className="yearSelector">
        {years.map(y => (
          <button
            key={y}
            className={`yearBtn ${y === year ? 'active' : ''}`}
            onClick={() => setYear(y)}
          >
            {y}년
          </button>
        ))}
      </div>

      {/* 연간 요약 카드 */}
      <div className="summary">
        <div className="card income">
          <div className="label">연간 수입</div>
          <div className="amount">{fmtFull(totalIncome)}</div>
        </div>
        <div className="card fixed">
          <div className="label">고정비 지출</div>
          <div className="amount">{fmtFull(totalFixed)}</div>
        </div>
        <div className="card variable">
          <div className="label">수시 지출</div>
          <div className="amount">{fmtFull(totalVariable)}</div>
        </div>
        <div className="card balance">
          <div className="label">연간 잔액</div>
          <div className="amount">{fmtFull(totalBalance)}</div>
        </div>
      </div>

      {/* 월별 수입/지출 막대 차트 */}
      <div className="chartBox">
        <h2 className="chartTitle">{year}년 월별 수입 · 지출</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income"   name="수입"       fill="#68d391" radius={[4,4,0,0]} />
            <Bar dataKey="fixed"    name="고정비 지출" fill="#f6ad55" radius={[4,4,0,0]} />
            <Bar dataKey="variable" name="수시 지출"   fill="#fc8181" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 월별 잔액 추이 라인 차트 */}
      <div className="chartBox">
        <h2 className="chartTitle">{year}년 월별 잔액 추이</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="balance"
              name="잔액"
              stroke="#63b3ed"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#63b3ed' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 월별 상세 테이블 */}
      <div className="tableBox">
        <h2 className="chartTitle">{year}년 월별 상세</h2>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>월</th>
                <th>수입</th>
                <th>고정비</th>
                <th>수시지출</th>
                <th>잔액</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m, i) => (
                <tr key={i} className={m.income === 0 && m.fixed === 0 && m.variable === 0 ? 'empty-row' : ''}>
                  <td>{m.label}</td>
                  <td className="income">{m.income > 0 ? fmtFull(m.income) : '-'}</td>
                  <td className="fixed">{m.fixed > 0 ? fmtFull(m.fixed) : '-'}</td>
                  <td className="variable">{m.variable > 0 ? fmtFull(m.variable) : '-'}</td>
                  <td className={m.balance >= 0 ? 'income' : 'variable'}>
                    {m.income === 0 && m.fixed === 0 && m.variable === 0 ? '-' : fmtFull(m.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td>합계</td>
                <td className="income">{fmtFull(totalIncome)}</td>
                <td className="fixed">{fmtFull(totalFixed)}</td>
                <td className="variable">{fmtFull(totalVariable)}</td>
                <td className={totalBalance >= 0 ? 'income' : 'variable'}>{fmtFull(totalBalance)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
