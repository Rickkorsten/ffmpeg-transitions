import {exec, ExecException} from 'child_process';

type TransitionType = 'fade'
    | 'wipeleft'
    | 'wiperight'
    | 'wipeup'
    | 'wipedown'
    | 'slideleft'
    | 'slideright'
    | 'slideup'
    | 'slidedown'
    | 'circlecrop'
    | 'rectcrop'
    | 'distance'
    | 'fadeblack'
    | 'fadewhite'
    | 'radial'
    | 'smoothleft'
    | 'smoothright'
    | 'smoothup'
    | 'smoothdown'
    | 'circleopen'
    | 'circleclose'
    | 'vertopen'
    | 'vertclose'
    | 'horzopen'
    | 'horzclose'
    | 'dissolve'
    | 'pixelize'
    | 'diagtl'
    | 'diagtr'
    | 'diagbl'
    | 'diagbr'
    | 'hlslice'
    | 'hrslice'
    | 'vuslice'
    | 'vdslice'
    | 'hblur'
    | 'fadegrays'
    | 'wipetl'
    | 'wipetr'
    | 'wipebl'
    | 'wipebr'
    | 'squeezeh'
    | 'squeezev'
    | 'zoomin'
    | 'fadefast'
    | 'fadeslow'
    | 'hlwind'
    | 'hrwind'
    | 'vuwind'
    | 'vdwind'
    | 'coverleft'
    | 'coverright'
    | 'coverup'
    | 'coverdown'
    | 'revealleft'
    | 'revealright'
    | 'revealup'
    | 'revealdown';

type TransitionWithDuration = { transition: TransitionType; duration: number };

function getVideoDuration(videoPath:string) {
    return new Promise((resolve, reject) => {
        const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`stderr: ${stderr}`);
                return;
            }
            resolve(parseFloat(stdout.trim()));
        });
    });
}

async function generateFfmpegCommand(videoFiles: string[], output:string, transition:TransitionType | TransitionWithDuration[], transitionDuration:number) {
    try {

        if (videoFiles.length < 2) {
            throw new Error('Need at least two video files to create transitions.');
        }

        if (transition instanceof Array && transition.length !== videoFiles.length) {
            throw new Error('Transition array length should be equal to video files length');
        }

        let filterComplex = '';
        let audioTransitions = '';
        let prevVideo = `[0:v]`; // Corrected to specify the video stream of the first file
        let prevAudio = `[0:a]`; // Corrected to specify the audio stream of the first file

        const fadeDuration = transitionDuration; // Half-second fade
        let lastOffset = 0; // Initialize last offset

        for (let index = 0; index < videoFiles.length - 1; index++) {
            // Only iterate to the second last element
            const duration = (await getVideoDuration(videoFiles[index])) as number;

            const nextIndex = index + 1;
            const videoFade = `[vfade${nextIndex}]`;
            const audioFade = `[afade${nextIndex}]`;

            const xFadeTransition = transition instanceof Array ? transition[index].transition : transition;
            const xFadeDuration = transition instanceof Array ? transition[index].duration : fadeDuration;


            const offset = lastOffset + duration - xFadeDuration;
            lastOffset = offset; // Update last offset used for the next iteration


            filterComplex += `${prevVideo}[${nextIndex}:v]xfade=transition=${xFadeTransition}:duration=${xFadeDuration}:offset=${offset}${videoFade};`;
            audioTransitions += `${prevAudio}[${nextIndex}:a]acrossfade=d=${xFadeDuration}${audioFade};`;

            prevVideo = videoFade; // Update previous video to current for the next iteration
            prevAudio = audioFade; // Update previous audio to current for the next iteration
        }

        // Append format setting to the last video fade label used and specify output labels for map
        filterComplex += `${prevVideo}format=yuv420p[vout];`;
        audioTransitions += `${prevAudio}aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[aout];`;

        const finalCommand = `ffmpeg ${videoFiles
            .map((file, index) => `-i "${file}"`)
            .join(
                ' ',
            )} -filter_complex "${filterComplex} ${audioTransitions}" -map "[vout]" -map "[aout]" -c:v libx264 -crf 23 -preset fast -movflags +faststart "${output}"`;

        return finalCommand;
    } catch (error) {
        console.error('Failed to generate ffmpeg command:', error);
        throw error;
    }
}

async function blendVideos(videoPaths: string[], output: string, transition: TransitionType |TransitionWithDuration[], transitionDuration=0.5, callback: { (err: any, result: any): void; (arg0: ExecException, arg1: string): void; }) {
    try {
        const command = await generateFfmpegCommand(videoPaths, output, transition, transitionDuration);

        exec(command, async (error, stdout, stderr) => {

            if (error) {
                callback(error, null);
            } else {
                console.log('done');
                callback(null, output);
                return;
            }
        });
    } catch (error) {
        console.error('Failed to process videos:', error);
        if (callback) callback(error, null);
    }
}

export default blendVideos
