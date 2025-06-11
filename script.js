// DOM Elements
const arraySizeSlider = document.getElementById('array-size');
const speedSlider = document.getElementById('speed');
const algorithmSelect = document.getElementById('algorithm');
const generateArrayBtn = document.getElementById('generate-array');
const startSortingBtn = document.getElementById('start-sorting');
const visualizationContainer = document.getElementById('visualization');

// Configuration
const config = {
    minValue: 5,
    maxValue: 100,
    defaultSize: 50,
    // Speed configuration (in milliseconds)
    speed: {
        min: 1,    // Fastest
        max: 100,  // Slowest
        default: 50,
        // Convert slider value to delay
        getDelay: (value) => {
            // Convert 1-100 to 1-1000ms, inverted (1 = fastest)
            return Math.floor(1000 - ((value - 1) * (999 / 99)));
        }
    }
};

// State
let array = [];
let isSorting = false;
let currentDelay = config.speed.getDelay(config.speed.default);

// Statistics tracking
const stats = {
    comparisons: 0,
    swaps: 0,
    reset() {
        this.comparisons = 0;
        this.swaps = 0;
        this.updateDisplay();
    },
    updateDisplay() {
        document.getElementById('comparisons').textContent = this.comparisons;
        document.getElementById('swaps').textContent = this.swaps;
    }
};

// Theme management
const theme = {
    isDark: false,
    toggle() {
        this.isDark = !this.isDark;
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    },
    init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.isDark = true;
            document.body.classList.add('dark-theme');
        }
    }
};

// Generate random number between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate new array with random values
function generateArray(size) {
    array = [];
    for (let i = 0; i < size; i++) {
        array.push(getRandomNumber(config.minValue, config.maxValue));
    }
    return array;
}

// Clear the visualization container
function clearVisualization() {
    visualizationContainer.innerHTML = '';
}

// Create a bar element
function createBar(value, index) {
    const bar = document.createElement('div');
    bar.className = 'array-bar';
    bar.style.height = `${value}%`;
    bar.setAttribute('data-value', value);
    bar.setAttribute('data-index', index);
    
    // Add tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = value;
    bar.appendChild(tooltip);
    
    return bar;
}

// Update bar height and value
function updateBar(index, value, maxValue) {
    const bars = visualizationContainer.children;
    if (bars[index]) {
        const scaledHeight = (value / maxValue) * 100;
        bars[index].style.height = `${scaledHeight}%`;
        bars[index].setAttribute('data-value', value);
    }
}

// Add visual classes to bars
function highlightBars(indices, className) {
    indices.forEach(index => {
        const bar = visualizationContainer.children[index];
        if (bar) {
            bar.classList.add(className);
        }
    });
}

// Remove visual classes from bars
function unhighlightBars(indices, className) {
    indices.forEach(index => {
        const bar = visualizationContainer.children[index];
        if (bar) {
            bar.classList.remove(className);
        }
    });
}

// Render the array as bars
function renderArray() {
    clearVisualization();
    
    // Calculate the maximum value for proper scaling
    const maxValue = Math.max(...array);
    
    array.forEach((value, index) => {
        // Scale the height to fit the container
        const scaledHeight = (value / maxValue) * 100;
        const bar = createBar(scaledHeight, index);
        visualizationContainer.appendChild(bar);
    });
}

// Sleep function for animations
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Update array size when slider changes
arraySizeSlider.addEventListener('input', () => {
    if (isSorting) {
        // Provide feedback that sort is in progress
        arraySizeSlider.classList.add('disabled');
        return;
    }
    
    const newSize = parseInt(arraySizeSlider.value);
    array = generateArray(newSize);
    renderArray();
});

// Update speed when slider changes
speedSlider.addEventListener('input', () => {
    const speedValue = parseInt(speedSlider.value);
    currentDelay = config.speed.getDelay(speedValue);
});

// Generate new array when button is clicked
generateArrayBtn.addEventListener('click', () => {
    if (isSorting) {
        // Provide feedback that sort is in progress
        generateArrayBtn.classList.add('disabled');
        return;
    }
    
    const size = parseInt(arraySizeSlider.value);
    array = generateArray(size);
    renderArray();
});

// Initialize the visualization
function init() {
    // Set initial values
    arraySizeSlider.value = config.defaultSize;
    speedSlider.value = config.speed.default;
    currentDelay = config.speed.getDelay(config.speed.default);
    
    // Generate and render initial array
    array = generateArray(config.defaultSize);
    renderArray();
    
    // Initialize UI
    initUI();
}

