var cells;
let row, col;
var matrix;
let source_Cordinate;
let target_Cordinate;
const board  = document.querySelector("#board");

renderBoard();

/**
 * Renders a grid-based board on the webpage with the specified cell width.
 * 
 * The function calculates the number of rows and columns based on the board's dimensions
 * and the provided cell width. It creates a grid of cells, appending them to the board element.
 * It also updates a CSS variable for cell width, initializes coordinates for source and target
 * positions, and attaches event listeners to the cells for user interactions.
 * 
 * @param {number} [cellWidth=22] - The width of each cell in pixels. Defaults to 22 if not provided.
 * 
 * This function performs the following tasks:
 * - Clears the board element's previous content to prevent appending to an existing grid.
 * - Calculates the number of rows and columns based on the board's height and width divided by
 *   the cell width.
 * - Sets a CSS variable for cell width to adjust the styling of the grid.
 * - Generates the grid structure by creating row and column elements, setting their IDs, and
 *   appending them to the board.
 * - Initializes the `cells` array to store references to each cell element.
 * - Initializes the `matrix` array to store the grid structure for easier manipulation.
 * - Sets the source and target coordinates by calling the `set` function with appropriate
 *   parameters.
 * - Logs the source and target coordinates for debugging purposes.
 * - Calls the `attachCellEventListeners` function to attach event listeners to each cell for
 *   handling user interactions like dragging and clicking.
 */
function renderBoard(cellWidth = 22){

    cells = [];
    matrix = [];

    row = Math.floor(board.clientHeight / cellWidth) ;
    col = Math.floor(board.clientWidth / cellWidth) ;
    
    const root = document.documentElement;
    root.style.setProperty('--cell-width', `${cellWidth}`);
    
    // To prevent appending previous board
    board.innerHTML ='';
    
    // Generate grid structure
    for (let r = 0 ; r < row ; r++ ) {
        const rowArr = [];
        const rowElement = document.createElement('div');
        rowElement.classList.add("row");
        rowElement.setAttribute('id',`${r}`); 

        for (let c = 0; c<col; c++) {   
            const colElement = document.createElement('div');
            colElement.classList.add("col");
            colElement.setAttribute('id',`${r}-${c}`);

            cells.push(colElement);
            rowArr.push(colElement); 
            rowElement.appendChild(colElement);
        }
        matrix.push(rowArr);
        board.appendChild(rowElement);
    }
    source_Cordinate = set('source');
    target_Cordinate = set('target');

    // Attach event listeners to each cell for user interactions
    attachCellEventListeners();
}

/**
 * Initializes event listeners for navigation menu options and handles the display of dropdown menus.
 * 
 * This code selects all navigation options from the menu and adds click event listeners to them.
 * When a navigation option is clicked:
 * - It toggles the 'active' class on the clicked item and deactivates other active items.
 * - If the item has a dropdown menu, it updates the `dropOptions` variable and calls the
 *   `toggle_dropOption` function to handle the dropdown menu's options.
 */
var dropOptions = null ;
const navOptions = document.querySelectorAll('.nav-menu>li>a');

navOptions.forEach(navOption =>{
    navOption.addEventListener('click' ,()=>{
        const li = navOption.parentElement;
        // Self toggle: if already active, deactivate
        if(li.classList.contains('active')){
            li.classList.remove('active');
            return;
        }
        // Deactivate all active elements before activating the clicked one
        removeActive(navOptions , true);
        li.classList.add('active');
        // If the list item has a dropdown, handle the dropdown
        if(li.classList.contains('drop-box')){
            dropOptions = li.querySelectorAll('.drop-menu>li');
            toggle_dropOption(navOption.innerText);
        }
    })
});


/**
 * Removes the 'active' class from a collection of elements or their parent elements.
 * @param {NodeListOf<Element>} elements - The elements from which to remove the 'active' class.
 * @param {boolean} parent - If true, the 'active' class will be removed from the parent elements.
 */
const removeActive = (elements , parent = false )=>{
    elements.forEach(element =>{
        if(parent) element = element.parentElement;
        element.classList.remove('active');
    });
}

let pixelSize = 22;
let speed = 'Fast';
let algorithm = 'BFS' ;
const visualizeBtn = document.getElementById("visualize");
/**
 * Handles click events on dropdown options and updates the application state based on the selection.
 * 
 * @param {string} target - The category of the dropdown ('pixel', 'speed', 'algorithms').
 * 
 * The function adds click event listeners to the dropdown options. When an option is clicked:
 * - It updates the state (e.g., `pixelSize`, `speed`, `algorithm`) based on the selected option.
 * - It calls `renderBoard` to update the board with the new pixel size if the 'pixel' option is selected.
 * - It updates the `visualizeBtn` text with the selected algorithm just taking only first word if the 'algorithms' option is selected.
 * - It deactivates the dropdown menu after a selection is made.
 */
function toggle_dropOption(target){
    dropOptions.forEach(dropOption=>{
        dropOption.addEventListener('click', ()=>{
            removeActive(dropOptions);
            dropOption.classList.add('active')

            if(target === 'pixel'){
                pixelSize = +dropOption.innerText.replace('px', '');
                renderBoard(pixelSize)
            }else if (target === 'speed'){
                speed = dropOption.innerText;
            }else if( target === 'algorithms'){
                algoFname =  dropOption.innerText.split(' ')[0];
                algorithm = algoFname;
                visualizeBtn.innerText = `Visualize ${algorithm}`;
            }
            removeActive(navOptions , true);
        });
    });
};

