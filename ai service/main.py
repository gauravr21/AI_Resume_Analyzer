from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
from spacy.matcher import PhraseMatcher
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nlp = spacy.load("en_core_web_sm")

# Expanded skill list for better coverage
SKILLS_LIST = [
    # Technical / Development
    "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "Angular", "Vue.js",
    "HTML", "CSS", "Sass", "Tailwind CSS", "Bootstrap", "Redux", "GraphQL", "Next.js",
    "Express", "FastAPI", "Django", "Flask", "Spring Boot", "C++", "C#", "Go", "Rust", "PHP",
    # Databases & Cloud
    "MongoDB", "SQL", "PostgreSQL", "MySQL", "Redis", "Oracle", "Firebase", "DynamoDB",
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Jenkins", "CI/CD",
    # Data & AI
    "Machine Learning", "Data Analysis", "Data Science", "Artificial Intelligence", "NLP",
    "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch", "Tableau", "Power BI",
    # Tools & Methodologies
    "Git", "GitHub", "Bitbucket", "Jira", "Confluence", "Agile", "Scrum", "Kanban",
    "Project Management", "Product Management", "SDLC", "TDD", "Unit Testing",
    # Soft Skills & Business
    "Leadership", "Communication", "Problem Solving", "Critical Thinking", "Teamwork",
    "Time Management", "Customer Service", "Sales", "Marketing", "SEO", "Public Speaking"
]

# Initialize PhraseMatcher
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
patterns = [nlp.make_doc(text) for text in SKILLS_LIST]
matcher.add("SKILL", patterns)

class ResumeData(BaseModel):
    text: str

class MatchData(BaseModel):
    resume_text: str
    job_text: str

class AnalysisData(BaseModel):
    text: str

@app.post("/detailed_analysis")
def detailed_analysis(data: AnalysisData):
    try:
        text = data.text
        doc = nlp(text)
        
        # 1. Section Detection
        sections = {
            "Contact Info": ["email", "phone", "address", "linkedin", "github"],
            "Experience": ["experience", "employment", "work history", "professional background"],
            "Education": ["education", "academic", "university", "college", "degree", "certification"],
            "Skills": ["skills", "technologies", "expertise", "technical proficiency"],
            "Projects": ["projects", "personal work", "portfolio"]
        }
        
        found_sections = []
        text_lower = text.lower()
        for section, keywords in sections.items():
            if any(kw in text_lower for kw in keywords):
                found_sections.append(section)
        
        # 2. Impact & Metrics (Detecting numbers, percentages, currency)
        # Looking for things like "10%", "$50k", "5 years", etc.
        metrics_count = 0
        for token in doc:
            if token.like_num or token.pos_ == "NUM":
                metrics_count += 1
        
        impact_score = min((metrics_count / 20) * 100, 100) # Now requires 20 metrics for 100%
        
        # 3. Readability / Complexity
        avg_sentence_length = len(list(doc.sents))
        word_count = len([token for token in doc if not token.is_punct])
        
        # 4. Verb Power (Action verbs)
        action_verbs = [token.text for token in doc if token.pos_ == "VERB" and token.is_alpha]
        verb_score = min((len(action_verbs) / 30) * 100, 100) # Now requires 30 verbs for 100%

        # 5. Completeness Score
        completeness_score = (len(found_sections) / 5) * 100

        # 6. Generate Structured Analysis
        strengths = []
        weaknesses = []
        improvements = []

        # Strengths
        if impact_score > 70:
            strengths.append("Good use of numbers and data to show your results.")
        elif impact_score > 40:
            strengths.append("You have included some metrics to support your work.")
        
        if verb_score > 60:
            strengths.append("The tone is active and professional.")
        
        if len(found_sections) >= 4:
            strengths.append("The resume is well-organized with all main sections.")

        # Weaknesses
        if impact_score < 40:
            weaknesses.append("Not enough numbers or percentages to show your impact.")
        
        if verb_score < 50:
            weaknesses.append("Some parts use passive language instead of direct action.")
            
        if len(found_sections) < 4:
            weaknesses.append("Some standard sections are missing or hard to find.")
        
        if not weaknesses:
            weaknesses.append("No major weaknesses found, but there is always room to improve.")

        # Improvements
        if impact_score < 80:
            improvements.append("Add more specific numbers like percentages or budget figures.")
        
        if verb_score < 80:
            improvements.append("Use stronger verbs at the start of your bullet points.")
            
        if len(found_sections) < 5:
            missing = [s for s in sections.keys() if s not in found_sections]
            improvements.append(f"Try to add these sections: {', '.join(missing)}.")
        
        improvements.append("Keep your formatting consistent throughout the page.")

        return {
            "sections_found": found_sections,
            "impact_metrics_count": metrics_count,
            "impact_score": round(impact_score, 2),
            "verb_score": round(verb_score, 2),
            "word_count": word_count,
            "section_count": len(found_sections),
            "structured_analysis": {
                "strengths": strengths,
                "weaknesses": weaknesses,
                "improvements": improvements
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "AI Resume Analyzer NLP Service is running"}

@app.post("/extract_skills")
def extract_skills(data: ResumeData):
    try:
        doc = nlp(data.text)
        matches = matcher(doc)
        skills = set()
        for match_id, start, end in matches:
            span = doc[start:end]
            skills.add(span.text)
        
        # Fallback to some common noun/propn if no skills found from the list
        if not skills:
            skills = [token.text for token in doc if token.pos_ in ["PROPN"] and len(token.text) > 2]
            skills = list(set(skills))[:15]
            
        return {"skills": list(skills)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match_job")
def match_job(data: MatchData):
    try:
        corpus = [data.resume_text, data.job_text]
        vectorizer = TfidfVectorizer().fit_transform(corpus)
        vectors = vectorizer.toarray()
        
        # Calculate cosine similarity
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])
        score = float(similarity[0][0]) * 100
        
        return {"match_score": round(score, 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict_role")
def predict_role(data: ResumeData):
    try:
        text = data.text.lower()
        roles = {
            "Frontend Developer": ["react", "html", "css", "javascript", "frontend", "tailwind"],
            "Backend Developer": ["node.js", "python", "express", "fastapi", "sql", "mongodb", "backend"],
            "Fullstack Developer": ["react", "node.js", "fullstack", "frontend", "backend"],
            "Data Scientist": ["python", "machine learning", "data analysis", "pandas", "numpy", "data science"],
            "DevOps Engineer": ["docker", "aws", "kubernetes", "git", "devops", "ci/cd"],
        }
        
        predicted_roles = []
        for role, keywords in roles.items():
            if any(kw in text for kw in keywords):
                predicted_roles.append(role)
        
        if not predicted_roles:
            predicted_roles = ["Software Engineer"]
            
        return {"predicted_roles": predicted_roles[:3]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
