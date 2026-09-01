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

const TEACHERS = ["Yohanna", "Rita", "Keren", "Daniel"];

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIOS
// Each scenario is a self-contained brief: one Israeli company plus two
// candidate countries. The student picks ONE scenario and only ever sees that
// scenario's source documents.
//
// The fields consumed by the grader serializer (company.name / description /
// products / financials / leadership / stock / sources, and each country's
// facts / news / incentive / worldBank) are unchanged from the original data.
// The extra display fields (logo, sector, flag, founded, ticker,
// leadershipList, news[].relevance, economy, worldBank.definitions,
// worldBank.citation, company.citations) only feed the reference panel.
// ─────────────────────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    id: "supercom",
    title: "SuperCom — India vs Cyprus",
    logo: "💼",
    sector: "Digital identity, e-government and cybersecurity technology.",
    company: {
      name: "SuperCom (NASDAQ: SPCB)",
      ticker: "NASDAQ: SPCB",
      founded: 1988,
      description:
        "Founded in 1988, SuperCom is a global provider of digital identity solutions, e-government platforms, cybersecurity, tracking, RFID and mobile technology.",
      products:
        "e-Government platforms; the PureRF wireless hybrid suite; RFID and mobile technology for healthcare, law enforcement and electronic monitoring.",
      leadership:
        "Ordan Trabelsi — President & CEO (Columbia MBA; Technion BSc Computer Engineering). Barak Trabelsi — COO (Tel Aviv University MBA & BSc Computer Science). Gil Alfi — VP Sales, Safend (Bar-Ilan BSc & MSc Computer Science).",
      leadershipList: [
        { name: "Ordan Trabelsi", title: "President & CEO", creds: "Columbia MBA; Technion BSc Computer Engineering" },
        { name: "Barak Trabelsi", title: "COO", creds: "Tel Aviv University MBA & BSc Computer Science" },
        { name: "Gil Alfi", title: "VP Sales, Safend", creds: "Bar-Ilan BSc & MSc Computer Science" }
      ],
      stock:
        "NASDAQ: SPCB. Share-price data from CNN Markets, https://edition.cnn.com/markets/stocks/SPCB (retrieved 02/06/26).",
      financials:
        "Listed on NASDAQ as SPCB. Live share-price data is tracked via CNN Markets (retrieved 02/06/26).",
      sources: [
        "SuperCom. (n.d.). Our company. https://www.supercom.com/our-company",
        "CNN Markets. (2026). SuperCom Ltd (SPCB). https://edition.cnn.com/markets/stocks/SPCB"
      ],
      citations: ["(SuperCom, n.d.)", "(CNN Markets, 2026)"]
    },
    countries: [
      {
        id: "india",
        name: "India",
        flag: "🇮🇳",
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
        economy:
          "A very large, fast-growing economy with a domestic market of over 1.4 billion people. Still mostly rural (66%), with lower life expectancy than European markets and a currency (the rupee) outside the euro area.",
        news: [
          {
            headline: "RBI proposes new cybersecurity norms for payment operators",
            outlet: "The Times of India",
            date: "June 2, 2023",
            summary:
              "The Reserve Bank of India proposed robust governance mechanisms for non-bank payment system operators to address cybersecurity risks. Draft guidelines cover governance, network security, application security and vendor risk management, and require a Cyber Crisis Management Plan (CCMP).",
            source:
              "https://timesofindia.indiatimes.com/gadgets-news/rbi-proposes-new-norms-on-digital-payment-security-controls/articleshow/100709080.cms",
            citation: "(TIMESOFINDIA.COM, 2023)",
            relevance:
              "SuperCom sells cybersecurity and digital-identity platforms, so tougher payment-security rules would raise demand for exactly the services it provides."
          },
          {
            headline: "India fast emerging as a hub for cybersecurity innovations",
            outlet: "The Times of India",
            date: "June 21, 2023",
            summary:
              "Major cybersecurity firms see India as crucial for R&D. Trellix has 1,750 employees in India; CrowdStrike India leads malware research and IoT security; Palo Alto Networks has 800+ employees across three Indian R&D centres. A shortage of cybersecurity talent remains a challenge.",
            source:
              "https://timesofindia.indiatimes.com/business/india-business/india-is-fast-emerging-as-hub-for-cybersecurity-innovations/articleshow/101154484.cms",
            citation: "(TNN, 2023)",
            relevance:
              "It shows India has a growing pool of cybersecurity talent and R&D activity SuperCom could tap into, though the reported talent shortage is a risk."
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
          definitions: [
            ["Corruption", "How often firms face bribe requests — informal payments to obtain permits, licenses or government contracts. Higher values mean it is more costly and risky to operate."],
            ["Innovation & Technology", "How far firms use ICT, hold internationally-recognised quality certifications, and use the internet for business. Higher values mean a more modern business environment."]
          ],
          source: "https://www.enterprisesurveys.org/en/data/exploreeconomies/2025/india",
          citation: "(Enterprise Surveys, 2025)"
        }
      },
      {
        id: "cyprus",
        name: "Cyprus",
        flag: "🇨🇾",
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
        economy:
          "A small, high-income EU economy of about 1.5 million people using the euro. Compact and urbanised, with high life expectancy and direct access to the EU single market.",
        news: [
          {
            headline: "Red flags raised over state cyber security policy",
            outlet: "Cyprus Mail",
            date: "April 2, 2023",
            summary:
              "Three major hacks hit Cyprus in one month (the University of Cyprus, the land registry and the Open University). Lack of awareness, slow government procedures and inadequate security infrastructure were exposed. A Security Operation Centre procured in 2019 was still unused.",
            source: "https://cyprus-mail.com/2023/04/02/red-flags-raised-over-the-state-cyber-security-policy/",
            citation: "(Kades, 2023)",
            relevance:
              "Repeated public-sector hacks reveal weak cyber infrastructure in Cyprus — a clear gap that SuperCom's e-government and security products could fill."
          },
          {
            headline: "Government issues urgent cyber security to-do list",
            outlet: "Cyprus Mail",
            date: "April 13, 2022",
            summary:
              "CSIRT-CY warned that cyberattacks are becoming more common and advised backing up data, keeping devices updated and using strong, unique passwords.",
            source: "https://cyprus-mail.com/2022/04/13/government-issues-urgent-cyber-security-to-do-list/",
            citation: "(Christou, 2022)",
            relevance:
              "Government urgency about cybersecurity suggests public-sector buyers in Cyprus are actively looking for solutions like SuperCom's."
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
          definitions: [
            ["Corruption", "How often firms face bribe requests — informal payments to obtain permits, licenses or government contracts. Higher values mean it is more costly and risky to operate."],
            ["Innovation & Technology", "How far firms use ICT and hold internationally-recognised quality certifications. Higher values mean a more modern business environment."]
          ],
          source: "https://www.enterprisesurveys.org/en/data/exploreeconomies/2024/cyprus",
          citation: "(Enterprise Surveys, 2024)"
        }
      }
    ]
  },
  {
    id: "caesarstone",
    title: "Caesarstone — Greece vs Romania",
    logo: "💼",
    sector: "Engineered quartz surfaces for kitchens and interiors.",
    company: {
      name: "Caesarstone (NASDAQ: CSTE)",
      ticker: "NASDAQ: CSTE",
      founded: 1987,
      description:
        "Founded in 1987, Caesarstone is a pioneer in engineered quartz surfaces, producing kitchen countertops, vanity tops, wall panels, floor tiles and stairs for indoor and outdoor spaces.",
      products:
        "Engineered quartz slabs; a multi-material portfolio of 100+ colours; porcelain and natural stone; digital platforms and services. Sold in 50+ countries with 1,500+ employees worldwide.",
      financials:
        "Q1 2023: revenue $150.6M (Q1 2022: $170.4M); net loss $3.85M (Q1 2022: net income $6.6M).",
      leadership:
        "Yosef (Yos) Shiran — CEO (BSc Industrial Engineering, Ben-Gurion; MBA, Bar-Ilan). Nahum Trost — CFO (CPA; BA Economics & Accounting, Haifa; MSc Business Economics, Technion). Amir Reske — Managing Director EMEA (postgraduate diploma, Oxford; business law, Coventry). Idit Maayan-Zohar — Global CMO (BA Business Administration, College of Management; MBA, Bar-Ilan).",
      leadershipList: [
        { name: "Yosef (Yos) Shiran", title: "CEO", creds: "BSc Industrial Engineering, Ben-Gurion; MBA, Bar-Ilan" },
        { name: "Nahum Trost", title: "CFO", creds: "CPA; BA Economics & Accounting, Haifa; MSc Business Economics, Technion" },
        { name: "Amir Reske", title: "Managing Director EMEA", creds: "postgraduate diploma, Oxford; business law, Coventry" },
        { name: "Idit Maayan-Zohar", title: "Global CMO", creds: "BA Business Administration, College of Management; MBA, Bar-Ilan" }
      ],
      sources: [
        "Caesarstone. (n.d.). Executive management. https://ir.caesarstone.com/governance/executive-management/default.aspx",
        "Caesarstone. (2023). Caesarstone reports first quarter 2023 financial results. https://ir.caesarstone.com/news/news-details/2023/Caesarstone-Reports-First-Quarter-2023-Financial-Results/default.aspx"
      ],
      citations: ["(Caesarstone, n.d.)", "(Caesarstone, 2023)"]
    },
    countries: [
      {
        id: "greece",
        name: "Greece",
        flag: "🇬🇷",
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
        economy:
          "A mid-sized euro-area economy of about 9.4 million people, heavily urbanised (81%) with high literacy and life expectancy. It is investing heavily in construction and infrastructure projects.",
        news: [
          {
            headline: "Greek construction companies fear staff shortages",
            outlet: "Kathimerini",
            date: "January 1, 2023",
            summary:
              "Major construction groups are concerned about a shortage of craftsmen, machine operators and engineers as several billion-euro projects begin at the same time (Elliniko, new highways, hotels and energy projects). No institutional initiative has been taken yet.",
            source: "https://www.ekathimerini.com",
            citation: "(Kathimerini, 2023)",
            relevance:
              "Caesarstone's surfaces are installed in construction and renovation projects, so a wave of big Greek building projects means more demand — but labour shortages could slow installation."
          },
          {
            headline: "Hardware & Home Improvement Stores in Greece",
            outlet: "IBISWorld",
            date: "2023",
            summary:
              "Market size €1.7bn, ranked 18th in the EU (of 27). The industry grew by an average of 6.6% per year from 2018 to 2023. Employment is 16,577 and the average business has 3.4 employees.",
            source: "https://www.ibisworld.com/greece/industry-statistics/hardware-home-improvement-stores/3022/",
            citation: "(IBISWorld, 2023)",
            relevance:
              "This is Caesarstone's retail channel; steady 6.6% annual growth shows a healthy but relatively small market for its countertops."
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
          definitions: [
            ["Infrastructure", "Reliability of electricity and water supply, and how long firms wait to obtain connections. Weaker infrastructure means production delays and extra cost."],
            ["Corruption", "How often firms face bribe requests — informal payments to obtain permits, licenses or government contracts. Higher values mean it is more costly and risky to operate."]
          ],
          source: "https://www.enterprisesurveys.org/en/data/exploreeconomies/2023/greece",
          citation: "(Enterprise Surveys, 2023)"
        }
      },
      {
        id: "romania",
        name: "Romania",
        flag: "🇷🇴",
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
        economy:
          "A larger EU economy of about 19 million people using the leu, not the euro. More evenly split between urban and rural (52/48) with lower life expectancy than Greece, but rapid construction growth.",
        news: [
          {
            headline: "Construction projects up 20% in 2022",
            outlet: "SeeNews",
            date: "February 8, 2023",
            summary:
              "29,719 projects in total, with all nine construction segments increasing. Infrastructure was the fastest growing at +63%. Private residential topped the list with 12,149 projects and the industrial segment was second with 5,960. Cluj, Timis, Bihor and Bucharest were the main investment destinations.",
            source: "https://seenews.com",
            citation: "(Todasca, 2023)",
            relevance:
              "Strong, broad-based construction growth in Romania signals rising demand for the countertops, tiles and surfaces that Caesarstone makes."
          },
          {
            headline: "Hardware & Home Improvement Stores in Romania",
            outlet: "IBISWorld",
            date: "2023",
            summary:
              "Market size €4.8bn, ranked 10th in the EU (of 27). The industry grew by an average of 4.6% per year from 2018 to 2023. Employment is 35,170 (growth 5.9%) and the average business has 23.4 employees.",
            source: "https://www.ibisworld.com/romania/industry-statistics/hardware-home-improvement-stores/3022/",
            citation: "(IBISWorld, 2023)",
            relevance:
              "Romania's home-improvement market is far larger than Greece's (€4.8bn vs €1.7bn) and still growing — a bigger retail opportunity for Caesarstone."
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
          definitions: [
            ["Infrastructure", "Reliability of electricity and water supply, and how long firms wait to obtain connections. Weaker infrastructure means production delays and extra cost."],
            ["Corruption", "How often firms face bribe requests — informal payments to obtain permits, licenses or government contracts. Higher values mean it is more costly and risky to operate."]
          ],
          source: "https://www.enterprisesurveys.org/en/data/exploreeconomies/2023/romania",
          citation: "(Enterprise Surveys, 2023)"
        }
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// PARAGRAPH CONFIG — the report is written in three separate text areas.
// ─────────────────────────────────────────────────────────────────────────────
const PARAGRAPHS = [
  {
    key: "p1",
    num: 1,
    title: "Introduction",
    pts: 20,
    lo: 80,
    hi: 100,
    category: "introduction",
    reminders: [
      "Describe the company — what it does, its products or services.",
      "Say why these two countries are being compared.",
      "State which country you recommend, plus a short roadmap of the report."
    ],
    rubricText:
      "- company description (5)\n- reason the two countries are examined (5)\n- recommendation stated (5)\n- roadmap of the report (5)"
  },
  {
    key: "p2",
    num: 2,
    title: "Main body",
    pts: 40,
    lo: 180,
    hi: 220,
    category: "mainBody",
    reminders: [
      "Analyse the industry / news items for BOTH countries.",
      "Discuss two economic indicators and one investment incentive.",
      "Discuss two World Bank Enterprise Survey indicators — compare the countries."
    ],
    rubricText:
      "- industry / news analysis (10)\n- two economic indicators, 6 each (12)\n- one investment incentive (6)\n- two World Bank Enterprise Survey indicators, 6 each (12)"
  },
  {
    key: "p3",
    num: 3,
    title: "Conclusion",
    pts: 15,
    lo: 60,
    hi: 80,
    category: "conclusion",
    reminders: [
      "Restate your recommendation.",
      "Describe the future of the business in the country you chose."
    ],
    rubricText: "- reiterates the recommendation (5)\n- discusses the future of the business (10)"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE HELPERS — connectors + comparison phrases
// ─────────────────────────────────────────────────────────────────────────────
const CONNECTOR_GROUPS = {
  "Addition": ["moreover", "furthermore", "in addition", "additionally", "also", "as well as"],
  "Contrast": ["however", "on the other hand", "in contrast", "whereas", "while", "nevertheless", "unlike"],
  "Cause / result": ["therefore", "as a result", "consequently", "thus", "because of this", "for this reason"],
  "Sequence": ["firstly", "secondly", "thirdly", "next", "then", "finally", "to sum up"],
  "Example": ["for example", "for instance", "such as", "namely", "in particular"]
};

const ALL_CONNECTORS = Object.values(CONNECTOR_GROUPS).flat();

const CONNECTOR_HINTS =
  "firstly, secondly, moreover, in addition, furthermore, however, on the other hand, therefore, as a result, for example, in conclusion, to sum up";

function comparisonPhrases(a, b) {
  return [
    `In contrast to ${a}, ${b}…`,
    `While ${a} offers…, ${b}…`,
    `Compared to ${a}, ${b} has…`,
    `${a} has a higher … than ${b}, whereas…`,
    `Unlike ${a}, ${b}…`,
    `Both ${a} and ${b} …, but …`
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// RUBRIC / SCORING  (unchanged point structure)
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
  introduction: "Paragraph 1",
  mainBody: "Paragraph 2",
  conclusion: "Paragraph 3",
  references: "Citations (APA)",
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

const PARA_CATEGORIES = ["introduction", "mainBody", "conclusion"];

const RUBRIC_GUIDE = [
  {
    title: "Paragraph 1 — Introduction",
    total: 20,
    items: [
      ["Company description", 5],
      ["Reason the two countries are examined", 5],
      ["Recommendation (which country)", 5],
      ["Roadmap of the report", 5]
    ]
  },
  {
    title: "Paragraph 2 — Main body",
    total: 40,
    items: [
      ["Industry / news analysis", 10],
      ["Two economic indicators (6 each)", 12],
      ["One investment incentive", 6],
      ["Two World Bank indicators (6 each)", 12]
    ]
  },
  {
    title: "Paragraph 3 — Conclusion",
    total: 15,
    items: [
      ["Reiterate the recommendation", 5],
      ["Future of the business", 10]
    ]
  },
  {
    title: "Across the whole report",
    total: 25,
    items: [
      ["References in APA format", 6],
      ["Presentation — 3 clear paragraphs", 3],
      ["Connectors — 2+ per paragraph", 6],
      ["Language — grammar, vocabulary, punctuation", 10]
    ]
  }
];

const GUIDE_TIPS = [
  "Always cite your sources with an in-text citation, e.g. (IBISWorld, 2023). The exact citations are on the Language tab.",
  "Use at least two connectors in every paragraph (however, moreover, therefore, for example…).",
  "In Paragraph 2, compare BOTH countries on each point — don't only describe the country you chose."
];

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT  (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
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

// Compact per-paragraph coach used by the "Check this paragraph" button.
// Deliberately never returns a score or a model answer.
const PARA_CHECK_SYSTEM = `You are a warm, supportive university writing tutor for an Advanced 2 English course. The student is a B1-B2 Israeli undergraduate writing a three-paragraph business expansion report.

You are given the locked source documents, which paragraph of the report the student is drafting, what that paragraph must contain, and the student's current draft of THAT ONE paragraph only.

This is an INCREMENTAL check while the student is still writing. It is NOT a final submission.

Your job:
- Give 2 or 3 short, specific observations about this paragraph: what is working, and what is missing or unclear against what the paragraph needs.
- For each observation, add a HINT for how to think about fixing it.
- NEVER write a corrected sentence, a model paragraph or a sample essay.
- NEVER give a score or a mark.
- Be encouraging. Simple, clear language. Every sentence ends with ".", "!" or "?".
- Check facts against the source documents. If a fact contradicts the sources, gently point it out.

Respond with VALID JSON ONLY, no markdown fences, using this schema:

{
  "observations": [
    { "what": "<one or two short sentences, max 32 words>", "hint": "<one short sentence, no corrected text, max 32 words>" }
  ]
}`;

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT + TEXT HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function countWords(s) {
  const m = (s || "").trim().match(/\S+/g);
  return m ? m.length : 0;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countConnectors(text) {
  const t = (text || "").toLowerCase();
  let n = 0;
  for (const c of ALL_CONNECTORS) {
    const re = new RegExp(`(^|[^a-z])${escapeRegex(c)}([^a-z]|$)`, "g");
    const m = t.match(re);
    if (m) n += m.length;
  }
  return n;
}

function countCitations(text) {
  const m = (text || "").match(/\([^()]*\b(?:\d{4}|n\.d\.)\b[^()]*\)/g);
  return m ? m.length : 0;
}

function wcColor(wc, lo, hi) {
  if (wc >= lo && wc <= hi) return "#2D5043";        // green — on target
  if (wc >= lo * 0.75 && wc < lo) return "#B8862E";  // amber — near target
  if (wc > hi && wc <= hi * 1.3) return "#B8862E";   // amber — a bit long
  return "#B4472B";                                  // red — off target
}

function factsCitation(src) {
  const m = String(src).match(/^([^.]+)\.\s*\((\d{4})\)/);
  return m ? `(${m[1].trim()}, ${m[2]})` : String(src);
}

function apaRows(scenario) {
  const rows = [["The company", scenario.company.citations]];
  scenario.countries.forEach(c => {
    rows.push([`${c.name} — country facts`, [factsCitation(c.factsSource)]]);
    rows.push([`${c.name} — industry / news`, c.news.map(n => n.citation)]);
    rows.push([`${c.name} — investment incentive`, [c.incentive.citation]]);
    rows.push([`${c.name} — World Bank indicators`, [c.worldBank.citation]]);
  });
  return rows;
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

function buildParaCheckPrompt(scenario, para, text) {
  return `SCENARIO SOURCE DOCUMENTS (the ONLY sources the student was given):
"""
${serializeScenario(scenario)}
"""

The student is drafting PARAGRAPH ${para.num} (${para.title}) ONLY. This is an incremental check while writing, not a final submission.

WHAT PARAGRAPH ${para.num} MUST DO:
${para.rubricText}

STUDENT'S CURRENT DRAFT OF PARAGRAPH ${para.num} (${countWords(text)} words):
"""
${text}
"""

Give 2 or 3 short, specific observations with hints. No score. No corrected text. JSON only.`;
}

function validateSubmission(p1, p2, p3) {
  if (!p1.trim() || !p2.trim() || !p3.trim()) {
    return "⚠️ Please write all three paragraphs (introduction, main body, and conclusion) before getting feedback.";
  }
  if (countWords(p1) + countWords(p2) + countWords(p3) < 60) {
    return "⚠️ Your report looks very short. Try to develop each paragraph a little more before asking for feedback.";
  }
  return null;
}

function ensureEndPunct(text) {
  if (!text || typeof text !== "string") return text;
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const last = trimmed.slice(-1);
  if (last === "." || last === "!" || last === "?") return trimmed;
  return trimmed + ".";
}

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

function extractJson(rawResp) {
  const cleaned = String(rawResp).replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const jsonStr =
    firstBrace >= 0 && lastBrace > firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned;
  return JSON.parse(jsonStr);
}

// Build a client-side "strengths" list from the category scores, since the
// grader schema does not return one.
function deriveStrengths(feedback) {
  const out = [];
  for (const key of Object.keys(CATEGORY_MAX)) {
    const s = feedback.scores[key] || 0;
    const m = CATEGORY_MAX[key];
    if (s >= m) out.push(`${CATEGORY_LABELS[key]}: full marks (${s}/${m}).`);
    else if (m > 0 && s / m >= 0.8) out.push(`${CATEGORY_LABELS[key]}: strong (${s}/${m}).`);
  }
  return out;
}

function weakestCategoryLabel(feedback) {
  let label = null;
  let ratio = 2;
  for (const key of Object.keys(CATEGORY_MAX)) {
    const r = (feedback.scores[key] || 0) / CATEGORY_MAX[key];
    if (r < ratio) {
      ratio = r;
      label = CATEGORY_LABELS[key];
    }
  }
  return label;
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL UI PIECES
// ─────────────────────────────────────────────────────────────────────────────
function ScoreRing({ score, max = 100 }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, score / max));
  const offset = circumference * (1 - progress);
  const color = score >= max * 0.9 ? "#2D5043" : score >= max * 0.7 ? "#7A6B2A" : "#B85C38";
  return (
    <div style={{ position: "relative", width: 108, height: 108, flexShrink: 0 }}>
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={radius} fill="none" stroke="#E8E0D0" strokeWidth="7" />
        <circle
          cx="54" cy="54" r={radius} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 54 54)"
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center", flexDirection: "column",
        fontFamily: "'Fraunces', serif"
      }}>
        <div style={{ fontSize: 30, fontWeight: 600, color: "#1F1B16", lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 11, color: "#6B5D54", marginTop: 2, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.05em" }}>OF {max}</div>
      </div>
    </div>
  );
}

function CategoryBar({ label, score, max }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const earned = score === max;
  return (
    <div style={{ marginBottom: 9 }}>
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

function Collapsible({ title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="a2-collapse">
      <button className="a2-collapse-head" onClick={() => setOpen(o => !o)} type="button">
        <span>
          {title}
          {subtitle && <span style={{ color: "#8A7B6A", fontWeight: 400 }}> · {subtitle}</span>}
        </span>
        <span className="a2-collapse-icon">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="a2-collapse-body">{children}</div>}
    </div>
  );
}

const kickerStyle = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "#6B5D54",
  fontWeight: 700,
  margin: "14px 0 6px"
};

// ─────────────────────────────────────────────────────────────────────────────
// LEFT PANEL — TAB CONTENT
// ─────────────────────────────────────────────────────────────────────────────
function CompanyTab({ scenario }) {
  const co = scenario.company;
  const cleanName = co.name.replace(/\s*\([^)]*\)\s*$/, "");
  return (
    <div className="a2-doc-card">
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 21, fontWeight: 500, color: "#1F1B16" }}>
        {scenario.logo} {cleanName}
      </div>
      <div style={{ fontSize: 12.5, color: "#6B5D54", marginTop: 3 }}>
        {co.ticker} · Founded {co.founded}
      </div>

      <div style={{ ...kickerStyle, marginTop: 14 }}>Overview</div>
      <div className="a2-body-text">{co.description}</div>

      <div style={kickerStyle}>Products &amp; services</div>
      <div className="a2-body-text">{co.products}</div>

      <div style={kickerStyle}>Leadership team</div>
      <div style={{ display: "grid", gap: 8 }}>
        {co.leadershipList.map((p, i) => (
          <div key={i} style={{ fontSize: 13, color: "#2A2520", lineHeight: 1.45 }}>
            <strong style={{ color: "#1F1B16" }}>{p.name}</strong> — {p.title}
            <div style={{ fontSize: 12, color: "#7A6B60" }}>{p.creds}</div>
          </div>
        ))}
      </div>

      {co.financials && (
        <>
          <div style={kickerStyle}>Financial highlights</div>
          <div className="a2-body-text">{co.financials}</div>
        </>
      )}

      <div style={kickerStyle}>Source</div>
      {co.sources.map((s, i) => <SourceLinks key={i} value={s} />)}
    </div>
  );
}

function factsForGeneralInfo(country) {
  const wanted = ["head", "capital", "population", "currency", "area", "urban", "life expectancy", "government", "literacy"];
  return country.facts.filter(([k]) => wanted.some(w => k.toLowerCase().includes(w)));
}

function CountryTab({ country, company }) {
  return (
    <div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 21, fontWeight: 500, color: "#1F1B16", marginBottom: 10 }}>
        {country.flag} {country.name}
      </div>

      <Collapsible title="General info" defaultOpen>
        <div style={{ display: "grid", gap: 4 }}>
          {factsForGeneralInfo(country).map(([k, v], i) => (
            <div key={i} style={{ fontSize: 13, color: "#2A2520", lineHeight: 1.5 }}>
              <strong style={{ color: "#1F1B16" }}>{k}:</strong> {v}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8 }}><SourceLinks value={country.factsSource} /></div>
      </Collapsible>

      {country.news.map((n, i) => (
        <Collapsible key={i} title={`News item ${i + 1}`} subtitle={n.outlet}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1F1B16", lineHeight: 1.4 }}>{n.headline}</div>
          <div style={{ fontSize: 12, color: "#6B5D54", margin: "3px 0 8px" }}>{n.outlet} · {n.date}</div>
          <div className="a2-body-text">{n.summary}</div>
          <div style={{
            marginTop: 8, padding: "8px 10px", background: "#F1F5EE",
            border: "1px solid #CFE0C6", borderRadius: 7, fontSize: 12.5, color: "#2D5043", lineHeight: 1.5
          }}>
            <strong>Relevant because:</strong> {n.relevance}
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: "#2D5043", fontWeight: 600 }}>Cite as: {n.citation}</div>
            <SourceLinks value={n.source} />
          </div>
        </Collapsible>
      ))}

      <Collapsible title="Economic indicators">
        <div className="a2-body-text">{country.economy}</div>
        <div style={{ ...kickerStyle, marginTop: 10 }}>Figures to quote</div>
        <div style={{ display: "grid", gap: 4 }}>
          {country.facts
            .filter(([k]) => /population|area|currency|urban|life expectancy|literacy/i.test(k))
            .map(([k, v], i) => (
              <div key={i} style={{ fontSize: 13, color: "#2A2520", lineHeight: 1.5 }}>
                <strong style={{ color: "#1F1B16" }}>{k}:</strong> {v}
              </div>
            ))}
        </div>
        <div style={{ marginTop: 8 }}><SourceLinks value={country.factsSource} /></div>
      </Collapsible>

      <Collapsible title="Investment incentives">
        <div className="a2-body-text">{country.incentive.summary}</div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#2D5043", fontWeight: 600 }}>APA in-text citation: {country.incentive.citation}</div>
          <SourceLinks value={country.incentive.source} />
        </div>
      </Collapsible>

      <Collapsible title="World Bank indicators">
        <div style={{ display: "grid", gap: 8 }}>
          {country.worldBank.definitions.map(([name, measures], i) => (
            <div key={i} style={{ fontSize: 13, color: "#2A2520", lineHeight: 1.5 }}>
              <strong style={{ color: "#1F1B16" }}>{name}:</strong> {measures}
            </div>
          ))}
        </div>
        <div style={{ ...kickerStyle, marginTop: 10 }}>As worded in the source</div>
        <div className="a2-body-text">{country.worldBank.indicators}</div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#2D5043", fontWeight: 600 }}>Cite as: {country.worldBank.citation}</div>
          <SourceLinks value={country.worldBank.source} />
        </div>
      </Collapsible>
    </div>
  );
}

function EssayGuideTab({ scenario }) {
  const [a, b] = scenario.countries;
  const cleanName = scenario.company.name.replace(/\s*\([^)]*\)\s*$/, "");
  const templateSentence =
    `This report advises ${cleanName} on whether to expand into ${a.name} or ${b.name}. ` +
    `After comparing both countries, it recommends [your recommendation]. ` +
    `The report examines the relevant industry news, two economic indicators, one investment incentive and two World Bank Enterprise Survey indicators.`;

  return (
    <div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 21, fontWeight: 500, color: "#1F1B16", marginBottom: 10 }}>
        📝 Essay Guide
      </div>

      {RUBRIC_GUIDE.map((block, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1F1B16" }}>{block.title}</span>
            <span style={{ fontSize: 12, color: "#2D5043", fontWeight: 600 }}>{block.total} pts</span>
          </div>
          <div style={{ display: "grid", gap: 5 }}>
            {block.items.map(([label, pts], j) => (
              <div key={j} style={{
                display: "flex", justifyContent: "space-between", gap: 10,
                fontSize: 13, color: "#2A2520", lineHeight: 1.45,
                padding: "5px 9px", background: "#FDFAF2", border: "1px solid #EDE3CE", borderRadius: 6
              }}>
                <span>☐ {label}</span>
                <span style={{ color: "#7A6B2A", fontWeight: 600, whiteSpace: "nowrap" }}>{pts}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={kickerStyle}>Template opening sentence (Paragraph 1)</div>
      <div style={{
        fontSize: 13, color: "#1F1B16", lineHeight: 1.6, fontStyle: "italic",
        padding: "10px 12px", background: "#F4EEDC", border: "1px dashed #C9B98F", borderRadius: 8
      }}>
        "{templateSentence}"
      </div>

      <div style={kickerStyle}>Tips</div>
      <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
        {GUIDE_TIPS.map((t, i) => (
          <li key={i} style={{ fontSize: 13, color: "#2A2520", lineHeight: 1.5 }}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

function LanguageTab({ scenario }) {
  const [a, b] = scenario.countries;
  return (
    <div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 21, fontWeight: 500, color: "#1F1B16", marginBottom: 10 }}>
        🔤 Language
      </div>

      <div style={kickerStyle}>Connector word bank</div>
      <div style={{ display: "grid", gap: 8 }}>
        {Object.entries(CONNECTOR_GROUPS).map(([fn, words]) => (
          <div key={fn}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2D5043", marginBottom: 3 }}>{fn}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {words.map(w => (
                <span key={w} style={{
                  fontSize: 12, color: "#2A2520", background: "#FDFAF2",
                  border: "1px solid #E4D8BF", borderRadius: 999, padding: "3px 9px"
                }}>{w}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={kickerStyle}>APA citation guide — use these exact in-text citations</div>
      <div style={{ display: "grid", gap: 5 }}>
        {apaRows(scenario).map(([label, cites], i) => (
          <div key={i} style={{
            fontSize: 12.5, color: "#2A2520", lineHeight: 1.5,
            padding: "6px 9px", background: "#FDFAF2", border: "1px solid #EDE3CE", borderRadius: 6
          }}>
            <span style={{ color: "#6B5D54" }}>{label}:</span>{" "}
            <strong style={{ color: "#1F1B16" }}>{cites.join("  ·  ")}</strong>
          </div>
        ))}
        <div style={{ fontSize: 12, color: "#7A6B60", lineHeight: 1.5 }}>
          Put the citation in brackets straight after the fact, e.g. "…grew 6.6% per year {a.news[1] ? a.news[1].citation : "(IBISWorld, 2023)"}."
        </div>
      </div>

      <div style={kickerStyle}>Comparison phrases for Paragraph 2</div>
      <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 5 }}>
        {comparisonPhrases(a.name, b.name).map((p, i) => (
          <li key={i} style={{ fontSize: 13, color: "#2A2520", lineHeight: 1.5, fontStyle: "italic" }}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEEDBACK PIECES
// ─────────────────────────────────────────────────────────────────────────────
function IssueCard({ issue }) {
  return (
    <div style={{
      padding: "11px 13px 11px 15px",
      background: "#FDFAF2",
      border: "1px solid #EDE3CE",
      borderLeft: `3px solid ${CATEGORY_DOTS[issue.category] || "#6B5D54"}`,
      borderRadius: 8,
      marginBottom: 8
    }}>
      <div style={{
        fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em",
        color: CATEGORY_DOTS[issue.category] || "#6B5D54", fontWeight: 700, marginBottom: 4
      }}>
        <span style={{ marginRight: 6 }}>{CATEGORY_EMOJIS[issue.category] || "📝"}</span>
        {CATEGORY_LABELS[issue.category] || issue.category}
      </div>
      <div style={{ fontSize: 14, color: "#1F1B16", marginBottom: 4, lineHeight: 1.5 }}>{issue.what}</div>
      {issue.hint && (
        <div style={{ fontSize: 13, color: "#5A4D43", lineHeight: 1.5, fontStyle: "italic" }}>
          💡 Hint: {issue.hint}
        </div>
      )}
    </div>
  );
}

function ParaCheckCard({ state, paraNum }) {
  if (!state) return null;
  return (
    <div style={{
      padding: "12px 14px", marginBottom: 10, borderRadius: 8,
      background: "#EDF3FA", border: "1px solid #BCD3EC"
    }}>
      <div style={{
        fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em",
        color: "#2C5A87", fontWeight: 700, marginBottom: 6
      }}>
        🔎 Quick check · Paragraph {paraNum} · not an attempt
      </div>
      {state.loading && <div style={{ fontSize: 13, color: "#2C5A87" }}><span className="mit-spin blue" /> Reading your paragraph…</div>}
      {state.error && <div style={{ fontSize: 13, color: "#7A3818" }}>{state.error}</div>}
      {state.data && state.data.observations && (
        <div style={{ display: "grid", gap: 8 }}>
          {state.data.observations.map((o, i) => (
            <div key={i} style={{ fontSize: 13, color: "#1F2A36", lineHeight: 1.5 }}>
              <div>{o.what}</div>
              {o.hint && <div style={{ color: "#3A5266", fontStyle: "italic" }}>💡 {o.hint}</div>}
            </div>
          ))}
        </div>
      )}
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
  const [stage, setStage] = useState("welcome"); // welcome | scenario | work
  const [selectedScenarioId, setSelectedScenarioId] = useState("");
  const [activeTab, setActiveTab] = useState(1);

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");

  const [attempts, setAttempts] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionBest, setSessionBest] = useState(0);
  const [paraCheck, setParaCheck] = useState({ p1: null, p2: null, p3: null });
  const [checking, setChecking] = useState({ p1: false, p2: false, p3: false });

  const feedbackRef = useRef(null);

  const selectedScenario = SCENARIOS.find(s => s.id === selectedScenarioId);
  const attemptNumber = attempts.length + 1;

  const pVals = { p1, p2, p3 };
  const pSetters = { p1: setP1, p2: setP2, p3: setP3 };

  useEffect(() => {
    if (currentFeedback && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentFeedback]);

  const resetWork = () => {
    setP1(""); setP2(""); setP3("");
    setAttempts([]);
    setCurrentFeedback(null);
    setError(null);
    setSessionBest(0);
    setParaCheck({ p1: null, p2: null, p3: null });
    setActiveTab(1);
  };

  const handleSelectScenario = (id) => {
    setSelectedScenarioId(id);
    resetWork();
  };

  // ── API plumbing ──────────────────────────────────────────────────────────
  const rawGrade = async ({ system, userPrompt, maxTokens }) => {
    const response = await fetch("https://writing-app-logger.vercel.app/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userPrompt }]
      })
    });
    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${bodyText.slice(0, 200)}`);
    }
    const data = await response.json();
    const rawResp = (data.content || []).filter(b => b && b.type === "text").map(b => b.text).join("");
    if (!rawResp) throw new Error("Empty response from grader.");
    return rawResp;
  };

  const callGrader = async (userPrompt) => {
    const rawResp = await rawGrade({ system: SYSTEM_PROMPT, userPrompt, maxTokens: 2500 });
    let parsed;
    try {
      parsed = extractJson(rawResp);
    } catch (e) {
      throw new Error(`Grader returned invalid JSON.`);
    }
    if (!parsed.scores) throw new Error("Grader response is missing required fields.");
    return sanitizeFeedback(parsed);
  };

  const callParaCheck = async (userPrompt) => {
    const rawResp = await rawGrade({ system: PARA_CHECK_SYSTEM, userPrompt, maxTokens: 900 });
    let parsed;
    try {
      parsed = extractJson(rawResp);
    } catch (e) {
      throw new Error("Could not read the check. Please try again.");
    }
    const observations = Array.isArray(parsed.observations) ? parsed.observations : [];
    return {
      observations: observations.slice(0, 3).map(o => ({
        what: ensureEndPunct(o.what),
        hint: ensureEndPunct(o.hint)
      }))
    };
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCheckParagraph = async (para) => {
    const text = pVals[para.key].trim();
    if (!text || checking[para.key] || isLoading) return;
    if (countWords(text) < 15) {
      setParaCheck(s => ({ ...s, [para.key]: { error: "Write a few more sentences first, then I can give you a useful check." } }));
      return;
    }
    setChecking(s => ({ ...s, [para.key]: true }));
    setParaCheck(s => ({ ...s, [para.key]: { loading: true } }));
    try {
      const data = await callParaCheck(buildParaCheckPrompt(selectedScenario, para, text));
      setParaCheck(s => ({ ...s, [para.key]: { data } }));
    } catch (e) {
      setParaCheck(s => ({ ...s, [para.key]: { error: e.message || "Something went wrong. Please try again." } }));
    }
    setChecking(s => ({ ...s, [para.key]: false }));
  };

  const handleSubmit = async () => {
    if (!selectedScenario || isLoading) return;
    const t1 = p1.trim(), t2 = p2.trim(), t3 = p3.trim();

    const validationError = validateSubmission(t1, t2, t3);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    const userPrompt = buildUserPrompt(selectedScenario, t1, t2, t3, attemptNumber);

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
    } else {
      const msg = lastErr && lastErr.message ? lastErr.message : "unknown error";
      setError(`Sorry, something went wrong getting your feedback. Please try again in a moment. (${msg.slice(0, 120)})`);
    }
    setIsLoading(false);
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const cardStyle = {
    background: "#FFFFFF",
    border: "1px solid #E8E0D0",
    borderRadius: 14,
    padding: "22px 26px",
    marginBottom: 18
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

  const styleTag = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }

      .mit-textarea {
        width: 100%; padding: 13px 15px;
        border: 1.5px solid #DDD2BC; border-radius: 10px;
        font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15.5px; line-height: 1.55;
        color: #1F1B16; background: #FDFAF2; resize: vertical; outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .mit-textarea:focus { border-color: #2D5043; box-shadow: 0 0 0 3px rgba(45, 80, 67, 0.12); }
      .mit-textarea::placeholder { color: #A89B85; }
      .mit-textarea:disabled { opacity: 0.6; }

      .mit-select, .mit-input {
        width: 100%; padding: 11px 14px;
        border: 1.5px solid #DDD2BC; border-radius: 10px;
        font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px;
        color: #1F1B16; background: #FDFAF2; outline: none;
      }
      .mit-select { cursor: pointer; appearance: none; padding-right: 40px;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%236B5D54' d='M6 8L0 0h12z'/></svg>");
        background-repeat: no-repeat; background-position: right 16px center;
      }
      .mit-select:focus, .mit-input:focus { border-color: #2D5043; box-shadow: 0 0 0 3px rgba(45, 80, 67, 0.12); }

      .mit-btn {
        font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 600;
        padding: 12px 24px; border-radius: 10px; cursor: pointer;
        transition: transform 0.08s ease, background 0.15s ease, opacity 0.15s ease;
        border: none; letter-spacing: 0.01em;
      }
      .mit-btn:active:not(:disabled) { transform: translateY(1px); }
      .mit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      .mit-btn-primary { background: #2D5043; color: #FAF6ED; }
      .mit-btn-primary:hover:not(:disabled) { background: #234037; }
      .mit-btn-secondary { background: transparent; color: #2D5043; border: 1.5px solid #2D5043; }
      .mit-btn-secondary:hover:not(:disabled) { background: rgba(45, 80, 67, 0.06); }
      .mit-btn-sm { font-size: 13px; padding: 7px 14px; border-radius: 8px; }

      .a2-link { color: #2D5043; text-decoration: underline; }
      .a2-link:hover { color: #234037; }

      .a2-body-text { font-size: 13.5px; line-height: 1.6; color: #2A2520; }

      .a2-panels { display: flex; gap: 22px; align-items: flex-start; }
      .a2-left {
        flex: 0 0 40%; position: sticky; top: 16px; align-self: flex-start;
        max-height: calc(100vh - 32px); overflow-y: auto;
        background: #FFFFFF; border: 1px solid #E8E0D0; border-radius: 14px;
      }
      .a2-right { flex: 1 1 60%; min-width: 0; }

      .a2-tabbar { display: flex; flex-wrap: wrap; gap: 2px; padding: 8px 8px 0; position: sticky; top: 0; background: #FFFFFF; border-bottom: 1px solid #E8E0D0; z-index: 2; }
      .a2-tab {
        font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12.5px; font-weight: 600;
        padding: 8px 11px; border: none; border-radius: 8px 8px 0 0; cursor: pointer;
        background: transparent; color: #6B5D54; white-space: nowrap;
      }
      .a2-tab:hover { background: #F4EEDC; }
      .a2-tab.active { background: #2D5043; color: #FAF6ED; }
      .a2-tabpanel { padding: 18px 20px 26px; }

      .a2-collapse { border: 1px solid #EDE3CE; border-radius: 9px; margin-bottom: 8px; overflow: hidden; background: #FFFFFF; }
      .a2-collapse-head {
        width: 100%; text-align: left; background: #FBF6EA; border: none; cursor: pointer;
        font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; color: #1F1B16;
        padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 10px;
      }
      .a2-collapse-head:hover { background: #F4EEDC; }
      .a2-collapse-icon { color: #2D5043; font-weight: 700; font-size: 15px; flex-shrink: 0; }
      .a2-collapse-body { padding: 12px; border-top: 1px solid #EDE3CE; }

      .a2-doc-card { background: #FDFAF2; border: 1px solid #EDE3CE; border-radius: 10px; padding: 16px 18px; }

      .a2-scard {
        flex: 1 1 260px; text-align: left; cursor: pointer;
        background: #FFFFFF; border: 2px solid #E8E0D0; border-radius: 14px; padding: 20px;
        transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .a2-scard:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); transform: translateY(-2px); }
      .a2-scard.selected { border-color: #2D5043; box-shadow: 0 0 0 3px rgba(45,80,67,0.14); }

      .a2-badge {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 11.5px; font-weight: 600; padding: 3px 8px; border-radius: 999px;
        border: 1px solid #DDD2BC; color: #6B5D54; background: #FDFAF2;
      }

      .mit-spin {
        display: inline-block; width: 13px; height: 13px;
        border: 2px solid rgba(250, 246, 237, 0.4); border-top-color: #FAF6ED;
        border-radius: 50%; animation: mit-spin 0.7s linear infinite; margin-right: 7px; vertical-align: -2px;
      }
      .mit-spin.blue { border: 2px solid rgba(44,90,135,0.25); border-top-color: #2C5A87; }
      @keyframes mit-spin { to { transform: rotate(360deg); } }

      .mit-fade-in { animation: mit-fade-in 0.4s ease both; }
      @keyframes mit-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

      @media (max-width: 900px) {
        .a2-panels { flex-direction: column; }
        .a2-left { position: static; flex-basis: auto; width: 100%; max-height: none; }
        .a2-right { width: 100%; }
      }
    `}</style>
  );

  // ── WELCOME ───────────────────────────────────────────────────────────────
  if (stage === "welcome") {
    const ready = firstName.trim() && surname.trim() && teacher;
    return (
      <div style={pageWrap}>
        {styleTag}
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <TopBar onBack={onBack} />
          <Title />
          <section style={cardStyle} className="mit-fade-in">
            <h2 style={welcomeH}>👋 Welcome! Please introduce yourself.</h2>
            <p style={{ fontSize: 14, color: "#5A4D43", marginBottom: 18, lineHeight: 1.6 }}>
              Fill in all three fields to begin.
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>First name</label>
                <input className="mit-input" placeholder="e.g. Yuval" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>Surname</label>
                <input className="mit-input" placeholder="e.g. Cohen" value={surname} onChange={e => setSurname(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>My teacher is</label>
              <select className="mit-select" value={teacher} onChange={e => setTeacher(e.target.value)}>
                <option value="">Select your teacher…</option>
                {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ textAlign: "right" }}>
              <button className="mit-btn mit-btn-primary" disabled={!ready} onClick={() => setStage("scenario")}>
                Start ➜
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ── SCENARIO SELECTION ────────────────────────────────────────────────────
  if (stage === "scenario") {
    return (
      <div style={pageWrap}>
        {styleTag}
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <TopBar onBack={onBack} student={`${firstName} ${surname}`} teacher={teacher} />
          <Title />
          <section style={cardStyle} className="mit-fade-in">
            <h2 style={welcomeH}>🗂️ Choose your scenario</h2>
            <p style={{ fontSize: 13.5, color: "#5A4D43", marginBottom: 16, lineHeight: 1.55 }}>
              Each scenario is one Israeli company and two possible countries. You will only see the source
              documents for the scenario you choose. Select one to continue.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {SCENARIOS.map(s => {
                const [a, b] = s.countries;
                const selected = s.id === selectedScenarioId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`a2-scard${selected ? " selected" : ""}`}
                    onClick={() => handleSelectScenario(s.id)}
                  >
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 500, color: "#1F1B16" }}>
                      {s.logo} {s.company.name.replace(/\s*\([^)]*\)\s*$/, "")}
                    </div>
                    <div style={{ fontSize: 22, margin: "10px 0", letterSpacing: "0.06em" }}>
                      {a.flag} <span style={{ fontSize: 13, color: "#8A7B6A", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>vs</span> {b.flag}
                    </div>
                    <div style={{ fontSize: 13, color: "#6B5D54", lineHeight: 1.5 }}>{s.sector}</div>
                    <div style={{ fontSize: 12, color: "#7A6B60", marginTop: 8 }}>{a.name} vs {b.name}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button
                className="mit-btn mit-btn-primary"
                disabled={!selectedScenario}
                onClick={() => setStage("work")}
              >
                Start writing ➜
              </button>
            </div>
            {!selectedScenario && (
              <div style={{ marginTop: 10, fontSize: 13, color: "#8A6F30", fontStyle: "italic", textAlign: "right" }}>
                Please select a scenario to continue.
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ── WORK — TWO PANEL ──────────────────────────────────────────────────────
  const [countryA, countryB] = selectedScenario.countries;
  const cleanCompany = selectedScenario.company.name.replace(/\s*\([^)]*\)\s*$/, "");
  const tabs = [
    { n: 1, label: "🏢 Company" },
    { n: 2, label: `${countryA.flag} ${countryA.name}` },
    { n: 3, label: `${countryB.flag} ${countryB.name}` },
    { n: 4, label: "📝 Essay Guide" },
    { n: 5, label: "🔤 Language" }
  ];

  const strengths = currentFeedback ? deriveStrengths(currentFeedback) : [];
  const generalIssues = currentFeedback
    ? currentFeedback.issues.filter(i => !PARA_CATEGORIES.includes(i.category))
    : [];
  const issuesFor = (cat) =>
    currentFeedback ? currentFeedback.issues.filter(i => i.category === cat) : [];

  return (
    <div style={pageWrap}>
      {styleTag}
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>
        <TopBar
          onBack={onBack}
          student={`${firstName} ${surname}`}
          teacher={teacher}
          onChangeScenario={() => { setStage("scenario"); }}
        />

        <div className="a2-panels">
          {/* LEFT PANEL */}
          <div className="a2-left">
            <div className="a2-tabbar">
              {tabs.map(t => (
                <button
                  key={t.n}
                  className={`a2-tab${activeTab === t.n ? " active" : ""}`}
                  onClick={() => setActiveTab(t.n)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="a2-tabpanel">
              {activeTab === 1 && <CompanyTab scenario={selectedScenario} />}
              {activeTab === 2 && <CountryTab country={countryA} company={selectedScenario.company} />}
              {activeTab === 3 && <CountryTab country={countryB} company={selectedScenario.company} />}
              {activeTab === 4 && <EssayGuideTab scenario={selectedScenario} />}
              {activeTab === 5 && <LanguageTab scenario={selectedScenario} />}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="a2-right">
            {/* header */}
            <div style={{ ...cardStyle, padding: "16px 20px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500, color: "#1F1B16" }}>
                  ✍️ Your report
                </div>
                <div style={{ fontSize: 12.5, color: "#6B5D54" }}>
                  {attempts.length === 0
                    ? "Attempt 1 (not submitted yet)"
                    : `${attempts.length} attempt${attempts.length > 1 ? "s" : ""} · best ${sessionBest}/100 · next is attempt ${attemptNumber}`}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#5A4D43", marginTop: 6 }}>
                {selectedScenario.logo} <strong style={{ color: "#1F1B16" }}>{cleanCompany}</strong> — {countryA.flag} {countryA.name} vs {countryB.flag} {countryB.name}
              </div>
            </div>

            {/* FEEDBACK SUMMARY */}
            {currentFeedback && (
              <section ref={feedbackRef} style={{ ...cardStyle, borderColor: "#D4C7A8" }} className="mit-fade-in">
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
                  <ScoreRing score={currentFeedback.totalScore} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: "#1F1B16", lineHeight: 1.45 }}>
                      {currentFeedback.encouragement}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#6B5D54", marginTop: 4 }}>
                      Attempt {attempts.length}. Best so far: {sessionBest}/100.
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  {Object.keys(CATEGORY_MAX).map(key => (
                    <CategoryBar key={key} label={CATEGORY_LABELS[key]} score={currentFeedback.scores[key] || 0} max={CATEGORY_MAX[key]} />
                  ))}
                </div>

                {strengths.length > 0 && (
                  <div style={{
                    padding: "12px 14px", background: "#E8EFE9", border: "1px solid #B5C9B8",
                    borderRadius: 10, marginBottom: 14
                  }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "#2D5043", fontWeight: 700, marginBottom: 6 }}>
                      ✅ Strengths
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
                      {strengths.map((s, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#1F1B16", lineHeight: 1.5 }}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentFeedback.voiceConcern && (
                  <div style={{
                    padding: "13px 15px", background: "#FBF1E5", border: "1px solid #E8C9A8",
                    borderRadius: 10, marginBottom: 14
                  }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "#7A3818", fontWeight: 700, marginBottom: 6 }}>
                      🗣️ A quick check
                    </div>
                    <div style={{ fontSize: 13.5, color: "#5A4D43", lineHeight: 1.55 }}>
                      {currentFeedback.voiceConcern} Please try rephrasing that part in your own simpler words, then submit again.
                    </div>
                  </div>
                )}

                {generalIssues.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "#6B5D54", fontWeight: 700, marginBottom: 8 }}>
                      🔍 Whole-report notes
                    </div>
                    {generalIssues.map((issue, i) => <IssueCard key={i} issue={issue} />)}
                  </div>
                )}

                {currentFeedback.sampleEssay && (
                  <div style={{
                    padding: "13px 15px", background: "#EEF3EE", border: "1px solid #B5C9B8",
                    borderRadius: 10, marginBottom: 14
                  }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "#2D5043", fontWeight: 700, marginBottom: 8 }}>
                      ✨ One way to write this report
                    </div>
                    {String(currentFeedback.sampleEssay).split(/\n\s*\n/).map((para, i) => (
                      <p key={i} style={{ fontSize: 13.5, color: "#1F1B16", lineHeight: 1.65, fontStyle: "italic", margin: "0 0 10px" }}>
                        <strong style={{ fontStyle: "normal", color: "#2D5043" }}>Paragraph {i + 1}. </strong>{para}
                      </p>
                    ))}
                    <div style={{ fontSize: 12, color: "#5A4D43" }}>This is one example. There are many other good ways to write it.</div>
                  </div>
                )}

                <RetryNudge feedback={currentFeedback} />
              </section>
            )}

            {/* CONNECTORS REMINDER */}
            <div style={{ marginBottom: 14 }}>
              <Collapsible title="🔗 Connectors reminder — use 2+ per paragraph">
                <div style={{ fontSize: 13, color: "#2A2520", lineHeight: 1.7 }}>
                  <em>{CONNECTOR_HINTS}</em>
                </div>
                <div style={{ fontSize: 12, color: "#7A6B60", marginTop: 6 }}>
                  Grouped by function on the <strong>Language</strong> tab.
                </div>
              </Collapsible>
            </div>

            {/* PARAGRAPHS */}
            {PARAGRAPHS.map(para => {
              const val = pVals[para.key];
              const wc = countWords(val);
              const col = wcColor(wc, para.lo, para.hi);
              const conn = countConnectors(val);
              const cites = countCitations(val);
              const paraIssues = issuesFor(para.category);
              return (
                <section key={para.key} style={cardStyle}>
                  {/* issue cards ABOVE the textarea */}
                  {paraIssues.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      {paraIssues.map((issue, i) => <IssueCard key={i} issue={issue} />)}
                    </div>
                  )}
                  {/* incremental check card ABOVE the textarea */}
                  <ParaCheckCard state={paraCheck[para.key]} paraNum={para.num} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: "#1F1B16" }}>
                      Paragraph {para.num} — {para.title} ({para.pts} pts)
                    </div>
                    <span style={{ fontSize: 12.5, color: col, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {wc} words · aim {para.lo}–{para.hi}
                    </span>
                  </div>

                  <ul style={{ margin: "8px 0 10px", paddingLeft: 18, display: "grid", gap: 3 }}>
                    {para.reminders.map((r, i) => (
                      <li key={i} style={{ fontSize: 12.5, color: "#5A4D43", lineHeight: 1.45 }}>{r}</li>
                    ))}
                  </ul>

                  <textarea
                    className="mit-textarea"
                    style={{ minHeight: para.key === "p2" ? 230 : 130 }}
                    value={val}
                    onChange={(e) => { pSetters[para.key](e.target.value); if (error) setError(null); }}
                    placeholder={`Write paragraph ${para.num} here…`}
                    disabled={isLoading}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className="a2-badge">🔗 {conn} connector{conn === 1 ? "" : "s"}</span>
                      <span className="a2-badge">📚 {cites} citation{cites === 1 ? "" : "s"}</span>
                    </div>
                    <button
                      className="mit-btn mit-btn-secondary mit-btn-sm"
                      onClick={() => handleCheckParagraph(para)}
                      disabled={checking[para.key] || isLoading || !val.trim()}
                    >
                      {checking[para.key] ? "Checking…" : "Check this paragraph"}
                    </button>
                  </div>
                </section>
              );
            })}

            {/* SUBMIT */}
            <section style={{ ...cardStyle, textAlign: "center" }}>
              <button
                className="mit-btn mit-btn-primary"
                style={{ fontSize: 16, padding: "14px 32px" }}
                onClick={handleSubmit}
                disabled={isLoading || !(p1.trim() && p2.trim() && p3.trim())}
              >
                {isLoading && <span className="mit-spin" />}
                {isLoading ? "Grading all three paragraphs…" : `Submit for grading (attempt ${attemptNumber})`}
              </button>
              <div style={{ fontSize: 12, color: "#7A6B60", marginTop: 8 }}>
                This grades all three paragraphs together and counts as an official attempt.
              </div>
              {error && (
                <div style={{
                  marginTop: 12, padding: "10px 14px", background: "#F8E5DC",
                  border: "1px solid #E0B8A0", borderRadius: 8, fontSize: 13.5, color: "#7A3818", textAlign: "left"
                }}>
                  {error}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const pageWrap = {
  minHeight: "100vh",
  background: "#FAF6ED",
  padding: "28px 20px 60px",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  color: "#1F1B16"
};

const welcomeH = {
  fontFamily: "'Fraunces', serif",
  fontSize: 21,
  fontWeight: 500,
  color: "#1F1B16",
  margin: "0 0 12px 0"
};

function TopBar({ onBack, student, teacher, onChangeScenario }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14, paddingLeft: 4 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6B5D54", padding: 0 }}>
            ← Back to menu
          </button>
        )}
        {student && student.trim() && (
          <span style={{ fontSize: 13, color: "#6B5D54" }}>
            👤 <strong style={{ color: "#1F1B16" }}>{student}</strong>
            {teacher && <> · 📚 <strong style={{ color: "#1F1B16" }}>{teacher}</strong></>}
          </span>
        )}
      </div>
      {onChangeScenario && (
        <button className="mit-btn mit-btn-secondary mit-btn-sm" onClick={onChangeScenario}>
          Change scenario
        </button>
      )}
    </div>
  );
}

function Title() {
  return (
    <header style={{ marginBottom: 20, paddingLeft: 4 }}>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 500, margin: 0, letterSpacing: "-0.02em", color: "#1F1B16" }}>
        Business Expansion Report
      </h1>
      <p style={{ fontSize: 14.5, color: "#6B5D54", margin: "6px 0 0 0", lineHeight: 1.5, maxWidth: 620 }}>
        Advanced 2 Economics. You are a consultant at an international firm. Read the reference panel, write a
        three-paragraph report recommending one country, check each paragraph as you go, then submit for grading.
      </p>
    </header>
  );
}

function RetryNudge({ feedback }) {
  const score = feedback.totalScore;
  let headline, body;
  if (score >= 90) {
    headline = "🎉 Excellent work — this is a strong report.";
    body = "You can stop here, or try another version to push it even higher.";
  } else if (score >= 70) {
    headline = "So close! One more pass.";
    body = "Read the hints above each paragraph, edit in place, then submit again.";
  } else if (score >= 50) {
    headline = `Good progress! Focus on ${weakestCategoryLabel(feedback)}.`;
    body = "Work through the hints one by one, check each paragraph, then submit again.";
  } else {
    headline = "Keep going! Read the Essay Guide tab and try again.";
    body = "Open the Essay Guide and Language tabs on the left, rebuild the weak paragraphs, then submit again.";
  }
  return (
    <div style={{ padding: "13px 15px", background: "#F4EEDC", border: "1px solid #D4C7A8", borderRadius: 10 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 500, color: "#1F1B16", lineHeight: 1.4, marginBottom: 4 }}>
        {headline}
      </div>
      <div style={{ fontSize: 13, color: "#5A4D43", lineHeight: 1.55 }}>{body}</div>
      <div style={{ fontSize: 12.5, color: "#7A6B60", marginTop: 6 }}>
        Your paragraphs stay exactly as you left them — edit and submit as many times as you like.
      </div>
    </div>
  );
}