/**
 * Closes the dropdown menu if a click occurs outside of it.
 * 
 * @param {MouseEvent} e - The click event object.
 */
document.addEventListener('click' , (e)=>{

    const navMenu = document.querySelector(".nav-menu");

    if(!navMenu.contains(e.target)){
        removeActive(navOptions , true);
    }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// board interaction

/**
 * Checks if the given coordinates (x, y) are within the bounds of a specified grid size.
 *
 * @param {number} x - The x-coordinate to check.
 * @param {number} y - The y-coordinate to check.
 * @returns {boolean} True if both coordinates are within the grid bounds, false otherwise.
 */
function isValid(x , y){
    const isXValid = x >= 0 && x < row;
    const isYValid = y >= 0 && y < col;

    return isXValid && isYValid;
}

/**
 * Sets a class to an element in a matrix at provided coordinates,
 * or at random coordinates if provided ones are invalid.
 *
 * @param {string} className - The CSS class name to add.
 * @param {number} [x=-1] - Optional x-coordinate, defaults to -1 to indicate random placement.
 * @param {number} [y=-1] - Optional y-coordinate, defaults to -1 to indicate random placement.
 * @returns {Object} The coordinates {x, y} where the class was added.
 */
function set(className , x= -1 , y = -1){
    if(isValid(x,y)){
        matrix[x][y].classList.add(className);
    }else{
        x = Math.floor(Math.random() * row);
        y = Math.floor(Math.random() * col);
        matrix[x][y].classList.add(className);
    }
    return {x,y};
}

let isDrawing = false;
let isDragging = false;
let DragPoint = null;
/**
 * Attaches event listeners to each cell in the grid for interaction handling.
 * 
 * This function adds event listeners for pointer down, pointer move, and pointer up events 
 * to each cell in the grid. Depending on the event and the target cell, it:
 * - Allows the user to draw walls by holding and moving the pointer.
 * - Enables dragging and repositioning of the source or target points.
 * - Toggles wall status on click.
 */
function attachCellEventListeners() {

    cells.forEach((cell) => {
         /**
         * Handles the pointer down event.
         * 
         * @param {PointerEvent} e - The pointer down event object.
         * 
         * If the pointer is down on a cell with the 'source' or 'target' class, 
         * it sets the `DragPoint` to either 'source' or 'target' and enables dragging.
         * Otherwise, it enables drawing mode.
         */
        const pointerdown = (e)=> {
            if(e.target.classList.contains('source')) {
                DragPoint = 'source'
                isDragging = true;
            }else if(e.target.classList.contains('target')){
                DragPoint = 'target'
                isDragging = true;
            }
            else{
                isDrawing = true;
            }

        }

        /**
         * Handles the pointer move event.
         * 
         * @param {PointerEvent} e - The pointer move event object.
         * 
         * If drawing is enabled, it adds a 'wall' class to the target cell.
         * If dragging is enabled, it moves the source or target point to the new cell position
         * and updates the corresponding coordinates (`source_Cordinate` or `target_Cordinate`).
         */
        const pointermove = (e)=>{
            if(isDrawing){
                e.target.classList.add('wall');
            }else if(DragPoint && isDragging){
                // Sequance matters
                // 1
                cells.forEach(cell=>{
                    cell.classList.remove(`${DragPoint}`);
                });
                // 2
                e.target.classList.add(`${DragPoint}`);
                cordinate = e.target.id.split('-');
                if(DragPoint ==='source'){
                    source_Cordinate.x = +cordinate[0];
                    source_Cordinate.y = +cordinate[1];
                }else{
                    target_Cordinate.x = +cordinate[0];
                    target_Cordinate.y = +cordinate[1];
                }
            }
        }
        const pointerup = ()=>{
            isDrawing = false;
            isDragging = false;
            DragPoint = null;
        }
        cell.addEventListener('pointerdown', pointerdown);
        cell.addEventListener('pointermove', pointermove);
        cell.addEventListener('pointerup', pointerup);
        cell.addEventListener('click',()=>{
            cell.classList.toggle('wall');
        })
    });
}

/**
 * Clears the visualized path from the grid.
 * 
 * This function iterates over all cells in the grid and removes the 'visited' and 'path' 
 * classes from each cell. This effectively clears any visual representation of the path 
 * that was previously generated during the pathfinding process.
 */
const clearPath = ()=> {
    cells.forEach(cell=>{
        cell.classList.remove('visited');
        cell.classList.remove('path');
    })
}

/**
 * Clears all walls from the grid.
 * 
 * This function iterates over all cells in the grid and removes the 'wall' class from each cell.
 * This effectively clears any walls that were previously drawn by the user.
 */
const clearWall = ()=> {
    cells.forEach(cell=>{
        cell.classList.remove('wall');
    })
}

/**
 * Clears the entire grid, including the path, walls, and visited cells.
 * 
 * This function iterates over all cells in the grid and removes the 'visited', 'wall', and 'path' 
 * classes from each cell. This effectively resets the grid to its initial state.
 */
function clearBoard(){
    cells.forEach(cell =>{
        cell.classList.remove('visited');
        cell.classList.remove('wall');
        cell.classList.remove('path');
    })
}


///===============================================================================================================//
// Maze generation


/**
 * @constant {HTMLElement} clearBoardBtn - The button element that triggers the clearing of the entire grid.
 * @constant {HTMLElement} clearPathBrn - The button element that triggers the clearing of paths within the grid.
 * @constant {HTMLElement} generateMazeBtn - The button element that triggers maze generation.
 * @constant {Array} wallToAnimate - An array that stores grid cells that will be animated as walls 
 *                                   during maze generation.
 * @event clearPathBrn#click  
 * @event clearBoardBtn#click  
 * @event generateMazeBtn#click  
 * 
 */
var wallToAnimate;
const clearPathBrn = document.getElementById('clearPath');
const clearBoardBtn = document.getElementById('clearBoard');
const generateMazeBtn = document.getElementById('generateMazeBtn');


clearPathBrn.addEventListener('click',clearPath);
clearBoardBtn.addEventListener('click' , clearBoard);

generateMazeBtn.addEventListener('click', ()=>{

    wallToAnimate = [];
    generateMaze(0, row-1 , 0, col-1, false, 'horizontal');  
    animate(wallToAnimate, 'wall');
   
});

/**
 * Recursively generates a maze within the given grid boundaries using a randomized 
 * recursive division algorithm.
 * 
 * This function is responsible for generating a maze within a specified section of the grid 
 * by recursively dividing the grid into smaller sections and placing walls. The maze generation 
 * process follows an orientation-based strategy, either horizontal or vertical, to determine the 
 * direction in which walls are added in each recursive step.
 * 
 * @param {number} rowStart - The starting row index for the current sub-grid.
 * @param {number} rowEnd - The ending row index for the current sub-grid.
 * @param {number} colStart - The starting column index for the current sub-grid.
 * @param {number} colEnd - The ending column index for the current sub-grid.
 * @param {boolean} surroundingWall - A flag indicating whether the boundary walls around 
 *                                    the entire grid have already been drawn. Set to `true` 
 *                                    after the boundary walls are drawn for the first time.
 * @param {string} orientation - The orientation of the wall to be added in the current 
 *                               step. Can be either 'horizontal' or 'vertical'. This determines 
 *                               whether the maze division occurs by adding a horizontal or vertical 
 *                               wall in the current section.
 * 
 * The function works as follows:
 * 
 * 1. **Base Case**: If the start indices exceed the end indices (i.e., `rowStart > rowEnd` or 
 *    `colStart > colEnd`), the function terminates, as there's no valid section to divide further.
 * 
 * 2. **Boundary Walls**: If `surroundingWall` is `false`, the function first draws the boundary 
 *    walls around the entire grid. This ensures that the maze is enclosed within walls. It checks 
 *    each cell in the top, bottom, left, and right boundaries of the grid, adding a wall unless the 
 *    cell is marked as a 'source' or 'target'.
 * 
 * 3. **Orientation-Based Division**: Depending on the value of `orientation`, the grid is divided 
 *    either horizontally or vertically:
 *    
 *    - **Horizontal Division**: 
 *        - The function identifies possible rows where a horizontal wall can be placed. 
 *        - It randomly selects a row to place the wall and a column to leave open as a passage.
 *        - The wall is added by iterating through the columns in the selected row, skipping the 
 *          passage column and any cells marked as 'source' or 'target'.
 *        - The grid is then divided into two smaller sections above and below the newly added wall, 
 *          and the `generateMaze` function is recursively called on these sections.
 * 
 *    - **Vertical Division**: 
 *        - The function identifies possible columns where a vertical wall can be placed.
 *        - It randomly selects a column to place the wall and a row to leave open as a passage.
 *        - The wall is added by iterating through the rows in the selected column, skipping the 
 *          passage row and any cells marked as 'source' or 'target'.
 *        - The grid is then divided into two smaller sections to the left and right of the newly added 
 *          wall, and the `generateMaze` function is recursively called on these sections.
 * 
 * The function continues to subdivide the grid and add walls recursively until the entire grid is 
 * filled with a maze structure, respecting the grid boundaries and source/target cells.
 * 
 * @note
 * - The algorithm assumes that the `matrix` variable represents the grid, where each cell is an 
 *   element in a 2D array of HTML elements.
 * - The `wallToAnimate` array stores cells that will be animated as walls during the visualization.
 * - The function also assumes the presence of a `clearBoard` function to reset the grid before 
 *   starting the maze generation.
 */
function generateMaze(rowStart , rowEnd , colStart , colEnd , surroundingWall , orientation){

    clearBoard();

    if(rowStart > rowEnd || colStart > colEnd){
        return;
    }
    
    if(!surroundingWall){
        //Drawing top & bottom Boundary Walls
        for (let i = 0; i < col; i++) {
           if(
                !matrix[0][i].classList.contains('source') &&
                !matrix[0][i].classList.contains('target')
            )
            wallToAnimate.push(matrix[0][i]);

           if(
                !matrix[row-1][i].classList.contains('source') &&   
                !matrix[row-1][i].classList.contains('target')
            )
            wallToAnimate.push(matrix[row-1][i]);
        }
        //Drawing left & right Boundar wall
        for(let i = 0 ; i<row ; i++){

            if( 
                !matrix[i][0].classList.contains('source') && 
                !matrix[i][0].classList.contains('target')
            )
            wallToAnimate.push(matrix[i][0]);
           
            if( 
                !matrix[i][col-1].classList.contains('source') && 
                !matrix[i][col-1].classList.contains('target')
            )
            wallToAnimate.push(matrix[i][col-1]);
        
        }
        surroundingWall = true;
    } 
    
    if(orientation === 'horizontal'){

        let possibleRows = [];

        for(let i = rowStart; i<=rowEnd ; i+=2){
            // if (i == 0 || i == row - 1) continue;
            possibleRows.push(i);
        }
        let posibleCols = [];

        for(let i = colStart-1; i<=colEnd+1 ; i+=2){
            if(i>0 && i<col-1)
                posibleCols.push(i);
        }

        const currentRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];
        const randomCol = posibleCols[Math.floor(Math.random() * posibleCols.length)];

        for(let i = colStart-1 ; i<=colEnd+1 ; i++){
            const cell = matrix[currentRow][i];
            if(!cell || i === randomCol || cell.classList.contains('source')|| cell.classList.contains('target'))
            continue;

            wallToAnimate.push(cell);
        }

        //Upper subDivision
        generateMaze(rowStart, currentRow-2 , colStart, colEnd, false, ((currentRow - 2)-rowStart > colEnd - colStart)? 'horizontal': 'vertical');
        //Bottom subDivision
        generateMaze(currentRow+2, rowEnd , colStart, colEnd, false, (rowEnd - (currentRow + 2)> colEnd - colStart)? 'horizontal': 'vertical');

    }else{
        // vertical subDivision
        let possibleCols = [];

        for(let i = colStart; i<=colEnd ; i+=2){
            possibleCols.push(i);
        }

        let possibleRows = [];
        for(let i = rowStart-1; i<=rowEnd+1 ; i+=2){

            if(i>0 && i<col-1)
                possibleRows.push(i);
        }

        const currentCol = possibleCols[Math.floor(Math.random()* possibleCols.length)];
        const randomRow = possibleRows[Math.floor(Math.random()* possibleRows.length)];

        for(let i = rowStart-1 ; i<=rowEnd+1 ; i++){

            if(!matrix[i]) continue;
            const cell = matrix[i][currentCol];

            if( 
                !cell ||
                i === randomRow || 
                cell.classList.contains('source')|| 
                cell.classList.contains('target')
            )
            continue;

            wallToAnimate.push(cell);

        }
        
        //left subDivision
        generateMaze(rowStart, rowEnd , colStart, currentCol - 2, false, ( rowEnd - rowStart > (currentCol-2) - colStart)? 'horizontal': 'vertical');
        //right subDivision
        generateMaze(rowStart, rowEnd , currentCol + 2, colEnd, false, (rowEnd - rowStart > colEnd - (currentCol+2))? 'horizontal': 'vertical');
  
    }
     
}


// Path Finding algos main interaction button 
var visitedCell ;
var pathToAnimate ;

visualizeBtn.addEventListener('click',()=>{

    clearPath();
    visitedCell = [];
    pathToAnimate = [];

    if (algorithm === 'BFS'){
        BFS();
    }else if (algorithm === "Dijkstra's"){
        Dijsktra();
    }else if (algorithm === 'Greedy'){
        greedy();
    }else if (algorithm === 'A*'){
        Astar();
    }else{
        if(DFS(source_Cordinate))
            pathToAnimate.push(matrix[source_Cordinate.x][source_Cordinate.y]);
        DFS(source_Cordinate);
    }
    animate(visitedCell , 'visited');
});


const SPEEDS = {
    Fast: 10,   
    Normal: 25, 
    Slow: 50    
};

function animate(elements, className) {
    
    let baseDelay = SPEEDS[speed];

    // Adjust the delay based on the className
    let delayMultiplier = 1;
    if (className === 'path') delayMultiplier = 3.5;
    if (className === 'wall') delayMultiplier = 0.005;

    // Calculate the actual delay
    const delay = baseDelay * delayMultiplier;

    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.remove('visited');
            element.classList.add(className);

            // If the last element is animated and the className is 'visited', start animating the path
            if (index === elements.length - 1 && className === 'visited') {
                animate(pathToAnimate, 'path');
            }
        }, delay * index);
    });
}

