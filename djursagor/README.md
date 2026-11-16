# Djursagor / Histoires d'animaux — a Rabbit r1 creation

Three little pixel-art fairy tales for ages 2–4, in Swedish and French with voice-over:

- **Mira letar efter solen / Mira cherche le soleil**: a mouse goes to wake the sun.
- **Hugo och den tysta skogen / Hugo et la forêt silencieuse**: a hare helps a bird find her song.
- **Ruben räddar månen / Ruben sauve la lune**: a fox cub tries to rescue the moon from the lake.

The app remembers which page you were on, so it reopens there.

## Controls on the r1
| Input | Story list | Inside a story |
|---|---|---|
| Scroll wheel | Move the selection | Next / previous page |
| Side button (click) | Open the story | Replay the voice-over |
| Side button (long press) | Switch SV ⇄ FR | Switch SV ⇄ FR |
| Tap the SV / FR tab | Switch language | Switch language and replay |
| Tap the picture | — | Replay the voice-over |
| Tap the house icon | — | Back to the story list |

The language choice and current page are saved on the device.

## Make the voice-over (ElevenLabs)
1. Make a free account at elevenlabs.io and create an API key (Profile → API keys).
2. Optional but recommended: in the Voice Library, filter on **Swedish** and **French** and add a warm storyteller voice for each language to *My Voices*.
3. In Terminal, in this folder, run `bash make-voices.sh --test`. Pick the voice IDs when it asks, then listen to page 1.
4. Happy? Run `bash make-voices.sh` to make all 50 clips (about 3,400 characters). To redo one page, run e.g. `bash make-voices.sh mira-3`.

## Put it on your r1
Hosted at https://kristofersj.github.io/r1/djursagor/ (GitHub repo `kristofersj/r1`). Upload the changed files into the repo's `djursagor/` folder, then make a new QR code with a bumped `?v=` number so the r1 fetches the new version.

## Test on a computer
`index.html` has a `<base>` tag pointing at the GitHub address, so for local testing remove that line first. Then run `python3 -m http.server` in this folder and open http://localhost:8000 in a window sized 240×282. Use the arrow keys for the wheel, Enter for the side button, and Esc to go back to the story list.

## Files
- `js/stories.js`: all the story text (edit here)
- `js/art.js`: pixel-art characters and scenes, drawn at 60×37 and shown at 4×
- `js/app.js`: navigation, hardware events and audio
- `audio/<story>-<page>-<lang>.mp3`: the voice-over. To use your own recordings, replace a file and keep its name.
- `make-voices.sh`: generates the voice-over with ElevenLabs.

## Credits
- Font: Pixelify Sans (SIL Open Font License)
- Voices: ElevenLabs (generated with make-voices.sh)
