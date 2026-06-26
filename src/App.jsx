import { useState, useEffect, useRef } from "react";

const QUESTIONS_A = [
  { id: "A_T1", func: "T", text: "何かを決めるとき、感情よりも論理やデータを優先することが多い" },
  { id: "A_T2", func: "T", text: "議論では、「筋が通っているかどうか」が最も重要だと感じる" },
  { id: "A_F1", func: "F", text: "何かを判断するとき、その人の気持ちや関係性への影響を真っ先に考える" },
  { id: "A_F2", func: "F", text: "正しいことでも、誰かを傷つけるなら言い方を変えたいと思う" },
  { id: "A_S1", func: "S", text: "計画を立てるとき、実績や過去の経験を重視する方だ" },
  { id: "A_S2", func: "S", text: "今この瞬間、目の前のことに集中している方だ" },
  { id: "A_N1", func: "N", text: "まだ見えていない可能性や未来のパターンを考えることにエネルギーを使う" },
  { id: "A_N2", func: "N", text: "物事の表面より、その背景にある意味や意図が気になる" },
];

const QUESTIONS_B = [
  { id: "B1", funcA: "T", funcB: "F", textA: "もっと論理的に整理できる自分", textB: "もっと感情に正直になれる自分" },
  { id: "B2", funcA: "S", funcB: "N", textA: "今この瞬間を味わえる自分", textB: "もっと大きなビジョンで動ける自分" },
  { id: "B3", funcA: "T", funcB: "N", textA: "データや根拠を冷静に扱える自分", textB: "直観や閃きを信頼できる自分" },
  { id: "B4", funcA: "F", funcB: "S", textA: "人の気持ちに寄り添える自分", textB: "目の前の体験を楽しめる自分" },
  { id: "B5", funcA: "T", funcB: "S", textA: "複雑な問題を体系的に整理できる自分", textB: "五感を使って今を生きられる自分" },
  { id: "B6", funcA: "F", funcB: "N", textA: "大切な人との関係を深められる自分", textB: "自分の可能性を広げていける自分" },
  { id: "B7", funcA: "T", funcB: "F", textA: "感情に流されず冷静に判断できる自分", textB: "自分の気持ちを素直に表現できる自分" },
  { id: "B8", funcA: "S", funcB: "N", textA: "実績や経験を積み上げていける自分", textB: "まだ見えない未来を切り拓いていける自分" },
];

const MBTI_STACKS = {
  INTJ: { D:"N", A:"T", T:"F", I:"S" }, INTP: { D:"T", A:"N", T:"S", I:"F" },
  ENTJ: { D:"T", A:"N", T:"S", I:"F" }, ENTP: { D:"N", A:"T", T:"F", I:"S" },
  INFJ: { D:"N", A:"F", T:"T", I:"S" }, INFP: { D:"F", A:"N", T:"S", I:"T" },
  ENFJ: { D:"F", A:"N", T:"S", I:"T" }, ENFP: { D:"N", A:"F", T:"T", I:"S" },
  ISTJ: { D:"S", A:"T", T:"F", I:"N" }, ISFJ: { D:"S", A:"F", T:"T", I:"N" },
  ESTJ: { D:"T", A:"S", T:"N", I:"F" }, ESFJ: { D:"F", A:"S", T:"N", I:"T" },
  ISTP: { D:"T", A:"S", T:"N", I:"F" }, ISFP: { D:"F", A:"S", T:"N", I:"T" },
  ESTP: { D:"S", A:"T", T:"F", I:"N" }, ESFP: { D:"S", A:"F", T:"T", I:"N" },
};

const STACK_SCORES = { D: 5, A: 3.5, T: 2, I: 1 };
const FUNC_LABELS = { T: "思考", F: "感情", S: "感覚", N: "直観" };
const INFERIOR_MAP = { T: "F", F: "T", S: "N", N: "S" };

const FUNC_DESC = {
  T: "論理・分析・客観的判断を得意とする機能。原因と結果を重視し、システムや原則を重んじる。",
  F: "価値・共感・人間関係を重視する機能。何が大切かを感じ取り、人の感情に寄り添う。",
  S: "今この瞬間の具体的な現実を知覚する機能。五感・経験・事実を信頼し、地に足をつける。",
  N: "見えない可能性・パターン・意味を直観する機能。未来、抽象、背景にある文脈を読む。",
};

function calcScoresA(answers) {
  const totals = { T: 0, F: 0, S: 0, N: 0 };
  const counts = { T: 0, F: 0, S: 0, N: 0 };
  QUESTIONS_A.forEach(q => {
    if (answers[q.id] !== undefined) {
      totals[q.func] += answers[q.id];
      counts[q.func]++;
    }
  });
  return Object.fromEntries(
    Object.keys(totals).map(k => [k, counts[k] > 0 ? totals[k] / counts[k] : 0])
  );
}

function calcScoresB(answers) {
  const counts = { T: 0, F: 0, S: 0, N: 0 };
  const appearances = { T: 0, F: 0, S: 0, N: 0 };
  QUESTIONS_B.forEach(q => {
    appearances[q.funcA]++;
    appearances[q.funcB]++;
    if (answers[q.id]) {
      counts[answers[q.id]]++;
    }
  });
  return Object.fromEntries(
    Object.keys(counts).map(k => [
      k,
      appearances[k] > 0 ? (counts[k] / appearances[k]) * 4 + 1 : 1
    ])
  );
}

function calcMbtiScores(mbtiType) {
  const stack = MBTI_STACKS[mbtiType.toUpperCase()];
  if (!stack) return null;
  const scores = { T: 0, F: 0, S: 0, N: 0 };
  Object.entries(stack).forEach(([pos, func]) => { scores[func] = STACK_SCORES[pos]; });
  return scores;
}