/**
 * Recursively traces back the path from the target cell to the source cell using the 
 * parent map generated during pathfinding. Each cell in the path is added to `pathToAnimate`.
 *
 * @function getPath
 * @param {Map} parent - A map storing the parent of each visited cell, 
 *                       where the key is the cell's coordinates and the value is the parent cell.
 * @param {Object} target - The current cell being traced back, starting from the target cell. 
 *                          It is an object with `x` and `y` properties.
 *
 * @description
 * 1. **Base Case**: If the `target` is null, the recursion ends, indicating the source has been reached.
 * 
 * 2. **Path Tracing**: The current cell is added to `pathToAnimate` to mark it as part of the final path. 
 *    The function then recursively calls itself with the parent of the current cell until the source is reached.
 * 
 * @example
 * // Example usage in the context of pathfinding algorithms:
 * const parent = new Map();
 * const target = {x: 4, y: 4};
 * getPath(parent, target);
 */
function getPath(parent , target){

    if(!target)return;

    pathToAnimate.push(matrix[target.x][target.y]);
    const p = parent.get(`${target.x}-${target.y}`);

    getPath(parent, p);
}


/**
 * Performs a Breadth-First Search (BFS) on a grid to find the shortest path from a source 
 * to a target. The function explores all possible paths by expanding from the source cell, 
 * checking each neighboring cell in the order: up, right, down, and left. The BFS terminates 
 * when the target is found or all possible paths are exhausted.
 *
 * @function BFS
 * 
 * @constant {Array} queue - A queue data structure that manages the exploration of cells in FIFO order.
 * @constant {Set} visited - A set that stores the coordinates of cells that have already been visited.
 * @constant {Map} parent - A map that tracks the parent of each visited cell, allowing the path 
 *                          to be reconstructed once the target is found.
 * 
 * @global {Object} source_Cordinate - The starting cell coordinates from which the BFS begins. 
 *                                     It is an object with `x` and `y` properties.
 * @global {Object} target_Cordinate - The target cell coordinates that BFS aims to reach. 
 *                                     It is an object with `x` and `y` properties.
 * @global {Array} visitedCell - An array that stores all cells visited during the BFS. These cells 
 *                               are highlighted on the grid to show the algorithm's progress.
 * @global {Array} pathToAnimate - An array that stores the cells forming the final path from the 
 *                                 source to the target, to be animated after the BFS completes.
 * 
 * @description
 * 1. **Initialization**: The source cell is added to the queue and marked as visited. 
 *    The `parent` map records no parent for the source, as it is the starting point.
 * 
 * 2. **Main Loop**: The algorithm continues to explore until the queue is empty:
 *    - **Dequeue**: The first cell in the queue is removed and marked as the current cell.
 *    - **Target Check**: If the current cell is the target, the `getPath` function is called to 
 *      trace back the path from the target to the source using the `parent` map.
 *      The function then terminates.
 *    - **Neighbors Exploration**: The four neighboring cells (up, right, down, left) of the current cell 
 *      are identified. If a neighboring cell is within grid boundaries, not a wall, and has not been visited, 
 *      it is added to the queue, marked as visited, and its parent is recorded in the `parent` map.
 */
