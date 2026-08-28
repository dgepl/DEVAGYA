/**
 * Comprehensive CBSE & NCERT K-12 Curriculum Catalog
 * Maps each class to its official subjects and each subject to its authentic CBSE/NCERT chapters.
 */

export interface ClassCurriculum {
  subjects: {
    [subjectName: string]: string[];
  };
}

export const CBSE_NCERT_CURRICULUM: Record<string, ClassCurriculum> = {
  "Class 6": {
    subjects: {
      "Mathematics": [
        "Chapter 1: Knowing Our Numbers",
        "Chapter 2: Whole Numbers",
        "Chapter 3: Playing With Numbers",
        "Chapter 4: Basic Geometrical Ideas",
        "Chapter 5: Understanding Elementary Shapes",
        "Chapter 6: Integers",
        "Chapter 7: Fractions",
        "Chapter 8: Decimals",
        "Chapter 9: Data Handling",
        "Chapter 10: Mensuration",
        "Chapter 11: Algebra",
        "Chapter 12: Ratio and Proportion",
        "Full Syllabus / Mixed Chapters"
      ],
      "Science": [
        "Chapter 1: Components of Food",
        "Chapter 2: Sorting Materials into Groups",
        "Chapter 3: Separation of Substances",
        "Chapter 4: Getting to Know Plants",
        "Chapter 5: Body Movements",
        "Chapter 6: The Living Organisms — Characteristics & Habitats",
        "Chapter 7: Motion and Measurement of Distances",
        "Chapter 8: Light, Shadows and Reflections",
        "Chapter 9: Electricity and Circuits",
        "Chapter 10: Fun with Magnets",
        "Chapter 11: Air Around Us",
        "Full Syllabus / Mixed Chapters"
      ],
      "Social Science": [
        "History Ch 1: What, Where, How and When?",
        "History Ch 2: From Hunting–Gathering to Growing Food",
        "History Ch 3: In the Earliest Cities",
        "History Ch 4: What Books and Burials Tell Us",
        "History Ch 5: Kingdoms, Kings and an Early Republic",
        "History Ch 6: New Questions and Ideas",
        "History Ch 7: Ashoka, The Emperor Who Gave Up War",
        "Geography Ch 1: The Earth in the Solar System",
        "Geography Ch 2: Globe: Latitudes and Longitudes",
        "Geography Ch 3: Motions of the Earth",
        "Geography Ch 4: Maps",
        "Geography Ch 5: Major Domains of the Earth",
        "Civics Ch 1: Understanding Diversity",
        "Civics Ch 2: Diversity and Discrimination",
        "Civics Ch 3: What is Government?",
        "Civics Ch 4: Panchayati Raj",
        "Civics Ch 5: Rural Administration",
        "Full Syllabus / Mixed Chapters"
      ],
      "English": [
        "Honeysuckle: Who Did Patrick's Homework?",
        "Honeysuckle: How the Dog Found Himself a New Master!",
        "Honeysuckle: Taro's Reward",
        "Honeysuckle: An Indian – American Woman in Space: Kalpana Chawla",
        "Honeysuckle: A Different Kind of School",
        "Honeysuckle: Who I Am",
        "Honeysuckle: Fair Play",
        "Grammar: Nouns, Pronouns, Verbs, Tenses & Prepositions",
        "Writing: Notice Writing, Paragraph Writing, Informal Letter",
        "Reading: Unseen Reading Comprehension Passages",
        "Full Syllabus / Mixed Chapters"
      ],
      "Hindi (हिंदी)": [
        "वसंत: वह चिड़िया जो",
        "वसंत: बचपन",
        "वसंत: नादान दोस्त",
        "वसंत: चाँद से थोड़ी सी गप्पें",
        "वसंत: साथी हाथ बढ़ाना",
        "वसंत: ऐसे-ऐसे",
        "वसंत: टिकट अलबम",
        "वसंत: झाँसी की रानी",
        "व्याकरण: संज्ञा, सर्वनाम, विशेषण, क्रिया एवं अपठित गद्यांश",
        "Full Syllabus / Mixed Chapters"
      ],
      "Sanskrit (संस्कृतम्)": [
        "रुचिरा: शब्दपरिचयः I",
        "रुचिरा: शब्दपरिचयः II",
        "रुचिरा: शब्दपरिचयः III",
        "रुचिरा: विद्यालयः",
        "रुचिरा: वृक्षाः",
        "रुचिरा: बकस्य प्रतीकारः",
        "Full Syllabus / Mixed Chapters"
      ]
    }
  },

  "Class 7": {
    subjects: {
      "Mathematics": [
        "Chapter 1: Integers",
        "Chapter 2: Fractions and Decimals",
        "Chapter 3: Data Handling",
        "Chapter 4: Simple Equations",
        "Chapter 5: Lines and Angles",
        "Chapter 6: The Triangle and Its Properties",
        "Chapter 7: Comparing Quantities",
        "Chapter 8: Rational Numbers",
        "Chapter 9: Perimeter and Area",
        "Chapter 10: Algebraic Expressions",
        "Chapter 11: Exponents and Powers",
        "Chapter 12: Symmetry & Visualising Solid Shapes",
        "Full Syllabus / Mixed Chapters"
      ],
      "Science": [
        "Chapter 1: Nutrition in Plants",
        "Chapter 2: Nutrition in Animals",
        "Chapter 3: Heat",
        "Chapter 4: Acids, Bases and Salts",
        "Chapter 5: Physical and Chemical Changes",
        "Chapter 6: Respiration in Organisms",
        "Chapter 7: Transportation in Animals and Plants",
        "Chapter 8: Reproduction in Plants",
        "Chapter 9: Motion and Time",
        "Chapter 10: Electric Current and Its Effects",
        "Chapter 11: Light",
        "Chapter 12: Forests: Our Lifeline",
        "Chapter 13: Wastewater Story",
        "Full Syllabus / Mixed Chapters"
      ],
      "Social Science": [
        "History Ch 1: Tracing Changes Through a Thousand Years",
        "History Ch 2: New Kings and Kingdoms",
        "History Ch 3: The Delhi Sultans",
        "History Ch 4: The Mughal Empire",
        "History Ch 5: Rulers and Buildings",
        "History Ch 6: Devotional Paths to the Divine",
        "Geography Ch 1: Environment",
        "Geography Ch 2: Inside Our Earth",
        "Geography Ch 3: Our Changing Earth",
        "Geography Ch 4: Air",
        "Geography Ch 5: Water",
        "Civics Ch 1: On Equality",
        "Civics Ch 2: Role of the Government in Health",
        "Civics Ch 3: How the State Government Works",
        "Civics Ch 4: Growing up as Boys and Girls",
        "Civics Ch 5: Women Change the World",
        "Full Syllabus / Mixed Chapters"
      ],
      "English": [
        "Honeycomb: Three Questions",
        "Honeycomb: A Gift of Chappals",
        "Honeycomb: Gopal and the Hilsa Fish",
        "Honeycomb: The Ashes That Made Trees Bloom",
        "Honeycomb: Quality",
        "Honeycomb: Expert Detectives",
        "Honeycomb: The Invention of Vita-Wonk",
        "Grammar: Tenses, Active & Passive Voice, Modals",
        "Writing: Formal & Informal Letters, Story Writing",
        "Reading: Reading Comprehension Passages",
        "Full Syllabus / Mixed Chapters"
      ],
      "Hindi (हिंदी)": [
        "वसंत: हम पंछी उन्मुक्त गगन के",
        "वसंत: हिमालय की बेटियाँ",
        "वसंत: कठपुतली",
        "वसंत: मिठाईवाला",
        "वसंत: पापा खो गए",
        "वसंत: शाम-एक किसान",
        "वसंत: अपूर्व अनुभव",
        "व्याकरण: संधि, समास, मुहावरे, पर्यायवाची, विलोम शब्द",
        "Full Syllabus / Mixed Chapters"
      ]
    }
  },

  "Class 8": {
    subjects: {
      "Mathematics": [
        "Chapter 1: Rational Numbers",
        "Chapter 2: Linear Equations in One Variable",
        "Chapter 3: Understanding Quadrilaterals",
        "Chapter 4: Data Handling",
        "Chapter 5: Squares and Square Roots",
        "Chapter 6: Cubes and Cube Roots",
        "Chapter 7: Comparing Quantities",
        "Chapter 8: Algebraic Expressions and Identities",
        "Chapter 9: Mensuration",
        "Chapter 10: Exponents and Powers",
        "Chapter 11: Direct and Inverse Proportions",
        "Chapter 12: Factorisation",
        "Chapter 13: Introduction to Graphs",
        "Full Syllabus / Mixed Chapters"
      ],
      "Science": [
        "Chapter 1: Crop Production and Management",
        "Chapter 2: Microorganisms: Friend and Foe",
        "Chapter 3: Coal and Petroleum",
        "Chapter 4: Combustion and Flame",
        "Chapter 5: Conservation of Plants and Animals",
        "Chapter 6: Reproduction in Animals",
        "Chapter 7: Reaching the Age of Adolescence",
        "Chapter 8: Force and Pressure",
        "Chapter 9: Friction",
        "Chapter 10: Sound",
        "Chapter 11: Chemical Effects of Electric Current",
        "Chapter 12: Some Natural Phenomena",
        "Chapter 13: Light",
        "Full Syllabus / Mixed Chapters"
      ],
      "Social Science": [
        "History Ch 1: How, When and Where",
        "History Ch 2: From Trade to Territory (The Company Establishes Power)",
        "History Ch 3: Ruling the Countryside",
        "History Ch 4: Tribals, Dikus and the Vision of a Golden Age",
        "History Ch 5: When People Rebel (1857 and After)",
        "History Ch 6: Civilising the Native, Educating the Nation",
        "History Ch 7: Women, Caste and Reform",
        "History Ch 8: The Making of the National Movement: 1870s-1947",
        "Geography Ch 1: Resources",
        "Geography Ch 2: Land, Soil, Water, Natural Vegetation and Wildlife Resources",
        "Geography Ch 3: Agriculture",
        "Geography Ch 4: Industries",
        "Geography Ch 5: Human Resources",
        "Civics Ch 1: The Indian Constitution",
        "Civics Ch 2: Understanding Secularism",
        "Civics Ch 3: Parliament and the Making of Laws",
        "Civics Ch 4: Judiciary",
        "Civics Ch 5: Understanding Marginalisation",
        "Civics Ch 6: Confronting Marginalisation",
        "Civics Ch 7: Public Facilities",
        "Civics Ch 8: Law and Social Justice",
        "Full Syllabus / Mixed Chapters"
      ],
      "English": [
        "Honeydew: The Best Christmas Present in the World",
        "Honeydew: The Tsunami",
        "Honeydew: Glimpses of the Past",
        "Honeydew: Bepin Choudhury's Lapse of Memory",
        "Honeydew: The Summit Within",
        "Honeydew: This is Jody's Fawn",
        "Honeydew: A Visit to Cambridge",
        "Honeydew: A Short Monsoon Diary",
        "Grammar: Direct & Indirect Speech, Prepositions, Conjunctions",
        "Writing: Diary Entry, Notice Writing, Formal Letter",
        "Full Syllabus / Mixed Chapters"
      ],
      "Hindi (हिंदी)": [
        "वसंत: ध्वनि",
        "वसंत: लाख की चूड़ियाँ",
        "वसंत: बस की यात्रा",
        "वसंत: दीवानों की हस्ती",
        "वसंत: चिट्ठियों की अनूठी दुनिया",
        "वसंत: भगवान के डाकिए",
        "वसंत: क्या निराश हुआ जाए",
        "वसंत: यह सबसे कठिन समय नहीं",
        "वसंत: कबीर की साखियाँ",
        "वसंत: सुदामा चरित",
        "व्याकरण: उपसर्ग, प्रत्यय, समास, वाच्य, मुहावरे",
        "Full Syllabus / Mixed Chapters"
      ]
    }
  },

  "Class 9": {
    subjects: {
      "Mathematics": [
        "Chapter 1: Number Systems",
        "Chapter 2: Polynomials",
        "Chapter 3: Coordinate Geometry",
        "Chapter 4: Linear Equations in Two Variables",
        "Chapter 5: Introduction to Euclid's Geometry",
        "Chapter 6: Lines and Angles",
        "Chapter 7: Triangles",
        "Chapter 8: Quadrilaterals",
        "Chapter 9: Circles",
        "Chapter 10: Heron's Formula",
        "Chapter 11: Surface Areas and Volumes",
        "Chapter 12: Statistics",
        "Full Syllabus / Mixed Chapters"
      ],
      "Science": [
        "Chapter 1: Matter in Our Surroundings",
        "Chapter 2: Is Matter Around Us Pure?",
        "Chapter 3: Atoms and Molecules",
        "Chapter 4: Structure of the Atom",
        "Chapter 5: The Fundamental Unit of Life (Cell)",
        "Chapter 6: Tissues",
        "Chapter 7: Motion",
        "Chapter 8: Force and Laws of Motion",
        "Chapter 9: Gravitation",
        "Chapter 10: Work and Energy",
        "Chapter 11: Sound",
        "Chapter 12: Improvement in Food Resources",
        "Full Syllabus / Mixed Chapters"
      ],
      "Social Science": [
        "History Ch 1: The French Revolution",
        "History Ch 2: Socialism in Europe and the Russian Revolution",
        "History Ch 3: Nazism and the Rise of Hitler",
        "History Ch 4: Forest Society and Colonialism",
        "Geography Ch 1: India – Size and Location",
        "Geography Ch 2: Physical Features of India",
        "Geography Ch 3: Drainage",
        "Geography Ch 4: Climate",
        "Geography Ch 5: Natural Vegetation and Wildlife",
        "Geography Ch 6: Population",
        "Civics Ch 1: What is Democracy? Why Democracy?",
        "Civics Ch 2: Constitutional Design",
        "Civics Ch 3: Electoral Politics",
        "Civics Ch 4: Working of Institutions",
        "Civics Ch 5: Democratic Rights",
        "Economics Ch 1: The Story of Village Palampur",
        "Economics Ch 2: People as Resource",
        "Economics Ch 3: Poverty as a Challenge",
        "Economics Ch 4: Food Security in India",
        "Full Syllabus / Mixed Chapters"
      ],
      "English Language & Literature": [
        "Beehive: The Fun They Had",
        "Beehive: The Sound of Music",
        "Beehive: The Little Girl",
        "Beehive: A Truly Beautiful Mind",
        "Beehive: The Snake and the Mirror",
        "Beehive: My Childhood (A.P.J. Abdul Kalam)",
        "Beehive: Reach for the Top",
        "Beehive: Kathmandu",
        "Beehive: If I Were You",
        "Moments: The Lost Child",
        "Moments: The Adventures of Toto",
        "Moments: Iswaran the Storyteller",
        "Moments: In the Kingdom of Fools",
        "Moments: The Happy Prince",
        "Moments: The Last Leaf",
        "Moments: A House Is Not a Home",
        "Moments: The Beggar",
        "Writing: Descriptive Paragraph, Story Writing, Diary Entry",
        "Grammar: Tenses, Modals, Subject-Verb Concord, Reported Speech, Determiners",
        "Full Syllabus / Mixed Chapters"
      ],
      "Hindi (हिंदी)": [
        "क्षितिज: दो बैलों की कथा (प्रेमचंद)",
        "क्षितिज: ल्हासा की ओर (राहुल सांकृत्यायन)",
        "क्षितिज: उपभोक्तावाद की संस्कृति",
        "क्षितिज: साँवले सपनों की याद",
        "क्षितिज: प्रेमचंद के फटे जूते (हरिशंकर परसाई)",
        "क्षितिज: मेरे बचपन के दिन (महादेवी वर्मा)",
        "क्षितिज: साखियाँ एवं सबद (कबीर)",
        "क्षितिज: वाख (ललद्यद)",
        "क्षितिज: सवैये (रसखान)",
        "क्षितिज: कैदी और कोकिला (माखनलाल चतुर्वेदी)",
        "व्याकरण: उपसर्ग-प्रत्यय, समास, अर्थ की दृष्टि से वाक्य भेद, अलंकार",
        "Full Syllabus / Mixed Chapters"
      ],
      "Information Technology (IT Code 402)": [
        "Part A: Communication Skills-I",
        "Part A: Self-Management Skills-I",
        "Part A: ICT Skills-I",
        "Part B: Introduction to IT-ITeS Industry",
        "Part B: Data Entry & Keyboarding Skills",
        "Part B: Digital Documentation",
        "Part B: Electronic Spreadsheet",
        "Part B: Digital Presentation",
        "Full Syllabus / Mixed Chapters"
      ]
    }
  },

  "Class 10": {
    subjects: {
      "Mathematics": [
        "Chapter 1: Real Numbers",
        "Chapter 2: Polynomials",
        "Chapter 3: Pair of Linear Equations in Two Variables",
        "Chapter 4: Quadratic Equations",
        "Chapter 5: Arithmetic Progressions",
        "Chapter 6: Triangles",
        "Chapter 7: Coordinate Geometry",
        "Chapter 8: Introduction to Trigonometry",
        "Chapter 9: Some Applications of Trigonometry (Heights and Distances)",
        "Chapter 10: Circles",
        "Chapter 11: Areas Related to Circles",
        "Chapter 12: Surface Areas and Volumes",
        "Chapter 13: Statistics",
        "Chapter 14: Probability",
        "Full Syllabus / Mixed Chapters"
      ],
      "Science": [
        "Chapter 1: Chemical Reactions and Equations",
        "Chapter 2: Acids, Bases and Salts",
        "Chapter 3: Metals and Non-metals",
        "Chapter 4: Carbon and its Compounds",
        "Chapter 5: Life Processes",
        "Chapter 6: Control and Coordination",
        "Chapter 7: How do Organisms Reproduce?",
        "Chapter 8: Heredity and Evolution",
        "Chapter 9: Light – Reflection and Refraction",
        "Chapter 10: The Human Eye and the Colourful World",
        "Chapter 11: Electricity",
        "Chapter 12: Magnetic Effects of Electric Current",
        "Chapter 13: Our Environment",
        "Full Syllabus / Mixed Chapters"
      ],
      "Social Science": [
        "History Ch 1: The Rise of Nationalism in Europe",
        "History Ch 2: Nationalism in India",
        "History Ch 3: The Making of a Global World",
        "History Ch 4: The Age of Industrialisation",
        "History Ch 5: Print Culture and the Modern World",
        "Geography Ch 1: Resources and Development",
        "Geography Ch 2: Forest and Wildlife Resources",
        "Geography Ch 3: Water Resources",
        "Geography Ch 4: Agriculture",
        "Geography Ch 5: Minerals and Energy Resources",
        "Geography Ch 6: Manufacturing Industries",
        "Geography Ch 7: Lifelines of National Economy",
        "Civics Ch 1: Power Sharing",
        "Civics Ch 2: Federalism",
        "Civics Ch 3: Gender, Religion and Caste",
        "Civics Ch 4: Political Parties",
        "Civics Ch 5: Outcomes of Democracy",
        "Economics Ch 1: Development",
        "Economics Ch 2: Sectors of the Indian Economy",
        "Economics Ch 3: Money and Credit",
        "Economics Ch 4: Globalisation and the Indian Economy",
        "Economics Ch 5: Consumer Rights",
        "Full Syllabus / Mixed Chapters"
      ],
      "English Language & Literature": [
        "First Flight: A Letter to God",
        "First Flight: Nelson Mandela: Long Walk to Freedom",
        "First Flight: Two Stories about Flying",
        "First Flight: From the Diary of Anne Frank",
        "First Flight: Glimpses of India",
        "First Flight: Mijbil the Otter",
        "First Flight: Madam Rides the Bus",
        "First Flight: The Sermon at Benares",
        "First Flight: The Proposal",
        "Poem: Dust of Snow & Fire and Ice",
        "Poem: A Tiger in the Zoo",
        "Poem: How to Tell Wild Animals & The Ball Poem",
        "Poem: Amanda! & The Trees",
        "Poem: Fog & The Tale of Custard the Dragon",
        "Footprints: A Triumph of Surgery",
        "Footprints: The Thief's Story",
        "Footprints: The Midnight Visitor",
        "Footprints: A Question of Trust",
        "Footprints: Footprints Without Feet",
        "Footprints: The Making of a Scientist",
        "Footprints: The Necklace",
        "Footprints: Bholi",
        "Writing: Formal Letter to Editor / Authority",
        "Writing: Analytical Paragraph Writing",
        "Grammar: Tenses, Modals, Subject-Verb Concord, Reported Speech, Determiners",
        "Full Syllabus / Mixed Chapters"
      ],
      "Hindi Course A & B (हिंदी)": [
        "क्षितिज: पद (सूरदास)",
        "क्षितिज: राम-लक्ष्मण-परशुराम संवाद (तुलसीदास)",
        "क्षितिज: आत्मकथ्य (जयशंकर प्रसाद)",
        "क्षितिज: उत्साह और अट नहीं रही है (निराला)",
        "क्षितिज: यह दंतुरित मुस्कान और फसल (नागार्जुन)",
        "क्षितिज: नेताजी का चश्मा (स्वयं प्रकाश)",
        "क्षितिज: बालगोबिन भगत (रामवृक्ष बेनीपुरी)",
        "क्षितिज: लखनवी अंदाज़ (यशपाल)",
        "क्षितिज: एक कहानी यह भी (मन्नू भंडारी)",
        "कृतिका: माता का आँचल",
        "कृतिका: साना-साना हाथ जोड़ि...",
        "कृतिका: मैं क्यों लिखता हूँ?",
        "व्याकरण: रचना के आधार पर वाक्य भेद",
        "व्याकरण: वाच्य (कर्तृवाच्य, कर्मवाच्य, भाववाच्य)",
        "व्याकरण: पद-परिचय",
        "व्याकरण: अलंकार (श्लेष, उत्प्रेक्षा, अतिशयोक्ति, मानवीकरण)",
        "लेखन: अनुच्छेद लेखन, औपचारिक/अनौपचारिक पत्र, स्ववृत्त व ईमेल लेखन, विज्ञापन व संदेश लेखन",
        "Full Syllabus / Mixed Chapters"
      ],
      "Information Technology (IT Code 402)": [
        "Part A: Communication Skills-II",
        "Part A: Self-Management Skills-II",
        "Part A: ICT Skills-II",
        "Part A: Entrepreneurial Skills-II",
        "Part A: Green Skills-II",
        "Part B: Digital Documentation (Advanced)",
        "Part B: Electronic Spreadsheet (Advanced)",
        "Part B: Database Management System (DBMS / SQL)",
        "Part B: Web Applications and Security",
        "Full Syllabus / Mixed Chapters"
      ]
    }
  },

  "Class 11 Science": {
    subjects: {
      "Physics": [
        "Chapter 1: Units and Measurements",
        "Chapter 2: Motion in a Straight Line",
        "Chapter 3: Motion in a Plane (Vectors & Projectile)",
        "Chapter 4: Laws of Motion",
        "Chapter 5: Work, Energy and Power",
        "Chapter 6: System of Particles and Rotational Motion",
        "Chapter 7: Gravitation",
        "Chapter 8: Mechanical Properties of Solids",
        "Chapter 9: Mechanical Properties of Fluids",
        "Chapter 10: Thermal Properties of Matter",
        "Chapter 11: Thermodynamics",
        "Chapter 12: Kinetic Theory of Gases",
        "Chapter 13: Oscillations",
        "Chapter 14: Waves",
        "Full Syllabus / Mixed Chapters"
      ],
      "Chemistry": [
        "Chapter 1: Some Basic Concepts of Chemistry",
        "Chapter 2: Structure of Atom",
        "Chapter 3: Classification of Elements and Periodicity in Properties",
        "Chapter 4: Chemical Bonding and Molecular Structure",
        "Chapter 5: Chemical Thermodynamics",
        "Chapter 6: Equilibrium (Physical & Chemical)",
        "Chapter 7: Redox Reactions",
        "Chapter 8: Organic Chemistry – Some Basic Principles and Techniques",
        "Chapter 9: Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)",
        "Full Syllabus / Mixed Chapters"
      ],
      "Mathematics": [
        "Chapter 1: Sets",
        "Chapter 2: Relations and Functions",
        "Chapter 3: Trigonometric Functions",
        "Chapter 4: Complex Numbers and Quadratic Equations",
        "Chapter 5: Linear Inequalities",
        "Chapter 6: Permutations and Combinations",
        "Chapter 7: Binomial Theorem",
        "Chapter 8: Sequences and Series (AP & GP)",
        "Chapter 9: Straight Lines",
        "Chapter 10: Conic Sections (Parabola, Ellipse, Hyperbola)",
        "Chapter 11: Introduction to Three Dimensional Geometry",
        "Chapter 12: Limits and Derivatives",
        "Chapter 13: Statistics",
        "Chapter 14: Probability",
        "Full Syllabus / Mixed Chapters"
      ],
      "Biology": [
        "Unit 1: Diversity in the Living World",
        "Chapter 1: The Living World",
        "Chapter 2: Biological Classification",
        "Chapter 3: Plant Kingdom",
        "Chapter 4: Animal Kingdom",
        "Unit 2: Structural Organisation in Animals and Plants",
        "Chapter 5: Morphology of Flowering Plants",
        "Chapter 6: Anatomy of Flowering Plants",
        "Chapter 7: Structural Organisation in Animals",
        "Unit 3: Cell: Structure and Functions",
        "Chapter 8: Cell: The Unit of Life",
        "Chapter 9: Biomolecules",
        "Chapter 10: Cell Cycle and Cell Division",
        "Unit 4: Plant Physiology (Photosynthesis & Respiration)",
        "Unit 5: Human Physiology (Breathing, Circulation, Excretion, Locomotion, Neural & Chemical Coordination)",
        "Full Syllabus / Mixed Chapters"
      ],
      "Computer Science (Python)": [
        "Unit 1: Computer Systems and Organisation",
        "Unit 2: Computational Thinking and Programming (Python Basics, Strings, Lists, Tuples, Dictionaries)",
        "Unit 3: Society, Law and Ethics (Cyber Safety, IPR, Digital Footprints)",
        "Full Syllabus / Mixed Chapters"
      ],
      "English Core": [
        "Hornbill: The Portrait of a Lady",
        "Hornbill: We're Not Afraid to Die... if We Can All Be Together",
        "Hornbill: Discovering Tut: the Saga Continues",
        "Hornbill: The Adventure",
        "Hornbill: Silk Road",
        "Hornbill Poems: A Photograph, The Laburnum Top, The Voice of the Rain, Childhood, Father to Son",
        "Snapshots: The Summer of the Beautiful White Horse",
        "Snapshots: The Address",
        "Snapshots: Mother's Day",
        "Snapshots: Birth",
        "Snapshots: The Tale of Melon City",
        "Advanced Writing Skills: Note Making, Summary, Notice, Poster, Speech, Debate",
        "Full Syllabus / Mixed Chapters"
      ]
    }
  },

  "Class 11 Commerce": {
    subjects: {
      "Accountancy": [
        "Part A: Theoretical Framework & Accounting Principles",
        "Part A: Recording of Transactions (Journal, Ledger, Cash Book)",
        "Part A: Bank Reconciliation Statement (BRS)",
        "Part A: Trial Balance and Rectification of Errors",
        "Part A: Depreciation, Provisions and Reserves",
        "Part B: Financial Statements of Sole Proprietorship (Trading, P&L, Balance Sheet)",
        "Part B: Financial Statements with Adjustments",
        "Part B: Incomplete Records (Single Entry System)",
        "Full Syllabus / Mixed Chapters"
      ],
      "Business Studies": [
        "Chapter 1: Nature and Purpose of Business",
        "Chapter 2: Forms of Business Organisation (Sole Prop, Partnership, Company)",
        "Chapter 3: Public, Private and Global Enterprises",
        "Chapter 4: Business Services (Banking, Insurance)",
        "Chapter 5: Emerging Modes of Business (E-Commerce)",
        "Chapter 6: Social Responsibilities of Business and Business Ethics",
        "Chapter 7: Sources of Business Finance",
        "Chapter 8: Small Business and Enterprises",
        "Chapter 9: Internal Trade (Wholesale & Retail)",
        "Chapter 10: International Business",
        "Full Syllabus / Mixed Chapters"
      ],
      "Economics": [
        "Statistics Ch 1: Introduction",
        "Statistics Ch 2: Collection of Data",
        "Statistics Ch 3: Organisation of Data",
        "Statistics Ch 4: Presentation of Data (Tables & Graphs)",
        "Statistics Ch 5: Measures of Central Tendency (Mean, Median, Mode)",
        "Statistics Ch 6: Correlation",
        "Statistics Ch 7: Index Numbers",
        "Microeconomics Ch 1: Introduction to Microeconomics",
        "Microeconomics Ch 2: Consumer's Equilibrium and Demand",
        "Microeconomics Ch 3: Producer Behaviour and Supply",
        "Microeconomics Ch 4: Forms of Market and Price Determination",
        "Full Syllabus / Mixed Chapters"
      ],
      "Applied Mathematics": [
        "Unit 1: Numbers, Quantification and Numerical Applications",
        "Unit 2: Algebra (Sets, Relations, Complex Numbers)",
        "Unit 3: Mathematical and Logical Reasoning",
        "Unit 4: Calculus (Functions, Limits, Derivatives)",
        "Unit 5: Probability",
        "Unit 6: Descriptive Statistics",
        "Unit 7: Financial Mathematics (Annuity, EMI, Taxes)",
        "Unit 8: Coordinate Geometry",
        "Full Syllabus / Mixed Chapters"
      ],
      "English Core": [
        "Hornbill Prose & Poetry",
        "Snapshots Supplementary",
        "Advanced Writing Skills: Note Making, Speech, Debate, Notice",
        "Reading: Comprehension Passages",
        "Full Syllabus / Mixed Chapters"
      ]
    }
  },

  "Class 11 Humanities": {
    subjects: {
      "History": [
        "Theme 1: Writing and City Life (Mesopotamia)",
        "Theme 2: An Empire Across Three Continents (Roman Empire)",
        "Theme 3: Nomadic Empires (Mongols)",
        "Theme 4: The Three Orders (Feudal Europe)",
        "Theme 5: Changing Cultural Traditions (Renaissance)",
        "Theme 6: Displacing Indigenous Peoples",
        "Theme 7: Paths to Modernisation (East Asia)",
        "Full Syllabus / Mixed Chapters"
      ],
      "Political Science": [
        "Indian Constitution: Constitution: Why and How?",
        "Indian Constitution: Rights in the Indian Constitution",
        "Indian Constitution: Election and Representation",
        "Indian Constitution: Executive",
        "Indian Constitution: Legislature",
        "Indian Constitution: Judiciary",
        "Indian Constitution: Federalism",
        "Indian Constitution: Local Governments",
        "Political Theory: Introduction to Political Theory",
        "Political Theory: Freedom, Equality, Social Justice, Rights, Citizenship, Nationalism, Secularism",
        "Full Syllabus / Mixed Chapters"
      ],
      "Geography": [
        "Fundamentals: Geography as a Discipline",
        "Fundamentals: The Origin and Evolution of the Earth",
        "Fundamentals: Interior of the Earth & Continental Drift",
        "Fundamentals: Geomorphic Processes, Landforms",
        "Fundamentals: Composition and Structure of Atmosphere",
        "Fundamentals: Solar Radiation, Heat Balance and Temperature",
        "Fundamentals: Water in the Atmosphere & World Climate",
        "India Physical: Location, Structure and Physiography",
        "India Physical: Drainage System, Climate, Natural Vegetation, Soils",
        "Full Syllabus / Mixed Chapters"
      ],
      "Economics": [
        "Statistics for Economics (Central Tendency, Correlation, Index Numbers)",
        "Microeconomics (Consumer Equilibrium, Demand, Production, Cost, Supply, Market Forms)",
        "Full Syllabus / Mixed Chapters"
      ],
      "Psychology": [
        "Chapter 1: What is Psychology?",
        "Chapter 2: Methods of Enquiry in Psychology",
        "Chapter 3: The Bases of Human Behaviour",
        "Chapter 4: Human Development",
        "Chapter 5: Sensory, Attentional and Perceptual Processes",
        "Chapter 6: Learning",
        "Chapter 7: Human Memory",
        "Chapter 8: Thinking & Motivation and Emotion",
        "Full Syllabus / Mixed Chapters"
      ],
      "Sociology": [
        "Introducing Sociology: Sociology and Society",
        "Introducing Sociology: Terms, Concepts and their use in Sociology",
        "Introducing Sociology: Understanding Social Institutions",
        "Introducing Sociology: Culture and Socialisation",
        "Understanding Society: Social Structure, Stratification and Social Processes",
        "Understanding Society: Social Change and Social Order in Rural and Urban Society",
        "Understanding Society: Environment and Society",
        "Full Syllabus / Mixed Chapters"
      ],
      "English Core": [
        "Hornbill & Snapshots Core Literature",
        "Advanced Writing Skills & Reading Comprehension",
        "Full Syllabus / Mixed Chapters"
      ]
    }
  },

  "Class 12 Science": {
    subjects: {
      "Physics": [
        "Chapter 1: Electric Charges and Fields",
        "Chapter 2: Electrostatic Potential and Capacitance",
        "Chapter 3: Current Electricity",
        "Chapter 4: Moving Charges and Magnetism",
        "Chapter 5: Magnetism and Matter",
        "Chapter 6: Electromagnetic Induction (EMI)",
        "Chapter 7: Alternating Current (AC)",
        "Chapter 8: Electromagnetic Waves (EM Waves)",
        "Chapter 9: Ray Optics and Optical Instruments",
        "Chapter 10: Wave Optics",
        "Chapter 11: Dual Nature of Radiation and Matter",
        "Chapter 12: Atoms",
        "Chapter 13: Nuclei",
        "Chapter 14: Semiconductor Electronics: Materials, Devices and Simple Circuits",
        "Full Syllabus / Mixed Chapters"
      ],
      "Chemistry": [
        "Chapter 1: Solutions",
        "Chapter 2: Electrochemistry",
        "Chapter 3: Chemical Kinetics",
        "Chapter 4: The d- and f-Block Elements",
        "Chapter 5: Coordination Compounds",
        "Chapter 6: Haloalkanes and Haloarenes",
        "Chapter 7: Alcohols, Phenols and Ethers",
        "Chapter 8: Aldehydes, Ketones and Carboxylic Acids",
        "Chapter 9: Amines (Organic Compounds Containing Nitrogen)",
        "Chapter 10: Biomolecules",
        "Full Syllabus / Mixed Chapters"
      ],
      "Mathematics": [
        "Chapter 1: Relations and Functions",
        "Chapter 2: Inverse Trigonometric Functions",
        "Chapter 3: Matrices",
        "Chapter 4: Determinants",
        "Chapter 5: Continuity and Differentiability",
        "Chapter 6: Applications of Derivatives (AOD)",
        "Chapter 7: Integrals (Definite & Indefinite)",
        "Chapter 8: Applications of Integrals (Area Under Curves)",
        "Chapter 9: Differential Equations",
        "Chapter 10: Vector Algebra",
        "Chapter 11: Three Dimensional Geometry (3D Geometry)",
        "Chapter 12: Linear Programming (LPP)",
        "Chapter 13: Probability (Conditional, Bayes' Theorem)",
        "Full Syllabus / Mixed Chapters"
      ],
      "Biology": [
        "Chapter 1: Sexual Reproduction in Flowering Plants",
        "Chapter 2: Human Reproduction",
        "Chapter 3: Reproductive Health",
        "Chapter 4: Principles of Inheritance and Variation (Genetics)",
        "Chapter 5: Molecular Basis of Inheritance (DNA & RNA)",
        "Chapter 6: Evolution",
        "Chapter 7: Human Health and Disease",
        "Chapter 8: Microbes in Human Welfare",
        "Chapter 9: Biotechnology: Principles and Processes",
        "Chapter 10: Biotechnology and its Applications",
        "Chapter 11: Organisms and Populations",
        "Chapter 12: Ecosystem",
        "Chapter 13: Biodiversity and Conservation",
        "Full Syllabus / Mixed Chapters"
      ],
      "Computer Science (Python)": [
        "Unit 1: Computational Thinking and Programming-2 (Functions, File Handling, Exception Handling, Data Structures - Stacks)",
        "Unit 2: Computer Networks (Evolution, Topologies, Protocols, Cyber Security)",
        "Unit 3: Database Management (SQL Queries, Joins, Aggregate Functions, Python-SQL Connectivity)",
        "Full Syllabus / Mixed Chapters"
      ],
      "English Core": [
        "Flamingo: The Last Lesson (Alphonse Daudet)",
        "Flamingo: Lost Spring (Anees Jung)",
        "Flamingo: Deep Water (William Douglas)",
        "Flamingo: The Rattrap (Selma Lagerlöf)",
        "Flamingo: Indigo (Louis Fischer)",
        "Flamingo: Poets and Pancakes",
        "Flamingo: The Interview",
        "Flamingo: Going Places",
        "Flamingo Poems: My Mother at Sixty-Six, Keeping Quiet, A Thing of Beauty, A Roadside Stand, Aunt Jennifer's Tigers",
        "Vistas: The Third Level",
        "Vistas: The Tiger King",
        "Vistas: Journey to the end of the Earth",
        "Vistas: The Enemy",
        "Vistas: On the Face of It",
        "Vistas: Memories of Childhood",
        "Writing: Notice Writing, Formal/Informal Invitations & Replies, Letter to Editor / Job Application with Bio-data, Article / Report Writing",
        "Reading: Discursive & Case-Based Factual Comprehension Passages",
        "Full Syllabus / Mixed Chapters"
      ]
    }
  },

  "Class 12 Commerce": {
    subjects: {
      "Accountancy": [
        "Part A: Accounting for Partnership: Fundamentals",
        "Part A: Goodwill: Nature and Valuation",
        "Part A: Change in Profit Sharing Ratio among Existing Partners",
        "Part A: Admission of a Partner",
        "Part A: Retirement or Death of a Partner",
        "Part A: Dissolution of a Partnership Firm",
        "Part B: Accounting for Share Capital (Issue, Forfeiture, Reissue)",
        "Part B: Issue and Redemption of Debentures",
        "Part C: Financial Statements of a Company (Schedule III)",
        "Part C: Financial Statement Analysis (Comparative & Common Size Statements)",
        "Part C: Accounting Ratios (Liquidity, Solvency, Activity, Profitability)",
        "Part C: Cash Flow Statement (AS-3)",
        "Full Syllabus / Mixed Chapters"
      ],
      "Business Studies": [
        "Chapter 1: Nature and Significance of Management",
        "Chapter 2: Principles of Management (Fayol & Taylor)",
        "Chapter 3: Business Environment (LPG Reforms)",
        "Chapter 4: Planning",
        "Chapter 5: Organising",
        "Chapter 6: Staffing",
        "Chapter 7: Directing (Motivation, Leadership, Communication)",
        "Chapter 8: Controlling",
        "Chapter 9: Financial Management (Capital Structure, Working Capital)",
        "Chapter 10: Financial Markets (Money Market, Capital Market, SEBI)",
        "Chapter 11: Marketing Management (Marketing Mix 4Ps)",
        "Chapter 12: Consumer Protection (CPA 2019, Redressal Agencies)",
        "Full Syllabus / Mixed Chapters"
      ],
      "Economics": [
        "Macroeconomics Ch 1: Circular Flow of Income",
        "Macroeconomics Ch 2: Basic Concepts of Macroeconomics",
        "Macroeconomics Ch 3: National Income and Related Aggregates (Calculation by Value Added, Income & Expenditure Methods)",
        "Macroeconomics Ch 4: Money and Banking (Functions of RBI, Credit Creation)",
        "Macroeconomics Ch 5: Aggregate Demand, Aggregate Supply and Related Concepts",
        "Macroeconomics Ch 6: Short-Run Equilibrium Output",
        "Macroeconomics Ch 7: Problem of Deficient Demand and Excess Demand",
        "Macroeconomics Ch 8: Government Budget and the Economy",
        "Macroeconomics Ch 9: Balance of Payments and Foreign Exchange Rate",
        "IED Ch 1: Indian Economy on the Eve of Independence",
        "IED Ch 2: Indian Economy (1950-1990) & Economic Reforms since 1991 (LPG)",
        "IED Ch 3: Human Capital Formation in India",
        "IED Ch 4: Rural Development (Credit & Marketing)",
        "IED Ch 5: Employment: Growth, Informalisation and Other Issues",
        "IED Ch 6: Sustainable Economic Development",
        "IED Ch 7: Comparative Development Experiences of India and its Neighbours (China & Pakistan)",
        "Full Syllabus / Mixed Chapters"
      ],
      "Applied Mathematics": [
        "Unit 1: Numbers, Quantification and Numerical Applications (Modulo, Matrices, Determinants)",
        "Unit 2: Calculus (Higher Order Derivatives, Marginal Cost/Revenue, Integration)",
        "Unit 3: Probability Distributions (Normal, Binomial, Poisson)",
        "Unit 4: Index Numbers and Time-based Data",
        "Unit 5: Financial Mathematics (Perpetuity, Sinking Funds, EMI, Depreciation)",
        "Unit 6: Linear Programming (LPP)",
        "Full Syllabus / Mixed Chapters"
      ],
      "English Core": [
        "Flamingo & Vistas Core Literature",
        "Advanced Writing Skills: Invitations, Job Application, Report Writing, Notice",
        "Reading: Comprehension Passages",
        "Full Syllabus / Mixed Chapters"
      ]
    }
  },

  "Class 12 Humanities": {
    subjects: {
      "History": [
        "Theme 1: Bricks, Beads and Bones (Harappan Civilisation)",
        "Theme 2: Kings, Farmers and Towns (Early States and Economies c. 600 BCE–600 CE)",
        "Theme 3: Kinship, Caste and Class (Early Societies c. 600 BCE–600 CE)",
        "Theme 4: Thinkers, Beliefs and Buildings (Cultural Developments c. 600 BCE–600 CE)",
        "Theme 5: Through the Eyes of Travellers (c. tenth to seventeenth century)",
        "Theme 6: Bhakti–Sufi Traditions (Religious Beliefs and Devotional Texts)",
        "Theme 7: An Imperial Capital: Vijayanagara (c. fourteenth to sixteenth century)",
        "Theme 8: Peasants, Zamindars and the State (Agrarian Society and Mughal Empire)",
        "Theme 9: Colonialism and the Countryside (Exploring Official Archives)",
        "Theme 10: Rebels and the Raj (1857 Revolt and its Representations)",
        "Theme 11: Mahatma Gandhi and the Nationalist Movement (Civil Disobedience and Beyond)",
        "Theme 12: Framing the Constitution (The Beginning of a New Era)",
        "Full Syllabus / Mixed Chapters"
      ],
      "Political Science": [
        "Contemporary World Politics: The End of Bipolarity",
        "Contemporary World Politics: Contemporary Centres of Power (EU, ASEAN, BRICS)",
        "Contemporary World Politics: Contemporary South Asia",
        "Contemporary World Politics: International Organisations (UN & agencies)",
        "Contemporary World Politics: Security in the Contemporary World",
        "Contemporary World Politics: Environment and Natural Resources",
        "Contemporary World Politics: Globalisation",
        "Politics in India Since Independence: Challenges of Nation Building",
        "Politics in India Since Independence: Era of One-Party Dominance",
        "Politics in India Since Independence: Politics of Planned Development (NITI Aayog)",
        "Politics in India Since Independence: India's External Relations",
        "Politics in India Since Independence: Challenges to and Restoration of the Congress System",
        "Politics in India Since Independence: The Crisis of Democratic Order (Emergency)",
        "Politics in India Since Independence: Regional Aspirations",
        "Politics in India Since Independence: Recent Developments in Indian Politics",
        "Full Syllabus / Mixed Chapters"
      ],
      "Geography": [
        "Human Geography: Nature and Scope",
        "Human Geography: The World Population: Distribution, Density and Growth",
        "Human Geography: Human Development",
        "Human Geography: Primary Activities (Agriculture, Mining, Pastoralism)",
        "Human Geography: Secondary Activities (Manufacturing)",
        "Human Geography: Tertiary and Quaternary Activities",
        "Human Geography: Transport, Communication and Trade",
        "Human Geography: International Trade",
        "India: People and Economy: Population Distribution, Migration",
        "India: People and Economy: Human Settlements",
        "India: People and Economy: Land Resources and Agriculture",
        "India: People and Economy: Water Resources, Mineral and Energy Resources",
        "India: People and Economy: Planning and Sustainable Development",
        "India: People and Economy: Transport and Communication, International Trade",
        "India: People and Economy: Geographical Perspective on Selected Issues and Problems",
        "Full Syllabus / Mixed Chapters"
      ],
      "Economics": [
        "Macroeconomics (National Income, Money & Banking, Aggregate Demand, Budget, BOP)",
        "Indian Economic Development (Reforms 1991, Human Capital, Rural Development, Employment, Sustainable Dev, India-China-Pak)",
        "Full Syllabus / Mixed Chapters"
      ],
      "Psychology": [
        "Chapter 1: Variations in Psychological Attributes (Intelligence, Aptitude)",
        "Chapter 2: Self and Personality (Freud, Humanistic, Trait Theories)",
        "Chapter 3: Meeting Life Challenges (Stress Management & Coping)",
        "Chapter 4: Psychological Disorders (Anxiety, Mood, Schizophrenia)",
        "Chapter 5: Therapeutic Approaches (Psychotherapy, CBT, Yoga)",
        "Chapter 6: Attitude and Social Cognition",
        "Chapter 7: Social Influence and Group Processes",
        "Full Syllabus / Mixed Chapters"
      ],
      "Sociology": [
        "Indian Society: Introducing Indian Society",
        "Indian Society: The Demographic Structure of the Indian Society",
        "Indian Society: Social Institutions: Continuity and Change (Caste, Tribe, Family)",
        "Indian Society: The Market as a Social Institution",
        "Indian Society: Patterns of Social Inequality and Exclusion",
        "Indian Society: The Challenges of Cultural Diversity",
        "Social Change and Development: Structural Change (Colonialism, Industrialisation)",
        "Social Change and Development: Cultural Change (Sanskritisation, Modernisation)",
        "Social Change and Development: Change and Development in Rural Society",
        "Social Change and Development: Change and Development in Industrial Society",
        "Social Change and Development: Social Movements (Peasant, Dalit, Tribal, Women)",
        "Full Syllabus / Mixed Chapters"
      ],
      "English Core": [
        "Flamingo & Vistas Literature",
        "Writing Skills & Reading Passages",
        "Full Syllabus / Mixed Chapters"
      ]
    }
  }
};
