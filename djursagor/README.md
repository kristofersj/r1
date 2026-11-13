# Djursagor / Histoires d'animaux — a Rabbit r1 creation

Three short pixel-art animal stories for ages 2–4, each with Swedish and French text and voice-over.

## Controls on the r1
| Input | Story list | Inside a story |
|---|---|---|
| Scroll wheel | Move the selection | Next / previous page |
| Side button (click) | Open the story | Replay the voice-over |
| Side button (long press) | Switch SV ⇄ FR | Switch SV ⇄ FR |
| Tap the SV / FR tab | Switch language | Switch language and replay |
| Tap the picture | — | Replay the voice-over |
| Tap the house icon | — | Back to the story list |

The language choice is saved on the device.

## Put it on your r1
1. **Host the folder.** Drag this whole folder onto https://app.netlify.com/drop, or push it to a GitHub repo with Pages enabled. You'll get an HTTPS address, for example `https://djursagor.netlify.app/`.
2. **Make the QR code.** Open the rabbit QR generator (the `qr` folder in https://github.com/rabbit-hmi-oss/creations-sdk) and fill in:
   - title: `Djursagor`
   - url: your HTTPS address
   - description: `Animal stories in Swedish & French`
   - iconUrl: `<your address>/assets/icon.png`
   - themeColor: `#e8734a`
3. **Install it.** On the r1, open the creations card, go to **create**, tap **add via QR code**, and scan the code.

## Test on a computer
Run `python3 -m http.server` in this folder and open http://localhost:8000 in a window sized 240×282. Use the arrow keys for the wheel, Enter for the side button, and Esc to go back to the story list.

## Files
- `js/stories.js`: all the story text (edit here)
- `js/art.js`: pixel-art sprites and scenes, drawn on an 80×50 canvas and framed at 4×
- `js/app.js`: navigation, hardware events and audio
- `audio/<story>-<page>-<lang>.mp3`: the voice-over. To use your own recordings, replace a file and keep its name.

## Credits
- Font: Pixelify Sans (SIL Open Font License)
- Voices: Piper TTS. Swedish voice "nst" (CC0). French voice "siwis" (CC-BY 4.0, SIWIS corpus)