function BFS(){

    const queue = [];
    const visited = new Set();
    const parent = new Map();

    queue.push(source_Cordinate);
    visited.add(`${source_Cordinate.x}-${source_Cordinate.y}`);


    while(queue.length > 0){
        const current = queue.shift();
        visitedCell.push(matrix[current.x][current.y]);

        //you find the target
        if(current.x === target_Cordinate.x && current.y === target_Cordinate.y){
            getPath(parent , target_Cordinate);
            return;
        }

        // Define neighboring cells (up, right, down, left)
        const neighbours = [
            {x:current.x-1 , y:current.y },//up
            {x:current.x, y:current.y + 1 },//right
            {x:current.x + 1 , y:current.y },//down
            {x:current.x, y:current.y - 1 },//left
        ];

         // Explore each neighboring cell
        for(const neighbour of neighbours){
            const key = `${neighbour.x}-${neighbour.y}`;
            if(
                isValid(neighbour.x , neighbour.y) 
                && !matrix[neighbour.x][neighbour.y].classList.contains('wall')
                && !visited.has(key)
            ){
                queue.push(neighbour);
                visited.add(key);
                parent.set(key , current);
            }
        }
    }

}


//=====Dijktras algorithm====================================================================================================================

/**
 * A Priority Queue implementation using a binary min-heap. This data structure is optimized
 * for efficiently retrieving and removing the element with the lowest cost, which is crucial 
 * for algorithms like Dijkstra's.
 *
 * @class PriorityQueue
 * 
 * @property {Array} elements - The internal array representing the heap.
 * @property {number} length - The current number of elements in the priority queue.
 * 
 * @method push(data) - Adds a new element to the priority queue and reorders the heap to maintain the min-heap property.
 * @method pop() - Removes and returns the element with the lowest cost, reordering the heap to maintain the min-heap property.
 * @method upHeapify(i) - Recursively moves an element up the heap until the min-heap property is restored.
 * @method downHeapify(i) - Recursively moves an element down the heap until the min-heap property is restored.
 * @method isEmpty() - Checks if the priority queue is empty.
 * @method swap(x, y) - Swaps two elements in the heap.
 * 
 * @description
 * - **Min-Heap Property**: The heap is structured so that the element with the lowest cost is always at the root.
 * - **Heap Operations**: Insertion (`push`) and deletion (`pop`) operations adjust the heap to ensure this property is maintained.
 */

