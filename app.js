var cells;
let row, col;
var matrix;
let source_Cordinate;
let target_Cordinate;
const board  = document.querySelector("#board");

renderBoard();

function renderBoard(cellWidth = 22){

    cells = [];
    matrix = [];
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
    source_Cordinate = set('source');
    target_Cordinate = set('target');
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
        cell.classList.remove('visited');
        cell.classList.remove('path');
    })
}

const clearWall = ()=> {
    cells.forEach(cell=>{
        cell.classList.remove('wall');
    })
}

function clearBoard(){
    cells.forEach(cell =>{
        cell.classList.remove('visited');
        cell.classList.remove('wall');
        cell.classList.remove('path');
    })
}
///=====================================================================//
// Maze generation


const clearBoardBtn = document.getElementById('clearBoard');
const clearPathBrn = document.getElementById('clearPath');

clearPathBrn.addEventListener('click',clearPath);
clearBoardBtn.addEventListener('click' , clearBoard);
var wallToAnimate;
const generateMazeBtn = document.getElementById('generateMazeBtn');
generateMazeBtn.addEventListener('click', ()=>{
    wallToAnimate = [];
    generateMaze(0, row-1 , 0, col-1, false, 'horizontal');
  
    animate(wallToAnimate, 'wall');
   
});
// 
function generateMaze(rowStart , rowEnd , colStart , colEnd , surroundingWall , orientation){
    if(rowStart > rowEnd || colStart > colEnd){
        return;
    }
    
    if(!surroundingWall){
        //Drawing top & bottom Boundary Walls
        for (let i = 0; i < col; i++) {
           if(!matrix[0][i].classList.contains('source') && !matrix[0][i].classList.contains('target'))
            wallToAnimate.push(matrix[0][i]);
           //    matrix[0][i].classList.add('wall');
           if(!matrix[row-1][i].classList.contains('source') && !matrix[row-1][i].classList.contains('target'))
            wallToAnimate.push(matrix[row-1][i]);
         //    matrix[row-1][i].classList.add('wall')
        }
        //Drawing left & right Boundar wall
        for(let i = 0 ; i<row ; i++){
            if(!matrix[i][0].classList.contains('source') && !matrix[i][0].classList.contains('target'))
            wallToAnimate.push(matrix[i][0]);
            // matrix[i][0].classList.add('wall');
           
            if(!matrix[i][col-1].classList.contains('source') && !matrix[i][col-1].classList.contains('target'))
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

            // cell.classList.add('wall'); 
            wallToAnimate.push(cell);
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

            // cell.classList.add('wall'); 
            wallToAnimate.push(cell);

        }
        
        //left subDivision
        generateMaze(rowStart, rowEnd , colStart, currentCol - 2, false, ( rowEnd - rowStart > (currentCol-2) - colStart)? 'horizontal': 'vertical');
        //right subDivision
        generateMaze(rowStart, rowEnd , currentCol + 2, colEnd, false, (rowEnd - rowStart > colEnd - (currentCol+2))? 'horizontal': 'vertical');
  
    }
     
}

// Path Finding algos
var visitedCell ;
var pathToAnimate ;
visualizeBtn.addEventListener('click', ()=>{
    visitedCell = [];
    pathToAnimate = [];
    // BFS();
    // Dijsktra();
    // greedy();;
    Astar();
    animate(visitedCell , 'visited');
});
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
        // row x col y  formation here not like x and y cordinate in maths 
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
                && !visited.has(key)
            ){
                queue.push(neighbour);
                visited.add(key);
                parent.set(key , current);
            }
        }
    }

}

function animate(elements , className){
    let delay = 10 ;
    if(className === 'path') delay *= 3.5;
    if(className === 'wall') delay *= 0.005;
    for(let i  = 0 ; i< elements.length ; i++){
        setTimeout(()=>{
            elements[i].classList.remove('visited');
            elements[i].classList.add(className);
            if(i === elements.length-1 && className === 'visited' ){
                // console.log("Search finished")
                animate(pathToAnimate , 'path')
            }
        },delay * i);
    }
}

function getPath(parent , target){

    if(!target)return;

    pathToAnimate.push(matrix[target.x][target.y]);
    const p = parent.get(`${target.x}-${target.y}`);

    getPath(parent, p);
}


