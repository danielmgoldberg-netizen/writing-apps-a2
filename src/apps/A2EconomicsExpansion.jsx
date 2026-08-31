import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// LOGGING CONFIG
// Submissions are sent to the Vercel proxy which writes to Airtable.
// This app uses its own logging endpoint (a2-economics has a wider schema).
// ─────────────────────────────────────────────────────────────────────────────
const LOGGER_URL = "https://writing-app-logger.vercel.app/api/log-a2";

function logToAirtable({ firstName, surname, teacher, scenarioTitle, attemptNumber, submission, totalScore }) {
  setTimeout(() => {
    try {
      fetch(LOGGER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "Student Name": String(`${firstName} ${surname}`.trim()),
          "Teacher":      String(teacher       || ""),
          "Timestamp":    new Date().toISOString(),
          "App":          "a2-economics",
          "Text Title":   String(scenarioTitle || ""),
          "Attempts":     Number(attemptNumber || 1),
          "Submission":   String(submission    || "").slice(0, 2000),
          "Score":        Number(totalScore    || 0),
          "Max Score":    100
        })
      }).catch(() => {});
    } catch (e) { /* never surface */ }
  }, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIOS
// Each scenario is a self-contained brief: one Israeli company plus two
// candidate countries. The student picks ONE scenario and only ever sees that
// scenario's source documents.
// ─────────────────────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    id: "supercom",
    title: "SuperCom — India vs Cyprus",
    company: {
      name: "SuperCom (NASDAQ: SPCB)",
      description:
        "Founded in 1988, SuperCom is a global provider of digital identity solutions, e-government platforms, cybersecurity, tracking, RFID and mobile technology.",
      products:
        "e-Government platforms; the PureRF wireless hybrid suite; RFID and mobile technology for healthcare, law enforcement and electronic monitoring.",
      leadership:
        "Ordan Trabelsi — President & CEO (Columbia MBA; Technion BSc Computer Engineering). Barak Trabelsi — COO (Tel Aviv University MBA & BSc Computer Science). Gil Alfi — VP Sales, Safend (Bar-Ilan BSc & MSc Computer Science).",
      stock:
        "NASDAQ: SPCB. Share-price data from CNN Markets, https://edition.cnn.com/markets/stocks/SPCB (retrieved 02/06/26).",
      sources: [
        "SuperCom. (n.d.). Our company. https://www.supercom.com/our-company",
        "CNN Markets. (2026). SuperCom Ltd (SPCB). https://edition.cnn.com/markets/stocks/SPCB"
      ]
    },
    countries: [
      {
        id: "india",
        name: "India",
        facts: [
          ["Head of Government", "Prime Minister Narendra Modi"],
          ["Head of State", "President Droupadi Murmu"],
          ["Capital", "New Delhi"],
          ["Population (2026 est.)", "1,425,900,000"],
          ["Government", "multiparty federal republic with two legislative houses"],
          ["Area", "3,287,469 km²"],
          ["Currency", "Indian rupee ₨"],
          ["Urban / Rural", "Urban 34%, Rural 66% (2018)"],
          ["Life expectancy", "Male 69.4, Female 72.7 (2021–2025)"]
        ],
        factsSource: "Britannica. (2026). India. https://www.britannica.com/facts/India",
        news: [
          {
            headline: "RBI proposes new cybersecurity norms for payment operators",
            outlet: "The Times of India",
            date: "June 2, 2023",
            summary:
              "The Reserve Bank of India proposed robust governance mechanisms for non-bank payment system operators to address cybersecurity risks. Draft guidelines cover governance, network security, application security and vendor risk management, and require a Cyber Crisis Management Plan (CCMP).",
            source:
              "https://timesofindia.indiatimes.com/gadgets-news/rbi-proposes-new-norms-on-digital-payment-security-controls/articleshow/100709080.cms",
            citation: "(TIMESOFINDIA.COM, 2023)"
          },
          {
            headline: "India fast emerging as a hub for cybersecurity innovations",
            outlet: "The Times of India",
            date: "June 21, 2023",
            summary:
              "Major cybersecurity firms see India as crucial for R&D. Trellix has 1,750 employees in India; CrowdStrike India leads malware research and IoT security; Palo Alto Networks has 800+ employees across three Indian R&D centres. A shortage of cybersecurity talent remains a challenge.",
            source:
              "https://timesofindia.indiatimes.com/business/india-business/india-is-fast-emerging-as-hub-for-cybersecurity-innovations/articleshow/101154484.cms",
            citation: "(TNN, 2023)"
          }
        ],
        incentive: {
          summary:
            "Multiple incentives: Export Promotion (100% profit deduction for 5 years for SEZ units); a 200% weighted tax deduction for R&D; the Startup India Scheme (3-year tax holiday, 80% rebate on patent costs); and International Financial Services Centre tax concessions.",
          source: "https://www.fdi.finance/guidelines/taxation",
          citation: "(FDI India, n.d.)"
        },
        worldBank: {
          indicators:
            "Corruption (bribery depth; informal payments for permits, licenses and government contracts) and Innovation & Technology (ICT use; internationally-recognised quality certifications; internet use in business).",
          source: "https://www.enterprisesurveys.org/en/data/exploreeconomies/2025/india"
        }
      },
      {
        id: "cyprus",
        name: "Cyprus",
        facts: [
          ["Head of State and Government", "President Nikos Christodoulides"],
          ["Capital", "Lefkosia (Nicosia)"],
          ["Population (2026 est.)", "1,546,000"],
          ["Government", "unitary multiparty republic with a unicameral legislature"],
          ["Area", "9,251 km²"],
          ["Currency", "euro (€)"],
          ["Life expectancy", "Male 80.1, Female 84.2 (2019)"]
        ],
        factsSource: "Britannica. (2026). Cyprus. https://www.britannica.com/facts/Cyprus",
        news: [
          {
            headline: "Red flags raised over state cyber security policy",
            outlet: "Cyprus Mail",
            date: "April 2, 2023",
            summary:
              "Three major hacks hit Cyprus in one month (the University of Cyprus, the land registry and the Open University). Lack of awareness, slow government procedures and inadequate security infrastructure were exposed. A Security Operation Centre procured in 2019 was still unused.",
            source: "https://cyprus-mail.com/2023/04/02/red-flags-raised-over-the-state-cyber-security-policy/",
            citation: "(Kades, 2023)"
          },
          {
            headline: "Government issues urgent cyber security to-do list",
            outlet: "Cyprus Mail",
            date: "April 13, 2022",
            summary:
              "CSIRT-CY warned that cyberattacks are becoming more common and advised backing up data, keeping devices updated and using strong, unique passwords.",
            source: "https://cyprus-mail.com/2022/04/13/government-issues-urgent-cyber-security-to-do-list/",
            citation: "(Christou, 2022)"
          }
        ],
        incentive: {
          summary:
            "Tax exemptions on profits from the sale of securities and on dividends, interest and forex gains. IP income is 80% exempt under the nexus approach. A Notional Interest Deduction applies to new equity. Shipping companies are fully exempt under the tonnage-tax regime.",
          source: "https://mof.gov.cy/en/taxation-investment-policy/1-tax-incentives/tax-incentives",
          citation: "(Ministry of Finance Cyprus, n.d.)"
        },
        worldBank: {
          indicators:
            "Corruption (bribery depth; informal payments for permits and licenses) and Innovation & Technology (ICT use; internationally-recognised quality certifications).",
          source: "https://www.enterprisesurveys.org/en/data/exploreeconomies/2024/cyprus"
        }
      }
    ]
  },
  {
    id: "caesarstone",
    title: "Caesarstone — Greece vs Romania",
    company: {
      name: "Caesarstone (NASDAQ: CSTE)",
      description:
        "Founded in 1987, Caesarstone is a pioneer in engineered quartz surfaces, producing kitchen countertops, vanity tops, wall panels, floor tiles and stairs for indoor and outdoor spaces.",
      products:
        "Engineered quartz slabs; a multi-material portfolio of 100+ colours; porcelain and natural stone; digital platforms and services. Sold in 50+ countries with 1,500+ employees worldwide.",
      financials:
        "Q1 2023: revenue $150.6M (Q1 2022: $170.4M); net loss $3.85M (Q1 2022: net income $6.6M).",
      leadership:
        "Yosef (Yos) Shiran — CEO (BSc Industrial Engineering, Ben-Gurion; MBA, Bar-Ilan). Nahum Trost — CFO (CPA; BA Economics & Accounting, Haifa; MSc Business Economics, Technion). Amir Reske — Managing Director EMEA (postgraduate diploma, Oxford; business law, Coventry). Idit Maayan-Zohar — Global CMO (BA Business Administration, College of Management; MBA, Bar-Ilan).",
      sources: [
        "Caesarstone. (n.d.). Executive management. https://ir.caesarstone.com/governance/executive-management/default.aspx",
        "Caesarstone. (2023). Caesarstone reports first quarter 2023 financial results. https://ir.caesarstone.com/news/news-details/2023/Caesarstone-Reports-First-Quarter-2023-Financial-Results/default.aspx"
      ]
    },
    countries: [
      {
        id: "greece",
        name: "Greece",
        facts: [
          ["Head of Government", "Prime Minister Kyriakos Mitsotakis"],
          ["Head of State", "President Katerina N. Sakellaropoulou"],
          ["Capital", "Athens"],
          ["Population (2025 est.)", "9,361,000"],
          ["Government", "unitary multiparty republic; the Hellenic Parliament has 300 seats"],
          ["Area", "132,049 km²"],
          ["Currency", "euro (€)"],
          ["Urban / Rural", "Urban 81%, Rural 19% (2025)"],
          ["Life expectancy", "Male 79, Female 84.2 (2023)"],
          ["Literacy", "Male 99%, Female 97% (2018)"]
        ],
        factsSource: "Britannica. (2025). Greece. https://www.britannica.com/facts/Greece",
        news: [
          {
            headline: "Greek construction companies fear staff shortages",
            outlet: "Kathimerini",
            date: "January 1, 2023",
            summary:
              "Major construction groups are concerned about a shortage of craftsmen, machine operators and engineers as several billion-euro projects begin at the same time (Elliniko, new highways, hotels and energy projects). No institutional initiative has been taken yet.",
            source: "https://www.ekathimerini.com",
            citation: "(Kathimerini, 2023)"
          },
          {
            headline: "Hardware & Home Improvement Stores in Greece",
            outlet: "IBISWorld",
            date: "2023",
            summary:
              "Market size €1.7bn, ranked 18th in the EU (of 27). The industry grew by an average of 6.6% per year from 2018 to 2023. Employment is 16,577 and the average business has 3.4 employees.",
            source: "https://www.ibisworld.com/greece/industry-statistics/hardware-home-improvement-stores/3022/",
            citation: "(IBISWorld, 2023)"
          }
        ],
        incentive: {
          summary:
            "A new Greek investment law offers tax exemptions, state funding, subsidies for personnel costs and corporate risk financing for projects in digitalisation, the green transition, research and innovation, tourism and agri-food. A separate regime gives a 50% income-tax deduction for 7 years to workers who relocate to Greece; 124 investors have transferred their tax residence with a €500,000 minimum investment and a €100,000 flat annual tax on foreign income.",
          source:
            "https://www.ecovis.com/global/investment-incentives-in-greece-benefits-for-many-industries/ ; https://www.ekathimerini.com/economy/1202793/tax-incentives-luring-greeks-from-abroad/",
          citation: "(Global4admin, 2022; Hatzinikolaou, 2023)"
        },
        worldBank: {
          indicators:
            "Infrastructure (electricity reliability; water-supply efficiency; delays in obtaining connections) and Corruption (bribery depth; informal payments for permits and government contracts).",
          source: "https://www.enterprisesurveys.org/en/data/exploreeconomies/2023/greece"
        }
      },
      {
        id: "romania",
        name: "Romania",
        facts: [
          ["Head of Government", "Prime Minister Marcel Ciolacu"],
          ["Head of State", "President Klaus Iohannis"],
          ["Capital", "Bucharest"],
          ["Population (2025 est.)", "19,079,000"],
          ["Government", "unitary republic with two legislative houses"],
          ["Area", "238,398 km²"],
          ["Currency", "Romanian leu (RON)"],
          ["Urban / Rural", "Urban 52.1%, Rural 47.9% (2023)"],
          ["Life expectancy", "Male 70.7, Female 78 (2022)"]
        ],
        factsSource: "Britannica. (2025). Romania. https://www.britannica.com/facts/Romania",
        news: [
          {
            headline: "Construction projects up 20% in 2022",
            outlet: "SeeNews",
            date: "February 8, 2023",
            summary:
              "29,719 projects in total, with all nine construction segments increasing. Infrastructure was the fastest growing at +63%. Private residential topped the list with 12,149 projects and the industrial segment was second with 5,960. Cluj, Timis, Bihor and Bucharest were the main investment destinations.",
            source: "https://seenews.com",
            citation: "(Todasca, 2023)"
          },
          {
            headline: "Hardware & Home Improvement Stores in Romania",
            outlet: "IBISWorld",
            date: "2023",
            summary:
              "Market size €4.8bn, ranked 10th in the EU (of 27). The industry grew by an average of 4.6% per year from 2018 to 2023. Employment is 35,170 (growth 5.9%) and the average business has 23.4 employees.",
            source: "https://www.ibisworld.com/romania/industry-statistics/hardware-home-improvement-stores/3022/",
            citation: "(IBISWorld, 2023)"
          }
        ],
        incentive: {
          summary:
            "0% profit tax on profits reinvested in new technology; 16% corporate tax and 5% dividend tax; 0% income tax for IT&C and R&D employees; 0% profit tax for R&D companies for their first 10 years; industrial-park exemptions on land, building and urban-planning tax; and employer subsidies for hiring graduates, disabled persons, NEETs and apprentices.",
          source: "https://investromania.gov.ro/web/doing-business/fiscal-incentives/",
          citation: "(InvestRomania, n.d.)"
        },
        worldBank: {
          indicators:
            "Infrastructure (electricity reliability; water supply; delays in obtaining connections) and Corruption (bribery depth; informal payments for permits and government contracts).",
          source: "https://www.enterprisesurveys.org/en/data/exploreeconomies/2023/romania"
        }
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// PARAGRAPH CONFIG
// The report is written in three separate text areas.
// ─────────────────────────────────────────────────────────────────────────────
const PARAGRAPHS = [
  {
    key: "p1",
    num: 1,
    title: "Introduction",
    targetLabel: "80–100 words",
    minWords: 80,
    checklist: [
      "Describe the company (what it does, its products / services)",
      "Say why the two countries are being examined",
      "State your recommendation (which country)",
      "Give a short roadmap of what the report will cover"
    ]
  },
  {
    key: "p2",
    num: 2,
    title: "Main body",
    targetLabel: "180–220 words",
    minWords: 180,
    checklist: [
      "Analyse the industry / news items for both countries",
      "Discuss TWO economic indicators (from the country facts)",
      "Discuss ONE investment incentive",
      "Discuss TWO World Bank Enterprise Survey indicators"
    ]
  },
  {
    key: "p3",
    num: 3,
    title: "Conclusion",
    targetLabel: "60–80 words",
    minWords: 60,
    checklist: [
      "Reiterate your recommendation",
      "Discuss the future of the business in the chosen country"
    ]
  }
];

const CONNECTOR_HINTS =
  "firstly, secondly, moreover, in addition, furthermore, however, on the other hand, therefore, as a result, for example, in conclusion, to sum up";

// ─────────────────────────────────────────────────────────────────────────────
// RUBRIC / SCORING
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_MAX = {
  introduction: 20,
  mainBody: 40,
  conclusion: 15,
  references: 6,
  presentation: 3,
  connectors: 6,
  language: 10
};

const CATEGORY_LABELS = {
  introduction: "P1 · Introduction",
  mainBody: "P2 · Main body",
  conclusion: "P3 · Conclusion",
  references: "References (APA)",
  presentation: "Presentation",
  connectors: "Connectors",
  language: "Language"
};

const CATEGORY_EMOJIS = {
  introduction: "📄",
  mainBody: "📊",
  conclusion: "🎯",
  references: "📚",
  presentation: "🧩",
  connectors: "🔗",
  language: "✏️"
};

const CATEGORY_DOTS = {
  introduction: "#B85C38",
  mainBody: "#2D5043",
  conclusion: "#5A4A8A",
  references: "#7A6B2A",
  presentation: "#8A6F30",
  connectors: "#2D6E7E",
  language: "#5A4A8A"
};

const SYSTEM_PROMPT = `You are a supportive university writing tutor for an Advanced 2 English course at Reichman University. Your students are Israeli undergraduates at the B1 to B2 level, writing a business assignment for an Economics module. Be warm, specific and encouraging.

THE ASSIGNMENT
The student plays the role of a consultant at an international consulting firm. An Israeli company wants to expand abroad. The student has read locked source documents about ONE company and TWO possible countries, and must write a THREE-PARAGRAPH business expansion report that recommends ONE of the two countries.

You will be given:
1. The scenario source documents (the ONLY sources the student had access to). Grade factual accuracy against these.
2. The student's three paragraphs, with a word count for each.
3. The attempt number.

WHAT EACH PARAGRAPH MUST DO
Paragraph 1 - Introduction (aim ~80-100 words): describe the company (what it does, products/services); state the reason the two countries are being examined / the purpose of the report; give the recommendation (which country); give a short roadmap of what the report will cover.
Paragraph 2 - Main body (aim ~180-220 words): analyse the industry / news items for the countries; discuss TWO economic indicators drawn from the country facts (e.g. population, area, currency, urban/rural split, life expectancy, literacy, government type); discuss ONE investment incentive; discuss TWO World Bank Enterprise Survey indicators from the list the source gives (e.g. Corruption, Innovation & Technology, Infrastructure).
Paragraph 3 - Conclusion (aim ~60-80 words): reiterate the recommendation; discuss the future of the business in the chosen country.

GRADING - 100 POINTS TOTAL
Score every category. Work out the sub-points, then sum them.

1. Introduction - 20 points
   - company description: 5
   - reason the two countries are examined: 5
   - recommendation stated: 5
   - roadmap of the report: 5

2. Main body - 40 points
   - industry / news analysis: 10
   - two economic indicators: 12 (6 each)
   - one investment incentive: 6
   - two World Bank Enterprise Survey indicators: 12 (6 each)

3. Conclusion - 15 points
   - reiterates the recommendation: 5
   - discusses the future of the business: 10

4. References / citations in APA format - 6 points
   - in-text citations for the facts used, and/or a short reference list. Accept the APA in-text citations shown in the source documents, e.g. "(IBISWorld, 2023)". Be reasonably generous: award partial credit for an honest attempt at APA.

5. General presentation - 3 points
   - the work is in three clear paragraphs (introduction / body / conclusion). Full marks if the 3-block format is followed.

6. Connectors - 6 points
   - at least TWO linking words or phrases per paragraph (firstly, moreover, in addition, however, therefore, for example, in conclusion, etc.). Award 2 points for each paragraph that has at least two.

7. Language - 10 points
   - grammar, vocabulary, punctuation, capitalization. Deduct gradually for repeated errors. Small slips are fine.

GRADING RULES
- BE GENEROUS AND ENCOURAGING. These are second-language undergraduates writing under exam-like conditions.
- Award full or near-full sub-points when an element is present and clear, even if it is simple or brief.
- Do NOT deduct content points for "could say more", "could go deeper", or brevity, as long as the required element is there and connects to the sources.
- The student may quote or borrow short phrases from the source documents. That is fine. Only raise a concern if an ENTIRE paragraph is copied verbatim with no analysis of its own.
- Reward the use of correct data from THIS scenario. If the student states facts that contradict the sources, note it as a content issue.
- Both country recommendations can be valid. NEVER grade based on which country you would choose. Grade whether the argument is supported by the sources.
- The word-count targets are guidance, not rules. Do not deduct points only for length. You MAY add a gentle nudge in the issues list if a paragraph is far below target AND is missing required content.

VOICE CHECK
Your students write at a B1-B2 level. If a passage is dramatically more advanced than the rest of the student's writing (near-native idiom, polished academic phrasing sitting next to basic errors), set "voiceConcern" to a WARM, NON-ACCUSATORY message asking the student to explain that part in their own words or rephrase it more simply, so you can give feedback on their own thinking. Example tone: "One part of paragraph 2 sounds much more advanced than the rest. Could you try writing that idea again in your own simpler words? I want to make sure my feedback is about your writing." Do NOT accuse the student of cheating and do NOT lower the score for this by itself. If nothing stands out, set voiceConcern to null.

FEEDBACK RULES (CRITICAL)
- For attempts 1, 2 and 3: NEVER write a full corrected essay. Set "sampleEssay" to null.
- For every lost point, add an issue that EXPLAINS what is missing or wrong in simple words and gives a HINT for how to fix it. NEVER write the corrected sentence or paragraph for them.
- Keep each issue short and use clear, simple language.
- Always include a genuine positive note in "encouragement".

ON ATTEMPT 4 OR LATER, if the total score is below 80:
- You MAY set "sampleEssay" to ONE model report of 300 to 350 words: three paragraphs separated by a blank line, using the correct data from this scenario. Otherwise set it to null.
- If the score is 80 or above at any attempt, "sampleEssay" is null.

EMOJI IN THE ENCOURAGEMENT (exactly one, at the very start):
- 90-100: use a celebration emoji such as 🎉, ⭐ or ✨.
- 70-89: use a warm encouraging emoji such as 🌟, 💪 or 👍.
- 50-69: use a kind, supportive emoji such as 🌱 or 💛.
- 0-49: use 🤗.
Use only ONE emoji, and only in the encouragement.

OUTPUT FORMAT
Respond with VALID JSON ONLY. No preamble, no markdown fences, no extra text.

PUNCTUATION RULE FOR YOUR OWN WRITING: every sentence you write in "encouragement", "voiceConcern", "what" and "hint" MUST end with ".", "!" or "?".

Use this exact schema:

{
  "scores": {
    "introduction": <0 to 20>,
    "mainBody": <0 to 40>,
    "conclusion": <0 to 15>,
    "references": <0 to 6>,
    "presentation": <0 to 3>,
    "connectors": <0 to 6>,
    "language": <0 to 10>
  },
  "totalScore": <sum of the seven scores, 0 to 100>,
  "encouragement": "<two or three short sentences, one emoji at the start, max 45 words>",
  "voiceConcern": <null or a short warm string>,
  "issues": [
    {
      "category": "<introduction | mainBody | conclusion | references | presentation | connectors | language>",
      "what": "<one or two short sentences on what is missing or wrong, max 35 words>",
      "hint": "<one short sentence on how to think about fixing it, no corrected text, max 35 words>"
    }
  ],
  "sampleEssay": <null or a 300-350 word string with three paragraphs separated by a blank line>
}

Only include issues for categories where points were lost. If a category is full marks, do not add an issue for it.`;

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function countWords(s) {
  const m = (s || "").trim().match(/\S+/g);
  return m ? m.length : 0;
}

function serializeCountry(c) {
  const facts = c.facts.map(([k, v]) => `  - ${k}: ${v}`).join("\n");
  const news = c.news
    .map(
      (n, i) =>
        `  ${i + 1}. "${n.headline}" - ${n.outlet}, ${n.date}\n     ${n.summary}\n     Source: ${n.source}\n     APA in-text citation to use: ${n.citation}`
    )
    .join("\n\n");
  return `### COUNTRY: ${c.name}
Country facts (source: ${c.factsSource}):
${facts}

Industry / news items:
${news}

Investment incentive:
  ${c.incentive.summary}
  Source: ${c.incentive.source}
  APA in-text citation to use: ${c.incentive.citation}

World Bank Enterprise Survey indicators available for ${c.name}:
  ${c.worldBank.indicators}
  Source: ${c.worldBank.source}`;
}

function serializeScenario(s) {
  const co = s.company;
  return `## COMPANY: ${co.name}
${co.description}
Products / services: ${co.products}
${co.financials ? `Recent financials: ${co.financials}\n` : ""}Leadership: ${co.leadership}
${co.stock ? `Stock: ${co.stock}\n` : ""}Company sources: ${co.sources.join(" | ")}

## THE TWO CANDIDATE COUNTRIES

${s.countries.map(serializeCountry).join("\n\n")}`;
}

function buildUserPrompt(scenario, p1, p2, p3, attemptNumber) {
  return `SCENARIO SOURCE DOCUMENTS (these are the ONLY sources the student was given - grade factual accuracy against them):
"""
${serializeScenario(scenario)}
"""

STUDENT'S THREE-PARAGRAPH REPORT (attempt #${attemptNumber}):

--- PARAGRAPH 1 - INTRODUCTION (${countWords(p1)} words) ---
"""
${p1}
"""

--- PARAGRAPH 2 - MAIN BODY (${countWords(p2)} words) ---
"""
${p2}
"""

--- PARAGRAPH 3 - CONCLUSION (${countWords(p3)} words) ---
"""
${p3}
"""

Grade this report with the rubric. Remember: hints only (never a corrected sentence); no sample essay before attempt 4; run the voice check. Respond with JSON only.`;
}

// Catches the most common "oops" submissions before they hit the API.
// Returns a friendly error string, or null if the submission looks ready to grade.
function validateSubmission(p1, p2, p3) {
  if (!p1.trim() || !p2.trim() || !p3.trim()) {
    return "⚠️ Please write all three paragraphs (introduction, main body, and conclusion) before getting feedback.";
  }
  if (countWords(p1) + countWords(p2) + countWords(p3) < 60) {
    return "⚠️ Your report looks very short. Try to develop each paragraph a little more before asking for feedback.";
  }
  return null;
}

// Ensure any text field ends with valid sentence-final punctuation.
// The model is instructed to punctuate but occasionally slips; this
// silently fixes it so students never see an unpunctuated hint.
function ensureEndPunct(text) {
  if (!text || typeof text !== "string") return text;
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const last = trimmed.slice(-1);
  if (last === "." || last === "!" || last === "?") return trimmed;
  return trimmed + ".";
}

// Defensive cleanup of AI feedback: clamp every score to its rubric maximum,
// recompute the total from the parts (so the ring and the parts always agree),
// and normalize punctuation on every AI-written text field.
function sanitizeFeedback(feedback) {
  if (!feedback || !feedback.scores) return feedback;

  const scores = {};
  for (const key of Object.keys(CATEGORY_MAX)) {
    const raw = Number(feedback.scores[key]);
    scores[key] = Number.isFinite(raw)
      ? Math.max(0, Math.min(CATEGORY_MAX[key], Math.round(raw)))
      : 0;
  }
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const issues = Array.isArray(feedback.issues)
    ? feedback.issues.map(issue => ({
        ...issue,
        what: ensureEndPunct(issue.what),
        hint: ensureEndPunct(issue.hint)
      }))
    : [];

  return {
    ...feedback,
    scores,
    totalScore,
    encouragement: ensureEndPunct(feedback.encouragement),
    voiceConcern: feedback.voiceConcern ? ensureEndPunct(feedback.voiceConcern) : null,
    issues,
    sampleEssay: feedback.sampleEssay || null
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UI PIECES
// ─────────────────────────────────────────────────────────────────────────────
function ScoreRing({ score, max = 100 }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, score / max));
  const offset = circumference * (1 - progress);
  const color = score === max ? "#2D5043" : score >= max * 0.7 ? "#7A6B2A" : "#B85C38";
  return (
    <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#E8E0D0" strokeWidth="6" />
        <circle
          cx="48" cy="48" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center", flexDirection: "column",
        fontFamily: "'Fraunces', serif"
      }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: "#1F1B16", lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 11, color: "#6B5D54", marginTop: 2, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.05em" }}>OF {max}</div>
      </div>
    </div>
  );
}

function CategoryBar({ label, score, max }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const earned = score === max;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#1F1B16", fontWeight: 500 }}>{label}</span>
        <span style={{
          fontSize: 12, color: earned ? "#2D5043" : "#8A6F30",
          fontVariantNumeric: "tabular-nums", fontWeight: 500
        }}>
          {score} / {max}
        </span>
      </div>
      <div style={{ height: 6, background: "#EFE7D6", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: earned ? "#2D5043" : "#C99452",
          transition: "width 0.5s ease"
        }} />
      </div>
    </div>
  );
}

function SourceLinks({ value }) {
  // A source string may hold one or more URLs separated by " ; ".
  const parts = String(value).split(" ; ");
  return (
    <>
      {parts.map((p, i) => {
        const url = (p.match(/https?:\/\/\S+/) || [])[0];
        return (
          <div key={i} style={{ fontSize: 12, color: "#5A4D43", lineHeight: 1.5, wordBreak: "break-word" }}>
            {url
              ? <a href={url} target="_blank" rel="noreferrer" className="a2-link">{p}</a>
              : p}
          </div>
        );
      })}
    </>
  );
}

function CountryDocs({ country }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 19,
        fontWeight: 500,
        color: "#1F1B16",
        marginBottom: 10,
        paddingBottom: 6,
        borderBottom: "2px solid #E8E0D0"
      }}>
        {country.name}
      </div>

      <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "#6B5D54", fontWeight: 700, margin: "12px 0 6px" }}>
        Key facts &amp; economic indicators
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 4 }}>
        {country.facts.map(([k, v], i) => (
          <div key={i} style={{ fontSize: 13.5, color: "#2A2520", lineHeight: 1.5 }}>
            <strong style={{ color: "#1F1B16" }}>{k}:</strong> {v}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6 }}>
        <SourceLinks value={country.factsSource} />
      </div>

      <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "#6B5D54", fontWeight: 700, margin: "16px 0 6px" }}>
        Industry &amp; news
      </div>
      {country.news.map((n, i) => (
        <div key={i} style={{
          padding: "10px 12px",
          background: "#FFFFFF",
          border: "1px solid #EDE3CE",
          borderRadius: 8,
          marginBottom: 8
        }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1F1B16", lineHeight: 1.4 }}>{n.headline}</div>
          <div style={{ fontSize: 12, color: "#6B5D54", margin: "2px 0 6px" }}>{n.outlet}, {n.date}</div>
          <div style={{ fontSize: 13.5, color: "#2A2520", lineHeight: 1.55, marginBottom: 6 }}>{n.summary}</div>
          <div style={{ fontSize: 12, color: "#2D5043", fontWeight: 600 }}>Cite as: {n.citation}</div>
          <SourceLinks value={n.source} />
        </div>
      ))}

      <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "#6B5D54", fontWeight: 700, margin: "16px 0 6px" }}>
        Investment incentive
      </div>
      <div style={{ fontSize: 13.5, color: "#2A2520", lineHeight: 1.55, marginBottom: 6 }}>{country.incentive.summary}</div>
      <div style={{ fontSize: 12, color: "#2D5043", fontWeight: 600 }}>Cite as: {country.incentive.citation}</div>
      <SourceLinks value={country.incentive.source} />

      <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "#6B5D54", fontWeight: 700, margin: "16px 0 6px" }}>
        World Bank Enterprise Survey indicators
      </div>
      <div style={{ fontSize: 13.5, color: "#2A2520", lineHeight: 1.55, marginBottom: 6 }}>{country.worldBank.indicators}</div>
      <SourceLinks value={country.worldBank.source} />
    </div>
  );
}

