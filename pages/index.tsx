import Head from 'next/head'
import { useState, useEffect } from 'react'
import styled, { keyframes, ThemeProvider, createGlobalStyle } from 'styled-components'
import { FaHeart, FaWhatsapp, FaFacebook, FaCopy, FaMoon, FaSun } from 'react-icons/fa'
import { supabase } from '../lib/supabaseClient'

// Key Animations
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(-20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`

// Theme Styles
const lightTheme = {
  background: '#fff',
  text: '#333',
  inputBg: '#fff',
  panelBg: 'rgba(255, 255, 255, 0.15)',
}

const darkTheme = {
  background: '#1e1e2f',
  text: '#f1f1f1',
  inputBg: '#2e2e42',
  panelBg: 'rgba(255, 255, 255, 0.1)',
}

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: background 0.4s ease;
  }
`

// Layout Styling (keep your structure)
const GradientBackground = styled.div`
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background: linear-gradient(270deg, #ff9a9e, #fad0c4, #a1c4fd, #c2e9fb, #fccb90);
  background-size: 1000% 1000%;
  animation: ${gradientShift} 20s ease infinite;
  font-family: 'Segoe UI', sans-serif;
`

const LeftPanel = styled.div`
  flex: 3;
  padding-right: 2rem;
`

const RightPanel = styled.div`
  flex: 1;
  padding-left: 2rem;
  background-color: ${({ theme }) => theme.panelBg};
  border-radius: 12px;
  height: fit-content;
`

const Title = styled.h1`
  font-size: 2.8rem;
  margin-bottom: 1rem;
  animation: ${fadeInUp} 1s ease forwards;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`

const Section = styled.div`
  margin: 2rem 0;
`

const MoodButton = styled.button<{ active: boolean }>`
  padding: 12px 20px;
  font-size: 1.2rem;
  margin: 0.5rem;
  border: none;
  border-radius: 10px;
  background-color: ${(props) => (props.active ? '#fff' : '#ffffff66')};
  color: ${(props) => (props.active ? '#333' : '#fff')};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: #fff;
    color: #333;
    transform: scale(1.05);
  }
`

const Question = styled.div`
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.8s ease forwards;
`

const QuestionText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`

const AnswerInput = styled.input`
  padding: 10px;
  width: 100%;
  max-width: 400px;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
`

const JournalArea = styled.textarea`
  padding: 12px;
  width: 100%;
  max-width: 100%;
  min-height: 100px;
  font-size: 1rem;
  margin-top: 1rem;
  border: none;
  border-radius: 8px;
`

const SubmitButton = styled.button`
  padding: 10px 24px;
  background: #fff;
  color: #333;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  margin-top: 1rem;
  cursor: pointer;

  &:hover {
    background: #e0e0e0;
  }
`

const Result = styled.div`
  margin-top: 2rem;
  font-size: 1.2rem;
  background-color: rgba(255,255,255,0.2);
  padding: 1rem;
  border-radius: 10px;
  animation: ${fadeInUp} 1s ease forwards;
`

const Motivation = styled.div`
  font-size: 1rem;
  line-height: 1.6;
  padding: 1rem;
`

const LinkButton = styled.a`
  display: inline-block;
  margin-top: 1rem;
  color: #fff;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    text-decoration: none;
  }
`

const ShareRow = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
`

const ShareIcon = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;

  &:hover {
    color: #ffd;
    transform: scale(1.1);
  }
`

const ToggleButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
`

export default function Home() {
  const moods = ['😊 Happy', '😢 Sad', '😡 Angry', '😌 Calm', '😐 Neutral']
  const [selectedMood, setSelectedMood] = useState('')
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [journalEntry, setJournalEntry] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [moodHistory, setMoodHistory] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const questions = [
    'How often do you feel overwhelmed?',
    'Do you sleep well most nights?',
    'Have you lost interest in things you used to enjoy?',
    'Do you feel connected to people around you?',
    'How is your energy level during the day?'
  ]

  const handleSubmit = async () => {
    let score = 0
    Object.values(answers).forEach((a) => {
      if (['no', 'not really', 'bad', 'low'].includes(a.toLowerCase())) {
        score++
      }
    })

    let feedback = ''
    if (score >= 3) {
      feedback = 'You might be going through a tough time. Consider talking to a friend, journaling, or reaching out for support 💙'
    } else if (score === 2) {
      feedback = 'Things seem a bit off, but you’re managing. Keep an eye on your mental health and try relaxing activities 🌿'
    } else {
      feedback = 'You seem to be doing okay. Keep up your good routines and stay connected! 😊'
    }

    setSuggestion(feedback)
    setShowResult(true)
    setMoodHistory((prev) => [...prev.slice(-4), selectedMood])

    // Save to Supabase
    await supabase.from('journals').insert([
      {
        mood: selectedMood,
        answers,
        journal: journalEntry,
        created_at: new Date()
      }
    ])
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
      <Head>
        <title>Mental Health Tracker</title>
        <meta name="description" content="Track your mood and get helpful suggestions" />
      </Head>

      <ToggleButton onClick={toggleTheme}>
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </ToggleButton>

      <GradientBackground>
        <LeftPanel>
          <Title><FaHeart /> Mental Health Tracker</Title>

          <Section>
            <h2>1. How are you feeling today?</h2>
            {moods.map((m) => (
              <MoodButton key={m} active={selectedMood === m} onClick={() => setSelectedMood(m)}>
                {m}
              </MoodButton>
            ))}
          </Section>

          <Section>
            <h2>2. Answer a few quick questions</h2>
            {questions.map((q, idx) => (
              <Question key={idx}>
                <QuestionText>{q}</QuestionText>
                <AnswerInput
                  type="text"
                  placeholder="e.g., yes / no / sometimes"
                  value={answers[q] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                />
              </Question>
            ))}
          </Section>

          <Section>
            <h2>3. Journal your thoughts</h2>
            <JournalArea
              placeholder="Write about how your day went or what’s on your mind..."
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
            />
          </Section>

          <SubmitButton onClick={handleSubmit}>Analyze</SubmitButton>

          {showResult && (
            <Result>
              <p>🧠 Based on your answers:</p>
              <p><strong>{suggestion}</strong></p>
              {selectedMood && <p>You’re feeling <strong>{selectedMood}</strong> today.</p>}
              {moodHistory.length > 0 && (
                <p>📊 Mood History: {moodHistory.join(' → ')}</p>
              )}
              <ShareRow>
                <span>🔗 Share:</span>
                <a
                  href={`https://wa.me/?text=Track%20your%20mental%20health:%20${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ShareIcon><FaWhatsapp /></ShareIcon>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ShareIcon><FaFacebook /></ShareIcon>
                </a>
                <ShareIcon onClick={copyLink}><FaCopy /></ShareIcon>
                {copied && <span style={{ color: '#0f0' }}>Copied!</span>}
              </ShareRow>
            </Result>
          )}
        </LeftPanel>

        <RightPanel>
          <Motivation>
            <h3>✨ Thought of the Day</h3>
            <p>
              “You have power over your mind – not outside events. Realize this, and you will find strength.”<br />
              — <strong>Marcus Aurelius</strong>
            </p>
            <p>
              Small steps create lasting change. Breathe, reflect, and be kind to yourself. 💛
            </p>
            <LinkButton
              href="https://www.betterhelp.com/advice/"
              target="_blank"
              rel="noopener noreferrer"
            >
              🌐 Get AI Mental Health Tips or Talk to a Therapist
            </LinkButton>
          </Motivation>
        </RightPanel>
      </GradientBackground>
    </ThemeProvider>
  )
}