class PriorityQueue{

    constructor(){
        this.elements = [];
        this.length = 0 ;
    }

     /**
     * Adds a new element to the priority queue.
     * @param {Object} data - The element to be added, typically an object with `cordinate` and `cost` properties.
     */
    push(data){
        this.elements.push(data);
        this.length++;
        this.upHeapify(this.length-1);
    }

    /**
     * Removes and returns the element with the lowest cost.
     * @returns {Object} - The element with the lowest cost.
     */
    pop(){
        this.swap(0, this.length-1);
        const popped = this.elements.pop();
        this.length--;
        this.downHeapify(0);
        return popped;
    }

     /**
     * Ensures the heap property is maintained after adding a new element.
     * Moves the element at index `i` up the heap if it's smaller than its parent.
     * @param {number} i - The index of the element to move up the heap.
     */
    upHeapify(i){
        if( i === 0 ) return;
        const parent = Math.floor((i-1)/2)
        if(this.elements[i].cost < this.elements[parent].cost){
            this.swap(parent , i);
            this.upHeapify(parent);
        }

    }

    /**
     * Ensures the heap property is maintained after removing the root element.
     * Moves the element at index `i` down the heap if it's larger than its children.
     * @param {number} i - The index of the element to move down the heap.
     */
    downHeapify(i){
        let minNode = i ;
        const leftChild = (2*i) + 1 ;
        const rightChild = (2*i) +2 ; 

        if(leftChild < this.length && this.elements[leftChild].cost < this.elements[minNode].cost){
            minNode = leftChild;
        }

        if(rightChild < this.length && this.elements[rightChild].cost < this.elements[minNode].cost){
            minNode = rightChild;
        }

        if(minNode !== i){
            this.swap(minNode , i);
            this.downHeapify(minNode);
        }

    }
    isEmpty(){
        return this.length === 0 ;
    }
    swap(x , y){
        [this.elements[x],this.elements[y]] = [this.elements[y],this.elements[x]];
    }

}


