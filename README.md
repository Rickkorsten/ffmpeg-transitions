# Video Concatenation Library

This library provides a simple interface to concatenate two or more videos into a single video file using `ffmpeg`'s `xfade` filter for smooth transitions between clips.

## Installation

Before using this library, ensure you have `ffmpeg` installed on your system. Then, install the library via npm:

```bash
npm install ffmpeg-transitions
```

## Usage
To use this library, you need to import it into your project and call the blendVideos function with the paths of the videos you want to concatenate, the output path for the concatenated video, the transition type, and the duration of the transition.  Here's a basic example:

```javascript
import blendVideos from 'ffmpeg-transitions'

const videoPaths = [
    'path/to/first/video.mp4',
    'path/to/second/video.mp4',
    // Add more video paths as needed
];

const output = 'path/to/output/video.mp4';

// For a single transition type for all videos
const transition = 'fade'; // Transition type

// For different transitions between each video
const transition = [
    { transition: 'fade', duration: 0.5 },
    { transition: 'slideleft', duration: 0.5 }
    // Add more transitions as needed
];

const transitionDuration = 0.5; // Transition duration in seconds, used if a single transition type is provided

blendVideos(videoPaths, output, transition, transitionDuration, (err, result) => {
    if (err) {
        console.error('Error concatenating videos:', err);
        return;
    }
    console.log('Videos concatenated successfully:', result);
});
```

## Supported Transitions

The library supports various xfade transitions provided by ffmpeg. Here are some examples:
- crossfade
- fade
- wipeleft
- wiperight
- slideleft
- slideright
- circleclose
- circleopen
  [...and many more.](https://trac.ffmpeg.org/wiki/Xfade)

## API

<b>
blendVideos(videoPaths, output, transition, transitionDuration, callback)
</b>

- <b>videoPaths:</b> Array of strings. Paths to the source video files.
- <b>output:</b> String. Path for the output concatenated video file.
- <b>transition:</b> Union type of String or Array of transition objects. Type of transition to use between videos or an array of transition objects for different transitions between each video.
- <b>transitionDuration:</b> Number. Duration of the transition in seconds.
- <b>callback:</b> Function. Called after the process completes or fails. Receives err and result parameters.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue if you have suggestions for improvements or have identified bugs.  

## License
This project is licensed under the MIT License - see the LICENSE file for details.
