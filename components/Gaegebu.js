'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = {
  income:   ['월급', '용돈', '기타수입'],
  fixed:    ['월세/대출', '보험', '구독서비스', '통신비', '교육비', '기타고정'],
  variable: ['식비', '교통', '쇼핑', '문화', '의료', '기타'],
};

const TYPE_LABEL = {
  income:   '수입',
  fixed:    '고정비 지출',
  variable: '수시 지출',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(n) {
  return n.toLocaleString('ko-KR') + '원';
}

export default function Gaegebu() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    date: today(),
    type: 'income',
    category: CATEGORIES.income[0],
    desc: '',
    amount: '',
  });
  const [filter, setFilter] = useState({ type: 'all', category: 'all', month: '' });

  // localStorage에서 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('gaegebu');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  // localStorage에 저장
  useEffect(() => {
    localStorage.setItem('gaegebu', JSON.stringify(entries));
  }, [entries]);

  function handleTypeChange(type) {
    setForm(f => ({ ...f, type, category: CATEGORIES[type][0] }));
  }

  function addEntry() {
    if (!form.date) return alert('날짜를 선택하세요.');
    if (!form.desc.trim()) return alert('내용을 입력하세요.');
    const amount = parseInt(form.amount);
    if (!amount || amount <= 0) return alert('올바른 금액을 입력하세요.');

    setEntries(prev => [
      ...prev,
      { id: Date.now(), ...form, amount },
    ]);
    setForm(f => ({ ...f, desc: '', amount: '' }));
  }

  function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  function clearAll() {
    if (entries.length === 0) return;
    if (confirm('모든 내역을 삭제하시겠습니까?')) setEntries([]);
  }

  // 요약 계산
  const totalIncome   = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalFixed    = entries.filter(e => e.type === 'fixed').reduce((s, e) => s + e.amount, 0);
  const totalVariable = entries.filter(e => e.type === 'variable').reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalFixed - totalVariable;

  // 필터링 및 정렬
  const filtered = entries
    .filter(e => {
      if (filter.type !== 'all' && e.type !== filter.type) return false;
      if (filter.category !== 'all' && e.category !== filter.category) return false;
      if (filter.month && !e.date.startsWith(filter.month)) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <h1>📒 가계부</h1>

      {/* 요약 카드 */}
      <div className="summary">
        <div className="card income">
          <div className="label">총 수입</div>
          <div className="amount">{fmt(totalIncome)}</div>
        </div>
        <div className="card fixed">
          <div className="label">고정비 지출</div>
          <div className="amount">{fmt(totalFixed)}</div>
        </div>
        <div className="card variable">
          <div className="label">수시 지출</div>
          <div className="amount">{fmt(totalVariable)}</div>
        </div>
        <div className="card balance">
          <div className="label">잔액</div>
          <div className="amount">{fmt(balance)}</div>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="formBox">
        <h2>내역 추가</h2>
        <div className="formRow">
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />
          <select value={form.type} onChange={e => handleTypeChange(e.target.value)}>
            <option value="income">수입</option>
            <option value="fixed">고정비 지출</option>
            <option value="variable">수시 지출</option>
          </select>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES[form.type].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="formRow">
          <input
            type="text"
            placeholder="내용 (예: 점심식사)"
            value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
          />
          <input
            type="number"
            placeholder="금액"
            min="0"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          />
        </div>
        <button className="btn btnAdd" onClick={addEntry}>+ 추가</button>
      </div>

      {/* 내역 목록 */}
      <div className="listBox">
        <div className="listHeader">
          <h2>내역 목록</h2>
          <button
            className="btn"
            style={{ background: '#fff0f0', color: '#e53e3e', fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={clearAll}
          >
            전체 삭제
          </button>
        </div>

        <div className="filterRow">
          <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
            <option value="all">전체</option>
            <option value="income">수입만</option>
            <option value="fixed">고정비 지출만</option>
            <option value="variable">수시 지출만</option>
          </select>
          <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
            <option value="all">카테고리 전체</option>
            <optgroup label="수입">
              {CATEGORIES.income.map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
            <optgroup label="고정비 지출">
              {CATEGORIES.fixed.map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
            <optgroup label="수시 지출">
              {CATEGORIES.variable.map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          </select>
          <input
            type="month"
            value={filter.month}
            onChange={e => setFilter(f => ({ ...f, month: e.target.value }))}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty">내역이 없습니다.</div>
        ) : (
          filtered.map(e => (
            <div key={e.id} className="entry">
              <div className="entryLeft">
                <div className="entryDesc">
                  {e.desc}
                  <span className={`badge ${e.type}`}>{e.category}</span>
                </div>
                <div className="entryMeta">{e.date} · {TYPE_LABEL[e.type]}</div>
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
