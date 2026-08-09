# Website sound effects

Adding a click sound takes two steps:

1. Put the audio file in this folder. MP3 is the default format.
2. Add `data-sound="filename"` to any clickable element.

The shortest option in any Markdown page or blog post is:

```liquid
{% include sound-button.html sound="stingus" label="Stingus" %}
```

For example, this plays `stingus.mp3`:

```html
<button type="button" data-sound="stingus">Stingus</button>
```

This plays `jarona.mp3` at half volume:

```html
<a class="btn" data-sound="jarona" data-sound-volume="0.5">JARONA</a>
```

Use the full filename for formats other than MP3:

```html
<button type="button" data-sound="my-sound.ogg">Play sound</button>
```

No JavaScript changes are needed. Elements added to the page later also work.
Repeated clicks can overlap naturally. Optional volume values range from `0` to
`1`, and optional playback speed can be set with `data-sound-rate`.

Sounds can also be played from JavaScript:

```javascript
siteSounds.play("stingus");
```

To play a sound when a visitor arrives on one specific page, add this to that
page's front matter:

```yaml
arrival_sound: hey-guys-i-think-i-found-a-glue
```

The sound plays immediately when the browser permits it. If audible autoplay is
blocked, it plays once on the visitor's first click, tap, or keypress instead.

## Included starter clips

- `stingus.mp3`: [flowery stingus](https://www.myinstants.com/en/instant/flowery-stingus-71099/)
- `jarona.mp3`: [Deltarune - JARONA](https://www.myinstants.com/en/instant/deltarune-jarona-58237/)
- `hey-guys-i-think-i-found-a-glue.mp3`: [Hey guys, I think I found a glue!](https://www.myinstants.com/en/instant/hey-guys-i-think-i-found-a-glue-52629/)

These third-party clips are not covered by this repository's software license.
Confirm that you have permission to publish any audio used on the site.
