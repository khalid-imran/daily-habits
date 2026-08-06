import { BrandMark } from './icons'

export default function SetupGuide() {
  return (
    <div className="setup-wrap">
      <h1>
        <BrandMark size={30} /> Almost there!
      </h1>
      <p>
        The app is running, but it isn't connected to your Supabase project
        yet. Three quick steps:
      </p>

      <div className="setup-step">
        <b>1. Create the database tables</b>
        In your Supabase dashboard, open <code>SQL Editor</code>, paste the
        contents of <code>supabase/schema.sql</code> (in this project folder)
        and click <code>Run</code>.
      </div>

      <div className="setup-step">
        <b>2. Add your project keys</b>
        Open <code>Project Settings → API</code>, copy the{' '}
        <code>Project URL</code> and the <code>anon public</code> key, and put
        them in a <code>.env</code> file in this project folder (copy{' '}
        <code>.env.example</code> and rename it to <code>.env</code>):
        <pre>{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}</pre>
      </div>

      <div className="setup-step">
        <b>3. Restart the dev server</b>
        Stop it (Ctrl&nbsp;+&nbsp;C) and run <code>npm run dev</code> again so
        the new keys are picked up.
      </div>

      <p style={{ color: 'var(--text-soft)' }}>
        Tip: the full walkthrough lives in <code>README.md</code>.
      </p>
    </div>
  )
}
