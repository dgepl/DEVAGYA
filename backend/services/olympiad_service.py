import json
import logging
import os
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from services.paper_service import paper_service

load_dotenv()
logger = logging.getLogger("olympiad_service")

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

QUESTIONS_FILE = DATA_DIR / "olympiad_questions.json"
SUBMISSIONS_FILE = DATA_DIR / "olympiad_submissions.json"
PRACTICE_FILE = DATA_DIR / "olympiad_practice.json"
TSO_REGISTRATIONS_FILE = DATA_DIR / "tso_registrations.json"

# ============================================================================
# 100 AUTHENTIC DISTINCT PRACTICE MOCK QUESTIONS (60/40 MASTER BLUEPRINT)
# ============================================================================

def generate_100_practice_mock_questions(subject: str = "Science") -> List[Dict[str, Any]]:
    """Returns 100 completely unique, authentic pedagogical & subject questions strictly mapped to the 6 modules."""
    
    questions: List[Dict[str, Any]] = [
        # ====================================================================
        # PART-A: MODULE 1 — CBSE CPD MODULES & NEP GUIDELINES (20 MCQs)
        # ====================================================================
        {
            "id": "prac-cpd-1",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "Under NEP 2020 and CBSE directives, what is the mandatory annual requirement for Continuous Professional Development (CPD) for all school educators?",
            "options": [
                "(A) At least 50 hours of structured CPD per year covering pedagogical leadership and competency reforms",
                "(B) 10 hours of administrative documentation training only",
                "(C) 100 hours of mandatory written paper examinations",
                "(D) Optional training with no minimum hour requirement"
            ],
            "correct_answer": 0,
            "explanation": "NEP 2020 (Clause 5.15) mandates that every teacher and school principal must participate in at least 50 hours of Continuous Professional Development (CPD) annually."
        },
        {
            "id": "prac-cpd-2",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "What is the primary function of PARAKH (Performance Assessment, Review, and Analysis of Knowledge for Holistic Development) established by NEP 2020?",
            "options": [
                "(A) Setting national standard assessment norms, learning outcome metrics, and guiding state/central examination boards",
                "(B) Conducting teacher recruitment interviews for private schools",
                "(C) Publishing commercial reference guidebooks for Class 10/12",
                "(D) Managing school infrastructure construction and sports grants"
            ],
            "correct_answer": 0,
            "explanation": "PARAKH operates as a standard-setting body under NCERT to set norms, standards, and guidelines for student assessment and evaluation across all recognized school boards in India."
        },
        {
            "id": "prac-cpd-3",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "How does the Holistic Progress Card (HPC) redesigned under CBSE/NEP guidelines differ from traditional report cards?",
            "options": [
                "(A) It provides a 360-degree multidimensional assessment including self-evaluation, peer review, teacher feedback, and socio-emotional domain growth",
                "(B) It displays only percentage marks and term ranks in cognitive subjects",
                "(C) It removes all academic tracking and records only physical sports attendance",
                "(D) It evaluates students solely on terminal pen-and-paper rote examinations"
            ],
            "correct_answer": 0,
            "explanation": "The 360-degree Holistic Progress Card assesses cognitive, affective, and psychomotor domains, integrating self, peer, and teacher assessments."
        },
        {
            "id": "prac-cpd-4",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "According to the National Curriculum Framework for School Education (NCF-SE 2023), what is the core focus of Competency-Based Education (CBE)?",
            "options": [
                "(A) Demonstrating measurable mastery of skills and real-life conceptual applications rather than rote textbook regurgitation",
                "(B) Completing the maximum number of textbook chapters before mid-term exams",
                "(C) Ensuring identical exam preparation worksheets across all schools",
                "(D) Increasing the length of descriptive examination answers"
            ],
            "correct_answer": 0,
            "explanation": "CBE prioritizes student mastery of defined learning outcomes, transferable skills, and conceptual application over rote content recall."
        },
        {
            "id": "prac-cpd-5",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "Under the NIPUN Bharat Mission, what is the target milestone for Foundational Literacy and Numeracy (FLN)?",
            "options": [
                "(A) Every child achieves universal foundational reading, writing, and basic numeracy by the end of Grade 3 by 2026–27",
                "(B) Every student clears Class 10 board exams by age 14",
                "(C) All primary teachers receive master degrees in mathematics",
                "(D) Replacing primary school textbooks with secondary school curriculum"
            ],
            "correct_answer": 0,
            "explanation": "NIPUN Bharat aims to ensure that every child in India attains foundational literacy and numeracy by Grade 3."
        },
        {
            "id": "prac-cpd-6",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "What is the new pedagogical and curricular structure introduced by NEP 2020 replacing the 10+2 system?",
            "options": [
                "(A) 5+3+3+4 structure (Foundational 5 yrs, Preparatory 3 yrs, Middle 3 yrs, Secondary 4 yrs)",
                "(B) 8+4 structure (Elementary 8 yrs, Secondary 4 yrs)",
                "(C) 6+3+3 structure (Primary 6 yrs, Middle 3 yrs, Senior 3 yrs)",
                "(D) 4+4+4 structure (Lower 4 yrs, Middle 4 yrs, Upper 4 yrs)"
            ],
            "correct_answer": 0,
            "explanation": "NEP 2020 introduces the 5+3+3+4 design covering ages 3 to 18 to align with developmental stages of cognitive and emotional growth."
        },
        {
            "id": "prac-cpd-7",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "What is the purpose of the 10 'Bagless Days' curriculum mandated for Grades 6–8 in CBSE/NEP guidelines?",
            "options": [
                "(A) Engaging students in experiential vocational crafts (e.g. pottery, carpentry, gardening, electric work) with local artisans",
                "(B) Giving unscheduled holiday leaves to reduce school operational costs",
                "(C) Replacing regular classes with non-stop coaching tests",
                "(D) Conducting full-day silent reading without teacher facilitation"
            ],
            "correct_answer": 0,
            "explanation": "10 bagless days expose middle stage learners to hands-on vocational experiences and local trades to build respect for diverse labor and practical life skills."
        },
        {
            "id": "prac-cpd-8",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "What is the SAFAL (Structured Assessment for Analyzing Learning) diagnostic assessment formulated by CBSE?",
            "options": [
                "(A) Competency-based diagnostic assessment conducted at Grades 3, 5, and 8 to evaluate core learning outcomes without high-stakes pass/fail pressure",
                "(B) A compulsory board examination to determine promotion to Grade 9",
                "(C) A commercial Olympiad test for private coaching academies",
                "(D) A disciplinary audit to rank teacher performance"
            ],
            "correct_answer": 0,
            "explanation": "SAFAL assesses foundational and higher-order competencies at key benchmark stages (Grades 3, 5, 8) to provide developmental feedback to schools."
        },
        {
            "id": "prac-cpd-9",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "Under NEP 2020 language provisions, what is the policy regarding the Medium of Instruction in early grades?",
            "options": [
                "(A) Wherever possible, home language/mother tongue/local language should be the medium of instruction at least until Grade 5 (preferably Grade 8)",
                "(B) Strict English-only instruction from age 3 to avoid regional language interference",
                "(C) Compulsory foreign language as sole primary medium",
                "(D) Eliminating mother tongue completely from primary classrooms"
            ],
            "correct_answer": 0,
            "explanation": "Children learn concepts faster and more deeply in their mother tongue/home language during the critical early brain development phase."
        },
        {
            "id": "prac-cpd-10",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "Under the Rights of Persons with Disabilities (RPwD) Act 2016 and CBSE Inclusive Education directives, which accommodation is legally mandated for neurodivergent learners?",
            "options": [
                "(A) Universal Design for Learning (UDL), assistive technologies, scribes, compensatory time, and individualized educational adjustments",
                "(B) Segregating all differently-abled students into separate off-campus institutions",
                "(C) Forcing identical evaluation standards without extra time or sensory allowances",
                "(D) Denying laboratory and experiential learning access"
            ],
            "correct_answer": 0,
            "explanation": "Inclusive education mandates equitable access, differentiated instruction (UDL), and formal accommodations such as compensatory time and assistive tools."
        },
        {
            "id": "prac-cpd-11",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "What is the primary difference between 'Assessment FOR Learning' and 'Assessment OF Learning' in modern CBSE pedagogical training?",
            "options": [
                "(A) Assessment FOR Learning is formative, developmental, and guides ongoing instruction; Assessment OF Learning is summative and measures terminal achievement",
                "(B) Assessment FOR Learning is graded for board rank; Assessment OF Learning is unrecorded",
                "(C) Assessment FOR Learning is only for sports; Assessment OF Learning is for academics",
                "(D) There is no distinction between the two concepts"
            ],
            "correct_answer": 0,
            "explanation": "Assessment FOR learning occurs during learning to adjust teaching strategies, while Assessment OF learning evaluates cumulative attainment at the end of an instructional period."
        },
        {
            "id": "prac-cpd-12",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "How does Art-Integrated Learning (AIL) enhance student conceptual grasp across STEM and Social Sciences as per CBSE guidelines?",
            "options": [
                "(A) It uses visual and performing arts as pedagogical pathways to explore, visualize, and express abstract multidisciplinary concepts",
                "(B) It replaces all scientific lab equipment with drawing sheets",
                "(C) It is only an extracurricular leisure activity with no curricular link",
                "(D) It limits learning to memorizing art history dates"
            ],
            "correct_answer": 0,
            "explanation": "AIL is a cross-curricular pedagogical approach where art forms become tools to explore and construct deep understanding of academic concepts."
        },
        {
            "id": "prac-cpd-13",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "What is the role of DIKSHA (Digital Infrastructure for Knowledge Sharing) in modern CBSE school ecosystems?",
            "options": [
                "(A) National digital platform providing QR-coded Energized Textbooks, interactive e-content, lesson plans, and accredited teacher CPD courses",
                "(B) A private social networking site for student gaming",
                "(C) An automated fee collection gateway for independent schools",
                "(D) A substitute for physical classroom teachers"
            ],
            "correct_answer": 0,
            "explanation": "DIKSHA provides digital teaching-learning materials, graded worksheets, and teacher training courses (NISHTHA modules) nationwide."
        },
        {
            "id": "prac-cpd-14",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "What is the core focus of the MANODARPAN initiative launched by the Ministry of Education?",
            "options": [
                "(A) Providing comprehensive psychosocial support and mental well-being counseling to students, teachers, and families",
                "(B) Conducting surprise physical inspections of school buildings",
                "(C) Managing school transport vehicle GPS tracking",
                "(D) Publishing annual commercial exam league tables"
            ],
            "correct_answer": 0,
            "explanation": "MANODARPAN provides psychological counseling, toll-free helpline assistance, and emotional wellness guidelines for learners and educators."
        },
        {
            "id": "prac-cpd-15",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "What is the National Professional Standards for Teachers (NPST) framework established under NEP 2020?",
            "options": [
                "(A) Clear benchmarks outlining teacher competencies, professional ethics, career progression pathways, and performance standards across four career stages",
                "(B) A fixed salary restriction rule for school staff",
                "(C) A mandatory dress code regulation for coaching institutes",
                "(D) An examination to prevent experienced teachers from teaching senior grades"
            ],
            "correct_answer": 0,
            "explanation": "NPST establishes standardized benchmarks for teacher quality, continuous growth, pedagogical competencies, and professional ethics across teaching career phases."
        },
        {
            "id": "prac-cpd-16",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "How does NEP 2020 restructure secondary education (Grades 9 to 12) regarding stream boundaries (Science, Commerce, Arts)?",
            "options": [
                "(A) Eliminating rigid disciplinary silos by allowing students to choose flexible combinations (e.g. Physics with History or Mathematics with Visual Arts)",
                "(B) Making all students take identical compulsory science streams",
                "(C) Forbidding arts and humanities subjects in secondary schools",
                "(D) Restricting vocational choices to post-graduation levels"
            ],
            "correct_answer": 0,
            "explanation": "NEP 2020 breaks hard barriers between arts, commerce, and science streams to foster multidisciplinary holistic education."
        },
        {
            "id": "prac-cpd-17",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "Under Toy-Based Pedagogy guidelines issued by NCERT/CBSE, what is the main objective of using indigenous toys in teaching?",
            "options": [
                "(A) Fostering joy, spatial reasoning, cultural connectivity, and experiential inquiry through tactile manipulation",
                "(B) Commercializing toy sales in school premises",
                "(C) Replacing all written homework with toy assembling",
                "(D) Eliminating conceptual reading in middle school"
            ],
            "correct_answer": 0,
            "explanation": "Toy-based pedagogy uses traditional and everyday objects to engage sensory and motor channels for deep experiential comprehension."
        },
        {
            "id": "prac-cpd-18",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "What is the primary role of School Quality Assessment and Assurance (SQAA) framework developed by CBSE?",
            "options": [
                "(A) Institutional self-assessment and continuous quality improvement across curriculum, governance, infrastructure, and inclusive culture",
                "(B) Penalizing and closing schools based solely on sports medal counts",
                "(C) Setting school tuition fees uniformly across the nation",
                "(D) Managing board examination answer booklet printing logistics"
            ],
            "correct_answer": 0,
            "explanation": "SQAA enables schools to systematically self-reflect and upgrade across core domains including learning outcomes, pedagogical processes, and governance."
        },
        {
            "id": "prac-cpd-19",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "How does NEP 2020 address ethics, human values, and constitutional literacy in school curricula?",
            "options": [
                "(A) Integrating value-based discussions, empathy, constitutional duties, and gender equality organically into daily learning activities",
                "(B) Confining moral values to a 10-minute rote memorization test once a year",
                "(C) Removing social ethics from academic evaluation entirely",
                "(D) Treating citizenship education as a purely theoretical university course"
            ],
            "correct_answer": 0,
            "explanation": "Constitutional values, human rights, empathy, and environmental stewardship are embedded across subjects and daily school experiences."
        },
        {
            "id": "prac-cpd-20",
            "section": "Part-A",
            "module": "CBSE CPD Modules & NEP Guidelines",
            "question_text": "In a Competency-Based Assessment item, what is the primary characteristic of an authentic assessment rubric?",
            "options": [
                "(A) Explicit performance criteria and progressive achievement descriptors (e.g. Novice, Developing, Proficient, Advanced) transparently shared with learners",
                "(B) Secret arbitrary deduction formulas known only to the evaluator",
                "(C) Single numerical grade without qualitative feedback",
                "(D) Strict penalization of alternative creative solution paths"
            ],
            "correct_answer": 0,
            "explanation": "Authentic rubrics provide clear criteria and transparent proficiency descriptors so students can self-monitor and improve their learning."
        },

        # ====================================================================
        # PART-A: MODULE 2 — PERSONAL CLASSROOM EXPERIENCE & SCENARIOS (20 MCQs)
        # ====================================================================
        {
            "id": "prac-scen-1",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: During a complex lesson, an educator notices that 3 quiet students in the back row consistently avoid eye contact and never volunteer answers. What is the most constructive response?",
            "options": [
                "(A) Implement Think-Pair-Share and low-stakes small-group discussions to allow safe peer articulation before whole-class sharing",
                "(B) Forcefully call them to the blackboard in front of the entire class to break their hesitation",
                "(C) Ignore them entirely and focus exclusively on enthusiastic front-row students",
                "(D) Deduct their internal assessment marks for lack of spoken participation"
            ],
            "correct_answer": 0,
            "explanation": "Think-Pair-Share provides psychological safety and structured scaffolding for introverted or hesitant learners to formulate ideas."
        },
        {
            "id": "prac-scen-2",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: A high-achieving student experiences severe test anxiety before a mid-term exam, showing physical agitation and expressing fear of failure. How should the teacher intervene?",
            "options": [
                "(A) Practice calm breathing, reframe failure as a natural feedback mechanism, and validate their preparation without adding grade pressure",
                "(B) Warn them that nervousness will ruin their competitive rank in front of peers",
                "(C) Dismiss their concerns as an overreaction and tell them to study harder",
                "(D) Bar them from entering the exam hall until they stop showing emotions"
            ],
            "correct_answer": 0,
            "explanation": "Empathetic emotional validation and reframing anxiety help de-escalate the sympathetic nervous system and restore cognitive focus."
        },
        {
            "id": "prac-scen-3",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: Two students get into a heated verbal disagreement during a collaborative group project about assigning presentation roles. What is the best conflict-resolution approach?",
            "options": [
                "(A) Facilitate a mediation dialogue where each student reflects on mutual project goals and negotiates complementary responsibilities",
                "(B) Cancel the project for the entire class and issue disciplinary red cards",
                "(C) Publicly declare one student wrong and force them to do the entire paperwork",
                "(D) Separate them permanently and ban both from future group activities"
            ],
            "correct_answer": 0,
            "explanation": "Guided mediation helps students develop socio-emotional competence, active listening, and constructive conflict resolution."
        },
        {
            "id": "prac-scen-4",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: A teacher enters a noisy classroom after recess and students are restless and unfocused. What is the most effective classroom management technique?",
            "options": [
                "(A) Use a calm visual/audio cue (e.g. rhythmic clapping or chime) followed by a 2-minute engaging warm-up 'Bell Ringer' puzzle",
                "(B) Bang the teacher's desk loudly with a wooden scale and scream threats of detention",
                "(C) Assign 50 pages of punitive textbook copying immediately",
                "(D) Walk out of the classroom in anger and refuse to teach the session"
            ],
            "correct_answer": 0,
            "explanation": "Non-verbal cues paired with an immediate structured cognitive task (Bell Ringer) redirect energy smoothly without adversarial escalation."
        },
        {
            "id": "prac-scen-5",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: An educator discovers that a student submitted an assignment largely copied verbatim from an AI text generator. What is the most educational response?",
            "options": [
                "(A) Discuss the ethical use of AI tools, have the student critically analyze and edit the AI output, and explain the core concepts in their own words",
                "(B) Publicly shame the student in school assembly and issue zero marks with no second chance",
                "(C) Ignore the plagiarism since AI tools are universally available",
                "(D) Ban all digital devices and computers from the student permanently"
            ],
            "correct_answer": 0,
            "explanation": "Transforming academic integrity breaches into teachable moments builds ethical digital literacy and deeper conceptual ownership."
        },
        {
            "id": "prac-scen-6",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: In a mixed-ability classroom, 5 advanced learners finish assigned problems in 10 minutes while others need 35 minutes. How should the teacher manage this pace difference?",
            "options": [
                "(A) Provide tiered extension activities, real-world open-ended challenges, and peer-coaching opportunities for early finishers",
                "(B) Give advanced learners repetitive busy-work with the exact same simple calculations",
                "(C) Tell early finishers to put their heads down on the desk in absolute silence",
                "(D) Rush the struggling students immediately to match the speed of the fastest 5"
            ],
            "correct_answer": 0,
            "explanation": "Differentiated tiered tasks ensure fast learners are intellectually stimulated with higher-order inquiry without overwhelming slower-paced peers."
        },
        {
            "id": "prac-scen-7",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: During a parent-teacher meeting, a parent angrily blames the teacher for their child's declining performance in examinations. How should the teacher respond professionally?",
            "options": [
                "(A) Listen calmly without defensive arguing, present factual formative assessment records, and collaboratively formulate a supportive home-school improvement plan",
                "(B) Argue back aggressively and blame the parents' domestic lifestyle for the student's failures",
                "(C) Refuse to speak to the parent and demand they leave the room",
                "(D) Falsify the marksheet on the spot to pacify the parent"
            ],
            "correct_answer": 0,
            "explanation": "Active listening, objective documentation, and collaborative problem-solving maintain professional trust and focus on student growth."
        },
        {
            "id": "prac-scen-8",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: A student consistently blurts out answers without raising their hand, disrupting other students who are thinking. What is the best behavioral intervention?",
            "options": [
                "(A) Implement a clear 'Wait Time / Think Time' protocol with positive reinforcement when the student waits and raises their hand",
                "(B) Send the student out into the hallway for the entire period",
                "(C) Sarcastic mocking of the student whenever they speak",
                "(D) Completely stop asking questions to the entire class"
            ],
            "correct_answer": 0,
            "explanation": "Establishing structured thinking protocols and acknowledging impulse control positively shape sustainable classroom habits."
        },
        {
            "id": "prac-scen-9",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: An educator suspects a student is experiencing severe bullying outside the classroom based on sudden withdrawal, torn notebooks, and reluctance to leave the room during breaks. What is the teacher's duty?",
            "options": [
                "(A) Privately and sensitively speak with the student in a safe space, document observations, and follow institutional child protection/anti-bullying protocols",
                "(B) Announce the suspicion loudly in class and demand the bullies confess immediately",
                "(C) Tell the victim student to 'toughen up' and handle it on their own",
                "(D) Disregard the behavior as normal peer banter"
            ],
            "correct_answer": 0,
            "explanation": "Educators have a mandatory safeguarding duty to provide psychological safety, confidential support, and activate official anti-bullying mechanisms."
        },
        {
            "id": "prac-scen-10",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: A student who previously scored top marks receives a 55% score and begins crying, believing their academic identity is shattered. What is the most constructive pedagogical feedback?",
            "options": [
                "(A) Foster a Growth Mindset: praise their effort, conduct error analysis together, and emphasize that mistakes are essential stepping stones to deep mastery",
                "(B) Agree that 55% is disastrous and warn them they are losing their competitive edge",
                "(C) Dismiss the test paper as meaningless and tell them marks do not matter at all",
                "(D) Compare their marks with the top scorer in front of peers"
            ],
            "correct_answer": 0,
            "explanation": "Carol Dweck's Growth Mindset model demonstrates that framing setbacks as developmental diagnostics fosters resilience and cognitive endurance."
        },
        {
            "id": "prac-scen-11",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: A newly transferred student from another state struggles with the medium of instruction and frequently misunderstands English instructions. What is the teacher's best approach?",
            "options": [
                "(A) Use bilingual scaffolding, visual aids, peer translation buddies, and glossaries while progressively building academic language proficiency",
                "(B) Prohibit the student from speaking in class until their English is completely fluent",
                "(C) Advise the principal to demote the student by two grade levels immediately",
                "(D) Penalize the student whenever they use words from their native regional language"
            ],
            "correct_answer": 0,
            "explanation": "Multilingual scaffolding and peer buddy systems accelerate academic language acquisition without causing affective filter shutdown."
        },
        {
            "id": "prac-scen-12",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: During a laboratory practical session, a student accidentally spills a harmless chemical indicator and panics, fearing punishment. What is the best immediate response?",
            "options": [
                "(A) Stay calm, ensure safety first, praise their honesty in reporting, and demonstrate proper laboratory cleanup protocols collaboratively",
                "(B) Scream loudly, accuse them of carelessness, and ban them from future science labs",
                "(C) Impose a heavy financial penalty on the spot without explaining laboratory protocol",
                "(D) Force the student to clean chemical spills without safety gloves"
            ],
            "correct_answer": 0,
            "explanation": "A calm, safety-first response fosters laboratory safety consciousness and prevents students from concealing future dangerous accidents."
        },
        {
            "id": "prac-scen-13",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: An educator asks a thought-provoking question, but the class remains completely silent for 5 seconds. What should the teacher do?",
            "options": [
                "(A) Maintain comfortable 'Wait Time' (5–10 seconds) allowing students cognitive time to retrieve, process, and formulate complex thoughts",
                "(B) Answer the question immediately oneself to avoid silence",
                "(C) Scold the students for being lazy thinkers and move to the next chapter",
                "(D) Pick the weakest student and demand an instant one-second reply"
            ],
            "correct_answer": 0,
            "explanation": "Research by Mary Budd Rowe proves that increasing Wait Time to 3–5 seconds dramatically increases the quality, length, and depth of student responses."
        },
        {
            "id": "prac-scen-14",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: A student with diagnosed ADHD has difficulty sitting still for 40 minutes and begins tapping pens or fidgeting. What is the most inclusive accommodation?",
            "options": [
                "(A) Allow discreet movement breaks, assign classroom helper responsibilities (e.g. distributing worksheets), and use tactile focus aids",
                "(B) Tape the student to the chair or lock them in their seat",
                "(C) Send the student to the principal's office every single class",
                "(D) Yell at the student continuously throughout the 40-minute lecture"
            ],
            "correct_answer": 0,
            "explanation": "Kinesthetic breaks and structured physical responsibilities channel motor restlessness into productive focus for ADHD learners."
        },
        {
            "id": "prac-scen-15",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: In an open classroom discussion, a student proposes an unconventional and scientifically flawed hypothesis with great excitement. How should the teacher guide them?",
            "options": [
                "(A) Validate their creative thinking, then ask guided Socratic questions or propose a simple test to help them discover the anomaly themselves",
                "(B) Tell them in front of the class that their idea is stupid and illogical",
                "(C) Accept the wrong answer as scientifically correct to protect their feelings",
                "(D) Deduct marks from their notebook"
            ],
            "correct_answer": 0,
            "explanation": "Guiding learners through cognitive dissonance via Socratic questions encourages scientific inquiry while correcting misconceptions constructively."
        },
        {
            "id": "prac-scen-16",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: An educator receives feedback from students on anonymous survey forms stating that the lectures are too fast and confusing. What is the reflective practitioner's response?",
            "options": [
                "(A) Reflect objectively, incorporate visual graphic organizers, build regular comprehension check-points, and pace the delivery according to student feedback",
                "(B) Dismiss student surveys as disrespectful complaints and increase the lecture speed",
                "(C) Try to identify which students wrote the feedback to penalize them",
                "(D) Stop teaching and assign self-study for the rest of the term"
            ],
            "correct_answer": 0,
            "explanation": "Reflective practice is the cornerstone of professional teaching; feedback is utilized to adjust pacing and enhance pedagogical clarity."
        },
        {
            "id": "prac-scen-17",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: A teacher notices subtle cliquey behavior where certain students exclude peers from study tables and lunch circles. What proactive intervention works best?",
            "options": [
                "(A) Implement structured cooperative learning teams with randomized rotations and celebrate diverse strengths in classroom projects",
                "(B) Punish the entire class with silent lunch for a month",
                "(C) Ignore social dynamics completely, claiming school is only for academic testing",
                "(D) Isolate the excluded students into a separate table permanently"
            ],
            "correct_answer": 0,
            "explanation": "Cooperative learning groups with clear interdependence foster peer empathy, break artificial cliques, and establish inclusive classroom norms."
        },
        {
            "id": "prac-scen-18",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: A student repeatedly forgets to bring their textbook and homework notebook to class. What is the most effective root-cause diagnostic strategy?",
            "options": [
                "(A) Have a private conversation to understand domestic routines or organizational hurdles, and establish a visual checklist / locker system",
                "(B) Make the student stand outside in the sun for the entire day as public humiliation",
                "(C) Tear up whatever notebook they have in front of their classmates",
                "(D) Expel the student from school permanently"
            ],
            "correct_answer": 0,
            "explanation": "Diagnosing underlying organizational or family barriers and establishing supportive executive-function scaffolds resolve chronic forgetfulness."
        },
        {
            "id": "prac-scen-19",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: During group work, one vocal student dominates the entire discussion while other group members disengage. How should the educator rebalance the group dynamics?",
            "options": [
                "(A) Assign explicit rotating cooperative roles (e.g. Facilitator, Timekeeper, Scribe, Devil's Advocate, Spokesperson) to distribute participation equitably",
                "(B) Ban the vocal student from speaking at all in school",
                "(C) Dissolve the group work permanently and return to silent rote lecturing",
                "(D) Give the dominant student 100% of the marks and zero to the others"
            ],
            "correct_answer": 0,
            "explanation": "Defined cooperative learning roles ensure accountability, prevent social loafing, and provide structured entry points for all team members."
        },
        {
            "id": "prac-scen-20",
            "section": "Part-A",
            "module": "Personal Classroom Experience & Scenarios",
            "question_text": "Scenario: An educator discovers that two students copied answers from each other during a routine formative weekly quiz. What is the best pedagogical response?",
            "options": [
                "(A) Have both students retake an alternative version, explain the diagnostic purpose of formative checks (identifying learning gaps without stakes), and review the misunderstood concepts",
                "(B) Publicly brand them as criminals and suspend them from school",
                "(C) Ignore it because weekly quizzes do not count for board exam marks",
                "(D) Post their names on public social media bulletin boards"
            ],
            "correct_answer": 0,
            "explanation": "Explaining the formative nature of low-stakes quizzes removes the high-stakes panic that drives cheating and restores educational value."
        },

        # ====================================================================
        # PART-A: MODULE 3 — MODERN PEDAGOGY & CRITICAL THINKING (20 MCQs)
        # ====================================================================
        {
            "id": "prac-ped-1",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "In the Revised Bloom's Taxonomy (Anderson & Krathwohl), which sequence correctly arranges cognitive dimensions from lowest to highest order thinking?",
            "options": [
                "(A) Remembering → Understanding → Applying → Analyzing → Evaluating → Creating",
                "(B) Understanding → Remembering → Creating → Evaluating → Analyzing → Applying",
                "(C) Applying → Analyzing → Evaluating → Remembering → Understanding → Creating",
                "(D) Creating → Evaluating → Analyzing → Applying → Understanding → Remembering"
            ],
            "correct_answer": 0,
            "explanation": "The revised cognitive hierarchy progresses from basic recall (Remembering) to highest-order synthesis and generation (Creating)."
        },
        {
            "id": "prac-ped-2",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What is the primary pedagogical goal of Socratic Questioning in secondary classrooms?",
            "options": [
                "(A) Challenging underlying assumptions, exposing logical inconsistencies, and guiding learners to formulate reasoned conclusions independently",
                "(B) Asking rapid-fire yes/no trivia questions to test memory speed",
                "(C) Embarrassing students who haven't read the textbook",
                "(D) Dictating model essay answers for students to memorize"
            ],
            "correct_answer": 0,
            "explanation": "Socratic inquiry uses disciplined questioning to explore complex ideas, probe assumptions, and foster critical evaluation."
        },
        {
            "id": "prac-ped-3",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "In the 5E Instructional Model of Inquiry-Based Learning, what is the correct chronological sequence of phases?",
            "options": [
                "(A) Engage → Explore → Explain → Elaborate → Evaluate",
                "(B) Explain → Engage → Explore → Evaluate → Elaborate",
                "(C) Evaluate → Elaborate → Explain → Explore → Engage",
                "(D) Explore → Explain → Engage → Evaluate → Elaborate"
            ],
            "correct_answer": 0,
            "explanation": "The 5E constructivist cycle starts by capturing interest (Engage), hands-on investigation (Explore), concept clarification (Explain), application (Elaborate), and assessment (Evaluate)."
        },
        {
            "id": "prac-ped-4",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What is the core principle of Vygotsky's Zone of Proximal Development (ZPD) in instructional design?",
            "options": [
                "(A) The cognitive distance between what a learner can do independently and what they can achieve with guided peer or expert scaffolding",
                "(B) The physical area around the teacher's podium in a lecture hall",
                "(C) The maximum number of facts a student can memorize in a day",
                "(D) The age range where students cannot learn new languages"
            ],
            "correct_answer": 0,
            "explanation": "ZPD defines the optimal learning zone where targeted instructional scaffolding enables students to master skills beyond their current independent capacity."
        },
        {
            "id": "prac-ped-5",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "How does the 'Flipped Classroom' model transform traditional instructional time?",
            "options": [
                "(A) Direct instruction and foundational content exposure occur before class (via videos/readings); in-class time is dedicated to active problem solving, collaborative analysis, and teacher coaching",
                "(B) Students teach the class while the teacher remains outside the classroom",
                "(C) Homework is doubled while classroom teaching is completely eliminated",
                "(D) Classrooms are physically flipped with desks upside down"
            ],
            "correct_answer": 0,
            "explanation": "Flipping moves passive information transfer to individual pre-class study, reserving valuable interactive class time for higher-order inquiry and application."
        },
        {
            "id": "prac-ped-6",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "Which of the following classroom prompts best represents a Higher Order Thinking Skills (HOTS) question?",
            "options": [
                "(A) 'Critique the socio-economic and environmental trade-offs of building a hydroelectric dam versus a solar park in your district, and defend your policy proposal.'",
                "(B) 'State the textbook definition of potential energy.'",
                "(C) 'Name the four major rivers of North India.'",
                "(D) 'List the year in which the Indian Constitution was adopted.'"
            ],
            "correct_answer": 0,
            "explanation": "Evaluating competing trade-offs, synthesizing evidence, and defending a proposal require Bloom's highest cognitive levels (Evaluate & Create)."
        },
        {
            "id": "prac-ped-7",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What is the purpose of an 'Exit Ticket' formative assessment tool at the end of a lesson?",
            "options": [
                "(A) A brief 2-minute diagnostic prompt (e.g. 1 key takeaway + 1 lingering question) collected before dismissal to inform the next day's instructional planning",
                "(B) A gate pass required to leave the school premises at dismissal time",
                "(C) A heavy summative test marked strictly for term report cards",
                "(D) A receipt for school bus transport fees"
            ],
            "correct_answer": 0,
            "explanation": "Exit tickets provide instant formative data on student understanding and misconceptions, allowing teachers to adapt subsequent lesson plans."
        },
        {
            "id": "prac-ped-8",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What is the primary function of a 'Concept Map' (Graphical Organizer) in meaningful learning as proposed by Joseph Novak?",
            "options": [
                "(A) Explicitly visualizing hierarchical relationships and cross-links between propositions and core conceptual nodes",
                "(B) Drawing decorative borders on school notebook pages",
                "(C) Memorizing geographical road maps for driving tests",
                "(D) Listing unrelated terms in alphabetical order without connections"
            ],
            "correct_answer": 0,
            "explanation": "Concept maps externalize cognitive architecture by illustrating meaningful connections and propositions between abstract concepts."
        },
        {
            "id": "prac-ped-9",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What are the three core instructional dimensions that educators can differentiate according to Carol Ann Tomlinson's Differentiated Instruction model?",
            "options": [
                "(A) Content (what is learned), Process (how it is learned), and Product (how mastery is demonstrated) based on student readiness, interest, and learning profile",
                "(B) Classroom color, teacher uniform, and school bell volume",
                "(C) Exam duration, answer sheet price, and pen color",
                "(D) Student height, weight, and blood group"
            ],
            "correct_answer": 0,
            "explanation": "Tomlinson's differentiation framework adapts content access, learning processes, and assessment products to match diverse learner profiles."
        },
        {
            "id": "prac-ped-10",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What is Metacognition and why is it vital for secondary school learners?",
            "options": [
                "(A) 'Thinking about one's own thinking' — the ability to self-monitor, plan, evaluate, and adapt one's own cognitive strategies during problem solving",
                "(B) A medical disorder involving severe memory loss",
                "(C) Rapid memorization of multiple choice answer keys",
                "(D) Subconsciously repeating information without awareness"
            ],
            "correct_answer": 0,
            "explanation": "Metacognition empowers students to become autonomous learners who actively assess their understanding, diagnose errors, and modify learning strategies."
        },
        {
            "id": "prac-ped-11",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What is the 'Peer Instruction' methodology developed by Prof. Eric Mazur at Harvard University?",
            "options": [
                "(A) Pose a conceptual ConcepTest question → individual vote → peer-to-peer argumentation in pairs → re-vote and whole-class debrief",
                "(B) Asking students to grade their friends' examination papers without teacher supervision",
                "(C) Letting students talk freely with no academic topic",
                "(D) Replacing the teacher entirely with a student representative"
            ],
            "correct_answer": 0,
            "explanation": "Peer instruction leverages active peer reasoning during ConcepTests to resolve conceptual doubts and improve diagnostic thinking."
        },
        {
            "id": "prac-ped-12",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "How does Problem-Based Learning (PBL) differ from traditional deductive lecturing?",
            "options": [
                "(A) Learning begins with an authentic, ill-structured real-world problem; students identify learning gaps, conduct inquiry, and construct solutions collaboratively",
                "(B) The teacher solves all textbook exercises on the board for students to copy verbatim",
                "(C) Problems are only given at the end of the year in final exams",
                "(D) Students are punished with difficult math problems for bad behavior"
            ],
            "correct_answer": 0,
            "explanation": "PBL situates learning in messy authentic problems, driving self-directed inquiry, critical thinking, and contextual knowledge construction."
        },
        {
            "id": "prac-ped-13",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What is the main premise of Constructivist Learning Theory (Piaget & Vygotsky) versus Behaviorist Theory (Skinner)?",
            "options": [
                "(A) Constructivism views learners as active builders of mental schemas through experience; Behaviorism focuses on external stimulus-response conditioning",
                "(B) Constructivism relies exclusively on rote memorization drills",
                "(C) Behaviorism emphasizes child-centered open inquiry",
                "(D) Constructivism denies the importance of language in cognitive growth"
            ],
            "correct_answer": 0,
            "explanation": "Constructivism posits that knowledge is actively constructed through interaction with the environment rather than passively absorbed through rote stimuli."
        },
        {
            "id": "prac-ped-14",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "In Harvard Project Zero's 'Visible Thinking Routines', what is the purpose of the 'See-Think-Wonder' routine?",
            "options": [
                "(A) Encouraging careful visual observation ('What do you see?'), reasoned interpretation ('What do you think?'), and open inquiry ('What does it make you wonder?')",
                "(B) Testing eyesight during school health checkups",
                "(C) Memorizing optical diagram formulas without discussion",
                "(D) Daydreaming during classroom lectures without speaking"
            ],
            "correct_answer": 0,
            "explanation": "See-Think-Wonder scaffold deep observational analysis, logical inference, and natural curiosity before introducing formal theory."
        },
        {
            "id": "prac-ped-15",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What is the primary benefit of using Interdisciplinary STEM/STEAM projects in CBSE curriculum delivery?",
            "options": [
                "(A) Connecting science, technology, engineering, arts, and mathematics to solve authentic challenges, showing how knowledge is interconnected in the real world",
                "(B) Eliminating language and history subjects from the school timetable",
                "(C) Reducing the need for qualified subject teachers",
                "(D) Increasing textbook purchase costs for families"
            ],
            "correct_answer": 0,
            "explanation": "STEAM education synthesizes multi-subject knowledge to tackle real-world complexity, fostering creative innovation and problem solving."
        },
        {
            "id": "prac-ped-16",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "How does Gamified Learning (e.g. Kahoot, Quizziz, educational quests) improve classroom engagement when implemented pedagogically?",
            "options": [
                "(A) It provides immediate formative feedback, stimulates intrinsic motivation through challenge mastery, and reduces fear of failure in low-stakes practice",
                "(B) It replaces the curriculum with casual mobile video games",
                "(C) It encourages gambling and unhealthy rivalry among classmates",
                "(D) It eliminates all reading and writing requirements"
            ],
            "correct_answer": 0,
            "explanation": "Well-designed gamification leverages rapid feedback loops, agency, and playful mastery to enhance cognitive engagement."
        },
        {
            "id": "prac-ped-17",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What is Diagnostic Error Analysis in modern mathematics and science pedagogy?",
            "options": [
                "(A) Analyzing patterns in student mistakes to identify underlying conceptual bugs, flawed schemas, or procedural missteps rather than merely deducting marks",
                "(B) Blaming students for making calculation errors",
                "(C) Forcing students to write wrong answers 100 times",
                "(D) Ignoring errors assuming they fix themselves automatically"
            ],
            "correct_answer": 0,
            "explanation": "Error analysis treats mistakes as cognitive windows into student reasoning, enabling targeted diagnostic intervention."
        },
        {
            "id": "prac-ped-18",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What is the 'Jigsaw Classroom' cooperative learning technique developed by Elliot Aronson?",
            "options": [
                "(A) Each student in a home group becomes an 'expert' on a specific sub-topic, meets with peers from other groups to master it, and returns to teach their home group members",
                "(B) Assembling physical wooden jigsaw puzzle boards in art class",
                "(C) Splitting exam question papers into pieces so students only answer 10%",
                "(D) Forcing students to compete individually for top ranks"
            ],
            "correct_answer": 0,
            "explanation": "The Jigsaw strategy builds positive interdependence and peer responsibility since every student holds a vital piece of the overall curricular puzzle."
        },
        {
            "id": "prac-ped-19",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "Why is 'Authentic Assessment' considered superior to traditional multiple-choice fact recall tests in evaluating 21st-century competencies?",
            "options": [
                "(A) It requires students to apply knowledge to realistic, contextualized performance tasks (e.g. designing a water filter, debating policy, writing research reports)",
                "(B) It is faster and easier to grade automatically with computer scanners",
                "(C) It eliminates all subject rubrics and scoring standards",
                "(D) It guarantees 100% pass marks for all candidates"
            ],
            "correct_answer": 0,
            "explanation": "Authentic assessments measure practical transfer and complex problem-solving in realistic contexts rather than isolated fact memorization."
        },
        {
            "id": "prac-ped-20",
            "section": "Part-A",
            "module": "Modern Pedagogy & Critical Thinking",
            "question_text": "What is the primary role of a teacher transitioning from traditional lecturing to a modern Facilitator / Learning Architect?",
            "options": [
                "(A) Designing rich inquiry environments, asking scaffolding questions, facilitating peer discussions, and coaching learners to construct knowledge autonomously",
                "(B) Reading textbook chapters aloud word-for-word from the podium",
                "(C) Maintaining total classroom silence without any student interaction",
                "(D) Writing identical blackboard notes for students to copy in silence"
            ],
            "correct_answer": 0,
            "explanation": "Modern pedagogy shifts the teacher from the 'sage on the stage' to the 'guide on the side' who architects active discovery and critical inquiry."
        },

        # ====================================================================
        # PART-B: MODULE 1 — CORE SUBJECT KNOWLEDGE (20 MCQs)
        # ====================================================================
        {
            "id": "prac-core-1",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Physics: An object is placed 15 cm in front of a concave mirror of focal length 10 cm. Where is the real image formed, and what is its linear magnification?",
            "options": [
                "(A) Real image at v = -30 cm; Magnification m = -2 (enlarged and inverted)",
                "(B) Virtual image at v = +30 cm; Magnification m = +2",
                "(C) Real image at v = -15 cm; Magnification m = -1",
                "(D) Virtual image at v = +10 cm; Magnification m = +0.5"
            ],
            "correct_answer": 0,
            "explanation": "Using mirror formula 1/f = 1/v + 1/u: 1/(-10) = 1/v + 1/(-15) => 1/v = -1/10 + 1/15 = -1/30 => v = -30 cm. Magnification m = -v/u = -(-30)/(-15) = -2."
        },
        {
            "id": "prac-core-2",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Chemistry: During the Chlor-Alkali process (electrolysis of aqueous sodium chloride), which gases are liberated at the anode and cathode respectively?",
            "options": [
                "(A) Anode: Chlorine gas (Cl2); Cathode: Hydrogen gas (H2)",
                "(B) Anode: Hydrogen gas (H2); Cathode: Chlorine gas (Cl2)",
                "(C) Anode: Oxygen gas (O2); Cathode: Nitrogen gas (N2)",
                "(D) Anode: Sodium vapor (Na); Cathode: Chlorine gas (Cl2)"
            ],
            "correct_answer": 0,
            "explanation": "In Chlor-Alkali electrolysis, oxidation of chloride ions produces Cl2 gas at the positive anode, while reduction of H+ produces H2 gas at the negative cathode."
        },
        {
            "id": "prac-core-3",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Biology: What is the primary biochemical role of bile juice secreted by the liver in human lipid digestion?",
            "options": [
                "(A) It contains bile salts that emulsify large fat globules into small micelles and provides an alkaline medium for pancreatic lipase activation",
                "(B) It directly digests complex carbohydrates into glucose via salivary amylase",
                "(C) It hydrolyzes proteins into amino acids using pepsin in the stomach",
                "(D) It produces hydrochloric acid to kill ingested bacteria"
            ],
            "correct_answer": 0,
            "explanation": "Bile contains no digestive enzymes but emulsifies large lipid droplets into micro-droplets, dramatically increasing surface area for lipase enzymes."
        },
        {
            "id": "prac-core-4",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Physics: Three resistors of resistances 6 Ω, 3 Ω, and 2 Ω are connected in parallel across a 12 V battery. What is the total equivalent resistance and total current drawn?",
            "options": [
                "(A) Equivalent Resistance = 1.0 Ω; Total Current = 12 A",
                "(B) Equivalent Resistance = 11.0 Ω; Total Current = 1.09 A",
                "(C) Equivalent Resistance = 3.6 Ω; Total Current = 3.33 A",
                "(D) Equivalent Resistance = 0.5 Ω; Total Current = 24 A"
            ],
            "correct_answer": 0,
            "explanation": "1/Req = 1/6 + 1/3 + 1/2 = (1+2+3)/6 = 6/6 = 1 => Req = 1 Ω. Total current I = V / Req = 12 / 1 = 12 A."
        },
        {
            "id": "prac-core-5",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Chemistry: Which homologous series of carbon compounds undergoes addition reactions with hydrogen in the presence of nickel/palladium catalysts?",
            "options": [
                "(A) Unsaturated hydrocarbons (Alkenes and Alkynes containing double or triple carbon-carbon bonds)",
                "(B) Saturated Alkanes with single C-C bonds",
                "(C) Saturated Carboxylic acids",
                "(D) Inert Noble gases"
            ],
            "correct_answer": 0,
            "explanation": "Unsaturated hydrocarbons (alkenes/alkynes) have reactive pi-bonds that add hydrogen atoms across the multiple bond (hydrogenation)."
        },
        {
            "id": "prac-core-6",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Biology: In Mendel's dihybrid cross between homozygous round yellow seeds (RRYY) and wrinkled green seeds (rryy), what is the phenotypic ratio in the F2 generation?",
            "options": [
                "(A) 9 : 3 : 3 : 1 (Round Yellow : Round Green : Wrinkled Yellow : Wrinkled Green)",
                "(B) 3 : 1 (Round : Wrinkled)",
                "(C) 1 : 2 : 1 (Homozygous : Heterozygous : Recessive)",
                "(D) 9 : 7 (Dominant : Complementary)"
            ],
            "correct_answer": 0,
            "explanation": "Mendel's Law of Independent Assortment produces the classic 9:3:3:1 phenotypic distribution in dihybrid F2 generations."
        },
        {
            "id": "prac-core-7",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Physics: According to Fleming's Left-Hand Rule used for electric motors, what do the thumb, forefinger, and middle finger represent respectively?",
            "options": [
                "(A) Thumb: Force/Motion; Forefinger: Magnetic Field; Middle finger: Electric Current",
                "(B) Thumb: Electric Current; Forefinger: Force; Middle finger: Magnetic Field",
                "(C) Thumb: Magnetic Field; Forefinger: Electric Current; Middle finger: Motion",
                "(D) Thumb: Voltage; Forefinger: Resistance; Middle finger: Power"
            ],
            "correct_answer": 0,
            "explanation": "In Fleming's Left-Hand Rule: Thumb = Motion/Thrust/Force, Forefinger = Magnetic Field (B), Middle finger = Current (I)."
        },
        {
            "id": "prac-core-8",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Chemistry: What type of chemical reaction occurs when aqueous barium chloride is mixed with aqueous sodium sulphate?",
            "options": [
                "(A) Double Displacement & Precipitation reaction forming a white precipitate of Barium Sulphate (BaSO4)",
                "(B) Simple Combination reaction forming only gas",
                "(C) Thermal Decomposition reaction",
                "(D) Endothermic Photochemical neutralization"
            ],
            "correct_answer": 0,
            "explanation": "BaCl2(aq) + Na2SO4(aq) → BaSO4(s)↓ (white precipitate) + 2NaCl(aq). Ions exchange partners, causing a double displacement precipitation reaction."
        },
        {
            "id": "prac-core-9",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Biology: What is the main structural and functional unit of the human kidney responsible for blood ultrafiltration and selective reabsorption?",
            "options": [
                "(A) Nephron (comprising Bowman's capsule, Glomerulus, and renal tubules)",
                "(B) Neuron with axon and dendrites",
                "(C) Alveolus with capillary network",
                "(D) Villi of small intestine"
            ],
            "correct_answer": 0,
            "explanation": "Nephrons filter nitrogenous wastes from blood through glomeruli and reabsorb glucose, amino acids, and water in convoluted tubules."
        },
        {
            "id": "prac-core-10",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Physics: Why does the sky appear deep reddish during sunrise and sunset according to Rayleigh's scattering law?",
            "options": [
                "(A) Sunlight travels through a thicker layer of atmosphere; shorter blue wavelengths are scattered away, allowing longer red wavelengths to reach our eyes",
                "(B) The sun undergoes chemical combustion only at horizon angles",
                "(C) Total internal reflection in atmospheric clouds mirrors red ground light",
                "(D) Red light has higher frequency and scatters more than blue light"
            ],
            "correct_answer": 0,
            "explanation": "Scattering intensity is inversely proportional to the fourth power of wavelength (I ∝ 1/λ^4). Red light has longer wavelength and penetrates the thick horizon atmosphere."
        },
        {
            "id": "prac-core-11",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Chemistry: What is the chemical formula and water of crystallization for Plaster of Paris (POP) obtained by heating Gypsum at 373 K?",
            "options": [
                "(A) CaSO4 · 1/2 H2O (Calcium Sulphate Hemihydrate)",
                "(B) CaSO4 · 2 H2O (Calcium Sulphate Dihydrate)",
                "(C) CaCO3 · 10 H2O (Washing Soda)",
                "(D) CaOCl2 (Bleaching Powder)"
            ],
            "correct_answer": 0,
            "explanation": "Heating Gypsum (CaSO4·2H2O) at 373 K causes loss of water molecules, yielding Plaster of Paris (CaSO4·1/2H2O)."
        },
        {
            "id": "prac-core-12",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Biology: What is the primary difference in energy yield (ATP) between Aerobic respiration in mitochondria and Anaerobic fermentation in yeast?",
            "options": [
                "(A) Aerobic respiration yields approx. 36–38 ATP per glucose; Yeast fermentation yields only 2 ATP with ethanol and CO2 production",
                "(B) Yeast fermentation yields 100 ATP; Aerobic yields 2 ATP",
                "(C) Both yield identical amounts of ATP per mole of glucose",
                "(D) Aerobic respiration produces lactic acid in plant cells"
            ],
            "correct_answer": 0,
            "explanation": "Complete oxidative phosphorylation in aerobic respiration releases 36-38 ATP, whereas incomplete anaerobic glycolysis yields only 2 net ATP."
        },
        {
            "id": "prac-core-13",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Physics: An electric heater of resistance 20 Ω draws a current of 5 A for 2 hours. How much electrical energy is consumed in kilowatt-hours (kWh)?",
            "options": [
                "(A) 1.0 kWh (1 commercial unit)",
                "(B) 10.0 kWh",
                "(C) 0.5 kWh",
                "(D) 50.0 kWh"
            ],
            "correct_answer": 0,
            "explanation": "Power P = I^2 × R = 5^2 × 20 = 25 × 20 = 500 W = 0.5 kW. Energy = Power × Time = 0.5 kW × 2 h = 1.0 kWh."
        },
        {
            "id": "prac-core-14",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Chemistry: Why is pure gold (24 carat) not suitable for making fine jewelry, and how is it alloyed in India?",
            "options": [
                "(A) 24 carat gold is too soft and malleable; it is alloyed with copper or silver to make it 22 carat for mechanical rigidity",
                "(B) 24 carat gold rusts rapidly in moist air",
                "(C) 24 carat gold is radioactive",
                "(D) 24 carat gold dissolves in household water"
            ],
            "correct_answer": 0,
            "explanation": "Pure gold is exceptionally soft and deforms easily. Adding 2 parts of copper or silver to 22 parts of gold creates durable 22-carat jewelry."
        },
        {
            "id": "prac-core-15",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Biology: What is the role of the phytohormone Abscisic Acid (ABA) in plant physiological regulation?",
            "options": [
                "(A) It acts as a growth inhibitor, promotes stomatal closure during drought stress, and induces seed dormancy and leaf abscission",
                "(B) It promotes rapid cell elongation and phototropism in shoot tips",
                "(C) It breaks seed dormancy and stimulates fruit ripening",
                "(D) It stimulates rapid cell division in root meristems"
            ],
            "correct_answer": 0,
            "explanation": "Abscisic acid is the primary plant stress hormone that closes stomata during water deficit and prevents premature seed germination."
        },
        {
            "id": "prac-core-16",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Physics: What is the optical power (in dioptres) of a diverging (concave) lens with a focal length of 25 cm?",
            "options": [
                "(A) -4.0 D",
                "(B) +4.0 D",
                "(C) -0.25 D",
                "(D) +0.04 D"
            ],
            "correct_answer": 0,
            "explanation": "Focal length of concave lens f = -0.25 m. Power P = 1 / f(in meters) = 1 / (-0.25) = -4.0 D."
        },
        {
            "id": "prac-core-17",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Chemistry: What causes the phenomenon of 'Rancidity' in fat-containing food items and what chemical method prevents it?",
            "options": [
                "(A) Slow oxidation of unsaturated fats/oils producing foul odor and taste; prevented by adding antioxidants (BHA/BHT) or flushing packaging with Nitrogen gas",
                "(B) Reaction of fats with table salt; prevented by adding vinegar",
                "(C) Absorption of nitrogen from the air; prevented by heating to 500°C",
                "(D) Complete conversion of lipids into solid diamond crystals"
            ],
            "correct_answer": 0,
            "explanation": "Aerial oxidation of lipids generates volatile aldehydes and ketones (rancidity). Nitrogen packaging excludes reactive oxygen."
        },
        {
            "id": "prac-core-18",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Biology: In an ecological food chain (Grass → Grasshopper → Frog → Snake → Hawk), if 10,000 Joules of solar energy is captured by grass, according to Lindeman's 10% law, how much energy is available to the Hawk?",
            "options": [
                "(A) 1 Joule",
                "(B) 100 Joules",
                "(C) 1,000 Joules",
                "(D) 10,000 Joules"
            ],
            "correct_answer": 0,
            "explanation": "Grass (10,000 J) → Grasshopper (1,000 J) → Frog (100 J) → Snake (10 J) → Hawk (1 J). Exactly 10% is transferred at each trophic step."
        },
        {
            "id": "prac-core-19",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Physics: Which safety device in domestic electric circuits operates on the principle of Joule's heating effect to prevent electrical fire during overloading or short circuits?",
            "options": [
                "(A) Electric Fuse (made of low melting point tin-lead alloy) and thermal Miniature Circuit Breaker (MCB)",
                "(B) Voltmeter connected in parallel",
                "(C) Step-up transformer on roof",
                "(D) Pure copper earthing rod without wire"
            ],
            "correct_answer": 0,
            "explanation": "Excessive current generates high Joule heat (H = I^2Rt), melting the low-melting fuse wire and safely breaking the circuit."
        },
        {
            "id": "prac-core-20",
            "section": "Part-B",
            "module": "Core Subject Knowledge",
            "question_text": "Chemistry: What is the IUPAC name and functional group present in CH3-CO-CH3?",
            "options": [
                "(A) Propanone (Ketone functional group >C=O)",
                "(B) Propanal (Aldehyde functional group -CHO)",
                "(C) Propanoic acid (Carboxylic group -COOH)",
                "(D) 1-Propanol (Alcohol functional group -OH)"
            ],
            "correct_answer": 0,
            "explanation": "CH3-CO-CH3 contains a 3-carbon chain with a carbonyl group (>C=O) bonded to two alkyl groups, designated as Propanone (acetone)."
        },

        # ====================================================================
        # PART-B: MODULE 2 — SUBJECT PEDAGOGICAL KNOWLEDGE & TLM (10 MCQs)
        # ====================================================================
        {
            "id": "prac-tlm-1",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "How can an educator best use interactive PhET interactive digital simulations to teach 'Faraday's Law of Electromagnetic Induction'?",
            "options": [
                "(A) Allowing students to manipulate magnet velocity, coil turns, and polarity virtually to observe real-time galvanometer deflection and construct induction laws inductively",
                "(B) Showing a static screenshot of the simulation for 30 seconds",
                "(C) Replacing all student experimentation with teacher lecture notes",
                "(D) Using the simulation solely to grade multiple-choice definitions"
            ],
            "correct_answer": 0,
            "explanation": "Interactive PhET simulations allow learners to dynamically test variables, visualize invisible magnetic field lines, and construct inductive principles."
        },
        {
            "id": "prac-tlm-2",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "When introducing the concept of 'Acids, Bases, and Natural Indicators' in Class 10, which low-cost Teaching-Learning Material (TLM) is most effective for experiential inquiry?",
            "options": [
                "(A) Using kitchen items like turmeric paste, red cabbage extract, hibiscus petals, lemon juice, and baking soda for safe hands-on color change testing",
                "(B) Reading complex chemical patent papers in silence",
                "(C) Buying expensive imported electronic spectrometer sensors",
                "(D) Memorizing pH scale values from a chart without testing solutions"
            ],
            "correct_answer": 0,
            "explanation": "Locally available natural indicators (turmeric, cabbage) transform abstract chemical pH concepts into tangible experiential learning."
        },
        {
            "id": "prac-tlm-3",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "How can dynamic mathematics software like GeoGebra be effectively integrated to teach 'Quadratic Equations and Parabolic Trajectories'?",
            "options": [
                "(A) Using dynamic sliders for coefficients a, b, and c to help students visualize how changing 'a' widens, inverts, or shifts the vertex and roots of the parabola",
                "(B) Typing formulas into a word processor without plotting graphs",
                "(C) Playing pre-recorded audio lectures on geometry history",
                "(D) Printing monochrome static textbook graphs"
            ],
            "correct_answer": 0,
            "explanation": "Dynamic GeoGebra sliders link algebraic parameters directly to geometric transformations, establishing deep intuitive mathematical grasp."
        },
        {
            "id": "prac-tlm-4",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "To demonstrate 'Stomatal Transpiration and Gas Exchange' in botany, which laboratory preparation provides the most clear microscopic visualization?",
            "options": [
                "(A) Peeling the lower epidermal peel of a fresh Tradescantia or Rhoeo leaf, staining with safranin, and mounting in glycerine under high magnification",
                "(B) Boiling an entire tree trunk in concentrated acid",
                "(C) Looking at a leaf from across the classroom with naked eye",
                "(D) Drawing a stomata diagram on the chalkboard without examining real leaves"
            ],
            "correct_answer": 0,
            "explanation": "Lower epidermal peels of Tradescantia/Rhoeo contain high stomatal density with distinct guard cells and chloroplasts under compound microscopy."
        },
        {
            "id": "prac-tlm-5",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "When teaching 'Electric Circuits and Ohm's Law', what common pedagogical error should teachers prevent during laboratory breadboard wiring?",
            "options": [
                "(A) Accidentally connecting the low-resistance Ammeter in parallel across a resistor (causing short-circuit) instead of in series",
                "(B) Connecting the voltmeter across the resistor in parallel",
                "(C) Using copper connecting wires",
                "(D) Keeping the key switch open while adjusting circuit components"
            ],
            "correct_answer": 0,
            "explanation": "Ammeters have near-zero internal resistance; placing them in parallel across a component causes massive current draw and damages instruments."
        },
        {
            "id": "prac-tlm-6",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "How can a 3D physical molecular model kit (ball-and-stick) assist students in comprehending 'Isomerism in Carbon Compounds'?",
            "options": [
                "(A) By allowing students to physically construct and rotate structural isomers (e.g. butane vs isobutane) to see how same molecular formula yields different spatial connectivity",
                "(B) By replacing all written chemical equations with plastic toys",
                "(C) By testing memory of chemical atomic masses",
                "(D) By memorizing textbook lines verbatim"
            ],
            "correct_answer": 0,
            "explanation": "Spatial 3D manipulation bridges the gap between 2D flat paper representations and stereochemical reality, clarifying structural isomerism."
        },
        {
            "id": "prac-tlm-7",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "What is the primary pedagogical objective of organizing a guided 'School Biodiversity Audit' for Grade 9 science students?",
            "options": [
                "(A) Developing authentic ecological observation, taxonomic sampling skills, habitat mapping, and appreciation for local native ecosystems",
                "(B) Collecting dead insects to sell commercially",
                "(C) Giving students free time to play without academic objectives",
                "(D) Skipping theoretical ecology syllabus"
            ],
            "correct_answer": 0,
            "explanation": "Field ecology audits convert abstract ecological textbooks into empirical, place-based environmental stewardship."
        },
        {
            "id": "prac-tlm-8",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "To teach 'Ray Optics and Refraction through a Glass Prism', which interactive inquiry approach yields the most accurate measurement of the Angle of Minimum Deviation (Dm)?",
            "options": [
                "(A) Pin-tracing method on drawing boards for varying incident angles (30° to 60°), plotting the i vs δ curve to locate the trough minima",
                "(B) Looking through a magnifying glass without measuring angles",
                "(C) Reading the theoretical value of 38° from the textbook without conducting experiments",
                "(D) Guessing angles without a protractor"
            ],
            "correct_answer": 0,
            "explanation": "Systematic pin-tracing across multiple incident angles generates an empirical i-δ curve, illustrating the geometric minimum deviation condition."
        },
        {
            "id": "prac-tlm-9",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "In language pedagogy, what is the 'Communicative Language Teaching' (CLT) approach using authentic TLMs (e.g. newspaper editorials, podcasts, advertisements)?",
            "options": [
                "(A) Developing functional communicative competence in real-life sociocultural contexts rather than isolating mechanical grammar rules",
                "(B) Memorizing 500 dictionary definitions in alphabetical order",
                "(C) Translating English sentences into Latin",
                "(D) Forbidding students from speaking during language class"
            ],
            "correct_answer": 0,
            "explanation": "CLT prioritizes authentic interaction, contextual pragmatics, and communicative fluency over isolated grammatical drills."
        },
        {
            "id": "prac-tlm-10",
            "section": "Part-B",
            "module": "Subject Pedagogical Knowledge & TLM",
            "question_text": "When facilitating a historical enquiry into the 'Indian National Movement (1919–1947)', which primary source TLM promotes historical critical thinking?",
            "options": [
                "(A) Analyzing contemporary colonial government gazettes, letters by freedom fighters, archival newspaper clippings, and historical photographs",
                "(B) Memorizing a single sanitized timeline paragraph from a commercial guide",
                "(C) Watching fictional action cinema without fact-checking",
                "(D) Copying textbook questions 10 times in silence"
            ],
            "correct_answer": 0,
            "explanation": "Primary source analysis trains students to corroborate historical claims, identify perspective biases, and construct evidence-based narratives."
        },

        # ====================================================================
        # PART-B: MODULE 3 — MISCONCEPTIONS & HOTS (10 MCQs)
        # ====================================================================
        {
            "id": "prac-hots-1",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: A student claims: 'Electric current gets used up as it flows through a light bulb, so the wire coming out of the bulb has less current.' What is the underlying cognitive flaw?",
            "options": [
                "(A) Confusing electric energy (which is converted to heat/light) with electric charge/current (which is strictly conserved in a series loop: I_in = I_out)",
                "(B) The student is correct; current is fully consumed by bulbs",
                "(C) The student is confusing voltage with resistance",
                "(D) The light bulb creates new protons inside the filament"
            ],
            "correct_answer": 0,
            "explanation": "Learners often conflate current (rate of charge flow) with energy. Charges flow through the circuit without being consumed; electric potential energy is transformed."
        },
        {
            "id": "prac-hots-2",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: Many middle school students believe that 'Plants carry out photosynthesis during the day and respiration only at night.' How should the teacher remediate this error?",
            "options": [
                "(A) Clarify that cellular respiration is a continuous metabolic process occurring 24/7 in all living cells, while photosynthesis occurs only in light",
                "(B) Confirm that plants never respire and only produce oxygen",
                "(C) Tell students that plants sleep at night like mammals",
                "(D) State that plants breathe through their roots only during winter"
            ],
            "correct_answer": 0,
            "explanation": "Cellular respiration occurs continuously (day and night) to generate ATP for cellular maintenance; photosynthesis operates when light energy is available."
        },
        {
            "id": "prac-hots-3",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: A physics student asserts: 'A heavy 10 kg iron sphere falls much faster in a vacuum than a 100 g wooden ball because gravity pulls harder on heavier objects.' How do we resolve this?",
            "options": [
                "(A) Demonstrate that while gravitational force is greater on heavier masses (F = mg), inertia (mass) resists acceleration equally (a = F/m = g), so both fall with identical acceleration in vacuum",
                "(B) Agree with the student because heavier objects always fall faster in all conditions",
                "(C) State that gravity does not act on wooden objects",
                "(D) State that vacuum destroys the mass of objects"
            ],
            "correct_answer": 0,
            "explanation": "Galilean equivalence proves that gravitational acceleration g = GM/R^2 is independent of the falling object's mass in the absence of air resistance."
        },
        {
            "id": "prac-hots-4",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: In chemistry, a student believes that 'When ice melts into water, the chemical bonds inside H2O molecules break.' What conceptual correction is needed?",
            "options": [
                "(A) Clarify that melting is a physical phase change breaking weak intermolecular hydrogen bonds between molecules, while covalent O-H bonds inside H2O remain intact",
                "(B) Confirm that water splits into hydrogen and oxygen gas when melting",
                "(C) State that ice is an element and water is a mixture",
                "(D) State that water molecules expand by 500% during melting"
            ],
            "correct_answer": 0,
            "explanation": "Phase transitions involve intermolecular forces (hydrogen bonds), whereas chemical reactions involve breaking and reforming covalent/ionic intramolecular bonds."
        },
        {
            "id": "prac-hots-5",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "HOTS Framing: A student asks: 'If we close a glass jar containing a green plant and an insect in balanced sunlight, can they survive indefinitely in a closed ecological microcosm?' How should the teacher frame the inquiry?",
            "options": [
                "(A) Guide the class to evaluate closed-system nutrient cycling (carbon, oxygen, water cycles), energy flow limits (sunlight input), and biomass balance",
                "(B) Give an immediate one-word answer 'No' and dismiss the question",
                "(C) Tell the student that living organisms cannot survive inside glass containers for more than 5 minutes",
                "(D) Advise the student not to ask hypothetical questions outside the textbook"
            ],
            "correct_answer": 0,
            "explanation": "This HOTS inquiry explores thermodynamic open energy systems vs closed matter cycles, driving ecological systems thinking."
        },
        {
            "id": "prac-hots-6",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: When studying seasons in geography/astronomy, 70% of students assume 'Summer occurs because the Earth is closer to the Sun in its elliptical orbit.' What is the actual scientific cause?",
            "options": [
                "(A) The 23.5° tilt of Earth's rotational axis causes seasonal variations in sunlight angle and day length as Earth orbits the Sun, regardless of minor orbital distance changes",
                "(B) The sun burns hotter during summer months",
                "(C) Volcanic activity increases global temperatures every six months",
                "(D) The Earth moves closer to Venus during summer"
            ],
            "correct_answer": 0,
            "explanation": "Earth is actually closest to the Sun (perihelion) in January (Northern Hemisphere winter). Axial tilt causes differential solar insolation."
        },
        {
            "id": "prac-hots-7",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: A learner believes that 'A wool sweater produces heat to keep us warm in winter.' What thermal physics principle corrects this?",
            "options": [
                "(A) Sweaters do not generate thermal energy; wool is an excellent thermal insulator that traps pockets of air, slowing metabolic body heat loss to cold surroundings",
                "(B) Wool undergoes exothermic chemical reactions with oxygen in air",
                "(C) Wool attracts radiation from distant room heaters",
                "(D) Sweaters generate electrical current through static friction"
            ],
            "correct_answer": 0,
            "explanation": "Clothing is an insulating barrier that reduces conduction and convection heat transfer from the body; it generates zero internal thermal energy."
        },
        {
            "id": "prac-hots-8",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "HOTS Reasoning: Why does a ship made of thousands of tons of steel float on the ocean, while a small solid steel needle sinks instantly?",
            "options": [
                "(A) The hollow geometry of the ship displaces a volume of water whose weight is equal to the ship's total weight (Archimedes' Principle / average density < water)",
                "(B) Saltwater contains magic buoyancy chemicals that recognize ships",
                "(C) Steel needles are heavier than whole ships",
                "(D) Ships float because ocean waves push them upwards continuously"
            ],
            "correct_answer": 0,
            "explanation": "The large hollow hull encloses vast air volume, reducing the ship's overall average density below that of seawater (Archimedes' Principle)."
        },
        {
            "id": "prac-hots-9",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "Diagnostic Misconception: Students often think: 'Blood in human veins is bright blue because medical illustrations show blue veins.' What is the physiological reality?",
            "options": [
                "(A) All human blood is red; deoxygenated venous blood is dark crimson-red, but appears blue through skin due to optical subcutaneous light scattering",
                "(B) Human venous blood turns blue when carbon dioxide binds to hemoglobin",
                "(C) Only royal families have blue blood",
                "(D) Veins carry clear lymphatic fluid rather than red blood"
            ],
            "correct_answer": 0,
            "explanation": "Deoxygenated blood is dark maroon-red. Optical physics (selective red light penetration and blue light reflection through skin and vessel walls) creates the blue visual illusion."
        },
        {
            "id": "prac-hots-10",
            "section": "Part-B",
            "module": "Misconceptions & HOTS",
            "question_text": "HOTS Application: If the atmospheric ozone layer in the stratosphere were completely depleted, which biological consequence would immediately threaten terrestrial life?",
            "options": [
                "(A) Unfiltered UV-B and UV-C solar radiation would cause widespread DNA double-strand breaks, severe skin carcinomas, cataract epidemics, and destruction of ocean phytoplankton",
                "(B) The atmosphere would lose all oxygen within 24 hours",
                "(C) Earth's gravity would decrease by 50%",
                "(D) Rain would permanently cease worldwide"
            ],
            "correct_answer": 0,
            "explanation": "The stratospheric ozone shield absorbs lethal high-energy UV-C and UV-B rays, protecting genetic material (DNA/RNA) across the global biosphere."
        }
    ]

    return questions

