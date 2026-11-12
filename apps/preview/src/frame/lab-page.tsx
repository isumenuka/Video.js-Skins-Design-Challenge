/** The film's licence asks for a visible credit; one quiet line under the volume. */
export function LabCredit() {
  return (
    <p className="lab-credit">
      &ldquo;Sintel&rdquo; &copy; Blender Foundation |{' '}
      <a href="https://durian.blender.org" target="_blank" rel="noreferrer">
        durian.blender.org
      </a>{' '}
      &middot;{' '}
      <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
        CC BY 3.0
      </a>{' '}
      &middot; streamed by Mux
    </p>
  );
}
