// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Loading
// ============================================================================

export default function Loading() {

    return (

        <main className="animate-pulse">

            <section className="h-96 rounded-3xl bg-neutral-200 dark:bg-neutral-800" />

            <section className="mt-8 space-y-4">

                <div className="h-8 w-64 rounded bg-neutral-200 dark:bg-neutral-800" />

                <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />

                <div className="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800" />

            </section>

            <section className="mt-10 grid gap-6 md:grid-cols-3">

                <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />

                <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />

                <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />

            </section>

        </main>

    )

}