/**
 * Implements Dijkstra's algorithm to find the shortest path from a source to a target on a grid.
 * The algorithm uses a priority queue to explore paths in increasing order of their cost, ensuring
 * that the shortest path is found. The grid cells represent graph vertices, and edges have a uniform 
 * weight of 1, representing movement between adjacent cells.
 *
 * @function Dijkstra
 * 
 * @constant {PriorityQueue} pq - The priority queue that stores grid cells to be explored, 
 *                                prioritized by their current known cost.
 * @constant {Map} parent - A map storing the parent of each visited cell, used to reconstruct the path.
 * @constant {Array} distance - A 2D array that tracks the shortest known distance from the source to each cell.
 * 
 * @global {Object} source_Cordinate - The starting cell coordinates from which Dijkstra's algorithm begins. 
 *                                     It is an object with `x` and `y` properties.
 * @global {Object} target_Cordinate - The target cell coordinates that Dijkstra's algorithm aims to reach. 
 *                                     It is an object with `x` and `y` properties.
 * @global {Array} visitedCell - An array that stores all cells visited during the algorithm's execution. 
 *                               These cells are highlighted on the grid to show the algorithm's progress.
 * 
 * @description
 * 1. **Initialization**: The algorithm begins by setting the distance of the source cell to 0 and adding it to the priority queue.
 * 
 * 2. **Main Loop**: The algorithm continues until the priority queue is empty:
 *    - **Dequeue**: The cell with the lowest cost is removed from the priority queue.
 *    - **Target Check**: If the dequeued cell is the target, the `getPath` function is called to trace back the path 
 *      from the target to the source using the `parent` map. The function then terminates.
 *    - **Neighbors Exploration**: The four neighboring cells (up, right, down, left) of the current cell are identified.
 *      If a neighboring cell is within grid boundaries, not a wall, and offers a shorter path than previously known, 
 *      it is added to the priority queue with its new cost.
 */
function Dijsktra(){
    

    const pq = new PriorityQueue();
    const parent = new Map();
    const distance = [];

    // Initialize distance array with Infinity
    for (let i = 0 ; i < row ; i++){
        const INF = [];
        for(let j = 0 ; j<col ; j++){
            INF.push(Infinity);
        }
        distance.push(INF);
    }

    distance[source_Cordinate.x][source_Cordinate.y] = 0;

    pq.push({cordinate: source_Cordinate, cost:0});

    while(!pq.isEmpty()){
        const {cordinate:current , cost:distanceSoFar} = pq.pop();
        visitedCell.push(matrix[current.x][current.y]);

        //you find the target
        if(current.x === target_Cordinate.x && current.y === target_Cordinate.y){
            getPath(parent , target_Cordinate);
            return;
        }  
        
         // Define neighboring cells (up, right, down, left)
        const neighbours = [
            {x:current.x-1 , y:current.y },//up
            {x:current.x, y:current.y + 1 },//right
            {x:current.x + 1 , y:current.y },//down
            {x:current.x, y:current.y - 1 },//left
        ];

        for(const neighbour of neighbours){
            const key = `${neighbour.x}-${neighbour.y}`;
            if(
                isValid(neighbour.x , neighbour.y) 
                && !matrix[neighbour.x][neighbour.y].classList.contains('wall')
            ){
                // Relaxation step: Check if a shorter path to the neighbor exists
                //Assuming edge weight = 1 , between adjecent vertices
                const edgeWeight = 1;
                const distanceToNeighbour = distanceSoFar + edgeWeight;
                
                if(distanceToNeighbour < distance[neighbour.x][neighbour.y]){
                    distance[neighbour.x][neighbour.y] = distanceToNeighbour;
                    pq.push({cordinate : neighbour , cost :distanceToNeighbour});
                    parent.set(key , current);
                }
               
            }
        }
    }

}

//=====Greedy algorithm============================================================================================================

