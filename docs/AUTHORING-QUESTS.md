# Authoring Quests

This guide is for anyone adding curriculum to Stellar-learn — you don't need to
be a developer. If you can write clear prose and copy-paste JSON/TypeScript,
you can ship a quest.

A **World** (e.g. `world-1-origin-plains.ts`) is a themed unit made of several
**Quests**. Each quest is one of four types: `lesson`, `quiz`, `challenge`, or
`boss`. The type determines the shape of that quest's `content` field.

```
World
 └─ quests: Quest[]
     ├─ type: 'lesson'    → content: LessonBlock[]
     ├─ type: 'quiz'      → content: QuizQuestion[]
     ├─ type: 'challenge' → content: ChallengeSpec
     └─ type: 'boss'      → content: ChallengeSpec (see note below)
```

All the shapes below live in
[`packages/content/src/curriculum/types.ts`](../packages/content/src/curriculum/types.ts).
If you're ever unsure what a field is for, that file is the source of truth —
this doc explains it in plain language.

---

## 1. The `Quest` shape

Every quest, regardless of type, has these top-level fields:

```ts
interface Quest {
  id: string              // unique, kebab-case: 'q{world}-{order}-{short-slug}'
  worldId: string          // must match the parent World's id exactly
  slug: string             // URL-friendly, no world prefix: 'what-is-blockchain'
  title: string             // shown in the UI, keep it punchy (≤ 6 words)
  description: string      // one sentence, shown on the quest card
  type: QuestType          // 'lesson' | 'quiz' | 'challenge' | 'boss'
  order: number             // position within the world, starts at 1
  xpReward: number          // lessons: 50, quizzes: 100, challenges: 150+ (ask a maintainer if unsure)
  estimatedMinutes: number  // be honest — this sets learner expectations
  content: LessonBlock[] | QuizQuestion[] | ChallengeSpec
}
```

**Annotated real example** (from `world-1-origin-plains.ts`):

```ts
{
  id: 'q1-1-what-is-blockchain',   // world number 1, quest 1, short slug
  worldId: 'world-1-origin-plains', // matches World.id
  slug: 'what-is-blockchain',
  title: 'What is Blockchain?',
  description: 'Discover the ancient ledger magic that powers the digital realm.',
  type: 'lesson',
  order: 1,
  xpReward: 50,
  estimatedMinutes: 5,
  content: [ /* LessonBlock[], see below */ ],
}
```

---

## 2. Lessons — `LessonBlock[]`

Used when `type: 'lesson'`. A lesson is an ordered array of blocks rendered
top to bottom.

```ts
interface LessonBlock {
  type: 'text' | 'code' | 'callout' | 'image' | 'interactive'
  content: string
  language?: string                       // only for type: 'code', e.g. 'js'
  variant?: 'info' | 'warning' | 'tip'    // only for type: 'callout'
}
```

- **`text`** — Markdown. Use `##` headers to break up sections, and keep
  paragraphs short (2–4 sentences).
- **`callout`** — a highlighted box for a single key fact. Pick a `variant`:
  - `info` — a neutral fact worth calling out
  - `tip` — a helpful aside or mnemonic
  - `warning` — something learners commonly get wrong
- **`code`** — a code sample. Set `language` (e.g. `'js'`, `'rust'`).
- **`image` / `interactive`** — reserved for richer content; check with a
  maintainer before using these, since they need matching assets/components.

**Real example, annotated:**

```ts
content: [
  {
    type: 'text',
    content: '## The Magic Ledger\n\nImagine a magical book that thousands of wizards all share...',
    // ^ Markdown text block, sets up the concept with the world's fantasy framing
  },
  {
    type: 'callout',
    variant: 'info',
    content: '**Blockchain** = a chain of records (blocks) shared across many computers (nodes) so no single person controls it.',
    // ^ The one-sentence "if you remember nothing else" takeaway
  },
]
```

**Style pattern to follow:** alternate `text` blocks (which build the fantasy
narrative and explain the concept) with `callout` blocks (which state the
plain technical fact). This keeps lessons engaging without sacrificing
accuracy — the callout is what a learner should walk away remembering.

---

## 3. Quizzes — `QuizQuestion[]`

Used when `type: 'quiz'`. An array of multiple-choice questions.

```ts
interface QuizQuestion {
  id: string             // 'q1', 'q2', ... unique within this quest
  question: string
  options: QuizOption[]  // 3–4 options; mark exactly the correct one(s) true
  explanation: string    // shown after answering, right or wrong
}

interface QuizOption {
  id: string        // 'a', 'b', 'c', 'd'
  text: string
  isCorrect: boolean
}
```

**Real example:**

```ts
{
  id: 'q1',
  question: 'What makes a blockchain "trustless"?',
  options: [
    { id: 'a', text: 'You don\'t need to trust anyone — math and code guarantee the rules', isCorrect: true },
    { id: 'b', text: 'The government guarantees it', isCorrect: false },
    { id: 'c', text: 'Only verified users can participate', isCorrect: false },
    { id: 'd', text: 'Transactions require manual approval', isCorrect: false },
  ],
  explanation: 'Trustless means the protocol\'s rules are enforced by code and cryptography — no human or organization needs to be trusted.',
}
```

**Rules for good quiz questions:**
- Wrong answers should be *plausible*, not silly — a learner who skimmed the
  lesson should be able to rule most of them out, not all of them instantly.
- The `explanation` should teach even if the learner got it right — don't
  just restate the question.
- Only mark `isCorrect: true` on options that are unambiguously correct. If a
  question could have multiple correct answers, that's fine (see the XLM
  example in `world-1-origin-plains.ts`) — just make sure the UI copy for
  that quest tells learners to "select all that apply."