function RadarChart({ datasets, size = 280 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.36;
  const labels = ["思考", "感情", "感覚", "直観"];
  const keys = ["T", "F", "S", "N"];
  const angles = keys.map((_, i) => (i * Math.PI * 2) / 4 - Math.PI / 2);
  function toXY(angle, value) {
    const dist = (value / 5) * r;
    return [cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist];
  }
  const colors = [
    { stroke: "#7F77DD", fill: "rgba(127,119,221,0.15)" },
    { stroke: "#1D9E75", fill: "rgba(29,158,117,0.12)" },
    { stroke: "#EF9F27", fill: "rgba(239,159,39,0.12)" },
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {[1,2,3,4,5].map(lvl => {
        const pts = angles.map(a => toXY(a, lvl)).map(p => p.join(",")).join(" ");
        return <polygon key={lvl} points={pts} fill="none" stroke="rgba(127,119,221,0.15)" strokeWidth="0.5" />;
      })}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke="rgba(127,119,221,0.2)" strokeWidth="0.5" />
      ))}
      {datasets.map((ds, di) => {
        if (!ds) return null;
        const pts = keys.map((k, i) => toXY(angles[i], ds[k] || 0)).map(p => p.join(",")).join(" ");
        return <polygon key={di} points={pts} fill={colors[di].fill} stroke={colors[di].stroke} strokeWidth="1.5" strokeOpacity="0.9" />;
      })}
      {angles.map((a, i) => {
        const lx = cx + Math.cos(a) * (r + 22);
        const ly = cy + Math.sin(a) * (r + 22);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="500" fill="#a8a4f0" opacity="1">{labels[i]}</text>;
      })}
      {datasets.map((ds, di) => {
        if (!ds) return null;
        const domKey = Object.entries(ds).sort((a, b) => b[1] - a[1])[0][0];
        const domIdx = keys.indexOf(domKey);
        const [px, py] = toXY(angles[domIdx], ds[domKey]);
        return <circle key={di} cx={px} cy={py} r="3.5" fill={colors[di].stroke} opacity="0.9" />;
      })}
    </svg>
  );
}

function ScaleButton({ value, selected, onClick }) {
  const labels = { 1: "全く違う", 2: "やや違う", 3: "どちらとも", 4: "ややそう", 5: "非常にそう" };
  return (
    <button onClick={() => onClick(value)} style={{
      flex: 1, padding: "10px 4px",
      border: selected ? "1.5px solid #7F77DD" : "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-md)",
      background: selected ? "rgba(127,119,221,0.12)" : "var(--color-background-primary)",
      color: selected ? "#7F77DD" : "var(--color-text-secondary)",
      fontSize: "11px", fontWeight: selected ? "500" : "400",
      cursor: "pointer", transition: "all 0.15s",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
    }}>
      <span style={{ fontSize: "16px", fontWeight: "500", color: selected ? "#7F77DD" : "var(--color-text-primary)" }}>{value}</span>
      <span style={{ lineHeight: 1.2, textAlign: "center" }}>{labels[value]}</span>
    </button>
  );
}

function QuestionCardA({ question, index, total, answer, onAnswer }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", fontWeight: "500", margin: "0 0 10px", letterSpacing: "0.05em" }}>{index + 1} / {total}</p>
      <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--color-text-primary)", margin: "0 0 16px" }}>{question.text}</p>
      <div style={{ display: "flex", gap: "6px" }}>
        {[1,2,3,4,5].map(v => <ScaleButton key={v} value={v} selected={answer === v} onClick={onAnswer} />)}
      </div>
    </div>
  );
}

