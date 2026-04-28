const rawQuestions = `Held hands romantically? 1
Been on a date? 1
Spooned or cuddled with a MPS for longer than 20 min? 1
Sat on somebody’s lap or had someone sit on your lap for longer than 10 minutes? 1
Said a major racial or sexual slur (not of your own race/sexuality)? 2
Been in a romantic relationship? 1
Danced intimately with a partner? 1
Catcalled someone or been catcalled? 1
Kissed a non-family member on the lips? 2
French kissed (with tongue)? 2
Kissed while lying down? 2
Given or received a hickey? 1
Kissed or been kissed on the breast or below the waist? 2
Primarily kissed for more than two hours? 2
Played a game involving stripping? 2
Masturbated? 1
Masturbated to a sexual picture or video (pornography)? 1
Masturbated while someone else was in the room? 3
Been caught masturbating? 3
Masturbated with an inanimate object or toy? 3
Massaged or been massaged sensually? 1
Gone through the motions of sex while still dressed? 1
Undressed/been undressed by a MPS (member of the preferred sex)? 2
Showered with a MPS? 3
Fondled or had your butt cheeks fondled? 2
Fondled or had your breasts/nipples fondled? 2
Fondled or had your genitals fondled/touched sensually? 2
Had or given “blue balls”? 2
Had someone else make you come? 3
Sent a sexually explicit text? 1
Sent or received sexually explicit photographs? 2
Engaged in sexual activity over video or phone call? 2
Cheated on a significant other during a relationship? 3
Purchased contraceptives (purchased condoms, or gone on birth control for sexual reasons)? 1
Given or received oral sex? 2
Ingested someone else’s or your own cum? 3
Used a sex toy with a partner? 3
Spent the night with a MPS? 1
Been walked in on while engaging in a sexual act? 2
Kicked a roommate out to do something sexual? 2
Ingested alcohol in a non-religious context? 1
Played a drinking game? 2
Been drunk? 2
Thrown up due to alcohol or other substance ingestion? 2
Been hung over? 2
Faked being sober? 2
Had memory loss (browning or blacking out) due to alcohol or drugs? 3
Drank alcohol 4+ days in a row? 3
Used nicotine products (cigarette/cigar or vape)? 2
Used marijuana (including smoking, and THC drinks/snacks like edibles)? 2
Used a drug stronger than marijuana? 3
Had and used a fake ID to purchase something (alcohol, drugs, etc.)? 3
Been sent to the office of a principal, dean or judicial affairs representative for a disciplinary infraction? 3 
Cheated on an exam or important project? 1
Been put on disciplinary probation or suspended? 3
Lied about yourself (physical characteristics, income, hobbies, or opinions) for the sole purpose of attracting a MPS? 2
Urinated in public? 1
Gone skinny-dipping? 2
Paid or entered an establishment to see a stripper? 3
Received a lap dance from a stripper? 3
Had the police called on you? 2
Run from the police? 3
Had the police question you? 2
Been arrested and/or convicted of a crime? 3
Committed an act of vandalism or other minor crime without being caught? 1
Had sex (lost your virginity)? 3
Had sex three or more times in one night? 3
Had sex 10 or more times in your life? 3
Had sex in four or more positions? 2
69? 3
Had sex with a stranger or person you just met? 3
Had sex in a car? 2
Rented a hotel/motel/bedroom specifically for the purpose of committing a sexual act? 2
Had sex outdoors or in a public space? 3
Had sex in a swimming pool or hot tub? 3
Had sex while you or your partner’s parents were in the same home? 2
Had sex with non-participating third party in the same room? 4
Joined the mile high club (had sex on an airplane)? 3
Participated in a “booty call” with someone you were not in a relationship with? 3
Eaten someone’s ass or gotten your ass eaten? 3
Had sex with someone who you never spoke to significantly again? 3
Traveled 100 or more miles for the primary purpose of sex? 4
Had sex with a partner with a 4 or more year age difference? 3
Had sex with a virgin? 2
Had sex without protection? 3
Given or received “road head” (oral sex while driving)? 3
Had a STI/STD test due to reasonable suspicion, or had an STI/STD? 3
Had sex with 2+ people at the same time? 4
Had two or more distinct acts of sex with two or more people within 24 hours? 3
Have a body count of five or more (had sex with 5+ people in your life)? 3
Taken (or someone else took) and kept, gave away, or sold sexually explicit images/videos of yourself and/or your partner? 3
Had period sex? 3
Had anal sex? 2
Had a pregnancy scare, impregnated someone, or been impregnated? 3
Paid or been paid (in money or goods/services) for a sexual act? 3
Committed an act of voyeurism or exhibitionism (being watched or watching someone commit a sexual act)? 4
Had a sexual or romantic encounter with a member of the same sex (or if gay/lesbian, a member of the opposite sex)? 2
Engaged in acts of BDSM or indulged in your/your partner’s sexual kinks? 4
Had sex as both the “dom” and “sub” (been on both the top and bottom)? 2
Sat on or had somebody else sit on your face with no clothes on? 3`;

