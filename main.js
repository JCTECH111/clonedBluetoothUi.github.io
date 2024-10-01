const progressRing = document.querySelector('.progress-ring');
const dot = document.getElementById('dot'); // Select the dot element
const percentageDisplay = document.getElementById('percentage'); // Select the percentage display
let progress = 75; // Initial progress percentage
let isDragging = false; // Flag to check if dragging is in progress

// Function to update the progress
function updateProgress(angle) {
    let angleFrom = angle + 90
    // Calculate the new progress based on the angle
    progress = Math.round((angleFrom / 360) * 100);
    // Limit progress to between 0 and 100
    progress = Math.max(0, Math.min(100, progress));

    // Update the CSS variable
    progressRing.style.setProperty('--progress', `${progress}%`);

    // Update the percentage display
    percentageDisplay.textContent = `${progress}%`; // Update displayed percentage

    // Calculate the new position of the dot
    updateDotPosition(angle);
}

// Function to update the position of the dot
function updateDotPosition(angle) {
    const radius = 90; // Radius for dot positioning
    const circleSize = parseFloat(getComputedStyle(progressRing).width);
    const centerX = circleSize / 3; // Center X of the circle
    const centerY = circleSize / 3; // Center Y of the circle

   // Adjust angle by subtracting 90 degrees to align correctly
   const adjustedAngle = angle;

   // Calculate the new position using trigonometry
   const x = centerX + radius * Math.cos(adjustedAngle * (Math.PI / 180));
   const y = centerY + radius * Math.sin(adjustedAngle * (Math.PI / 180));

    // Update the position of the dot
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    
    console.log(`Dot Position - X: ${x}, Y: ${y}`); // Log the dot's position
    console.log(angle)
}

// Function to get the angle based on mouse position
function getAngle(event) {
    const rect = progressRing.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2; // X coordinate of the center
    const centerY = rect.top + rect.height / 2; // Y coordinate of the center
    const mouseX = event.clientX; // Mouse X coordinate
    const mouseY = event.clientY; // Mouse Y coordinate
    
    // Calculate the angle in radians and convert to degrees
    let angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
    
    // Normalize the angle to be between 0 and 360 degrees
    angle = (angle + 360) % 360; // This ensures the angle is within the correct range
    
    console.log(`${angle} get angle`)
    return angle;
}




// Event listeners for mouse down, move, and up
progressRing.addEventListener('mousedown', (event) => {
    isDragging = true;
    const angle = getAngle(event);
    updateProgress(angle);
    
});

document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const angle = getAngle(event);
        updateProgress(angle);
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Optional: Add touch event support for mobile devices
progressRing.addEventListener('touchstart', (event) => {
    isDragging = true;
    const angle = getAngle(event.touches[0]);
    updateProgress(angle);
});

document.addEventListener('touchmove', (event) => {
    if (isDragging) {
        const angle = getAngle(event.touches[0]);
        updateProgress(angle);
    }
});

document.addEventListener('touchend', () => {
    isDragging = false;
});