// Start the application
init();

// Control management functions
function disableControls() {
    startSortingBtn.disabled = true;
    generateArrayBtn.disabled = true;
    arraySizeSlider.disabled = true;
    speedSlider.disabled = true;
    algorithmSelect.disabled = true;
    
    // Add visual feedback
    startSortingBtn.classList.add('disabled');
    generateArrayBtn.classList.add('disabled');
}

function enableControls() {
    startSortingBtn.disabled = false;
    generateArrayBtn.disabled = false;
    arraySizeSlider.disabled = false;
    speedSlider.disabled = false;
    algorithmSelect.disabled = false;
    
    // Remove visual feedback
    startSortingBtn.classList.remove('disabled');
    generateArrayBtn.classList.remove('disabled');
}

// Enhanced Bubble Sort implementation
async function bubbleSort() {
    isSorting = true;
    disableControls();
    stats.reset();
    updateAlgorithmInfo('Bubble Sort', 'Starting...');
    
    const maxValue = Math.max(...array);
    const n = array.length;
    
    for (let i = 0; i < n - 1; i++) {
        updateAlgorithmInfo('Bubble Sort', `Pass ${i + 1}`);
        let swapped = false;
        
        // Highlight the unsorted portion
        for (let k = 0; k < n - i; k++) {
            highlightBars([k], 'comparing');
        }
        await sleep(currentDelay);
        
        for (let j = 0; j < n - i - 1; j++) {
            // Highlight the current pair being compared
            highlightBars([j, j + 1], 'swapping');
            await sleep(currentDelay);
            
            if (array[j] > array[j + 1]) {
                // Swap the elements
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                
                // Update bar heights
                updateBar(j, array[j], maxValue);
                updateBar(j + 1, array[j + 1], maxValue);
                
                swapped = true;
                await sleep(currentDelay);
            }
            
            // Remove swap highlighting
            unhighlightBars([j, j + 1], 'swapping');
        }
        
        // Mark the last element of this pass as sorted
        highlightBars([n - i - 1], 'sorted');
        await sleep(currentDelay);
        
        // Remove comparison highlighting from unsorted portion
        for (let k = 0; k < n - i - 1; k++) {
            unhighlightBars([k], 'comparing');
        }
        
        // If no swaps occurred, the array is sorted
        if (!swapped) {
            // Mark all remaining elements as sorted
            for (let k = 0; k < n - i - 1; k++) {
                highlightBars([k], 'sorted');
                await sleep(currentDelay / 2);
            }
            break;
        }
        
        // Add stats tracking:
        stats.comparisons++;
        stats.swaps++;
        stats.updateDisplay();
    }
    
    updateAlgorithmInfo('Bubble Sort', 'Completed');
    // Ensure all elements are marked as sorted
    for (let i = 0; i < n; i++) {
        highlightBars([i], 'sorted');
        await sleep(currentDelay / 2);
    }
    
    isSorting = false;
    enableControls();
}

// Quick Sort implementation
async function quickSort() {
    isSorting = true;
    disableControls();
    
    const maxValue = Math.max(...array);
    await quickSortHelper(0, array.length - 1, maxValue);
    
    // Mark all elements as sorted at the end
    for (let i = 0; i < array.length; i++) {
        highlightBars([i], 'sorted');
        await sleep(currentDelay / 2);
    }
    
    isSorting = false;
    enableControls();
}

async function quickSortHelper(low, high, maxValue) {
    if (low < high) {
        // Get the partition index
        const pivotIndex = await partition(low, high, maxValue);
        
        // Recursively sort the sub-arrays
        await quickSortHelper(low, pivotIndex - 1, maxValue);
        await quickSortHelper(pivotIndex + 1, high, maxValue);
    }
}