// 1. Parse Data
let parsedQuestions = [];
let totalPointsAvailable = 0;
let finalScore = 100; // Tracked globally for analytics

rawQuestions.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    
    const match = line.match(/^(.*?)\s+(\d+)(?:\s*\/\/.*)?$/);
    if (match) {
        const weight = parseInt(match[2]);
        parsedQuestions.push({
            q: match[1].trim(),
            w: weight,
            checked: false
        });
        totalPointsAvailable += weight;
    }
});

// 2. Randomize & Handle Question 69
const q69Index = parsedQuestions.findIndex(item => item.q.includes("69?"));
let q69Obj = null;

if (q69Index !== -1) {
    q69Obj = parsedQuestions.splice(q69Index, 1)[0];
}

for (let i = parsedQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parsedQuestions[i], parsedQuestions[j]] = [parsedQuestions[j], parsedQuestions[i]];
}

if (q69Obj) {
    parsedQuestions.splice(68, 0, q69Obj);
}

parsedQuestions.forEach((item, index) => {
    item.number = index + 1;
});

// 3. UI State & Pagination Logic
const itemsPerPage = 10;
let currentPage = 0;
const totalPages = Math.ceil(parsedQuestions.length / itemsPerPage);

const disclaimer = document.getElementById('disclaimer-checkbox');
const disclaimerContainer = document.getElementById('disclaimer-container');
const quizSection = document.getElementById('quiz-section');
const container = document.getElementById('questions-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const pageInfo = document.getElementById('page-info');

disclaimer.addEventListener('change', (e) => {
    if (e.target.checked) {
        quizSection.classList.remove('disabled');
    } else {
        quizSection.classList.add('disabled');
    }
});

function renderPage() {
    container.innerHTML = '';
    
    // Hide disclaimer if past the first page
    if (currentPage === 0) {
        disclaimerContainer.classList.remove('hidden');
    } else {
        disclaimerContainer.classList.add('hidden');
    }
    
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const currentQuestions = parsedQuestions.slice(start, end);

    currentQuestions.forEach(item => {
        const div = document.createElement('div');
        div.className = 'question-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `q-${item.number}`;
        checkbox.checked = item.checked;
        
        checkbox.addEventListener('change', (e) => {
            item.checked = e.target.checked;
        });

        const label = document.createElement('label');
        label.htmlFor = `q-${item.number}`;
        label.innerText = `${item.number}. ${item.q}`;

        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });

    pageInfo.innerText = `Page ${currentPage + 1} of ${totalPages}`;
    prevBtn.disabled = currentPage === 0;

    if (currentPage === totalPages - 1) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
    
    window.scrollTo(0, 0);
}

prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        renderPage();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages - 1) {
        currentPage++;
        renderPage();
    }
});

submitBtn.addEventListener('click', () => {
    let gainedPoints = 0;
    
    parsedQuestions.forEach(item => {
        if (item.checked) {
            gainedPoints += item.w;
        }
    });

    finalScore = Math.floor(((totalPointsAvailable - gainedPoints) / totalPointsAvailable) * 100);
    finalScore = Math.max(0, Math.min(100, finalScore));

    document.getElementById('quiz-section').classList.add('hidden');
    document.querySelector('header').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');
    document.getElementById('score-display').innerText = finalScore;
    window.scrollTo(0, 0);
});

// Analytics Submission Logic
document.getElementById('submit-data-btn').addEventListener('click', async () => {
    const yob = document.getElementById('yob').value;
    const major = document.getElementById('major').value;
    
    // Format date/time locally
    const now = new Date();
    const now = new Date();
    const timestamp = now.toLocaleString("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });

    const analyticsData = {
        score: finalScore,
        date: timestamp,
        birthYear: yob || "N/A",
        major: major || "N/A"
    };

    // PASTE YOUR GOOGLE WEB APP URL HERE
    const backendURL = "https://script.google.com/macros/s/AKfycbwl76IRcvdgC5sg1tmyg3yQEXBjn1ELcY-rhIjP68D9NDDc67N3XN28DD4bAIwMELEx/exec"; 

    const btn = document.getElementById('submit-data-btn');
    btn.disabled = true;
    btn.innerText = "Sending...";

    try {
        await fetch(backendURL, {
            method: 'POST',
            body: JSON.stringify(analyticsData),
            headers: {
                // Using text/plain prevents CORS preflight issues with standard web servers
                "Content-Type": "text/plain;charset=utf-8",
            }
        });

        // Hide form and show success text
        btn.classList.add('hidden');
        document.querySelectorAll('.form-group').forEach(el => el.classList.add('hidden'));
        document.getElementById('thank-you-msg').classList.remove('hidden');

    } catch (error) {
        console.error("Error saving data:", error);
        alert("Oops! Something went wrong saving your data.");
        btn.disabled = false;
        btn.innerText = "Submit Anonymous Data";
    }
});

// Init
renderPage();
