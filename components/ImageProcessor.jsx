import React, {
    useRef,
    useState,
    useImperativeHandle,
    forwardRef,
  } from "react";
  import FaExternalLinkAlt from "react-icons/fa";
  
  const bricks = {
    4159553: "#d9c58a", // Light khaki (Beige)
4211399: "#7f7f7f", // Gray (Medium Stone Grey)
302424: "#ffed02", // Yellow
4210719: "#7e7e7e", // Dark gray (Dark Stone Grey)
302426: "#000000", // Black (not in original list, added as closest match)
302401: "#ffffff", // White
6215606: "#a69579", // Taupe (Medium Nougat, closest match)
6252039: "#835138", // Brown (Transparent Brown)
6252040: "#ff9634", // Orange (Transparent Orange)
6252045: "#fffe88", // Pale yellow (Transparent Yellow)
6252042: "#ff2928", // Bright red (Transparent Red)
6096942: "#fc44bf", // Magenta
6231376: "#d0a7e3", // Lavender (Medium Lilac)
6258091: "#ff719d", // Pink (Coral)
4524929: "#ff9634", // Orange
6252043: "#90bbf7", // Light blue (Transparent Blue)
6058014: "#fffbe0", // Light yellow (Cool Yellow)
4621557: "#6cd554", // Bright green (Bright Yellowish Green)
6186012: "#ac603d", // Sienna (Dark Orange)
4539114: "#88323f", // Maroon (New Dark Red)
302428: "#506c9d", // Steel blue (Dark Green, color mismatch)
4619521: "#feb5f0", // Light pink (Medium Lavender)
6055169: "#7a803a", // Olive green (Earth Green)
6073040: "#ffbf31", // Gold (Flame Yellowish Orange)
6330584: "#9c734f", // Tan (Nougat)
6213778: "#1fa6a0", // Teal (Bright Blugreen)
4184108: "#506c9d", // Steel blue (Earth Blue)
4549436: "#e79f71", // Light orange (Sand Yellow)
6194729: "#503b16", // Dark brown
6069887: "#ffbf31", // Gold (Warm Gold)
6184484: "#71bddc", // Light sky blue (Light Royal Blue)
4221744: "#835138", // Brown (Reddish Brown)
302421: "#ff2928", // Bright red
6252044: "#3f99cc", // Medium blue (Transparent Dark Blue)
6217797: "#ff719d", // Pink
6252046: "#38c764", // Medium green (Transparent Green)
6099189: "#d8f9f0", // Mint (Sand Green, color mismatch)
6031883: "#feb5f0", // Light pink (Light Rose)
6357797: "#ffddb9", // Peach (Light Nougat)
6401817: "#b9e74f", // Lime green (Bright Green)
302423: "#4d95fb", // Sky blue (Blue)
  };
  
  const ImageProcessor = forwardRef(
    ({ imageProcessorRef, selectedNftImage }, ref) => {
      const imageInputRef = useRef(null);
      const pixelArtCanvasRef = useRef(null);
      const scaledCanvasRef = useRef(null);
      const thumbnailCanvasRef = useRef(null);
      const legoBoardColorButtonRef = useRef(null);
      const colorKeyDivRef = useRef(null);
      const instructionsDivRef = useRef(null);
      const heightInputRef = useRef(null);
      const widthInputRef = useRef(null);
      const piecesCountRef = useRef(null);
      const generateButtonSpinnerRef = useRef(null);
      const generateButtonTextRef = useRef(null);
      const mosaicTitleRef = useRef(null);
  
      const [customWidth, setCustomWidth] = useState(32);
      const [customHeight, setCustomHeight] = useState(32);
      const [customColor, setCustomColor] = useState("white");
      const [layers, setLayers] = useState(1);
      const [instructionsGenerated, setInstructionsGenerated] = useState(false);
  
      useImperativeHandle(ref, () => ({
        processImage: handleImageUpload,
      }));
  
      function getBrickLink(uuid) {
        let url = `https://www.lego.com/en-gb/pick-and-build/pick-a-brick?query=${uuid}`;
        return url;
      }
  
      const handleHeightWidthChange = () => {
        const pixelArtCanvas = pixelArtCanvasRef.current;
        const heightInput = heightInputRef.current;
        const widthInput = widthInputRef.current;
  
        if (pixelArtCanvas && heightInput && widthInput) {
          pixelArtCanvas.classList.remove(`b-${customWidth}x${customHeight}`);
          setCustomHeight(parseInt(heightInput.value));
          setCustomWidth(parseInt(widthInput.value));
          pixelArtCanvas.classList.add(
            `b-${widthInput.value}x${heightInput.value}`,
          );
        }
      };
  
      const setBoardColor = () => {
        const dropdownItems = document.querySelectorAll(".dropdown-item");
        dropdownItems.forEach((item) => {
          item.classList.remove("active");
          item.removeAttribute("aria-current");
        });
  
        const clickedButton = document.querySelector(
          `.dropdown-item[data-color="${color}"]`,
        );
        clickedButton?.classList.add("active");
        clickedButton?.setAttribute("aria-current", "true");
  
        const pixelArtCanvas = pixelArtCanvasRef.current;
        const legoBoardColorButton = legoBoardColorButtonRef.current;
  
        if (pixelArtCanvas && legoBoardColorButton) {
          pixelArtCanvas.classList.remove(`b-${customColor}`);
          setCustomColor(color);
          pixelArtCanvas.classList.add(`b-${color}`);
          const buttonTextColor = color === "white" ? "t-black" : "t-white";
          legoBoardColorButton.className = `btn btn-secondary dropdown-toggle pt-sans bg-${color} ${buttonTextColor}`;
        }
      };
  
      const downloadImage = async (url) => {
        const ipfsGatewayUrl = url.replace("ipfs://", "https://ipfs.io/ipfs/");
        const response = await fetch(ipfsGatewayUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = (error) => reject(error);
          image.src = URL.createObjectURL(blob);
        });
      };
  
      const handleImageUpload = async () => {
        const generateButtonSpinner = generateButtonSpinnerRef.current;
        const generateButtonText = generateButtonTextRef.current;
  
        if (generateButtonSpinner && generateButtonText) {
          generateButtonSpinner.classList.remove("d-none");
          generateButtonSpinner.classList.add("d-block");
          generateButtonText.innerText = "Loading..";
  
          try {
            if (selectedNftImage && selectedNftImage.raw.length > 0) {
              const ipfsGatewayUrl = selectedNftImage.raw;
              const image = await downloadImage(ipfsGatewayUrl);
              await processImage();
              setInstructionsGenerated(true);
              return pixelArtCanvasRef.current;
            } else {
              console.error("Invalid selectedNftImage object");
              return null;
            }
          } catch (ex) {
            console.error(`Something went wrong during processImage(): ${ex}`);
            return null;
          } finally {
            generateButtonSpinner.classList.remove("d-block");
            generateButtonSpinner.classList.add("d-none");
            generateButtonText.innerText = "Generate Instructions";
          }
        }
      };
  
      const processImage = (image) => {
        return new Promise((resolve, reject) => {
          const imageInput = imageInputRef.current;
          const pixelArtCanvas = pixelArtCanvasRef.current;
          const scaledCanvas = scaledCanvasRef.current;
          const thumbnailCanvas = thumbnailCanvasRef.current;
  
          if (pixelArtCanvas && scaledCanvas && thumbnailCanvas) {
            const file = imageInput?.files ? imageInput.files[0] : null;
            const imageUrl =
              selectedNftImage.raw?.replace("ipfs://", "https://ipfs.io/ipfs/") ||
              (file ? URL.createObjectURL(file) : null);
  
            if (imageUrl) {
              const heightPixels = 27 * customHeight;
              const widthPixels = 27 * customWidth;
  
              pixelArtCanvas.width = widthPixels;
              pixelArtCanvas.height = heightPixels;
  
              scaledCanvas.height = customHeight;
              scaledCanvas.width = customWidth;
  
              const img = new Image();
              img.crossOrigin = "Anonymous"; // Add this line
              img.onload = () => {
                const scaleFactor = Math.max(
                  widthPixels / img.width,
                  heightPixels / img.height,
                );
                const scaledWidth = img.width * scaleFactor;
                const scaledHeight = img.height * scaleFactor;
  
                thumbnailCanvas.width = scaledWidth;
                thumbnailCanvas.height = scaledHeight;
  
                const scaledCtx = scaledCanvas.getContext("2d");
                const pixelArtCtx = pixelArtCanvas.getContext("2d");
                const thumbnailCtx = thumbnailCanvas.getContext("2d");
  
                if (scaledCtx && pixelArtCtx && thumbnailCtx) {
                  scaledCtx.clearRect(
                    0,
                    0,
                    scaledCanvas.width,
                    scaledCanvas.height,
                  );
                  pixelArtCtx.clearRect(
                    0,
                    0,
                    pixelArtCanvas.width,
                    pixelArtCanvas.height,
                  );
                  thumbnailCtx.clearRect(
                    0,
                    0,
                    thumbnailCanvas.width,
                    thumbnailCanvas.height,
                  );
  
                  scaledCtx.drawImage(
                    img,
                    0,
                    0,
                    img.width,
                    img.height,
                    0,
                    0,
                    customWidth,
                    customHeight,
                  );
                  thumbnailCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
  
                  drawPixelArt(customWidth, customHeight, pixelArtCtx, scaledCtx);
                  resolve();
                }
              };
              img.src = imageUrl;
            } else {
              reject(new Error("No image selected"));
            }
          } else {
            reject(new Error("Required elements not found"));
          }
        });
      };
  
      const drawPixelArt = (width, height, pixelArtCtx, scaledCtx) => {
        const circleRadius = 13.5;
        const colorKey = {};
        const colorKeyCount = {};
        let colorNumber = 1;
        const colorKeyDiv = colorKeyDivRef.current;
  
        if (colorKeyDiv) {
          pixelArtCtx.clearRect(0, 0, width, height);
          const canvas = pixelArtCanvasRef.current;
          colorKeyDiv.innerHTML = "";
  
          for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
              const pixelRGBA = getPixelColor(x, y, scaledCtx);
              if (pixelRGBA.a !== 0) {
                const closestColorKey = findClosestColor(
                  pixelRGBA.r,
                  pixelRGBA.g,
                  pixelRGBA.b,
                );
                const pixelColor = hexToRgb(bricks[closestColorKey]);
  
                let key = findColorKey(colorKey, pixelColor);
                if (key === null) {
                  key = `color_${colorNumber}`;
                  colorKey[key] = pixelColor;
                  colorKeyCount[key] = 1;
                  colorNumber++;
                } else {
                  colorKeyCount[key]++;
                }
  
                const color = colorKey[key];
                const label = key.split("_")[1];
  
                drawNumberedCircle(
                  x * (circleRadius * 2),
                  y * (circleRadius * 2),
                  circleRadius,
                  color,
                  label,
                  pixelArtCtx,
                );
              }
            }
          }
  
          applyLayerAdjustment(colorKeyCount);
  
          let colorKeyTable = "<table>";
          let count = 0;
          let piecesCountTotal = 0;
  
          Object.entries(colorKey).forEach(([key, pixelColor]) => {
            let hexColor = rgbToHex(pixelColor.r, pixelColor.g, pixelColor.b);
            let label = key.split("_")[1];
            let brickCount = colorKeyCount[key];
            piecesCountTotal += brickCount;
  
            if (count % 5 === 0) {
              colorKeyTable += "<tr>";
            }
  
            let uuid = reverseLookup(hexColor, bricks);
  
            colorKeyTable += `<td class="mr-2">${label}: <a target="_blank" rel="noopener noreferrer" href="${getBrickLink(uuid)}">${uuid}</a><FaExternalLinkAlt /><span>x ${brickCount}</span></td>`;
          });
  
          piecesCountRef.current.textContent = piecesCountTotal;
          colorKeyTable += "</table>";
          colorKeyDiv.innerHTML = colorKeyTable;
        }
      };
  
      const applyLayerAdjustment = (colorKeyCount) => {
        const sortedColorKeyCount = Object.entries(colorKeyCount).sort(
          (a, b) => b[1] - a[1]
        );
        
        const layerGroups = Array.from({ length: layers }, () => []);
        sortedColorKeyCount.forEach(([key, count], index) => {
          const groupIndex = Math.floor(index / Math.ceil(sortedColorKeyCount.length / layers));
          layerGroups[groupIndex].push([key, count]);
        });
      
        layerGroups.forEach((group, groupIndex) => {
          const multiplier = groupIndex + 1;
          group.forEach(([key, count]) => {
            colorKeyCount[key] = count * multiplier;
          });
        });
      };
  
      const getPixelColor = (x, y, ctx) => {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
      };
  
      function reverseLookup(hexColor, bricksObject) {
        for (const [id, color] of Object.entries(bricksObject)) {
          if (color === hexColor) {
            return id;
          }
        }
        return null; // Return null if no matching id is found
      }
  
      const findColorKey = (colorKey, color) => {
        for (const key in colorKey) {
          const pixelColor = colorKey[key];
          if (
            pixelColor.r === color.r &&
            pixelColor.g === color.g &&
            pixelColor.b === color.b
          ) {
            return key;
          }
        }
        return null;
      };
  
      const findClosestColor = (r, g, b) => {
        let minDistance = Number.MAX_VALUE;
        let closestColorKey = "";
        Object.keys(bricks).forEach((key) => {
          const rgb = hexToRgb(bricks[key]);
          const distance = Math.sqrt(
            (rgb.r - r) ** 2 + (rgb.g - g) ** 2 + (rgb.b - b) ** 2,
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestColorKey = key;
          }
        });
        return closestColorKey;
      };
  
      const drawNumberedCircle = (x, y, radius, color, label, ctx) => {
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#003300";
        ctx.stroke();
  
        ctx.fillStyle = "black";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x + radius, y + radius);
      };
  
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 0, g: 0, b: 0 };
      };
  
      const rgbToHex = (r, g, b) => {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      };
  
      const downloadCanvas = () => {
        const canvas = pixelArtCanvasRef.current;
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "mosaic.png";
        link.click();
      };
  
      return (
        <div>
          <h2>Mosaic Builder</h2>
          <div className="mb-3">
            <label htmlFor="widthInput" className="form-label">
              Width (in bricks)
            </label>
            <input
              type="number"
              className="form-control"
              id="widthInput"
              min="1"
              max="100"
              value={customWidth}
              onChange={handleHeightWidthChange}
              ref={widthInputRef}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="heightInput" className="form-label">
              Height (in bricks)
            </label>
            <input
              type="number"
              className="form-control"
              id="heightInput"
              min="1"
              max="100"
              value={customHeight}
              onChange={handleHeightWidthChange}
              ref={heightInputRef}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="layersInput" className="form-label">
              Layers
            </label>
            <input
              type="number"
              className="form-control"
              id="layersInput"
              min="1"
              max="5"
              value={layers}
              onChange={(e) => setLayers(parseInt(e.target.value))}
            />
          </div>
          <div></div>
          <button className="btn btn-primary"
          onClick={handleImageUpload}
          style={{ backgroundColor: 'black', color: 'white', borderRadius: '5px', padding: '10px 20px', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s ease' }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#333')}
          onMouseOut={(e) => (e.target.style.backgroundColor = 'black')}>
            <div
              ref={generateButtonSpinnerRef}
              className="d-none spinner-border spinner-border-sm text-light mr-2"
              role="status"
            ></div>
            <span ref={generateButtonTextRef}>Generate Instructions</span>
          </button>
          {instructionsGenerated && (
          <p>Open each link below and add correct amount to basket on Lego website. Don't forget to buy a backplate with the right size</p>
        )}
          <canvas ref={scaledCanvasRef} style={{ display: "none" }}></canvas>
          <canvas ref={thumbnailCanvasRef} style={{ display: "none" }}></canvas>
          <div ref={colorKeyDivRef} className="mt-3"></div>
          {instructionsGenerated && (
          <p>Total pieces count</p>
        )}<div ref={piecesCountRef} className="mt-3"></div>
          <canvas
            ref={pixelArtCanvasRef}
            className={`b-${customWidth}x${customHeight}`}
            style={{ width: "100%" }}
          ></canvas>
        {instructionsGenerated && (
  <>
    <button onClick={downloadCanvas} className="btn btn-primary"
      style={{ backgroundColor: 'black', color: 'white', borderRadius: '5px', padding: '10px 20px', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s ease' }}
      onMouseOver={(e) => (e.target.style.backgroundColor = '#333')}
      onMouseOut={(e) => (e.target.style.backgroundColor = 'black')}>
      Download Instructions
    </button>
    <button onClick={() => window.open('https://zora.co/collect/base:0xb47e183c43191eb7b88be8b237329bf98248dd50/1?referrer=0xA8F30Bd1165057F81C7b6629E2501e428f4691F2', '_blank')} className="btn btn-secondary"
      style={{ backgroundColor: 'black', color: 'white',marginLeft: "1%", borderRadius: '5px', padding: '10px 20px', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s ease' }}
      onMouseOver={(e) => (e.target.style.backgroundColor = '#333')}
      onMouseOut={(e) => (e.target.style.backgroundColor = 'black')}>
      Support creator
    </button>
  </>
)}
        </div>
      );
    },
  );
  
  export default ImageProcessor;