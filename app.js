var cells;
const board  = document.querySelector("#board");

renderBoard();

function renderBoard(cellWidth = 22){

    cells = [];
    let row = Math.floor(board.clientHeight / cellWidth) ;
    let col = Math.floor(board.clientWidth / cellWidth) ;
    const root = document.documentElement;
    root.style.setProperty('--cell-width', `${cellWidth}`);
    // console.log(row , col);

    // To prevent appending previous board
    board.innerHTML ='';
   
    for (let r = 0 ; r < row ; r++ ) {
        const rowElement = document.createElement('div');
        rowElement.classList.add("row");
        rowElement.setAttribute('id',`${r}`); 

        for (let c = 0; c<col; c++) {   
            const colElement = document.createElement('div');
            colElement.classList.add("col");
            colElement.setAttribute('id',`${c}`);

            cells.push(colElement);
            rowElement.appendChild(colElement);
        }
        board.appendChild(rowElement);
    }
}


const navOptions = document.querySelectorAll('.nav-menu>li>a');
var dropOptions = null ;
navOptions.forEach(navOption =>{
    navOption.addEventListener('click' ,()=>{
        const li = navOption.parentElement;
        // self toggle
        if(li.classList.contains('active')){
            li.classList.remove('active');
            return;
        }

        removeActive(navOptions , true);
        li.classList.add('active');

        if(li.classList.contains('drop-box')){
            dropOptions = li.querySelectorAll('.drop-menu>li');
            toggle_dropOption(navOption.innerText);
        }
    })
})

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
            // remove dropdown after selecting item from drop-d-menu
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
})