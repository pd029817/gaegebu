'use client';

import { useState, useEffect, useRef } from 'react';

const TYPES = [
  { key: 'income',   label: '수입',     emoji: '💰' },
  { key: 'fixed',    label: '고정비',   emoji: '📌' },
  { key: 'variable', label: '수시지출', emoji: '🛒' },
  { key: 'invest',   label: '투자',     emoji: '📈' },
];

const CATEGORIES = {
  income:   ['월급', '부수입', '용돈', '환급', '기타'],
  fixed:    ['월세/대출', '보험', '구독', '통신비', '교육비', '기타'],
  variable: ['식비', '교통', '쇼핑', '문화', '의료', '기타'],
  invest:   ['주식', 'ETF', '펀드', '코인', '부동산', '기타'],
};

const TYPE_LABEL = {
  income: '수입', fixed: '고정비', variable: '수시지출', invest: '투자',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(n) {
  return n.toLocaleString('ko-KR') + '원';
}

function formatAmount(val) {
  const digits = val.replace(/[^0-9]/g, '');
  return digits ? Number(digits).toLocaleString('ko-KR') : '';
}

export default function Gaegebu() {
  const [entries, setEntries]   = useState([]);
  const [type, setType]         = useState('income');
  const [category, setCategory] = useState(CATEGORIES.income[0]);
  const [desc, setDesc]         = useState('');
  const [amount, setAmount]     = useState('');
  const [date, setDate]         = useState('');
  const [showDate, setShowDate] = useState(false);
  const [filter, setFilter]     = useState({ type: 'all', month: '' });
  const descRef = useRef(null);

  useEffect(() => {
    setDate(today());
    fetch('/api/entries')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEntries(data.map(e => ({ ...e, desc: e.description })));
      });
  }, []);

  function selectType(t) {
    setType(t);
    setCategory(CATEGORIES[t][0]);
    descRef.current?.focus();
  }

  function selectCategory(c) {
    setCategory(c);
    descRef.current?.focus();
  }

  function handleAmount(e) {
    setAmount(formatAmount(e.target.value));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') addEntry();
  }

  async function addEntry() {
    if (!desc.trim()) { alert('내용을 입력하세요.'); descRef.current?.focus(); return; }
    const num = parseInt(amount.replace(/,/g, ''));
    if (!num || num <= 0) return alert('금액을 입력하세요.');

    const newEntry = {
      id: Date.now(), date, type, category, description: desc.trim(), amount: num,
    };

    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });
    const result = await res.json();
    if (!res.ok) return alert('저장 실패: ' + result.error);

    setEntries(prev => [...prev, { ...newEntry, desc: newEntry.description }]);
    setDesc('');
    setAmount('');
    descRef.current?.focus();
  }

  async function deleteEntry(id) {
    const res = await fetch('/api/entries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const result = await res.json();
      return alert('삭제 실패: ' + result.error);
    }
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  // 요약
  const sum = (t) => entries.filter(e => e.type === t).reduce((s, e) => s + e.amount, 0);
  const totalIncome   = sum('income');
  const totalFixed    = sum('fixed');
  const totalVariable = sum('variable');
  const totalInvest   = sum('invest');
  const balance = totalIncome - totalFixed - totalVariable - totalInvest;

  // 필터
  const filtered = entries
    .filter(e => {
      if (filter.type !== 'all' && e.type !== filter.type) return false;
      if (filter.month && !e.date.startsWith(filter.month)) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  return (
    <>
      <h1>📒 가계부</h1>

      {/* 요약 카드 */}
      <div className="summary">
        <div className="card income">
          <div className="label">수입</div>
          <div className="amount">{fmt(totalIncome)}</div>
        </div>
        <div className="card fixed">
          <div className="label">고정비</div>
          <div className="amount">{fmt(totalFixed)}</div>
        </div>
        <div className="card variable">
          <div className="label">수시지출</div>
          <div className="amount">{fmt(totalVariable)}</div>
        </div>
        <div className="card invest">
          <div className="label">투자</div>
          <div className="amount">{fmt(totalInvest)}</div>
        </div>
        <div className="card balance">
          <div className="label">잔액</div>
          <div className="amount">{fmt(balance)}</div>
        </div>
      </div>

      {/* 빠른 입력 폼 */}
      <div className="quickForm">
        {/* 1단계: 유형 선택 */}
        <div className="typeRow">
          {TYPES.map(t => (
            <button
              key={t.key}
              className={`typeBtn ${t.key} ${type === t.key ? 'active' : ''}`}
              onClick={() => selectType(t.key)}
            >
              <span className="typeEmoji">{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* 2단계: 카테고리 선택 */}
        <div className="catRow">
          {CATEGORIES[type].map(c => (
            <button
              key={c}
              className={`catChip ${category === c ? 'active ' + type : ''}`}
              onClick={() => selectCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* 3단계: 내용 + 금액 입력 */}
        <div className="inputRow">
          <input
            ref={descRef}
            type="text"
            className="inputDesc"
            placeholder="내용"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <input
            type="text"
            inputMode="numeric"
            className="inputAmount"
            placeholder="금액"
            value={amount}
            onChange={handleAmount}
            onKeyDown={handleKeyDown}
          />
          <button className={`addBtn ${type}`} onClick={addEntry}>추가</button>
        </div>

        {/* 날짜 (기본 접힘) */}
        <div className="dateRow">
          <button className="dateToggle" onClick={() => setShowDate(v => !v)}>
            📅 {date === today() ? '오늘' : date} {showDate ? '▲' : '▼'}
          </button>
          {showDate && (
            <input
              type="date"
              className="dateInput"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* 내역 목록 */}
      <div className="listBox">
        <div className="listHeader">
          <h2>내역</h2>
          <div className="listFilters">
            <select value={filter.month} onChange={e => setFilter(f => ({ ...f, month: e.target.value }))}>
              <option value="">전체 기간</option>
              {[...new Set(entries.map(e => e.date.slice(0, 7)))]
                .sort((a, b) => b.localeCompare(a))
                .map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
              <option value="all">전체</option>
              {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">내역이 없습니다.</div>
        ) : (
          filtered.map(e => (
            <div key={e.id} className="entry">
              <div className={`entryDot ${e.type}`} />
              <div className="entryLeft">
                <div className="entryDesc">
                  {e.desc}
                  <span className={`badge ${e.type}`}>{e.category}</span>
                </div>
                <div className="entryMeta">{e.date}</div>
              </div>
              <div className={`entryAmount ${e.type}`}>
                {e.type === 'income' ? '+' : '-'}{fmt(e.amount)}
              </div>
              <button className="btnDel" onClick={() => deleteEntry(e.id)}>✕</button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