function SourceDocs({ scenario }) {
  const co = scenario.company;
  const allSources = [
    ...co.sources,
    ...scenario.countries.flatMap(c => [
      c.factsSource,
      ...c.news.map(n => n.source),
      c.incentive.source,
      c.worldBank.source
    ])
  ];
  return (
    <div>
      <div style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 19,
        fontWeight: 500,
        color: "#1F1B16",
        marginBottom: 10,
        paddingBottom: 6,
        borderBottom: "2px solid #E8E0D0"
      }}>
        The company: {co.name}
      </div>
      <div style={{ fontSize: 13.5, color: "#2A2520", lineHeight: 1.6, marginBottom: 6 }}>{co.description}</div>
      <div style={{ fontSize: 13.5, color: "#2A2520", lineHeight: 1.6, marginBottom: 6 }}>
        <strong style={{ color: "#1F1B16" }}>Products / services:</strong> {co.products}
      </div>
      {co.financials && (
        <div style={{ fontSize: 13.5, color: "#2A2520", lineHeight: 1.6, marginBottom: 6 }}>
          <strong style={{ color: "#1F1B16" }}>Recent financials:</strong> {co.financials}
        </div>
      )}
      <div style={{ fontSize: 13.5, color: "#2A2520", lineHeight: 1.6, marginBottom: 6 }}>
        <strong style={{ color: "#1F1B16" }}>Leadership:</strong> {co.leadership}
      </div>
      {co.stock && (
        <div style={{ fontSize: 13.5, color: "#2A2520", lineHeight: 1.6, marginBottom: 6 }}>
          <strong style={{ color: "#1F1B16" }}>Stock:</strong> {co.stock}
        </div>
      )}
      <div style={{ marginTop: 4, marginBottom: 22 }}>
        {co.sources.map((s, i) => <SourceLinks key={i} value={s} />)}
      </div>

      {scenario.countries.map(c => <CountryDocs key={c.id} country={c} />)}

      <div style={{
        marginTop: 8,
        padding: "12px 14px",
        background: "#F4EEDC",
        border: "1px dashed #C9B98F",
        borderRadius: 10
      }}>
        <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "#2D5043", fontWeight: 700, marginBottom: 8 }}>
          📚 Reference list (APA) — use these in your report
        </div>
        {allSources.map((s, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <SourceLinks value={s} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App({ onBack }) {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [teacher, setTeacher] = useState("");
  const [welcomed, setWelcomed] = useState(false);
  const [sessionBest, setSessionBest] = useState(0);
  const [selectedScenarioId, setSelectedScenarioId] = useState("");

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");

  const [editP1, setEditP1] = useState("");
  const [editP2, setEditP2] = useState("");
  const [editP3, setEditP3] = useState("");

  const [attempts, setAttempts] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const feedbackRef = useRef(null);

  const selectedScenario = SCENARIOS.find(s => s.id === selectedScenarioId);
  const attemptNumber = attempts.length + 1;

  const pVals = { p1, p2, p3 };
  const pSetters = { p1: setP1, p2: setP2, p3: setP3 };
  const editVals = { p1: editP1, p2: editP2, p3: editP3 };
  const editSetters = { p1: setEditP1, p2: setEditP2, p3: setEditP3 };

  useEffect(() => {
    if (currentFeedback && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentFeedback]);

  // Single call to the API + parse pipeline. Returns the parsed feedback
  // object on success or throws with a descriptive message on failure.
  // Routed through the Vercel proxy so the Anthropic API key stays server-side.
  const callGrader = async (userPrompt) => {
    const response = await fetch("https://writing-app-logger.vercel.app/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${bodyText.slice(0, 200)}`);
    }

    const data = await response.json();
    const rawResp = (data.content || [])
      .filter(b => b && b.type === "text")
      .map(b => b.text)
      .join("");

    if (!rawResp) {
      throw new Error("Empty response from grader.");
    }

    const cleaned = rawResp.replace(/```json/gi, "").replace(/```/g, "").trim();
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    const jsonStr = firstBrace >= 0 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned;

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error(`Grader returned invalid JSON: ${jsonStr.slice(0, 200)}`);
    }

    if (!parsed.scores) {
      throw new Error("Grader response is missing required fields.");
    }

    return sanitizeFeedback(parsed);
  };

  const handleSubmit = async (source) => {
    // Default to the top-of-page text areas, but allow the feedback-inline
    // editor to pass its own current values directly.
    const useEdit = source && typeof source === "object" && "p1" in source;
    const rawP1 = useEdit ? source.p1 : p1;
    const rawP2 = useEdit ? source.p2 : p2;
    const rawP3 = useEdit ? source.p3 : p3;
    const t1 = rawP1.trim();
    const t2 = rawP2.trim();
    const t3 = rawP3.trim();

    if (!selectedScenario || isLoading) return;

    const validationError = validateSubmission(t1, t2, t3);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    const userPrompt = buildUserPrompt(selectedScenario, t1, t2, t3, attemptNumber);

    // Retry once on failure. Transient network hiccups and occasional
    // malformed JSON from the model are the two failure modes we see;
    // a second attempt clears both the vast majority of the time.
    let feedback = null;
    let lastErr = null;
    for (let attemptIdx = 0; attemptIdx < 2; attemptIdx++) {
      try {
        feedback = await callGrader(userPrompt);
        break;
      } catch (e) {
        lastErr = e;
        console.error(`Grader call failed (attempt ${attemptIdx + 1}):`, e);
      }
    }

    if (feedback) {
      const combined = `PARAGRAPH 1:\n${t1}\n\nPARAGRAPH 2:\n${t2}\n\nPARAGRAPH 3:\n${t3}`;
      setCurrentFeedback(feedback);
      setSessionBest(prev => Math.max(prev, feedback.totalScore));
      setAttempts(prev => [...prev, { p1: t1, p2: t2, p3: t3, feedback }]);
      logToAirtable({
        firstName,
        surname,
        teacher,
        scenarioTitle: selectedScenario.title,
        attemptNumber: attempts.length + 1,
        submission: combined,
        totalScore: feedback.totalScore
      });
      setP1(t1); setP2(t2); setP3(t3);
      setEditP1(t1); setEditP2(t2); setEditP3(t3);
    } else {
      const msg = lastErr && lastErr.message ? lastErr.message : "unknown error";
      setError(`Sorry, something went wrong getting your feedback. Please try again in a moment. (${msg.slice(0, 120)})`);
    }
    setIsLoading(false);
  };

  const handleTryAgain = () => {
    // Grade the edited version. Don't clear anything; the student is
    // iterating on this same attempt in place.
    handleSubmit({ p1: editP1, p2: editP2, p3: editP3 });
  };

  const resetWork = () => {
    setP1(""); setP2(""); setP3("");
    setEditP1(""); setEditP2(""); setEditP3("");
    setAttempts([]);
    setCurrentFeedback(null);
    setError(null);
    setSessionBest(0);
  };

  const handleNewScenario = () => {
    setSelectedScenarioId("");
    resetWork();
  };

  const handleSelectScenario = (id) => {
    setSelectedScenarioId(id);
    resetWork();
  };

  const cardStyle = {
    background: "#FFFFFF",
    border: "1px solid #E8E0D0",
    borderRadius: 14,
    padding: "22px 26px",
    marginBottom: 18
  };

  const stepNumberStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "#2D5043",
    color: "#FAF6ED",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    marginRight: 10,
    flexShrink: 0
  };

  const stepTitleStyle = {
    display: "flex",
    alignItems: "center",
    fontFamily: "'Fraunces', serif",
    fontSize: 20,
    fontWeight: 500,
    color: "#1F1B16",
    margin: 0,
    marginBottom: 14,
    letterSpacing: "-0.01em"
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#6B5D54",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 6
  };

  const allParagraphsFilled = p1.trim() && p2.trim() && p3.trim();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAF6ED",
      padding: "32px 20px 60px",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      color: "#1F1B16"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; }

        .mit-textarea {
          width: 100%;
          min-height: 110px;
          padding: 14px 16px;
          border: 1.5px solid #DDD2BC;
          border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          line-height: 1.55;
          color: #1F1B16;
          background: #FDFAF2;
          resize: vertical;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .mit-textarea:focus {
          border-color: #2D5043;
          box-shadow: 0 0 0 3px rgba(45, 80, 67, 0.12);
        }
        .mit-textarea::placeholder { color: #A89B85; }

        .mit-select {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #DDD2BC;
          border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          color: #1F1B16;
          background: #FDFAF2;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%236B5D54' d='M6 8L0 0h12z'/></svg>");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 40px;
        }
        .mit-select:focus {
          border-color: #2D5043;
          box-shadow: 0 0 0 3px rgba(45, 80, 67, 0.12);
        }

        .mit-btn {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.08s ease, background 0.15s ease, opacity 0.15s ease;
          border: none;
          letter-spacing: 0.01em;
        }
        .mit-btn:active:not(:disabled) { transform: translateY(1px); }
        .mit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .mit-btn-primary { background: #2D5043; color: #FAF6ED; }
        .mit-btn-primary:hover:not(:disabled) { background: #234037; }

        .mit-btn-secondary {
          background: transparent;
          color: #2D5043;
          border: 1.5px solid #2D5043;
        }
        .mit-btn-secondary:hover:not(:disabled) { background: rgba(45, 80, 67, 0.06); }

        .mit-text-body {
          font-size: 15px;
          line-height: 1.7;
          color: #2A2520;
        }
        .mit-text-body p { margin: 0 0 12px 0; }
        .mit-text-body p:last-child { margin-bottom: 0; }

        .a2-link { color: #2D5043; text-decoration: underline; }
        .a2-link:hover { color: #234037; }

        .mit-spin {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(250, 246, 237, 0.4);
          border-top-color: #FAF6ED;
          border-radius: 50%;
          animation: mit-spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: -2px;
        }
        @keyframes mit-spin { to { transform: rotate(360deg); } }

        .mit-fade-in { animation: mit-fade-in 0.4s ease both; }
        @keyframes mit-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        <header style={{ marginBottom: 24, paddingLeft: 6 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                color: "#6B5D54",
                padding: "0 0 12px 0",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              ← Back to menu
            </button>
          )}
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 32,
            fontWeight: 500,
            margin: 0,
            letterSpacing: "-0.02em",
            color: "#1F1B16"
          }}>
            Business Expansion Report
          </h1>
          <p style={{
            fontSize: 15,
            color: "#6B5D54",
            margin: "6px 0 0 0",
            lineHeight: 1.5,
            maxWidth: 580
          }}>
            Advanced 2 Economics. You are a consultant at an international firm. Choose a scenario, read the source
            documents, then write a three-paragraph report recommending one country. Get feedback, then try again.
          </p>
        </header>

        {!welcomed ? (
          <section style={cardStyle} className="mit-fade-in">
            <h2 style={stepTitleStyle}>
              <span style={stepNumberStyle}>👋</span>
              Welcome! Please introduce yourself.
            </h2>
            <p style={{ fontSize: 14.5, color: "#5A4D43", marginBottom: 18, lineHeight: 1.6 }}>
              Fill in all three fields to begin. 😊
            </p>

            <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>First name</label>
                <input
                  type="text"
                  className="mit-select"
                  style={{ fontSize: 15, padding: "11px 14px", width: "100%" }}
                  placeholder="e.g. Yuval"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>Surname</label>
                <input
                  type="text"
                  className="mit-select"
                  style={{ fontSize: 15, padding: "11px 14px", width: "100%" }}
                  placeholder="e.g. Cohen"
                  value={surname}
                  onChange={e => setSurname(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>My teacher is</label>
              <select
                className="mit-select"
                value={teacher}
                onChange={e => setTeacher(e.target.value)}
              >
                <option value="">Select your teacher...</option>
                <option value="Daniel">Daniel</option>
                <option value="Keren">Keren</option>
              </select>
            </div>

            <div style={{ textAlign: "right" }}>
              <button
                className="mit-btn mit-btn-primary"
                disabled={!firstName.trim() || !surname.trim() || !teacher}
                onClick={() => setWelcomed(true)}
              >
                Start ➜
              </button>
            </div>

            {(!firstName.trim() || !surname.trim() || !teacher) && (firstName || surname || teacher) && (
              <div style={{ marginTop: 12, fontSize: 13, color: "#8A6F30", fontStyle: "italic" }}>
                Please fill in all three fields to continue.
              </div>
            )}
          </section>
        ) : (
          <>
            <div style={{
              fontSize: 13,
              color: "#6B5D54",
              marginBottom: 18,
              paddingLeft: 6,
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <span>👤 <strong style={{ color: "#1F1B16" }}>{firstName} {surname}</strong></span>
              <span>📚 <strong style={{ color: "#1F1B16" }}>{teacher}'s class</strong></span>
            </div>

            <section style={cardStyle}>
              <h2 style={stepTitleStyle}>
                <span style={stepNumberStyle}>1</span>
                🗂️ Choose your scenario
              </h2>
              <p style={{ fontSize: 13.5, color: "#5A4D43", marginBottom: 12, lineHeight: 1.55 }}>
                Each scenario is one Israeli company and two possible countries. You will only see the source documents
                for the scenario you choose.
              </p>
              <select
                className="mit-select"
                value={selectedScenarioId}
                onChange={(e) => handleSelectScenario(e.target.value)}
              >
                <option value="">Select a scenario from the list...</option>
                {SCENARIOS.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </section>

            {selectedScenario && (
              <section style={cardStyle} className="mit-fade-in">
                <h2 style={stepTitleStyle}>
                  <span style={stepNumberStyle}>2</span>
                  👀 Read the source documents
                </h2>
                <div style={{
                  maxHeight: 460,
                  overflowY: "auto",
                  padding: "16px 20px",
                  background: "#FDFAF2",
                  border: "1px solid #EDE3CE",
                  borderRadius: 10
                }}>
                  <SourceDocs scenario={selectedScenario} />
                </div>
              </section>
            )}

            {selectedScenario && (
              <section style={cardStyle} className="mit-fade-in">
                <h2 style={stepTitleStyle}>
                  <span style={stepNumberStyle}>3</span>
                  ✍️ Write your report
                </h2>

                <div style={{
                  marginBottom: 16,
                  fontSize: 12.5,
                  color: "#7A3818",
                  background: "#FBF1E5",
                  border: "1px solid #E8C9A8",
                  borderRadius: 8,
                  padding: "10px 12px",
                  lineHeight: 1.5
                }}>
                  🔗 Use at least <strong>two connectors per paragraph</strong>. Try:{" "}
                  <em>{CONNECTOR_HINTS}</em>.
                </div>

                {PARAGRAPHS.map(para => {
                  const val = pVals[para.key];
                  const wc = countWords(val);
                  const enough = wc >= para.minWords;
                  return (
                    <div key={para.key} style={{ marginBottom: 20 }}>
                      <div style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 6,
                        marginBottom: 6
                      }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>
                          Paragraph {para.num} · {para.title}
                        </label>
                        <span style={{ fontSize: 12.5, color: enough ? "#2D5043" : "#8A6F30", fontWeight: 500 }}>
                          {wc} words · aim for {para.targetLabel}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 12.5,
                        color: "#5A4D43",
                        lineHeight: 1.5,
                        marginBottom: 8
                      }}>
                        Include: {para.checklist.join(" · ")}
                      </div>
                      <textarea
                        className="mit-textarea"
                        style={{ minHeight: para.key === "p2" ? 200 : 120 }}
                        value={val}
                        onChange={(e) => {
                          pSetters[para.key](e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder={`✍️ Write paragraph ${para.num} here...`}
                        disabled={isLoading}
                      />
                    </div>
                  );
                })}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ fontSize: 13, color: "#6B5D54" }}>
                    {attempts.length === 0
                      ? "This will be your first attempt."
                      : `Attempt ${attemptNumber}. Previous attempts: ${attempts.length}.`}
                  </div>
                  <button
                    className="mit-btn mit-btn-primary"
                    onClick={handleSubmit}
                    disabled={isLoading || !allParagraphsFilled}
                  >
                    {isLoading && <span className="mit-spin" />}
                    {isLoading ? "Checking..." : "Get feedback"}
                  </button>
                </div>

                {error && (
                  <div style={{
                    marginTop: 14,
                    padding: "10px 14px",
                    background: "#F8E5DC",
                    border: "1px solid #E0B8A0",
                    borderRadius: 8,
                    fontSize: 13.5,
                    color: "#7A3818"
                  }}>
                    {error}
                  </div>
                )}
              </section>
            )}

            {currentFeedback && (
              <section
                ref={feedbackRef}
                style={{ ...cardStyle, borderColor: "#D4C7A8" }}
                className="mit-fade-in"
              >
                <h2 style={stepTitleStyle}>
                  <span style={stepNumberStyle}>4</span>
                  💬 Your feedback
                </h2>

                <div style={{ display: "flex", gap: 22, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
                  <ScoreRing score={currentFeedback.totalScore} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 18,
                      fontWeight: 500,
                      color: "#1F1B16",
                      lineHeight: 1.4,
                      marginBottom: 4
                    }}>
                      {currentFeedback.encouragement}
                    </div>
                    <div style={{ fontSize: 13, color: "#6B5D54" }}>
                      Attempt {attempts.length} of unlimited.{sessionBest > 0 && ` Best so far: ${sessionBest}/100.`}
                    </div>
                  </div>
                </div>

                {currentFeedback.voiceConcern && (
                  <div style={{
                    padding: "14px 16px",
                    background: "#FBF1E5",
                    border: "1px solid #E8C9A8",
                    borderRadius: 10,
                    marginBottom: 18
                  }}>
                    <div style={{
                      fontSize: 11.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#7A3818",
                      fontWeight: 600,
                      marginBottom: 6
                    }}>
                      🗣️ A quick check
                    </div>
                    <div style={{ fontSize: 14, color: "#5A4D43", lineHeight: 1.55 }}>
                      {currentFeedback.voiceConcern}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 18 }}>
                  {Object.keys(CATEGORY_MAX).map(key => (
                    <CategoryBar
                      key={key}
                      label={CATEGORY_LABELS[key]}
                      score={currentFeedback.scores[key] || 0}
                      max={CATEGORY_MAX[key]}
                    />
                  ))}
                </div>

                {currentFeedback.issues && currentFeedback.issues.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#6B5D54",
                      fontWeight: 600,
                      marginBottom: 10
                    }}>
                      🔍 Things to look at
                    </div>
                    {currentFeedback.issues.map((issue, i) => (
                      <div key={i} style={{
                        padding: "12px 14px 12px 16px",
                        background: "#FDFAF2",
                        border: "1px solid #EDE3CE",
                        borderLeft: `3px solid ${CATEGORY_DOTS[issue.category] || "#6B5D54"}`,
                        borderRadius: 8,
                        marginBottom: 8
                      }}>
                        <div style={{
                          fontSize: 11.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: CATEGORY_DOTS[issue.category] || "#6B5D54",
                          fontWeight: 600,
                          marginBottom: 4
                        }}>
                          <span style={{ marginRight: 6 }}>{CATEGORY_EMOJIS[issue.category] || "📝"}</span>
                          {CATEGORY_LABELS[issue.category] || issue.category}
                        </div>
                        <div style={{ fontSize: 14.5, color: "#1F1B16", marginBottom: 4, lineHeight: 1.5 }}>
                          {issue.what}
                        </div>
                        {issue.hint && (
                          <div style={{ fontSize: 13.5, color: "#5A4D43", lineHeight: 1.5, fontStyle: "italic" }}>
                            💡 Hint: {issue.hint}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentFeedback.sampleEssay && (
                  <div style={{
                    padding: "14px 16px",
                    background: "#E8EFE9",
                    border: "1px solid #B5C9B8",
                    borderRadius: 10,
                    marginBottom: 18
                  }}>
                    <div style={{
                      fontSize: 11.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#2D5043",
                      fontWeight: 600,
                      marginBottom: 6
                    }}>
                      ✨ One way to write this report
                    </div>
                    <div className="mit-text-body" style={{ fontStyle: "italic", color: "#1F1B16" }}>
                      {String(currentFeedback.sampleEssay).split(/\n\s*\n/).map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#5A4D43", marginTop: 8 }}>
                      This is one example. There are many other good ways to write it.
                    </div>
                  </div>
                )}

                {currentFeedback.totalScore < 80 && (() => {
                  const score = currentFeedback.totalScore;
                  let headline, body;
                  if (score >= 70) {
                    headline = "🌟 Almost there! A few fixes will push you over 80.";
                    body = "Read the hints above, edit your three paragraphs, then try again.";
                  } else if (score >= 50) {
                    headline = "💪 Solid draft. You are on the right track.";
                    body = "Work through the hints one by one, then submit again. Each attempt makes it stronger.";
                  } else if (score >= 30) {
                    headline = "🌱 Good start. Now let's build it up together.";
                    body = "Read each hint slowly, check the source documents again, then rewrite the weak paragraphs.";
                  } else {
                    headline = "🤗 Don't worry, this is just practice.";
                    body = "Go back to the source documents, read the hints carefully, and try again. Every attempt helps.";
                  }
                  return (
                    <div style={{
                      padding: "14px 16px",
                      background: "#F4EEDC",
                      border: "1px solid #D4C7A8",
                      borderRadius: 10,
                      marginBottom: 14
                    }}>
                      <div style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 16,
                        fontWeight: 500,
                        color: "#1F1B16",
                        lineHeight: 1.45,
                        marginBottom: 4
                      }}>
                        {headline}
                      </div>
                      <div style={{ fontSize: 13.5, color: "#5A4D43", lineHeight: 1.55 }}>
                        {body}
                      </div>
                    </div>
                  );
                })()}

                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 11.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#6B5D54",
                    fontWeight: 600,
                    marginBottom: 10
                  }}>
                    {currentFeedback.totalScore < 80
                      ? "✏️ Edit your report, then try again"
                      : "✨ Try writing another version"}
                  </div>

                  {PARAGRAPHS.map(para => {
                    const val = editVals[para.key];
                    const wc = countWords(val);
                    const enough = wc >= para.minWords;
                    return (
                      <div key={para.key} style={{ marginBottom: 14 }}>
                        <div style={{
                          display: "flex",
                          alignItems: "baseline",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 6,
                          marginBottom: 6
                        }}>
                          <label style={{ ...labelStyle, marginBottom: 0 }}>
                            Paragraph {para.num} · {para.title}
                          </label>
                          <span style={{ fontSize: 12.5, color: enough ? "#2D5043" : "#8A6F30", fontWeight: 500 }}>
                            {wc} words · aim for {para.targetLabel}
                          </span>
                        </div>
                        <textarea
                          className="mit-textarea"
                          style={{ minHeight: para.key === "p2" ? 180 : 110 }}
                          value={val}
                          onChange={(e) => {
                            editSetters[para.key](e.target.value);
                            if (error) setError(null);
                          }}
                          disabled={isLoading}
                        />
                      </div>
                    );
                  })}

                  {error && (
                    <div style={{
                      marginTop: 10,
                      padding: "10px 14px",
                      background: "#F8E5DC",
                      border: "1px solid #E0B8A0",
                      borderRadius: 8,
                      fontSize: 13.5,
                      color: "#7A3818"
                    }}>
                      {error}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="mit-btn mit-btn-primary"
                    onClick={handleTryAgain}
                    disabled={isLoading || !editP1.trim() || !editP2.trim() || !editP3.trim()}
                  >
                    {isLoading && <span className="mit-spin" />}
                    {isLoading
                      ? "Checking..."
                      : currentFeedback.totalScore < 80
                        ? "Try again"
                        : "Try another version"}
                  </button>
                  <button className="mit-btn mit-btn-secondary" onClick={handleNewScenario} disabled={isLoading}>
                    Choose a different scenario
                  </button>
                </div>
              </section>
            )}

            {!selectedScenario && (
              <div style={{
                textAlign: "center",
                color: "#8A7B6A",
                fontSize: 13.5,
                marginTop: 30,
                fontStyle: "italic"
              }}>
                👆 Pick a scenario above to begin.
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