/**
 * Computes the heuristic value (Manhattan distance) from the current node to the target node.
 * @param {Object} node - The current node, containing `x` and `y` coordinates.
 * @returns {number} - The Manhattan distance from the current node to the target node.
 */
function heuristicValue(node){
    return Math.abs(node.x - target_Cordinate.x) + Math.abs(node.y - target_Cordinate.y);
}

/**
 * Implements the Greedy Best-First Search algorithm to find the path from the source to the target.
 * The algorithm prioritizes nodes closer to the target based on the heuristic value.
 */
function greedy(){
    const queue =  new PriorityQueue();
    const visited = new Set();
    const parent = new Map();

    // Start with the source node, using its heuristic value as the cost.
    queue.push({cordinate: source_Cordinate, cost:heuristicValue(source_Cordinate)});
    visited.add(`${source_Cordinate.x}-${source_Cordinate.y}`);

    // Explore nodes until the queue is empty or the target is found.
    while(queue.length > 0){
        const {cordinate: current} = queue.pop();
        visitedCell.push(matrix[current.x][current.y]);

        //you find the target
        if(current.x === target_Cordinate.x && current.y === target_Cordinate.y){
            getPath(parent , target_Cordinate);
            return;
        }  

        // Generate the neighboring nodes (up, right, down, left).
        const neighbours = [
            {x:current.x-1 , y:current.y },
            {x:current.x, y:current.y + 1 },
            {x:current.x + 1 , y:current.y },
            {x:current.x, y:current.y - 1 },
        ];

         // Process each neighbor.
        for(const neighbour of neighbours){
            const key = `${neighbour.x}-${neighbour.y}`;
            if(
                isValid(neighbour.x , neighbour.y) 
                && !matrix[neighbour.x][neighbour.y].classList.contains('wall')
                && !visited.has(key)
            ){
                queue.push({cordinate:neighbour , cost : heuristicValue(neighbour)});
                visited.add(key);
                parent.set(key , current);
            }
        }
    }

}

// A* Algorithm copy of  dijksta and greedy ================================================================================================
// AStar = Greedy + Dijkstra 
// heuristicValue   distance
//  Priorties basedw on both distance + heuristicValue

/**
 * Implements the A* (A-star) algorithm to find the shortest path from the source to the target.
 * The A* algorithm combines features of Dijkstra's algorithm and Greedy Best-First Search by using 
 * both the cost from the start node and the heuristic estimate to the goal node to prioritize nodes.
 * 
 * The algorithm maintains a priority queue to explore nodes with the lowest combined cost and heuristic 
 * value. It also uses two sets: one for nodes that have been visited (closed set) and another for 
 * nodes that are yet to be explored (open set). The priority queue prioritizes nodes based on the sum 
 * of their distance from the source and their heuristic estimate.
 * 
 * Steps:
 * 1. Initialize distances to all nodes as Infinity except for the source node.
 * 2. Push the source node into the priority queue with its heuristic value.
 * 3. While the queue is not empty:
 *    - Extract the node with the lowest cost + heuristic value.
 *    - If this node is the target, reconstruct the path and exit.
 *    - Otherwise, add the node to the closed set and explore its neighbors.
 *    - For each neighbor, calculate the new distance and update if it improves.
 *    - Push updated neighbors into the priority queue with their new cost + heuristic value.
 * 
 * @param {Object} source_Cordinate - The starting coordinate of the search, containing `x` and `y` properties.
 * @param {Object} target_Cordinate - The target coordinate of the search, containing `x` and `y` properties.
 */
function Astar(){

    const distance = [];
    const parent = new Map();
    const queued = new Set();//open set
    const visited = new Set();//Closed set
    const queue =  new PriorityQueue();
    

    for (let i = 0 ; i < row ; i++){
        const INF = [];
        for(let j = 0 ; j<col ; j++){
            INF.push(Infinity);
        }
        distance.push(INF);
    }

    distance[source_Cordinate.x][source_Cordinate.y] = 0 ;
    queue.push({cordinate: source_Cordinate, cost:heuristicValue(source_Cordinate)});
    queued.add(`${source_Cordinate.x}-${source_Cordinate.y}`);


    while(queue.length > 0){
        const {cordinate: current} = queue.pop();
        visitedCell.push(matrix[current.x][current.y]);

        //you find the target
        if(current.x === target_Cordinate.x && current.y === target_Cordinate.y){
            getPath(parent , target_Cordinate);
            return;
        }  
        // close set add
        visited.add(`${current.x}-${current.y}`);//Finalize

        const neighbours = [
            {x:current.x-1 , y:current.y },
            {x:current.x, y:current.y + 1 },
            {x:current.x + 1 , y:current.y },
            {x:current.x, y:current.y - 1 },
        ];

        for(const neighbour of neighbours){
            const key = `${neighbour.x}-${neighbour.y}`;
            if(
                isValid(neighbour.x , neighbour.y) 
                && !matrix[neighbour.x][neighbour.y].classList.contains('wall')
                && !visited.has(key)
                && !queued.has(key)
            ){
                //Relaxing
                //Assuming edge weight = 1 , between adjecent vertices
                const edgeWeight = 1;
                distanceSoFar = distance[current.x][current.y];
                const distanceToNeighbour = distanceSoFar + edgeWeight;
                
                if(distanceToNeighbour < distance[neighbour.x][neighbour.y]){
                    distance[neighbour.x][neighbour.y] = distanceToNeighbour;
                    queue.push({cordinate : neighbour , cost :distanceToNeighbour + heuristicValue(neighbour)});
                    queued.add(key)
                    parent.set(key , current);
                }
               
            }
        }
    }

}

