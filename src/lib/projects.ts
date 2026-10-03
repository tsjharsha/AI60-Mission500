export type ProjectPreview = {
  id: string;
  name: string;
  label: string;
  description: string;
  skills: string[];
  role: "BUILDER" | "SOLVER" | "SHIPPER";
  input: string;
  output: string;
  scope: string;
  limitation: string;
  prerequisites: string;
  takeaway: string;
};

export const PROJECTS: ProjectPreview[] = [
  {
    id: "sql",
    name: "AI SQL Debugging Copilot",
    label: "01 / SOFTWARE",
    description: "Turn a broken query into a correction you can explain.",
    skills: ["SQL", "Python"],
    role: "BUILDER",
    input:
      "SELECT name FROM students\nWHERE branch = CSE;\n\nSchema: students(name TEXT, branch TEXT)",
    output:
      "SELECT name FROM students\nWHERE branch = 'CSE';\n\nCSE is a text value. Wrap it in single quotes, then test the query against the supplied schema.",
    scope:
      "A guided interface that sends a sample query and schema to an LLM, shows its suggestion, and tests three prepared examples.",
    limitation:
      "Suggestions can be wrong. Never execute generated SQL against a production database. This is a learning prototype.",
    prerequisites:
      "Basic SQL. Starter code and a sample schema are provided in the build plan.",
    takeaway:
      "A small query helper, three test cases, and a README explaining what it gets wrong.",
  },
  {
    id: "data",
    name: "AI Dataset Insight Generator",
    label: "02 / DATA",
    description: "Turn a small dataset into a grounded, readable summary.",
    skills: ["Python"],
    role: "SOLVER",
    input: "week,signups\n1,40\n2,50\n3,70",
    output:
      "Signups increased from 40 to 70 (+75%).\nLargest absolute increase: week 2 → 3 (+20).\nThese rows show a trend, not its cause.",
    scope:
      "Compute summary statistics in Python and ask an LLM to explain those computed values. Use a small prepared CSV.",
    limitation:
      "Three rows cannot establish causality or a reliable forecast. Verify every numeric claim against the computed statistics.",
    prerequisites:
      "Basic Python. A prepared CSV and notebook scaffold are included in the plan.",
    takeaway:
      "A notebook, a checked summary, and an explanation of the evidence behind each claim.",
  },
  {
    id: "feedback",
    name: "AI User Feedback Synthesizer",
    label: "03 / PRODUCT",
    description: "Turn scattered feedback into a small, traceable roadmap.",
    skills: ["JavaScript"],
    role: "SHIPPER",
    input:
      "A: Login takes too long.\nB: I cannot reset my password.\nC: Please add dark mode.",
    output:
      "Theme: access friction [A, B]\nFirst experiment: simplify password recovery.\nSecondary request: appearance [C]\nPriority is a hypothesis to validate with users.",
    scope:
      "Group ten prepared comments, keep source IDs, and present a suggested next experiment in a starter interface.",
    limitation:
      "A suggested priority is not a validated roadmap. Preserve the source comments and review the grouping.",
    prerequisites:
      "Basic JavaScript or willingness to use the supplied scaffold.",
    takeaway:
      "A feedback board, traceable themes, and a short experiment proposal.",
  },
];

export const getProject = (id?: string | null) =>
  PROJECTS.find((p) => p.id === id) ?? PROJECTS[0];
export const getProjectByName = (name?: string) =>
  PROJECTS.find((p) => p.name === name) ?? PROJECTS[0];
export const BUILD_STEPS = [
  {
    time: "00–10",
    title: "Set up",
    detail:
      "Open the scaffold, inspect sample data, and define one useful output.",
  },
  {
    time: "10–30",
    title: "Build",
    detail: "Connect input, prompt, model response, and a simple interface.",
  },
  {
    time: "30–45",
    title: "Check",
    detail: "Try three examples. Save one failure and explain its limitation.",
  },
  {
    time: "45–60",
    title: "Demo",
    detail:
      "Record the output and write a README: purpose, evidence, limitations.",
  },
];