async function partition(low, high, maxValue) {
    // Choose the rightmost element as pivot
    const pivot = array[high];
    
    // Highlight the pivot
    highlightBars([high], 'swapping');
    await sleep(currentDelay);
    
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        // Highlight the current element being compared
        highlightBars([j], 'comparing');
        await sleep(currentDelay);
        
        if (array[j] <= pivot) {
            i++;
            
            // Highlight elements being swapped
            highlightBars([i, j], 'swapping');
            await sleep(currentDelay);
            
            // Swap elements
            [array[i], array[j]] = [array[j], array[i]];
            
            // Update bar heights
            updateBar(i, array[i], maxValue);
            updateBar(j, array[j], maxValue);
            
            await sleep(currentDelay);
            
            // Remove swap highlighting
            unhighlightBars([i, j], 'swapping');
        }
        
        // Remove comparison highlighting
        unhighlightBars([j], 'comparing');
    }
    
    // Place pivot in its correct position
    highlightBars([i + 1, high], 'swapping');
    await sleep(currentDelay);
    
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    
    // Update bar heights
    updateBar(i + 1, array[i + 1], maxValue);
    updateBar(high, array[high], maxValue);
    
    await sleep(currentDelay);
    
    // Remove all highlighting
    unhighlightBars([i + 1, high], 'swapping');
    unhighlightBars([high], 'swapping');
    
    // Mark the pivot as sorted
    highlightBars([i + 1], 'sorted');
    
    return i + 1;
}

// Merge Sort implementation
async function mergeSort() {
    isSorting = true;
    disableControls();
    
    const maxValue = Math.max(...array);
    await mergeSortHelper(0, array.length - 1, maxValue);
    
    // Mark all elements as sorted at the end
    for (let i = 0; i < array.length; i++) {
        highlightBars([i], 'sorted');
        await sleep(currentDelay / 2);
    }
    
    isSorting = false;
    enableControls();
}

async function mergeSortHelper(left, right, maxValue) {
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        // Highlight the current subarray being divided
        for (let i = left; i <= right; i++) {
            highlightBars([i], 'comparing');
        }
        await sleep(currentDelay);
        
        // Recursively sort the two halves
        await mergeSortHelper(left, mid, maxValue);
        await mergeSortHelper(mid + 1, right, maxValue);
        
        // Merge the sorted halves
        await merge(left, mid, right, maxValue);
        
        // Remove highlighting
        for (let i = left; i <= right; i++) {
            unhighlightBars([i], 'comparing');
        }
    }
}

async function merge(left, mid, right, maxValue) {
    // Create temporary arrays
    const leftArray = array.slice(left, mid + 1);
    const rightArray = array.slice(mid + 1, right + 1);
    
    let i = 0; // Index for leftArray
    let j = 0; // Index for rightArray
    let k = left; // Index for merged array
    
    // Highlight the subarrays being merged
    for (let x = left; x <= right; x++) {
        highlightBars([x], 'comparing');
    }
    await sleep(currentDelay);
    
    // Merge the temporary arrays
    while (i < leftArray.length && j < rightArray.length) {
        // Highlight elements being compared
        highlightBars([k], 'swapping');
        await sleep(currentDelay);
        
        if (leftArray[i] <= rightArray[j]) {
            array[k] = leftArray[i];
            i++;
        } else {
            array[k] = rightArray[j];
            j++;
        }
        
        // Update bar height
        updateBar(k, array[k], maxValue);
        await sleep(currentDelay);
        
        // Remove swap highlighting
        unhighlightBars([k], 'swapping');
        k++;
    }
    
    // Copy remaining elements of leftArray
    while (i < leftArray.length) {
        highlightBars([k], 'swapping');
        await sleep(currentDelay);
        
        array[k] = leftArray[i];
        updateBar(k, array[k], maxValue);
        
        unhighlightBars([k], 'swapping');
        i++;
        k++;
    }
    
    // Copy remaining elements of rightArray
    while (j < rightArray.length) {
        highlightBars([k], 'swapping');
        await sleep(currentDelay);
        
        array[k] = rightArray[j];
        updateBar(k, array[k], maxValue);
        
        unhighlightBars([k], 'swapping');
        j++;
        k++;
    }
    
    // Remove comparison highlighting
    for (let x = left; x <= right; x++) {
        unhighlightBars([x], 'comparing');
    }
}

