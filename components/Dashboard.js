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

  const years = [...new Set(entries.map(e => e.date.slice(0, 4)))]
    .map(Number).sort((a, b) => b - a);
  if (!years.includes(new Date().getFullYear())) years.unshift(new Date().getFullYear());

  const monthlyData = MONTHS.map((label, i) => {
    const prefix = `${year}-${String(i + 1).padStart(2, '0')}`;
    const rows = entries.filter(e => e.date.startsWith(prefix));
    const income   = rows.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const fixed    = rows.filter(e => e.type === 'fixed').reduce((s, e) => s + e.amount, 0);
    const variable = rows.filter(e => e.type === 'variable').reduce((s, e) => s + e.amount, 0);
    const invest   = rows.filter(e => e.type === 'invest').reduce((s, e) => s + e.amount, 0);
    const balance  = income - fixed - variable - invest;
    return { label, income, fixed, variable, invest, balance };
  });

  const totalIncome   = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalFixed    = monthlyData.reduce((s, m) => s + m.fixed, 0);
  const totalVariable = monthlyData.reduce((s, m) => s + m.variable, 0);
  const totalInvest   = monthlyData.reduce((s, m) => s + m.invest, 0);
  const totalBalance  = totalIncome - totalFixed - totalVariable - totalInvest;

  return (
    <>
      <h1>📊 대시보드</h1>

      <div className="yearSelector">
        {years.map(y => (
          <button key={y} className={`yearBtn ${y === year ? 'active' : ''}`} onClick={() => setYear(y)}>
            {y}년
          </button>
        ))}
      </div>

      <div className="summary" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="card income"><div className="label">수입</div><div className="amount">{fmtFull(totalIncome)}</div></div>
        <div className="card fixed"><div className="label">고정비</div><div className="amount">{fmtFull(totalFixed)}</div></div>
        <div className="card variable"><div className="label">수시지출</div><div className="amount">{fmtFull(totalVariable)}</div></div>
        <div className="card invest"><div className="label">투자</div><div className="amount">{fmtFull(totalInvest)}</div></div>
        <div className="card balance"><div className="label">잔액</div><div className="amount">{fmtFull(totalBalance)}</div></div>
      </div>

      <div className="chartBox">
        <h2 className="chartTitle">{year}년 월별 수입 · 지출 · 투자</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income"   name="수입"    fill="#68d391" radius={[4,4,0,0]} />
            <Bar dataKey="fixed"    name="고정비"  fill="#f6ad55" radius={[4,4,0,0]} />
            <Bar dataKey="variable" name="수시지출" fill="#fc8181" radius={[4,4,0,0]} />
            <Bar dataKey="invest"   name="투자"    fill="#76e4f7" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chartBox">
        <h2 className="chartTitle">{year}년 월별 잔액 추이</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="balance" name="잔액" stroke="#63b3ed" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="tableBox">
        <h2 className="chartTitle">{year}년 월별 상세</h2>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>월</th><th>수입</th><th>고정비</th><th>수시지출</th><th>투자</th><th>잔액</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m, i) => {
                const empty = m.income === 0 && m.fixed === 0 && m.variable === 0 && m.invest === 0;
                return (
                  <tr key={i} className={empty ? 'empty-row' : ''}>
                    <td>{m.label}</td>
                    <td className="income">{m.income > 0 ? fmtFull(m.income) : '-'}</td>
                    <td className="fixed">{m.fixed > 0 ? fmtFull(m.fixed) : '-'}</td>
                    <td className="variable">{m.variable > 0 ? fmtFull(m.variable) : '-'}</td>
                    <td className="invest">{m.invest > 0 ? fmtFull(m.invest) : '-'}</td>
                    <td className={m.balance >= 0 ? 'income' : 'variable'}>
                      {empty ? '-' : fmtFull(m.balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td>합계</td>
                <td className="income">{fmtFull(totalIncome)}</td>
                <td className="fixed">{fmtFull(totalFixed)}</td>
                <td className="variable">{fmtFull(totalVariable)}</td>
                <td className="invest">{fmtFull(totalInvest)}</td>
                <td className={totalBalance >= 0 ? 'income' : 'variable'}>{fmtFull(totalBalance)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