//=====Dijktras algorithm========
class PriorityQueue{
    constructor(){
        this.elements = [];
        this.length = 0 ;
    }
    push(data){
        this.elements.push(data);
        this.length++;
        this.upHeapify(this.length-1);
    }
    pop(){
        this.swap(0, this.length-1);
        const popped = this.elements.pop();
        this.length--;
        this.downHeapify(0);
        return popped;
    }
    upHeapify(i){
        if( i === 0 ) return;
        const parent = Math.floor((i-1)/2)
        if(this.elements[i].cost < this.elements[parent].cost){
            this.swap(parent , i);
            this.upHeapify(parent);
        }

    }
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

// const pq = new PriorityQueue();
// pq.push({cost:2});
// pq.push({cost:0});
// pq.push({cost:1});

// console.log(pq.pop());
// console.log(pq.pop());
// console.log(pq.pop());

function Dijsktra(){
    console.log("im Dijsktra");

    const pq = new PriorityQueue();
    // const visited = new Set();
    const parent = new Map();
    const distance = [];

    for (let i = 0 ; i < row ; i++){
        const INF = [];
        for(let j = 0 ; j<col ; j++){
            INF.push(Infinity);
        }
        distance.push(INF);
    }

    distance[source_Cordinate.x][source_Cordinate.y] = 0;

    pq.push({cordinate: source_Cordinate, cost:0});
    // visited.add(`${source_Cordinate.x}-${source_Cordinate.y}`);


    while(!pq.isEmpty()){
        const {cordinate:current , cost:distanceSoFar} = pq.pop();
        visitedCell.push(matrix[current.x][current.y]);

        //you find the target
        if(current.x === target_Cordinate.x && current.y === target_Cordinate.y){
            getPath(parent , target_Cordinate);
            return;
        }  
        // row x col y  formation here not like x and y cordinate in maths 
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
                // && !visited.has(key)
            ){
                // relaxing
                //Assuming edge weight = 1 , between adjecent vertices
                const edgeWeight = 1;
                const distanceToNeighbour = distanceSoFar + edgeWeight;
                
                if(distanceToNeighbour < distance[neighbour.x][neighbour.y]){
                    distance[neighbour.x][neighbour.y] = distanceToNeighbour;
                    pq.push({cordinate : neighbour , cost :distanceToNeighbour});
                    // visited.add(key);
                    parent.set(key , current);
                }
               
            }
        }
    }

}

//=====Greedy algorithm========
function heuristicValue(node){
    return Math.abs(node.x - target_Cordinate.x) + Math.abs(node.y - target_Cordinate.y);
}
function greedy(){
    const queue =  new PriorityQueue();
    const visited = new Set();
    const parent = new Map();

    queue.push({cordinate: source_Cordinate, cost:heuristicValue(source_Cordinate)});
    visited.add(`${source_Cordinate.x}-${source_Cordinate.y}`);


    while(queue.length > 0){
        const {cordinate: current} = queue.pop();
        visitedCell.push(matrix[current.x][current.y]);

        //you find the target
        if(current.x === target_Cordinate.x && current.y === target_Cordinate.y){
            getPath(parent , target_Cordinate);
            return;
        }  
        // row x col y  formation here not like x and y cordinate in maths 
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
                && !visited.has(key)
            ){
                queue.push({cordinate:neighbour , cost : heuristicValue(neighbour)});
                visited.add(key);
                parent.set(key , current);
            }
        }
    }

}

// A* Algorithm copy of  dijksta and greedy 
// AStar = Greedy + Dijkstra 
//    heuristicValue   distance
//  Priorties basedw on both distance + heuristicValue

function Astar(){
    const queue =  new PriorityQueue();
    const visited = new Set();//Closed set
    const queued = new Set();//open set
    const parent = new Map();
    const distance = [];

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

        // row x col y  formation here not like x and y cordinate in maths 
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
                && !visited.has(key)
                && !queued.has(key)
            ){

               // relaxing
                //Assuming edge weight = 1 , between adjecent vertices
                const edgeWeight = 1;
                distanceSoFar = distance[current.x][current.y];
                const distanceToNeighbour = distanceSoFar + edgeWeight;
                
                if(distanceToNeighbour < distance[neighbour.x][neighbour.y]){
                    distance[neighbour.x][neighbour.y] = distanceToNeighbour;
                    queue.push({cordinate : neighbour , cost :distanceToNeighbour + heuristicValue(neighbour)});
                    queued.add(key)
                    // visited.add(key);
                    parent.set(key , current);
                }
               
            }
        }
    }

}