// Insertion Sort implementation
async function insertionSort() {
    isSorting = true;
    disableControls();
    
    const maxValue = Math.max(...array);
    const n = array.length;
    
    // Mark first element as sorted
    highlightBars([0], 'sorted');
    await sleep(currentDelay);
    
    for (let i = 1; i < n; i++) {
        // Highlight current element being inserted
        highlightBars([i], 'swapping');
        await sleep(currentDelay);
        
        const current = array[i];
        let j = i - 1;
        
        // Highlight the sorted portion
        for (let k = 0; k < i; k++) {
            highlightBars([k], 'comparing');
        }
        await sleep(currentDelay);
        
        // Find the correct position for current element
        while (j >= 0 && array[j] > current) {
            // Highlight elements being compared
            highlightBars([j, j + 1], 'comparing');
            await sleep(currentDelay);
            
            // Shift element to the right
            array[j + 1] = array[j];
            updateBar(j + 1, array[j + 1], maxValue);
            
            // Remove comparison highlighting
            unhighlightBars([j, j + 1], 'comparing');
            
            j--;
        }
        
        // Place current element in its correct position
        array[j + 1] = current;
        updateBar(j + 1, current, maxValue);
        
        // Remove all highlighting from sorted portion
        for (let k = 0; k <= i; k++) {
            unhighlightBars([k], 'comparing');
        }
        
        // Mark the newly inserted element as sorted
        highlightBars([j + 1], 'sorted');
        await sleep(currentDelay);
    }
    
    // Mark all elements as sorted at the end
    for (let i = 0; i < n; i++) {
        highlightBars([i], 'sorted');
        await sleep(currentDelay / 2);
    }
    
    isSorting = false;
    enableControls();
}

// Selection Sort implementation
async function selectionSort() {
    isSorting = true;
    disableControls();
    
    const maxValue = Math.max(...array);
    const n = array.length;
    
    for (let i = 0; i < n - 1; i++) {
        // Highlight the sorted portion
        for (let k = 0; k < i; k++) {
            highlightBars([k], 'sorted');
        }
        
        // Find the minimum element in the unsorted portion
        let minIndex = i;
        
        // Highlight the current minimum
        highlightBars([minIndex], 'swapping');
        await sleep(currentDelay);
        
        // Highlight the unsorted portion
        for (let k = i; k < n; k++) {
            highlightBars([k], 'comparing');
        }
        await sleep(currentDelay);
        
        for (let j = i + 1; j < n; j++) {
            // Compare current element with minimum
            highlightBars([j], 'swapping');
            await sleep(currentDelay);
            
            if (array[j] < array[minIndex]) {
                // Remove highlighting from old minimum
                unhighlightBars([minIndex], 'swapping');
                minIndex = j;
            } else {
                // Remove highlighting from compared element
                unhighlightBars([j], 'swapping');
            }
        }
        
        // Remove highlighting from unsorted portion
        for (let k = i; k < n; k++) {
            unhighlightBars([k], 'comparing');
        }
        
        // If minimum is not at the start of unsorted portion, swap
        if (minIndex !== i) {
            // Highlight elements being swapped
            highlightBars([i, minIndex], 'swapping');
            await sleep(currentDelay);
            
            // Swap elements
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            
            // Update bar heights
            updateBar(i, array[i], maxValue);
            updateBar(minIndex, array[minIndex], maxValue);
            
            await sleep(currentDelay);
            
            // Remove swap highlighting
            unhighlightBars([i, minIndex], 'swapping');
        }
        
        // Mark the current element as sorted
        highlightBars([i], 'sorted');
        await sleep(currentDelay);
    }
    
    // Mark the last element as sorted
    highlightBars([n - 1], 'sorted');
    
    isSorting = false;
    enableControls();
}

// Heap Sort implementation
async function heapSort() {
    isSorting = true;
    disableControls();
    
    const maxValue = Math.max(...array);
    const n = array.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(n, i, maxValue);
    }
    
    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
        // Highlight root and last element
        highlightBars([0, i], 'swapping');
        await sleep(currentDelay);
        
        // Swap root with last element
        [array[0], array[i]] = [array[i], array[0]];
        
        // Update bar heights
        updateBar(0, array[0], maxValue);
        updateBar(i, array[i], maxValue);
        
        await sleep(currentDelay);
        
        // Mark the extracted element as sorted
        highlightBars([i], 'sorted');
        await sleep(currentDelay);
        
        // Remove swap highlighting
        unhighlightBars([0, i], 'swapping');
        
        // Heapify the reduced heap
        await heapify(i, 0, maxValue);
    }
    
    // Mark the last element as sorted
    highlightBars([0], 'sorted');
    
    isSorting = false;
    enableControls();
}

