<script lang="ts">
    import {ImageCapture} from 'image-capture'
    import {onDestroy, onMount} from "svelte";
    import jsQR, {QRCode} from "jsqr";
    import type {NanoAddress} from "../machinery/models";
    import {tools} from "nanocurrency-web";
    import {clearSoftwareKeys, setSoftwareKeys} from "../machinery/SoftwareKeysState";
    import {back, navigationReload, pushToast} from "../machinery/eventListener";
    import Text from "./Text.svelte";
    import Seperator from "./Seperator.svelte";

    export let cameraGranted: boolean;
    export let scannedAddress: (address: NanoAddress) => void

    let videoPreview: MediaStream | undefined
    let showVideo: boolean = true

    const setCaptureKeys = () => {
        navigationReload({
            middleKey: {
                onClick: captureCameraImage,
                languageId: "softkey-capture-camera"
            },
        })
    }
    const setLoadingKeys = () => {
        navigationReload({
            middleKey: {
                onClick: async () => {},
                languageId: "softkey-capture-scanning"
            },
        })
    }

    const startRecording = async () => {
        try {
            videoPreview = await navigator.mediaDevices.getUserMedia({video: true})
            showVideo = true
            const video: HTMLVideoElement = document.querySelector('#video');
            video.srcObject = videoPreview
            await video.play()
            setCaptureKeys();
        } catch (error) {
            if(error.message === 'Permission denied') {
                cameraGranted = false;
                pushToast({languageId: 'no-camera-access', type: "warn"})
                setSoftwareKeys({
                    middleKey: {
                        languageId: "onboard-disclaimer-ok",
                        onClick: async () => {
                            back();
                        }
                    }
                })
            } else {
                back();
            }
        }
    }

    const stopRecording = () => {
        const tracks: MediaStreamTrack[] | undefined = videoPreview?.getVideoTracks()
        if (tracks) {
            tracks.forEach(track => {
                track.stop()
            })
        }
        clearSoftwareKeys();
    }

    const captureCameraImage = async () => {
        try {
            clearSoftwareKeys();
            pushToast({languageId: 'softkey-capture-scanning'})
            showVideo = false;
            const track = videoPreview.getVideoTracks()[0];
            let imageCapture = new ImageCapture(track);
            const frame = await imageCapture.grabFrame();
            const canvas: HTMLCanvasElement = document.querySelector('#canvas');

            // set canvas dimensions to video ones to not truncate picture
            canvas.width = frame.width;
            canvas.height = frame.height;

            // copy full video frame into the canvas
            let context = canvas.getContext('2d');
            context.drawImage(frame, 0, 0, frame.width, frame.height);
            const imageData: ImageData = context.getImageData(0, 0, frame.width, frame.height)
            await decodeImage(imageData)
            track.stop();
        } catch (e) {
            console.log(e)
        }
    }

    const decodeImage = async (imageData) => {
        try {
            const code: QRCode | null = jsQR(imageData.data, imageData.width, imageData.height);
            if (code && tools.validateAddress(code.data)) {
                stopRecording();
                scannedAddress(code.data)
                pushToast({languageId: 'address-scanned', type: 'success'})
            } else {
                pushToast({languageId: 'unable-to-scan'})
                setCaptureKeys();
                await startRecording();
            }
        } catch (e) {
            console.log(e)
        }
    }

    onMount(async () => {
        setTimeout(async () => await startRecording(), 200);
    })

    onDestroy(() => {
        stopRecording();
    })
</script>

<style>
    .video-el {
        width: 100%;
        height: auto;
    }
</style>
{#if !cameraGranted}
    <Seperator languageId="no-camera-access"/>
    <Text languageId="grant-camera-access"/>
{:else}
    <canvas id="canvas" height={0} width={0} hidden={showVideo} class="video-el"></canvas>
    <video id="video" autoplay hidden={!showVideo} class="video-el"></video>
{/if}