// ======DFS======================================================================================================================================

/**
 * Performs a Depth-First Search (DFS) to find a path from the source to the target coordinate.
 * The function explores nodes by moving as deep as possible along each branch before backtracking.
 * 
 * The search starts from the given `current` node and recursively explores its neighbors. It uses 
 * a set to keep track of visited nodes to avoid reprocessing and a list to keep track of cells visited 
 * in the current path. The path to the target is reconstructed by backtracking once the target is reached.
 * 
 * Steps:
 * 1. If the current node is the target node, the function terminates and returns `true`.
 * 2. Mark the current node as visited and add it to the `visitedCell` list.
 * 3. Explore the neighbors (up, right, down, left) of the current node.
 * 4. For each neighbor, check if it is valid, not visited, and not a wall.
 * 5. Recursively perform DFS on valid neighbors. If a path to the target is found, the function
 *    adds the node to the `pathToAnimate` list and returns `true`.
 * 6. If no path is found from a neighbor, backtrack and continue exploring other neighbors.
 * 
 * @param {Object} current - The current coordinate node being explored, containing `x` and `y` properties.
 * @returns {boolean} - Returns `true` if a path to the target is found, otherwise `false`.
 */
const visited = new Set();
function DFS(current){
    if(current.x === target_Cordinate.x && current.y === target_Cordinate.y){
        return true;
    }
    visitedCell.push(matrix[current.x][current.y]);
    visited.add(`${current.x}-${current.y}`);
    const neighbours = [
        {x:current.x-1 , y:current.y },//up
        {x:current.x, y:current.y + 1 },//right
        {x:current.x + 1 , y:current.y },//down
        {x:current.x, y:current.y - 1 },//left
    ];

    for (const neighbour of neighbours) {
        if(isValid(neighbour.x , neighbour.y) &&
        !visited.has(`${neighbour.x}-${neighbour.y}`) &&
        !matrix[neighbour.x][neighbour.y].classList.contains('wall')){
           if( DFS(neighbour)){
            pathToAnimate.push(matrix[neighbour.x][neighbour.y]);
             return true;
           }
        }
    }
    return false; // Return false if no path is found from the current node
}

// ==============================================================================================================
// TUTORIAL 

let count = 0;
const slides = document.querySelectorAll('.tutorial .slide');
const prevBtn = document.querySelector('#prev');
const nextBtn = document.querySelector('#next');
const skipBtn = document.querySelector('#skip');
const tutorial = document.querySelector('#tutorial');
const tutorialToggle = document.querySelector('.tutorial-toggle');

const siteVisited = localStorage.getItem('visited');
if (!siteVisited) {
    tutorial.classList.add('active');
    localStorage.setItem('visited', 'true');
}

tutorial.addEventListener('click', (e) => {
    if (e.target.classList.contains('tutorial')) {
        skipBtn.style.animation = ".2s shake 2 ease-in-out";
        setTimeout(() => {
            skipBtn.style.animation = "none";
        }, 1000);
    }
})
tutorialToggle.addEventListener('click', () => {
    tutorial.classList.add('active');
    count = 0;
    nextBtn.innerText = "next";
    prevBtn.classList.add('unactive');
    moveSlides(count);
})
skipBtn.addEventListener('click', () => {
    tutorial.classList.remove('active');
});

// Arranging one after one
slides.forEach((slide, index) => {
    slide.style.left = `${100 * index}%`;
});


nextBtn.addEventListener('click', () => {
    if (count == slides.length - 1) {
        tutorial.classList.remove('active');
        return;
    }
    count++;
    if (count == slides.length - 1) {
        nextBtn.innerText = "finish";
    }
    moveSlides(count);
    prevBtn.classList.remove('unactive');
});

prevBtn.addEventListener('click', () => {
    if (count == 0) {
        return;
    }
    nextBtn.innerText = "next";
    count--;
    if (count == 0) {
        prevBtn.classList.add('unactive');
    }
    moveSlides(count);
});

const dot = document.querySelector(".dots");
for (let i = 0; i < slides.length; i++) {
    dot.innerHTML += `<div class="dot ${i === 0 ? "active" : ""}"></div>`
}
const dots = document.querySelectorAll(".dot");

dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        count = i;
        if (count == 0) {
            prevBtn.classList.add('unactive');
        }
        else if (count == slides.length - 1) {
            nextBtn.innerText = "finish";
        }
        else {
            prevBtn.classList.remove('unactive');
            nextBtn.innerText = "next";
        }
        moveSlides(count);
    })
})

function moveSlides(count) {
    dots.forEach(dot => {
        dot.classList.remove('active');
    })

    dots[count].classList.add('active');

    slides.forEach((slide) => {
        slide.style.transform = `translateX(${-count * 100}%)`;
    });
}

window.addEventListener('keydown', (e) => {
    if (e.keyCode == 37 || e.keyCode == 74) {
        prevBtn.click();
    }
    else if (e.keyCode == 39 || e.keyCode == 76) {
        nextBtn.click();
    }
})