async function heapify(n, i, maxValue) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    // Highlight the current root and its children
    const nodesToHighlight = [i];
    if (left < n) nodesToHighlight.push(left);
    if (right < n) nodesToHighlight.push(right);
    
    highlightBars(nodesToHighlight, 'comparing');
    await sleep(currentDelay);
    
    // Find the largest among root, left child, and right child
    if (left < n && array[left] > array[largest]) {
        largest = left;
    }
    
    if (right < n && array[right] > array[largest]) {
        largest = right;
    }
    
    // If largest is not the root
    if (largest !== i) {
        // Highlight elements being swapped
        highlightBars([i, largest], 'swapping');
        await sleep(currentDelay);
        
        // Swap elements
        [array[i], array[largest]] = [array[largest], array[i]];
        
        // Update bar heights
        updateBar(i, array[i], maxValue);
        updateBar(largest, array[largest], maxValue);
        
        await sleep(currentDelay);
        
        // Remove swap highlighting
        unhighlightBars([i, largest], 'swapping');
        
        // Recursively heapify the affected sub-tree
        await heapify(n, largest, maxValue);
    }
    
    // Remove comparison highlighting
    unhighlightBars(nodesToHighlight, 'comparing');
}

// Start sorting when button is clicked
startSortingBtn.addEventListener('click', async () => {
    if (isSorting) {
        // Provide feedback that sort is in progress
        startSortingBtn.classList.add('sorting');
        startSortingBtn.textContent = 'Sorting...';
        return;
    }
    
    const algorithm = algorithmSelect.value;
    try {
        switch (algorithm) {
            case 'bubble':
                await bubbleSort();
                break;
            case 'quick':
                await quickSort();
                break;
            case 'merge':
                await mergeSort();
                break;
            case 'insertion':
                await insertionSort();
                break;
            case 'selection':
                await selectionSort();
                break;
            case 'heap':
                await heapSort();
                break;
            default:
                console.error('Algorithm not implemented');
                return;
        }
    } catch (error) {
        console.error('Sorting error:', error);
    } finally {
        // Reset button state
        startSortingBtn.classList.remove('sorting');
        startSortingBtn.textContent = 'Start Sorting';
    }
});

// Add CSS for disabled state
const style = document.createElement('style');
style.textContent = `
    .disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .sorting {
        background-color: #4caf50;
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
    }
`;
document.head.appendChild(style);

// Add UI elements
function createUIElements() {
    // Create stats display
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    statsContainer.innerHTML = `
        <div class="stat">
            <span>Comparisons:</span>
            <span id="comparisons">0</span>
        </div>
        <div class="stat">
            <span>Swaps:</span>
            <span id="swaps">0</span>
        </div>
    `;
    
    // Create algorithm info display
    const algoInfo = document.createElement('div');
    algoInfo.className = 'algorithm-info';
    algoInfo.innerHTML = `
        <div class="current-algorithm">Algorithm: <span id="algo-name">-</span></div>
        <div class="current-step">Step: <span id="current-step">-</span></div>
    `;
    
    // Create theme toggle
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '🌙';
    themeToggle.title = 'Toggle theme';
    themeToggle.onclick = () => {
        theme.toggle();
        themeToggle.innerHTML = theme.isDark ? '☀️' : '🌙';
    };
    
    // Add elements to the page
    document.querySelector('.controls').prepend(statsContainer);
    document.querySelector('.controls').prepend(algoInfo);
    document.querySelector('.header').appendChild(themeToggle);
}

// Update algorithm info
function updateAlgorithmInfo(name, step) {
    document.getElementById('algo-name').textContent = name;
    document.getElementById('current-step').textContent = step;
}

// Add CSS for new UI elements
const additionalStyles = `
    .stats-container {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background: var(--card-background);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .stat {
        display: flex;
        gap: 0.5rem;
        font-weight: 500;
    }
    
    .algorithm-info {
        margin-bottom: 1rem;
        padding: 0.5rem;
        background: var(--card-background);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .current-algorithm, .current-step {
        margin: 0.25rem 0;
        font-weight: 500;
    }
    
    .theme-toggle {
        position: absolute;
        right: 1rem;
        top: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: background-color 0.2s;
    }
    
    .theme-toggle:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    
    .tooltip {
        position: absolute;
        top: -25px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--text-primary);
        color: var(--card-background);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.75rem;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
    }
    
    .array-bar:hover .tooltip {
        opacity: 1;
    }
    
    /* Dark theme */
    .dark-theme {
        --background-color: #1a1a1a;
        --card-background: #2d2d2d;
        --text-primary: #ffffff;
        --text-secondary: #b0b0b0;
        --bar-color: #4a90e2;
        --bar-comparing: #ff9800;
        --bar-swapping: #f44336;
        --bar-sorted: #4caf50;
    }
    
    .dark-theme .theme-toggle:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
`;

// Update the style element
style.textContent += additionalStyles;

// Initialize UI
function initUI() {
    createUIElements();
    theme.init();
    stats.reset();
} 