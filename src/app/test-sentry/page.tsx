'use client'

import * as Sentry from "@sentry/nextjs"

export default function TestSentry() {
  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <button
        onClick={() => {
          Sentry.captureException(new Error("Test alerte JB Coaching"))
        }}
        className="bg-[#d4ff00] text-black font-bold px-6 py-3 rounded-xl"
      >
        Envoyer erreur test
      </button>
    </div>
  )
}
