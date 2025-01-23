document.addEventListener('DOMContentLoaded', () => {
    const originalCanvas = document.getElementById('originalCanvas');
    const transformedCanvas = document.getElementById('transformedCanvas');
    const transformButton = document.getElementById('transformButton');
    const matrixInputs = {
        m11: document.getElementById('m11'),
        m12: document.getElementById('m12'),
        m21: document.getElementById('m21'),
        m22: document.getElementById('m22')
    };

    const originalCtx = originalCanvas.getContext('2d');
    const transformedCtx = transformedCanvas.getContext('2d');

    const img = new Image();
    img.src = 'furret.jpg'; // Make sure 'furret.jpg' is in the same folder
    img.onload = () => {
        drawOriginalImage(originalCtx, img);
        transformButton.addEventListener('click', () => {
            drawTransformedImage(transformedCtx, img, getMatrixFromInput());
        });
        drawTransformedImage(transformedCtx, img, getMatrixFromInput()); // Initial load
    };

    function getMatrixFromInput() {
        return [
            [parseFloat(matrixInputs.m11.value), parseFloat(matrixInputs.m12.value)],
            [parseFloat(matrixInputs.m21.value), parseFloat(matrixInputs.m22.value)],
        ];
    }

    function drawAxes(ctx, canvasWidth, canvasHeight) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        // x-axis
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight / 2);
        ctx.lineTo(canvasWidth, canvasHeight / 2);
        ctx.stroke();

        // y-axis
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, 0);
        ctx.lineTo(canvasWidth / 2, canvasHeight);
        ctx.stroke();

        // Origin label
        ctx.font = '10px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText('Origin', canvasWidth / 2 + 2, canvasHeight / 2 + 12);
        ctx.fillText('x', canvasWidth - 10, canvasHeight / 2 + 10);
        ctx.fillText('y', canvasWidth - 10, canvasHeight / 2 + 10);
    }

    function drawOriginalImage(ctx, img) {
        const canvasWidth = originalCanvas.width;
        const canvasHeight = originalCanvas.height;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear previous drawing
        drawAxes(ctx, canvasWidth, canvasHeight);

        // Center the image on the canvas
        const imgWidth = Math.min(img.width, canvasWidth * 0.8); // Scale down if too large
        const imgHeight = Math.min(img.height, canvasHeight * 0.8);
        const drawX = (canvasWidth - imgWidth) / 2;
        const drawY = (canvasHeight - imgHeight) / 2;

        ctx.drawImage(img, drawX, drawY, imgWidth, imgHeight);
    }


    function drawTransformedImage(ctx, img, matrix) {
        const canvasWidth = transformedCanvas.width;
        const canvasHeight = transformedCanvas.height;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear previous drawing
        drawAxes(ctx, canvasWidth, canvasHeight);

        const imgData = getImageData(originalCanvas, img);
        console.log("ImageData:", imgData); // *** ADDED LOGGING ***

        if (!imgData) {
            console.error("Could not get image data from original canvas.");
            return;
        }

        const transformedImgData = ctx.createImageData(canvasWidth, canvasHeight);

        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                const originalPixel = getPixel(imgData, x, y, originalCanvas.width);
                if (originalPixel) { // Only transform if there's a pixel in the original image area
                    const transformedPoint = transformPoint(x - canvasWidth / 2, canvasHeight / 2 - y, matrix); // Convert to cartesian, transform, convert back
                    const transformedX = Math.round(transformedPoint[0] + canvasWidth / 2);
                    const transformedY = Math.round(canvasHeight / 2 - transformedPoint[1]);

                    console.log(`Original Pixel (${x}, ${y}), Transformed Point: (${transformedPoint[0]}, ${transformedPoint[1]}), Transformed Pixel: (${transformedX}, ${transformedY})`); // *** ADDED LOGGING ***


                    if (transformedX >= 0 && transformedX < canvasWidth && transformedY >= 0 && transformedY < canvasHeight) {
                        setPixel(transformedImgData, transformedX, transformedY, originalPixel.r, originalPixel.g, originalPixel.b, originalPixel.a);
                    } else {
                        console.log(`Transformed pixel (${transformedX}, ${transformedY}) out of bounds.`); // *** ADDED LOGGING ***
                    }
                }
            }
        }
        ctx.putImageData(transformedImgData, 0, 0);
    }


    function getImageData(canvas, img) {
        const ctx = canvas.getContext('2d');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        try {
            const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
            return imageData;
        } catch (e) {
            console.error("Error getting ImageData:", e); // *** ADDED LOGGING ***
            return null;
        }
    }


    function getPixel(imageData, x, y, canvasWidth) {
        if (x < 0 || x >= canvasWidth || y < 0 || y >= imageData.height) {
            return null; // Out of bounds
        }
        const index = (y * canvasWidth + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3],
        };
    }

    function setPixel(imageData, x, y, r, g, b, a) {
        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    }


    function transformPoint(x, y, matrix) {
        // Matrix multiplication: [a b] [x] = [ax + by]
        //                      [c d] [y] = [cx + dy]
        const newX = matrix[0][0] * x + matrix[0][1] * y;
        const newY = matrix[1][0] * y + matrix[1][1] * y;
        return [newX, newY];
    }
});