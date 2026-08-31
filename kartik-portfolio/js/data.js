/* ============================================================
   CANDIDATE PROFILE — single source of truth.
   The website AND the AI chat both read from this object.
   Edit this file to update your portfolio (no other code changes).
   Equivalent to the Step-1 candidate.json (+ Pydantic on backend).
   ============================================================ */
const CANDIDATE = {
  name: "Kartik Bhatia",
  title: "Aspiring Computer Engineer | AI/ML Enthusiast",
  tagline: "Building intelligent systems with Python, NLP and a lot of curiosity.",
  location: "Haryana, India",
  email: "KB584425@gmail.com",
  phone: "+91 98733 80528",
  // Add your CGPA here whenever you want it shown, e.g. "8.2 CGPA":
  cgpa: null,

  socials: {
    linkedin: "https://www.linkedin.com/in/kartik-bhatia-00819532b",
    github: "https://github.com/KB1801",
  },

  summary: [
    "Motivated and detail-oriented aspiring Computer Engineer with a strong academic foundation and hands-on exposure to Python development, NLP-based applications, AI assistants, web technologies, problem solving and software development fundamentals.",
    "Skilled in building academic projects involving Natural Language Processing, automation, speech-based systems and modular programming.",
    "Seeking opportunities as a Software Engineer Intern, Python Developer Intern, Web Developer Intern or AI/ML Intern to apply technical knowledge in real-world development environments."
  ],

  roles: ["AI/ML Enthusiast", "Python Developer", "NLP Builder", "Web Developer", "Problem Solver", "Lifelong Learner"],

  skills: [
    { icon: "🐍", category: "Programming Languages", level: 80, items: ["Python", "Java"] },
    { icon: "🌐", category: "Web Technologies", level: 72, items: ["HTML", "CSS", "JavaScript"] },
    { icon: "🧠", category: "AI / ML", level: 75, items: ["Artificial Intelligence", "Machine Learning Fundamentals", "NLP Basics", "Deep Learning Fundamentals"] },
    { icon: "⚙️", category: "Core Concepts", level: 78, items: ["Data Structures & Algorithms", "OOP", "Problem Solving", "Competitive Programming"] },
    { icon: "🗄️", category: "Databases", level: 60, items: ["Basic SQL", "Database Design & Management"] },
    { icon: "🛠️", category: "Tools & Platforms", level: 78, items: ["Git", "GitHub", "VS Code", "MS Office", "Google Workspace"] }
  ],

  softSkills: ["Communication", "Critical Thinking", "Logical Reasoning", "Leadership", "Video Editing", "Web Development"],

  interests: [
    "Software Development", "Artificial Intelligence & Machine Learning", "Data Structures & Algorithms",
    "Web Development", "Database Design & Management", "Open-Source Technologies",
    "Problem Solving", "Competitive Programming", "Technology Blogs",
    "Emerging Technologies", "Music", "Sports", "Reading"
  ],

  projects: [
    {
      name: "AI Chatbot using NLP",
      badge: "Natural Language Processing",
      points: [
        "Developed a Python-based AI chatbot to process user queries and generate contextual responses using Natural Language Processing techniques.",
        "Applied tokenization, lemmatization, stop-word removal, intent classification and response optimization to improve conversational accuracy.",
        "Maintained a modular and scalable code structure throughout."
      ],
      tech: ["Python", "NLTK", "spaCy", "scikit-learn", "NLP"],
      repo: "https://github.com/KB1801/AI-CHATBOT-WITH-NLP"
    },
    {
      name: "Jarvis AI Assistant",
      badge: "Voice Automation",
      points: [
        "Built a voice-controlled AI assistant in Python for system automation and web-based task execution.",
        "Implemented speech-to-text, text-to-speech, command recognition and intent handling for interactive task management.",
        "Improved usability through error handling, fallback responses, offline functionality and modular programming logic."
      ],
      tech: ["Python", "Speech-to-Text", "Text-to-Speech", "Automation"],
      repo: "https://github.com/KB1801/Jarvis-Virtual-Assistant-18"
    }
  ],

  education: [
    {
      period: "2023 – 2027",
      institution: "Lingaya's Vidyapeeth, Faridabad",
      degree: "Bachelor of Technology — Computer Engineering",
      detail: "Building strong foundations in software engineering, AI/ML, data structures and web technologies."
    },
    {
      period: "Completed 2023",
      institution: "Eicher School, Faridabad",
      degree: "Senior Secondary — CBSE Board",
      detail: "Science stream with a focus on Mathematics and Computer Science."
    }
  ],

  certifications: [
    { icon: "🤖", title: "Generative AI: Working with Large Language Models", issuer: "LinkedIn Learning" },
    { icon: "📊", title: "TensorFlow: Practical Skills in Constructing, Training, and Optimizing Models", issuer: "LinkedIn Learning" },
    { icon: "🔥", title: "PyTorch Essential Training: Deep Learning", issuer: "LinkedIn Learning" },
    { icon: "🧪", title: "Building Deep Learning Applications with Keras", issuer: "LinkedIn Learning" },
    { icon: "🎓", title: "Deep Learning: Getting Started", issuer: "LinkedIn Learning" },
    { icon: "🔐", title: "Introduction to Cybersecurity", issuer: "LinkedIn Learning" }
  ],

  // Normalized keyword map used by the offline JD-matcher + offline chat.
  skillKeywords: [
    "python", "java", "html", "css", "javascript", "sql", "git", "github",
    "nlp", "natural language processing", "machine learning", "ml", "deep learning",
    "artificial intelligence", "ai", "keras", "tensorflow", "pytorch", "llm",
    "generative ai", "data structures", "algorithms", "oop", "cybersecurity",
    "scikit-learn", "nltk", "spacy", "speech", "automation", "vs code"
  ]
};
