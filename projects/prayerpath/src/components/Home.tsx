export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-serif text-3xl leading-snug text-ink sm:text-4xl">
        Remember every prayer.
        <br />
        Recognize every answer.
      </h1>

      <p className="mt-5 max-w-xl text-ink-soft leading-relaxed">
        PrayerPath is a quiet place to write down what you're praying for, come back to it
        often, and keep a record of how God has answered over time. Nothing fancy — just a
        notebook that doesn't lose your place.
      </p>

      <blockquote className="mt-8 border-l-2 border-ink pl-4 italic text-ink-soft">
        "Be careful for nothing; but in every thing by prayer and supplication with
        thanksgiving let your requests be made known unto God."
        <footer className="mt-1 not-italic text-sm text-ink-faint">
          Philippians 4:6, KJV
        </footer>
      </blockquote>

      <hr className="my-12 border-border" />

      <div>
        <h2 className="font-serif text-xl text-ink">How it works</h2>
        <ol className="mt-4 space-y-4 text-ink-soft leading-relaxed">
          <li>
            <span className="font-medium text-ink">1. Write it down.</span> Add a prayer with
            a category and, if you want, a private note about why it's on your heart.
          </li>
          <li>
            <span className="font-medium text-ink">2. Come back to it.</span> Your list stays
            right here, saved on this device, so you can keep praying over the same things.
          </li>
          <li>
            <span className="font-medium text-ink">3. Mark it answered.</span> When God moves,
            mark the prayer answered and write down what happened. It moves into your
            history, so you never lose track of it.
          </li>
        </ol>
      </div>

      <p className="mt-12 text-sm text-ink-faint">
        Everything you write stays in your browser on this device — there's no account and
        nothing is sent anywhere.
      </p>
    </div>
  )
}
