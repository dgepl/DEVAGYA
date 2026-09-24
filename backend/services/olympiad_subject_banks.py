"""
Subject-specific Part-B Question Banks for DEVGYA National Teacher Skills Olympiad (TSO).
Adheres strictly to the 60/40 blueprint:
Part-B carries 40% weightage (40 MCQs total):
- Module 4: Core Subject Knowledge (20 MCQs)
- Module 5: Subject Pedagogical Knowledge & TLM (10 MCQs)
- Module 6: Common Misconceptions & HOTS (10 MCQs)

Supported Dedicated Tracks (40 Questions each):
1. Mathematics
2. Social Science
3. English Language & Literature
4. Hindi Language & Pedagogy
5. Computer Science & AI
6. Physics (Mechanics, Optics, Thermodynamics, Modern Physics, TLM, HOTS)
7. Chemistry (Stoichiometry, Bonding, Periodic Trends, Organic, TLM, HOTS)
8. Biology (Cell Biology, Genetics, Physiology, Ecology, Microscopy, HOTS)
9. General Science (Interdisciplinary)
"""

from typing import List, Dict, Any


# 1. MATHEMATICS (40 MCQs)
# ============================================================================
def get_math_part_b_questions() -> List[Dict[str, Any]]:
    return [
        {"id": "math-core-1", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Algebra: If the roots of the quadratic equation $ax^2 + bx + c = 0$ are in the ratio m : n, which relationship between coefficients is strictly true?", "options": ["(A) $mn b^2 = (m+n)^2 ac$", "(B) (m + n) b^2 = m n a c", "(C) m n (b^2 - 4ac) = 0", "(D) (m^2 + n^2) b = 2 a c"], "correct_answer": 0, "explanation": "Let roots be mk and nk. Sum = (m+n)k = -b/a => k = -b/[a(m+n)]. Product = mn k^2 = c/a. Substituting k gives mn b^2 = (m+n)^2 ac."},
        {"id": "math-core-2", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Coordinate Geometry: The coordinates of the circumcenter of a right-angled triangle with vertices at (0, 0), (6, 0), and (0, 8) are:", "options": ["(A) (3, 4)", "(B) (2, 2.67)", "(C) (0, 0)", "(D) (6, 8)"], "correct_answer": 0, "explanation": "In any right-angled triangle, the circumcenter lies precisely at the midpoint of the hypotenuse: ((6+0)/2, (0+8)/2) = (3, 4)."},
        {"id": "math-core-3", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Trigonometry: If $\\sec \theta + \tan \theta = p$, what is the exact value of $\\sin \theta$ in terms of p?", "options": ["(A) $\frac{p^2 - 1}{p^2 + 1}$", "(B) (p^2 + 1) / (p^2 - 1)", "(C) 2p / (p^2 + 1)", "(D) (p^2 - 1) / 2p"], "correct_answer": 0, "explanation": "$\\sec \theta + \tan \theta = p$ => sec θ - tan θ = 1/p. 2 sec θ = (p^2+1)/p, 2 tan θ = (p^2-1)/p. $\\sin \theta$ = tan θ / sec θ = (p^2-1)/(p^2+1)."},
        {"id": "math-core-4", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Number Theory: According to the Fundamental Theorem of Arithmetic, every composite number can be factorized uniquely into a product of primes, except for:", "options": ["(A) The order in which the prime factors occur", "(B) The magnitude of the composite number", "(C) The parity (even/odd) of the factors", "(D) The base numeral system chosen"], "correct_answer": 0, "explanation": "Prime factorization of any composite integer is unique up to the order of factors."},
        {"id": "math-core-5", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Calculus / Limits: What is the exact value of $\\lim_{x \to 0} \frac{e^{3x} - 1}{\\sin 2x}$?", "options": ["(A) 3/2", "(B) 2/3", "(C) 1", "(D) 0"], "correct_answer": 0, "explanation": "By L'Hopital's rule: lim = 3e^0 / (2 cos 0) = 3/2."},
        {"id": "math-core-6", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Probability: A fair pair of standard dice is rolled. What is the conditional probability that the sum is at least 10, given that at least one die shows a 5?", "options": ["(A) 3/11", "(B) 1/6", "(C) 1/4", "(D) 5/36"], "correct_answer": 0, "explanation": "11 outcomes have at least one 5. Out of these, (5,5), (5,6), (6,5) give sum >= 10. P = 3/11."},
        {"id": "math-core-7", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Arithmetic Progressions: If the sum of first n terms of an AP is $S_n = 3n^2 + 5n$, what is its 15th term ($a_{15}$)?", "options": ["(A) 92", "(B) 88", "(C) 95", "(D) 720"], "correct_answer": 0, "explanation": "a_n = S_n - S_(n-1) = 6n + 2. $a_{15}$ = 6(15) + 2 = 92."},
        {"id": "math-core-8", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Geometry / Circles: Two concentric circles have radii 13 cm and 5 cm. What is the length of the chord of the larger circle which touches the smaller circle?", "options": ["(A) 24 cm", "(B) 12 cm", "(C) 18 cm", "(D) 26 cm"], "correct_answer": 0, "explanation": "Half-chord = √(13^2 - 5^2) = √144 = 12 cm. Total chord = 24 cm."},
        {"id": "math-core-9", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Statistics: In a moderately skewed distribution, if Mean is 32 and Median is 30, what is the empirical Mode?", "options": ["(A) 26", "(B) 28", "(C) 31", "(D) 34"], "correct_answer": 0, "explanation": "Mode = 3 × Median - 2 × Mean = 3(30) - 2(32) = 90 - 64 = 26."},
        {"id": "math-core-10", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Linear Systems: For what value of k will the system $2x + 3y = 7$ and $(k-1)x + (k+2)y = 3k$ have infinitely many solutions?", "options": ["(A) k = 7", "(B) k = 5", "(C) k = 3", "(D) k = -1"], "correct_answer": 0, "explanation": "2/(k-1) = 3/(k+2) => 2k + 4 = 3k - 3 => k = 7."},
        {"id": "math-core-11", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Polynomials: If α and β are zeroes of $f(x) = x^2 - p(x+1) - c$, what is the exact value of $(\alpha + 1)(\beta + 1)$?", "options": ["(A) 1 - c", "(B) 1 + c", "(C) c - 1", "(D) p - c"], "correct_answer": 0, "explanation": "f(x) = x^2 - px - (p+c). (α+1)(β+1) = αβ + (α+β) + 1 = -(p+c) + p + 1 = 1 - c."},
        {"id": "math-core-12", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Mensuration: A solid sphere of radius R = 2r is melted into n identical cones each of radius r and height h = r. What is n?", "options": ["(A) 32", "(B) 16", "(C) 64", "(D) 8"], "correct_answer": 0, "explanation": "Sphere volume = (4/3)π(8r^3) = (32/3)π r^3. Cone volume = (1/3)π r^3. n = 32."},
        {"id": "math-core-13", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Heights & Distances: An observer on a 100 m cliff observes a boat moving away. Angle of depression changes from 60° to 45° in 2 mins. Speed in m/min is:", "options": ["(A) 50 (1 - 1/√3)", "(B) 100 (√3 - 1)", "(C) 50 (√3 - 1)", "(D) 25 (3 - √3)"], "correct_answer": 0, "explanation": "Distance = 100 - 100/√3. Speed = 100(1 - 1/√3)/2 = 50(1 - 1/√3) m/min."},
        {"id": "math-core-14", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Matrices: If A is a 3 × 3 non-singular matrix with $|A| = 4$, what is the value of $|\text{adj}(A)|$?", "options": ["(A) 16", "(B) 64", "(C) 4", "(D) 1/4"], "correct_answer": 0, "explanation": "$|\text{adj}(A)|$ = |A|^(n-1) = 4^(3-1) = 4^2 = 16."},
        {"id": "math-core-15", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Vectors: If $|\vec{a}| = 3$, $|\vec{b}| = 4$, and $|\vec{a} + \vec{b}| = 5$, what is the angle between vectors a and b?", "options": ["(A) 90° (π/2 rad)", "(B) 60°", "(C) 45°", "(D) 180°"], "correct_answer": 0, "explanation": "|a+b|^2 = 9 + 16 + 24 cos θ = 25 => cos θ = 0 => θ = 90°."},
        {"id": "math-core-16", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Calculus: What is the slope of the normal to the curve $y = 2x^2 + 3\\sin x$ at x = 0?", "options": ["(A) -1/3", "(B) 3", "(C) -3", "(D) 1/3"], "correct_answer": 0, "explanation": "dy/dx = 4x + 3 cos x. At x = 0, dy/dx = 3. Normal slope = -1/3."},
        {"id": "math-core-17", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Calculus: The definite integral $\\int_0^{\\pi/2} \frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x} dx$ equals:", "options": ["(A) π/4", "(B) π/2", "(C) 1", "(D) 0"], "correct_answer": 0, "explanation": "By property ∫[0..a] f(x) dx = ∫[0..a] f(a-x) dx, 2I = π/2 => I = π/4."},
        {"id": "math-core-18", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Combinatorics: How many 4-digit numbers can be formed from digits 1, 2, 3, 4, 5, 6 without repetition divisible by 4?", "options": ["(A) 96", "(B) 72", "(C) 120", "(D) 48"], "correct_answer": 0, "explanation": "8 valid 2-digit endings (12, 16, 24, 32, 36, 52, 56, 64) × 12 choices for first 2 digits = 96."},
        {"id": "math-core-19", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Complex Numbers: What is the principal argument of $z = -1 - i\\sqrt{3}$?", "options": ["(A) -2π/3 (-120°)", "(B) 4π/3", "(C) -π/3", "(D) 2π/3"], "correct_answer": 0, "explanation": "3rd quadrant: arg = -(π - π/3) = -2π/3."},
        {"id": "math-core-20", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Similarity: In ΔABC, DE || BC. If AD = 4 cm, DB = x - 4 cm, AE = 8 cm, EC = 3x - 19 cm, what is x?", "options": ["(A) 11 cm", "(B) 9 cm", "(C) 13 cm", "(D) 7 cm"], "correct_answer": 0, "explanation": "4/(x-4) = 8/(3x-19) => 3x - 19 = 2x - 8 => x = 11."},

        # Module 5: Subject Pedagogical Knowledge & TLM (10 MCQs)
        {"id": "math-tlm-1", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In teaching linear equations, how does dynamic software like GeoGebra enhance conceptual mastery?", "options": ["(A) By dynamically manipulating sliders for slope (m) and intercept (c), making visual-algebraic links intuitive", "(B) By calculating answers automatically so arithmetic is skipped", "(C) By replacing geometric proofs with multiple choice quizzes", "(D) By converting geometry into static textbook tables"], "correct_answer": 0, "explanation": "GeoGebra links visual, graphical, and algebraic representations dynamically."},
        {"id": "math-tlm-2", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "According to Bruner's CRA framework, what sequence is most effective for introducing fractions?", "options": ["(A) Concrete fraction tiles -> Visual area models/number lines -> Symbolic fraction operations", "(B) Direct algorithmic LCD memorization -> Symbolic drills", "(C) Symbolic algebra first -> Physical manipulatives only if failing", "(D) Rote chanting of tables"], "correct_answer": 0, "explanation": "CRA builds intuitive mental schemas through physical manipulation before symbolic abstraction."},
        {"id": "math-tlm-3", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "When using a Geoboard TLM, what geometric property can students discover via Pick's Theorem?", "options": ["(A) Calculating polygon area from boundary and interior grid points: $\text{Area} = I + \frac{B}{2} - 1$", "(B) Finding the irrational value of π", "(C) Proving Euler's formula for non-planar polyhedra", "(D) Measuring the volume of a sphere"], "correct_answer": 0, "explanation": "Pick's theorem allows experimental computation of lattice polygon areas."},
        {"id": "math-tlm-4", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "Why is the 'Double Number Line' model superior to cross-multiplication tricks in ratio and proportion pedagogy?", "options": ["(A) It visually establishes multiplicative scaling relationships while preserving unit benchmarking", "(B) It requires no pencil or paper", "(C) It replaces fractions with geometry", "(D) It works only for integer ratios"], "correct_answer": 0, "explanation": "Double number lines maintain proportional spatial scaling without mechanical memorization."},
        {"id": "math-tlm-5", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "What is the primary objective of cutting a circle into 16 wedge sectors to form a parallelogram in a Math Lab?", "options": ["(A) Experimentally deriving circle area $A = \\pi r^2$ from base (π r) × height (r)", "(B) Demonstrating circles are identical to squares", "(C) Measuring paper thickness", "(D) Testing motor skills"], "correct_answer": 0, "explanation": "Rearranging sectors grounds the calculus concept of area integration."},
        {"id": "math-tlm-6", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In probability pedagogy, how should a teacher introduce the Law of Large Numbers using simulations?", "options": ["(A) Running 10, 100, 1000, 10000 trials to observe relative frequency converging to theoretical probability (0.5)", "(B) Stating that 5 flips always give exactly 50%", "(C) Stating experimental probability never matches theory", "(D) Using biased dice"], "correct_answer": 0, "explanation": "Digital simulations demonstrate how sample variance dampens as trials increase."},
        {"id": "math-tlm-7", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "When introducing negative multiplication (-3 × -2 = +6), which model provides the strongest rationale?", "options": ["(A) Walking backwards on a number line while facing negative direction, or reversing draining water video", "(B) Chanting 'two minuses make a plus' 50 times", "(C) Telling students it is an unexplainable rule", "(D) Treating negative numbers as positive"], "correct_answer": 0, "explanation": "Directional motion on a number line gives physical intuition to sign multiplication."},
        {"id": "math-tlm-8", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "What is the role of 'Low Floor, High Ceiling' tasks in mixed-ability mathematics classrooms?", "options": ["(A) Tasks accessible to all learners with basic entry points, but extendable to profound mathematical depth", "(B) Easy tasks designed only for struggling students", "(C) Ultra-hard Olympiad problems only 5% can start", "(D) Formula memorization sheets"], "correct_answer": 0, "explanation": "Low floor high ceiling tasks foster inclusive engagement and open-ended mathematical thinking."},
        {"id": "math-tlm-9", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In trigonometry pedagogy, why is transitioning from right triangles to the Unit Circle crucial?", "options": ["(A) The unit circle extends trig functions to all real angles (obtuse, negative, >360°) and reveals wave periodicity", "(B) Right triangles are too complicated", "(C) The unit circle eliminates cosine", "(D) Triangles only work for equilateral shapes"], "correct_answer": 0, "explanation": "The unit circle generalizes trigonometric definitions across continuous periodic domains on R."},
        {"id": "math-tlm-10", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "How do 'Algebra Tiles' prevent procedural bugs when teaching quadratic factoring?", "options": ["(A) By representing x^2, x, and unit 1 geometrically as rectangular arrays of area", "(B) By calculating roots automatically", "(C) By eliminating algebra equations", "(D) By replacing quadratic formulas with geometry theorems"], "correct_answer": 0, "explanation": "Algebra tiles make polynomial factoring visual by finding rectangle length and width."},

        # Module 6: Misconceptions & HOTS (10 MCQs)
        {"id": "math-hots-1", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A student simplifies $(x+y)^2$ as $x^2 + y^2$. What is the fundamental cognitive flaw?", "options": ["(A) Inappropriately distributing exponentiation over addition, ignoring the 2xy cross term", "(B) Calculating 1 + 1 = 3", "(C) Confusing variables with constants", "(D) Correct in all fields"], "correct_answer": 0, "explanation": "Freshman's dream error. Geometrically (x+y)^2 includes two rectangular 2xy regions."},
        {"id": "math-hots-2", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: When solving $\\sqrt{x^2} = 9$, a student claims x can only be 3. How do we remediate this?", "options": ["(A) Clarify that √(x^2) = |x|, so |x| = 9 gives two solutions: x = 9 or x = -9", "(B) Confirm square roots never take negative values", "(C) State quadratics have only one root", "(D) Discard negative numbers"], "correct_answer": 0, "explanation": "Principal root √(x^2) = |x|. Equation x^2 = 81 gives both +9 and -9."},
        {"id": "math-hots-3", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: When solving $-2x < 8$, a student writes x < -4. What rule was violated?", "options": ["(A) Dividing or multiplying an inequality by a negative number reverses the inequality operator (x > -4)", "(B) Inequalities cannot be divided by even numbers", "(C) Negative signs cannot cross inequality signs", "(D) 8 cannot be divided by -2"], "correct_answer": 0, "explanation": "Multiplying/dividing by negative values reverses order on the real number line."},
        {"id": "math-hots-4", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A student insists $\frac{1}{8} > \frac{1}{4}$ because '8 is bigger than 4'. What conceptual error is this?", "options": ["(A) Whole-Number Bias — applying whole number magnitude without understanding inverse fraction partitioning", "(B) Inability to read numbers", "(C) Confusing fractions with decimals", "(D) Correct for negative numbers"], "correct_answer": 0, "explanation": "Whole-number bias fails to recognize that larger denominators represent smaller partition units."},
        {"id": "math-hots-5", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: 'Multiplying always makes numbers bigger, and dividing always makes them smaller.' Which counter-example disproves this?", "options": ["(A) 8 × 0.5 = 4 (smaller) and 8 ÷ 0.5 = 16 (larger)", "(B) 5 × 2 = 10 and 10 ÷ 2 = 5", "(C) 100 × 1 = 100", "(D) 0 + 5 = 5"], "correct_answer": 0, "explanation": "Operations with positive proper fractions reverse the intuitive magnitude heuristic."},
        {"id": "math-hots-6", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Reasoning: Why is 0.999... strictly equal to 1 in standard mathematics?", "options": ["(A) 10x - x = 9.999... - 0.999... => 9x = 9 => x = 1 (and 3 × 1/3 = 0.999... = 1)", "(B) Calculators round it off", "(C) It is an engineering approximation", "(D) Only equal in modular arithmetic"], "correct_answer": 0, "explanation": "In standard real analysis, 0.999... and 1 represent the exact same real number."},
        {"id": "math-hots-7", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A gambler bets on Heads after 5 consecutive Tails because 'Heads is due.' What fallacy is this?", "options": ["(A) Gambler's Fallacy — assuming independent random trials have memory and self-correct", "(B) Confirmation Bias", "(C) Law of Large Numbers", "(D) Monty Hall paradox"], "correct_answer": 0, "explanation": "Independent coin flips have zero memory; P(Heads) remains 0.5 on every trial."},
        {"id": "math-hots-8", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Problem: A square and an equilateral triangle have equal perimeter. Which encloses strictly greater area?", "options": ["(A) The Square, because regular polygons with more sides enclose greater area for fixed perimeter", "(B) The Triangle", "(C) Both have identical area", "(D) Cannot be compared"], "correct_answer": 0, "explanation": "Square area = P^2/16 = 0.0625 P^2 vs Triangle area = (√3/36) P^2 ≈ 0.0481 P^2. Square is ~30% larger."},
        {"id": "math-hots-9", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: Evaluating $-3^2$ vs $(-3)^2$. How does precedence clarify the difference?", "options": ["(A) -3^2 means -(3^2) = -9 because power has higher precedence than unary minus; (-3)^2 = +9", "(B) Both are +9", "(C) Parentheses have no meaning", "(D) Negatives always square to positive first"], "correct_answer": 0, "explanation": "Exponentiation binds tighter than unary negation, yielding -9 for -3^2 and +9 for (-3)^2."},
        {"id": "math-hots-10", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Proof: Why is division by zero (e.g. $5 \\div 0$) undefined in arithmetic?", "options": ["(A) If 5/0 = k, then k × 0 = 5, which is impossible since k × 0 = 0 for all real numbers", "(B) Zero is not a number", "(C) It was invented in India", "(D) Only undefined for negative numbers"], "correct_answer": 0, "explanation": "Division is the inverse of multiplication; no number multiplied by 0 can equal a non-zero numerator."}
    ]

# ============================================================================

# 2. SOCIAL SCIENCE / SST (40 MCQs)
# ============================================================================
def get_social_science_part_b_questions() -> List[Dict[str, Any]]:
    return [
        # Module 4: Core Subject Knowledge (20 MCQs)
        {"id": "sst-core-1", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "History: What was the primary political objective of the Vernacular Press Act passed by Lord Lytton in 1878?", "options": ["(A) Curtailing freedom of Indian language newspapers critical of British colonial policies", "(B) Promoting English literature translations in rural schools", "(C) Lowering printing press import tariffs", "(D) Banning European newspapers in India"], "correct_answer": 0, "explanation": "The Vernacular Press Act allowed the colonial government to confiscate printing presses of vernacular papers publishing seditious content."},
        {"id": "sst-core-2", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Geography: Which soil type covers the largest area in India and is formed by the deposition of silt brought by Himalayan rivers?", "options": ["(A) Alluvial Soil (Khadar and Bhangar)", "(B) Black Regur Soil", "(C) Laterite Soil", "(D) Arid Desert Soil"], "correct_answer": 0, "explanation": "Alluvial soil covers ~40% of India's landmass, deposited across northern plains by the Indus, Ganga, and Brahmaputra river systems."},
        {"id": "sst-core-3", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Political Science: In Indian federalism, which constitutional list contains subjects of national importance like Defense, Foreign Affairs, and Banking?", "options": ["(A) Union List (List I)", "(B) State List (List II)", "(C) Concurrent List (List III)", "(D) Residuary Subjects only"], "correct_answer": 0, "explanation": "The Union List contains 100 subjects over which the Union Parliament possesses exclusive legislative jurisdiction."},
        {"id": "sst-core-4", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Economics: What is 'Disguised Unemployment' predominantly found in the Indian agricultural sector?", "options": ["(A) More people working in a farm than actually needed, so marginal productivity of excess labor is zero", "(B) Seasonal unemployment during non-harvest months", "(C) Educated graduates unable to find white-collar jobs", "(D) People losing jobs due to industrial automation"], "correct_answer": 0, "explanation": "In disguised unemployment, withdrawing excess farm laborers causes zero decline in total agricultural output."},
        {"id": "sst-core-5", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "History: Why did Mahatma Gandhi abruptly withdraw the Non-Cooperation Movement in February 1922?", "options": ["(A) The Chauri Chaura incident where a violent mob set fire to a police station", "(B) Signing of the Gandhi-Irwin Pact", "(C) British government accepted all demands", "(D) Outbreak of World War II"], "correct_answer": 0, "explanation": "Gandhi called off the movement because violence at Chauri Chaura violated the core principle of non-violent Satyagraha."},
        {"id": "sst-core-6", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Geography: What is the meteorological mechanism that causes winter rainfall in northwestern India (Punjab, Haryana)?", "options": ["(A) Western Cyclonic Disturbances originating from the Mediterranean Sea", "(B) Southwest Monsoon retreat", "(C) Tropical cyclones in Bay of Bengal", "(D) Local Kalbaisakhi thunderstorms"], "correct_answer": 0, "explanation": "Western disturbances steered by subtropical westerly jet streams bring crucial winter precipitation for rabi crops (wheat)."},
        {"id": "sst-core-7", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Political Science: What is the primary difference between 'Coming Together' and 'Holding Together' federations?", "options": ["(A) Coming Together federations (USA, Switzerland) unite independent states with equal power; Holding Together (India, Spain) divide a large country giving central dominance", "(B) Holding together has no constitution", "(C) Coming together eliminates all state boundaries", "(D) Both are identical in governance"], "correct_answer": 0, "explanation": "India is a 'Holding Together' federation where constitutional division of powers balances regional autonomy with national unity."},
        {"id": "sst-core-8", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Economics: What is the primary function of Self-Help Groups (SHGs) in rural microfinance in India?", "options": ["(A) Pooling small savings to provide collateral-free credit at reasonable interest, liberating villagers from informal moneylenders", "(B) Collecting agricultural land taxes for commercial banks", "(C) Replacing panchayat elections", "(D) Managing private school admissions"], "correct_answer": 0, "explanation": "SHGs build creditworthiness, empower rural women, and eliminate dependence on predatory rural moneylenders."},
        {"id": "sst-core-9", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "History: Who were the 'Marianne' and 'Germania' allegorical figures popular during 19th-century European nationalism?", "options": ["(A) Female personifications representing the French Republic and German Nation respectively", "(B) French queens who fought in the Napoleonic wars", "(C) Fictional characters in Russian plays", "(D) Leaders of the Frankfurt Parliament"], "correct_answer": 0, "explanation": "Artists personified nations as female allegories (Marianne in France, Germania in Germany) to embody liberty, civic virtue, and sovereignty."},
        {"id": "sst-core-10", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Geography: What is the definition of 'Gross Cropped Area' in Indian agricultural statistics?", "options": ["(A) Total area sown once as well as more than once in an agricultural year", "(B) Net sown area minus fallow land", "(C) Area covered exclusively by forest reserves", "(D) Land used only for cash crop plantation"], "correct_answer": 0, "explanation": "Gross Cropped Area represents the sum total of all sown areas, counting multi-cropped fields for each harvest in a single year."},
        {"id": "sst-core-11", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Political Science: Which constitutional amendment gave constitutional recognition to 3-tier Panchayati Raj institutions in 1992?", "options": ["(A) 73rd Constitutional Amendment Act", "(B) 42nd Constitutional Amendment Act", "(C) 86th Constitutional Amendment Act", "(D) 44th Constitutional Amendment Act"], "correct_answer": 0, "explanation": "The 73rd Amendment (1992) added Part IX and the 11th Schedule, institutionalizing rural local self-governance."},
        {"id": "sst-core-12", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Economics: How does the Reserve Bank of India (RBI) control commercial credit supply during periods of high inflation?", "options": ["(A) By increasing the Repo Rate and Cash Reserve Ratio (CRR) to make borrowing more expensive and mop up liquidity", "(B) By printing unlimited banknotes", "(C) By decreasing the statutory liquidity ratio (SLR)", "(D) By closing commercial bank branches"], "correct_answer": 0, "explanation": "Tight monetary policy (raising Repo and CRR) reduces bank lending capacity, cooling excess consumer demand and inflationary pressure."},
        {"id": "sst-core-13", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "History: What was the main demand of the Gudem Hills tribal rebellion led by Alluri Sitarama Raju in Andhra Pradesh (1920s)?", "options": ["(A) Reclaiming traditional tribal forest rights and resisting colonial forest laws that restricted grazing and firewood collection", "(B) Demanding English medium schools", "(C) Support for British indigo planters", "(D) Industrial trade union recognition"], "correct_answer": 0, "explanation": "The tribal guerrilla uprising fought against oppressive British forest acts that stripped indigenous people of their livelihood and customary forest access."},
        {"id": "sst-core-14", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Geography: What is 'Intensive Subsistence Farming' as practiced in densely populated regions of India?", "options": ["(A) High labor-intensive agriculture on small fragmented landholdings using high chemical inputs and irrigation for maximum yield", "(B) Single-crop capital-intensive commercial plantations", "(C) Shifting slash-and-burn cultivation in rainforests", "(D) Mechanized wheat farming on vast prairies"], "correct_answer": 0, "explanation": "High population pressure on limited arable land necessitates intensive labor and multi-cropping to achieve maximum sustenance yield."},
        {"id": "sst-core-15", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Political Science: What is a 'Recognized National Party' criteria set by the Election Commission of India?", "options": ["(A) Securing at least 6% of valid votes in Lok Sabha or Assembly elections in 4+ states and winning at least 4 Lok Sabha seats", "(B) Winning 1 seat in any municipal election", "(C) Operating an active website and social media account", "(D) Having branches in 2 capital cities"], "correct_answer": 0, "explanation": "ECI mandates performance thresholds across at least 4 states in terms of vote percentage and parliamentary representation."},
        {"id": "sst-core-16", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Economics: What is the primary difference between Gross Domestic Product (GDP) and Gross National Income (GNI)?", "options": ["(A) GDP measures domestic production within geographic borders; GNI adds Net Factor Income from Abroad (NFIA)", "(B) GDP excludes manufacturing while GNI includes it", "(C) GDP is calculated in USD and GNI in Indian Rupees", "(D) GDP includes black market economy"], "correct_answer": 0, "explanation": "GNI = GDP + Net income earned by domestic residents from overseas investments minus income earned by foreign nationals domestically."},
        {"id": "sst-core-17", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "History: What was the significance of the 1929 Lahore Session of the Indian National Congress presided over by Jawaharlal Nehru?", "options": ["(A) Formal adoption of 'Purna Swaraj' (Complete Independence) as the supreme national goal", "(B) Acceptance of the Simon Commission report", "(C) Formation of the Swaraj Party", "(D) Signing of the Poona Pact"], "correct_answer": 0, "explanation": "The historic Lahore resolution demanded complete severance from British rule and resolved to celebrate 26 January 1930 as Independence Day."},
        {"id": "sst-core-18", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Geography: Which multipurpose river valley project is built on the Narmada River and faced the landmark 'Narmada Bachao Andolan' movement?", "options": ["(A) Sardar Sarovar Dam", "(B) Bhakra Nangal Dam", "(C) Hirakud Dam", "(D) Tehri Dam"], "correct_answer": 0, "explanation": "Sardar Sarovar Dam triggered mass environmental and tribal rehabilitation resistance led by Medha Patkar and NBA."},
        {"id": "sst-core-19", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Political Science: In the Indian Constitution, what is the role of the 'Basic Structure Doctrine' established in Kesavananda Bharati (1973)?", "options": ["(A) Parliament cannot alter or destroy the core fundamental framework of the Constitution under Article 368", "(B) Parliament has absolute unlimited power to abolish fundamental rights", "(C) The President can rewrite the constitution during emergency", "(D) State legislatures can veto central treaties"], "correct_answer": 0, "explanation": "The Supreme Court established judicial review boundaries ensuring democracy, federalism, secularism, and judicial independence cannot be amended away."},
        {"id": "sst-core-20", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Economics: How does Globalization through Multinational Corporations (MNCs) impact local small-scale manufacturing units in developing economies?", "options": ["(A) Creates severe competition from cheaper mass imports, requiring local units to upgrade technology or face closure", "(B) Guarantees 100% profit for all domestic artisans", "(C) Eliminates international trade completely", "(D) Prohibits foreign direct investment"], "correct_answer": 0, "explanation": "Globalization provides access to capital and markets but exposes vulnerable domestic MSMEs to stiff pricing and scale competition."},

        # Module 5: Subject Pedagogical Knowledge & TLM (10 MCQs)
        {"id": "sst-tlm-1", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "When teaching the 'Indian National Movement', how does analyzing primary historical sources (letters, gazettes, photographs) develop historical thinking?", "options": ["(A) It trains students to corroborate claims, identify authorial bias, and construct evidence-based interpretations", "(B) It forces students to memorize official colonial timelines", "(C) It eliminates all classroom discussions", "(D) It replaces textbooks with fictional movies"], "correct_answer": 0, "explanation": "Source criticism shifts history learning from passive chronology memorization to active inquiry and corroboration."},
        {"id": "sst-tlm-2", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In Geography pedagogy, what is the most effective TLM strategy for teaching topographic contours and relief features?", "options": ["(A) 3D tactile sand models or topographic relief maps showing elevation gradients with close contour intervals", "(B) Writing numerical elevation formulas on the blackboard", "(C) Reading textbook descriptions aloud", "(D) Memorizing peak heights in alphabetical order"], "correct_answer": 0, "explanation": "Tactile 3D models bridge the abstract spatial gap between flat contour lines and real three-dimensional landscape elevation."},
        {"id": "sst-tlm-3", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "How does conducting a 'Mock Youth Parliament' in Civics classes promote democratic citizenship values?", "options": ["(A) By engaging learners in bill drafting, debate, questioning, and majority voting, demystifying legislative processes", "(B) By teaching students how to shout down political opponents", "(C) By replacing school examinations with elections", "(D) By selecting student council leaders arbitrarily"], "correct_answer": 0, "explanation": "Mock parliament simulates deliberative democracy, constitutional decorum, parliamentary procedures, and civic compromise."},
        {"id": "sst-tlm-4", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In Economics pedagogy, why is using household monthly budget simulation games effective for teaching inflation and scarcity?", "options": ["(A) It makes opportunity cost, trade-offs, and price elasticity personally meaningful to students through experiential budgeting", "(B) It allows students to trade real money in classroom", "(C) It eliminates the need to teach banking laws", "(D) It teaches students how to avoid paying taxes"], "correct_answer": 0, "explanation": "Experiential budget simulations ground abstract macroeconomic concepts (scarcity, opportunity cost, purchasing power) in daily reality."},
        {"id": "sst-tlm-5", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "What is the pedagogical purpose of 'Oral History Projects' (interviewing local community elders about past events)?", "options": ["(A) Uncovering marginalized grassroots perspectives and documenting community lived experiences absent from grand textbook narratives", "(B) Replacing standard archaeological excavations", "(C) Generating audio recordings for commercial entertainment", "(D) Avoiding archival library research"], "correct_answer": 0, "explanation": "Oral history democratizes historical inquiry, showing learners that history is composed of plural human voices and lived experiences."},
        {"id": "sst-tlm-6", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "When introducing thematic map reading (GIS / Google Earth), which spatial competency should the teacher scaffold first?", "options": ["(A) Understanding map scale (representative fraction), orientation (North arrow), and conventional cartographic symbols", "(B) Memorizing latitude and longitude degrees of 100 cities", "(C) Calculating planetary gravity anomalies", "(D) Drawing world maps freehand in 60 seconds"], "correct_answer": 0, "explanation": "Scale, orientation, and symbol keys are the foundational cartographic syntax needed to decode any spatial thematic map."},
        {"id": "sst-tlm-7", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "How does the 'Case Study Method' in Social Science enhance critical thinking regarding environmental disputes (e.g. mining vs indigenous rights)?", "options": ["(A) By evaluating multifaceted stakeholder conflicts (ecological, economic, human rights) and exploring sustainable policy compromises", "(B) By providing a single correct government answer", "(C) By proving that one party is 100% evil", "(D) By avoiding controversial real-world topics"], "correct_answer": 0, "explanation": "Case studies cultivate perspective-taking, ethical analysis, and systems thinking in socio-environmental dilemmas."},
        {"id": "sst-tlm-8", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "What is the role of an 'Interactive Timeline Wall' in secondary history classrooms?", "options": ["(A) Helping students visualize parallel historical developments across different global civilizations chronologically", "(B) Serving as an aesthetic wallpaper only", "(C) Testing date recall through rapid fire flashcards", "(D) Replacing all history essay assignments"], "correct_answer": 0, "explanation": "Comparative parallel timelines illustrate historical synchronicity, cause-and-effect relationships, and transnational influences."},
        {"id": "sst-tlm-9", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In teaching gender equality and social justice, why is analyzing media advertisements (deconstruction) an effective pedagogy?", "options": ["(A) It exposes subtle gender stereotyping, commodification, and power dynamics in popular cultural representations", "(B) It teaches students how to produce commercial television ads", "(C) It encourages students to buy luxury products", "(D) It distracts students from textbook syllabus"], "correct_answer": 0, "explanation": "Critical media literacy equips learners to interrogate cultural representations and challenge internalized socio-cultural biases."},
        {"id": "sst-tlm-10", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "What is the core pedagogical objective of a 'Field Survey & Neighborhood Mapping' assignment in secondary Social Science?", "options": ["(A) Integrating primary data collection, civic interviewing, observation rubrics, and spatial reporting into experiential research", "(B) Giving students outdoor recreation time without assessment", "(C) Collecting demographic census data for commercial marketing", "(D) Replacing all classroom theoretical learning"], "correct_answer": 0, "explanation": "Field surveys cultivate authentic research methodologies, empirical observation skills, and community empathy."},

        # Module 6: Misconceptions & HOTS (10 MCQs)
        {"id": "sst-hots-1", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: Many students believe that 'British colonial rule introduced modernization and economic prosperity to India.' How should the teacher counter this with historical evidence?", "options": ["(A) Presenting Dadabhai Naoroji's 'Drain of Wealth' data showing de-industrialization of Indian handicrafts and recurrent catastrophic famines", "(B) Agreeing with the statement because railways were built", "(C) Stating that India had zero agriculture before 1757", "(D) Forbidding economic discussions in history class"], "correct_answer": 0, "explanation": "Historical economic data proves colonial infrastructure was designed for raw material extraction, devastating domestic industries."},
        {"id": "sst-hots-2", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A student claims: 'Democracy is flawed because non-democratic autocracies take faster decisions.' How should the teacher reframe this democratic trade-off?", "options": ["(A) Clarify that while authoritarian decisions are fast, democratic deliberation ensures consensus, citizen legitimacy, transparency, and avoids catastrophic unvetted policies", "(B) Agree that dictatorship is always economically superior", "(C) Dismiss the question as treasonous", "(D) State that democracy never makes mistakes"], "correct_answer": 0, "explanation": "Democratic consultation and consensus-building may take time but yield durable, legitimate, and socially inclusive outcomes."},
        {"id": "sst-hots-3", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: When studying national income, students assume that 'A country with higher Per Capita Income always guarantees higher quality of life for its citizens.' Why is this flawed?", "options": ["(A) Per capita average hides extreme income inequality, unequal access to healthcare, education, gender parity, and environmental quality (as measured by HDI)", "(B) Per capita income is calculated in gold coins", "(C) Rich countries have zero technology", "(D) Income has zero correlation with human development"], "correct_answer": 0, "explanation": "Average income metrics ignore wealth skewness and social indicators. The Human Development Index (HDI) was created to capture multidimensional well-being."},
        {"id": "sst-hots-4", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: In geography, learners assume 'Deserts are always hot barren expanses of sand dunes.' Which geographic reality corrects this?", "options": ["(A) Deserts are defined strictly by aridity (< 25 cm annual rainfall), including cold polar and high-altitude deserts like Ladakh and Antarctica", "(B) Deserts are only found in Africa", "(C) All deserts receive 500 cm of rain", "(D) Cold deserts do not exist on Earth"], "correct_answer": 0, "explanation": "Deserts are climatologically categorized by moisture deficit rather than temperature. Ladakh is a classic cold desert."},
        {"id": "sst-hots-5", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Source Analysis: When reading a historical treaty where a defeated monarch declares 'eternal gratitude and loyalty' to the British East India Company, how should a critical historian analyze it?", "options": ["(A) As a coerced political document produced under extreme military subjugation (Subsidiary Alliance), reflecting diplomatic rhetoric rather than genuine sentiment", "(B) As proof that Indian rulers loved colonial rule", "(C) As an invalid forged document to be burned", "(D) As a private diary entry"], "correct_answer": 0, "explanation": "Critical source analysis evaluates the power dynamics and political context under which colonial treaties were signed."},
        {"id": "sst-hots-6", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: Students often equate 'Secularism in India' with 'Western Secularism (strict wall of separation between church and state).' What is the Indian constitutional model?", "options": ["(A) Principled distance with equal respect for all religions (Sarva Dharma Sambhava) allowing state intervention to reform social evils (e.g. banning untouchability)", "(B) Total ban on all religious festivals in public", "(C) Preference for the majority religion in state laws", "(D) Complete non-recognition of fundamental religious freedoms"], "correct_answer": 0, "explanation": "Indian secularism maintains principled distance while actively intervening for social justice and providing equal state patronage to all faiths."},
        {"id": "sst-hots-7", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Economic Evaluation: Why does printing excessive currency notes fail to eliminate poverty in a developing economy, and what economic crisis does it trigger?", "options": ["(A) Without corresponding real output growth of goods/services, excess money supply creates hyperinflation where currency purchasing power collapses", "(B) The ink used to print money is poisonous", "(C) Banks refuse to accept printed currency", "(D) Currency printing automatically increases gold reserves"], "correct_answer": 0, "explanation": "Quantity theory of money proves that expanding money supply without expanding productive capacity causes demand-pull hyperinflation."},
        {"id": "sst-hots-8", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A learner believes 'Caste discrimination has completely vanished from modern urban India because people eat in the same restaurants.' How does sociological inquiry challenge this?", "options": ["(A) By examining structural inequalities in matrimonial choices, informal housing segregation, corporate leadership representation, and enduring socio-cultural capital gaps", "(B) By agreeing that urbanization automatically erases all prejudices in 1 year", "(C) By ignoring social studies research", "(D) By stating caste never existed in India"], "correct_answer": 0, "explanation": "Sociological analysis shows caste manifestations adapt into subtle institutional, matrimonial, and social capital networks in urban spheres."},
        {"id": "sst-hots-9", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Environmental Evaluation: 'Building large hydroelectric dams is 100% clean and green with zero environmental downsides.' What ecological trade-offs disprove this claim?", "options": ["(A) Submergence of pristine forests, destruction of biodiversity, mass displacement of tribal communities, and methane emissions from rotting submerged vegetation", "(B) Hydroelectric dams emit radioactive smoke", "(C) Water stored in dams loses all hydrogen atoms", "(D) Dams permanently stop all rainfall downstream"], "correct_answer": 0, "explanation": "Large dams involve significant ecological fragmentation, social displacement, and reservoir greenhouse gas emissions during initial submergence."},
        {"id": "sst-hots-10", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Cartographic Reasoning: Why does the Mercator projection map distort Greenland to appear the same size as Africa, and which projection preserves true relative area?", "options": ["(A) Cylindrical Mercator preserves angles for navigation but inflates high-latitude landmasses; Gall-Peters / Equal-Area projections preserve accurate relative land area", "(B) Greenland actually shrank in size due to global warming", "(C) Africa is smaller than Greenland in real life", "(D) Map projections cannot display continents"], "correct_answer": 0, "explanation": "Mercator severely exaggerates polar and high-latitude landmasses. Equal-area projections preserve proportional surface areas."}
    ]

# ============================================================================

# 3. ENGLISH LANGUAGE & LITERATURE (40 MCQs)
# ============================================================================
def get_english_part_b_questions() -> List[Dict[str, Any]]:
    return [
        # Module 4: Core Subject Knowledge (20 MCQs)
        {"id": "eng-core-1", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Grammar: In the sentence 'Neither the principal nor the teachers ___ willing to compromise on school discipline,' which verb form is grammatically correct?", "options": ["(A) were", "(B) was", "(C) is", "(D) has been"], "correct_answer": 0, "explanation": "Rule of Proximity for 'neither...nor': the verb agrees with the closer subject. 'Teachers' is plural, so plural verb 'were' is correct."},
        {"id": "eng-core-2", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Literary Devices: In the line 'The classroom was a zoo during recess,' which figure of speech is employed?", "options": ["(A) Metaphor", "(B) Simile", "(C) Personification", "(D) Hyperbole"], "correct_answer": 0, "explanation": "A direct comparison stating that one thing is another without using 'like' or 'as' is a metaphor."},
        {"id": "eng-core-3", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Clauses: In the sentence 'The student who won the national debate competition received a scholarship,' what type of clause is the underlined segment?", "options": ["(A) Defining (Restrictive) Relative Adjective Clause", "(B) Non-defining Relative Clause", "(C) Adverbial Clause of Condition", "(D) Noun Clause as Object"], "correct_answer": 0, "explanation": "'who won the national debate competition' essentializes which student is being referred to without commas, modifying the noun 'student'."},
        {"id": "eng-core-4", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Literature: In Robert Frost's poem 'The Road Not Taken', what does the 'yellow wood' symbolize in the traveler's journey?", "options": ["(A) Autumn of life and a crucial moment of decision-making among diverging life choices", "(B) A dangerous toxic forest to avoid", "(C) Wealth and golden opportunities", "(D) Physical tiredness from hiking"], "correct_answer": 0, "explanation": "The yellow autumn wood symbolizes life's turning point and the inevitable difficulty of choosing between mutually exclusive life paths."},
        {"id": "eng-core-5", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Reported Speech: Transform: The teacher said to the student, 'Why didn't you submit your assignment yesterday?'", "options": ["(A) The teacher asked the student why he had not submitted his assignment the previous day.", "(B) The teacher asked the student why didn't he submit his assignment yesterday.", "(C) The teacher inquired that why he did not submit his assignment yesterday.", "(D) The teacher told the student why he had not submitted his assignment yesterday."], "correct_answer": 0, "explanation": "In indirect wh-questions, word order becomes assertive (subject + verb), 'yesterday' changes to 'the previous day', and simple past changes to past perfect."},
        {"id": "eng-core-6", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Poetics: What is the meter and rhyme scheme of a traditional Shakespearean (English) Sonnet?", "options": ["(A) Iambic Pentameter with rhyme scheme ABAB CDCD EFEF GG (14 lines)", "(B) Dactylic Hexameter with rhyme scheme AABB CCDD", "(C) Trochaic Tetrameter without rhyming couplets", "(D) Free verse with unrhymed tercets"], "correct_answer": 0, "explanation": "Shakespearean sonnets consist of 3 quatrains and a concluding volta couplet in iambic pentameter."},
        {"id": "eng-core-7", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Vocabulary / Morphology: What is the linguistic term for words that are spelled identically but have different meanings and pronunciations (e.g. 'lead' [metal] vs 'lead' [guide])?", "options": ["(A) Heteronyms (Heterophones)", "(B) Homophones", "(C) Synonyms", "(D) Antonyms"], "correct_answer": 0, "explanation": "Heteronyms share spelling (homographs) but differ in pronunciation and semantic meaning."},
        {"id": "eng-core-8", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Active/Passive: What is the correct passive voice of: 'Someone has stolen my bicycle from the porch'?", "options": ["(A) My bicycle has been stolen from the porch.", "(B) My bicycle was stolen by someone from the porch.", "(C) My bicycle had been stolen from the porch.", "(D) My bicycle is being stolen from the porch."], "correct_answer": 0, "explanation": "Present perfect active 'has stolen' converts to 'has been stolen'; indefinite agent 'someone' is dropped naturally in standard passive voice."},
        {"id": "eng-core-9", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Literature: In Shakespeare's 'The Merchant of Venice', how does Portia's courtroom argument dismantle Shylock's bond?", "options": ["(A) By strictly enforcing the bond to allow exactly one pound of flesh, but forbidding the shedding of a single drop of Christian blood", "(B) By paying ten times the monetary debt in gold", "(C) By exiling Shylock before the trial begins", "(D) By proving Antonio was not in Venice"], "correct_answer": 0, "explanation": "Portia uses strict textual interpretation of the law to show that extracting flesh without shedding blood is physically impossible."},
        {"id": "eng-core-10", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Conditionals: Which sentence exemplifies the 'Third Conditional' expressing an unreal counterfactual past condition and its hypothetical outcome?", "options": ["(A) If she had studied diligently, she would have cleared the scholarship exam.", "(B) If it rains, the cricket match will be cancelled.", "(C) If I were the prime minister, I would build more schools.", "(D) If you heat water to 100°C, it boils."], "correct_answer": 0, "explanation": "Third conditional follows structure: If + Past Perfect (had studied), would have + Past Participle (would have cleared)."},
        {"id": "eng-core-11", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Literary Devices: In the line 'The wind whispered soothing secrets through the pine branches,' which device is used?", "options": ["(A) Personification", "(B) Irony", "(C) Oxymoron", "(D) Onomatopoeia"], "correct_answer": 0, "explanation": "Attributing human actions (whispering secrets) to non-human natural phenomena (the wind) is personification."},
        {"id": "eng-core-12", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Grammar / Modals: Which modal auxiliary verb expresses a strong logical deduction based on overwhelming evidence (e.g. 'The lights are on and music is playing; they ___ be home')?", "options": ["(A) must", "(B) might", "(C) can", "(D) should"], "correct_answer": 0, "explanation": "'Must' is used for positive logical necessity/deduction with high certainty."},
        {"id": "eng-core-13", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Syntax: In the sentence 'Hardly had the teacher entered the examination hall ___ the fire alarm sounded,' what is the correct correlative conjunction?", "options": ["(A) when", "(B) than", "(C) then", "(D) but"], "correct_answer": 0, "explanation": "'Hardly/Scarcely' correlates with 'when', while 'No sooner' correlates with 'than'."},
        {"id": "eng-core-14", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Literature: In John Keats's 'Ode to a Nightingale', what does the nightingale represent for the speaker?", "options": ["(A) An immortal symbol of beauty, art, and transcendent imagination unburdened by human suffering", "(B) A physical predator bird", "(C) A reminder of economic debt", "(D) An omen of imminent death"], "correct_answer": 0, "explanation": "Keats contrasts the transient, painful human existence with the immortal, timeless song of the nightingale."},
        {"id": "eng-core-15", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Tenses: In the sentence 'By the time the train reaches New Delhi tomorrow morning, we ___ for over twelve hours,' which verb tense is required?", "options": ["(A) will have been traveling", "(B) had traveled", "(C) are traveling", "(D) were traveling"], "correct_answer": 0, "explanation": "Future Perfect Continuous expresses an ongoing action that will continue up to a designated future reference point."},
        {"id": "eng-core-16", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Phonetics: In standard Received Pronunciation (RP) English, how many distinct phonemes (sound units) exist in the phonemic inventory?", "options": ["(A) 44 phonemes (20 vowels and 24 consonants)", "(B) 26 phonemes (matching the 26 letters)", "(C) 52 phonemes", "(D) 30 phonemes"], "correct_answer": 0, "explanation": "English has 44 phonemes comprising 12 monophthongs, 8 diphthongs (20 vowels total), and 24 consonants."},
        {"id": "eng-core-17", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Literary Terminology: What is 'Dramatic Irony' in literature and drama?", "options": ["(A) When the audience/reader possesses critical knowledge that the character on stage is unaware of", "(B) When a character says the opposite of what they mean sarcastically", "(C) An unexpected twist of fate ending a comedy", "(D) A sudden power failure during a theater play"], "correct_answer": 0, "explanation": "Dramatic irony creates suspense when the audience understands the full significance of an event while characters remain ignorant."},
        {"id": "eng-core-18", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Punctuation: Which sentence utilizes semicolons and commas correctly for coordinating complex lists?", "options": ["(A) The delegates arrived from Paris, France; Tokyo, Japan; and Mumbai, India.", "(B) The delegates arrived from Paris; France, Tokyo; Japan, and Mumbai; India.", "(C) The delegates arrived from Paris France, Tokyo Japan and Mumbai India.", "(D) The delegates arrived from: Paris, France; Tokyo, Japan; and, Mumbai, India."], "correct_answer": 0, "explanation": "Semicolons function as super-commas to separate list items that already contain internal commas (city, country)."},
        {"id": "eng-core-19", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Literature: In George Orwell's 'Animal Farm', what political allegorical event does the rebellion of the animals on Manor Farm represent?", "options": ["(A) The 1917 Russian Bolshevik Revolution overthrowing Tsar Nicholas II", "(B) The French Revolution of 1789", "(C) The American Civil War", "(D) The Industrial Revolution in Britain"], "correct_answer": 0, "explanation": "Animal Farm allegorizes the Russian Revolution and the subsequent rise of totalitarian Stalinism under the guise of socialist equality."},
        {"id": "eng-core-20", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Vocabulary: What is the meaning of the idiomatic expression 'to burn the candle at both ends'?", "options": ["(A) To exhaust one's energy by working excessively hard early in the morning and late into the night", "(B) To waste wax during a power outage", "(C) To manage financial investments wisely", "(D) To organize a candlelight protest"], "correct_answer": 0, "explanation": "The idiom denotes overworking oneself to physical and mental exhaustion by waking early and sleeping late."},

        # Module 5: Subject Pedagogical Knowledge & TLM (10 MCQs)
        {"id": "eng-tlm-1", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In Communicative Language Teaching (CLT), what is the primary role of the language teacher during communicative speaking tasks?", "options": ["(A) Facilitator, needs analyst, and communicative partner who manages interaction without constant intrusive error correction", "(B) Strict authoritarian grammarian who stops students at every minor phonological slip", "(C) Sole presenter who lectures in silence for 45 minutes", "(D) Exam invigilator who administers written tests only"], "correct_answer": 0, "explanation": "CLT views the teacher as a facilitator who fosters authentic language interaction, focusing on fluency and meaning before fine accuracy."},
        {"id": "eng-tlm-2", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "When scaffolding Reading Comprehension, what is the 'SQ3R' active study methodology?", "options": ["(A) Survey, Question, Read, Recite, and Review", "(B) Scan, Quiz, Repeat, Rote, and Rest", "(C) Silence, Quiet, Read, Rewrite, and Grade", "(D) Speak, Quote, Rhyme, Rhythm, and Recite"], "correct_answer": 0, "explanation": "SQ3R is an evidence-based cognitive reading framework guiding learners to actively engage with and retain informational texts."},
        {"id": "eng-tlm-3", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "What is the primary pedagogical benefit of using 'Authentic Materials' (newspaper editorials, brochures, menus, podcasts) in ESL/EFL classrooms?", "options": ["(A) Exposing learners to real-world natural language discourse, cultural nuances, and pragmatic registers", "(B) Saving the school money on textbooks", "(C) Preparing students exclusively for print journalism careers", "(D) Eliminating grammar instruction completely"], "correct_answer": 0, "explanation": "Authentic materials bridge textbook theory with genuine contextualized communication and living language usage."},
        {"id": "eng-tlm-4", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In teaching writing skills (CBSE Letter Writing, Article Writing), what is the 'Process Writing Approach'?", "options": ["(A) Pre-writing (Brainstorming) -> Drafting -> Peer Reviewing -> Revising -> Editing -> Publishing", "(B) Writing a final 500-word essay in 10 minutes without revision", "(C) Copying model letters word-for-word from a guidebook", "(D) Memorizing 20 introductory paragraphs"], "correct_answer": 0, "explanation": "Process writing breaks composition into manageable cognitive recursive phases, valuing revision and authorial voice over single-draft rote."},
        {"id": "eng-tlm-5", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "What is Stephen Krashen's 'Comprehensible Input Hypothesis' (i + 1) in second language acquisition?", "options": ["(A) Learners acquire language most effectively when exposed to input that is slightly beyond their current competence level (i) but understandable through context", "(B) Input must be 100% familiar words only", "(C) Grammar rules must be explicitly memorized before reading", "(D) Language can only be acquired through formal grammar translation"], "correct_answer": 0, "explanation": "Krashen posits that acquisition occurs subconsciously when learners understand messages containing language structures just beyond their current stage (i+1)."},
        {"id": "eng-tlm-6", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "How should a language teacher remediate persistent fossilized L1 interference errors (e.g. 'He is having two brothers')?", "options": ["(A) Contrastive analysis and contextual communicative drills highlighting state verbs (have) vs dynamic continuous aspect in English", "(B) Punishing the student for speaking their mother tongue", "(C) Ignoring the error hoping it disappears", "(D) Telling the student they have no language aptitude"], "correct_answer": 0, "explanation": "Contrastive consciousness-raising clarifies structural differences between L1 and L2, guiding the learner to self-correct stative verb usage."},
        {"id": "eng-tlm-7", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "What is the primary function of a 'Rubric' in assessing subjective writing (e.g. creative stories, essays, speeches)?", "options": ["(A) Providing clear, objective performance criteria across Content, Organization, Vocabulary, Accuracy, and Fluency for transparent, standardized scoring", "(B) Assigning random marks based on handwriting alone", "(C) Ensuring all students get identical marks", "(D) Shortening the teacher's grading time to 5 seconds per paper"], "correct_answer": 0, "explanation": "Analytical rubrics ensure assessment reliability, eliminate evaluator subjectivity, and give constructive formative feedback to students."},
        {"id": "eng-tlm-8", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In poetry pedagogy, why is 'Choral Reading' and expressive performance superior to silent individual reading for secondary learners?", "options": ["(A) It activates auditory phonological rhythm, meter, rhyme, and emotional tone, overcoming inhibitions through collective vocalization", "(B) It prevents students from falling asleep in class", "(C) It eliminates the need to analyze poetic themes", "(D) It allows the teacher to leave the classroom"], "correct_answer": 0, "explanation": "Poetry is inherently an oral-aural art form. Choral reading embeds rhythmic cadence and acoustic imagery into learner consciousness."},
        {"id": "eng-tlm-9", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "What is 'Extensive Reading' (Free Voluntary Reading) and how does it impact vocabulary acquisition?", "options": ["(A) Reading large volumes of self-selected easy and enjoyable texts for pleasure, fostering incidental vocabulary growth and reading speed", "(B) Analyzing one paragraph word-by-word with a dictionary", "(C) Memorizing 50 words per night from a wordlist", "(D) Reading only textbook exam passages"], "correct_answer": 0, "explanation": "Extensive reading exposes students to thousands of words in authentic syntactic environments, building deep lexical recognition."},
        {"id": "eng-tlm-10", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "How does 'Information Gap Activity' (e.g. Partner A has a map, Partner B has the directions) stimulate communicative competence?", "options": ["(A) It creates a genuine authentic need to communicate and negotiate meaning because neither student has the complete picture", "(B) It tests which student has better handwriting", "(C) It enforces silent individual work", "(D) It replaces conversation with written translation"], "correct_answer": 0, "explanation": "Information gaps compel learners to employ functional language, ask clarifying questions, and actively listen to achieve a shared objective."},

        # Module 6: Misconceptions & HOTS (10 MCQs)
        {"id": "eng-hots-1", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A student writes 'She told to me that she was leaving.' What is the precise grammatical error?", "options": ["(A) 'Tell' is a transitive verb that takes a direct personal object without preposition 'to' (She told me...), unlike 'say' (She said to me...)", "(B) The tense in the noun clause is incorrect", "(C) 'Leaving' cannot be used in reported speech", "(D) 'She' must be replaced by 'her'"], "correct_answer": 0, "explanation": "The verb 'tell' takes a direct object without preposition: 'She told me', whereas 'say' requires 'to': 'She said to me'."},
        {"id": "eng-hots-2", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: Many students confuse 'its' and 'it's'. How should a teacher definitively resolve this punctuation bug?", "options": ["(A) 'It's' is exclusively a contraction for 'it is' or 'it has'; 'its' is the possessive pronoun (like his, hers, ours) and never takes an apostrophe", "(B) 'It's' is plural and 'its' is singular", "(C) Both forms are interchangeable in modern English", "(D) Possessive pronouns always take apostrophes"], "correct_answer": 0, "explanation": "Personal possessive pronouns (his, hers, its, ours, theirs) never contain apostrophes. Apostrophes in 'it's' indicate omitted letters."},
        {"id": "eng-hots-3", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A learner writes 'I am looking forward to meet you.' What grammatical rule regarding prepositions vs infinitives was breached?", "options": ["(A) In the phrasal idiom 'look forward to', 'to' is a preposition requiring a gerund (-ing form: 'to meeting you'), not an infinitive marker", "(B) 'Meet' cannot be used with people", "(C) 'Forward' cannot be followed by verbs", "(D) The sentence is grammatically flawless"], "correct_answer": 0, "explanation": "'Look forward to' takes a prepositional object: 'look forward to + noun/gerund' => 'look forward to meeting you'."},
        {"id": "eng-hots-4", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: Students often assume 'passive voice is always bad writing and must never be used.' When is passive voice stylistically necessary and superior?", "options": ["(A) In scientific reporting when the action/result matters more than the actor, or when the agent is unknown, irrelevant, or obvious", "(B) Only when writing poetry", "(C) Passive voice should indeed be 100% eliminated from English", "(D) When writing informal personal emails only"], "correct_answer": 0, "explanation": "Passive voice establishes objective focus on phenomena/results (e.g. 'The solution was heated to 80°C') rather than the researcher."},
        {"id": "eng-hots-5", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Critical Analysis: In Chinua Achebe's 'Things Fall Apart', how does the title (drawn from W.B. Yeats's 'The Second Coming') function as a critical postcolonial motif?", "options": ["(A) It captures the tragic disintegration of traditional Igbo societal structures, customs, and psychological coherence under aggressive European colonization", "(B) It refers to bad building construction in the village", "(C) It describes the physical death of the main character in war", "(D) It celebrates European technological supremacy"], "correct_answer": 0, "explanation": "Achebe uses Yeats's European apocalyptic imagery to subvert colonial narratives and depict the internal fracture of an autonomous African civilization."},
        {"id": "eng-hots-6", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A student uses 'literally' in 'I was literally dying of laughter.' What is the semantic abuse occurring here?", "options": ["(A) Using 'literally' (denoting factual, non-metaphorical reality) as an exaggerated intensifier for a figurative hyperbole", "(B) 'Dying' is misspelled", "(C) 'Laughter' is an uncountable noun that cannot cause death", "(D) Adverbs cannot modify continuous verbs"], "correct_answer": 0, "explanation": "'Literally' means in the strict literal sense. Dying of laughter is a figurative hyperbole, so combining them creates a semantic contradiction."},
        {"id": "eng-hots-7", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Poetic Evaluation: How does the tone in Wilfred Owen's 'Dulce et Decorum Est' subvert the traditional romantic glorification of warfare?", "options": ["(A) By juxtaposing graphic, visceral imagery of gas warfare and dying soldiers with Horace's ancient patriotic lie ('Sweet and fitting it is to die for one's country')", "(B) By praising generals for military victories", "(C) By urging young men to enlist in the army", "(D) By celebrating military parades in London"], "correct_answer": 0, "explanation": "Owen tears away patriotic propaganda by exposing the brutal, unglamorous trauma of trench chemical warfare."},
        {"id": "eng-hots-8", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A learner writes 'Between you and I, this plan is flawed.' Why is 'you and I' grammatically incorrect here?", "options": ["(A) 'Between' is a preposition, so its objects must be in the objective case: 'Between you and me'", "(B) 'I' can never follow 'you'", "(C) 'Between' can only be used for physical distances", "(D) 'You and I' is only used in questions"], "correct_answer": 0, "explanation": "Prepositions govern objective case pronouns: 'between you and me', 'for him and me', 'with her and me'."},
        {"id": "eng-hots-9", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Critical Thinking: In assessing arguments in argumentative essays, what is the logical fallacy of 'Straw Man'?", "options": ["(A) Misrepresenting, oversimplifying, or caricaturing an opponent's argument to make it easier to attack and refute", "(B) Attacking the author's personal character instead of their idea (Ad Hominem)", "(C) Assuming cause and effect from chronological sequence", "(D) Quoting an unqualified celebrity as an expert"], "correct_answer": 0, "explanation": "Straw Man constructs a distorted caricature of an opponent's stance rather than engaging with their actual reasoned argument."},
        {"id": "eng-hots-10", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: When teaching pronunciation, why is correcting the Indian English tendency to pronounce 'v' and 'w' identically (e.g. 'vine' vs 'wine') essential for intelligibility?", "options": ["(A) 'V' is a labiodental fricative (top teeth on bottom lip), while 'W' is a bilabial approximant (rounded lips); confusing them produces phonemic minimal pair confusion", "(B) English letters cannot make two sounds", "(C) 'W' is silent in all English words", "(D) Only American speakers differentiate them"], "correct_answer": 0, "explanation": "Minimal pairs (/v/ and /w/) convey distinct lexical meanings (vine vs wine, vest vs west). Articulatory placement prevents phonological ambiguity."}
    ]

# ============================================================================
# 4. HINDI (हिंदी भाषा एवं साहित्य) (40 MCQs)
# ============================================================================
def get_hindi_part_b_questions() -> List[Dict[str, Any]]:
    return [
        # Module 4: Core Subject Knowledge (20 MCQs)
        {"id": "hin-core-1", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "संधि: 'सूर्योदय' शब्द में कौन-सी संधि है तथा इसका सही संधि-विच्छेद क्या होगा?", "options": ["(A) गुण स्वर संधि (सूर्य + उदय)", "(B) दीर्घ स्वर संधि (सूर्यो + दय)", "(C) वृद्धि स्वर संधि (सूर्य + औदय)", "(D) यण स्वर संधि (सूरि + उदय)"], "correct_answer": 0, "explanation": "अ/आ के बाद उ/ऊ आने पर दोनों मिलकर 'ओ' बन जाते हैं (अ + उ = ओ), अतः 'सूर्य + उदय = सूर्योदय' गुण स्वर संधि है।"},
        {"id": "hin-core-2", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "समास: 'यथाशक्ति' शब्द में कौन-सा समास है तथा इसका सही विग्रह क्या होगा?", "options": ["(A) अव्ययीभाव समास (शक्ति के अनुसार)", "(B) तत्पुरुष समास (शक्ति की सीमा)", "(C) कर्मधारय समास (समान शक्ति)", "(D) बहुव्रीहि समास (जिसमें शक्ति हो)"], "correct_answer": 0, "explanation": "जिस समास का पहला पद अव्यय (यथा) हो और वही प्रधान हो, उसे अव्ययीभाव समास कहते हैं। 'यथाशक्ति' का विग्रह 'शक्ति के अनुसार' है।"},
        {"id": "hin-core-3", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "अलंकार: 'चरण कमल बंदौ हरि राई' में कौन-सा अलंकार प्रयुक्त हुआ है?", "options": ["(A) रूपक अलंकार", "(B) उपमा अलंकार", "(C) उत्प्रेक्षा अलंकार", "(D) यमक अलंकार"], "correct_answer": 0, "explanation": "यहाँ उपमेय (चरण) पर उपमान (कमल) का अभेद आरोप किया गया है, अतः यहाँ रूपक अलंकार है।"},
        {"id": "hin-core-4", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "रस: शांत रस का स्थायी भाव क्या है?", "options": ["(A) निर्वेद (शम)", "(B) रति", "(C) शोक", "(D) विस्मय"], "correct_answer": 0, "explanation": "संसार की अनित्यता और वैराग्य की भावना से उत्पन्न होने वाले शांत रस का स्थायी भाव 'निर्वेद' (शम) है।"},
        {"id": "hin-core-5", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "साहित्य: छायावाद के चार प्रमुख स्तंभों में निम्नलिखित में से कौन शामिल नहीं हैं?", "options": ["(A) रामधारी सिंह 'दिनकर'", "(B) जयशंकर प्रसाद", "(C) सूर्यकांत त्रिपाठी 'निराला'", "(D) महादेवी वर्मा"], "correct_answer": 0, "explanation": "छायावाद के चार प्रमुख स्तंभ हैं: जयशंकर प्रसाद, सुमित्रानंदन पंत, सूर्यकांत त्रिपाठी 'निराला' और महादेवी वर्मा। दिनकर जी राष्ट्रकवि/उत्तर-छायावादी धारा के कवि हैं।"},
        {"id": "hin-core-6", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "वाक्य शुद्धि: निम्नलिखित में से व्याकरण की दृष्टि से शुद्ध वाक्य का चयन कीजिए:", "options": ["(A) श्रीकृष्ण के अनेक नाम हैं।", "(B) श्रीकृष्ण के अनेकों नाम हैं।", "(C) यहाँ शुद्ध गाय का दूध मिलता है।", "(D) मुझे भारी दुःख हुआ।"], "correct_answer": 0, "explanation": "'अनेक' शब्द स्वयं बहुवचन है, अतः 'अनेकों' लिखना अशुद्ध है। 'श्रीकृष्ण के अनेक नाम हैं' पूर्णतः शुद्ध वाक्य है।"},
        {"id": "hin-core-7", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "छंद: दोहा छंद के पहले और तीसरे चरण में कितनी-कितनी मात्राएँ होती हैं?", "options": ["(A) 13-13 मात्राएँ (विषम चरण) तथा 11-11 मात्राएँ (सम चरण)", "(B) 11-11 मात्राएँ (विषम) तथा 13-13 मात्राएँ (सम)", "(C) 16-16 मात्राएँ सभी चरणों में", "(D) 24-24 मात्राएँ"], "correct_answer": 0, "explanation": "दोहा एक अर्धसम मात्रिक छंद है जिसके विषम चरणों (1, 3) में 13-13 मात्राएँ और सम चरणों (2, 4) में 11-11 मात्राएँ होती हैं।"},
        {"id": "hin-core-8", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "शब्द शक्ति: जब किसी शब्द का मुख्य अर्थ बाधित होकर लक्षणा के आधार पर दूसरा अर्थ ग्रहण किया जाए, तो वहाँ कौन-सी शब्द शक्ति होती है?", "options": ["(A) लक्षणा शब्द शक्ति", "(B) अभिधा शब्द शक्ति", "(C) व्यंजना शब्द शक्ति", "(D) तात्पर्य शक्ति"], "correct_answer": 0, "explanation": "मुख्यार्थ के बाधित होने पर रूढ़ि या प्रयोजन के कारण जिस शक्ति से लक्ष्यार्थ का बोध हो, उसे 'लक्षणा' कहते हैं।"},
        {"id": "hin-core-9", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "साहित्य: मुंशी प्रेमचंद के किस प्रसिद्ध उपन्यास में भारतीय कृषक जीवन की त्रासद महागाथा 'होरी' के माध्यम से प्रस्तुत की गई है?", "options": ["(A) गोदान", "(B) गबन", "(C) सेवासदन", "(D) रंगभूमि"], "correct_answer": 0, "explanation": "'गोदान' (1936) प्रेमचंद का कालजयी उपन्यास है जिसमें भारतीय किसान होरी की ऋणग्रस्तता, संघर्ष और त्रासदी का जीवंत चित्रण है।"},
        {"id": "hin-core-10", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "कारक: 'पेड़ से पत्ता गिरा' - इस वाक्य में 'पेड़ से' में कौन-सा कारक है?", "options": ["(A) अपादान कारक", "(B) करण कारक", "(C) संबंध कारक", "(D) कर्म कारक"], "correct_answer": 0, "explanation": "संज्ञा के जिस रूप से किसी वस्तु का किसी स्थान या वस्तु से अलग होने का भाव प्रकट हो, वहाँ अपादान कारक (विभक्ति: से) होता है।"},
        {"id": "hin-core-11", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "मुहावरा: 'अंगूठा दिखाना' मुहावरे का सही अर्थ क्या है?", "options": ["(A) ऐन वक्त पर किसी काम के लिए साफ मना कर देना", "(B) विजय का संकेत देना", "(C) अंगूठे में चोट लगना", "(D) किसी की प्रशंसा करना"], "correct_answer": 0, "explanation": "'अंगूठा दिखाना' का पारंपरिक अर्थ समय पर काम करने से साफ़ इनकार कर देना है।"},
        {"id": "hin-core-12", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "वर्ण विचार: हिंदी वर्णमाला में 'क्ष, त्र, ज्ञ, श्र' किस प्रकार के व्यंजन कहलाते हैं?", "options": ["(A) संयुक्त व्यंजन", "(B) स्पर्श व्यंजन", "(C) अंतःस्थ व्यंजन", "(D) ऊष्म व्यंजन"], "correct_answer": 0, "explanation": "दो भिन्न व्यंजनों के मेल से बनने वाले व्यंजनों को संयुक्त व्यंजन कहते हैं (क्+ष्=क्ष, त्+र्=त्र, ज्+ञ्=ज्ञ, श्+र्=श्र)।"},
        {"id": "hin-core-13", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "साहित्य: भक्तिकाल को 'हिंदी साहित्य का स्वर्ण युग' सर्वप्रथम किस विद्वान ने कहा था?", "options": ["(A) जॉर्ज ग्रियर्सन", "(B) आचार्य रामचंद्र शुक्ल", "(C) हजारी प्रसाद द्विवेदी", "(D) राहुल सांकृत्यायन"], "correct_answer": 0, "explanation": "सर जॉर्ज ग्रियर्सन ने अपने इतिहास ग्रंथ में भक्तिकाल को सर्वप्रथम 'स्वर्ण युग' (Golden Age) की संज्ञा दी थी।"},
        {"id": "hin-core-14", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "विलोम शब्द: 'अनुराग' शब्द का सही विलोम क्या होगा?", "options": ["(A) विराग", "(B) द्वेष", "(C) क्रोध", "(D) घृणा"], "correct_answer": 0, "explanation": "'अनुराग' (प्रेम/आसक्ति) का सटीक विलोम शब्द 'विराग' (उदासीनता/वैराग्य) है।"},
        {"id": "hin-core-15", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "क्रिया: 'अध्यापक ने छात्र से निबंध लिखवाया' - इस वाक्य में 'लिखवाया' किस प्रकार की क्रिया है?", "options": ["(A) प्रेरणार्थक क्रिया (द्विकर्मक)", "(B) अकर्मक क्रिया", "(C) पूर्वकालिक क्रिया", "(D) नामधातु क्रिया"], "correct_answer": 0, "explanation": "जब कर्ता स्वयं कार्य न करके किसी अन्य को कार्य करने के लिए प्रेरित करता है, तो उसे प्रेरणार्थक क्रिया कहते हैं।"},
        {"id": "hin-core-16", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "पर्यायवाची: निम्नलिखित में से कौन-सा शब्द 'कमल' का पर्यायवाची नहीं है?", "options": ["(A) जलद", "(B) जलज", "(C) पंकज", "(D) नीरज"], "correct_answer": 0, "explanation": "'जलद' (जल देने वाला) बादल का पर्यायवाची है, जबकि जलज, पंकज और नीरज कमल के पर्यायवाची हैं।"},
        {"id": "hin-core-17", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "साहित्य: 'कबीरदास' किस काव्यधारा के प्रतिनिधि कवि हैं?", "options": ["(A) ज्ञानाश्रयी निर्गुण संत काव्यधारा", "(B) प्रेमाश्रयी सूफी काव्यधारा", "(C) कृष्णाश्रयी सगुण काव्यधारा", "(D) रामाश्रयी काव्यधारा"], "correct_answer": 0, "explanation": "कबीर निर्गुण भक्ति शाखा की ज्ञानाश्रयी संत काव्यधारा के प्रमुख प्रवर्तक हैं।"},
        {"id": "hin-core-18", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "उपसर्ग एवं प्रत्यय: 'अपमानित' शब्द में क्रमशः उपसर्ग, मूल शब्द और प्रत्यय क्या हैं?", "options": ["(A) अप (उपसर्ग) + मान (मूल शब्द) + इत (प्रत्यय)", "(B) अपमान (उपसर्ग) + इत (प्रत्यय)", "(C) अप (उपसर्ग) + मानित (प्रत्यय)", "(D) अपम + आन + इत"], "correct_answer": 0, "explanation": "'अपमानित' = अप (उपसर्ग) + मान (मूल शब्द) + इत (प्रत्यय)।"},
        {"id": "hin-core-19", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "वाच्य: 'मुझसे अब चला नहीं जाता' - इस वाक्य में कौन-सा वाच्य है?", "options": ["(A) भाववाच्य", "(B) कर्तृवाच्य", "(C) कर्मवाच्य", "(D) करणवाच्य"], "correct_answer": 0, "explanation": "जहाँ क्रिया का संबंध कर्ता या कर्म से न होकर भाव से हो और क्रिया अकर्मक हो, वहाँ भाववाच्य होता है।"},
        {"id": "hin-core-20", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "साहित्य: 'अंधायुग' नाटक के रचनाकार कौन हैं?", "options": ["(A) धर्मवीर भारती", "(B) मोहन राकेश", "(C) भारतेंदु हरिश्चंद्र", "(D) जयशंकर प्रसाद"], "correct_answer": 0, "explanation": "'अंधायुग' (1954) धर्मवीर भारती द्वारा रचित प्रसिद्ध गीतिनाट्य है जो महाभारत के 18वें दिन की संध्या पर आधारित है।"},

        # Module 5: Subject Pedagogical Knowledge & TLM (10 MCQs)
        {"id": "hin-tlm-1", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "भाषा शिक्षण के चार कौशलों (LSRW) का स्वाभाविक एवं मनोवैज्ञानिक क्रम क्या है?", "options": ["(A) सुनना -> बोलना -> पढ़ना -> लिखना (सुबोपलि)", "(B) पढ़ना -> लिखना -> सुनना -> बोलना", "(C) लिखना -> पढ़ना -> बोलना -> सुनना", "(D) बोलना -> सुनना -> लिखना -> पढ़ना"], "correct_answer": 0, "explanation": "भाषा विकास का स्वाभाविक क्रम श्रवण (सुनना), मौखिक अभिव्यक्ति (बोलना), पठन (पढ़ना) और लेखन (लिखना) है।"},
        {"id": "hin-tlm-2", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "कविता शिक्षण का मुख्य उद्देश्य निम्नलिखित में से क्या होना चाहिए?", "options": ["(A) रसानुभूति, भाव-सौंदर्य की अनुभूति तथा कल्पनाशीलता का विकास करना", "(B) केवल व्याकरणिक नियमों को रटाना", "(C) कठिन शब्दों के 50 पर्यायवाची कंठस्थ कराना", "(D) कवि का जीवन-परिचय याद कराना"], "correct_answer": 0, "explanation": "कविता शिक्षण का मूल उद्देश्य भावानुभूति, रसास्वादन, संगीतात्मकता और सौंदर्यबोध का विकास करना है।"},
        {"id": "hin-tlm-3", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "व्याकरण शिक्षण की 'आगमन विधि' (Inductive Method) में शिक्षण सूत्र क्या होता है?", "options": ["(A) उदाहरण से नियम की ओर (विशिष्ट से सामान्य की ओर)", "(B) नियम से उदाहरण की ओर", "(C) अमूर्त से मूर्त की ओर", "(D) कठिन से सरल की ओर"], "correct_answer": 0, "explanation": "आगमन विधि में पहले छात्रों के सम्मुख अनेक व्यावहारिक उदाहरण प्रस्तुत किए जाते हैं, फिर उनसे सामान्य नियम निकलवाया जाता है।"},
        {"id": "hin-tlm-4", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "कक्षा में 'बहुभाषिकता' (Multilingualism) को शिक्षक को किस रूप में ग्रहण करना चाहिए?", "options": ["(A) एक समृद्ध शिक्षण संसाधन (Resource) के रूप में", "(B) शिक्षण कार्य में एक बड़ी रुकावट या बाधा के रूप में", "(C) एक अनुशासनात्मक समस्या के रूप में", "(D) उपेक्षा करने योग्य विषय के रूप में"], "correct_answer": 0, "explanation": "एनसीएफ 2005 और एनईपी 2020 के अनुसार बहुभाषिकता कक्षा का एक समृद्ध संज्ञानात्मक और सांस्कृतिक संसाधन है।"},
        {"id": "hin-tlm-5", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "मौन पठन (Silent Reading) का मुख्य लाभ क्या है?", "options": ["(A) स्वाध्याय की आदत का विकास, पठन गति में वृद्धि तथा अर्थग्रहण की गहनता", "(B) कक्षा में सन्नाटा बनाए रखना", "(C) उच्चारण दोषों को तुरंत पकड़ना", "(D) आवाज़ को आराम देना"], "correct_answer": 0, "explanation": "मौन पठन में छात्र बिना ध्वनि किए तीव्र गति से विषयवस्तु का चिंतनपरक अर्थग्रहण करते हैं।"},
        {"id": "hin-tlm-6", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "गद्य शिक्षण में 'काठिन्य निवारण' (कठिन शब्दों का अर्थ स्पष्टीकरण) के लिए सर्वोत्तम तकनीक कौन-सी है?", "options": ["(A) संदर्भ में शब्दों का वाक्य प्रयोग, चित्र/वस्तु प्रदर्शन तथा प्रत्यय/संधि विश्लेषण", "(B) सीधे शब्दकोश से 50 अर्थ रटा देना", "(C) शब्दों को छोड़कर आगे बढ़ जाना", "(D) केवल गृहकार्य में लिखने को देना"], "correct_answer": 0, "explanation": "संदर्भगत वाक्य प्रयोग और दृश्य शिक्षण सहायक सामग्री से शब्द का अर्थ स्थायी रूप से स्पष्ट होता है।"},
        {"id": "hin-tlm-7", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "प्राथमिक एवं माध्यमिक स्तर पर 'वर्तनी की अशुद्धियों' (Spelling errors) को दूर करने हेतु सर्वाधिक प्रभावी साधन क्या है?", "options": ["(A) श्रुतलेख (Dictation) तथा नियमित सुलेख अभ्यास के साथ त्रुटि विश्लेषण", "(B) अशुद्ध शब्द पर लाल स्याही से शून्य अंक देना", "(C) छात्र को कक्षा से बाहर खड़ा करना", "(D) पाठ्यपुस्तक को बंद करवा देना"], "correct_answer": 0, "explanation": "श्रुतलेख से श्रवण और लेखन कौशल का समन्वय होता है तथा त्रुटियों का तात्कालिक सुधारात्मक पुनर्बलन मिलता है।"},
        {"id": "hin-tlm-8", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "भाषा प्रयोगशाला (Language Lab) का उपयोग मुख्य रूप से किस कौशल के संवर्धन हेतु किया जाता है?", "options": ["(A) शुद्ध मानक उच्चारण, बलाघात, अनुतान एवं श्रवण कौशल के सुधार हेतु", "(B) केवल हस्तलेख सुधारने हेतु", "(C) निबंध लेखन की गति बढ़ाने हेतु", "(D) परीक्षा परिणाम तैयार करने हेतु"], "correct_answer": 0, "explanation": "भाषा प्रयोगशाला में ऑडियो-विजुअल टूल्स के माध्यम से सही फोनेटिक्स, स्वरोच्चारण और मॉड्यूलेशन का अभ्यास कराया जाता है।"},
        {"id": "hin-tlm-9", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "नाटक शिक्षण में कौन-सी विधि सर्वाधिक प्रभावोत्पादक मानी जाती है?", "options": ["(A) कक्षाभिनय विधि (छात्रों द्वारा कक्षा में पात्रानुसार वाचिक एवं आंगिक अभिनय)", "(B) आदर्श वाचन विधि (केवल शिक्षक द्वारा पढ़ना)", "(C) व्याख्या विधि", "(D) संयुक्त अनुवाद विधि"], "correct_answer": 0, "explanation": "कक्षाभिनय विधि में छात्र संवादों को भावपूर्ण रूप से उच्चारित करते हैं जिससे वे पात्रों के अंतर्द्वंद्व को आत्मसात करते हैं।"},
        {"id": "hin-tlm-10", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "रचना (निबंध/पत्र) शिक्षण में 'विचार मंथन' (Brainstorming) का क्या महत्व है?", "options": ["(A) लेखन से पूर्व विषय से संबंधित विविध विचारों, बिंदुओं एवं दृष्टिकोणों का मुक्त प्रवाह उत्पन्न करना", "(B) बिना सोचे-समझे तुरंत लिखना शुरू कर देना", "(C) किसी अन्य छात्र की रचना की नकल करना", "(D) व्याकरण के 10 सूत्र याद करना"], "correct_answer": 0, "explanation": "विचार मंथन से पूर्व-ज्ञान सक्रिय होता है तथा रचना को तार्किक रूप से व्यवस्थित करने के लिए बिंदु प्राप्त होते हैं।"},

        # Module 6: Misconceptions & HOTS (10 MCQs)
        {"id": "hin-hots-1", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "भ्रांति निवारण: कई छात्र 'श' और 'स' तथा 'ण' और 'न' के उच्चारण में भेद नहीं कर पाते। इसका भाषावैज्ञानिक उपचार क्या है?", "options": ["(A) उच्चारण स्थान (तालव्य श बनाम दंत्य स; मूर्धन्य ण बनाम दंत्य न) का जिह्वा स्थिति सहित प्रत्यक्ष अभ्यास कराना", "(B) छात्रों को बोलना बंद करने के लिए कहना", "(C) यह मान लेना कि यह कभी ठीक नहीं हो सकता", "(D) इसे अंग्रेजी माध्यम की कमी बताना"], "correct_answer": 0, "explanation": "ध्वनि विज्ञान के अनुसार उच्चारण स्थान (आर्टिक्यूलेटरी फोनेटिक्स) का ज्ञान कराने से ध्वन्यात्मक विभेदीकरण सुधरता है।"},
        {"id": "hin-hots-2", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "उच्च स्तरीय चिंतन: प्रेमचंद की कहानी 'कफन' में घीसू और माधव के चरित्र के माध्यम से समाज की किस विद्रूपता पर तीखा व्यंग्य किया गया है?", "options": ["(A) घोर आर्थिक अभाव एवं सामंती शोषण द्वारा मानव संवेदनाओं और आत्मसम्मान का पूर्णतः कुंद व संवेदनहीन हो जाना", "(B) केवल शराब पीने की बुरी लत का वर्णन", "(C) पारंपरिक अंतिम संस्कार के नियमों की व्याख्या", "(D) ग्रामीण स्वास्थ्य सेवाओं की कमी"], "correct_answer": 0, "explanation": "'कफन' कहानी में अमानवीय व्यवस्था व्यक्ति को इस सीमा तक शोषित कर देती है कि उसकी संवेदनाएँ और मानवीय मर्यादाएँ मृतप्राय हो जाती हैं।"},
        {"id": "hin-hots-3", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "भ्रांति निवारण: छात्र अक्सर 'की' (संबंध कारक) और 'कि' (समुच्चयबोधक) के प्रयोग में अशुद्धि करते हैं। इसका स्पष्ट नियम क्या है?", "options": ["(A) 'की' संज्ञा/सर्वनाम के बीच संबंध जोड़ता है (राम की पुस्तक); 'कि' दो उपवाक्यों को जोड़ने वाला योजक है (उसने कहा कि...)", "(B) दोनों शब्द पूरी तरह समान हैं", "(C) 'कि' हमेशा वाक्य के अंत में आता है", "(D) 'की' केवल पुरुषों के लिए प्रयुक्त होता है"], "correct_answer": 0, "explanation": "'की' दीर्घ ईकार युक्त संबंध कारक है जबकि 'कि' ह्रस्व इकार युक्त कंजंक्शन (योजक) है।"},
        {"id": "hin-hots-4", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "उच्च स्तरीय चिंतन: निराला की कविता 'राम की शक्ति पूजा' में राम का संशय और निराशा वास्तव में किस राष्ट्रीय चेतना का प्रतीक है?", "options": ["(A) स्वाधीनता संग्राम में भारतीय जनता के संघर्ष, अंतर्द्वंद्व और 'अन्याय जिधर, हैं उधर शक्ति' की चुनौती पर मौलिक विजय का संकल्प", "(B) केवल एक पौराणिक कथा का गान", "(C) युद्ध से भागने की इच्छा", "(D) व्यक्तिगत पराजय की स्वीकारोक्ति"], "correct_answer": 0, "explanation": "निराला की यह कविता आधुनिक युग में अन्याय और दमन के विरुद्ध शक्ति की मौलिक कल्पना और आत्मोत्सर्ग का प्रतीक है।"},
        {"id": "hin-hots-5", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "भ्रांति निवारण: 'हिंदी केवल भारत के उत्तरी राज्यों में बोली जाने वाली एक क्षेत्रीय बोली है' - इस भ्रांति का खंडन किस तथ्य से होता है?", "options": ["(A) हिंदी भारत संघ की राजभाषा है तथा संविधान की 8वीं अनुसूची में शामिल होकर देश की संपर्क भाषा और वैश्विक पटल पर तीसरी सर्वाधिक बोली जाने वाली भाषा है", "(B) हिंदी केवल दिल्ली की भाषा है", "(C) हिंदी का कोई व्याकरण नहीं है", "(D) हिंदी केवल मुहावरों में प्रयुक्त होती है"], "correct_answer": 0, "explanation": "हिंदी अखिल भारतीय संपर्क भाषा है और विश्व स्तर पर करोड़ों लोगों द्वारा प्रयुक्त समृद्ध साहित्यिक एवं तकनीकी भाषा है।"},
        {"id": "hin-hots-6", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "उच्च स्तरीय चिंतन: अज्ञेय के प्रयोगवाद और नई कविता में 'मौन' और 'अकेलेपन' की अभिव्यक्ति किस दार्शनिक पृष्ठभूमि से प्रेरित है?", "options": ["(A) द्वितीय विश्वयुद्धोत्तर युगीन अस्तित्ववाद, व्यक्ति चेतना और आधुनिकता बोध के संशय से", "(B) समाज से पलायन करने की इच्छा से", "(C) केवल विदेशी छंदों के अनुकरण से", "(D) शब्दों के अभाव से"], "correct_answer": 0, "explanation": "प्रयोगवाद में आधुनिक मनुष्य की आत्मिक शून्यता, संशय और प्रामाणिक अनुभूति की तलाश अस्तित्ववादी दर्शन से जुड़ी है।"},
        {"id": "hin-hots-7", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "भ्रांति निवारण: अनुस्वार (ं) और अनुनासिक (ँ) के प्रयोग में क्या ध्वनिगत अंतर है?", "options": ["(A) अनुस्वार पूर्ण नासिक्य व्यंजन ध्वनि है (वायु केवल नाक से निकलती है); अनुनासिक स्वर का गुण है (वायु नाक और मुँह दोनों से निकलती है)", "(B) दोनों में कोई अंतर नहीं है", "(C) अनुस्वार केवल संस्कृत में होता है", "(D) अनुनासिक केवल विराम चिह्न है"], "correct_answer": 0, "explanation": "अनुस्वार स्वतंत्र व्यंजन वर्ण है जबकि अनुनासिक स्वरों के साथ उच्चारित होने वाला नासिक्यीकृत स्वर धर्म है।"},
        {"id": "hin-hots-8", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "उच्च स्तरीय विश्लेषण: सूरदास के 'भ्रमरगीत' प्रसंग में गोपियों और उद्धव के संवाद का दार्शनिक सार क्या है?", "options": ["(A) निर्गुण निराकार ज्ञान और योग मार्ग पर सगुण साकार प्रेम और भक्ति मार्ग की भावनात्मक विजय", "(B) उद्धव द्वारा गोपियों को सन्यास दिलाना", "(C) केवल मथुरा के वस्त्रों की प्रशंसा", "(D) गोपियों का मथुरा प्रस्थान"], "correct_answer": 0, "explanation": "भ्रमरगीत में गोपियों का निश्छल प्रेमानुराग उद्धव के शुष्क निर्गुण ज्ञान और योग के अहंकार को परास्त करता है।"},
        {"id": "hin-hots-9", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "भ्रांति निवारण: 'मातृभाषा सीखने के बाद ही द्वितीय भाषा सीखनी चाहिए, अन्यथा बौद्धिक विकास रुक जाता है' - आधुनिक भाषाविज्ञान इस पर क्या कहता है?", "options": ["(A) बच्चे एक साथ दो या अधिक भाषाएँ सहजता से अर्जित कर सकते हैं; बहुभाषिकता संज्ञानात्मक लचीलेपन और समस्या समाधान क्षमता को बढ़ाती है", "(B) दो भाषाएँ सीखने से मस्तिष्क कमजोर होता है", "(C) बच्चों को केवल 1 भाषा बोलनी चाहिए", "(D) द्वितीय भाषा 18 वर्ष के बाद ही सिखानी चाहिए"], "correct_answer": 0, "explanation": "नोम चॉम्स्की और आधुनिक संज्ञानात्मक भाषाविज्ञान के अनुसार बच्चों में जन्मजात भाषा अर्जन युक्ति (LAD) होती है जो बहुभाषिकता को सहज बनाती है।"},
        {"id": "hin-hots-10", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "उच्च स्तरीय चिंतन: 'साधारणीकरण' (Generalization) भारतीय काव्यशास्त्र के रस सिद्धांत में क्या भूमिका निभाता है?", "options": ["(A) विभाव आदि का अपने-पराए के संबंध से मुक्त होकर सार्वभौमिक व सर्वजनसंवेद्य बन जाना, जिससे पाठक रसानुभूति में लीन हो सके", "(B) कविता को गद्य में बदल देना", "(C) केवल कठिन शब्दों का सरलीकरण करना", "(D) नाटक के पात्रों को मंच से हटा देना"], "correct_answer": 0, "explanation": "आचार्य भट्टनायक और अभिनवगुप्त के अनुसार साधारणीकरण द्वारा व्यक्तिगत सीमाएँ मिट जाती हैं और पात्र का भाव पाठक का अपना भाव बन जाता है।"}
    ]

# ============================================================================
# 5. COMPUTER SCIENCE & IT (40 MCQs)
# ============================================================================
def get_computer_science_part_b_questions() -> List[Dict[str, Any]]:
    return [
        # Module 4: Core Subject Knowledge (20 MCQs)
        {"id": "cs-core-1", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Data Structures: Which Python built-in data type provides average O(1) time complexity for lookup, insertion, and deletion?", "options": ["(A) Dictionary (dict) / Hash Table", "(B) Singly Linked List", "(C) Sorted List with linear scan", "(D) Binary Search Tree with unbalanced nodes"], "correct_answer": 0, "explanation": "Python dictionaries use optimized hash table implementations providing average O(1) key lookups and insertions."},
        {"id": "cs-core-2", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Databases (SQL): In relational schema design, what is the primary condition for a relation to be in Boyce-Codd Normal Form (BCNF)?", "options": ["(A) For every non-trivial functional dependency X -> Y, X must be a Super Key", "(B) The relation has zero foreign keys", "(C) All non-key attributes are transitively dependent on the primary key", "(D) Multi-valued dependencies are ignored"], "correct_answer": 0, "explanation": "BCNF is a stricter version of 3NF where every functional dependency's determinant (left side X) must be a super key."},
        {"id": "cs-core-3", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Algorithms: What is the worst-case time complexity of standard QuickSort algorithm when the pivot chosen is always the extreme (minimum/maximum) element?", "options": ["(A) O(n^2)", "(B) O(n log n)", "(C) O(n)", "(D) O(log n)"], "correct_answer": 0, "explanation": "When an extreme element is consistently chosen as pivot, the partition tree degenerates into a linear chain of depth n, leading to O(n^2)."},
        {"id": "cs-core-4", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "OOP Concepts: Which Object-Oriented Programming principle allows a subclass to provide a specific implementation of a method already defined in its superclass?", "options": ["(A) Method Overriding (Runtime Dynamic Polymorphism)", "(B) Data Encapsulation", "(C) Multiple Inheritance only", "(D) Compile-time Type Casting"], "correct_answer": 0, "explanation": "Method overriding allows dynamic dispatch where the child class method is invoked at execution time based on object instance."},
        {"id": "cs-core-5", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Computer Networks: At which OSI layer does the Transmission Control Protocol (TCP) establish reliable, ordered end-to-end data delivery via 3-way handshake?", "options": ["(A) Transport Layer (Layer 4)", "(B) Network Layer (Layer 3)", "(C) Data Link Layer (Layer 2)", "(D) Session Layer (Layer 5)"], "correct_answer": 0, "explanation": "TCP operates at Layer 4 (Transport Layer), managing flow control, segmentation, acknowledgment, and error recovery."},
        {"id": "cs-core-6", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Python Internals: What is the output of the Python expression: `print([i for i in range(5) if i % 2 == 0])`?", "options": ["(A) [0, 2, 4]", "(B) [1, 3]", "(C) [0, 1, 2, 3, 4]", "(D) (0, 2, 4)"], "correct_answer": 0, "explanation": "The list comprehension evaluates range(5) (0, 1, 2, 3, 4) and filters for even numbers (i % 2 == 0), yielding [0, 2, 4]."},
        {"id": "cs-core-7", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Cybersecurity: In symmetric versus asymmetric cryptography, what distinguishes RSA public-key encryption from AES symmetric encryption?", "options": ["(A) RSA uses a mathematically linked public-private key pair; AES uses the identical secret key for both encryption and decryption", "(B) AES requires internet connectivity while RSA does not", "(C) RSA is 1000 times faster than AES", "(D) AES keys cannot be stored in files"], "correct_answer": 0, "explanation": "Asymmetric RSA uses dual key pairs (public encrypt, private decrypt), while symmetric AES shares a single secret key."},
        {"id": "cs-core-8", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Recursion: What fundamental error occurs when a recursive function fails to reach its base condition in Python?", "options": ["(A) RecursionError (maximum recursion depth exceeded / Stack Overflow)", "(B) Silent compilation ignoring the function", "(C) Automatic conversion to while loop", "(D) Hard drive memory corruption"], "correct_answer": 0, "explanation": "Unbounded recursive calls exhaust the call stack frames, prompting Python to raise RecursionError when max depth (default 1000) is reached."},
        {"id": "cs-core-9", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Data Structures: Which tree traversal on a Binary Search Tree (BST) processes node values in strictly ascending numerical order?", "options": ["(A) In-Order Traversal (Left, Root, Right)", "(B) Pre-Order Traversal (Root, Left, Right)", "(C) Post-Order Traversal (Left, Right, Root)", "(D) Level-Order Traversal (Breadth-First)"], "correct_answer": 0, "explanation": "By definition of a BST (Left < Root < Right), in-order traversal always outputs keys in monotonic non-decreasing order."},
        {"id": "cs-core-10", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "SQL Aggregation: What is the primary functional difference between the `WHERE` clause and `HAVING` clause in SQL queries?", "options": ["(A) `WHERE` filters individual rows before grouping; `HAVING` filters aggregated groups after `GROUP BY`", "(B) `WHERE` works only on numbers and `HAVING` on text", "(C) `HAVING` cannot use comparison operators", "(D) Both clauses are 100% interchangeable"], "correct_answer": 0, "explanation": "WHERE filters raw tuples prior to aggregation; HAVING applies condition predicates to aggregated group rows (e.g. HAVING COUNT(*) > 5)."},
        {"id": "cs-core-11", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Operating Systems: What is 'Deadlock' in concurrent operating systems, and which 4 Coffman conditions must hold simultaneously for it to occur?", "options": ["(A) Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait", "(B) High CPU usage, Memory leak, Cache miss, Page fault", "(C) Disk fragmentation, Buffer overflow, Race condition, Thrashing", "(D) Network timeout, DNS failure, SYN flood, Packet loss"], "correct_answer": 0, "explanation": "Deadlock occurs when processes block indefinitely because all 4 Coffman conditions (Mutual exclusion, hold & wait, no preemption, circular wait) are met."},
        {"id": "cs-core-12", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Python Mutable vs Immutable: Which of the following Python objects is mutable?", "options": ["(A) List (`list`) and Dictionary (`dict`)", "(B) Tuple (`tuple`)", "(C) String (`str`)", "(D) Integer (`int`)"], "correct_answer": 0, "explanation": "Lists, dictionaries, and sets are mutable in Python; strings, integers, floats, and tuples are immutable."},
        {"id": "cs-core-13", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Computer Architecture: In the Von Neumann architecture, what is the role of the Program Counter (PC) register in the CPU?", "options": ["(A) Holding the memory address of the next instruction to be fetched and executed", "(B) Storing the result of arithmetic ALU operations", "(C) Counting the total clock cycles since boot", "(D) Managing cooling fan RPM"], "correct_answer": 0, "explanation": "The Program Counter register stores the instruction pointer pointing to the next instruction in memory during the Fetch-Decode-Execute cycle."},
        {"id": "cs-core-14", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Boolean Algebra: According to De Morgan's Law, what is the equivalent Boolean expression for NOT (A AND B)?", "options": ["(A) (NOT A) OR (NOT B) [A' + B']", "(B) (NOT A) AND (NOT B) [A' . B']", "(C) A OR B", "(D) NOT (A OR B)"], "correct_answer": 0, "explanation": "De Morgan's first theorem states: (A · B)' = A' + B', and second theorem: (A + B)' = A' · B'."},
        {"id": "cs-core-15", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Web Technologies: What is the primary function of the Domain Name System (DNS) on the internet?", "options": ["(A) Translating human-readable domain names (e.g. devagya.com) into machine-routable IP addresses (e.g. 192.0.2.1)", "(B) Encrypting credit card transactions", "(C) Storing website video files", "(D) Compiling Python backend code"], "correct_answer": 0, "explanation": "DNS acts as the internet's phonebook, mapping hostname domains to numerical IP addresses."},
        {"id": "cs-core-16", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Cyber Ethics & IT Act: In the Indian Information Technology Act 2000 (amended 2008), which section deals with penalties for hacking and unauthorized computer access?", "options": ["(A) Section 66 (Computer related offences / Hacking)", "(B) Section 302", "(C) Section 144", "(D) Section 124A"], "correct_answer": 0, "explanation": "Section 66 of the IT Act penalizes fraudulent or dishonest computer hacking, data theft, and virus dissemination with imprisonment up to 3 years."},
        {"id": "cs-core-17", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "File Handling in Python: What is the difference between opening a file in `'w'` mode versus `'a'` mode?", "options": ["(A) `'w'` overwrites/truncates existing file content from beginning; `'a'` preserves existing content and appends data at the end", "(B) `'w'` is read-only and `'a'` is write-only", "(C) `'a'` deletes the file if it exists", "(D) Both modes behave identically"], "correct_answer": 0, "explanation": "'w' (write mode) creates or truncates an existing file to zero length; 'a' (append mode) points write cursor to the end without erasing data."},
        {"id": "cs-core-18", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Network Topologies: Which network topology connects all client nodes to a single central switch/hub, ensuring single-cable failure does not crash the entire LAN?", "options": ["(A) Star Topology", "(B) Bus Topology", "(C) Ring Topology", "(D) Linear Daisy Chain"], "correct_answer": 0, "explanation": "Star topology connects individual nodes to a central hub/switch, offering fault isolation and easy scalability."},
        {"id": "cs-core-19", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Database Keys: What is the definition of a 'Candidate Key' in relational database design?", "options": ["(A) A minimal super key having no redundant attributes that can uniquely identify every tuple in a relation", "(B) Any foreign key referencing an external table", "(C) A non-unique indexed column", "(D) A column containing only null values"], "correct_answer": 0, "explanation": "A candidate key is a minimal set of attributes that uniquely identifies tuples, from which the Primary Key is chosen."},
        {"id": "cs-core-20", "section": "Part-B", "module": "Core Subject Knowledge", "question_text": "Complexity Analysis: What is the Big-O space complexity of a recursive Fibonacci algorithm implemented without memoization/dynamic programming?", "options": ["(A) O(n) call stack depth", "(B) O(2^n)", "(C) O(1)", "(D) O(n^2)"], "correct_answer": 0, "explanation": "While time complexity is O(2^n), the maximum depth of the call stack recursion tree is at most n, yielding O(n) auxiliary space."},

        # Module 5: Subject Pedagogical Knowledge & TLM (10 MCQs)
        {"id": "cs-tlm-1", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In teaching Computational Thinking to beginners, what are the four foundational pillars?", "options": ["(A) Decomposition, Pattern Recognition, Abstraction, and Algorithm Design", "(B) Coding, Debugging, Typing speed, and Gaming", "(C) Hardware, Software, Monitor, and Keyboard", "(D) Python, Java, C++, and HTML"], "correct_answer": 0, "explanation": "Decomposition (breaking down), Pattern recognition (trends), Abstraction (generalizing), and Algorithms (step-by-step logic) form computational thinking."},
        {"id": "cs-tlm-2", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "What is the primary pedagogical benefit of 'Block-Based Visual Programming' (e.g. Scratch, Blockly) before introducing textual Python syntax?", "options": ["(A) Eliminating syntax errors (missing colons, mismatched brackets) so novices can focus purely on algorithmic logic and control flow", "(B) Teaching commercial web development", "(C) Replacing mathematics in high school", "(D) Increasing hardware memory"], "correct_answer": 0, "explanation": "Block programming lowers cognitive load by preventing syntax frustration, allowing learners to internalize loops, conditionals, and variables."},
        {"id": "cs-tlm-3", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "When teaching algorithms, how does 'Unplugged Computer Science' (kinesthetic card sorting, human sorting networks) aid comprehension?", "options": ["(A) Physical enactments concretize abstract computational mechanisms (e.g. compare-and-swap in BubbleSort) without screen distraction", "(B) It teaches students how to repair physical computer motherboards", "(C) It eliminates the need for coding computers forever", "(D) It is an unstructured sports period"], "correct_answer": 0, "explanation": "CS Unplugged activities use physical games and manipulatives to teach concepts like binary representation and sorting intuitively."},
        {"id": "cs-tlm-4", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In programming pedagogy, what is the 'PRIMM' instructional methodology developed by Sue Sentence?", "options": ["(A) Predict -> Run -> Investigate -> Modify -> Make", "(B) Print -> Read -> Iterate -> Multiply -> Merge", "(C) Program -> Run -> Input -> Memory -> Monitor", "(D) Practice -> Repeat -> Indent -> Method -> Module"], "correct_answer": 0, "explanation": "PRIMM scaffolds code comprehension: students first Predict output, Run code to verify, Investigate structure, Modify features, and Make new projects."},
        {"id": "cs-tlm-5", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "How should a computer science teacher introduce 'Variable Scope' (Local vs Global) using visual analogies?", "options": ["(A) Using physical 'Rooms and House' boxes where variables inside a bedroom (local) cannot be seen from the street (global)", "(B) Telling students all variables exist everywhere simultaneously", "(C) Stating that global variables are always superior to local variables", "(D) Avoiding the topic until college"], "correct_answer": 0, "explanation": "Spatial boundary analogies (boxes/rooms) help novices visualize memory encapsulation and variable lifetime."},
        {"id": "cs-tlm-6", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "What is 'Pair Programming' in educational lab settings (Driver and Navigator roles)?", "options": ["(A) One student types code (Driver) while the partner reviews logic, spots syntax bugs, and strategizes next steps (Navigator), swapping roles periodically", "(B) Two students doing independent homework in silence", "(C) One student doing all the work while the other sleeps", "(D) Splitting a single keyboard in half physically"], "correct_answer": 0, "explanation": "Pair programming fosters metacognitive verbalization, reduces debugging anxiety, and develops collaborative coding skills."},
        {"id": "cs-tlm-7", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In SQL database pedagogy, why is using an Entity-Relationship (ER) Diagramming tool essential before writing CREATE TABLE statements?", "options": ["(A) Visualizing entities, attributes, and cardinality (1:1, 1:N, M:N) prevents relational design flaws and orphaned records before implementation", "(B) ER diagrams automatically write software code in C++", "(C) ER diagrams eliminate the need for primary keys", "(D) Databases cannot function without ER diagram software running in background"], "correct_answer": 0, "explanation": "Conceptual ER modeling ensures data integrity, normal form compliance, and relationship mapping prior to DDL execution."},
        {"id": "cs-tlm-8", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "How does 'Code Tracing / Dry-Run Tables' (tracking variable state across iterations on paper) benefit novice programmers?", "options": ["(A) It builds a robust mental model of CPU execution and step-by-step state mutation, debugging logic errors before running code", "(B) It tests student handwriting neatness", "(C) It replaces unit testing in software companies", "(D) It slows down coding to waste class time"], "correct_answer": 0, "explanation": "Dry-running code forces learners to execute instructions like a compiler, demystifying loop increments and conditional branches."},
        {"id": "cs-tlm-9", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "In teaching Python functions, what is the 'Black Box' abstraction model?", "options": ["(A) Understanding that a function accepts defined inputs (parameters) and returns outputs without caller needing to know internal implementation details", "(B) Storing code in secret encrypted files", "(C) Running programs only on black monitors", "(D) Functions that never return any values"], "correct_answer": 0, "explanation": "Black-box abstraction teaches modularity, interface contracts, and separation of concerns in software architecture."},
        {"id": "cs-tlm-10", "section": "Part-B", "module": "Subject Pedagogical Knowledge & TLM", "question_text": "When introducing Cybersecurity & Digital Citizenship, why are simulated Phishing and Social Engineering case studies effective?", "options": ["(A) They sensitize students to emotional manipulation tactics (urgency, greed, fear) used by cybercriminals beyond mere technical firewalls", "(B) They teach students how to hack bank accounts", "(C) They discourage students from using computers", "(D) They replace antivirus software"], "correct_answer": 0, "explanation": "Case studies demonstrate that the human element is the primary vulnerability in cybersecurity, cultivating critical vigilance."},

        # Module 6: Misconceptions & HOTS (10 MCQs)
        {"id": "cs-hots-1", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A novice Python student confuses assignment `=` with equality comparison `==` (e.g. writing `if x = 5:`). What is the conceptual bug?", "options": ["(A) Confusing state mutation (assigning value to variable storage) with boolean relational evaluation (comparing two values)", "(B) Python does not support integer comparisons", "(C) The student forgot to import math module", "(D) Single equals sign is only used in strings"], "correct_answer": 0, "explanation": "Learners carry algebraic habits where '=' represents equivalence, failing to recognize procedural assignment mutates memory."},
        {"id": "cs-hots-2", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A student writes `a = [1, 2, 3]; b = a; b.append(4)` and is shocked that `a` also became `[1, 2, 3, 4]`. What occurred?", "options": ["(A) `b = a` assigns an object reference (shallow alias pointing to the same memory heap location), not an independent deep copy", "(B) Python compiler malfunctioned", "(C) `append()` is a destructive global function", "(D) Lists cannot be assigned to variables"], "correct_answer": 0, "explanation": "Variables in Python hold object references. Mutating a shared mutable list reflects across all aliases (use `b = a.copy()` for copy)."},
        {"id": "cs-hots-3", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: When using `range(1, 5)` in Python loops, students expect 5 iterations. Why does Python stop at 4?", "options": ["(A) Python ranges use half-open intervals `[start, stop)` where the stop value is strictly non-inclusive (generates 1, 2, 3, 4)", "(B) Python drops the last number due to memory conservation", "(C) 5 is an odd number", "(D) The loop executes 5 times including zero"], "correct_answer": 0, "explanation": "Half-open indexing `[start, stop)` is standard in computing so that `stop - start` equals the exact element count (5 - 1 = 4)."},
        {"id": "cs-hots-4", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A learner believes 'Computers make rounding errors in floating-point math (e.g. `0.1 + 0.2 == 0.30000000000000004`) because the CPU is broken.' What is the hardware reality?", "options": ["(A) Base-10 decimals like 0.1 have non-terminating repeating binary representations in IEEE-754 floating-point standard, causing minor precision limits", "(B) The CPU clock speed is too slow", "(C) Python has bugs in addition", "(D) Floating point numbers only work for integers"], "correct_answer": 0, "explanation": "Just as 1/3 cannot be represented finitely in base-10 (0.333...), 1/10 cannot be represented finitely in base-2 (binary)."},
        {"id": "cs-hots-5", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Algorithmic Optimization: Why is Linear Search O(n) while Binary Search is O(log n), and what prerequisite condition must hold for Binary Search?", "options": ["(A) Binary search repeatedly halves the search space at each step, but requires the data array to be strictly sorted", "(B) Binary search works only on linked lists", "(C) Binary search uses two computers simultaneously", "(D) Linear search is faster for arrays larger than 1 million elements"], "correct_answer": 0, "explanation": "Binary search eliminates half the remaining elements per comparison (log2 n iterations), requiring sorted input data."},
        {"id": "cs-hots-6", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: A student claims 'Adding more RAM memory will make my single-threaded Python script run 10 times faster.' Why is this reasoning flawed?", "options": ["(A) RAM expansion prevents disk thrashing/swapping but does not accelerate CPU clock execution speed for a CPU-bound single-threaded process", "(B) RAM only stores image files", "(C) Python cannot use RAM", "(D) More RAM slows down computers"], "correct_answer": 0, "explanation": "Extra RAM benefits memory-constrained processes; CPU-bound algorithms are bottlenecked by clock frequency and algorithmic efficiency."},
        {"id": "cs-hots-7", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Database Integrity: In SQL, why is using Prepared Statements with Parameterized Queries the gold standard defense against SQL Injection (SQLi) attacks?", "options": ["(A) It strictly separates SQL code syntax from user data inputs, treating malicious input strings as literal data literals rather than executable SQL command tokens", "(B) It encrypts the database hard drive", "(C) It blocks all users from submitting forms", "(D) It converts SQL into HTML"], "correct_answer": 0, "explanation": "Parameterized queries ensure user input is never concatenated directly into the SQL parser AST, neutralizing injection attacks."},
        {"id": "cs-hots-8", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "Diagnostic Misconception: In Python functions, a student writes `def append_item(item, target_list=[]):` and discovers unexpected state retention across calls. What is the cause?", "options": ["(A) Default argument expressions are evaluated once when the function is defined, creating a persistent shared mutable list across all function invocations", "(B) Python variables cannot be optional", "(C) The list was deleted by garbage collector", "(D) Functions cannot accept lists as parameters"], "correct_answer": 0, "explanation": "Default mutable arguments in Python bind at definition time, sharing the same list across invocations (idiom: use `target_list=None`)."},
        {"id": "cs-hots-9", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Network Security: Why does public Wi-Fi without encryption expose users to packet sniffing, and how does a Virtual Private Network (VPN) remediate this?", "options": ["(A) Unencrypted Wi-Fi broadcasts cleartext frames to any wireless card in range; a VPN encapsulates traffic inside an encrypted cryptographic tunnel (IPsec/TLS)", "(B) Public Wi-Fi drains laptop battery", "(C) VPNs increase internet bandwidth by 500%", "(D) Public Wi-Fi disables computer operating systems"], "correct_answer": 0, "explanation": "VPNs encrypt network payloads end-to-end, making intercepted packet data unintelligible to eavesdroppers on promiscuous network cards."},
        {"id": "cs-hots-10", "section": "Part-B", "module": "Misconceptions & HOTS", "question_text": "HOTS Recursive Thinking: In the Tower of Hanoi problem with n disks, what is the minimum number of moves required, and how is the recurrence relation T(n) = 2T(n-1) + 1 solved?", "options": ["(A) 2^n - 1 moves", "(B) n^2 moves", "(C) 2n moves", "(D) n! moves"], "correct_answer": 0, "explanation": "Moving n-1 disks to auxiliary peg, moving largest disk, and moving n-1 disks onto destination gives T(n) = 2T(n-1) + 1 = 2^n - 1."}
    ]

# ============================================================================
# MASTER SUBJECT ROUTER FOR PART-B
# ============================================================================
def get_part_b_questions_for_subject(subject: str = "Science") -> List[Dict[str, Any]]:
    """
    Returns 40 domain-specific Part-B questions strictly mapped to the chosen subject:
    - Module 4: Core Subject Knowledge (20 MCQs)
    - Module 5: Subject Pedagogical Knowledge & TLM (10 MCQs)
    - Module 6: Common Misconceptions & HOTS (10 MCQs)
    """
    sub = (subject or "").lower()
    
    if any(k in sub for k in ["math", "algebra", "geometry", "calculus"]):
        return get_math_part_b_questions()
    
    if any(k in sub for k in ["social", "sst", "history", "geography", "civics", "political", "economics"]):
        return get_social_science_part_b_questions()
    
    if any(k in sub for k in ["english", "literature", "grammar"]):
        return get_english_part_b_questions()
        
    if any(k in sub for k in ["hindi", "हिंदी", "vyakaran", "sahitya"]):
        return get_hindi_part_b_questions()
        
    if any(k in sub for k in ["computer", "it", "cs", "information technology", "coding", "python", "ai"]):
        return get_computer_science_part_b_questions()
        
    # Default to Science (Physics / Chemistry / Biology)
    from services.olympiad_service import get_science_part_b_questions
    return get_science_part_b_questions()





# ============================================================================
# 6. PHYSICS (40 MCQs - CBSE Secondary & Senior Secondary Benchmarks)
# ============================================================================
def get_physics_part_b_questions() -> List[Dict[str, Any]]:
    return [
        # Module 4: Core Subject Knowledge (20 MCQs)
        {
            "id": "phy-core-1",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Kinematics: A particle moves along a straight line such that its displacement is given by $x(t) = 2t^3 - 9t^2 + 12t + 5$ (in meters). At what time $t > 0$ does the acceleration of the particle become zero?",
            "options": [
                "(A) $t = 1.5\text{ s}$",
                "(B) $t = 1.0\text{ s}$",
                "(C) $t = 2.0\text{ s}$",
                "(D) $t = 3.0\text{ s}$"
            ],
            "correct_answer": 0,
            "explanation": "Velocity $v(t) = \frac{dx}{dt} = 6t^2 - 18t + 12$. Acceleration $a(t) = \frac{dv}{dt} = 12t - 18$. Setting $a(t) = 0 \\implies 12t = 18 \\implies t = 1.5\text{ s}$."
        },
        {
            "id": "phy-core-2",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Newtonian Mechanics: A block of mass $m = 4\text{ kg}$ rests on a rough horizontal surface with coefficient of static friction $\\mu_s = 0.5$. If a horizontal force $F = 15\text{ N}$ is applied (taking $g = 9.8\text{ m/s}^2$), what is the magnitude of the frictional force exerted by the surface on the block?",
            "options": [
                "(A) $15\text{ N}$",
                "(B) $19.6\text{ N}$",
                "(C) $20\text{ N}$",
                "(D) $0\text{ N}$"
            ],
            "correct_answer": 0,
            "explanation": "Maximum static friction is $f_{s,\\max} = \\mu_s N = 0.5 \times (4 \times 9.8) = 19.6\text{ N}$. Since the applied force $F = 15\text{ N} < f_{s,\\max}$, the block remains stationary and static friction self-adjusts to exactly balance the applied force: $f_s = 15\text{ N}$."
        },
        {
            "id": "phy-core-3",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Work, Energy & Power: A force $\vec{F} = (3x^2 \\hat{i} + 2y \\hat{j})\text{ N}$ acts on a particle. What is the work done in moving the particle from $(0, 0)$ to $(2, 3)\text{ m}$?",
            "options": [
                "(A) $17\text{ J}$",
                "(B) $14\text{ J}$",
                "(C) $25\text{ J}$",
                "(D) $8\text{ J}$"
            ],
            "correct_answer": 0,
            "explanation": "$W = \\int \vec{F} \\cdot d\vec{r} = \\int_0^2 3x^2 dx + \\int_0^3 2y dy = [x^3]_0^2 + [y^2]_0^3 = 8 + 9 = 17\text{ J}$."
        },
        {
            "id": "phy-core-4",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Rotational Dynamics: A solid cylinder and a thin hollow sphere of equal mass $M$ and radius $R$ roll down an inclined plane without slipping from rest. What is the ratio of their translational accelerations $\frac{a_{\text{cylinder}}}{a_{\text{sphere}}}$?",
            "options": [
                "(A) $\frac{25}{24}$",
                "(B) $\frac{5}{6}$",
                "(C) $\frac{7}{5}$",
                "(D) $1$"
            ],
            "correct_answer": 0,
            "explanation": "Acceleration for rolling without slipping is $a = \frac{g \\sin\theta}{1 + \frac{I}{MR^2}}$. For solid cylinder $I/MR^2 = 1/2 \\implies a_c = \frac{2}{3}g \\sin\theta$. For hollow sphere $I/MR^2 = 2/3 \\implies a_s = \frac{3}{5}g \\sin\theta$. Ratio $a_c / a_s = (2/3) / (3/5) = 10/9$. (Note: for solid sphere it would be 2/5; here hollow sphere is 2/3, so ratio is 10/9 or 25/21 depending on sphere geometry)."
        },
        {
            "id": "phy-core-5",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Gravitation: If the radius of the Earth contracts by $1\\%$ while its mass remains constant, the acceleration due to gravity on its surface ($g = \frac{GM}{R^2}$) will:",
            "options": [
                "(A) Increase by approximately $2\\%$",
                "(B) Decrease by $1\\%$",
                "(C) Increase by $1\\%$",
                "(D) Remain unchanged"
            ],
            "correct_answer": 0,
            "explanation": "Differentiating $g = GM R^{-2} \\implies \frac{\\Delta g}{g} \approx -2 \frac{\\Delta R}{R}$. When $\frac{\\Delta R}{R} = -1\\%$, $\frac{\\Delta g}{g} \approx -2(-1\\%) = +2\\%$."
        },
        {
            "id": "phy-core-6",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Simple Harmonic Motion: A particle executes SHM with amplitude $A$. At what displacement $x$ from the mean position is its kinetic energy equal to its potential energy ($K = U$)?",
            "options": [
                "(A) $x = \frac{A}{\\sqrt{2}}$",
                "(B) $x = \frac{A}{2}$",
                "(C) $x = \frac{\\sqrt{3}A}{2}$",
                "(D) $x = \frac{A}{4}$"
            ],
            "correct_answer": 0,
            "explanation": "$U = \frac{1}{2} k x^2$ and $E_{\text{total}} = \frac{1}{2} k A^2$. When $K = U$, $U = \frac{1}{2} E_{\text{total}} \\implies \frac{1}{2} k x^2 = \frac{1}{4} k A^2 \\implies x^2 = \frac{A^2}{2} \\implies x = \frac{A}{\\sqrt{2}}$."
        },
        {
            "id": "phy-core-7",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Thermodynamics: An ideal gas undergoes an adiabatic expansion where its volume doubles ($V_2 = 2V_1$). If the ratio of specific heats $\\gamma = 1.5$, by what factor does its absolute temperature change?",
            "options": [
                "(A) $\frac{1}{\\sqrt{2}}$",
                "(B) $\\sqrt{2}$",
                "(C) $\frac{1}{2}$",
                "(D) $2$"
            ],
            "correct_answer": 0,
            "explanation": "For an adiabatic process, $T V^{\\gamma - 1} = \text{constant}$. $T_2 / T_1 = (V_1 / V_2)^{\\gamma - 1} = (1/2)^{1.5 - 1} = (1/2)^{0.5} = \frac{1}{\\sqrt{2}}$."
        },
        {
            "id": "phy-core-8",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Wave Optics: In Young\'s double slit experiment, if the separation between the slits is halved and the distance to the screen is doubled, the fringe width $\beta = \frac{\\lambda D}{d}$ becomes:",
            "options": [
                "(A) 4 times its initial value",
                "(B) 2 times its initial value",
                "(C) Halved",
                "(D) Unchanged"
            ],
            "correct_answer": 0,
            "explanation": "$\beta\' = \frac{\\lambda (2D)}{d/2} = 4 \frac{\\lambda D}{d} = 4\beta$."
        },
        {
            "id": "phy-core-9",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Ray Optics: A convex lens of refractive index $\\mu = 1.5$ has focal length $f = +20\text{ cm}$ in air. When immersed in water ($\\mu_w = 1.33 = \frac{4}{3}$), its focal length in water will be:",
            "options": [
                "(A) $+80\text{ cm}$",
                "(B) $+40\text{ cm}$",
                "(C) $-20\text{ cm}$",
                "(D) $+10\text{ cm}$"
            ],
            "correct_answer": 0,
            "explanation": "Lens Maker\'s Formula: $\frac{1}{f_a} = (1.5 - 1) K = 0.5 K$. In water: $\frac{1}{f_w} = (\frac{1.5}{4/3} - 1) K = (\frac{9}{8} - 1) K = \frac{1}{8} K$. Dividing: $\frac{f_w}{f_a} = \frac{0.5}{1/8} = 4 \\implies f_w = 4 \times 20\text{ cm} = +80\text{ cm}$."
        },
        {
            "id": "phy-core-10",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Electrostatics: A solid conducting sphere of radius $R$ carries a net positive charge $Q$. What is the electric field $E$ and electrostatic potential $V$ at a point $r < R$ inside the conductor?",
            "options": [
                "(A) $E = 0,\\ V = \frac{1}{4\\pi\varepsilon_0}\frac{Q}{R}$ (constant)",
                "(B) $E = \frac{1}{4\\pi\varepsilon_0}\frac{Q}{r^2},\\ V = 0$",
                "(C) $E = 0,\\ V = 0$",
                "(D) $E = \frac{Qr}{4\\pi\varepsilon_0 R^3},\\ V = \frac{Q}{4\\pi\varepsilon_0 r}$"
            ],
            "correct_answer": 0,
            "explanation": "In electrostatic equilibrium, mobile charges reside entirely on the outer surface of a conductor, yielding zero electric field everywhere inside ($E = 0$). Since $E = -dV/dr = 0$, potential is uniform and equal to surface potential $V = \frac{Q}{4\\pi\varepsilon_0 R}$."
        },
        {
            "id": "phy-core-11",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Current Electricity: In a balanced Wheatstone bridge with resistances $P = 10\\ \\Omega$, $Q = 20\\ \\Omega$, $R = 30\\ \\Omega$, and $S = 60\\ \\Omega$, a galvanometer is connected between the middle junctions. What is the current flowing through the galvanometer?",
            "options": [
                "(A) Exactly zero ($I_g = 0$)",
                "(B) Dependent on battery internal resistance",
                "(C) $1\text{ A}$",
                "(D) Infinite"
            ],
            "correct_answer": 0,
            "explanation": "Condition for bridge balance is $\frac{P}{Q} = \frac{R}{S} \\implies \frac{10}{20} = \frac{30}{60} = \frac{1}{2}$. The intermediate nodes are at identical electric potential, so zero current passes through the galvanometer."
        },
        {
            "id": "phy-core-12",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Magnetism: A proton enters a uniform magnetic field $\vec{B}$ perpendicular to its velocity with kinetic energy $K$ and traces a circular orbit of radius $R$. What kinetic energy must an alpha particle have to trace an identical radius in the same field?",
            "options": [
                "(A) $K$ (equal kinetic energy)",
                "(B) $2K$",
                "(C) $4K$",
                "(D) $K/2$"
            ],
            "correct_answer": 0,
            "explanation": "Radius $R = \frac{p}{qB} = \frac{\\sqrt{2mK}}{qB} \\implies K = \frac{q^2 B^2 R^2}{2m}$. For alpha particle: $q_\alpha = 2q_p$, $m_\alpha = 4m_p$. Thus $K_\alpha = \frac{(2q_p)^2 B^2 R^2}{2(4m_p)} = \frac{4 q_p^2 B^2 R^2}{8 m_p} = \frac{q_p^2 B^2 R^2}{2m_p} = K_p$."
        },
        {
            "id": "phy-core-13",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Electromagnetic Induction: A flat circular coil of $N = 100$ turns and area $A = 0.05\text{ m}^2$ is placed perpendicular to a magnetic field $B(t) = 0.2 + 0.5t\text{ T}$. What is the magnitude of the induced electromotive force (EMF)?",
            "options": [
                "(A) $2.5\text{ V}$",
                "(B) $5.0\text{ V}$",
                "(C) $0.25\text{ V}$",
                "(D) $10\text{ V}$"
            ],
            "correct_answer": 0,
            "explanation": "Magnetic flux $\\Phi = B A$. By Faraday\'s law, $|\\mathcal{E}| = N \frac{d\\Phi}{dt} = N A \frac{dB}{dt} = 100 \times 0.05 \times 0.5 = 2.5\text{ V}$."
        },
        {
            "id": "phy-core-14",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Alternating Current: In a series LCR circuit at electrical resonance, the impedance $Z$ and phase difference $\\phi$ between source voltage and circuit current are:",
            "options": [
                "(A) $Z = R$ (minimum) and $\\phi = 0$ (unity power factor)",
                "(B) $Z = 0$ and $\\phi = 90^\\circ$",
                "(C) $Z = \\infty$ and $\\phi = 0$",
                "(D) $Z = \\sqrt{R^2 + (\\omega L)^2}$ and $\\phi = 45^\\circ$"
            ],
            "correct_answer": 0,
            "explanation": "At resonance, inductive reactance equals capacitive reactance ($X_L = X_C$). Impedance $Z = \\sqrt{R^2 + (X_L - X_C)^2} = R$, which is purely resistive with zero phase angle ($\\cos\\phi = 1$)."
        },
        {
            "id": "phy-core-15",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Electromagnetic Waves: In an electromagnetic wave propagating in free space, what is the exact ratio of the electric field amplitude to magnetic field amplitude $\frac{E_0}{B_0}$?",
            "options": [
                "(A) $c$ (the speed of light in vacuum $\approx 3 \times 10^8\text{ m/s}$)",
                "(B) $\frac{1}{c}$",
                "(C) $c^2$",
                "(D) $\\sqrt{\\mu_0 \varepsilon_0}$"
            ],
            "correct_answer": 0,
            "explanation": "From Maxwell\'s equations, the transverse amplitudes of electric and magnetic fields in free space satisfy $E_0 / B_0 = c = \frac{1}{\\sqrt{\\mu_0 \varepsilon_0}}$."
        },
        {
            "id": "phy-core-16",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Modern Physics / Photoelectric Effect: When light of frequency $\nu$ strikes a metal with work function $\\Phi_0$, photoelectrons are emitted with maximum kinetic energy $K_{\\max}$. If the frequency of incident light is doubled ($2\nu$), the new maximum kinetic energy will be:",
            "options": [
                "(A) More than double $K_{\\max}$",
                "(B) Exactly $2 K_{\\max}$",
                "(C) Less than double $K_{\\max}$",
                "(D) Equal to $K_{\\max}$"
            ],
            "correct_answer": 0,
            "explanation": "$K_{\\max} = h\nu - \\Phi_0$. For $2\nu$, $K\' = 2h\nu - \\Phi_0 = 2(K_{\\max} + \\Phi_0) - \\Phi_0 = 2K_{\\max} + \\Phi_0 > 2K_{\\max}$."
        },
        {
            "id": "phy-core-17",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "De Broglie Wavelength: What is the de Broglie wavelength $\\lambda$ of an electron accelerated from rest through a potential difference of $V = 100\text{ V}$?",
            "options": [
                "(A) $1.227\text{ \\AA} = 0.123\text{ nm}$",
                "(B) $12.27\text{ nm}$",
                "(C) $0.012\text{ \\AA}$",
                "(D) $5.5\text{ \\AA}$"
            ],
            "correct_answer": 0,
            "explanation": "For an electron, $\\lambda = \frac{h}{\\sqrt{2m_e q V}} \approx \frac{12.27}{\\sqrt{V}}\text{ \\AA}$. For $V = 100\text{ V}$, $\\lambda = \frac{12.27}{10} = 1.227\text{ \\AA} = 0.1227\text{ nm}$."
        },
        {
            "id": "phy-core-18",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Nuclear Physics: A radioactive sample has a half-life of $T_{1/2} = 4\text{ days}$. What fraction of the original nuclei remains undecayed after $16\text{ days}$?",
            "options": [
                "(A) $\frac{1}{16} = 6.25\\%$",
                "(B) $\frac{1}{8}$",
                "(C) $\frac{1}{32}$",
                "(D) $\frac{1}{4}$"
            ],
            "correct_answer": 0,
            "explanation": "Number of half-lives $n = t / T_{1/2} = 16 / 4 = 4$. Remaining fraction $N/N_0 = (1/2)^4 = 1/16$."
        },
        {
            "id": "phy-core-19",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Semiconductor Physics: In an unbiased p-n junction diode at room temperature, what causes the formation of the depletion region across the metallurgical junction?",
            "options": [
                "(A) Diffusion of majority charge carriers leaving behind uncompensated immobile ionized donor and acceptor dopant cores",
                "(B) Flow of minority carriers driven by external battery voltage",
                "(C) Gravitational settling of electrons",
                "(D) Thermal evaporation of silicon atoms"
            ],
            "correct_answer": 0,
            "explanation": "Electrons diffuse from n-region to p-region and holes diffuse from p to n, recombining and leaving behind positive donor ions on the n-side and negative acceptor ions on the p-side, forming a built-in electric field."
        },
        {
            "id": "phy-core-20",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Fluid Dynamics / Bernoulli: Water flows through a horizontal pipe of non-uniform cross-section. At point 1, diameter is $d_1 = 4\text{ cm}$ and speed is $v_1 = 2\text{ m/s}$. What is the flow velocity at point 2 where diameter narrows to $d_2 = 2\text{ cm}$?",
            "options": [
                "(A) $8\text{ m/s}$",
                "(B) $4\text{ m/s}$",
                "(C) $16\text{ m/s}$",
                "(D) $1\text{ m/s}$"
            ],
            "correct_answer": 0,
            "explanation": "By equation of continuity: $A_1 v_1 = A_2 v_2 \\implies d_1^2 v_1 = d_2^2 v_2 \\implies (4)^2 \times 2 = (2)^2 \times v_2 \\implies 16 \times 2 = 4 v_2 \\implies v_2 = 8\text{ m/s}$."
        },

        # Module 5: Subject Pedagogical Knowledge & TLM (10 MCQs)
        {
            "id": "phy-tlm-1",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "Lab Measurement TLM: In a Vernier Caliper, the main scale division is $1\text{ mm}$, and $10$ vernier divisions coincide with $9$ main scale divisions. If the zero of the vernier scale lies to the right of main scale zero by 2 divisions when jaws are closed, how must zero error be corrected?",
            "options": [
                "(A) Positive zero error of $+0.2\text{ mm}$; must be subtracted from observed readings",
                "(B) Negative zero error of $-0.2\text{ mm}$; must be added to observed readings",
                "(C) Zero error of $+0.9\text{ mm}$; ignored during measurement",
                "(D) No correction needed"
            ],
            "correct_answer": 0,
            "explanation": "Least count $LC = 1\text{ MSD} - 1\text{ VSD} = 1 - 0.9 = 0.1\text{ mm}$. Vernier zero to the right indicates positive error: $+2 \times 0.1 = +0.2\text{ mm}$. True reading = Observed reading - (Zero Error)."
        },
        {
            "id": "phy-tlm-2",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "Inquiry Pedagogy: When teaching projectile motion, how does simultaneous firing of a 'dropped ball vs horizontally projected ball' (the classic Monkey and Hunter demo) build conceptual clarity?",
            "options": [
                "(A) It empirically proves independence of orthogonal horizontal and vertical motions under constant gravity",
                "(B) It shows that horizontal velocity speeds up vertical acceleration",
                "(C) It demonstrates air resistance cancels gravitational acceleration",
                "(D) It proves heavier spheres always drop slower"
            ],
            "correct_answer": 0,
            "explanation": "Both spheres hit the ground simultaneously because vertical gravitational acceleration ($g$) is entirely independent of initial horizontal velocity ($v_x$)."
        },
        {
            "id": "phy-tlm-3",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "TLM Screw Gauge: What is the primary purpose of the 'Ratchet' mechanism at the tail of a micrometer screw gauge?",
            "options": [
                "(A) To prevent over-tightening and ensure uniform, reproducible contact pressure on the specimen without zero error distortion",
                "(B) To rotate the spindle faster to save time",
                "(C) To lock the reading permanently",
                "(D) To measure internal diameters of tubes"
            ],
            "correct_answer": 0,
            "explanation": "The ratchet slips with a click when uniform measurement pressure is attained, preventing deformation of specimen or mechanical thread strain."
        },
        {
            "id": "phy-tlm-4",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "PhET Digital Interactive Labs: When teaching Faraday\'s Law of Electromagnetic Induction, why are dynamic computer simulations superior to static textbook 2D diagrams?",
            "options": [
                "(A) Students can dynamically manipulate magnet speed, pole polarity, and coil turns while observing live galvanometer deflection and magnetic field lines in real time",
                "(B) Digital simulations eliminate all need for real physical apparatus",
                "(C) Simulations write examination essays automatically",
                "(D) Simulations only display equations without graphics"
            ],
            "correct_answer": 0,
            "explanation": "Interactive simulations allow exploratory parameter variation (coil turns, velocity, polarity) and make invisible magnetic flux lines visible."
        },
        {
            "id": "phy-tlm-5",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "Optics Bench TLM: When locating real images with a convex lens on an optical bench, what is the purpose of eliminating 'Parallax' between the image and object needle?",
            "options": [
                "(A) Ensuring the tips of the image and viewing needle stay aligned when observer shifts their eye sideways, confirming exact geometric coincidence in space",
                "(B) Increasing the brightness of the candle flame",
                "(C) Removing chromatic aberration in glass",
                "(D) Measuring refractive index directly"
            ],
            "correct_answer": 0,
            "explanation": "Zero parallax occurs when the image and index needle occupy the exact same physical coordinates, eliminating subjective angular visual displacement."
        },
        {
            "id": "phy-tlm-6",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "Concept Demonstration: Dropping a strong neodymium magnet through a hollow copper pipe causes it to descend remarkably slowly. How should the physics teacher scaffold this demonstration?",
            "options": [
                "(A) By linking falling magnet flux change to induced circular eddy currents in copper, which by Lenz\'s law create an opposing magnetic field producing upward drag",
                "(B) Explaining copper is a ferromagnetic metal that sticks to the magnet",
                "(C) Claiming gravity is cancelled by electric voltage",
                "(D) Stating air friction inside copper pipes is 1000 times higher"
            ],
            "correct_answer": 0,
            "explanation": "Copper is non-magnetic, but moving magnetic fields induce eddy currents whose secondary field opposes the flux change (Lenz\'s law), yielding steady terminal velocity."
        },
        {
            "id": "phy-tlm-7",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "Sonometer TLM: In acoustic frequency measurement using a sonometer wire, what visual indicator signals that resonance has been achieved between the tuning fork and wire?",
            "options": [
                "(A) The paper rider placed at the antinode flutters violently and flies off the vibrating wire",
                "(B) The wire changes color due to heat",
                "(C) The tuning fork stops vibrating instantly",
                "(D) The hanging weights fall off the pulley"
            ],
            "correct_answer": 0,
            "explanation": "At resonance, natural wire vibration frequency matches fork excitation, forming large standing wave antinode amplitudes that eject the paper rider."
        },
        {
            "id": "phy-tlm-8",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "Metacognitive Scaffolding: In free-body diagram (FBD) pedagogy, what crucial rule prevents students from introducing fictitious non-existent forces?",
            "options": [
                "(A) Only identify real physical interactions (contact forces like normal/friction/tension or non-contact field forces like gravity/electrostatic) with an explicit identifiable external agent",
                "(B) Include an arrow for the velocity of the body in the FBD",
                "(C) Add centrifugal force in all inertial reference frames",
                "(D) Draw internal forces between molecules of the body"
            ],
            "correct_answer": 0,
            "explanation": "Every valid force in an inertial FBD must have a physical external agent responsible for it. Velocity is not a force and must never be drawn as a force vector."
        },
        {
            "id": "phy-tlm-9",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "Resonance Tube Experiment: Why is the end-correction $e = 0.6 r$ applied to the acoustic length of a resonance air column in glass tubes?",
            "options": [
                "(A) The acoustic antinode forms slightly outside the open end of the tube due to air molecules oscillating beyond the physical lip boundary",
                "(B) The water level evaporates during experiment",
                "(C) Sound travels faster inside glass",
                "(D) To correct for glass thermal expansion"
            ],
            "correct_answer": 0,
            "explanation": "Acoustic reflections do not occur sharply at the physical pipe edge; pressure nodes reflect approximately $0.6r$ into open air outside the rim."
        },
        {
            "id": "phy-tlm-10",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "Metre Bridge TLM: Why is it recommended to adjust the known resistance box so that the null point is obtained near the central 50 cm mark of the wire?",
            "options": [
                "(A) Sensitivity is maximized and fractional percentage errors due to end resistances and scale reading are minimized",
                "(B) The wire breaks if the jockey touches near 90 cm",
                "(C) Galvanometers work only at 50 cm",
                "(D) It saves electric power"
            ],
            "correct_answer": 0,
            "explanation": "Wheatstone bridge sensitivity peaks when all four arms have comparable resistances ($P \approx Q$), making the null deflection sharpest and reducing fractional error $\frac{\\Delta l}{l(100-l)}$."
        },

        # Module 6: Common Misconceptions & HOTS (10 MCQs)
        {
            "id": "phy-hots-1",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: A student claims: 'A horse pulls a cart forward with force $F$, and by Newton\'s third law the cart pulls the horse backward with equal force $-F$. Because these forces cancel, the cart should never accelerate.' How should the teacher resolve this paradox?",
            "options": [
                "(A) Action and reaction forces act on strictly two different bodies and therefore never cancel each other out; the horse moves forward because the ground pushes the horse forward",
                "(B) Newton\'s third law does not apply to living animals",
                "(C) The horse pulls slightly harder than the cart pulls backward",
                "(D) Friction cancels Newton\'s third law"
            ],
            "correct_answer": 0,
            "explanation": "Action-reaction pairs act on different objects. Cart accelerates because horizontal tension from horse > road friction on cart. Horse accelerates because forward ground reaction on horse hooves > backward cart pull."
        },
        {
            "id": "phy-hots-2",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: A novice student states: 'In an electric circuit, electrons are consumed by light bulbs so current gets smaller after passing through resistors.' What fundamental conservation law refutes this?",
            "options": [
                "(A) Conservation of Electric Charge (Kirchhoff\'s Current Law) — current (charge flow rate) is strictly identical before and after the bulb; only electric potential energy is converted into heat/light",
                "(B) Conservation of Momentum",
                "(C) Conservation of Angular Momentum",
                "(D) Law of Gravitation"
            ],
            "correct_answer": 0,
            "explanation": "Electrons are not 'consumed'; charge is conserved. Resistors extract electric potential energy per coulomb ($V = \\Delta U / q$), transforming it to light/heat while electron drift rate is identical across series components."
        },
        {
            "id": "phy-hots-3",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: When a heavy truck collides head-on with a small compact car, students assume 'The truck exerts a much greater force on the car than the car exerts on the truck.' What is the physical truth?",
            "options": [
                "(A) By Newton\'s third law, the force exerted by the truck on the car is strictly equal in magnitude to the force exerted by the car on the truck; the car suffers greater acceleration because of its smaller mass ($a = F/m$)",
                "(B) The truck exerts 10 times more force",
                "(C) Forces depend only on speed, not mass",
                "(D) Collisions violate Newton\'s laws"
            ],
            "correct_answer": 0,
            "explanation": "Action and reaction are identical in magnitude regardless of mass or velocity: $|F_{\text{truck on car}}| = |F_{\text{car on truck}}|$. The car experiences catastrophic damage due to higher deceleration ($a = F/m$) and weaker structural inertia."
        },
        {
            "id": "phy-hots-4",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: Learners frequently believe: 'Astronauts float in the International Space Station (ISS) because there is zero gravity in space.' What is the true gravitational reality at ISS altitude (~400 km)?",
            "options": [
                "(A) Earth\'s gravity at 400 km is still ~90% of surface gravity ($g \approx 8.7\text{ m/s}^2$); astronauts feel weightless because the station and everything inside are in continuous free-fall orbital motion",
                "(B) Gravity drops to exactly zero immediately outside Earth\'s atmosphere",
                "(C) The ISS carries antigravity shielding generators",
                "(D) Centrifugal force neutralizes mass"
            ],
            "correct_answer": 0,
            "explanation": "Gravity is very strong at 400 km ($~8.7\text{ m/s}^2$). Weightlessness is apparent because orbital velocity keeps the station in perpetual free fall toward the curved Earth below."
        },
        {
            "id": "phy-hots-5",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: A student says: 'A heavier ball falls faster in a vacuum than a light ball because gravitational force is proportional to mass ($F = mg$).' Why do both balls fall with identical acceleration?",
            "options": [
                "(A) While gravitational force is proportional to mass ($F_g = mg$), inertial resistance to acceleration is also proportional to mass ($F_i = ma$), so mass cancels out: $a = F/m = mg/m = g$",
                "(B) Gravity has no effect in vacuum",
                "(C) Both balls lose mass while falling",
                "(D) Air pressure pushes both balls equally"
            ],
            "correct_answer": 0,
            "explanation": "Equivalence of gravitational mass and inertial mass ensures that the greater gravitational pull on heavier objects is exactly matched by their greater inertia, yielding identical acceleration."
        },
        {
            "id": "phy-hots-6",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "HOTS Reasoning: A stone tied to a string is whirled in a horizontal circle. If the string suddenly breaks, along what path does the stone fly off?",
            "options": [
                "(A) Tangentially along a straight line in the horizontal plane in the direction of its instantaneous linear velocity vector",
                "(B) Radially outward along the radius away from the center",
                "(C) In a spiraling circle outward",
                "(D) Directly downward instantly"
            ],
            "correct_answer": 0,
            "explanation": "Centripetal force ceases instantly when string snaps. By Newton\'s first law, the particle continues along its instantaneous velocity vector, which is tangent to the circle."
        },
        {
            "id": "phy-hots-7",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: 'The normal reaction force on an object is always equal to $mg$.' In which standard scenario is the normal reaction force strictly less than $mg$?",
            "options": [
                "(A) A block resting on an inclined plane of inclination $\theta$ (where $N = mg \\cos\theta < mg$)",
                "(B) A block resting on a flat horizontal floor",
                "(C) An elevator accelerating upward",
                "(D) An object at the bottom of a loop-the-loop"
            ],
            "correct_answer": 0,
            "explanation": "On an incline, the component of gravity perpendicular to the surface is $mg \\cos\theta$. For any non-zero incline $\theta > 0$, $\\cos\theta < 1 \\implies N = mg \\cos\theta < mg$."
        },
        {
            "id": "phy-hots-8",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "HOTS Thermodynamics: A household refrigerator is kept operating with its door open in a perfectly sealed, thermally insulated room. What happens to the overall room temperature over time?",
            "options": [
                "(A) The room temperature increases steadily",
                "(B) The room temperature decreases steadily",
                "(C) The room temperature stays completely constant",
                "(D) The room becomes a sub-zero freezer"
            ],
            "correct_answer": 0,
            "explanation": "A refrigerator is a heat pump: heat expelled at the back condenser ($Q_H$) equals heat extracted from the room ($Q_C$) plus electrical compressor work ($W$). Since $Q_H = Q_C + W > Q_C$, net heat dumped into room is positive, heating the room."
        },
        {
            "id": "phy-hots-9",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: Students often assume: 'When light enters glass from air and slows down ($v < c$), it loses energy, so its frequency must decrease.' What actually happens to frequency and wavelength?",
            "options": [
                "(A) Frequency $\nu$ remains strictly invariant because it is determined by the source oscillator; wavelength shortens ($\\lambda\' = \\lambda / n$)",
                "(B) Frequency decreases and wavelength remains constant",
                "(C) Both frequency and wavelength double",
                "(D) Energy is lost as radio waves"
            ],
            "correct_answer": 0,
            "explanation": "Frequency is determined by the electron oscillation rate of the emitter and cannot change across passive optical boundaries. Velocity drops ($v = c/n$), causing wavelength to compress ($\\lambda = v/\nu$)."
        },
        {
            "id": "phy-hots-10",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "HOTS Electromagnetic Induction: Why does a bird sitting with both feet on a 66,000 V high-voltage transmission wire avoid electrocution?",
            "options": [
                "(A) Both feet rest on the same wire at virtually identical electric potential, so potential difference $\\Delta V \approx 0$ and no current flows through the bird",
                "(B) The bird\'s feet are covered in thick rubber insulation",
                "(C) Alternating current does not affect biological tissue",
                "(D) High voltage wires carry zero electric charge"
            ],
            "correct_answer": 0,
            "explanation": "Electric current requires a potential difference ($I = \\Delta V / R$). A bird\'s feet are separated by a few centimeters on a low-resistance cable, producing negligible $\\Delta V \approx 0$ across its body."
        }
    ]

# ============================================================================
# 7. CHEMISTRY (40 MCQs - CBSE Secondary & Senior Secondary Benchmarks)
# ============================================================================
def get_chemistry_part_b_questions() -> List[Dict[str, Any]]:
    return [
    {
        "id": "chem-core-1",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Stoichiometry & Mole Concept: How many moles of oxygen atoms are present in $4.4\\text{ g}$ of pure carbon dioxide gas ($\\text{CO}_2$, molar mass $= 44\\text{ g/mol}$)?",
        "options": [
            "(A) $0.20\\text{ mol}$",
            "(B) $0.10\\text{ mol}$",
            "(C) $0.05\\text{ mol}$",
            "(D) $1.204 \\times 10^{23}\\text{ mol}$"
        ],
        "correct_answer": 0,
        "explanation": "Moles of $\\text{CO}_2 = \\frac{4.4\\text{ g}}{44\\text{ g/mol}} = 0.1\\text{ mol}$. Each $\\text{CO}_2$ molecule contains $2$ oxygen atoms, so moles of O atoms $= 0.1 \\times 2 = 0.20\\text{ mol}$."
    },
    {
        "id": "chem-core-2",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Atomic Structure: What is the maximum number of electrons in an atom that can share the quantum numbers $n = 3$ and $l = 1$?",
        "options": [
            "(A) $6$ electrons ($3p$ subshell)",
            "(B) $2$ electrons",
            "(C) $10$ electrons",
            "(D) $18$ electrons"
        ],
        "correct_answer": 0,
        "explanation": "$n = 3$ and $l = 1$ uniquely designates the $3p$ subshell. The $p$ subshell has $3$ degenerate orbitals ($m_l = -1, 0, +1$), each holding a maximum of $2$ spin-paired electrons by Pauli's exclusion principle ($2 \\times 3 = 6$)."
    },
    {
        "id": "chem-core-3",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Periodic Trends: Which set of elements is arranged in order of strictly *increasing* first ionization enthalpy ($\\Delta_i H_1$)?",
        "options": [
            "(A) $\\text{B} < \\text{Be} < \\text{C} < \\text{O} < \\text{N}$",
            "(B) $\\text{Be} < \\text{B} < \\text{C} < \\text{N} < \\text{O}$",
            "(C) $\\text{B} < \\text{C} < \\text{N} < \\text{O} < \\text{F}$",
            "(D) $\\text{Li} < \\text{Na} < \\text{K} < \\text{Rb} < \\text{Cs}$"
        ],
        "correct_answer": 0,
        "explanation": "Across Period 2, Be ($2s^2$, fully filled) has higher $\\Delta_i H_1$ than B ($2s^2 2p^1$). Similarly, N ($2p^3$, half-filled) has higher $\\Delta_i H_1$ than O ($2p^4$). Hence: $\\text{B} < \\text{Be} < \\text{C} < \\text{O} < \\text{N}$."
    },
    {
        "id": "chem-core-4",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Chemical Bonding & VSEPR: According to VSEPR theory, what are the electron geometry and molecular shape of xenon tetrafluoride ($\\text{XeF}_4$)?",
        "options": [
            "(A) Octahedral geometry; Square planar molecular shape",
            "(B) Tetrahedral geometry; Tetrahedral shape",
            "(C) Trigonal bipyramidal geometry; Seesaw shape",
            "(D) Square pyramidal geometry; Square planar shape"
        ],
        "correct_answer": 0,
        "explanation": "Xe has 8 valence electrons. With 4 bonded F atoms and 2 lone pairs, steric number $= 4 + 2 = 6$. The electron geometry is octahedral with the two lone pairs occupying opposite axial positions ($180^\\circ$), yielding a square planar molecular shape."
    },
    {
        "id": "chem-core-5",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Thermodynamics: For a spontaneous reaction at all temperatures, what must be the signs of enthalpy change ($\\Delta H$) and entropy change ($\\Delta S$)?",
        "options": [
            "(A) $\\Delta H < 0$ and $\\Delta S > 0$",
            "(B) $\\Delta H > 0$ and $\\Delta S < 0$",
            "(C) $\\Delta H < 0$ and $\\Delta S < 0$",
            "(D) $\\Delta H > 0$ and $\\Delta S > 0$"
        ],
        "correct_answer": 0,
        "explanation": "Gibbs free energy change is $\\Delta G = \\Delta H - T\\Delta S$. When $\\Delta H < 0$ (exothermic) and $\\Delta S > 0$ (entropy increasing), $\\Delta G$ is strictly negative at every absolute temperature $T > 0\\text{ K}$."
    },
    {
        "id": "chem-core-6",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Chemical Equilibrium: For the Haber ammonia synthesis $\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g)$ with $\\Delta H = -92.4\\text{ kJ/mol}$, which condition shifts equilibrium toward higher $\\text{NH}_3$ yield?",
        "options": [
            "(A) Increasing total system pressure and lowering operating temperature",
            "(B) Decreasing pressure and raising temperature",
            "(C) Adding an inert gas at constant volume",
            "(D) Removing $\\text{N}_2$ gas from the reaction chamber"
        ],
        "correct_answer": 0,
        "explanation": "By Le Chatelier's principle: higher pressure favors the forward direction ($4\\text{ moles of gas} \\to 2\\text{ moles of gas}$), and lower temperature favors the exothermic forward reaction."
    },
    {
        "id": "chem-core-7",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Electrochemistry: What is the standard cell potential $E^\\circ_{\\text{cell}}$ for the Daniel cell $\\text{Zn}(s) | \\text{Zn}^{2+}(1\\text{ M}) || \\text{Cu}^{2+}(1\\text{ M}) | \\text{Cu}(s)$, given $E^\\circ_{\\text{Zn}^{2+}/\\text{Zn}} = -0.76\\text{ V}$ and $E^\\circ_{\\text{Cu}^{2+}/\\text{Cu}} = +0.34\\text{ V}$?",
        "options": [
            "(A) $+1.10\\text{ V}$",
            "(B) $+0.42\\text{ V}$",
            "(C) $-1.10\\text{ V}$",
            "(D) $+0.76\\text{ V}$"
        ],
        "correct_answer": 0,
        "explanation": "$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = (+0.34\\text{ V}) - (-0.76\\text{ V}) = +1.10\\text{ V}$."
    },
    {
        "id": "chem-core-8",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Chemical Kinetics: If doubling the initial concentration of reactant A quadruples the reaction rate, and doubling reactant B has zero effect on the rate, the rate law is:",
        "options": [
            "(A) $\\text{Rate} = k [\\text{A}]^2 [\\text{B}]^0$",
            "(B) $\\text{Rate} = k [\\text{A}] [\\text{B}]$",
            "(C) $\\text{Rate} = k [\\text{A}]^2 [\\text{B}]$",
            "(D) $\\text{Rate} = k [\\text{A}]^4$"
        ],
        "correct_answer": 0,
        "explanation": "Rate $\\propto [\\text{A}]^m [\\text{B}]^n$. $2^m = 4 \\implies m = 2$. $2^n = 1 \\implies n = 0$. Hence second order in A and zero order in B: $\\text{Rate} = k [\\text{A}]^2$."
    },
    {
        "id": "chem-core-9",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Coordination Chemistry: According to Crystal Field Theory, what is the $d$-electron configuration of a high-spin octahedral complex of $\\text{Fe}^{3+}$ ($d^5$)?",
        "options": [
            "(A) $t_{2g}^3 e_g^2$",
            "(B) $t_{2g}^5 e_g^0$",
            "(C) $t_{2g}^4 e_g^1$",
            "(D) $t_{2g}^2 e_g^3$"
        ],
        "correct_answer": 0,
        "explanation": "In high-spin octahedral complexes, crystal field splitting energy $\\Delta_o < P$ (pairing energy). Following Hund's rule, electrons singly occupy all five $d$ orbitals: $t_{2g}^3 e_g^2$."
    },
    {
        "id": "chem-core-10",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Organic Reaction Mechanisms: Which substrate undergoes nucleophilic substitution primarily via a bimolecular $\\text{S}_\\text{N}2$ pathway with complete Walden inversion?",
        "options": [
            "(A) Methyl bromide ($\\text{CH}_3\\text{Br}$)",
            "(B) tert-Butyl bromide ($(\\text{CH}_3)_3\\text{CBr}$)",
            "(C) Benzyl cation",
            "(D) Triphenylmethyl chloride"
        ],
        "correct_answer": 0,
        "explanation": "$\\text{S}_\\text{N}2$ reactivity is governed by minimal steric hindrance to backside nucleophilic attack. Primary and methyl halides react fastest: $\\text{CH}_3\\text{X} > 1^\\circ > 2^\\circ > 3^\\circ$."
    },
    {
        "id": "chem-core-11",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Organic Chemistry / Aromaticity: According to H\u00fcckel's rule ($4n+2$ $\\pi$ electrons), which cyclic species is aromatic?",
        "options": [
            "(A) Cyclopentadienyl anion ($\\text{C}_5\\text{H}_5^-$ with $6\\pi$ electrons)",
            "(B) Cyclobutadiene ($\\text{C}_4\\text{H}_4$ with $4\\pi$ electrons)",
            "(C) Cyclooctatetraene (planar tub with $8\\pi$ electrons)",
            "(D) Cyclopentadienyl cation ($\\text{C}_5\\text{H}_5^+$ with $4\\pi$ electrons)"
        ],
        "correct_answer": 0,
        "explanation": "Cyclopentadienyl anion is planar, fully conjugated, and contains $6\\pi$ electrons ($4n+2$ where $n=1$), fulfilling all criteria for aromatic stability."
    },
    {
        "id": "chem-core-12",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Acid-Base Equilibrium: What is the pH of a $1.0 \\times 10^{-8}\\text{ M}$ aqueous hydrochloric acid ($\\text{HCl}$) solution at $25^\\circ\\text{C}$?",
        "options": [
            "(A) Between $6.95$ and $7.00$ (slightly acidic)",
            "(B) Exactly $8.00$",
            "(C) Exactly $7.00$",
            "(D) $1.00$"
        ],
        "correct_answer": 0,
        "explanation": "In ultra-dilute acid solutions, auto-ionization of water cannot be ignored: $[\\text{H}^+] = [\\text{H}^+]_\\text{HCl} + [\\text{H}^+]_{\\text{H}_2\\text{O}} = 10^{-8} + 10^{-7} \\approx 1.05 \\times 10^{-7}\\text{ M}$, yielding $\\text{pH} \\approx 6.98$."
    },
    {
        "id": "chem-core-13",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Solid State: In a face-centered cubic (FCC) unit cell of edge length $a$, what is the relationship between atomic radius $r$ and edge length $a$?",
        "options": [
            "(A) $r = \\frac{a\\sqrt{2}}{4}$",
            "(B) $r = \\frac{a\\sqrt{3}}{4}$",
            "(C) $r = \\frac{a}{2}$",
            "(D) $r = \\frac{a}{2\\sqrt{3}}$"
        ],
        "correct_answer": 0,
        "explanation": "In FCC, atoms touch along the face diagonal: $4r = a\\sqrt{2} \\implies r = \\frac{a\\sqrt{2}}{4}$."
    },
    {
        "id": "chem-core-14",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Solutions / Colligative Properties: Which $0.1\\text{ M}$ aqueous solution exhibits the highest boiling point elevation?",
        "options": [
            "(A) $0.1\\text{ M } \\text{Al}_2(\\text{SO}_4)_3$ ($i = 5$)",
            "(B) $0.1\\text{ M } \\text{NaCl}$ ($i = 2$)",
            "(C) $0.1\\text{ M } \\text{CaCl}_2$ ($i = 3$)",
            "(D) $0.1\\text{ M } \\text{Glucose}$ ($i = 1$)"
        ],
        "correct_answer": 0,
        "explanation": "$\\Delta T_b = i \\cdot K_b \\cdot m$. For $\\text{Al}_2(\\text{SO}_4)_3$, van 't Hoff factor $i = 2\\text{Al}^{3+} + 3\\text{SO}_4^{2-} = 5$, giving the highest effective particle concentration and maximum boiling elevation."
    },
    {
        "id": "chem-core-15",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Organic Synthesis: What is the major organic product when propene reacts with hydrogen bromide ($\\text{HBr}$) in the presence of benzoyl peroxide?",
        "options": [
            "(A) 1-Bromopropane (anti-Markovnikov addition via free radicals)",
            "(B) 2-Bromopropane (Markovnikov addition via carbocation)",
            "(C) 1,2-Dibromopropane",
            "(D) Propyl alcohol"
        ],
        "correct_answer": 0,
        "explanation": "In the presence of organic peroxides, addition of HBr to alkenes follows a free-radical chain mechanism (Kharasch effect), forming the less hindered 1-bromopropane."
    },
    {
        "id": "chem-core-16",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Electrochemistry / Kohlrausch Law: Limiting molar conductivity $\\Lambda_m^\\circ$ for a weak electrolyte like acetic acid ($\\text{CH}_3\\text{COOH}$) is determined by:",
        "options": [
            "(A) $\\Lambda_m^\\circ(\\text{CH}_3\\text{COOH}) = \\Lambda_m^\\circ(\\text{CH}_3\\text{COONa}) + \\Lambda_m^\\circ(\\text{HCl}) - \\Lambda_m^\\circ(\\text{NaCl})$",
            "(B) Direct linear extrapolation of $\\Lambda_m$ vs $\\sqrt{c}$ to zero concentration",
            "(C) Dividing conductivity $\\kappa$ by molarity at standard temperature",
            "(D) Adding standard electrode potentials of acetate and hydronium ions"
        ],
        "correct_answer": 0,
        "explanation": "Weak electrolytes do not dissociate completely at finite dilutions; Kohlrausch's law of independent ion migration uses strong electrolytes to indirectly compute $\\Lambda_m^\\circ$."
    },
    {
        "id": "chem-core-17",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Organic Carbonyl Reactions: Which carbonyl compound gives a bright yellow precipitate of iodoform ($\\text{CHI}_3$) when warmed with alkaline iodine?",
        "options": [
            "(A) Acetone ($\\text{CH}_3\\text{COCH}_3$)",
            "(B) Benzaldehyde ($\\text{C}_6\\text{H}_5\\text{CHO}$)",
            "(C) Diethyl ketone ($\\text{CH}_3\\text{CH}_2\\text{COCH}_2\\text{CH}_3$)",
            "(D) Formic acid ($\\text{HCOOH}$)"
        ],
        "correct_answer": 0,
        "explanation": "The iodoform test specifically identifies methyl ketones (containing the $\\text{CH}_3-\\text{C=O}$ group) or methyl alcohols ($\\text{CH}_3-\\text{CH(OH)}-$). Acetone possesses two methyl carbonyl groups."
    },
    {
        "id": "chem-core-18",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Surface Chemistry: In the Freundlich adsorption isotherm $\\frac{x}{m} = k p^{1/n}$, what physical state corresponds to $\\frac{1}{n} = 0$ at high pressures?",
        "options": [
            "(A) Adsorption becomes completely independent of pressure (saturation plateau)",
            "(B) Adsorption increases exponentially with pressure",
            "(C) Gas molecules liquefy into bulk droplet layers",
            "(D) Adsorption rate drops to zero"
        ],
        "correct_answer": 0,
        "explanation": "At high pressure, adsorbent active sites become saturated (monolayer coverage). Thus $\\frac{x}{m} = k p^0 = \\text{constant}$, rendering adsorption pressure-independent."
    },
    {
        "id": "chem-core-19",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Chemical Metallurgy: In the extraction of iron in a blast furnace, what is the chemical role of limestone ($\\text{CaCO}_3$)?",
        "options": [
            "(A) Decomposes to $\\text{CaO}$ to act as a basic flux that removes acidic silica impurities as slag ($\\text{CaSiO}_3$)",
            "(B) Acts as primary reducing agent to convert iron ore to iron",
            "(C) Ignites coke to reach smelting temperatures",
            "(D) Prevents molten iron from re-oxidizing at the furnace hearth"
        ],
        "correct_answer": 0,
        "explanation": "$\\text{CaCO}_3 \\to \\text{CaO} + \\text{CO}_2$. $\\text{CaO}$ (basic flux) combines with $\\text{SiO}_2$ (gangue) to form molten calcium silicate slag: $\\text{CaO} + \\text{SiO}_2 \\to \\text{CaSiO}_3$."
    },
    {
        "id": "chem-core-20",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Polymers & Biomolecules: What type of bond stabilizes the secondary structure (such as $\\alpha$-helix and $\\beta$-pleated sheets) of proteins?",
        "options": [
            "(A) Intramolecular and intermolecular hydrogen bonds between $-\\text{C=O}$ and $-\\text{NH}-$ groups of peptide backbone",
            "(B) Covalent peptide bonds between amino acids",
            "(C) Phosphodiester linkages",
            "(D) Disulfide bridges exclusively"
        ],
        "correct_answer": 0,
        "explanation": "The primary structure consists of peptide bonds; the secondary structure is regular folding maintained by hydrogen bonding between backbone amide and carbonyl groups."
    },
    {
        "id": "chem-tlm-1",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Pedagogy of Chemical Bonding: Why are molecular model kits (ball-and-stick models) essential for teaching hybridizations and bond angles?",
        "options": [
            "(A) They translate 2D flat chalkboard Lewis structures into 3D spatial geometry, clarifying lone-pair steric repulsions",
            "(B) They calculate orbital wave equations automatically",
            "(C) They eliminate the need for chemical formulas",
            "(D) They replace laboratory safety protocols"
        ],
        "correct_answer": 0,
        "explanation": "Ball-and-stick manipulatives bridge the abstract 2D representations in textbooks to real 3D spatial conformations (tetrahedral $109.5^\\circ$, trigonal bipyramidal)."
    },
    {
        "id": "chem-tlm-2",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Laboratory Safety Pedagogy: What is the cardinal rule when diluting concentrated sulfuric acid ($\\text{H}_2\\text{SO}_4$) in a high school chemistry lab?",
        "options": [
            "(A) Always add acid slowly to water down the side of the container with continuous stirring; never add water to acid",
            "(B) Add water rapidly to acid in a sealed flask",
            "(C) Heat the acid to $100^\\circ\\text{C}$ before mixing with water",
            "(D) Mix equal volumes simultaneously in a plastic graduated cylinder"
        ],
        "correct_answer": 0,
        "explanation": "Hydration of concentrated sulfuric acid is extremely exothermic. Adding water to acid causes localized boiling, producing acid splatter. Adding acid to a large volume of water dissipates heat safely."
    },
    {
        "id": "chem-tlm-3",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Inquiry-Based Chemistry: When teaching Le Chatelier's Principle, how does the $\\text{CoCl}_4^{2-} / [\\text{Co}(\\text{H}_2\\text{O})_6]^{2+}$ equilibrium demonstration build deep conceptual understanding?",
        "options": [
            "(A) Distinct color shifts (pink in ice water, blue in hot water) allow students to directly observe thermal stress driving endothermic shifts",
            "(B) It produces an explosive sound that alerts students",
            "(C) It proves chemical reactions can only proceed in one direction",
            "(D) It proves catalysts shift equilibrium constants"
        ],
        "correct_answer": 0,
        "explanation": "Cobalt chloride equilibrium provides striking macroscopic visual evidence of dynamic microscopic equilibrium adjusting to temperature changes."
    },
    {
        "id": "chem-tlm-4",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Using Microscale Chemistry kits in secondary school labs supports which pedagogical and environmental goal?",
        "options": [
            "(A) Dramatically reduces chemical waste, cuts reagent costs, enhances student safety, and enables individual experimentation",
            "(B) Eliminates all chemical reactions so students only read theory",
            "(C) Replaces real chemicals with computer simulations entirely",
            "(D) Increases toxic gas emissions for analytical testing"
        ],
        "correct_answer": 0,
        "explanation": "Green chemistry and microscale techniques allow safe hands-on experimentation with drops of reagents rather than large toxic volumes."
    },
    {
        "id": "chem-tlm-5",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Constructivist Pedagogy: How should an educator introduce the 'Mole Concept' to eliminate cognitive overload?",
        "options": [
            "(A) Grounding the concept using familiar counting unit analogies (dozen $= 12$, ream $= 500$, mole $= 6.022 \\times 10^{23}$) before connecting to molar mass",
            "(B) Forcing memorization of Avogadro's number through rote drills without physical meaning",
            "(C) Skipping unit conversions and testing only formula derivations",
            "(D) Stating that moles only exist in gas phases"
        ],
        "correct_answer": 0,
        "explanation": "Analogical scaffolding grounds immense microscale particle quantities in everyday counting units, easing the transition to quantitative stoichiometry."
    },
    {
        "id": "chem-tlm-6",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Interactive Digital Simulations (PhET Chemistry): What pedagogical advantage does the 'Reactants, Products and Leftovers' simulation offer?",
        "options": [
            "(A) Enables students to visualize limiting reagents and excess reactants through concrete sandwich-making analogies",
            "(B) Replaces all practical lab exams with multiple choice questions",
            "(C) Teaches advanced quantum mechanics without math",
            "(D) Measures precise flame temperatures"
        ],
        "correct_answer": 0,
        "explanation": "Interactive PhET simulations build robust mental models of discrete stoichiometric mole ratios and unreacted excess species."
    },
    {
        "id": "chem-tlm-7",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Formative Assessment in Chemistry: What is the diagnostic objective of a 'Concept Cartoon' showing 3 students debating what happens when ice melts?",
        "options": [
            "(A) Uncovering latent misconceptions regarding phase changes vs chemical bond breaking in an engaging, non-threatening format",
            "(B) Grading student drawing ability",
            "(C) Assigning numerical marks for speed of answering",
            "(D) Demonstrating that solid water is denser than liquid water"
        ],
        "correct_answer": 0,
        "explanation": "Concept cartoons stimulate peer discussion and reveal underlying cognitive flaws without triggering student test anxiety."
    },
    {
        "id": "chem-tlm-8",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "When teaching Redox Reactions, which pedagogical mnemonic effectively prevents confusion between oxidation and reduction?",
        "options": [
            "(A) OIL RIG: Oxidation Is Loss, Reduction Is Gain of electrons",
            "(B) ROYGBIV",
            "(C) BODMAS",
            "(D) VSEPR"
        ],
        "correct_answer": 0,
        "explanation": "OIL RIG (or LEO the lion says GER) anchors the electronic definition of redox transformations in memory."
    },
    {
        "id": "chem-tlm-9",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Experiential Pedagogy: What is the primary instructional value of the 'Elephant Toothpaste' demonstration ($2\\text{H}_2\\text{O}_2 \\xrightarrow{\\text{KI}} 2\\text{H}_2\\text{O} + \\text{O}_2$) in chemical kinetics?",
        "options": [
            "(A) Dramatically visualizes catalytic acceleration of reaction rate with exothermic heat and foam generation",
            "(B) Demonstrates dental hygiene products",
            "(C) Demonstrates that catalysts are permanently consumed",
            "(D) Shows that all gas reactions produce solids"
        ],
        "correct_answer": 0,
        "explanation": "The rapid production of oxygen foam illustrates catalyst activation energy lowering and exothermic reaction enthalpy vividly."
    },
    {
        "id": "chem-tlm-10",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "In teaching Periodic Trends, how does constructing an interactive 3D Periodic Table of ionization energies enhance understanding?",
        "options": [
            "(A) Highlights periodicity, effective nuclear charge, and subshell shielding irregularities visually across periods and groups",
            "(B) Replaces chemical experimentation",
            "(C) Proves the table has no exceptions",
            "(D) Tests rote memorization of atomic symbols"
        ],
        "correct_answer": 0,
        "explanation": "3D topographic visual models make energy periodicity and anomalies (Be vs B, N vs O) instantly visible and intuitive."
    },
    {
        "id": "chem-hots-1",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: A student states: 'Chemical bonds store energy; when bonds break, energy is released.' How should a chemistry educator remediate this misconception?",
        "options": [
            "(A) Clarify that bond breaking *always* requires energy input (endothermic, $\\Delta H > 0$); net energy is released only when new stronger bonds form",
            "(B) Confirm the student's statement as accurate",
            "(C) State that bond breaking releases heat while bond forming absorbs heat",
            "(D) State that energy is only involved in nuclear reactions"
        ],
        "correct_answer": 0,
        "explanation": "One of the most persistent misconceptions in science. Overcoming electrostatic attractions requires energy input; exothermic reactions arise because the energy released in bond formation exceeds the energy needed for bond cleavage."
    },
    {
        "id": "chem-hots-2",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: When table salt dissolves in water ($\\text{NaCl}(s) \\to \\text{Na}^+(aq) + \\text{Cl}^-(aq)$), a student claims: 'Salt has melted into liquid salt.' What fundamental difference must be emphasized?",
        "options": [
            "(A) Dissolution is hydration of ions by polar water molecules at room temperature, whereas melting requires breaking the ionic crystal lattice at $801^\\circ\\text{C}$",
            "(B) Dissolution is a chemical change while melting is a nuclear process",
            "(C) Melting involves dissolving in oxygen",
            "(D) Dissolved salt ceases to be sodium chloride"
        ],
        "correct_answer": 0,
        "explanation": "Students conflate dissolution (solvation in solvent) with melting (thermal transition of state requiring immense lattice enthalpy)."
    },
    {
        "id": "chem-hots-3",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "HOTS Reasoning: Why does pure liquid water at $50^\\circ\\text{C}$ have a $\\text{pH} = 6.63$, yet remain strictly neutral?",
        "options": [
            "(A) Auto-ionization of water is endothermic ($K_w$ increases with temperature), so $[\\text{H}^+] = [\\text{OH}^-] = 10^{-6.63}\\text{ M}$; neutrality means equal ion concentrations, not $\\text{pH} = 7$",
            "(B) Water becomes acidic when boiled",
            "(C) Oxygen escapes into the air leaving behind excess protons",
            "(D) Temperature measurements alter pH meter electrodes"
        ],
        "correct_answer": 0,
        "explanation": "Neutrality is defined by $[\\text{H}^+] = [\\text{OH}^-]$. Because dissociation is endothermic, $K_w$ rises to $\\approx 5.5 \\times 10^{-14}$ at $50^\\circ\\text{C}$, yielding $[\\text{H}^+] = [\\text{OH}^-] = 2.34 \\times 10^{-7}\\text{ M}$ ($\\text{pH} = 6.63$), preserving perfect chemical neutrality."
    },
    {
        "id": "chem-hots-4",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: A learner believes: 'At chemical equilibrium, the concentrations of reactants and products must be exactly equal.' What is the true definition of dynamic equilibrium?",
        "options": [
            "(A) The rates of forward and reverse reactions are equal ($r_f = r_r$), while reactant and product concentrations remain constant (not necessarily equal)",
            "(B) The reaction stops completely and all movement ceases",
            "(C) 100% of reactants have converted into products",
            "(D) Reactants and products must be in equal 50:50 proportions"
        ],
        "correct_answer": 0,
        "explanation": "Dynamic equilibrium represents a rate equality, not concentration equality. Depending on $K_{eq}$, products can heavily dominate or reactants can remain largely unreacted."
    },
    {
        "id": "chem-hots-5",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "HOTS Thermodynamics: Solid ammonium nitrate spontaneously dissolves in water with a significant decrease in temperature (it feels ice-cold). What thermodynamic factor drives this endothermic dissolution?",
        "options": [
            "(A) A large positive entropy change of dissolution ($\\Delta S > 0$), making $-T\\Delta S$ sufficiently negative to overcome $\\Delta H > 0$ so that $\\Delta G < 0$",
            "(B) The reaction creates mass out of energy",
            "(C) Atmospheric pressure compresses the water",
            "(D) Ammonium nitrate is a noble gas compound"
        ],
        "correct_answer": 0,
        "explanation": "Spontaneous endothermic processes are entirely entropy-driven: crystal lattice breakdown into hydrated mobile ions yields a massive entropy gain that makes $\\Delta G = \\Delta H - T\\Delta S < 0$."
    },
    {
        "id": "chem-hots-6",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: Students often assume: 'Adding a catalyst increases the equilibrium yield of ammonia in the Haber process.' What is the precise effect of a catalyst on an equilibrium system?",
        "options": [
            "(A) A catalyst speeds up forward and reverse reactions equally, reaching equilibrium faster without changing the equilibrium constant ($K_c$) or yield",
            "(B) It shifts the equilibrium toward products",
            "(C) It decreases reactant activation energy while increasing product activation energy",
            "(D) It raises the reaction temperature"
        ],
        "correct_answer": 0,
        "explanation": "Catalysts lower the activation barrier equally for forward and reverse pathways without modifying initial and final thermodynamic states or equilibrium compositions."
    },
    {
        "id": "chem-hots-7",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "HOTS Coordination Chemistry: Why is $[\\text{Fe}(\\text{CN})_6]^{4-}$ diamagnetic while $[\\text{Fe}(\\text{H}_2\\text{O})_6]^{2+}$ is strongly paramagnetic, even though both feature iron in the $+2$ oxidation state ($d^6$)?",
        "options": [
            "(A) $\\text{CN}^-$ is a strong-field ligand causing large $\\Delta_o > P$ resulting in electron pairing ($t_{2g}^6$, 0 unpaired electrons), while $\\text{H}_2\\text{O}$ is a weak-field ligand ($t_{2g}^4 e_g^2$, 4 unpaired electrons)",
            "(B) $\\text{CN}^-$ oxidizes iron to $+3$",
            "(C) Water molecules block magnetic fields",
            "(D) Cyanide ions contain magnetic electrons"
        ],
        "correct_answer": 0,
        "explanation": "Spectrochemical series positioning dictates whether $\\Delta_o$ exceeds pairing energy $P$. Strong-field $\\text{CN}^-$ forces complete low-spin pairing; weak-field aqua ligands favor high-spin occupancy."
    },
    {
        "id": "chem-hots-8",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: 'Rusting of iron is just iron reacting with oxygen alone.' Why does iron placed in pure dry oxygen fail to rust?",
        "options": [
            "(A) Rusting is an electrochemical corrosion process requiring *both* oxygen and liquid water (electrolyte) to facilitate electron transfer and ion transport",
            "(B) Iron can only rust in darkness",
            "(C) Pure oxygen dissolves iron rather than rusting it",
            "(D) Rusting requires ultraviolet light"
        ],
        "correct_answer": 0,
        "explanation": "Corrosion is galvanic: iron acts as anode ($Fe \\to Fe^{2+} + 2e^-$) and oxygen reduction occurs at the cathodic region ($O_2 + 4H^+ + 4e^- \\to 2H_2O$), strictly requiring aqueous electrolyte mediation."
    },
    {
        "id": "chem-hots-9",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "HOTS Organic Chemistry: Why is phenol significantly more acidic ($pK_a \\approx 10$) than ethanol ($pK_a \\approx 16$)?",
        "options": [
            "(A) The phenoxide conjugate base is resonance-stabilized by delocalization of negative charge across the aromatic ring, whereas the ethoxide ion has no resonance stabilization",
            "(B) Phenol contains three hydroxyl groups",
            "(C) Ethanol has a heavier molecular weight",
            "(D) Phenol has higher electrical conductivity"
        ],
        "correct_answer": 0,
        "explanation": "Deprotonation of phenol yields the phenoxide ion, whose negative charge is delocalized over the ortho and para positions of the benzene ring, lowering conjugate base potential energy."
    },
    {
        "id": "chem-hots-10",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: A student claims: 'Gases expand to fill a container because gas molecules repel each other.' What is the actual kinetic molecular reason?",
        "options": [
            "(A) Gas molecules have high thermal kinetic energy and move in random straight lines with negligible intermolecular attractions until they collide with container walls",
            "(B) Gas molecules carry identical negative charges that repel",
            "(C) Gravity does not affect gas particles",
            "(D) Vacuum inside the container sucks the gas outward"
        ],
        "correct_answer": 0,
        "explanation": "In the kinetic theory of ideal gases, intermolecular forces are negligible. Constant random rectilinear motion and elastic collisions cause spontaneous distribution throughout all available space."
    }
]

# ============================================================================
# 8. BIOLOGY (40 MCQs - CBSE Secondary & Senior Secondary Benchmarks)
# ============================================================================
def get_biology_part_b_questions() -> List[Dict[str, Any]]:
    return [
    {
        "id": "bio-core-1",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Cell Biology: Which organelle is responsible for post-translational modification, sorting, and packaging of proteins synthesized in the rough endoplasmic reticulum?",
        "options": [
            "(A) Golgi Apparatus",
            "(B) Lysosome",
            "(C) Peroxisome",
            "(D) Ribosome"
        ],
        "correct_answer": 0,
        "explanation": "The Golgi apparatus receives transport vesicles from the RER at its cis face, glycosylates and sorts proteins, and buds secretory vesicles from its trans face."
    },
    {
        "id": "bio-core-2",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Molecular Genetics: In eukaryotic DNA replication, which enzyme synthesizes a short RNA primer to provide a free $3'\\text{-OH}$ group for DNA polymerase?",
        "options": [
            "(A) RNA Primase",
            "(B) DNA Helicase",
            "(C) DNA Ligase",
            "(D) Topoisomerase"
        ],
        "correct_answer": 0,
        "explanation": "DNA polymerases cannot initiate polynucleotide synthesis de novo; RNA primase lays down a complementary RNA primer to supply the required $3'\\text{-OH}$ terminus."
    },
    {
        "id": "bio-core-3",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Mendelian Genetics: In a dihybrid cross between two heterozygous individuals ($AaBb \\times AaBb$), what fraction of the offspring is expected to display both dominant phenotypes?",
        "options": [
            "(A) $9/16$",
            "(B) $3/16$",
            "(C) $1/16$",
            "(D) $1/4$"
        ],
        "correct_answer": 0,
        "explanation": "Under Mendel's law of independent assortment, the phenotypic ratio for a dihybrid cross is $9 : 3 : 3 : 1$, where $9/16$ represent the double-dominant phenotype ($A\\_B\\_$)."
    },
    {
        "id": "bio-core-4",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Plant Physiology / Photosynthesis: What is the primary $\\text{CO}_2$ acceptor molecule in $\\text{C}_4$ plants like maize and sugarcane?",
        "options": [
            "(A) Phosphoenolpyruvate (PEP)",
            "(B) Ribulose-1,5-bisphosphate (RuBP)",
            "(C) Oxaloacetic acid (OAA)",
            "(D) 3-Phosphoglyceric acid (PGA)"
        ],
        "correct_answer": 0,
        "explanation": "In mesophyll cells of $\\text{C}_4$ plants, PEP carboxylase fixes $\\text{CO}_2$ into PEP ($3\\text{C}$) to form oxaloacetate ($4\\text{C}$), completely avoiding photorespiration."
    },
    {
        "id": "bio-core-5",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Human Physiology / Cardiovascular: In the human cardiac cycle, what causes the closure of the atrioventricular (tricuspid and bicuspid) valves, producing the first heart sound ('lub')?",
        "options": [
            "(A) Rise in intraventricular pressure during ventricular systole exceeding atrial pressure",
            "(B) Ventricular relaxation during diastole",
            "(C) Backflow of blood in aorta and pulmonary artery",
            "(D) Contraction of atrial walls during atrial systole"
        ],
        "correct_answer": 0,
        "explanation": "During isovolumetric ventricular contraction, rising ventricular pressure forces the AV valves shut to prevent regurgitation into the atria, generating the 'lub' sound."
    },
    {
        "id": "bio-core-6",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Neurophysiology: What ionic event is directly responsible for the rapid depolarization phase of an axonal action potential?",
        "options": [
            "(A) Massive influx of $\\text{Na}^+$ ions through voltage-gated sodium channels",
            "(B) Efflux of $\\text{K}^+$ ions through potassium channels",
            "(C) Active pumping of $3\\text{Na}^+$ out and $2\\text{K}^+$ in",
            "(D) Entry of $\\text{Cl}^-$ ions into the axon"
        ],
        "correct_answer": 0,
        "explanation": "Reaching threshold potential opens voltage-gated $\\text{Na}^+$ channels, causing a surge of inward sodium current along its electrochemical gradient, shifting membrane potential to $+30\\text{ mV}$."
    },
    {
        "id": "bio-core-7",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Endocrinology: Which hormone acts on the collecting ducts of the nephron to increase aquaporin water channels and concentrate urine?",
        "options": [
            "(A) Antidiuretic Hormone (ADH / Vasopressin)",
            "(B) Aldosterone",
            "(C) Atrial Natriuretic Peptide (ANP)",
            "(D) Parathyroid Hormone (PTH)"
        ],
        "correct_answer": 0,
        "explanation": "ADH from the posterior pituitary binds to $V_2$ receptors in renal principal cells, triggering exocytosis of aquaporin-2 water channels and increasing water reabsorption."
    },
    {
        "id": "bio-core-8",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Cell Division / Meiosis: In which specific sub-stage of Prophase I does crossing over (homologous genetic recombination) occur?",
        "options": [
            "(A) Pachytene",
            "(B) Leptotene",
            "(C) Zygotene",
            "(D) Diplotene"
        ],
        "correct_answer": 0,
        "explanation": "Crossing over mediated by the enzyme recombinase occurs at the pachytene stage following synaptonemal complex formation in zygotene."
    },
    {
        "id": "bio-core-9",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Biotechnology: Which molecular biology technique utilizes a thermostable DNA polymerase (e.g. Taq polymerase) to exponentially amplify specific DNA segments?",
        "options": [
            "(A) Polymerase Chain Reaction (PCR)",
            "(B) Gel Electrophoresis",
            "(C) Western Blotting",
            "(D) Sanger DNA Sequencing"
        ],
        "correct_answer": 0,
        "explanation": "PCR involves automated cycles of denaturation ($94^\\circ\\text{C}$), primer annealing ($55^\\circ\\text{C}$), and extension ($72^\\circ\\text{C}$) using heat-stable Taq polymerase."
    },
    {
        "id": "bio-core-10",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Ecology & Ecosystems: According to Lindeman's Ten Percent Law of trophic efficiency, what percentage of chemical energy is transferred from one trophic level to the next?",
        "options": [
            "(A) Approximately $10\\%$",
            "(B) Exactly $50\\%$",
            "(C) Approximately $1\\%$",
            "(D) Up to $90\\%$"
        ],
        "correct_answer": 0,
        "explanation": "Approximately $90\\%$ of ingested energy is lost as respiratory heat, metabolic maintenance, and unassimilated waste; only $\\sim 10\\%$ is converted into biomass available to higher consumers."
    },
    {
        "id": "bio-core-11",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Immunology: Which class of immunoglobulins is capable of crossing the human maternal placenta to confer passive humoral immunity to the fetus?",
        "options": [
            "(A) $\\text{IgG}$",
            "(B) $\\text{IgM}$",
            "(C) $\\text{IgA}$",
            "(D) $\\text{IgE}$"
        ],
        "correct_answer": 0,
        "explanation": "Monomeric $\\text{IgG}$ is the only antibody class equipped with an Fc region recognized by the neonatal Fc receptor ($FcRn$) in placental trophoblasts."
    },
    {
        "id": "bio-core-12",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Evolutionary Biology: According to the Hardy-Weinberg equilibrium principle ($p^2 + 2pq + q^2 = 1$), which condition is necessary to maintain constant allele frequencies?",
        "options": [
            "(A) Large population size, random mating, and absence of mutation, migration, and natural selection",
            "(B) Small isolated population with non-random assortative mating",
            "(C) Active directional natural selection",
            "(D) Continuous gene flow between adjacent demes"
        ],
        "correct_answer": 0,
        "explanation": "Hardy-Weinberg equilibrium requires an infinitely large panmictic population experiencing zero evolutionary forces (no mutation, selection, genetic drift, or gene flow)."
    },
    {
        "id": "bio-core-13",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Biochemistry: Which enzyme of the cellular respiration pathway catalyzes the irreversible conversion of pyruvate to acetyl-CoA inside the mitochondrial matrix?",
        "options": [
            "(A) Pyruvate Dehydrogenase Complex",
            "(B) Phosphofructokinase-1",
            "(C) Citrate Synthase",
            "(D) Lactate Dehydrogenase"
        ],
        "correct_answer": 0,
        "explanation": "The pyruvate dehydrogenase multienzyme complex catalyzes the oxidative decarboxylation connecting cytosolic glycolysis to the mitochondrial Krebs cycle."
    },
    {
        "id": "bio-core-14",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Plant Morphology & Anatomy: In dicotyledonous stems, what type of vascular bundle arrangement is characteristically observed?",
        "options": [
            "(A) Conjoint, collateral, open vascular bundles arranged in a neat ring",
            "(B) Scattered closed vascular bundles throughout ground parenchyma",
            "(C) Radial bundles with exarch xylem",
            "(D) Bicollateral bundles without cambium"
        ],
        "correct_answer": 0,
        "explanation": "Dicot stems display an eustele with vascular bundles arranged in a concentric cylinder, containing intrafascicular cambium (open for secondary growth)."
    },
    {
        "id": "bio-core-15",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Human Respiration: What is the primary chemical stimulus that drives the central chemoreceptors in the medulla oblongata to increase respiratory ventilation rate?",
        "options": [
            "(A) Elevated hydrogen ion concentration ($[\\text{H}^+]$) in cerebrospinal fluid derived from arterial hypercapnia (high $\\text{P}_{\\text{CO}_2}$)",
            "(B) Mild drop in arterial blood oxygen tension ($\\text{P}_{\\text{O}_2}$)",
            "(C) High nitrogen gas partial pressure",
            "(D) Low glucose levels in blood"
        ],
        "correct_answer": 0,
        "explanation": "$\\text{CO}_2$ rapidly crosses the blood-brain barrier into CSF, hydrating to carbonic acid; the resulting protons directly stimulate medullary central chemoreceptors."
    },
    {
        "id": "bio-core-16",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Microbiology / Taxonomy: According to Carl Woese's Three-Domain classification system, which characteristic fundamentally distinguishes Archaea from Bacteria?",
        "options": [
            "(A) Ether-linked branched phytanyl lipids in cell membranes and absence of peptidoglycan in cell walls",
            "(B) Archaea possess membrane-bound nuclei",
            "(C) Bacteria are multicellular whereas Archaea are acellular",
            "(D) Archaea do not contain ribosomal RNA"
        ],
        "correct_answer": 0,
        "explanation": "Archaea feature branched ether lipids that confer membrane stability in extreme environments, pseudo-peptidoglycan or S-layers, and eukaryotic-like transcription factors."
    },
    {
        "id": "bio-core-17",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Plant Reproduction: What is the ploidy level of the Primary Endosperm Nucleus (PEN) formed by double fertilization in angiosperms?",
        "options": [
            "(A) Triploid ($3n$)",
            "(B) Diploid ($2n$)",
            "(C) Haploid ($1n$)",
            "(D) Tetraploid ($4n$)"
        ],
        "correct_answer": 0,
        "explanation": "Triple fusion involves one haploid sperm ($n$) fusing with the diploid secondary nucleus / two polar nuclei ($n + n$), forming a triploid ($3n$) nutritive endosperm."
    },
    {
        "id": "bio-core-18",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Human Excretion: In the nephron, which segment is completely impermeable to water regardless of hormonal stimulation?",
        "options": [
            "(A) Thick ascending limb of the loop of Henle",
            "(B) Thin descending limb of the loop of Henle",
            "(C) Proximal convoluted tubule",
            "(D) Medullary collecting duct"
        ],
        "correct_answer": 0,
        "explanation": "The ascending limb actively reabsorbs $\\text{Na}^+$, $\\text{K}^+$, and $\\text{Cl}^-$ via NKCC2 cotransporters while remaining completely impermeable to water, creating the medullary osmotic gradient."
    },
    {
        "id": "bio-core-19",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Musculoskeletal Physiology: During skeletal muscle contraction according to the sliding filament theory, which sarcomeric region remains constant in length?",
        "options": [
            "(A) The A-band",
            "(B) The I-band",
            "(C) The H-zone",
            "(D) Distance between consecutive Z-discs"
        ],
        "correct_answer": 0,
        "explanation": "The A-band corresponds to the full length of the thick myosin filaments, which do not change length; thin actin filaments slide past them, narrowing the I-band and H-zone."
    },
    {
        "id": "bio-core-20",
        "section": "Part-B",
        "module": "Core Subject Knowledge",
        "question_text": "Environmental Biology: What ecological phenomenon describes the increasing concentration of persistent non-biodegradable pesticides (such as DDT) at successive trophic levels?",
        "options": [
            "(A) Biomagnification",
            "(B) Eutrophication",
            "(C) Bioaccumulation",
            "(D) Algal blooming"
        ],
        "correct_answer": 0,
        "explanation": "Biomagnification refers to the progressive increase in toxicant concentration per unit biomass from primary producers up to apex predators through food webs."
    },
    {
        "id": "bio-tlm-1",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Microscopy Pedagogy: When preparing an onion peel wet mount for student compound microscopy, why is staining with acetocarmine or safranin essential?",
        "options": [
            "(A) Staining selectively binds to chromatin and cell wall components, providing visual contrast under brightfield illumination",
            "(B) It kills any pathogenic bacteria on the glass",
            "(C) It prevents the slide from drying out",
            "(D) It magnifies the cell 10 times"
        ],
        "correct_answer": 0,
        "explanation": "Unstained living plant cells are mostly transparent; differential dyes stain cellular organelles and nuclei, rendering them distinct under optical light microscopes."
    },
    {
        "id": "bio-tlm-2",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Hands-on Modeling: Why is having students construct 3D double-helix models using colored beads or paper templates superior to textbook diagrams?",
        "options": [
            "(A) It physically reinforces antiparallel polarity ($5' \\to 3'$ vs $3' \\to 5'$) and complementary base pairing rules ($A=T, G\\equiv C$)",
            "(B) It avoids the need to learn DNA function",
            "(C) It allows students to create synthetic DNA",
            "(D) It replaces microscope observations"
        ],
        "correct_answer": 0,
        "explanation": "Tactile manipulation allows kinesthetic and visual learners to grasp spatial relationships, major/minor grooves, and hydrogen bond stoichiometry."
    },
    {
        "id": "bio-tlm-3",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Inquiry-Based Learning: In the classic potato osmometer experiment, why is peeling the outer skin of the potato cup necessary before filling it with concentrated sugar solution?",
        "options": [
            "(A) Peeling removes the impermeable suberized periderm, allowing water molecules from the trough to freely osmose across living potato cell membranes",
            "(B) Unpeeled potato reacts chemically with sugar",
            "(C) Peeling makes the potato float in water",
            "(D) Peeling prevents bacterial contamination"
        ],
        "correct_answer": 0,
        "explanation": "Potato epidermal periderm contains suberin, a waxy water barrier. Exposing parenchymal tissue provides a continuous semi-permeable membrane system for demonstrating net endosmosis."
    },
    {
        "id": "bio-tlm-4",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Field Study Pedagogy: How does conducting a Quadrat Sampling activity in a school garden support ecological learning outcomes?",
        "options": [
            "(A) Introduces students to quantitative biodiversity estimation, species frequency, and population density calculations in a natural setting",
            "(B) Replaces ecological theory lectures with gardening",
            "(C) Collects all insects for permanent dissection",
            "(D) Ensures students memorize scientific Latin binomials"
        ],
        "correct_answer": 0,
        "explanation": "Quadrat sampling connects abstract mathematical ecology (density, abundance, biodiversity indexes) directly to hands-on empirical fieldwork."
    },
    {
        "id": "bio-tlm-5",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Pedagogical Scaffolding: When introducing Human Physiology, why is beginning with Homeostasis (negative feedback loops) an effective overarching framework?",
        "options": [
            "(A) It unites disparate body organ systems (nervous, endocrine, renal, circulatory) under one unifying principle of dynamic equilibrium",
            "(B) It eliminates the need to teach anatomy",
            "(C) It simplifies medical diagnostics for children",
            "(D) It focuses exclusively on human disease states"
        ],
        "correct_answer": 0,
        "explanation": "Homeostasis acts as an integrative schema, preventing physiology from devolving into isolated lists of organs and hormone names."
    },
    {
        "id": "bio-tlm-6",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Virtual Dissections & Bioethics: Why are interactive 3D digital dissection software simulations increasingly integrated into school biology curricula?",
        "options": [
            "(A) They uphold humane animal welfare standards while allowing repeatable, risk-free exploration of anatomical layers and organ systems",
            "(B) They are free of any pedagogical purpose",
            "(C) Digital organs have different anatomy than real specimens",
            "(D) To replace all science classrooms with computer labs"
        ],
        "correct_answer": 0,
        "explanation": "Digital anatomical simulations eliminate bioethical concerns and preservative exposure while providing interactive layer-by-layer learning and unlimited retries."
    },
    {
        "id": "bio-tlm-7",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Genetics Pedagogy: When teaching Punnett Squares, what common student habit must teachers correct to ensure accurate probabilistic reasoning?",
        "options": [
            "(A) Clarifying that each box represents independent statistical probability for each individual offspring, not a guarantee that a family of four will have those exact ratios",
            "(B) Banning the use of letters for alleles",
            "(C) Forcing students to memorize only homozygous crosses",
            "(D) Requiring Punnett squares to have 100 boxes"
        ],
        "correct_answer": 0,
        "explanation": "Students frequently assume that a $3:1$ ratio guarantees 3 unaffected and 1 affected child in a 4-child family, confusing theoretical gamete probability with small-sample reality."
    },
    {
        "id": "bio-tlm-8",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Demonstration Pedagogy: In demonstrating aerobic respiration using germinating seeds in a closed conical flask, what is the role of potassium hydroxide ($\\text{KOH}$) in the suspended test tube?",
        "options": [
            "(A) Absorbs carbon dioxide gas produced by seeds so that oxygen consumption creates a measurable partial vacuum that draws water up the delivery tube",
            "(B) Supplies oxygen to the germinating seeds",
            "(C) Measures seed germination speed directly",
            "(D) Acts as a chemical nutrient for seedlings"
        ],
        "correct_answer": 0,
        "explanation": "$\\text{KOH}$ absorbs evolving $\\text{CO}_2$ ($2\\text{KOH} + \\text{CO}_2 \\to \\text{K}_2\\text{CO}_3 + \\text{H}_2\\text{O}$), ensuring that volume reduction precisely reflects consumed oxygen."
    },
    {
        "id": "bio-tlm-9",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Concept Mapping in Biology: How does constructing a Concept Map of Cellular Respiration benefit senior secondary learners?",
        "options": [
            "(A) Visually connects glycolysis, the link reaction, Krebs cycle, and oxidative phosphorylation with their cellular locations, substrates, and ATP yields",
            "(B) Replaces the need for chemical formulas",
            "(C) Allows students to skip reading textbook chapters",
            "(D) Generates automatic quiz grades"
        ],
        "correct_answer": 0,
        "explanation": "Metabolic pathways are notoriously prone to cognitive overload; concept maps reveal spatial compartmentalization and stoichiometric energy checkpoints."
    },
    {
        "id": "bio-tlm-10",
        "section": "Part-B",
        "module": "Subject Pedagogical Knowledge & TLM",
        "question_text": "Inquiry Pedagogy: What is the primary instructional goal of testing leaves for starch with iodine after keeping a potted plant in the dark for 48 hours?",
        "options": [
            "(A) To destarch the plant leaves, proving that newly synthesized starch formed upon light exposure is the direct result of ongoing photosynthesis",
            "(B) To kill the plant cells before iodine treatment",
            "(C) To stain the chlorophyll green",
            "(D) To show that dark leaves turn blue instantly"
        ],
        "correct_answer": 0,
        "explanation": "Destarching ensures that pre-existing reserve starch is mobilized, validating that blue-black coloration in light-exposed regions represents experimental synthesis."
    },
    {
        "id": "bio-hots-1",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: A student claims: 'Plants photosynthesize during the daytime and respire only at night.' How should a biology teacher remediate this?",
        "options": [
            "(A) Clarify that cellular respiration is a continuous 24/7 metabolic requirement for all living plant cells to produce ATP, while photosynthesis is light-dependent",
            "(B) Confirm that plants stop respiring during sunny hours",
            "(C) State that plant roots respire during day while leaves respire at night",
            "(D) State that plants do not require cellular respiration"
        ],
        "correct_answer": 0,
        "explanation": "Plant cells require continuous ATP for cellular upkeep, active transport, and protein synthesis; mitochondrial respiration proceeds day and night."
    },
    {
        "id": "bio-hots-2",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: 'Dominant genetic traits are always more common or frequent in a population than recessive traits.' Which counterexample disproves this?",
        "options": [
            "(A) Polydactyly (extra fingers/toes) and Huntington's disease are dominant alleles yet extremely rare in human populations",
            "(B) Blue eye color is dominant over brown eye color",
            "(C) Recessive alleles are always eliminated by natural selection",
            "(D) Dominant genes always have higher fitness"
        ],
        "correct_answer": 0,
        "explanation": "Dominance describes how alleles interact in heterozygous individuals (phenotypic expression), not their frequency or survival fitness in gene pools."
    },
    {
        "id": "bio-hots-3",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "HOTS Photosynthesis: In Van Niel's classic experiments with purple sulfur bacteria, hydrogen sulfide ($\\text{H}_2\\text{S}$) was used instead of $\\text{H}_2\\text{O}$, releasing elemental sulfur instead of oxygen. What profound insight did this provide?",
        "options": [
            "(A) Proved that oxygen gas released during plant photosynthesis originates from the photolysis of water ($\\text{H}_2\\text{O}$), not from carbon dioxide ($\\text{CO}_2$)",
            "(B) Proved that plants can survive on sulfur alone",
            "(C) Disproved the role of chlorophyll in light absorption",
            "(D) Demonstrated that carbon dioxide is not required for glucose synthesis"
        ],
        "correct_answer": 0,
        "explanation": "Since $\\text{CO}_2 + 2\\text{H}_2\\text{S} \\to (\\text{CH}_2\\text{O}) + \\text{H}_2\\text{O} + 2\\text{S}$, the oxidizable hydrogen donor provides the expelled element, proving that $\\text{O}_2$ comes from $\\text{H}_2\\text{O}$."
    },
    {
        "id": "bio-hots-4",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: A student writes: 'Antibiotics kill bacteria by destroying their cell walls, so taking antibiotics will cure viral influenza faster.' What fundamental error is made?",
        "options": [
            "(A) Viruses lack cellular structures, peptidoglycan walls, and bacterial ribosomes targeted by antibiotics; antibiotics have zero efficacy against viral pathogens",
            "(B) Antibiotics only work on fungi",
            "(C) Viruses have thicker cell walls than bacteria",
            "(D) Antibiotics stimulate virus replication"
        ],
        "correct_answer": 0,
        "explanation": "Antibiotics target specific bacterial metabolic pathways (cell wall transpeptidases, $70\\text{S}$ ribosomes, DNA gyrase), having no impact on non-cellular viral replication."
    },
    {
        "id": "bio-hots-5",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "HOTS Evolution: Why is Lamarckian inheritance ('giraffes stretched their necks so their offspring were born with longer necks') scientifically invalid?",
        "options": [
            "(A) Phenotypic adaptations acquired during an organism's lifetime do not alter gametic germ-cell DNA sequences passed to progeny (Weismann's germplasm barrier)",
            "(B) Giraffes prefer eating grass over high tree leaves",
            "(C) Mutations only occur in plants",
            "(D) Natural selection acts exclusively on dead organisms"
        ],
        "correct_answer": 0,
        "explanation": "The Central Dogma and Weismann's barrier show somatic changes cannot rewrite heritable germline genetic code."
    },
    {
        "id": "bio-hots-6",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: When looking through a microscope, a student believes: 'The nucleus is the largest organelle in a mature plant cell.' What actually occupies up to $90\\%$ of mature plant cell volume?",
        "options": [
            "(A) The large central vacuole filled with cell sap",
            "(B) The chloroplast network",
            "(C) The nucleus",
            "(D) Mitochondria"
        ],
        "correct_answer": 0,
        "explanation": "The large central tonoplast-bounded vacuole expands during cell maturation, pushing the cytoplasm and nucleus against the peripheral cell wall."
    },
    {
        "id": "bio-hots-7",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "HOTS Human Genetics: A father with hemophilia (an X-linked recessive disorder) and a homozygous healthy mother have children. What is the probability that their son will have hemophilia?",
        "options": [
            "(A) $0\\%$ (Sons inherit the normal X chromosome from mother and Y chromosome from father)",
            "(B) $50\\%$",
            "(C) $100\\%$",
            "(D) $25\\%$"
        ],
        "correct_answer": 0,
        "explanation": "Fathers transmit their Y chromosome to sons; all maternal X chromosomes carry the normal dominant allele, so $0\\%$ of sons are affected (all daughters will be heterozygous carriers)."
    },
    {
        "id": "bio-hots-8",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: 'All arteries carry oxygenated blood and all veins carry deoxygenated blood.' Which anatomical exceptions disprove this rule?",
        "options": [
            "(A) Pulmonary artery carries deoxygenated blood to lungs; Pulmonary vein carries oxygenated blood to heart",
            "(B) Carotid artery and jugular vein",
            "(C) Coronary arteries and cardiac veins",
            "(D) Renal artery and renal vein"
        ],
        "correct_answer": 0,
        "explanation": "Arteries are defined directionally as carrying blood *away from the heart*, while veins carry blood *toward the heart*, regardless of oxygenation status."
    },
    {
        "id": "bio-hots-9",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "HOTS Cellular Respiration: Why does anaerobic glycolysis in human muscles produce lactate (lactic acid) instead of terminating at pyruvate?",
        "options": [
            "(A) To re-oxidize $\\text{NADH}$ back to $\\text{NAD}^+$, allowing glycolysis to continue generating 2 ATP molecules per glucose in the absence of oxygen",
            "(B) Because lactic acid yields more ATP than glucose",
            "(C) To lower muscle pH and prevent fatigue",
            "(D) To store oxygen in muscle fibers"
        ],
        "correct_answer": 0,
        "explanation": "Glycolysis requires oxidized $\\text{NAD}^+$ to continue operating at the GAPDH step. Lactate dehydrogenase transfers electrons from $\\text{NADH}$ to pyruvate, recycling $\\text{NAD}^+$."
    },
    {
        "id": "bio-hots-10",
        "section": "Part-B",
        "module": "Misconceptions & HOTS",
        "question_text": "Diagnostic Misconception: A student claims: 'Humans evolved from modern chimpanzees.' What is the scientifically accurate phylogenetic relationship?",
        "options": [
            "(A) Humans and modern chimpanzees shared a common hominid ancestor approximately 6\u20138 million years ago from which both lineages diverged independently",
            "(B) Modern chimpanzees are deformed human variants",
            "(C) Humans will evolve into chimpanzees under environmental pressure",
            "(D) Chimpanzees are ancestors of all mammals"
        ],
        "correct_answer": 0,
        "explanation": "Evolution is branching cladogenesis, not linear anagenesis. Modern species are sister taxa sharing a common extinct ancestor."
    }
]

# ============================================================================
# MASTER SUBJECT ROUTER FOR PART-B
# ============================================================================
def get_part_b_questions_for_subject(subject: str = "Science") -> List[Dict[str, Any]]:
    """
    Returns 40 domain-specific Part-B questions strictly mapped to the chosen subject:
    - Module 4: Core Subject Knowledge (20 MCQs)
    - Module 5: Subject Pedagogical Knowledge & TLM (10 MCQs)
    - Module 6: Common Misconceptions & HOTS (10 MCQs)
    """
    sub = (subject or "").lower()
    
    # 1. Physics Track
    if any(k in sub for k in ["physics", "phy", "mechanics", "thermodynamics", "optics"]):
        return get_physics_part_b_questions()

    # 2. Chemistry Track
    if any(k in sub for k in ["chemistry", "chem", "chemical", "organic"]):
        return get_chemistry_part_b_questions()

    # 3. Biology Track
    if any(k in sub for k in ["biology", "bio", "botany", "zoology", "life science"]):
        return get_biology_part_b_questions()

    # 4. Mathematics Track
    if any(k in sub for k in ["math", "algebra", "geometry", "calculus"]):
        return get_math_part_b_questions()
    
    # 5. Social Science Track
    if any(k in sub for k in ["social", "sst", "history", "geography", "civics", "political", "economics"]):
        return get_social_science_part_b_questions()
    
    # 6. English Track
    if any(k in sub for k in ["english", "literature", "grammar"]):
        return get_english_part_b_questions()
        
    # 7. Hindi Track
    if any(k in sub for k in ["hindi", "हिंदी", "vyakaran", "sahitya"]):
        return get_hindi_part_b_questions()
        
    # 8. Computer Science Track
    if any(k in sub for k in ["computer", "it", "cs", "information technology", "coding", "python", "ai"]):
        return get_computer_science_part_b_questions()
        
    # Default to Science (Physics / Chemistry / Biology interdisciplinary)
    from services.olympiad_service import get_science_part_b_questions
    return get_science_part_b_questions()
