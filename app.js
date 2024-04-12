var cells;
let row, col;
var matrix = [];
const board  = document.querySelector("#board");

renderBoard();

function renderBoard(cellWidth = 22){

    cells = [];
    row = Math.floor(board.clientHeight / cellWidth) ;
    col = Math.floor(board.clientWidth / cellWidth) ;
    
    // Update CSS variable for cell width
    const root = document.documentElement;
    root.style.setProperty('--cell-width', `${cellWidth}`);
    // console.log(row , col);

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
            //forgot to add row address id so added now 
            colElement.setAttribute('id',`${r}-${c}`);

            cells.push(colElement);
            rowArr.push(colElement); 
            rowElement.appendChild(colElement);
        }
        matrix.push(rowArr);
        board.appendChild(rowElement);
    }
}
// console.log(matrix);
var dropOptions = null ;
const navOptions = document.querySelectorAll('.nav-menu>li>a');

// Event listener for each navigation option
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
let speed = 'normal';
let algorithm = 'BFS' ;
const visualizeBtn = document.getElementById("visualize");

/**
 * Handles click events on dropdown options and updates the application state based on the selection.
 * @param {string} target - The category of the dropdown ('pixel', 'speed', 'algorithms').
 */
function toggle_dropOption(target){
    // console.log(target)
    dropOptions.forEach(dropOption=>{
        dropOption.addEventListener('click', ()=>{
            removeActive(dropOptions);
            dropOption.classList.add('active')
            if(target === 'pixel'){
                pixelSize = +dropOption.innerText.replace('px', '');
                renderBoard(pixelSize)
                // console.log(pixelSize);
            }else if (target === 'speed'){
                speed = dropOption.innerText;
                // console.log(speed);
            }else if( target === 'algorithms'){
                // just taking only first word
                algoFname =  dropOption.innerText.split(' ')[0];
                algorithm = algoFname;
                visualizeBtn.innerText = `Visualize ${algorithm}`
                // console.log(algorithm);
            }
             // Deactivate dropdown menu after selection
            removeActive(navOptions , true);
        })
    })
}
document.addEventListener('click' , (e)=>{
    const navMenu = document.querySelector(".nav-menu")
    if(!navMenu.contains(e.target)){
        removeActive(navOptions , true);
    }
    // console.log(e.target);
});

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


let source_Cordinate = set('source');
let target_Cordinate = set('target');
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

cells.forEach((cell) => {
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
            // console.log(source_Cordinate);
            // console.log(target_Cordinate);
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

const clearPath = ()=> {
    cells.forEach(cell=>{
        cell.classList.remove('path');
    })
}

const clearWall = ()=> {
    cells.forEach(cell=>{
        cell.classList.remove('wall');
    })
}

// Maze generation

// generateMaze(0, row-1 , 0, col-1, false, 'horizontal');
function generateMaze(rowStart , rowEnd , colStart , colEnd , surroundingWall , orientation){
    if(rowStart > rowEnd || colStart > colEnd){
        return;
    }
    
    if(!surroundingWall){
        for (let i = 0; i < col; i++) {
           if(!matrix[0][i].classList.contains('source') && !matrix[0][i].classList.contains('target'))
           matrix[0][i].classList.add('wall');
          
           if(!matrix[row-1][i].classList.contains('source') && !matrix[row-1][i].classList.contains('target'))
           matrix[row-1][i].classList.add('wall')
        }
        for(let i = 0 ; i<row ; i++){
            if(!matrix[i][0].classList.contains('source') && !matrix[i][0].classList.contains('target'))
            matrix[i][0].classList.add('wall');
           
            if(!matrix[i][col-1].classList.contains('source') && !matrix[i][col-1].classList.contains('target'))
            matrix[i][col-1].classList.add('wall')
        }
        surroundingWall = true;
    } 
    
    if(orientation === 'horizontal'){
        let possibleRows = [];
        for(let i = rowStart; i<=rowEnd ; i+=2){
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

            cell.classList.add('wall'); 
        }
        //Upper subDivision
        generateMaze(rowStart, currentRow-2 , colStart, colEnd, false, ((currentRow - 2)-rowStart > colEnd - colStart)? 'horizontal': 'vertical');
        //Bottom subDivision
        generateMaze(currentRow+2, rowEnd , colStart, colEnd, false, (rowEnd - (currentRow + 2)> colEnd - colStart)? 'horizontal': 'vertical');
    }else{
        let posibleCols = [];
        for(let i = colStart; i<=colEnd ; i+=2){
            posibleCols.push(i);
        }
        let possibleRows = [];
        for(let i = rowStart-1; i<=rowEnd+1 ; i+=2){
            if(i>0 && i<col-1)
                possibleRows.push(i);
        }

        const currentCol = posibleCols[Math.floor(Math.random()* posibleCols.length)];
        const randomRow = possibleRows[Math.floor(Math.random()* possibleRows.length)];

        for(let i = rowStart-1 ; i<=rowEnd+1 ; i++){
            if(!matrix[i]) continue;
            const cell = matrix[i][currentCol];
            if(!cell || i === randomRow || cell.classList.contains('source')|| cell.classList.contains('target'))
            continue;

            cell.classList.add('wall'); 

        }
        
        //Upper subDivision
        generateMaze(rowStart, rowEnd , colStart, currentCol - 2, false, ( rowEnd - rowStart > (currentCol-2) - colStart)? 'horizontal': 'vertical');
        //Bottom subDivision
        generateMaze(rowStart, rowEnd , currentCol + 2, colEnd, false, (rowEnd - rowStart > colEnd - (currentCol+2))? 'horizontal': 'vertical');
  
    }

}