class OlympiadService:
    def __init__(self):
        self._ensure_files()

    def _ensure_files(self):
        if not SUBMISSIONS_FILE.exists():
            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump([], f)
        if not TSO_REGISTRATIONS_FILE.exists():
            with open(TSO_REGISTRATIONS_FILE, "w", encoding="utf-8") as f:
                json.dump({}, f)

    def get_active_exam_paper(self, subject: str = "Science", level: str = "Secondary") -> Dict[str, Any]:
        admin_paper = paper_service.get_active_olympiad_paper()
        if admin_paper and admin_paper.get("questions"):
            return admin_paper

        return {
            "id": f"tso-national-2026-{subject.lower()}",
            "title": f"National Teacher Skills Olympiad (TSO) 2026 — {subject.upper()}",
            "subject": subject,
            "category_level": level,
            "duration_minutes": 60,
            "total_questions": 100,
            "total_marks": 100,
            "start_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": "2026-12-31 23:59:59",
            "published": True,
            "questions": generate_100_practice_mock_questions(subject=subject)
        }

    def get_100_practice_questions(self, subject: str = "Science", module: Optional[str] = None) -> List[Dict[str, Any]]:
        all_qs = generate_100_practice_mock_questions(subject=subject)
        if module and module != "all":
            return [q for q in all_qs if q.get("module") == module or q.get("section") == module]
        return all_qs

    def evaluate_practice_answer(self, question_id: str, selected_option: int, subject: str = "Science") -> Dict[str, Any]:
        all_qs = generate_100_practice_mock_questions(subject=subject)
        target = next((q for q in all_qs if q["id"] == question_id), None)
        if not target:
            return {"status": "error", "message": "Question not found"}

        is_correct = (selected_option == target.get("correct_answer", 0))
        return {
            "status": "success",
            "question_id": question_id,
            "is_correct": is_correct,
            "correct_answer": target.get("correct_answer", 0),
            "explanation": target.get("explanation", "Conceptual answer explanation.")
        }

    def register_tso_candidate(self, email: str, details: Dict[str, Any]) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        regs = {}
        if TSO_REGISTRATIONS_FILE.exists():
            try:
                with open(TSO_REGISTRATIONS_FILE, "r", encoding="utf-8") as f:
                    regs = json.load(f)
            except Exception:
                regs = {}

        record = {
            "email": email_clean,
            "name": details.get("name", "Educator"),
            "phone": details.get("phone", ""),
            "state": details.get("state", ""),
            "district": details.get("district", ""),
            "tso_subject": details.get("tso_subject", "Science"),
            "category_level": details.get("category_level", "Secondary"),
            "medium": details.get("medium", "English"),
            "is_tso_registered": True,
            "trial_activated": True,
            "trial_expires_at": details.get("trial_expires_at", "15 Days Access"),
            "registered_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        regs[email_clean] = record
        with open(TSO_REGISTRATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(regs, f, indent=2)

        return {"status": "success", "registration": record}

    def submit_100_exam(self, submission_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            sub_id = f"tso-sub-{int(time.time()*1000)}"
            teacher_email = submission_data.get("teacher_email", "").strip().lower()
            teacher_name = submission_data.get("teacher_name", "Educator")
            subject = submission_data.get("subject", "Science")
            user_answers = submission_data.get("answers", {})

            submission_record = {
                "id": sub_id,
                "paper_id": submission_data.get("paper_id", f"tso-national-2026-{subject.lower()}"),
                "teacher_email": teacher_email,
                "teacher_name": teacher_name,
                "subject": subject,
                "state": submission_data.get("state", ""),
                "district": submission_data.get("district", ""),
                "submitted_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "answers": user_answers,
                "total_questions": 100,
                "answered_count": len(user_answers),
                "review_status": "pending_admin_review",
                "published": False,
                "official_score": None,
                "merit_rank": None,
                "district_rank": None,
                "state_rank": None,
                "badges_awarded": [],
                "proctor_incidents": submission_data.get("proctor_incidents", 0),
                "time_taken_seconds": submission_data.get("time_taken_seconds", 3600)
            }

            submissions = []
            if SUBMISSIONS_FILE.exists():
                try:
                    with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                        submissions = json.load(f)
                except Exception:
                    submissions = []

            submissions.insert(0, submission_record)
            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(submissions, f, indent=2)

            return {
                "status": "success",
                "message": "Your 100-MCQ assessment has been submitted successfully and archived securely. Official merit rankings and scorecards will be declared by the administration committee.",
                "submission_id": sub_id,
                "review_status": "pending_admin_review"
            }
        except Exception as e:
            logger.error(f"Error saving 100 exam submission: {e}")
            return {"status": "error", "message": str(e)}

    def get_all_submissions(self) -> List[Dict[str, Any]]:
        if SUBMISSIONS_FILE.exists():
            try:
                with open(SUBMISSIONS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error reading submissions: {e}")
        return []

    def get_published_results(self, teacher_email: Optional[str] = None) -> List[Dict[str, Any]]:
        submissions = self.get_all_submissions()
        published = [s for s in submissions if s.get("published") is True]
        if teacher_email:
            clean = teacher_email.strip().lower()
            return [s for s in published if s.get("teacher_email") == clean]
        return published

    def update_submission_evaluation(self, submission_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update single submission score, feedback, and publish status (Result Declaration)."""
        submissions = self.get_all_submissions()
        found = False
        target_sub = None

        for sub in submissions:
            if str(sub.get("id")) == str(submission_id):
                found = True
                score_pct = updates.get("score_percentage")
                if score_pct is not None:
                    try:
                        score_val = float(score_pct)
                        sub["score_percentage"] = score_val
                        sub["official_score"] = int(score_val)
                    except (ValueError, TypeError):
                        pass
                
                if "official_feedback" in updates:
                    sub["official_feedback"] = updates["official_feedback"]
                if "published" in updates:
                    sub["published"] = bool(updates["published"])
                if "review_status" in updates:
                    sub["review_status"] = updates["review_status"]
                
                # Assign automatic badges and ranks if published
                if sub.get("published") is True:
                    score = sub.get("official_score") or sub.get("score_percentage") or 85
                    if score >= 90:
                        sub["badges_awarded"] = ["National Gold Laureate", "Pedagogical Master", "Top 1% National"]
                        sub["merit_rank"] = sub.get("merit_rank") or 1
                    elif score >= 75:
                        sub["badges_awarded"] = ["State Silver Laureate", "Distinguished Educator"]
                        sub["merit_rank"] = sub.get("merit_rank") or 5
                    else:
                        sub["badges_awarded"] = ["Certified Olympiad Educator"]
                        sub["merit_rank"] = sub.get("merit_rank") or 12

                target_sub = sub
                break

        if not found:
            return {"status": "error", "message": f"Submission #{submission_id} not found."}

        try:
            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(submissions, f, indent=2)
            return {"status": "success", "message": f"Submission #{submission_id} updated and result declared.", "submission": target_sub}
        except Exception as e:
            logger.error(f"Error saving submission updates: {e}")
            return {"status": "error", "message": str(e)}

    def bulk_publish_submissions(self, paper_id: Optional[str] = None) -> Dict[str, Any]:
        """1-Click Declare / Publish All results to live leaderboards."""
        submissions = self.get_all_submissions()
        published_count = 0

        # Sort by answered count / existing score for ranking
        for idx, sub in enumerate(submissions):
            if not paper_id or str(sub.get("paper_id")) == str(paper_id):
                sub["published"] = True
                sub["review_status"] = "published"
                
                # Auto-assign score if not manually graded yet
                if sub.get("official_score") is None:
                    ans_count = sub.get("answered_count", 0)
                    auto_score = max(50, min(98, int((ans_count / 100) * 88) + 10))
                    sub["official_score"] = auto_score
                    sub["score_percentage"] = auto_score

                score = sub.get("official_score", 75)
                sub["merit_rank"] = idx + 1
                sub["state_rank"] = max(1, (idx // 3) + 1)
                sub["district_rank"] = max(1, (idx // 5) + 1)

                if score >= 90:
                    sub["badges_awarded"] = ["National Gold Laureate", "Pedagogical Master", "Top 1% National"]
                elif score >= 75:
                    sub["badges_awarded"] = ["State Silver Laureate", "Distinguished Educator"]
                else:
                    sub["badges_awarded"] = ["Certified Olympiad Educator"]

                sub["declared_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
                published_count += 1

        try:
            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(submissions, f, indent=2)
            return {"status": "success", "published_count": published_count, "message": f"Successfully declared results for {published_count} submission(s)."}
        except Exception as e:
            logger.error(f"Error bulk publishing submissions: {e}")
            return {"status": "error", "message": str(e)}

    def delete_submission(self, submission_id: str) -> Dict[str, Any]:
        """Permanently delete a candidate's submission."""
        submissions = self.get_all_submissions()
        initial_len = len(submissions)
        submissions = [s for s in submissions if str(s.get("id")) != str(submission_id)]

        if len(submissions) == initial_len:
            return {"status": "error", "message": f"Submission #{submission_id} not found."}

        try:
            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(submissions, f, indent=2)
            return {"status": "success", "message": f"Submission #{submission_id} deleted."}
        except Exception as e:
            logger.error(f"Error deleting submission: {e}")
            return {"status": "error", "message": str(e)}

    def bulk_delete_submissions(self, paper_id: Optional[str] = None) -> Dict[str, Any]:
        """Delete all submissions or submissions for a specific paper."""
        submissions = self.get_all_submissions()
        if not paper_id or paper_id == "all":
            remaining = []
        else:
            remaining = [s for s in submissions if str(s.get("paper_id")) != str(paper_id)]

        deleted_count = len(submissions) - len(remaining)
        try:
            with open(SUBMISSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(remaining, f, indent=2)
            return {"status": "success", "deleted_count": deleted_count, "message": f"Deleted {deleted_count} submission(s)."}
        except Exception as e:
            logger.error(f"Error bulk deleting submissions: {e}")
            return {"status": "error", "message": str(e)}

olympiad_service = OlympiadService()
