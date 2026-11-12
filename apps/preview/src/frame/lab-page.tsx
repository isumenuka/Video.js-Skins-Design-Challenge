import { useLesson } from '@/video/lesson/lesson-context';
import { vocapediaHome } from '@/video/lesson/lesson-data';

const LOGO = './vocapedia-logo.png';

export function LabHeader() {
  const lab = useLesson();
  return (
    <header className="lab-header">
      <a className="lab-brand" href={vocapediaHome} target="_blank" rel="noreferrer">
        <img src={LOGO} alt="" width="28" height="28" className="lab-brand-logo" />
        <span className="lab-brand-name">Vocapedia</span>
        <span className="voca-sr-only"> (opens in a new tab)</span>
      </a>
      <span className="lab-pill">Language Lab</span>
      <h1 className="lab-title">{lab?.lesson.title}</h1>
    </header>
  );
}

export function LabFooter() {
  return (
    <footer className="lab-footer">
      <p>
        <strong>The Living Encyclopedia</strong> is a Video.js 10 skin for Vocapedia, the free encyclopedia of
        languages. The player is an open volume bound in Vocapedia cobalt. The film plays as an engraved plate on the
        right page, and the left page turns to a new encyclopedia entry for each spoken line, with its translation and
        the words worth keeping. The page edges are the timeline, with a silk ribbon as the bookmark, and play/pause is
        a wax seal. On a phone the volume closes down to its gilt edge, and the picture fills the frame.
      </p>
      <p className="lab-credit">
        &ldquo;Sintel&rdquo; &copy; copyright Blender Foundation |{' '}
        <a href="https://durian.blender.org" target="_blank" rel="noreferrer">
          durian.blender.org
        </a>{' '}
        &mdash; licensed{' '}
        <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
          CC BY 3.0
        </a>
        . Streamed by Mux. Subtitles from the Durian project.
      </p>
    </footer>
  );
}