function QuestionCardB({ question, index, total, answer, onAnswer }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", fontWeight: "500", margin: "0 0 8px", letterSpacing: "0.05em" }}>{index + 1} / {total}</p>
      <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-text-primary)", margin: "0 0 4px", lineHeight: "1.6" }}>理想の自分に近いのはどちらですか？</p>
      <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", margin: "0 0 14px" }}>直感で選んでください</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[
          { func: question.funcA, text: question.textA },
          { func: question.funcB, text: question.textB },
        ].map(opt => (
          <label key={opt.func}
            style={{
              padding: "14px 16px",
              border: answer === opt.func ? "1.5px solid #1D9E75" : "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-md)",
              background: answer === opt.func ? "rgba(29,158,117,0.08)" : "var(--color-background-primary)",
              cursor: "pointer", transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
            <input
              type="radio"
              name={`question_${question.id}`}
              value={opt.func}
              checked={answer === opt.func}
              onChange={() => onAnswer(opt.func)}
              style={{ width: "18px", height: "18px", flexShrink: 0, accentColor: "#1D9E75", cursor: "pointer" }}
            />
            <span style={{
              fontSize: "14px", lineHeight: "1.5",
              fontWeight: answer === opt.func ? "500" : "400",
              color: answer === opt.func ? "#1D9E75" : "var(--color-text-primary)",
            }}>
              {opt.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function GapAnalysis({ scoreA, scoreB, scoreC }) {
  const keys = ["T", "F", "S", "N"];
  return (
    <div style={{ marginTop: "1.5rem" }}>
      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "12px", fontWeight: "500" }}>各機能のスコアとギャップ</p>
      {keys.map(k => {
        const a = scoreA[k] || 0, b = scoreB[k] || 0, c = scoreC ? (scoreC[k] || 0) : null;
        const gap = Math.abs(b - a);
        return (
          <div key={k} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px" }}>
              <span style={{ fontWeight: "500", color: "var(--color-text-primary)" }}>{FUNC_LABELS[k]}</span>
              <span style={{ color: gap > 1.5 ? "#D85A30" : "var(--color-text-tertiary)" }}>
                現在 {a.toFixed(1)} → 理想 {b.toFixed(1)}{c !== null ? ` / 混在 ${c.toFixed(1)}` : ""}
              </span>
            </div>
            <div style={{ height: "6px", borderRadius: "3px", background: "var(--color-background-secondary)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(a / 5) * 100}%`, background: "#7F77DD", borderRadius: "3px", opacity: "0.7" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SalesLP({ dominantFunc }) {
  const label = FUNC_LABELS[dominantFunc] || "思考";
  const lineHref = "https://line.me/R/ti/p/@034rnllo";

  const accent = "#7F77DD";
  const green  = "#1D9E75";

  const Divider = () => (
    <hr style={{ border: "none", borderTop: "1px solid var(--color-border-tertiary)", margin: "3rem 0" }} />
  );

  const SectionLabel = ({ children }) => (
    <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", color: accent, textTransform: "uppercase", margin: "0 0 0.6rem" }}>{children}</p>
  );

  const Lead = ({ children }) => (
    <p style={{ fontSize: "15px", lineHeight: "1.9", color: "var(--color-text-secondary)", margin: "0 0 1rem" }}>{children}</p>
  );

  const CheckItem = ({ children, color = green }) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "0.75rem" }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
        <circle cx="10" cy="10" r="10" fill={color} fillOpacity="0.12" />
        <path d="M5.5 10.5l3 2.5 6-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.75" }}>{children}</span>
    </div>
  );

  const LineBtn = ({ children = "LINEで体験セッションを申し込む" }) => (
    <a href={lineHref} target="_blank" rel="noopener noreferrer" style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
      padding: "16px 24px", background: "#06C755", color: "#fff",
      borderRadius: "8px", fontSize: "16px", fontWeight: "700",
      textDecoration: "none", boxShadow: "0 4px 16px rgba(6,199,85,0.3)",
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
      </svg>
      {children}
    </a>
  );

  return (
    <div style={{ marginTop: "4rem" }}>

      {/* ── HERO ── */}
      <div style={{ textAlign: "center", padding: "3.5rem 1rem 1rem" }}>
        <SectionLabel>Coaching by Sukekaku</SectionLabel>
        <h2 style={{ fontSize: "32px", fontWeight: "800", color: "var(--color-text-primary)", lineHeight: "1.35", margin: "0 0 1.25rem", letterSpacing: "-0.02em" }}>
          診断はいかがでしたか？
        </h2>
        <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", lineHeight: "1.8", margin: "0 0 2rem", maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}>
          もしかして、こんな疑問が頭をよぎっていませんか？
        </p>
        <blockquote style={{
          margin: "0 auto 2rem",
          padding: "1.75rem 2rem",
          background: "var(--color-background-secondary)",
          borderLeft: `4px solid ${accent}`,
          borderRadius: "0 8px 8px 0",
          textAlign: "left",
        }}>
          <p style={{ fontSize: "19px", fontWeight: "600", color: "var(--color-text-primary)", lineHeight: "1.7", margin: 0 }}>
            「現実」と「理想」のギャップを<br />どうすれば埋められるんだろう？
          </p>
        </blockquote>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          {["堂々巡りが続いている", "考えても答えが出ない", "現状が変わらない"].map(t => (
            <span key={t} style={{
              padding: "6px 14px", borderRadius: "100px",
              border: "1px solid var(--color-border-secondary)",
              fontSize: "12px", color: "var(--color-text-secondary)",
              background: "var(--color-background-primary)",
            }}>{t}</span>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── 問題提起 ── */}
      <div>
        <SectionLabel>The Problem</SectionLabel>
        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-text-primary)", lineHeight: "1.45", margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>
          {label}優位な方の「現実」と「理想」を埋める<br />万人向けの方法は、存在しません。
        </h3>
        <Lead>
          分析力の高いあなたは、他人から示された解決策を見たとき、こう感じることはありませんか？
        </Lead>
        <blockquote style={{
          margin: "0 0 1.25rem",
          padding: "1.25rem 1.5rem",
          borderLeft: `3px solid var(--color-border-secondary)`,
          background: "var(--color-background-secondary)",
          borderRadius: "0 6px 6px 0",
        }}>
          <p style={{ fontSize: "15px", fontStyle: "italic", color: "var(--color-text-primary)", lineHeight: "1.75", margin: 0 }}>
            「これ、正しそうに見えるけど、<br />自分にも当てはまるかはわからないよね。」
          </p>
        </blockquote>
        <Lead>
          本当にあなたにとって価値のある解決策は、<strong style={{ color: "var(--color-text-primary)" }}>「あなた」にしか導き出せない</strong>のです。この世で最もあなたを知っているのは、あなただからです。
        </Lead>
      </div>

      <Divider />

      {/* ── 逆説 ── */}
      <div>
        <SectionLabel>The Paradox</SectionLabel>
        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-text-primary)", lineHeight: "1.45", margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>
          なぜ、どれだけ考えても<br />答えが見つからないのか？
        </h3>
        <Lead>
          「自分の中に答えがあるから、考えればわかるはずだ」——そう思っていませんか？
        </Lead>

        {/* 脳 vs 心・身体 の比較 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "1.5rem 0" }}>
          {[
            {
              label: "🧠 脳の答え",
              color: "#dc3545",
              bg: "#fff5f5",
              border: "#fcc",
              items: ["他人の成功例", "SNSのアドバイス", "本の知識"],
              bad: true,
              note: "あなた以外に通用した方法の模範解答"
            },
            {
              label: "💚 心・身体の答え",
              color: green,
              bg: "#f0faf5",
              border: "#b2dfcf",
              items: ["あなただけの感覚", "ワクワク・嫌悪感", "本質的な欲求"],
              bad: false,
              note: "あなただけが持つ「本当の答え」"
            },
          ].map(c => (
            <div key={c.label} style={{
              borderRadius: "10px", overflow: "hidden",
              border: `1px solid ${c.border}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{ padding: "0.9rem 1rem", background: c.bg, borderBottom: `1px solid ${c.border}` }}>
                <p style={{ fontSize: "13px", fontWeight: "700", color: c.color, margin: 0 }}>{c.label}</p>
              </div>
              <div style={{ padding: "1rem", background: "var(--color-background-primary)" }}>
                {c.items.map(t => (
                  <div key={t} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", color: c.bad ? "#dc3545" : green, fontWeight: "700" }}>{c.bad ? "✕" : "✓"}</span>
                    <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{t}</span>
                  </div>
                ))}
                <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", lineHeight: "1.5", margin: "10px 0 0", paddingTop: "8px", borderTop: "1px solid var(--color-border-tertiary)" }}>{c.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "1.25rem 1.5rem", background: "var(--color-background-secondary)", borderRadius: "8px", borderLeft: `4px solid ${green}` }}>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-primary)", lineHeight: "1.7", margin: "0 0 0.4rem" }}>
            今あなたが求める「答え」を知っているのは、<span style={{ color: green }}>「心」と「身体」</span>です。
          </p>
          <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0 }}>
            神経科学者アントニオ・ダマシオ — 人間の意思決定は「身体感覚や感情」が最終決定を下す。
          </p>
        </div>
      </div>

      <Divider />

      {/* ── ユング ── */}
      <div>
        <SectionLabel>Carl Jung · Psychological Types</SectionLabel>
        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-text-primary)", lineHeight: "1.45", margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>
          「感じているのか」「考えているのか」<br />区別がつかなくなる理由
        </h3>
        <Lead>
          「思考」を過剰に使い続けると、相対する「感情」が無意識に抑圧されます。その結果、感情を<strong style={{ color: "var(--color-text-primary)" }}>考えているのか・感じているのかの区別がつかなくなる</strong>のです。
        </Lead>
        <div style={{
          padding: "1.5rem", borderRadius: "10px",
          border: "1px solid #fde8e8", background: "#fff8f8",
          boxShadow: "0 1px 6px rgba(220,53,69,0.08)",
        }}>
          <p style={{ fontSize: "17px", fontWeight: "700", color: "#c82333", lineHeight: "1.6", margin: 0 }}>
            優秀なあなたが、{label}優位な状態から<br />一人で脱却するのは、まず無理です。
          </p>
          <p style={{ fontSize: "13px", color: "#856404", margin: "0.75rem 0 0" }}>
            どれだけ考えても——考えること自体が、脱却の邪魔をしているからです。
          </p>
        </div>
      </div>

      <Divider />

      {/* ── 解決策 ── */}
      <div>
        <SectionLabel>The Solution</SectionLabel>
        <h3 style={{ fontSize: "28px", fontWeight: "900", color: green, lineHeight: "1.3", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>
          人に話すこと。
        </h3>
        <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)", margin: "0 0 1.5rem" }}>それが回り道じゃない、最短ルートです</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem" }}>
          {[
            { ok: false, text: `同じく${label}優位な人に話す → 論理の答え合わせで終わる` },
            { ok: true,  text: "言語・非言語の両方から読み取れるコーチに話す → 本当の答えが見えてくる" },
          ].map(r => (
            <div key={r.text} style={{
              display: "flex", gap: "12px", alignItems: "flex-start", padding: "1rem 1.25rem",
              borderRadius: "8px",
              background: r.ok ? "#f0faf5" : "#fff5f5",
              border: `1px solid ${r.ok ? "#b2dfcf" : "#fcc"}`,
            }}>
              <span style={{ fontWeight: "700", color: r.ok ? green : "#dc3545", flexShrink: 0, fontSize: "15px" }}>{r.ok ? "✓" : "✕"}</span>
              <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.7" }}>{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── コーチ紹介 ── */}
      <div>
        <SectionLabel>About Coach</SectionLabel>
        <h3 style={{ fontSize: "22px", fontWeight: "800", color: "var(--color-text-primary)", lineHeight: "1.45", margin: "0 0 1.5rem" }}>
          私に、あなたの悩みを<br />聞かせてもらえませんか？
        </h3>

        {/* プロフィールカード */}
        <div style={{
          display: "flex", gap: "16px", alignItems: "center",
          padding: "1.25rem", marginBottom: "1.5rem",
          background: "var(--color-background-secondary)", borderRadius: "10px",
          border: "1px solid var(--color-border-tertiary)",
        }}>
          <div style={{
            width: "60px", height: "60px", borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}, ${green})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px",
          }}>🧭</div>
          <div>
            <p style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-text-primary)", margin: "0 0 2px" }}>スケ</p>
            <p style={{ fontSize: "12px", color: accent, fontWeight: "600", margin: 0 }}>プロコーチ · Sukekaku</p>
          </div>
        </div>

        {/* 実績 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "1.75rem" }}>
          {[
            { n: "9", u: "年", d: "コーチング経験" },
            { n: "0", u: "円", d: "体験セッション" },
            { n: "4", u: "名", d: "毎月限定の枠" },
          ].map(s => (
            <div key={s.d} style={{ textAlign: "center", padding: "1rem 0.5rem", background: "var(--color-background-secondary)", borderRadius: "8px", border: "1px solid var(--color-border-tertiary)" }}>
              <p style={{ fontSize: "30px", fontWeight: "900", color: accent, lineHeight: 1, margin: "0 0 2px" }}>
                {s.n}<span style={{ fontSize: "16px" }}>{s.u}</span>
              </p>
              <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>

        {/* タイムライン */}
        <div style={{ position: "relative", paddingLeft: "2rem" }}>
          <div style={{ position: "absolute", left: "7px", top: "10px", bottom: "10px", width: "2px", background: "var(--color-border-secondary)", borderRadius: "2px" }} />
          {[
            { label: "過去", color: "#dc3545", text: "慢性的な思考優位。不安・ストレスで眠れず、「今が楽しくない」日々が続く。" },
            { label: "転機", color: "#fd7e14", text: "カナダのメンター・日本のコーチと出会い、9年間の対話を重ねる。" },
            { label: "現在", color: green,    text: "仕事をしながら家族と日本一周。心と身体の声に従って生きている。" },
          ].map((item, i) => (
            <div key={i} style={{ position: "relative", marginBottom: i < 2 ? "1.5rem" : 0 }}>
              <div style={{ position: "absolute", left: "-2rem", top: "3px", width: "16px", height: "16px", borderRadius: "50%", background: item.color, border: "3px solid var(--color-background-primary)", boxShadow: "0 0 0 1px var(--color-border-secondary)" }} />
              <p style={{ fontSize: "11px", fontWeight: "700", color: item.color, margin: "0 0 3px", letterSpacing: "0.06em" }}>{item.label}</p>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.75", margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── オファー ── */}
      <div style={{
        borderRadius: "12px", overflow: "hidden",
        border: `1px solid ${accent}33`,
        boxShadow: "0 4px 24px rgba(127,119,221,0.12)",
      }}>
        <div style={{ background: accent, padding: "2rem", textAlign: "center" }}>
          <span style={{
            display: "inline-block", padding: "4px 14px", marginBottom: "1rem",
            background: "rgba(255,255,255,0.2)", borderRadius: "100px",
            fontSize: "11px", color: "#fff", fontWeight: "700", letterSpacing: "0.12em",
          }}>毎月4名様限定</span>
          <h3 style={{ fontSize: "28px", fontWeight: "900", color: "#fff", margin: "0 0 0.4rem", lineHeight: "1.25" }}>
            体験セッション<br />完全無料
          </h3>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
            60分 · オンライン · 無理な勧誘なし
          </p>
        </div>
        <div style={{ padding: "1.75rem 2rem", background: "var(--color-background-primary)" }}>
          <p style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-text-tertiary)", letterSpacing: "0.1em", margin: "0 0 1rem" }}>セッションで得られること</p>
          <CheckItem>「現実」と「理想」のギャップを整理・言語化する</CheckItem>
          <CheckItem>心と身体が求める本当の答えに気づく</CheckItem>
          <CheckItem>言語・非言語の両方から的確なフィードバック</CheckItem>
          <CheckItem>無理な勧誘・押しつけは一切なし</CheckItem>
          <div style={{ marginTop: "1.75rem" }}>
            <LineBtn />
            <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", textAlign: "center", margin: "10px 0 0" }}>
              残枠わずか · 先着順 · LINEで30秒申し込み
            </p>
          </div>
        </div>
      </div>

      {/* ── フィナーレ ── */}
      <div style={{ padding: "3.5rem 0 1rem", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)", margin: "0 0 1rem" }}>最後に、一つだけ聞かせてください。</p>
        <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--color-text-primary)", lineHeight: "1.65", margin: "0 0 2rem" }}>
          今の苦しさが、一年後も続いていたら——<br />
          <span style={{ color: "var(--color-text-tertiary)", fontWeight: "400" }}>あなたはどう感じますか？</span>
        </h3>
        <LineBtn>今すぐ体験セッションを申し込む</LineBtn>
        <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", margin: "1.5rem 0 0", letterSpacing: "0.06em" }}>
          Sukekaku — ユング心理学に基づくコーチング
        </p>
      </div>

    </div>
  );
}

function ChartGuide({ hasMbti }) {
  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
      <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", fontWeight: "500", margin: "0 0 10px", letterSpacing: "0.04em" }}>チャートの読み方</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#7F77DD", display: "inline-block", flexShrink: 0, marginTop: "3px" }} />
          <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.6" }}>
            <strong style={{ color: "var(--color-text-primary)" }}>現在（紫）</strong>：今のあなたが実際に使っている機能のバランス
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#1D9E75", display: "inline-block", flexShrink: 0, marginTop: "3px" }} />
          <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.6" }}>
            <strong style={{ color: "var(--color-text-primary)" }}>理想（緑）</strong>：あなたが意識的になりたいと思っている自分
          </p>
        </div>
        {hasMbti && (
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#EF9F27", display: "inline-block", flexShrink: 0, marginTop: "3px" }} />
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.6" }}>
              <strong style={{ color: "var(--color-text-primary)" }}>混在（金）</strong>：MBTIに滲み出た「無意識が求めている自己像」。16Personalitiesの回答には、今の自分だけでなく「こうありたい」という無意識の願望も混ざっています。だからこそ、あなたが気づいていない深層の欲求が見えてきます。
            </p>
          </div>
        )}
      </div>
      <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
        <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", fontWeight: "500", margin: "0 0 6px" }}>3つの関係性で読む</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.6" }}>・<strong style={{ color: "var(--color-text-primary)" }}>現在 vs 理想のギャップ</strong>：意識的に変えたいと思っている方向</p>
          {hasMbti && <>
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.6" }}>・<strong style={{ color: "var(--color-text-primary)" }}>現在 vs 混在のギャップ</strong>：無意識が求めているが、まだ気づいていない欲求</p>
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.6" }}>・<strong style={{ color: "var(--color-text-primary)" }}>理想 vs 混在の一致度</strong>：意識と無意識が同じ方向を向いているかどうか</p>
          </>}
        </div>
      </div>
    </div>
  );
}

function InferiorFunctionNote({ scores }) {
  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const inferior = INFERIOR_MAP[dominant];
  return (
    <div style={{ background: "rgba(127,119,221,0.07)", border: "0.5px solid rgba(127,119,221,0.3)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginTop: "1.5rem" }}>
      <p style={{ fontSize: "12px", color: "#7F77DD", fontWeight: "500", margin: "0 0 8px", letterSpacing: "0.04em" }}>劣等機能について</p>
      <p style={{ fontSize: "13px", lineHeight: "1.8", color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
        今の診断では<strong style={{ color: "var(--color-text-primary)" }}>「{FUNC_LABELS[dominant]}」</strong>があなたの優位機能（最も強く使っている機能）です。
      </p>
      <p style={{ fontSize: "13px", lineHeight: "1.8", color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
        ユングの理論では、優位機能が強いほど、その正反対にある<strong style={{ color: "var(--color-text-primary)" }}>「{FUNC_LABELS[inferior]}」</strong>が無意識の深部に押しやられます——これを<strong style={{ color: "#7F77DD" }}>劣等機能</strong>と呼びます。
      </p>
      <p style={{ fontSize: "13px", lineHeight: "1.8", color: "var(--color-text-secondary)", margin: 0 }}>
        劣等機能は普段は眠っていますが、疲労やストレス時に突然・未熟な形で顔を出します。「なんか違う」という感覚の正体は、多くの場合このサインです。
      </p>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("welcome");
  const [answersA, setAnswersA] = useState({});
  const [answersB, setAnswersB] = useState({});
  const [mbtiInput, setMbtiInput] = useState("");
  const [mbtiError, setMbtiError] = useState("");
  const [mbtiScores, setMbtiScores] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiComment, setAiComment] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [lineRegistered, setLineRegistered] = useState(false);
  const topRef = useRef(null);
  const resultRef = useRef(null);

  const scoresA = calcScoresA(answersA);
  const scoresB = calcScoresB(answersB);
  const allAAnswered = QUESTIONS_A.every(q => answersA[q.id] !== undefined);
  const allBAnswered = QUESTIONS_B.every(q => answersB[q.id] !== undefined);
  const dominantA = Object.entries(scoresA).sort((a, b) => b[1] - a[1])[0]?.[0];

  // localStorageのフラグを起動時に確認
  useEffect(() => {
    try {
      const flag = localStorage.getItem("line_registered");
      if (flag === "true") setLineRegistered(true);
    } catch (e) {}
  }, []);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [phase]);

  async function fetchAiComment(sA, sB, sC) {
    setAiLoading(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sA, sB, sC }),
      });
      const data = await res.json();
      const text = data.text || "";
      setAiComment(text);
    } catch (e) {
      setAiComment("コメントの取得に失敗しました。");
    }
    setAiLoading(false);
  }

  function handleMbtiSubmit() {
    const val = mbtiInput.trim().toUpperCase();
    if (!MBTI_STACKS[val]) { setMbtiError("有効なMBTIタイプを入力してください（例：INTJ）"); return; }
    const sc = calcMbtiScores(val);
    setMbtiScores(sc);
    setMbtiError("");
    setPhase("result");
    fetchAiComment(scoresA, scoresB, sc);
  }

  function handleSkipMbti() {
    setMbtiScores(null);
    setPhase("result");
    fetchAiComment(scoresA, scoresB, null);
  }

  // LINE登録ボタン押下
  function handleLineClick() {
    try {
      localStorage.setItem("line_registered", "true");
    } catch (e) {}
    // LINEを別タブ/アプリで開く
    window.open("https://line.me/R/ti/p/@034rnllo", "_blank");
    // 現在のページは即座にブラー解除して結果を表示
    setLineRegistered(true);
  }

  async function handleDownloadPdf() {
    setPdfLoading(true);
    try {
      const dominant = dominantA || "T";
      const inferior = INFERIOR_MAP[dominant];
      const keys = ["T", "F", "S", "N"];
      const scoreRows = keys.map(k => {
        const a = scoresA[k]?.toFixed(1) || "0.0";
        const b = scoresB[k]?.toFixed(1) || "0.0";
        const c = mbtiScores ? mbtiScores[k]?.toFixed(1) : null;
        return `<tr>
          <td style="padding:6px 10px;font-weight:500;border-bottom:1px solid #eee;">${FUNC_LABELS[k]}</td>
          <td style="padding:6px 10px;text-align:center;color:#7F77DD;border-bottom:1px solid #eee;">${a}</td>
          <td style="padding:6px 10px;text-align:center;color:#1D9E75;border-bottom:1px solid #eee;">${b}</td>
          ${c !== null ? `<td style="padding:6px 10px;text-align:center;color:#EF9F27;border-bottom:1px solid #eee;">${c}</td>` : ""}
        </tr>`;
      }).join("");
      const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{font-family:"Hiragino Sans","Yu Gothic",sans-serif;color:#1a1a1a;padding:32px;max-width:600px;margin:0 auto;}
h1{font-size:20px;font-weight:500;border-bottom:1px solid #e5e5e5;padding-bottom:12px;margin-bottom:8px;}
.sub{font-size:11px;color:#7F77DD;letter-spacing:0.08em;margin-bottom:24px;}
h2{font-size:14px;font-weight:500;color:#555;margin:24px 0 8px;}
table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;}
th{padding:6px 10px;text-align:left;background:#f7f7f7;font-size:11px;font-weight:500;}
.note{background:#f3f2fc;border-left:3px solid #7F77DD;padding:12px 14px;border-radius:4px;font-size:13px;line-height:1.8;color:#333;margin-bottom:16px;}
.ai-box{border:1px solid #e5e5e5;border-radius:6px;padding:14px;font-size:13px;line-height:1.8;color:#333;}
.ai-label{font-size:11px;color:#7F77DD;font-weight:500;margin-bottom:6px;}
</style></head><body>
<div class="sub">Sukekaku — 心理的機能診断</div>
<h1>あなたの心理的機能マップ</h1>
<h2>スコア一覧</h2>
<table><thead><tr>
  <th>機能</th><th style="text-align:center;color:#7F77DD;">現在</th>
  <th style="text-align:center;color:#1D9E75;">理想</th>
  ${mbtiScores ? `<th style="text-align:center;color:#EF9F27;">混在</th>` : ""}
</tr></thead><tbody>${scoreRows}</tbody></table>
<h2>劣等機能について</h2>
<div class="note">
  今の診断では<strong>「${FUNC_LABELS[dominant]}」</strong>があなたの優位機能です。<br>
  その正反対にある<strong>「${FUNC_LABELS[inferior]}」</strong>が劣等機能——普段は眠っていますが、疲労・ストレス時に未熟な形で現れます。「なんか違う」の正体は多くの場合このサインです。
</div>
<h2>カクさん（AIコーチ）からのメッセージ</h2>
<div class="ai-box"><div class="ai-label">カクさん（AIコーチ）からのメッセージ</div>${aiComment || "（メッセージを取得中）"}</div>
<p style="font-size:10px;color:#aaa;margin-top:32px;">この診断はユングの心理的タイプ論に基づく自己探求ツールです。臨床的な診断や科学的確定を目的とするものではありません。— スケカク</p>
</body></html>`;
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "sukekaku_shinri_kinou_shindan.html"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
    setPdfLoading(false);
  }

  const legendItems = [
    { color: "#7F77DD", label: "現在" },
    { color: "#1D9E75", label: "理想" },
    ...(mbtiScores ? [{ color: "#EF9F27", label: "混在" }] : []),
  ];
  const btnBase = { width: "100%", padding: "14px", border: "none", borderRadius: "var(--border-radius-lg)", fontSize: "15px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s" };

  return (
    <div ref={topRef} style={{ maxWidth: "640px", margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
      <div style={{ marginBottom: "2rem", borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "1.5rem" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.12em", color: "#7F77DD", fontWeight: "500", margin: "0 0 6px", textTransform: "uppercase" }}>Sukekaku — 心理的機能診断</p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: "500", color: "var(--color-text-primary)", margin: "0 0 8px", lineHeight: "1.4" }}>あなたの内側にある4つの機能</h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.6" }}>ユング心理学に基づく自己探求ツール。臨床診断ではありません。</p>
      </div>

      {/* WELCOME */}
      {phase === "welcome" && (
        <div>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "15px", lineHeight: "1.8", color: "var(--color-text-primary)", margin: "0 0 1rem" }}>
              「なんか違う」という感覚が消えないのは、心のどこかで<strong>使えていない機能</strong>が静かにサインを送っているからかもしれません。
            </p>
            <p style={{ fontSize: "14px", lineHeight: "1.7", color: "var(--color-text-secondary)", margin: 0 }}>
              ユングが提唱した4つの心理的機能——思考・感情・感覚・直観——のバランスを、3つの視点から可視化します。所要時間は約5分です。
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.5rem" }}>
            {Object.entries(FUNC_LABELS).map(([k, label]) => (
              <div key={k} style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px" }}>
                <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--color-text-primary)", margin: "0 0 4px" }}>{label}（{k}）</p>
                <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.5" }}>{FUNC_DESC[k].slice(0, 36)}…</p>
              </div>
            ))}
          </div>
          <button onClick={() => setPhase("phaseA")} style={{ ...btnBase, background: "#7F77DD", color: "#fff" }}>診断を始める</button>
        </div>
      )}

      {/* PHASE A */}
      {phase === "phaseA" && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "12px", color: "#7F77DD", fontWeight: "500", margin: "0 0 4px", letterSpacing: "0.05em" }}>STEP 1 / 3</p>
            <h2 style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 6px", color: "var(--color-text-primary)" }}>現在の機能バランス</h2>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>今の自分に近いものを選んでください</p>
          </div>
          {QUESTIONS_A.map((q, i) => (
            <QuestionCardA key={q.id} question={q} index={i} total={QUESTIONS_A.length}
              answer={answersA[q.id]} onAnswer={v => setAnswersA(prev => ({ ...prev, [q.id]: v }))} />
          ))}
          <button onClick={() => setPhase("phaseB")} disabled={!allAAnswered}
            style={{ ...btnBase, background: allAAnswered ? "#7F77DD" : "var(--color-background-secondary)", color: allAAnswered ? "#fff" : "var(--color-text-tertiary)", cursor: allAAnswered ? "pointer" : "not-allowed" }}>
            次へ：理想の機能を診断する
          </button>
        </div>
      )}

      {/* PHASE B */}
      {phase === "phaseB" && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "12px", color: "#1D9E75", fontWeight: "500", margin: "0 0 4px", letterSpacing: "0.05em" }}>STEP 2 / 3</p>
            <h2 style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 6px", color: "var(--color-text-primary)" }}>理想の機能バランス</h2>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>どちらの自分に近づきたいか、直感で選んでください</p>
          </div>
          {QUESTIONS_B.map((q, i) => (
            <QuestionCardB key={q.id} question={q} index={i} total={QUESTIONS_B.length}
              answer={answersB[q.id]} onAnswer={v => setAnswersB(prev => ({ ...prev, [q.id]: v }))} />
          ))}
          <button onClick={() => setPhase("phaseC")} disabled={!allBAnswered}
            style={{ ...btnBase, background: allBAnswered ? "#1D9E75" : "var(--color-background-secondary)", color: allBAnswered ? "#fff" : "var(--color-text-tertiary)", cursor: allBAnswered ? "pointer" : "not-allowed" }}>
            次へ：MBTIを入力する
          </button>
        </div>
      )}

      {/* PHASE C */}
      {phase === "phaseC" && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "12px", color: "#EF9F27", fontWeight: "500", margin: "0 0 4px", letterSpacing: "0.05em" }}>STEP 3 / 3</p>
            <h2 style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 6px", color: "var(--color-text-primary)" }}>MBTIタイプを入力</h2>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "0 0 12px", lineHeight: "1.6" }}>
              16Personalitiesなど過去に診断したMBTIの結果を入力してください。無意識の自己像として分析します。
            </p>
          </div>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 14px", marginBottom: "12px", fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
            16Personalitiesの回答には、今の自分だけでなく「こうありたい」という無意識の願望も混ざっています。この診断ではその混在を「無意識の自己像」として読み解きます。
          </div>
          <div style={{ marginBottom: "16px", padding: "10px 14px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", fontSize: "12px", lineHeight: "1.6", color: "var(--color-text-secondary)" }}>
            MBTIをまだ診断していない方は
            <a href="https://www.16personalities.com/ja" target="_blank" rel="noopener noreferrer" style={{ color: "#7F77DD", marginLeft: "4px", textDecoration: "underline" }}>
              16Personalities（無料）
            </a>
            で診断してから戻ってきてください。
          </div>
          <input type="text" value={mbtiInput}
            onChange={e => { setMbtiInput(e.target.value); setMbtiError(""); }}
            placeholder="例：INTJ / ENFP" maxLength={4}
            style={{ width: "100%", padding: "12px 14px", fontSize: "18px", letterSpacing: "0.15em", textTransform: "uppercase", borderRadius: "var(--border-radius-md)", border: mbtiError ? "1.5px solid #E24B4A" : "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box", marginBottom: "8px", fontWeight: "500" }}
          />
          {mbtiError && <p style={{ fontSize: "12px", color: "#E24B4A", margin: "0 0 12px" }}>{mbtiError}</p>}
          <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
            <button onClick={handleSkipMbti} style={{ flex: 1, padding: "12px", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)", fontSize: "14px", color: "var(--color-text-secondary)", cursor: "pointer" }}>
              スキップして結果を見る
            </button>
            <button onClick={handleMbtiSubmit} style={{ flex: 2, padding: "12px", background: "#EF9F27", color: "#fff", border: "none", borderRadius: "var(--border-radius-lg)", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>
              入力して結果を見る
            </button>
          </div>
        </div>
      )}

      {/* RESULT */}
      {phase === "result" && (
        <div ref={resultRef}>
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "12px", color: "#7F77DD", fontWeight: "500", margin: "0 0 4px", letterSpacing: "0.05em" }}>診断結果</p>
            <h2 style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 6px", color: "var(--color-text-primary)" }}>あなたの心理的機能マップ</h2>
          </div>

          {/* レーダーチャート（ブラーなし） */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
            <RadarChart datasets={[scoresA, scoresB, mbtiScores]} size={280} />
            <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--color-text-secondary)" }}>
              {legendItems.map(l => (
                <span key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: l.color, display: "inline-block" }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* ブラー対象エリア（チャート以外） */}
          <div style={{ position: "relative" }}>
            <div style={{
              filter: lineRegistered ? "none" : "blur(6px)",
              userSelect: lineRegistered ? "auto" : "none",
              pointerEvents: lineRegistered ? "auto" : "none",
              transition: "filter 0.4s ease",
            }}>
              <ChartGuide hasMbti={!!mbtiScores} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "1.5rem" }}>
                {["T","F","S","N"].map(k => (
                  <div key={k} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px" }}>
                    <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", margin: "0 0 4px", fontWeight: "500" }}>{FUNC_LABELS[k]}</p>
                    <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
                      <span style={{ fontSize: "20px", fontWeight: "500", color: "#7F77DD" }}>{scoresA[k].toFixed(1)}</span>
                      <span style={{ fontSize: "12px", color: "#1D9E75" }}>→{scoresB[k].toFixed(1)}</span>
                      {mbtiScores && <span style={{ fontSize: "12px", color: "#EF9F27" }}>/{mbtiScores[k].toFixed(1)}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <GapAnalysis scoreA={scoresA} scoreB={scoresB} scoreC={mbtiScores} />
              {dominantA && <InferiorFunctionNote scores={scoresA} />}

              {/* カクさんのメッセージ */}
              <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem", marginTop: "1.5rem", background: "var(--color-background-primary)" }}>
                <p style={{ fontSize: "12px", color: "#7F77DD", fontWeight: "500", margin: "0 0 8px", letterSpacing: "0.04em" }}>カクさん（AIコーチ）からのメッセージ</p>
                {aiLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-tertiary)", fontSize: "13px" }}>
                    <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #7F77DD", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    カクさんが分析中…
                  </div>
                ) : (
                  <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-text-primary)", margin: 0 }}>{aiComment}</p>
                )}
              </div>

              {/* 登録済みCTA */}
              <div style={{ marginTop: "2rem", border: "0.5px solid rgba(127,119,221,0.35)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem", background: "rgba(127,119,221,0.04)" }}>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "0 0 16px", lineHeight: "1.6" }}>
                  劣等機能が「なんか違う」の正体である理由と、それをコーチングでどう扱うかをスケに直接話してみませんか。
                </p>
                <a href="https://line.me/R/ti/p/@034rnllo" target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", padding: "14px", background: "#06C755", color: "#fff", borderRadius: "var(--border-radius-lg)", fontSize: "15px", fontWeight: "500", textDecoration: "none" }}>
                  体験セッションを申し込む
                </a>
              </div>
            </div>

            {/* 未登録時オーバーレイ */}
            {!lineRegistered && (
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "calc(100% - 2rem)",
                background: "var(--color-background-primary)",
                border: "0.5px solid rgba(127,119,221,0.4)",
                borderRadius: "var(--border-radius-lg)",
                padding: "1.75rem 1.5rem",
                textAlign: "center",
                boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                zIndex: 10,
              }}>
                <p style={{ fontSize: "16px", fontWeight: "500", color: "var(--color-text-primary)", margin: "0 0 8px", lineHeight: "1.5" }}>
                  診断結果の詳細を<br />LINEで受け取る
                </p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "0 0 20px", lineHeight: "1.6" }}>
                  スコアの読み方・劣等機能の解説・カクさんからのメッセージをお届けします
                </p>
                <button onClick={handleLineClick}
                  style={{ width: "100%", padding: "14px", background: "#06C755", color: "#fff", border: "none", borderRadius: "var(--border-radius-lg)", fontSize: "15px", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  LINEで結果を受け取る
                </button>
                <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", margin: "12px 0 0", lineHeight: "1.5" }}>
                  友だち追加後、このページに戻ると結果が表示されます
                </p>
              </div>
            )}
          </div>

          {/* ダウンロード・やり直し（ブラー外） */}
          {lineRegistered && (
            <>
              <button onClick={handleDownloadPdf} disabled={pdfLoading || aiLoading}
                style={{ marginTop: "12px", width: "100%", padding: "12px", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)", fontSize: "14px", color: "var(--color-text-secondary)", cursor: pdfLoading || aiLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {pdfLoading
                  ? <><span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid #7F77DD", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />準備中…</>
                  : "この結果をダウンロード"
                }
              </button>
            </>
          )}

          <button onClick={() => { setPhase("welcome"); setAnswersA({}); setAnswersB({}); setMbtiInput(""); setMbtiScores(null); setAiComment(""); }}
            style={{ marginTop: "10px", width: "100%", padding: "10px", background: "transparent", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", fontSize: "13px", color: "var(--color-text-secondary)", cursor: "pointer" }}>
            もう一度診断する
          </button>

          <SalesLP dominantFunc={dominantA || "T"} />
        </div>
      )}

      <style>{`
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
`}</style>
    </div>
  );
}