---

## 4. Challenges — `ChallengeSpec`

Used when `type: 'challenge'` (and currently `'boss'` — see note below).
Unlike lessons/quizzes, this is a single object, not an array — a challenge
quest asks the learner to actually do something on testnet.

```ts
interface ChallengeSpec {
  description: string
  starterCode: string
  validationRules: ValidationRule[]
  hints: string[]
  testnetRequired: boolean
}

interface ValidationRule {
  type: 'tx_success' | 'account_created' | 'asset_issued' | 'balance_check' | 'code_contains'
  params: Record<string, unknown>
  errorMessage: string
}
```

- **`description`** — the task, written as an instruction ("Create and fund
  a new Stellar account with 10 XLM using `createAccount`.").
- **`starterCode`** — a code snippet the learner starts from. Should run (or
  fail predictably) as-is — don't leave it half-broken.
- **`validationRules`** — how we programmatically check the learner
  succeeded. **Non-developer contributors: draft the `description` and
  `hints`, and leave `validationRules` as a `TODO` comment for a developer to
  fill in** — the exact `params` shape depends on the validator
  implementation, which isn't yet fully documented. Tag your PR for review.
- **`hints`** — ordered, progressively more specific. Hint 1 should nudge,
  the last hint should nearly give it away.
- **`testnetRequired`** — `true` for almost everything; only `false` for
  purely local/offline exercises.

There's no `ChallengeSpec` example in `world-1-origin-plains.ts` yet (it's an
all-lesson/quiz world) — if you're writing the first challenge quest for a
world, ping a maintainer to review your `validationRules` before merging.

> **Note on `'boss'` quests:** boss quests currently reuse `ChallengeSpec` as
> their content shape, but the validation pattern for boss fights isn't
> written up yet. If you're contributing a boss quest, treat this the same
> as a challenge and flag it explicitly in your PR — don't guess at
> validation rules for boss fights.

---

## 5. Copy-paste templates

### Lesson quest

```ts
{
  id: 'q{N}-{order}-{short-slug}',
  worldId: 'world-{N}-{world-slug}',
  slug: '{short-slug}',
  title: '',
  description: '',
  type: 'lesson',
  order: 0,
  xpReward: 50,
  estimatedMinutes: 5,
  content: [
    {
      type: 'text',
      content: '## \n\n',
    },
    {
      type: 'callout',
      variant: 'info',
      content: '',
    },
    {
      type: 'text',
      content: '## \n\n',
    },
    {
      type: 'callout',
      variant: 'tip',
      content: '',
    },
  ],
},
```

### Quiz quest

```ts
{
  id: 'q{N}-{order}-{short-slug}',
  worldId: 'world-{N}-{world-slug}',
  slug: '{short-slug}',
  title: 'Quiz: ',
  description: '',
  type: 'quiz',
  order: 0,
  xpReward: 100,
  estimatedMinutes: 5,
  content: [
    {
      id: 'q1',
      question: '',
      options: [
        { id: 'a', text: '', isCorrect: false },
        { id: 'b', text: '', isCorrect: false },
        { id: 'c', text: '', isCorrect: false },
        { id: 'd', text: '', isCorrect: false },
      ],
      explanation: '',
    },
  ],
},
```

### Challenge quest

```ts
{
  id: 'q{N}-{order}-{short-slug}',
  worldId: 'world-{N}-{world-slug}',
  slug: '{short-slug}',
  title: '',
  description: '',
  type: 'challenge',
  order: 0,
  xpReward: 150,
  estimatedMinutes: 10,
  content: {
    description: '',
    starterCode: '',
    validationRules: [
      // TODO: fill in with a maintainer — see docs/AUTHORING-QUESTS.md §4
    ],
    hints: [''],
    testnetRequired: true,
  },
},
```

---

## 6. Sourcing & tone guidelines

**Sourcing:**
- Every technical claim (fees, timing, operation names, protocol behavior)
  must trace back to [developers.stellar.org/docs/build](https://developers.stellar.org/docs/build)
  or another Stellar Development Foundation source. If you learned a fact
  from a blog post or tutorial, verify it against the official docs before
  using it.
- If a number is likely to change (fees, network stats), phrase it so it
  ages well — "a tiny fraction of a cent" rather than a hard-coded price if
  you're not confident it's stable.
- When unsure whether something's still accurate, say so in your PR
  description rather than guessing.

**Tone:**
- The world uses a light fantasy framing ("realm," "wizards," "the Doubt
  Wraith") to make the material approachable — match the voice of the world
  you're contributing to. Look at the other quests in that world file before
  writing.
- Fantasy framing wraps the concept; it never replaces the technical
  accuracy. A `callout` block should always be checkable against the real
  Stellar docs even if the surrounding `text` block is playful.
- Keep sentences short. Assume the learner has never touched a blockchain
  before, but don't talk down to them.
- Avoid hype language ("revolutionary," "game-changing") — explain why
  something matters concretely instead.

---

## 7. Before you open a PR

- [ ] `id`, `worldId`, and `slug` are unique and consistent with neighboring quests
- [ ] `order` doesn't collide with an existing quest in the same world
- [ ] Every technical fact is sourced from official Stellar docs
- [ ] Quiz `explanation` fields teach something, not just restate the answer
- [ ] Challenge `validationRules` are either filled in or explicitly flagged as TODO for a maintainer
- [ ] Tone matches the rest of the world
- [ ] Ran `npm run typecheck` so TypeScript confirms your quest matches the `Quest` type